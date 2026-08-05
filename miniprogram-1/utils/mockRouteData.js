// utils/mockRouteData.js

// 狗品种列表（常见）
export const DOG_BREEDS = [
  '金毛', '拉布拉多', '柯基', '泰迪', '比熊', '博美', '雪纳瑞', '柴犬',
  '哈士奇', '阿拉斯加', '萨摩耶', '边境牧羊犬', '德国牧羊犬', '杜宾',
  '罗威纳', '斗牛犬', '松狮', '秋田', '其他'
];

// 猫品种列表
export const CAT_BREEDS = [
  '英短', '美短', '布偶', '暹罗', '加菲', '折耳', '蓝猫', '金吉拉',
  '缅因', '德文', '斯芬克斯', '其他'
];

// 根据出发城市、目的城市、宠物类型生成路线方案
export function generateRoutePlan(from, to, petType, breed) {
  // 根据城市对返回不同方案（简化模拟）
  const plans = {
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
  };

  const key = `${from}-${to}`;
  const defaultPlan = {
    transport: `建议乘坐火车/飞机，宠物需提前办理检疫证明，了解目的城市养犬政策`,
    healthCheck: `狂犬疫苗证明（有效期1年）\n健康体检报告\n根据目的地要求办理检疫证明`,
    stayRules: `抵达${to}后需尽快办理当地养犬登记证，遵守当地限养规定`,
    waypoints: `建议提前联系沿途宠物友好酒店，确认接待政策`
  };

  let plan = plans[key] || defaultPlan;

  // 根据宠物类型微调
  if (petType === '猫') {
    plan.transport += '（猫通常可随身携带，但要符合航司规定）';
  }

  return plan;
}