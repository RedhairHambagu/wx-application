Page({
  data: {
    posts: [],
    userId: ""
  },

  onLoad() {
    this.checkLogin(); // 添加登录检查
    this.fetchPosts();
  },

  // 添加登录检查方法
  checkLogin() {
    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo && userInfo._id) {
      this.setData({ userId: userInfo._id });
    }
  },

  // 获取帖子列表
  fetchPosts() {
    wx.cloud.callFunction({
      name: "getPosts",
      success: res => {
        if (res.result.success) {
          this.setData({ posts: res.result.data });
        }
      },
      fail: err => console.error("获取帖子失败:", err)
    });
  },

  // **1️⃣ 点赞功能，不跳转详情页**
  handleLikeClick(e) {
    const { userId } = this.data;
    // 检查用户是否登录
    if (!userId) {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        duration: 2000,
        success: () => {
          wx.navigateTo({
            url: "/pages/profile/profile"
          });
        }
      });
      return;
    }

    const postId = e.currentTarget.dataset.id;
    const posts = this.data.posts;
    const postIndex = posts.findIndex(post => post._id === postId);
    if (postIndex === -1) return;

    const newLikes = (posts[postIndex].likes || 0) + 1;

    wx.cloud.callFunction({
      name: "updateLikes",
      data: { postId, likes: newLikes },
      success: res => {
        console.log("点赞成功", res);
        const updatedPosts = [...posts];
        updatedPosts[postIndex].likes = newLikes;
        this.setData({ posts: updatedPosts });
      },
      fail: err => {
        console.error("点赞失败", err);
        wx.showToast({
          title: "点赞失败",
          icon: "none"
        });
      }
    });
  },

  // **2️⃣ 点击头像进入用户主页**
  goToUserProfile(e) {
    const userId = e.currentTarget.dataset.userid; // 获取用户 ID
    console.log("进入用户主页，User ID:", userId);
    wx.navigateTo({
      url: `/pages/user-profile/user-profile?userId=${userId}`
    });
  },

  // **3️⃣ 点击帖子进入详情页，但避免点赞时触发**
  goToPostDetail(e) {
    const postId = e.currentTarget.dataset.id;
    console.log("进入帖子详情，Post ID:", postId);
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${postId}`
    });
  },
  
  // 添加发布帖子跳转方法
  goToCreatePost() {
    const { userId } = this.data;
    if (!userId) {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        duration: 2000,
        success: () => {
          wx.navigateTo({
            url: "/pages/profile/profile"
          });
        }
      });
      return;
    }
    
    wx.navigateTo({
      url: "/pages/create-post/create-post"
    });
  },
  goHome() {
    wx.navigateTo({
      url: "/pages/index/index"
    });
  }
});
