Page({
  data: {
    artwork: {},
    isPlaying: false,
    audioContext: null,
    duration: 0,
    currentTime: 0,
    formattedCurrentTime: "0:00",
    formattedDuration: "0:00",
    recommendedArtworks: []
  },

  onLoad: function(options) {
    console.log("Received ID:", options.id);

    if (!options.id) {
      console.error("Missing artwork ID");
      return;
    }

    // 获取作品详情
    wx.cloud.callFunction({
      name: 'getArtworkDetail',
      data: { id: String(options.id) },
    }).then(res => {
      console.log("Cloud function response:", res);
      if (res.result.success) {
        this.setData({ artwork: res.result.data });
        // 获取推荐作品
        this.loadRecommendations(res.result.data.type, options.id);

        if (res.result.data.type === "music") {
          this.initAudio(res.result.data.mediaUrl);
        }
      } else {
        console.error("Failed to fetch artwork details:", res.result.error);
      }
    }).catch(error => {
      console.error("Cloud function call failed:", error);
    });
  },

  initAudio(src) {
    // 销毁旧的音频上下文
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }

    const audioContext = wx.createInnerAudioContext({
      useWebAudioImplement: true  // 添加这个配置
    });

    // 处理云存储链接
    if (src.startsWith('cloud://')) {
      wx.cloud.getTempFileURL({
        fileList: [src],
        success: res => {
          if (res.fileList[0].tempFileURL) {
            audioContext.src = res.fileList[0].tempFileURL;
          }
        },
        fail: err => {
          console.error('获取音频临时链接失败:', err);
        }
      });
    } else {
      audioContext.src = src;
    }

    // 添加错误处理
    audioContext.onError((err) => {
      console.error('音频播放错误:', err);
      wx.showToast({
        title: '音频加载失败',
        icon: 'none'
      });
    });

    // 监听音频加载完成
    audioContext.onCanplay(() => {
      setTimeout(() => {
        const duration = Math.floor(audioContext.duration) || 0;
        this.setData({
          duration,
          formattedDuration: this.formatTime(duration),
        });
      }, 500);
    });

    // 监听播放进度
    audioContext.onTimeUpdate(() => {
      const currentTime = Math.floor(audioContext.currentTime) || 0;
      this.setData({
        currentTime,
        formattedCurrentTime: this.formatTime(currentTime),
        duration: Math.floor(audioContext.duration) || this.data.duration,
        formattedDuration: this.formatTime(this.data.duration),
      });
    });

    // 监听播放结束
    audioContext.onEnded(() => {
      this.setData({ isPlaying: false, currentTime: 0, formattedCurrentTime: "0:00" });
    });

    this.setData({ audioContext });
  },

  togglePlay() {
    const { audioContext, isPlaying } = this.data;
    if (!audioContext) return;

    if (isPlaying) {
      audioContext.pause();
    } else {
      audioContext.play();
    }

    this.setData({ isPlaying: !isPlaying });
  },

  seekAudio(event) {
    const { value } = event.detail;
    console.log("Seeking to:", value);
    this.data.audioContext.seek(value);
    this.setData({ 
      currentTime: value, 
      formattedCurrentTime: this.formatTime(value) 
    });
  },

  formatTime(seconds) {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  },

  previewImage(e) {
    const current = e.currentTarget.dataset.src; // 获取当前点击的图片 URL
    const urls = e.currentTarget.dataset.list || [current]; // 获取图片列表（如果有）
  
    wx.previewImage({
      current: current, // 当前预览的图片
      urls: urls // 预览所有图片
    });
  },
  goHome() {
    wx.navigateTo({
      url: "/pages/index/index"
    });
  },
  async loadArtworkDetail(id) {
    try {
      const db = wx.cloud.database();
      const result = await db.collection('artworks').doc(id).get();
      const artwork = result.data;
      
      this.setData({ artwork });
      
      // 获取同类型推荐作品
      this.loadRecommendations(artwork.type, id);
    } catch (err) {
      console.error('获取作品详情失败：', err);
    }
  },

  async loadRecommendations(type, currentId) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getArtworks',
        data: {
          type: type,
          excludeId: currentId,  // 确保传递当前作品ID
          limit: 10,
          filter: {
            _id: {
              $ne: currentId  // 明确指定不等于当前ID
            }
          }
        }
      });

      if (res.result.success) {
        // 再次确保过滤掉当前作品
        const filteredArtworks = res.result.data.filter(item => item._id !== currentId);
        this.setData({
          recommendedArtworks: filteredArtworks
        });
      } else {
        console.error('获取推荐作品失败：', res.result.error);
      }
    } catch (err) {
      console.error('调用推荐作品云函数失败：', err);
    }
  },

  goToArtwork(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/artwork-detail/artwork-detail?id=${id}`
    });
  },
  goBack() {
    wx.navigateTo({
      url: "/pages/artworks/artworks"
    });
  }
});
