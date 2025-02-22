const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10, type = '' } = event;
  const skip = (page - 1) * pageSize; // 计算正确的偏移量

  try {
    let query = db.collection('artworks');

    if (type) {
      query = query.where({ type });
    }

    // 先获取总数
    const totalRes = await db.collection('artworks').where(type ? { type } : {}).count();
    const total = totalRes.total;

    // 再进行分页查询
    const { data } = await query
      .orderBy('date', 'desc')
      .skip(skip) // 确保跳过之前的数据
      .limit(pageSize)
      .get();

    return {
      success: true,
      data,
      total
    };
  } catch (err) {
    return {
      success: false,
      error: err
    };
  }
};
