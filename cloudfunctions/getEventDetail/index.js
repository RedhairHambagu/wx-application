const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { id } = event;

  try {
    const res = await db.collection('events').doc(id).get();
    return res.data || {};
  } catch (err) {
    return { error: err.message };
  }
};
