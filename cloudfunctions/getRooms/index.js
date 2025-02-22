const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
    const db = cloud.database();

    try {
        const res = await db.collection('rooms').get();
        return { success: true, rooms: res.data };
    } catch (err) {
        return { success: false, error: err.message };
    }
};
