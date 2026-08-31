// cloudfunctions/reviewCorrection/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { correctionId, action, adminNote } = event
  
  if (!correctionId || !action) {
    return { code: -1, message: '缺少必要参数' }
  }
  
  if (!['approve', 'reject'].includes(action)) {
    return { code: -1, message: '无效的操作' }
  }
  
  try {
    const now = new Date()
    
    // 获取纠错信息
    const corrRes = await db.collection('corrections')
      .doc(correctionId)
      .get()
    
    const correction = corrRes.data
    
    if (!correction) {
      return { code: -1, message: '纠错不存在' }
    }
    
    // 更新状态
    await db.collection('corrections').doc(correctionId).update({
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNote: adminNote || '',
        reviewTime: now,
        updateTime: now
      }
    })
    
    // 如果通过，更新对应的政策数据
    if (action === 'approve') {
      // 根据纠错类型更新政策
      const updateData = {}
      const fieldMap = {
        'breed': 'bannedBreeds',
        'area': 'restrictedAreas',
        'process': 'registerProcess',
        'fee': 'fee',
        'penalty': 'penalty'
      }
      
      const field = fieldMap[correction.type] || 'summary'
      
      // 更新 policies 集合
      await db.collection('policies')
        .where({ city: correction.city })
        .update({
          data: {
            [field]: correction.content,
            updateTime: now
          }
        })
      
      // 给提交者积分奖励 +5
      await db.collection('user_stats')
        .where({ _openid: correction.submitterId })
        .update({
          data: {
            score: _.inc(5),
            pendingCount: _.inc(-1),
            updateTime: now
          }
        })
    }
    
    return {
      code: 0,
      message: '审核完成',
      data: { correctionId, action }
    }
    
  } catch (err) {
    console.error('审核纠错失败:', err)
    return {
      code: -1,
      message: '审核纠错失败',
      error: err.message
    }
  }
}