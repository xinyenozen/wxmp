// cloudfunctions/getPOIs/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { city, type, latitude, longitude, radius, limit } = event
  
  try {
    let query = db.collection('poi_places')
    let condition = {}
    
    if (city) condition.city = city
    if (type) condition.type = type
    
    if (latitude && longitude) {
      const res = await db.collection('poi_places')
        .aggregate()
        .geoNear({
          near: db.Geo.Point(longitude, latitude),
          distanceField: 'distance',
          maxDistance: radius || 5000,
          spherical: true
        })
        .match(condition)
        .limit(limit || 100)
        .end()
      
      return {
        code: 0,
        data: res.list || []
      }
    }
    
    const res = await query.where(condition).limit(limit || 100).get()
    
    return {
      code: 0,
      data: res.data || []
    }
    
  } catch (err) {
    console.error('获取POI失败:', err)
    return {
      code: -1,
      message: '获取POI失败',
      error: err.message,
      data: []
    }
  }
}