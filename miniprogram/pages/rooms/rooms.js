Page({
  data: {
      rooms: []
  },

  onLoad: function () {
      this.getRooms();
  },

  async getRooms() {
      const res = await wx.cloud.callFunction({
          name: 'getRooms'
      });
      if (res.result.success) {
          this.setData({
              rooms: res.result.rooms
          });
      } else {
          wx.showToast({
              title: '获取房间列表失败',
              icon: 'none'
          });
      }
  },

  async createChatRoom() {
      const res = await wx.cloud.callFunction({
          name: 'createRoom',
          data: {
              roomName: '聊天房间',
              creatorId: 'user123', // 替换为实际用户 ID
              type: 'chat'
          }
      });
      if (res.result.success) {
          this.getRooms();
      }
  },

  async createLiveRoom() {
      const res = await wx.cloud.callFunction({
          name: 'createRoom',
          data: {
              roomName: '直播房间',
              creatorId: 'user123', // 替换为实际用户 ID
              type: 'live'
          }
      });
      if (res.result.success) {
          this.getRooms();
      }
  },

  goToRoomDetail: function (event) {
      const roomId = event.currentTarget.dataset.id;
      wx.navigateTo({
          url: `/pages/room-detail/room-detail?id=${roomId}`
      });
  }
});
