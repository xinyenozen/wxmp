// cloudfunctions/getPolicy/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { city, petType = '犬' } = event
  
  if (!city) {
    return { code: -1, message: '请指定城市' }
  }
  
  try {
    const res = await db.collection('policies')
      .where({
        city: city,
        petType: petType
      })
      .get()
    
    if (res.data.length > 0) {
      const data = res.data[0]
      // 确保字段安全
      return {
        code: 0,
        data: {
          ...data,
          bannedBreeds: data.bannedBreeds || [],
          restrictedAreas: data.restrictedAreas || '暂无数据',
          registerProcess: data.registerProcess || '暂无数据',
          fee: data.fee || '暂无数据',
          penalty: data.penalty || '暂无数据'
        }
      }
    }
    
    return {
      code: 0,
      data: null,
      message: '该城市暂无政策数据'
    }
    
  } catch (err) {
    console.error('获取政策失败:', err)
    return {
      code: -1,
      message: '获取政策失败',
      error: err.message
    }
  }
}