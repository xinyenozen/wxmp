// cloudfunctions/generateRoute/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const ROUTE_TEMPLATES = {
  '北京-上海': {
    transport: '推荐高铁（G字头），宠物可办理托运，需提前3天预订',
    healthCheck: '狂犬疫苗免疫证明（有效期1年）\n体内外驱虫证明\n芯片植入记录（建议）',
    stayRules: '上海规定：市内禁养烈性犬，需办理养犬登记证\n建议选择宠物友好酒店，提前确认政策',
    waypoints: '南京、苏州等地有宠物友好服务区，可下车活动'
  },
  '北京-成都': {
    transport: '建议飞机（川航/国航），需办理动物检疫证明，提前联系航司确认有氧舱',
    healthCheck: '有效期内的狂犬疫苗证明\n动物检疫合格证明（出发前7天内办理）\n芯片植入记录',
    stayRules: '成都规定：绕城高速内禁养大型犬，需办理登记证\n住宿建议选择宠物民宿',
    waypoints: '西安中转时需注意当地养犬政策'
  },
  '上海-成都': {
    transport: '高铁（G字头）或飞机，宠物托运需提前联系',
    healthCheck: '狂犬疫苗免疫证明\n芯片植入记录\n健康体检报告（出发前3天）',
    stayRules: '成都重点管理区禁养大型犬，需遵守当地规定',
    waypoints: '沿途可在重庆、宜昌等城市寻找宠物友好住宿'
  }
}

const DEFAULT_PLAN = {
  transport: '建议乘坐火车/飞机，宠物需提前办理检疫证明，了解目的城市养犬政策',
  healthCheck: '狂犬疫苗证明（有效期1年）\n健康体检报告\n根据目的地要求办理检疫证明',
  stayRules: '抵达目的地后需尽快办理当地养犬登记证，遵守当地限养规定',
  waypoints: '建议提前联系沿途宠物友好酒店，确认接待政策'
}

exports.main = async (event) => {
  const { fromCity, toCity, petType, breed } = event
  
  if (!fromCity || !toCity || !petType) {
    return { code: -1, message: '请填写完整信息' }
  }
  
  if (fromCity === toCity) {
    return { code: -1, message: '出发地和目的地不能相同' }
  }
  
  try {
    const templateRes = await db.collection('routes')
      .where({
        fromCity: fromCity,
        toCity: toCity,
        petType: petType
      })
      .get()
    
    let plan
    if (templateRes.data.length > 0) {
      plan = templateRes.data[0]
    } else {
      const key = `${fromCity}-${toCity}`
      plan = ROUTE_TEMPLATES[key] || { ...DEFAULT_PLAN }
    }
    
    let transport = plan.transport || ''
    if (petType === '猫') {
      transport += '（猫通常可随身携带，但要符合航司规定）'
    }
    
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    if (openid) {
      await db.collection('user_stats').where({ _openid: openid }).update({
        data: {
          migrationKits: _.inc(1),
          updateTime: new Date()
        }
      })
    }
    
    return {
      code: 0,
      data: {
        fromCity: fromCity,
        toCity: toCity,
        petType: petType,
        breed: breed || '',
        transport: transport,
        health: plan.healthCheck || '',
        stay: plan.stayRules || '',
        waypoints: plan.waypoints || ''
      }
    }
    
  } catch (err) {
    console.error('生成路线失败:', err)
    return {
      code: -1,
      message: '生成路线失败',
      error: err.message
    }
  }
}