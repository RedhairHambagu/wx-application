const cloud = require('wx-server-sdk');
cloud.init({
  env: "yanmo-3g8s1hmd1faa3280"
});

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 获取最新的三条记录
    const events = await db.collection('events')
      .orderBy('fulltime', 'desc')
      .limit(3)
      .get();

    // 提取封面图片和最新的描述
    const eventImages = events.data.map(item => item.cover);
    const eventPreview = events.data[0]?.title || '暂无活动预告';

    return {
      success: true,
      data: {
        eventPreview,
        eventImages,
        showEventModal: false
      }
    };

  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err.message
    };
  }
};