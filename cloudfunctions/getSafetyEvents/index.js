// cloudfunctions/getSafetyEvents/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { city, latitude, longitude, radius, limit } = event
  
  try {
    if (latitude && longitude) {
      const res = await db.collection('safety_events')
        .aggregate()
        .geoNear({
          near: db.Geo.Point(longitude, latitude),
          distanceField: 'distance',
          maxDistance: radius || 3000,
          spherical: true
        })
        .match({
          verifyStatus: '已核实'
        })
        .limit(limit || 50)
        .end()
      
      return {
        code: 0,
        data: res.list || []
      }
    }
    
    let query = db.collection('safety_events')
    if (city) {
      query = query.where({ 
        city: city,
        verifyStatus: '已核实'
      })
    } else {
      query = query.where({ verifyStatus: '已核实' })
    }
    
    const res = await query
      .orderBy('createTime', 'desc')
      .limit(limit || 50)
      .get()
    
    return {
      code: 0,
      data: res.data || []
    }
    
  } catch (err) {
    console.error('获取安全事件失败:', err)
    return {
      code: -1,
      message: '获取安全事件失败',
      error: err.message,
      data: []
    }
  }
}