// cloudfunctions/getUserInfo/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get()
    const user = userRes.data[0] || null
    
    const statsRes = await db.collection('user_stats').where({ _openid: openid }).get()
    const stats = statsRes.data[0] || null
    
    return {
      code: 0,
      data: {
        user: user,
        stats: stats
      }
    }
    
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return {
      code: -1,
      message: '获取用户信息失败',
      error: err.message
    }
  }
}