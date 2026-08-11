// cloudfunctions/updateUserProfile/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { nickName, avatarUrl, city, phone, email } = event
  
  try {
    const now = new Date()
    const updateData = {
      updateTime: now
    }
    
    if (nickName !== undefined) updateData.nickName = nickName
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (city !== undefined) updateData.city = city
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    
    await db.collection('users')
      .where({ _openid: openid })
      .update({ data: updateData })
    
    return {
      code: 0,
      message: '更新成功'
    }
    
  } catch (err) {
    console.error('更新用户资料失败:', err)
    return {
      code: -1,
      message: '更新失败',
      error: err.message
    }
  }
}