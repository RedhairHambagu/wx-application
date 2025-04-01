Page({
  data: {
    events: {},
    sortedKeys: []
  },

  onLoad() {
    this.fetchEvents()
  },

  async fetchEvents() {
    wx.cloud.callFunction({
      name: 'getEvents',
      success: res => {
        if (res.result.success) {
          const rawEvents = res.result.data
          let groupedEvents = {}

          // 重新整理数据，按照 YYYY-MM 分组
          rawEvents.forEach(event => {
            const [year, month] = event.date.split('-').slice(0, 2)
            const key = `${year}-${month}`

            // 添加事件状态标记
            const eventDate = new Date(event.fulltime)
            const now = new Date()
            event.isPast = eventDate < now

            if (!groupedEvents[key]) {
              groupedEvents[key] = { year, month, items: [] }
            }
            groupedEvents[key].items.push(event)
          })

          // 按年月排序
          const sortedKeys = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a))

          this.setData({ events: groupedEvents, sortedKeys })
        } else {
          console.error('获取数据失败', res.result.error)
        }
      },
      fail: err => {
        console.error('调用云函数失败', err)
      }
    })
  },

  // 点击事件，跳转详情页面
  goToEventsDetail(e) {
    const eventId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/event-detail/event-detail?id=${eventId}`
    });
  },

  goHome() {
    wx.navigateTo({
      url: "/pages/index/index"
    });
  }
})
