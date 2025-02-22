const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();
const posts = db.collection('posts');

exports.main = async (event, context) => {
  const { title, content, images, userId, author, avatarUrl } = event;
  const wxContext = cloud.getWXContext();

  try {
    const result = await posts.add({
      data: {
        _id: `post_${Date.now()}`,  // 自定义 ID 格式
        title,
        content,
        images,
        userId,
        author,
        avatarUrl,
        date: new Date().toISOString(),  // ISO 格式日期
        likes: 0,
        comments: 0,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });

    return {
      success: true,
      data: result._id
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err
    };
  }
};