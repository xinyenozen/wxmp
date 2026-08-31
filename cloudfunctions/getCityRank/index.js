// cloudfunctions/getCityRank/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { limit = 50 } = event
  
  try {
    // 聚合查询：按城市统计POI数量
    const res = await db.collection('poi_places')
      .aggregate()
      .group({
        _id: '$city',
        count: { $sum: 1 },
        livingCount: {
          $sum: { $cond: [{ $eq: ['$type', 'living'] }, 1, 0] }
        },
        facilityCount: {
          $sum: { $cond: [{ $eq: ['$type', 'facility'] }, 1, 0] }
        },
        safetyCount: {
          $sum: { $cond: [{ $eq: ['$type', 'safety'] }, 1, 0] }
        }
      })
      .sort({ count: -1 })
      .limit(limit)
      .end()
    
    // 计算友好指数
    const result = (res.list || []).map(item => {
      const total = item.count || 0
      // 算法：居住POI * 2 + 设施POI * 1.5 - 安全事件 * 1
      // 归一化到 0-100 分
      let score = 50 // 基础分
      if (total > 0) {
        score = Math.min(100, Math.round(
          50 + (item.livingCount * 2 + item.facilityCount * 1.5) / total * 25
        ))
      }
      
      return {
        city: item._id || '未知',
        score: score,
        livingCount: item.livingCount || 0,
        facilityCount: item.facilityCount || 0,
        safetyCount: item.safetyCount || 0,
        total: total
      }
    })
    
    return {
      code: 0,
      data: result,
      updateTime: new Date()
    }
    
  } catch (err) {
    console.error('计算城市排名失败:', err)
    return {
      code: -1,
      message: '计算城市排名失败',
      error: err.message,
      data: []
    }
  }
}