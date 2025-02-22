const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const { roomId, page = 1, pageSize = 20 } = event;
    const skip = (page - 1) * pageSize;

    try {
        // 获取总消息数
        const countResult = await db.collection('messages')
            .where({
                roomId: _.eq(roomId)
            })
            .count();

        // 获取分页消息，按时间正序排列，确保旧消息在上，新消息在下
        const messagesResult = await db.collection('messages')
            .where({
                roomId: _.eq(roomId)
            })
            .orderBy('createTime', 'asc')
            .skip(skip)
            .limit(pageSize)
            .get();

        // 格式化消息时间
        const messages = messagesResult.data.map(msg => ({
            ...msg,
            createTime: msg.createTime ? new Date(msg.createTime).toLocaleString() : ''
        }));

        return { 
            success: true, 
            messages,
            total: countResult.total,
            currentPage: page,
            hasMore: skip + pageSize < countResult.total
        };
    } catch (err) {
        console.error('获取消息失败:', err);
        return { 
            success: false, 
            error: err.message 
        };
    }
};
