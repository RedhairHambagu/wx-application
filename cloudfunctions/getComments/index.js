const cloud = require('wx-server-sdk');
cloud.init({ env: "yanmo-3g8s1hmd1faa3280" });

const db = cloud.database();

exports.main = async (event, context) => {
  const { postId, limit = 10, skip = 0 } = event;
  console.log(`📌 getComments - postId: ${postId}, limit: ${limit}, skip: ${skip}`);

  if (!postId) {
    return { success: false, error: "postId 不能为空" };
  }

  try {
    // 获取评论
    const commentsRes = await db.collection('comments')
      .where({ postId })
      .orderBy('date', 'desc')
      .skip(skip)
      .limit(limit)
      .get();

    let comments = commentsRes.data || [];

    if (comments.length === 0) {
      return { success: true, data: [] };
    }

    // 获取评论的用户信息
    const userIds = [...new Set(comments.map(comment => comment.userId))];
    console.log("📌 需要查询的用户 ID:", userIds);

    const usersRes = await db.collection('users')
      .where({ _id: db.command.in(userIds) }) // 确保这里匹配 _id 而不是 userId
      .get();

    console.log("✅ 获取到的用户数据:", usersRes.data);

    const usersMap = {};
    usersRes.data.forEach(user => {
      usersMap[user._id] = {
        username: user.username,
        avatarUrl: user.avatarUrl || "cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/6.jpg"
      };
    });

    // 合并评论和用户信息
    comments = comments.map(comment => ({
      ...comment,
      user: usersMap[comment.userId] || { username: "未知用户", avatarUrl: "cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/6.jpg" }
    }));

    console.log("✅ 处理后的评论数据:", comments);

    return { success: true, data: comments };
  } catch (error) {
    console.error("❌ 获取评论失败:", error);
    return { success: false, error: error.message };
  }
};
