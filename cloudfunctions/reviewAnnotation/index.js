// cloudfunctions/reviewAnnotation/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

/**
 * 更新用户等级
 */
async function updateUserLevel(openid) {
  try {
    const res = await db.collection('user_stats').where({ _openid: openid }).get()
    if (res.data.length > 0) {
      const stats = res.data[0]
      const newLevel = Math.floor((stats.score || 0) / 100) + 1
      if (newLevel > (stats.level || 1)) {
        await db.collection('user_stats').doc(stats._id).update({
          data: { 
            level: newLevel,
            updateTime: new Date()
          }
        })
      }
    }
  } catch (err) {
    console.error('更新等级失败:', err)
  }
}

/**
 * 审核标注
 */
exports.main = async (event) => {
  const { annotationId, action, adminNote } = event

  // 参数验证
  if (!annotationId) {
    return { code: -1, message: '缺少标注ID' }
  }

  if (!['approve', 'reject', 'controversial'].includes(action)) {
    return { code: -1, message: '无效的操作，请选择：approve / reject / controversial' }
  }

  try {
    const now = new Date()

    // 1. 获取标注信息
    const annoRes = await db.collection('annotations').doc(annotationId).get()
    const annotation = annoRes.data

    if (!annotation) {
      return { code: -1, message: '标注不存在' }
    }

    if (annotation.status !== 'pending') {
      return { 
        code: -1, 
        message: `该标注已处理，当前状态: ${annotation.status}` 
      }
    }

    const statusMap = {
      'approve': 'passed',
      'reject': 'rejected',
      'controversial': 'controversial'
    }

    // 2. 更新标注状态
    await db.collection('annotations').doc(annotationId).update({
      data: {
        status: statusMap[action],
        adminNote: adminNote || '',
        reviewTime: now,
        updateTime: now
      }
    })

    // 3. 根据操作执行不同逻辑
    if (action === 'approve') {
      // ===== 审核通过：创建或更新 POI =====

      // 检查是否已存在同名 POI
      const existRes = await db.collection('poi_places')
        .where({
          name: annotation.name,
          latitude: _.eq(annotation.latitude),
          longitude: _.eq(annotation.longitude)
        })
        .get()

      if (existRes.data.length > 0) {
        // 更新已有 POI
        const existPOI = existRes.data[0]
        await db.collection('poi_places').doc(existPOI._id).update({
          data: {
            complaintCount: _.inc(1),
            updateTime: now
          }
        })
      } else {
        // 创建新 POI
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

        // 类型特定字段
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

      // 更新用户：积分 +10，标注数 +1，待审核 -1
      await db.collection('user_stats')
        .where({ _openid: annotation.submitterId })
        .update({
          data: {
            score: _.inc(10),
            annotations: _.inc(1),
            pendingCount: _.inc(-1),
            updateTime: now
          }
        })

      await updateUserLevel(annotation.submitterId)

      return {
        code: 0,
        message: '审核通过，POI 已创建/更新，用户 +10 积分'
      }

    } else if (action === 'reject') {
      // ===== 审核驳回 =====

      // 用户待审核 -1
      await db.collection('user_stats')
        .where({ _openid: annotation.submitterId })
        .update({
          data: {
            pendingCount: _.inc(-1),
            updateTime: now
          }
        })

      return {
        code: 0,
        message: '审核驳回'
      }

    } else if (action === 'controversial') {
      // ===== 标记争议 =====

      // 不扣减积分，标记为争议状态，管理员后续处理
      return {
        code: 0,
        message: '已标记为争议，等待进一步核实'
      }
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