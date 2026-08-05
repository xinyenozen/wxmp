// pages/policy/compare/index.js
import { getPolicyData, getPolicyCityList } from '../../../utils/mockPolicyData.js';

Page({
  data: {
    selectedCities: [],       // 选中的城市名列表
    cityPolicyList: [],       // 城市+政策数据对象列表 [{ city, policy }]
    availableCities: [],      // 可添加的城市列表
    showPicker: false,
    loading: true
  },

  onLoad() {
    // 先设置一个空状态，避免初始渲染数据不完整
    this.setData({ loading: true });
    // 使用 wx.nextTick 延迟数据加载，确保渲染层就绪
    wx.nextTick(() => {
      this.initData();
    });
  },

  initData() {
    const allCities = getPolicyCityList();
    // 默认选中两个城市（优先北京、上海）
    let defaultSelected = [];
    if (allCities.includes('北京')) defaultSelected.push('北京');
    if (allCities.includes('上海')) defaultSelected.push('上海');
    if (defaultSelected.length < 2) {
      defaultSelected = allCities.slice(0, 2);
    }
    // 构建 policy 数据列表
    const policyList = defaultSelected.map(city => ({
      city,
      policy: getPolicyData(city) || { 
        summary: '无数据', 
        bannedBreeds: [], 
        restrictedAreas: '无', 
        fee: '无', 
        penalty: '无' 
      }
    }));
    const available = allCities.filter(c => !defaultSelected.includes(c));

    this.setData({
      selectedCities: defaultSelected,
      cityPolicyList: policyList,
      availableCities: available,
      loading: false
    });
  },

  // 重新构建 cityPolicyList
  updatePolicyList() {
    const list = this.data.selectedCities.map(city => ({
      city,
      policy: getPolicyData(city) || { 
        summary: '无数据', 
        bannedBreeds: [], 
        restrictedAreas: '无', 
        fee: '无', 
        penalty: '无' 
      }
    }));
    this.setData({ cityPolicyList: list });
  },

  updateAvailableCities() {
    const allCities = getPolicyCityList();
    const available = allCities.filter(c => !this.data.selectedCities.includes(c));
    this.setData({ availableCities: available });
  },

  showCityPicker() {
    if (this.data.selectedCities.length >= 4) {
      wx.showToast({ title: '最多对比4个城市', icon: 'none' });
      return;
    }
    this.updateAvailableCities();
    this.setData({ showPicker: true });
  },

  closePicker() {
    this.setData({ showPicker: false });
  },

  stopPropagation() {},

  addCity(e) {
    const city = e.currentTarget.dataset.city;
    let selected = this.data.selectedCities;
    if (selected.includes(city)) {
      wx.showToast({ title: '已添加该城市', icon: 'none' });
      return;
    }
    if (selected.length >= 4) {
      wx.showToast({ title: '最多对比4个城市', icon: 'none' });
      return;
    }
    selected = selected.concat([city]);
    this.setData({ 
      selectedCities: selected,
      showPicker: false
    }, () => {
      this.updatePolicyList();
      this.updateAvailableCities();
    });
  },

  removeCity(e) {
    const city = e.currentTarget.dataset.city;
    let selected = this.data.selectedCities;
    if (selected.length <= 2) {
      wx.showToast({ title: '至少保留2个城市', icon: 'none' });
      return;
    }
    selected = selected.filter(c => c !== city);
    this.setData({ selectedCities: selected }, () => {
      this.updatePolicyList();
      this.updateAvailableCities();
    });
  },

  shareCompare() {
    wx.showToast({ title: '分享功能开发中', icon: 'none' });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});