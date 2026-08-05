// pages/policy/list.js
import { getPolicyCityList, getPolicyData } from '../../utils/mockPolicyData.js';

Page({
  data: {
    currentCity: '北京',
    cityList: [],
    policyData: null,
    // 弹窗
    showDetailModal: false,
    detailTitle: '',
    detailContent: ''
  },

  onLoad() {
    // 获取城市列表
    const cities = getPolicyCityList();
    this.setData({ cityList: cities });
   // 从缓存读取上次选择
   const lastCity = wx.getStorageSync('currentPolicyCity') || '北京';
   this.loadPolicy(lastCity);
  },

  /**
   * 加载指定城市的政策数据
   */
  loadPolicy(city) {
    const data = getPolicyData(city);
    if (data) {
      this.setData({
        currentCity: city,
        policyData: data
      });
      wx.setStorageSync('currentPolicyCity', city);
    } else {
      // 如果没有数据，显示空状态
      this.setData({
        currentCity: city,
        policyData: null
      });
    }
  },

  // 供城市选择页调用的方法
  setCity(cityName) {
    if (cityName && cityName !== this.data.currentCity) {
      this.loadPolicy(cityName);
    }
  },

  // 点击城市选择，跳转到城市选择页
  onSelectCity() {
    wx.navigateTo({
      url: '/pages/city-select/index'
    });
  },

  /**
   * 显示详情弹窗
   */
  showDetail(e) {
    const type = e.currentTarget.dataset.type;
    const data = this.data.policyData;
    if (!data) return;

    let title = '';
    let content = '';

    switch (type) {
      case 'banned':
        title = `🚫 ${data.city}禁养犬种（${data.bannedBreeds.length}种）`;
        content = data.bannedBreeds.join('、');
        break;
      case 'area':
        title = `📍 ${data.city}限养/重点管理区域`;
        content = data.restrictedAreas;
        break;
      case 'process':
        title = `📝 ${data.city}登记流程与费用`;
        content = data.registerProcess + '\n\n💰 费用标准：\n' + data.fee;
        break;
      case 'penalty':
        title = `⚖️ ${data.city}违规处罚标准`;
        content = data.penalty;
        break;
      default:
        return;
    }

    this.setData({
      showDetailModal: true,
      detailTitle: title,
      detailContent: content
    });
  },

  /**
   * 关闭弹窗
   */
  closeModal() {
    this.setData({ showDetailModal: false });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {},

  /**
   * 跳转多城市对比（预留）
   */
  goToCompare() {
    wx.navigateTo({
      url: '/pages/policy/compare/index'
    });
  },

  /**
   * 跳转纠错反馈（预留）
   */
  goToCorrect() {
    const city = this.data.currentCity;
    wx.navigateTo({
      url: `/pages/policy/correct/index?city=${encodeURIComponent(city)}`
    });
  }
});