let socket = null;

Page({
    data: {
        roomId: '',
        messages: [],
        inputValue: '',
        page: 1,
        pageSize: 20,
        isLoading: false,
        hasMore: true
    },

    onLoad(options) {
        this.setData({
            roomId: options.id
        });
        this.loadMessages();
        this.connectWebSocket();
    },

    async loadMessages(isLoadMore = false) {
        if (this.data.isLoading || (!isLoadMore && !this.data.hasMore)) return;

        this.setData({ isLoading: true });

        try {
            const res = await wx.cloud.callFunction({
                name: 'getMessages',
                data: {
                    roomId: this.data.roomId,
                    page: this.data.page,
                    pageSize: this.data.pageSize
                }
            });

            if (res.result.success) {
                const newMessages = isLoadMore 
                    ? [...this.data.messages, ...res.result.messages]
                    : res.result.messages;

                this.setData({
                    messages: newMessages,
                    hasMore: res.result.hasMore,
                    page: isLoadMore ? this.data.page + 1 : 1
                });
            }
        } catch (error) {
            wx.showToast({
                title: '加载消息失败',
                icon: 'none'
            });
        } finally {
            this.setData({ isLoading: false });
        }
    },

    loadMoreMessages() {
        if (this.data.hasMore) {
            this.loadMessages(true);
        }
    },

    connectWebSocket() {
        const cloudEnv = wx.cloud.DYNAMIC_CURRENT_ENV;
        socket = wx.connectSocket({
            url: `wss://tcb-ws.tencentcloudapi.com`,
            success: () => {
                console.log('WebSocket 连接成功');
            }
        });

        socket.onOpen(() => {
            console.log('WebSocket 连接已打开');
            // 发送加入房间消息
            socket.send({
                data: JSON.stringify({
                    type: 'join',
                    roomId: this.data.roomId
                })
            });
        });

        socket.onMessage((res) => {
            try {
                const data = JSON.parse(res.data);
                // 只添加新消息，避免重复
                this.setData({
                    messages: [...this.data.messages, data]
                });
                // 滚动到底部
                wx.pageScrollTo({
                    scrollTop: 9999
                });
            } catch (error) {
                console.error('解析消息失败:', error);
            }
        });

        socket.onClose(() => {
            console.log('WebSocket 连接已关闭');
            // 可以在这里添加重连逻辑
        });

        socket.onError((error) => {
            console.error('WebSocket 错误:', error);
        });
    },

    async loadMessages() {
        try {
            const res = await wx.cloud.callFunction({
                name: 'getMessages',
                data: { roomId: this.data.roomId }
            });
            
            if (res.result && res.result.success) {
                this.setData({
                    messages: res.result.messages
                });
            }
        } catch (error) {
            wx.showToast({
                title: '加载历史消息失败',
                icon: 'none'
            });
        }
    },

    onInput(event) {
        this.setData({
            inputValue: event.detail.value
        });
    },

    async sendMessage() {
        const { roomId, inputValue } = this.data;
        if (!inputValue.trim()) return;

        const messageData = {
            type: 'message',
            roomId,
            content: inputValue,
            timestamp: Date.now(),
            username: 'user123'
        };

        try {
            // 先调用云函数保存消息
            const res = await wx.cloud.callFunction({
                name: 'sendMessage',
                data: messageData
            });

            if (res.result && res.result.success) {
                // 保存成功后通过 WebSocket 广播
                socket.send({
                    data: JSON.stringify({
                        ...messageData,
                        _id: res.result.messageId // 添加消息ID
                    })
                });

                this.setData({
                    inputValue: ''
                });
            } else {
                throw new Error('发送失败');
            }
        } catch (error) {
            wx.showToast({
                title: '发送失败',
                icon: 'none'
            });
            console.error('发送消息失败:', error);
        }
    },

    onUnload() {
        if (socket) {
            socket.close();
        }
    }
});
