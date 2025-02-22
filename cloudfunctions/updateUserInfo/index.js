const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();
const users = db.collection('users');

exports.main = async (event, context) => {
  const { userId, username, email, avatarUrl } = event;

  try {
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    await users.doc(userId).update({
      data: updateData
    });

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};
