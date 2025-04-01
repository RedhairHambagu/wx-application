Page({
  data: {
    event: {}
  },

  onLoad(options) {
    const eventId = options.id;
    console.log("Navigated to event ID:", eventId); // 确保 eventId 正确

    wx.cloud.callFunction({
      name: "getEventDetail",
      data: { id: eventId },
      success: res => {
        console.log("Cloud function response:", res.result); // 输出返回的数据
        if (res.result && !res.result.error) {
          this.setData({ event: res.result });
        } else {
          wx.showToast({
            title: "活动详情未找到",
            icon: "none"
          });
        }
      },
      fail: err => {
        console.error("Call function failed:", err);
      }
    });
  },
   // 点击图片进行预览
  previewImage() {
    wx.previewImage({
      urls: [this.data.event.cover], // 预览的图片数组
      current: this.data.event.cover // 当前预览的图片
    });
  },
    // 导航到活动地点
    openLocation() {
      if (!this.data.event.location) {
        wx.showToast({
          title: '位置信息不存在',
          icon: 'none'
        });
        return;
      }
  
      // 直接打开地图选择器
      wx.openLocation({
        latitude: this.data.event.latitude || 0,
        longitude: this.data.event.longitude || 0,
        name: this.data.event.location,
        address: this.data.event.location,
        scale: 18
      });
    },
  goHome() {
    wx.navigateTo({
      url: "/pages/index/index"
    });
  }
});
