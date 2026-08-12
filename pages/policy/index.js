// pages/policy/list.js
// pages/policy/index.js
Page({
  data: {
    currentCity: '北京',
    cityList: [],
    policyData: null,
    showDetailModal: false,
    detailTitle: '',
    detailContent: '',
    loading: false
  },

  onLoad() {
    this.loadCityList();
  },

  onShow() {
    // 每次显示时刷新当前城市数据（可能从其他页面返回）
    if (this.data.currentCity) {
      this.loadPolicy(this.data.currentCity);
    }
  },

  /**
   * 加载所有城市列表（从数据库获取）
   */
  async loadCityList() {
    try {
      wx.showLoading({ title: '加载中...' });
      const res = await wx.cloud.callFunction({
        name: 'getPolicies',
        data: { petType: '犬' }
      });

      wx.hideLoading();
      if (res.result && res.result.code === 0) {
        const data = res.result.data || [];
        // 提取城市名列表（去重）
        const cities = [...new Set(data.map(item => item.city).filter(Boolean))];
        this.setData({ cityList: cities });

        // 如果有城市列表，默认选中第一个
        if (cities.length > 0) {
          // 从缓存读取上次选中的城市
          const lastCity = wx.getStorageSync('currentPolicyCity');
          const targetCity = (lastCity && cities.includes(lastCity)) ? lastCity : cities[0];
          this.setData({ currentCity: targetCity });
          this.loadPolicy(targetCity);
        } else {
          this.setData({ policyData: null });
        }
      } else {
        wx.showToast({ title: res.result?.message || '加载失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('加载城市列表失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
  },

  /**
   * 加载指定城市的政策数据
   */
  async loadPolicy(city) {
    if (!city) return;
    this.setData({ loading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getPolicy',
        data: { city: city, petType: '犬' }
      });

      if (res.result && res.result.code === 0) {
        const data = res.result.data;
        if (data) {
          this.setData({
            currentCity: city,
            policyData: data
          });
          wx.setStorageSync('currentPolicyCity', city);
        } else {
          // 该城市暂无数据
          this.setData({
            currentCity: city,
            policyData: null
          });
        }
      } else {
        wx.showToast({ title: res.result?.message || '加载失败', icon: 'none' });
        this.setData({ policyData: null });
      }
    } catch (err) {
      console.error('加载政策失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      this.setData({ policyData: null });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 切换城市（城市选择页回调）
   */
  setCity(cityName) {
    if (cityName && cityName !== this.data.currentCity) {
      this.loadPolicy(cityName);
    }
  },

  /**
   * 点击城市选择
   */
  onSelectCity() {
    const cityNames = this.data.cityList;
    if (cityNames.length === 0) {
      wx.showToast({ title: '暂无城市数据', icon: 'none' });
      return;
    }
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
        title = `🚫 ${data.city}禁养犬种（${(data.bannedBreeds || []).length}种）`;
        content = (data.bannedBreeds || []).join('、') || '暂无数据';
        break;
      case 'area':
        title = `📍 ${data.city}限养/重点管理区域`;
        content = data.restrictedAreas || '暂无数据';
        break;
      case 'process':
        title = `📝 ${data.city}登记流程与费用`;
        content = (data.registerProcess || '暂无数据') + '\n\n💰 费用标准：\n' + (data.fee || '暂无数据');
        break;
      case 'penalty':
        title = `⚖️ ${data.city}违规处罚标准`;
        content = data.penalty || '暂无数据';
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

  closeModal() {
    this.setData({ showDetailModal: false });
  },

  stopPropagation() {},

  goToCompare() {
    wx.navigateTo({
      url: '/pages/policy/compare/index'
    });
  },

  goToCorrect() {
    wx.navigateTo({
      url: '/pages/policy/correct/index'
    });
  }
});