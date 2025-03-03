const cloud = require('wx-server-sdk');
cloud.init({ env: "yanmo-3g8s1hmd1faa3280" });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { postId, userId } = event;

  if (!postId || !userId) {
    return { success: false, error: "参数不完整" };
  }

  try {
    // 获取帖子信息
    const post = await db.collection('posts').doc(postId).get();
    
    if (!post.data) {
      return { success: false, error: "帖子不存在" };
    }

    // 更新点赞数
    await db.collection('posts').doc(postId).update({
      data: {
        likes: _.inc(1)
      }
    });

    return { success: true };
  } catch (err) {
    console.error('点赞失败:', err);
    return { success: false, error: "操作失败，请稍后重试" };
  }
};
