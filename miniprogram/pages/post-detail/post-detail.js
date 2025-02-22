console.log("post-detail.js 加载成功");

Page({
  data: {
    post: {},
    comments: [],
    commentContent: "",
    userId: "", // 现在默认为空，未登录状态
    limit: 10,
    skip: 0,
    hasMore: true,
  },

  onLoad(options) {
    console.log("页面参数:", options);
    if (options.id) {
      this.setData({
        postId: options.id,
        skip: 0,
        comments: [],
        hasMore: true
      });
      this.getPostDetail(options.id);
    } else {
      wx.showToast({
        title: "帖子 ID 无效",
        icon: "none"
      });
      console.error("Post ID 获取失败");
    }

    this.checkLogin(); // 进入页面时检查用户是否登录
  },

  checkLogin() {
    const userInfo = wx.getStorageSync("userInfo"); // 从本地存储获取用户信息
    if (userInfo && userInfo._id) {
      this.setData({ userId: userInfo._id }); // 设置 userId
    }
  },

  getPostDetail(postId) {
    console.log("请求帖子详情，postId:", postId);

    wx.cloud.callFunction({
      name: "getPostDetail",
      data: { postId },
      success: res => {
        console.log("云函数返回数据:", res);
        if (res.result.success) {
          this.setData({
            post: res.result.data.post || {},
            comments: res.result.data.comments || [],
            skip: res.result.data.comments.length
          });
        } else {
          wx.showToast({
            title: "获取数据失败",
            icon: "none"
          });
        }
      },
      fail: err => {
        console.error("云函数调用失败:", err);
        wx.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    });
  },

  loadMoreComments() {
    if (!this.data.hasMore) {
      wx.showToast({
        title: "没有更多评论了",
        icon: "none"
      });
      return;
    }

    wx.cloud.callFunction({
      name: "getComments",
      data: {
        postId: this.data.post._id,
        limit: this.data.limit,
        skip: this.data.skip
      },
      success: res => {
        console.log("加载更多评论:", res);
        if (res.result.success && res.result.data.length > 0) {
          this.setData({
            comments: [...this.data.comments, ...res.result.data],
            skip: this.data.skip + res.result.data.length
          });
        } else {
          this.setData({
            hasMore: false
          });
          wx.showToast({
            title: "没有更多评论了",
            icon: "none"
          });
        }
      },
      fail: err => {
        console.error("加载评论失败:", err);
      }
    });
  },

  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },

  submitComment() {
    const { commentContent, userId, post } = this.data;
  
    // 检查用户是否已登录
    if (!userId) {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        duration: 2000,
        success: () => {
          // 跳转到 Profile 页面
          wx.navigateTo({
            url: "/pages/profile/profile"
          });
        }
      });
      return;
    }
  
    if (!commentContent.trim()) {
      wx.showToast({
        title: "评论不能为空",
        icon: "none"
      });
      return;
    }
  
    wx.cloud.callFunction({
      name: "addComment",
      data: {
        postId: post._id,
        userId,
        content: commentContent
      },
      success: res => {
        if (res.result.success) {
          wx.showToast({
            title: "评论成功",
            icon: "success"
          });
  
          this.setData({
            commentContent: "",
            skip: 0,
            hasMore: true
          });
          this.getPostDetail(post._id);
        } else {
          wx.showToast({
            title: "评论失败",
            icon: "none"
          });
        }
      },
      fail: err => {
        console.error("添加评论失败:", err);
      }
    });
  },

  onReachBottom() {
    console.log("触底，加载更多评论");
    this.loadMoreComments();
  },

  goToUserProfile(e) {
    const userId = e.currentTarget.dataset.userid; // 获取用户 ID
    console.log("进入用户主页，User ID:", userId);
    wx.navigateTo({
      url: `/pages/user-profile/user-profile?userId=${userId}`
    });
  },

  previewImage(e) {
    const current = e.currentTarget.dataset.src; // 获取当前点击的图片 URL
    console.log("点击预览图片:", current);

    wx.previewImage({
      current: current, // 当前显示的图片 URL
      urls: this.data.post.images // 预览全部图片列表
    });
  },

  handleLikeClick() {
    const { post, userId } = this.data;

    // 检查用户是否登录
    if (!userId) {
      wx.showToast({
        title: "请先登录",
        icon: "none"
      });

      // 跳转到登录页面
      wx.navigateTo({
        url: "/pages/profile/profile"
      });
      return;
    }

    // 计算新的点赞数
    const newLikes = (post.likes || 0) + 1;

    wx.cloud.callFunction({
      name: "updateLikes",
      data: { postId: post._id, likes: newLikes },
      success: res => {
        console.log("点赞成功", res);
        this.setData({
          "post.likes": newLikes
        });
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

  goHome() {
    wx.navigateTo({
      url: "/pages/index/index"
    });
  }
});
