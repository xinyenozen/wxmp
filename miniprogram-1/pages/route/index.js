// pages/route/index.js
// pages/route/index.js
import { DOG_BREEDS, CAT_BREEDS, generateRoutePlan } from '../../utils/mockRouteData.js';

Page({
  data: {
    startCity: '',        // 起点城市
    endCity: '',          // 终点城市
    petType: '',          // '狗' 或 '猫'
    breed: '',            // 品种
    breedList: [],        // 当前宠物对应的品种列表
    // 用于城市选择回调标识
    selecting: ''         // 'start' 或 'end'
  },

  onLoad() {
    // 可以加载默认值等
  },

  // 选择起点城市
  selectStartCity() {
    this.setData({ selecting: 'start' });
    wx.navigateTo({
      url: '/pages/city-select/index'
    });
  },

  // 选择终点城市
  selectEndCity() {
    this.setData({ selecting: 'end' });
    wx.navigateTo({
      url: '/pages/city-select/index'
    });
  },

  // 城市选择页回调（通过 setCity 方法）
  setCity(cityName) {
    if (this.data.selecting === 'start') {
      this.setData({ startCity: cityName, selecting: '' });
    } else if (this.data.selecting === 'end') {
      this.setData({ endCity: cityName, selecting: '' });
    }
  },

  // 选择宠物类型
  selectPetType(e) {
    const type = e.currentTarget.dataset.type;
    const breedList = type === '狗' ? DOG_BREEDS : CAT_BREEDS;
    this.setData({
      petType: type,
      breedList: breedList,
      breed: '' // 清空之前选择的品种
    });
  },

  // 品种选择
  onBreedChange(e) {
    const index = e.detail.value;
    const breed = this.data.breedList[index];
    this.setData({ breed });
  },

  // 生成路线
  generateRoute() {
    const { startCity, endCity, petType, breed } = this.data;
    // 验证
    if (!startCity || !endCity) {
      wx.showToast({ title: '请选择出发和目的城市', icon: 'none' });
      return;
    }
    if (startCity === endCity) {
      wx.showToast({ title: '出发地和目的地不能相同', icon: 'none' });
      return;
    }
    if (!petType) {
      wx.showToast({ title: '请选择宠物类型', icon: 'none' });
      return;
    }
    if (!breed) {
      wx.showToast({ title: '请选择品种', icon: 'none' });
      return;
    }

    // 生成方案
    const plan = generateRoutePlan(startCity, endCity, petType, breed);
    // 携带参数跳转到结果页
    const params = {
      from: startCity,
      to: endCity,
      petType,
      breed,
      transport: plan.transport,
      health: plan.healthCheck,
      stay: plan.stayRules,
      waypoints: plan.waypoints
    };
    // 通过全局或URL传参（数据较多，建议用全局）
    const app = getApp();
    app.globalData.routePlan = params;
    wx.navigateTo({
      url: '/pages/route/result/index'
    });
  }
});