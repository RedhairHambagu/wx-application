Page({
  data: {
    userInfo: {},  // 用户信息
    posts: [],     // 该用户的帖子
    loggedIn: false  // 是否已登录
  },

  onLoad() {
    this.checkLoginStatus();  // 进入页面时检查登录状态
  },

  // 检查用户是否登录
  checkLoginStatus() {
    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        userInfo,
        loggedIn: true
      });
      this.fetchUserPosts(userInfo._id); // 获取用户帖子
    } else {
      this.setData({ loggedIn: false });  // 未登录
    }
  },

  // 处理用户微信一键登录
  login() {
    wx.getUserProfile({
      desc: "用于完善用户资料",
      success: (res) => {
        const { avatarUrl, nickName } = res.userInfo;
        
        wx.cloud.callFunction({
          name: "loginUser",
          data: { avatarUrl, nickName },
          success: res => {
            if (res.result.success) {
              const userInfo = res.result.data;
              wx.setStorageSync("userInfo", userInfo); // 存储到本地
              
              this.setData({
                userInfo,
                loggedIn: true
              });

              this.fetchUserPosts(userInfo._id); // 获取用户帖子
            } else {
              wx.showToast({
                title: "登录失败",
                icon: "none"
              });
            }
          },
          fail: err => {
            console.error("登录失败:", err);
            wx.showToast({
              title: "登录失败，请稍后重试",
              icon: "none"
            });
          }
        });
      },
      fail: () => {
        wx.showToast({
          title: "授权失败",
          icon: "none"
        });
      }
    });
  },

  // 退出登录
  logout() {
    wx.removeStorageSync("userInfo");
    this.setData({
      userInfo: {},
      loggedIn: false,
      posts: []
    });
    wx.showToast({
      title: "已退出登录",
      icon: "success"
    });
  },

  // 获取该用户发布的帖子
  fetchUserPosts(userId) {
    wx.cloud.callFunction({
      name: 'getPosts',
      success: res => {
        if (res.result.success) {
          console.log('获取的帖子数据:', res.result.data);
          const userPosts = res.result.data.filter(post => post.userId === userId);
          this.setData({ posts: userPosts });
        }
      },
      fail: err => {
        console.error('获取用户帖子失败:', err);
      }
    });
  },

  // 修改用户信息
  editProfile() {
    wx.showActionSheet({
      itemList: ["修改头像", "修改昵称", "修改邮箱", "使用微信资料"],
      success: (res) => {
        switch(res.tapIndex) {
          case 0:
            this.chooseAvatar();
            break;
          case 1:
            this.editUsername();
            break;
          case 2:
            this.editEmail();
            break;
          case 3:
            this.useWechatInfo();
            break;
        }
      }
    });
  },

  // 修改昵称
  editUsername() {
    wx.showModal({
      title: "修改昵称",
      content: "请输入新的昵称",
      editable: true,
      placeholderText: "输入新的昵称",
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.updateUserInfo({ username: res.content.trim() });
        }
      }
    });
  },

  // 修改邮箱
  editEmail() {
    wx.showModal({
      title: "修改邮箱",
      content: "请输入新的邮箱",
      editable: true,
      placeholderText: "输入新的邮箱",
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.updateUserInfo({ email: res.content.trim() });
        }
      }
    });
  },

  // 使用微信资料
  useWechatInfo() {
    wx.getUserProfile({
      desc: "用于更新个人资料",
      success: (res) => {
        const { avatarUrl, nickName } = res.userInfo;
        this.updateUserInfo({
          avatarUrl,
          username: nickName
        });
      },
      fail: () => {
        wx.showToast({
          title: "获取信息失败",
          icon: "none"
        });
      }
    });
  },
  
  // 选择并上传头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const filePath = res.tempFiles[0].tempFilePath;
        const cloudPath = `avatars/${this.data.userInfo._id}_${Date.now()}.jpg`;
  
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: (uploadRes) => {
            const avatarUrl = uploadRes.fileID;
            this.updateUserInfo({ avatarUrl }); // 更新头像
          },
          fail: (err) => {
            console.error("上传头像失败:", err);
          }
        });
      }
    });
  },
  
  // 修改昵称和邮箱
  editTextProfile() {
    wx.showModal({
      title: "修改个人信息",
      content: "请输入新的昵称和邮箱",
      editable: true,
      placeholderText: "输入新的昵称,邮箱（用,隔开）",
      success: (res) => {
        if (res.confirm && res.content) {
          const [newUsername, newEmail] = res.content.split(",");
          this.updateUserInfo({ username: newUsername.trim(), email: newEmail.trim() });
        }
      }
    });
  },
  
  // 统一调用云函数更新用户信息
  updateUserInfo(updateData) {
    wx.cloud.callFunction({
      name: "updateUserInfo",
      data: {
        userId: this.data.userInfo._id,
        ...updateData
      },
      success: res => {
        if (res.result.success) {
          const updatedUserInfo = { ...this.data.userInfo, ...updateData };
          wx.setStorageSync("userInfo", updatedUserInfo); // 更新本地存储
          this.setData({ userInfo: updatedUserInfo });
  
          wx.showToast({
            title: "修改成功",
            icon: "success"
          });
        } else {
          wx.showToast({
            title: "修改失败",
            icon: "none"
          });
        }
      },
      fail: err => {
        console.error("修改失败:", err);
        wx.showToast({
          title: "修改失败，请稍后重试",
          icon: "none"
        });
      }
    });
  },
  
  // 进入帖子详情页
  goToPostDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${postId}`
    });
  },

  // 添加发布帖子跳转方法
  goToCreatePost() {
    if (!this.data.loggedIn) {
      wx.showToast({
        title: "请先登录",
        icon: "none"
      });
      return;
    }
    
    wx.navigateTo({
      url: "/pages/create-post/create-post"
    });
  },

  goHome() {
    wx.navigateTo({ url: "/pages/index/index" });
  }
});
