const cloud = require('wx-server-sdk');
cloud.init({ env: "yanmo-3g8s1hmd1faa3280" });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 1️⃣ 获取所有帖子
    const postsRes = await db.collection('posts').orderBy('date', 'desc').get();
    const posts = postsRes.data;

    if (!posts.length) {
      return { success: true, data: [] };
    }

    // 2️⃣ 获取所有用户信息 (批量查询)
    const userIds = [...new Set(posts.map(post => post.userId))]; // 去重
    const usersRes = await db.collection('users').where({
      _id: db.command.in(userIds)
    }).get();
    const users = usersRes.data;

    // 3️⃣ 整合 `posts` 和 `users`
    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = {
        username: user.username,
        avatarUrl: user.avatarUrl || "cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/4.jpg"
      };
    });

    const postsWithUser = posts.map(post => ({
      _id: post._id,
      userId: post.userId,
      title: post.title,
      content: post.content,
      date: post.date,
      likes: post.likes,
      comments: Math.floor(post.comments), // 修正 comments 可能是浮点数的问题
      images: post.images || [], // 确保 images 存在
      user: userMap[post.userId] || { username: "未知用户", avatarUrl: "cloud://yanmo-3g8s1hmd1faa3280.7961-yanmo-3g8s1hmd1faa3280-1342521606/images/4.jpg" } // 用户不存在时使用默认值
    }));

    return { success: true, data: postsWithUser };
  } catch (err) {
    console.error("获取帖子失败:", err);
    return { success: false, error: err.message };
  }
};
