Page({
  data: {
    title: '',
    content: '',
    images: [],
    userInfo: null
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // 输入内容
  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  // 选择图片
  chooseImages() {
    const remainCount = 9 - this.data.images.length;
    if (remainCount <= 0) {
      wx.showToast({ title: '最多选择9张图片', icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          images: [...this.data.images, ...newImages]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    wx.previewImage({
      current,
      urls: this.data.images
    });
  },

  // 发布帖子
  async submitPost() {
    const { title, content, images, userInfo } = this.data;

    if (!title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发布中...' });

    try {
      // 上传图片
      const uploadedImages = [];
      for (let image of images) {
        const cloudPath = `posts/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`;
        const res = await wx.cloud.uploadFile({
          cloudPath,
          filePath: image
        });
        uploadedImages.push(res.fileID);
      }

      // 调用云函数创建帖子
      const res = await wx.cloud.callFunction({
        name: 'createPost',
        data: {
          title,
          content,
          images: uploadedImages,
          userId: userInfo._id,
          author: userInfo.username,
          avatarUrl: userInfo.avatarUrl
        }
      });

      if (res.result.success) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error('发布失败');
      }
    } catch (err) {
      console.error('发布失败:', err);
      wx.showToast({ title: '发布失败，请重试', icon: 'none' });
    }

    wx.hideLoading();
  }
});