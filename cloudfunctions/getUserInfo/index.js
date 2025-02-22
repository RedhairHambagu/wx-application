const cloud = require('wx-server-sdk');
cloud.init({ env: "yanmo-3g8s1hmd1faa3280" });

const db = cloud.database();

exports.main = async (event, context) => {
  const { userId } = event;

  if (!userId) return { success: false, error: "userId 不能为空" };

  try {
    const res = await db.collection('users').doc(userId).get();
    return { success: true, data: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};
