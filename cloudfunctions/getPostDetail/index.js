const cloud = require('wx-server-sdk');
cloud.init({ env: "yanmo-3g8s1hmd1faa3280" });

const db = cloud.database();

exports.main = async (event, context) => {
  const { postId } = event;
  console.log("📌 getPostDetail - Received postId:", postId);

  if (!postId) {
    return { success: false, error: "postId 不能为空" };
  }

  try {
    // 获取帖子详情
    const postRes = await db.collection('posts').doc(postId).get();
    if (!postRes.data) {
      console.error("❌ 帖子不存在:", postId);
      return { success: false, error: "帖子不存在" };
    }
    const post = postRes.data;

    // 获取帖子作者信息
    const userRes = await db.collection('users').doc(post.userId).get();
    const user = userRes.data || { username: "未知用户", avatarUrl: "cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/6.jpg" };

    // 获取前 5 条评论
    const commentsRes = await db.collection('comments')
      .where({ postId })
      .orderBy('date', 'desc')
      .limit(5)
      .get();

    let comments = commentsRes.data || [];

    if (comments.length > 0) {
      // 获取所有评论用户 ID
      const userIds = [...new Set(comments.map(comment => comment.userId))];

      // 查询这些用户信息
      const usersRes = await db.collection('users')
        .where({ _id: db.command.in(userIds) })
        .get();

      const usersMap = {};
      usersRes.data.forEach(u => {
        usersMap[u._id] = { username: u.username, avatarUrl: u.avatarUrl || "cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/6.jpg" };
      });

      // 合并评论的用户信息
      comments = comments.map(comment => ({
        ...comment,
        user: usersMap[comment.userId] || { username: "未知用户", avatarUrl: "cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/6.jpg" }
      }));
    }

    return {
      success: true,
      data: {
        post: { ...post, user },
        comments
      }
    };
  } catch (error) {
    console.error("❌ 获取帖子详情失败:", error);
    return { success: false, error: error.message };
  }
};
