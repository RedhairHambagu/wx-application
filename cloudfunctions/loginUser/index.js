const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();
const users = db.collection('users');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { avatarUrl, nickName } = event;

  try {
    const userRecord = await users.where({ _id: openid }).get();

    if (userRecord.data.length > 0) {
      return {
        success: true,
        data: userRecord.data[0]
      };
    } else {
      const newUser = {
        _id: openid,
        username: nickName || "未命名用户",
        avatarUrl: avatarUrl || "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
        email: "",
        createdAt: db.serverDate() // 让数据库自动生成时间
      };

      // 使用 set() 代替 add()，避免 _id 重复导致的报错
      await users.doc(openid).set({ data: newUser });

      return {
        success: true,
        data: newUser
      };
    }
  } catch (error) {
    console.error("登录失败:", error);
    return {
      success: false,
      error: error.message || error
    };
  }
};
