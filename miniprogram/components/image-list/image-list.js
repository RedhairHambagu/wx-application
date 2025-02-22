Component({
  properties: {
    images: {
      type: Array,
      value: []
    }
  },

  methods: {
    // 预览图片
    previewImage(e) {
      const current = e.currentTarget.dataset.src;
      wx.previewImage({
        current: current, // 当前点击的图片
        urls: this.properties.images // 预览全部图片
      });
    }
  }
});
