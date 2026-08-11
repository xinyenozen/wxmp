// cloudfunctions/submitCorrection/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { city, type, content, images, contact, nickName } = event
  
  if (!city || !type || !content) {
    return { code: -1, message: '请填写完整信息' }
  }
  
  try {
    const now = new Date()
    const correction = {
      city: city,
      type: type,
      content: content,
      images: images || [],
      contact: contact || '',
      status: 'pending',
      submitterId: openid,
      submitterName: nickName || '用户',
      createTime: now,
      updateTime: now
    }
    
    const addRes = await db.collection('corrections').add({ data: correction })
    
    await db.collection('user_stats').where({ _openid: openid }).update({
      data: {
        score: _.inc(5),
        pendingCount: _.inc(1),
        updateTime: now
      }
    })
    
    return {
      code: 0,
      message: '纠错提交成功',
      data: { _id: addRes._id }
    }
    
  } catch (err) {
    console.error('提交纠错失败:', err)
    return {
      code: -1,
      message: '提交失败，请重试',
      error: err.message
    }
  }
}