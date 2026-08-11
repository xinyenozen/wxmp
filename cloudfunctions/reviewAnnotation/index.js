// cloudfunctions/reviewAnnotation/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

async function updateUserLevel(openid) {
  const statsRes = await db.collection('user_stats').where({ _openid: openid }).get()
  if (statsRes.data.length > 0) {
    const stats = statsRes.data[0]
    const newLevel = Math.floor(stats.score / 100) + 1
    if (newLevel > stats.level) {
      await db.collection('user_stats').doc(stats._id).update({
        data: { level: newLevel }
      })
    }
  }
}

exports.main = async (event) => {
  const { annotationId, action, adminNote } = event
  
  if (!annotationId || !action) {
    return { code: -1, message: '缺少必要参数' }
  }
  
  if (!['pass', 'reject', 'controversial'].includes(action)) {
    return { code: -1, message: '无效的操作' }
  }
  
  try {
    const now = new Date()
    const annoRes = await db.collection('annotations').doc(annotationId).get()
    const annotation = annoRes.data
    
    if (!annotation) {
      return { code: -1, message: '标注不存在' }
    }
    
    const statusMap = {
      'pass': 'passed',
      'reject': 'rejected',
      'controversial': 'controversial'
    }
    const newStatus = statusMap[action]
    
    await db.collection('annotations').doc(annotationId).update({
      data: {
        status: newStatus,
        adminNote: adminNote || '',
        updateTime: now
      }
    })
    
    if (action === 'pass') {
      const existPOI = await db.collection('poi_places')
        .where({
          name: annotation.name,
          latitude: _.eq(annotation.latitude),
          longitude: _.eq(annotation.longitude)
        })
        .get()
      
      if (existPOI.data.length > 0) {
        await db.collection('poi_places').doc(existPOI.data[0]._id).update({
          data: {
            complaintCount: _.inc(1),
            updateTime: now
          }
        })
      } else {
        const poiData = {
          type: annotation.type,
          name: annotation.name,
          address: annotation.address,
          latitude: annotation.latitude,
          longitude: annotation.longitude,
          city: annotation.city || '',
          tags: annotation.tags || [],
          description: annotation.description || '',
          images: annotation.images || [],
          complaintCount: 0,
          isOfficial: false,
          verifiedBy: [annotationId],
          submitterId: annotation.submitterId,
          createTime: now,
          updateTime: now
        }
        
        if (annotation.type === 'living') {
          poiData.petAllowed = true
          poiData.score = 3.0
        } else if (annotation.type === 'facility') {
          poiData.openTime = ''
          poiData.phone = ''
        } else if (annotation.type === 'safety') {
          poiData.verifyStatus = '待核实'
        }
        
        await db.collection('poi_places').add({ data: poiData })
      }
      
      await db.collection('user_stats').where({ _openid: annotation.submitterId }).update({
        data: {
          score: _.inc(5),
          annotations: _.inc(1),
          pendingCount: _.inc(-1),
          updateTime: now
        }
      })
      await updateUserLevel(annotation.submitterId)
      
    } else if (action === 'reject') {
      await db.collection('user_stats').where({ _openid: annotation.submitterId }).update({
        data: {
          pendingCount: _.inc(-1),
          updateTime: now
        }
      })
    }
    
    return {
      code: 0,
      message: '审核完成'
    }
    
  } catch (err) {
    console.error('审核失败:', err)
    return {
      code: -1,
      message: '审核失败',
      error: err.message
    }
  }
}