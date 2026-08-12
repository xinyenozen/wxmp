// cloudfunctions/calcFriendlyIndex/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    // 获取所有城市
    const citiesRes = await db.collection('poi_places')
      .aggregate()
      .group({
        _id: '$city',
        count: { $sum: 1 }
      })
      .end()
    
    const cities = citiesRes.list || []
    const results = []
    
    for (const item of cities) {
      const city = item._id
      if (!city) continue
      
      const livingCount = await db.collection('poi_places')
        .where({ city: city, type: 'living' })
        .count()
      
      const facilityCount = await db.collection('poi_places')
        .where({ city: city, type: 'facility' })
        .count()
      
      const safetyCount = await db.collection('poi_places')
        .where({ city: city, type: 'safety' })
        .count()
      
      const total = livingCount.total + facilityCount.total + safetyCount.total
      const score = total > 0 ? Math.min(100, (livingCount.total * 2 + facilityCount.total * 1.5) / total * 50 + 50) : 0
      
      results.push({
        city: city,
        score: Math.round(score * 10) / 10,
        livingCount: livingCount.total,
        facilityCount: facilityCount.total,
        safetyCount: safetyCount.total,
        total: total,
        updateTime: new Date()
      })
    }
    
    // 保存到系统配置集合
    await db.collection('system_config').doc('friendly_index').set({
      data: {
        data: results,
        updateTime: new Date()
      }
    })
    
    return {
      code: 0,
      message: '友好指数计算完成',
      data: results
    }
    
  } catch (err) {
    console.error('计算友好指数失败:', err)
    return {
      code: -1,
      message: '计算失败',
      error: err.message
    }
  }
}