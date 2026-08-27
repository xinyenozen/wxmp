// cloudfunctions/getPolicies/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { cities, petType = '犬' } = event
  
  try {
    let query = db.collection('policies')
    
    if (cities && cities.length > 0) {
      query = query.where({
        city: db.command.in(cities),
        petType: petType
      })
    } else {
      // 获取所有城市
      const allRes = await db.collection('policies')
        .where({ petType: petType })
        .get()
      
      return {
        code: 0,
        data: allRes.data || []
      }
    }
    
    const res = await query.get()
    
    return {
      code: 0,
      data: res.data || []
    }
    
  } catch (err) {
    console.error('获取政策列表失败:', err)
    return {
      code: -1,
      message: '获取政策列表失败',
      error: err.message,
      data: []
    }
  }
}