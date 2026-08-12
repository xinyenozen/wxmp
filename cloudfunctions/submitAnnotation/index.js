// cloudfunctions/submitAnnotation/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { 
    type, name, address, latitude, longitude, city,
    description, images, isAnonymous, nickName, tags
  } = event
  
  // 参数验证
  if (!type || !name || !latitude || !longitude) {
    return { code: -1, message: '缺少必要参数' }
  }
  
  try {
    // 1. 创建标注记录
    const now = new Date()
    const annotation = {
      type: type,
      name: name,
      address: address || '',
      latitude: latitude,
      longitude: longitude,
      city: city || '',
      description: description || '',
      images: images || [],
      tags: tags || [],
      status: 'pending',
      voters: [],
      verifyCount: 0,
      isAnonymous: isAnonymous !== false,
      submitterId: openid,
      submitterName: isAnonymous ? '匿名用户' : (nickName || '用户'),
      poiId: null,
      createTime: now,
      updateTime: now
    }
    
    const addRes = await db.collection('annotations').add({ data: annotation })
    
    // 2. 更新用户统计（待审核数+1）
    await db.collection('user_stats').where({ _openid: openid }).update({
      data: {
        pendingCount: _.inc(1),
        updateTime: now
      }
    })
    
    // 3. 触发自动审核（不阻塞返回）
    cloud.callFunction({
      name: 'processVerification',
      data: { annotationId: addRes._id }
    }).catch(err => console.error('自动审核触发失败:', err))
    
    return {
      code: 0,
      message: '标注提交成功，等待审核',
      data: { _id: addRes._id }
    }
    
  } catch (err) {
    console.error('提交标注失败:', err)
    return {
      code: -1,
      message: '提交失败，请重试',
      error: err.message
    }
  }
}