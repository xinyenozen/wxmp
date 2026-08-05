/**
 * 模拟POI数据 - 北京
 */
const beijingPOI = {
  living: [
    {
      id: 1,
      name: '望京花园东区',
      address: '朝阳区望京街道',
      latitude: 39.994,
      longitude: 116.481,
      type: 'living',
      tags: ['可养小型犬', '物业友好'],
      petAllowed: true,
      complaintCount: 2,
      score: 4.2
    },
    {
      id: 2,
      name: '回龙观新村',
      address: '昌平区回龙观',
      latitude: 40.071,
      longitude: 116.315,
      type: 'living',
      tags: ['可养大型犬', '有遛宠区'],
      petAllowed: true,
      complaintCount: 5,
      score: 3.8
    },
    {
      id: 3,
      name: '五道口嘉园',
      address: '海淀区五道口',
      latitude: 39.992,
      longitude: 116.338,
      type: 'living',
      tags: ['需物业确认', '近大学'],
      petAllowed: false,
      complaintCount: 8,
      score: 3.0
    }
  ],
  facility: [
    {
      id: 4,
      name: '宠爱国际动物医院(望京店)',
      address: '朝阳区望京SOHO',
      latitude: 39.996,
      longitude: 116.483,
      type: 'facility',
      tags: ['24小时', '急诊'],
      openTime: '24小时'
    },
    {
      id: 5,
      name: '朝阳公园-宠物友好区',
      address: '朝阳区朝阳公园',
      latitude: 39.933,
      longitude: 116.471,
      type: 'facility',
      tags: ['大型公园', '宠物可入'],
      openTime: '06:00-22:00'
    }
  ],
  safety: [
    {
      id: 6,
      name: '⚠️ 某小区投毒事件',
      address: '海淀区中关村附近',
      latitude: 39.982,
      longitude: 116.318,
      type: 'safety',
      tags: ['投毒', '已报警'],
      description: '2026年7月发生宠物投毒事件，请绕行',
      verifyStatus: '已核实'
    }
  ]
};

/**
 * 模拟POI数据 - 成都
 */
const chengduPOI = {
  living: [
    {
      id: 101,
      name: '麓山国际社区',
      address: '天府新区麓山大道',
      latitude: 30.505,
      longitude: 104.085,
      type: 'living',
      tags: ['宠物友好', '高端社区'],
      petAllowed: true,
      complaintCount: 0,
      score: 4.8
    }
  ],
  facility: [
    {
      id: 102,
      name: '瑞鹏宠物医院(高新店)',
      address: '高新区天府大道',
      latitude: 30.568,
      longitude: 104.066,
      type: 'facility',
      tags: ['24小时', '口碑好'],
      openTime: '24小时'
    }
  ],
  safety: []
};

/**
 * 获取城市列表
 */
export function getCityList() {
  return [
    { name: '北京', longitude: 116.397428, latitude: 39.90923 },
    { name: '上海', longitude: 121.472644, latitude: 31.231706 },
    { name: '广州', longitude: 113.264385, latitude: 23.12911 },
    { name: '深圳', longitude: 114.057868, latitude: 22.543099 },
    { name: '成都', longitude: 104.066541, latitude: 30.572269 }
  ];
}

/**
 * 获取指定城市的POI数据
 */
export function getPOIData(city) {
  const map = {
    '北京': beijingPOI,
    '成都': chengduPOI
  };
  // 合并所有图层数据
  const cityData = map[city] || beijingPOI;
  return [
    ...(cityData.living || []),
    ...(cityData.facility || []),
    ...(cityData.safety || [])
  ];
}