const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const db = cloud.database();
  const { id } = event;

  if (!id) {
    return { success: false, error: "Missing artwork ID" };
  }

  try {
    const res = await db.collection('artworks').doc(id).get();
    
    if (!res.data) {
      return { success: false, error: "Artwork not found" };
    }

    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
