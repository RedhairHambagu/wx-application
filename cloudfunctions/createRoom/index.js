const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
    const db = cloud.database();
    const { roomName, creatorId, type } = event;

    try {
        // 创建房间
        const roomRes = await db.collection('rooms').add({
            data: {
                roomName,
                creatorId,
                createdAt: new Date(),
                type
            }
        });

        // 获取当前房间数量以生成系统消息的 ID
        const roomCountRes = await db.collection('rooms').count();
        const messageId = (roomCountRes.total).toString().padStart(2, '0'); // 生成 ID，如 01, 02, ...

        // 添加系统消息
        const message = {
            _id: messageId, // 使用生成的 ID
            roomId: roomRes._id,
            username: "SystemMessage",
            content: "系统消息提醒你遵守文明发言规则",
            timestamp: new Date().toISOString()
        };

        await db.collection('messages').add({
            data: message
        });

        return { success: true, roomId: roomRes._id };
    } catch (err) {
        return { success: false, error: err.message };
    }
};
