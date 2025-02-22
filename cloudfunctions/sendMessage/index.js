// 云函数: sendMessage/index.js
const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
    const db = cloud.database();
    const wxContext = cloud.getWXContext();
    const { roomId, content } = event;

    try {
        // 创建消息记录
        const message = {
            roomId,
            content,
            username: wxContext.OPENID.slice(-8), // 使用 OPENID 后8位作为用户标识
            userId: wxContext.OPENID,
            createTime: db.serverDate(),
            timestamp: Date.now()
        };

        // 保存消息到数据库
        const result = await db.collection('messages').add({
            data: message
        });

        return { 
            success: true, 
            messageId: result._id,
            message: {
                ...message,
                _id: result._id
            }
        };
    } catch (err) {
        console.error('发送消息失败:', err);
        return { 
            success: false, 
            error: err.message 
        };
    }
};
