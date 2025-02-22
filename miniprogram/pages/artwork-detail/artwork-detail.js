Page({
  data: {
    artwork: {},
    isPlaying: false,
    audioContext: null,
    duration: 0,
    currentTime: 0,
    formattedCurrentTime: "0:00",
    formattedDuration: "0:00",
  },

  onLoad(options) {
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
  }
});
