Page({
  data: {
    artworks: [],
    currentType: 'all',
    filteredArtworks: [],
    pageSize: 10,
    currentPage: 1,
    hasMore: true,
    isLoading: false,
    total: 0
  },

  onLoad() {
    this.fetchArtworks();
  },

  fetchArtworks(loadMore = false) {
    if (this.data.isLoading || (!loadMore && !this.data.hasMore)) return;

    this.setData({ isLoading: true });

    wx.cloud.callFunction({
      name: 'getArtworks',
      data: {
        page: this.data.currentPage,
        pageSize: this.data.pageSize,
        type: this.data.currentType !== 'all' ? this.data.currentType : ''
      },
      success: res => {
        if (res.result.success) {
          const newArtworks = res.result.data;
          const total = res.result.total; // 获取总数
          const allArtworks = loadMore ? [...this.data.artworks, ...newArtworks] : newArtworks;

          // 计算是否还有更多数据
          const hasMore = allArtworks.length < total;

          this.setData({ 
            artworks: allArtworks,
            filteredArtworks: allArtworks,
            hasMore,
            total,
            currentPage: loadMore ? this.data.currentPage + 1 : 2 // 确保翻页正确
          });

          if (!loadMore) {
            this.addAnimations();
          }
        }
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 
      currentType: type,
      currentPage: 1,
      hasMore: true,
      artworks: [],
      filteredArtworks: [],
      total: 0
    }, () => {
      this.fetchArtworks();
    });
  },

  // 监听触底事件
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.fetchArtworks(true);
    }
  },

  addAnimations() {
    const animations = this.data.filteredArtworks.map((item, index) => {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
        delay: index * 100
      });

      animation.opacity(1).translateY(0).step();
      return animation.export();
    });

    this.data.filteredArtworks.forEach((item, index) => {
      this.setData({
        [`filteredArtworks[${index}].animation`]: animations[index]
      });
    });
  },

  goToArtworkDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/artwork-detail/artwork-detail?id=${id}`
    });
  },

  goHome() {
    wx.navigateTo({
      url: "/pages/index/index"
    });
  }
});
