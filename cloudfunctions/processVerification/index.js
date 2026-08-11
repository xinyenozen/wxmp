// cloudfunctions/processVerification/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 更新用户等级
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
  const { annotationId } = event
  
  try {
    // 获取标注信息
    const annoRes = await db.collection('annotations').doc(annotationId).get()
    const annotation = annoRes.data
    
    if (!annotation || annotation.status !== 'pending') {
      return { code: 0, message: '标注已处理或不存在' }
    }
    
    // 查询同POI、同内容、状态为pending的标注
    const similar = await db.collection('annotations')
      .where({
        name: annotation.name,
        address: annotation.address,
        latitude: _.eq(annotation.latitude),
        longitude: _.eq(annotation.longitude),
        status: 'pending'
      })
      .get()
    
    const similarList = similar.data || []
    
    // 如果相似标注数 >= 3（包含当前标注），自动通过
    if (similarList.length >= 3) {
      // 批量更新状态为通过
      const ids = similarList.map(item => item._id)
      await db.collection('annotations')
        .where({ _id: _.in(ids) })
        .update({
          data: {
            status: 'passed',
            updateTime: new Date()
          }
        })
      
      // 将第一个标注作为POI数据
      const first = similarList[0]
      
      // 检查是否已存在同名POI
      const existPOI = await db.collection('poi_places')
        .where({
          name: first.name,
          latitude: _.eq(first.latitude),
          longitude: _.eq(first.longitude)
        })
        .get()
      
      let poiId
      if (existPOI.data.length > 0) {
        poiId = existPOI.data[0]._id
        await db.collection('poi_places').doc(poiId).update({
          data: {
            complaintCount: _.inc(1),
            updateTime: new Date()
          }
        })
      } else {
        const poiData = {
          type: first.type,
          name: first.name,
          address: first.address,
          latitude: first.latitude,
          longitude: first.longitude,
          city: first.city || '',
          tags: first.tags || [],
          description: first.description || '',
          images: first.images || [],
          complaintCount: 0,
          isOfficial: false,
          verifiedBy: ids,
          submitterId: first.submitterId,
          createTime: new Date(),
          updateTime: new Date()
        }
        
        if (first.type === 'living') {
          poiData.petAllowed = true
          poiData.score = 3.0
        } else if (first.type === 'facility') {
          poiData.openTime = ''
          poiData.phone = ''
        } else if (first.type === 'safety') {
          poiData.verifyStatus = '待核实'
        }
        
        const poiRes = await db.collection('poi_places').add({ data: poiData })
        poiId = poiRes._id
      }
      
      // 关联标注到POI
      await db.collection('annotations')
        .where({ _id: _.in(ids) })
        .update({
          data: { poiId: poiId }
        })
      
      // 为每个提交者增加积分（+5）
      const submitters = [...new Set(similarList.map(item => item.submitterId))]
      for (const uid of submitters) {
        await db.collection('user_stats').where({ _openid: uid }).update({
          data: {
            score: _.inc(5),
            annotations: _.inc(1),
            pendingCount: _.inc(-1),
            updateTime: new Date()
          }
        })
        await updateUserLevel(uid)
      }
      
      return {
        code: 0,
        message: '三人一致，自动通过',
        passedCount: similarList.length,
        poiId: poiId
      }
    }
    
    return {
      code: 0,
      message: '等待更多人标注，当前' + similarList.length + '人',
      currentCount: similarList.length
    }
    
  } catch (err) {
    console.error('审核处理失败:', err)
    return {
      code: -1,
      message: '审核处理失败',
      error: err.message
    }
  }
}