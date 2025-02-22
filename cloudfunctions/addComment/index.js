const cloud = require('wx-server-sdk');
cloud.init({ env: "yanmo-3g8s1hmd1faa3280" });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { postId, userId, content } = event;
  console.log("📌 addComment - Received:", { postId, userId, content });

  if (!postId || !userId || !content.trim()) {
    return { success: false, error: "参数缺失或内容为空" };
  }

  try {
    // 添加新评论
    const newComment = {
      postId,
      userId,
      content,
      date: db.serverDate(),  // 服务器时间
    };

    const commentRes = await db.collection('comments').add({ data: newComment });

    // 增加帖子评论数量
    await db.collection('posts').doc(postId).update({
      data: { comments: _.inc(1) }
    });

    return { success: true, commentId: commentRes._id, data: newComment };
  } catch (error) {
    console.error("❌ 添加评论失败:", error);
    return { success: false, error: error.message };
  }
};
