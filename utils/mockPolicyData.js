// utils/mockPolicyData.js

// 全国主要城市政策数据
const POLICY_DATA = {
  '北京': {
    city: '北京',
    summary: '重点管理区禁养大型犬、烈性犬，五环内禁止饲养',
    bannedBreeds: ['藏獒', '德国牧羊犬', '比特犬', '杜宾犬', '罗威纳犬', '秋田犬', '松狮犬'],
    restrictedAreas: '五环路以内为重点管理区，禁止饲养大型犬（体高超过35cm）',
    registerProcess: '1. 为犬只接种狂犬疫苗并取得免疫证明\n2. 携带免疫证明、养犬人身份证、房产证明或租房合同\n3. 到属地派出所或社区警务站办理登记\n4. 领取养犬登记证和犬牌',
    fee: '重点管理区：第一年1000元，以后每年500元\n一般管理区：第一年100元，以后每年50元',
    penalty: '违规饲养禁养犬：处5000元以上罚款并没收犬只\n未办理登记：处2000元罚款'
  },
  '上海': {
    city: '上海',
    summary: '市内禁养烈性犬，每户限养一只，需植入芯片',
    bannedBreeds: ['藏獒', '比特犬', '杜宾犬', '德国牧羊犬', '罗威纳犬', '斗牛犬'],
    restrictedAreas: '全市范围均需登记，内环以内重点管理',
    registerProcess: '1. 犬只接种狂犬疫苗（须在指定机构）\n2. 植入电子芯片（统一管理）\n3. 通过"一网通办"APP或线下窗口提交申请\n4. 审核通过后领取养犬登记证',
    fee: '内环以内：每年500元\n内环以外：每年300元',
    penalty: '未登记养犬：处1000元以上5000元以下罚款'
  },
  '广州': {
    city: '广州',
    summary: '实行养犬登记制度，市区禁养36种烈性犬',
    bannedBreeds: ['藏獒', '比特犬', '罗威纳犬', '德国牧羊犬', '杜宾犬', '高加索犬', '卡斯罗犬'],
    restrictedAreas: '越秀、荔湾、天河等中心城区为重点管理区',
    registerProcess: '1. 犬只接种狂犬疫苗\n2. 通过"穗好办"APP或到属地派出所申请\n3. 提交养犬人身份证明、住址证明\n4. 领取养犬登记证',
    fee: '重点管理区：每年500元\n一般管理区：每年200元',
    penalty: '未登记饲养：处2000元罚款\n饲养禁养犬：处5000元罚款并没收'
  },
  '成都': {
    city: '成都',
    summary: '绕城高速以内禁养大型犬，实行分区管理',
    bannedBreeds: ['藏獒', '比特犬', '德国牧羊犬', '罗威纳犬', '秋田犬', '松狮犬'],
    restrictedAreas: '绕城高速（G4202）以内为重点管理区',
    registerProcess: '1. 犬只接种疫苗取得免疫证\n2. 通过"天府市民云"APP线上申请\n3. 上传犬只照片、免疫证明、养犬人信息\n4. 审核通过后领取电子养犬登记证',
    fee: '重点管理区：每年300元\n一般管理区：每年100元',
    penalty: '违规饲养禁养犬：处2000元罚款\n未登记：处1000元罚款'
  },
  '深圳': {
    city: '深圳',
    summary: '全市禁养烈性犬，实行免费登记制度',
    bannedBreeds: ['藏獒', '比特犬', '德国牧羊犬', '罗威纳犬', '杜宾犬', '斗牛梗'],
    restrictedAreas: '全市范围均需登记',
    registerProcess: '1. 犬只接种狂犬疫苗\n2. 通过"i深圳"APP或线下服务点申请\n3. 提交养犬人身份证、住址证明、犬只照片\n4. 免费领取养犬登记证',
    fee: '免收登记费（全市统一免费）',
    penalty: '未登记养犬：处500元罚款\n饲养禁养犬：处5000元罚款'
  }
};

// 获取所有城市列表
export function getPolicyCityList() {
  return Object.keys(POLICY_DATA);
}

// 获取指定城市的政策数据
export function getPolicyData(city) {
  return POLICY_DATA[city] || null;
}

// 获取所有城市的政策数据（用于对比）
export function getAllPolicyData() {
  return POLICY_DATA;
}