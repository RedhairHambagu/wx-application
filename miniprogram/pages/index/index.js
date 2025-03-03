Page({
  data: {
    artistPoster: 'cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/1.jpg',
    eventPreview: '',
    showEventModal: false,
    eventImages: [],
    artworks: []
  },

  onLoad() {
    // 获取艺术作品
    wx.cloud.callFunction({
      name: 'getArtworks',
    }).then(res => {
      if (res.result.success) {
        const shuffled = res.result.data.sort(() => Math.random() - 0.5);
        this.setData({ artworks: shuffled.slice(0, 3) });
      }
    }).catch(console.error);

    // 获取活动预告和图片
    wx.cloud.callFunction({
      name: 'getNewEvent'
    }).then(res => {
      if (res.result.success) {
        this.setData({
          eventPreview: res.result.data.eventPreview,
          eventImages: res.result.data.eventImages,
          showEventModal: false
        });
      }
    }).catch(err => {
      console.error('获取活动预告失败：', err);
    });
  },

  goToEventPage() {
    wx.navigateTo({ url: '/pages/events/events' });
  },

  goToPostsPage() {
    wx.navigateTo({ url: '/pages/posts/posts' });
  },

  goToProfilePage() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  toggleEventModal() {
    this.setData({ showEventModal: !this.data.showEventModal });
  },

  goToArtworkDetail(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/artwork-detail/artwork-detail?id=${id}`,
    });
  },
  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.eventImages
    });
  },
  goToArtworkPage() {
    wx.navigateTo({ url: "/pages/artworks/artworks" });
  },

  goToChatPage() {
    wx.navigateTo({ url: "/pages/chat/chat" });
  }
});