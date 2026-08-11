// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    // 查询用户是否存在
    const userRes = await db.collection('users').where({ _openid: openid }).get()
    
    if (userRes.data.length === 0) {
      // 新用户：创建用户记录
      const now = new Date()
      const userData = {
        _openid: openid,
        nickName: '养宠人' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
        avatarUrl: '',
        city: '',
        phone: '',
        email: '',
        createTime: now,
        updateTime: now
      }
      const addRes = await db.collection('users').add({ data: userData })
      
      // 创建统计数据
      const statsData = {
        _openid: openid,
        level: 1,
        score: 0,
        annotations: 0,
        pendingCount: 0,
        favorites: [],
        migrationKits: 0,
        createTime: now,
        updateTime: now
      }
      await db.collection('user_stats').add({ data: statsData })
      
      return {
        code: 0,
        message: '新用户注册成功',
        user: { ...userData, _id: addRes._id },
        stats: statsData,
        isNew: true
      }
    }
    
    // 老用户：返回信息
    const user = userRes.data[0]
    const statsRes = await db.collection('user_stats').where({ _openid: openid }).get()
    const stats = statsRes.data[0] || null
    
    return {
      code: 0,
      message: '登录成功',
      user: user,
      stats: stats,
      isNew: false
    }
    
  } catch (err) {
    console.error('登录失败:', err)
    return {
      code: -1,
      message: '登录失败，请重试',
      error: err.message
    }
  }
}