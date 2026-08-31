// cloudfunctions/fixPOIData/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  try {
    const res = await db.collection('poi_places').get()
    const data = res.data || []
    let fixedCount = 0

    for (const item of data) {
      const lat = Number(item.latitude)
      const lng = Number(item.longitude)
      
      if (lat && lng) {
        // ⭐ 确保 location 字段是微信云开发支持的格式
        await db.collection('poi_places').doc(item._id).update({
          data: {
            location: {
              type: 'Point',
              coordinates: [lng, lat]  // [经度, 纬度]
            }
          }
        })
        fixedCount++
      }
    }

    return { 
      code: 0, 
      message: `修复完成，共更新 ${fixedCount} 条数据`
    }
    
  } catch (err) {
    return { 
      code: -1, 
      message: err.message 
    }
  }
}