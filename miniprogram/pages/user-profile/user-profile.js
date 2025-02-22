Page({
  data: {
    userInfo: {},
    posts: []
  },

  onLoad(options) {
    const userId = options.userId;  // 获取传递的用户 ID
    this.fetchUserInfo(userId);
    this.fetchUserPosts(userId);
  },

  // 获取用户信息
  fetchUserInfo(userId) {
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: { userId },
      success: res => {
        if (res.result.success) {
          this.setData({
            userInfo: res.result.data
          });
        }
      },
      fail: err => {
        console.error('获取用户信息失败:', err);
      }
    });
  },

  // 获取该用户的帖子
  fetchUserPosts(userId) {
    wx.cloud.callFunction({
      name: 'getPosts',
      success: res => {
        if (res.result.success) {
          const userPosts = res.result.data.filter(post => post.userId === userId);
          this.setData({ posts: userPosts });
        }
      },
      fail: err => {
        console.error('获取用户帖子失败:', err);
      }
    });
  },

  goToPostDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${postId}`
    });
  },

  // 返回上一页
  goHome() {
    wx.navigateTo({
      url: "/pages/index/index"
    });
  }
});
