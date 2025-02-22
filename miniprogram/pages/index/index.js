Page({
  data: {
    artistPoster: 'cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/1.jpg',
    eventPreview: '2025年2月20日 演出预告：某某城市演唱会',
    showEventModal: false,
    eventImages: [
      'cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/5.jpg',
      'cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/6.jpg',
      'cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/7.jpg'
    ],
    artworks: []
  },

  onLoad() {
    wx.cloud.callFunction({
      name: 'getArtworks',
    }).then(res => {
      if (res.result.success) {
        const shuffled = res.result.data.sort(() => Math.random() - 0.5);
        this.setData({ artworks: shuffled.slice(0, 3) });
      }
    }).catch(console.error);
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
  goToRoomPage() {
    wx.navigateTo({ url: "/pages/rooms/rooms" });
  }
});