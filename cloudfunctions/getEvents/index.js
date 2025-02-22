const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const db = cloud.database()
  try {
    const res = await db.collection('events').orderBy('date', 'desc').get()
    return { success: true, data: res.data }
  } catch (error) {
    return { success: false, error }
  }
}
