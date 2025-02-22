const WebSocket = require('ws');
const cloud = require('wx-server-sdk');

cloud.init();

let wss; // WebSocket 服务器

exports.main = async (event, context) => {
    // 初始化 WebSocket 服务器
    if (!wss) {
        wss = new WebSocket.Server({ port: 3000 }); // 使用云函数的可用端口

        wss.on('connection', (ws) => {
            console.log('新用户连接');

            // 监听消息
            ws.on('message', async (message) => {
                try {
                    const msgData = JSON.parse(message);
                    const { type, roomId } = msgData;

                    if (type === 'join') {
                        // 加入房间
                        if (!rooms.has(roomId)) {
                            rooms.set(roomId, new Set());
                        }
                        rooms.get(roomId).add(ws);
                        return;
                    }

                    // 保存消息到数据库
                    const db = cloud.database();
                    await db.collection('messages').add({
                        data: {
                            ...msgData,
                            createTime: db.serverDate()
                        }
                    });

                    // 只向同一房间的用户广播消息
                    const roomClients = rooms.get(roomId);
                    if (roomClients) {
                        roomClients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(message);
                            }
                        });
                    }
                } catch (error) {
                    console.error('处理消息错误:', error);
                }
            });

            ws.on('close', () => {
                // 清理房间连接
                rooms.forEach((clients, roomId) => {
                    clients.delete(ws);
                    if (clients.size === 0) {
                        rooms.delete(roomId);
                    }
                });
                console.log('用户断开连接');
            });
        });
    }

    return { message: 'WebSocket 服务器运行中' };
};
