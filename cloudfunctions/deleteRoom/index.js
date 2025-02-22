const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
    const db = cloud.database();
    const { roomId } = event;

    try {
        // 删除聊天记录
        await db.collection('messages').where({ roomId }).remove();
        
        // 删除房间
        await db.collection('rooms').doc(roomId).remove();

        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
};
