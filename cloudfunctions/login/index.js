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
        isAdmin: false,
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
        favorites: 0,
        migrationKits: 0,
        createTime: now,
        updateTime: now
      }
      await db.collection('user_stats').add({ data: statsData })
      
      // ✅ 修改返回格式
      return {
        code: 0,
        data: {
          token: 'user_' + openid + '_' + Date.now(),
          userInfo: {
            nickName: userData.nickName,
            avatarUrl: userData.avatarUrl,
            city: userData.city,
            isAdmin: false
          },
          stats: {
            level: statsData.level,
            score: statsData.score,
            annotations: statsData.annotations,
            favorites: statsData.favorites,
            pendingCount: statsData.pendingCount,
            migrationKits: statsData.migrationKits
          }
        }
      }
    }
    
    // 老用户：返回信息
    const user = userRes.data[0]
    const statsRes = await db.collection('user_stats').where({ _openid: openid }).get()
    const stats = statsRes.data[0] || null

    // ✅ 修改返回格式
    return {
      code: 0,
      data: {
        token: 'user_' + openid + '_' + Date.now(),
        userInfo: {
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          city: user.city,
          isAdmin: user.isAdmin || false
        },
        stats: stats ? {
          level: stats.level || 1,
          score: stats.score || 0,
          annotations: stats.annotations || 0,
          favorites: stats.favorites || 0,
          pendingCount: stats.pendingCount || 0,
          migrationKits: stats.migrationKits || 0
        } : {
          level: 1,
          score: 0,
          annotations: 0,
          favorites: 0,
          pendingCount: 0,
          migrationKits: 0
        }
      }
    }
    
  } catch (err) {
    console.error('登录失败:', err)
    return {
      code: -1,
      message: err.message || '登录失败，请重试'
    }
  }
}