// cloudfunctions/getNearbyPOIs/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 计算两点之间的距离（Haversine 公式）
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1000 // 返回米
}

exports.main = async (event) => {
  const { 
    latitude, 
    longitude, 
    radius = 5000, 
    type,
    limit = 50 
  } = event

  const lat = Number(latitude)
  const lng = Number(longitude)

  if (!lat || !lng) {
    return { 
      code: -1, 
      message: '请提供有效的位置信息',
      data: [] 
    }
  }

  try {
    // 1. 获取所有 POI 数据（或按类型过滤）
    let query = db.collection('poi_places')
    if (type) {
      query = query.where({ type: type })
    }
    
    const res = await query.limit(200).get()
    const pois = res.data || []

    // 2. 手动计算距离并过滤
    const nearby = pois
      .map(item => {
        const distance = getDistance(
          lat, lng,
          Number(item.latitude),
          Number(item.longitude)
        )
        return { ...item, distance }
      })
      .filter(item => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)

    return {
      code: 0,
      data: nearby
    }

  } catch (err) {
    console.error('附近搜索失败:', err)
    return {
      code: -1,
      message: '附近搜索失败',
      error: err.message,
      data: []
    }
  }
}