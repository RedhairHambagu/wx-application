const cloud = require('wx-server-sdk');
cloud.init({ env: "yanmo-3g8s1hmd1faa3280" });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { postId, increment = 1 } = event;

  if (!postId) return { success: false, error: "postId 不能为空" };

  try {
    await db.collection('posts').doc(postId).update({
      data: {
        likes: _.inc(increment)  // 确保点赞数是累加的
      }
    });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};
