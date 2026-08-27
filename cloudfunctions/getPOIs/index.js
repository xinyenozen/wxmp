// cloudfunctions/getPOIs/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { 
    city, 
    type, 
    keyword,
    latitude, 
    longitude, 
    radius = 5000,
    page = 1,
    pageSize = 20
  } = event
  
  try {
    let query = db.collection('poi_places')
    let condition = {}
    
    // 按城市筛选
    if (city) condition.city = city
    
    // 按类型筛选
    if (type) condition.type = type
    
    // 关键字搜索（名称或地址）
    if (keyword) {
      const res = await query
        .where({
          ...condition,
          $or: [
            { name: db.RegExp({ regexp: keyword, options: 'i' }) },
            { address: db.RegExp({ regexp: keyword, options: 'i' }) }
          ]
        })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
      
      return {
        code: 0,
        data: res.data || [],
        pagination: {
          page: page,
          pageSize: pageSize,
          total: res.data.length
        }
      }
    }
    
    // 地理位置查询（附近搜索）
    if (latitude && longitude) {
      const res = await db.collection('poi_places')
        .aggregate()
        .geoNear({
          near: db.Geo.Point(longitude, latitude),
          distanceField: 'distance',
          maxDistance: radius,
          spherical: true
        })
        .match(condition)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .end()
      
      return {
        code: 0,
        data: res.list || [],
        pagination: {
          page: page,
          pageSize: pageSize,
          total: res.list.length
        }
      }
    }
    
    // 普通查询
    const res = await query
      .where(condition)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    return {
      code: 0,
      data: res.data || [],
      pagination: {
        page: page,
        pageSize: pageSize,
        total: res.data.length
      }
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