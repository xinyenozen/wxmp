// pages/policy/compare/index.js
// pages/compare/index.js
Page({
  data: {
    selectedCities: [],
    cityPolicyList: [],
    availableCities: [],
    loading: false,
    pageReady: false,
    allCities: []
  },

  onLoad() {
    console.log('📄 对比页 onLoad');
    this.loadAllCities();
  },

  async loadAllCities() {
    try {
      this.setData({ loading: true });
      wx.showLoading({ title: '加载城市列表...', mask: true });

      const res = await wx.cloud.callFunction({
        name: 'getPolicies',
        data: { petType: '犬' }
      });

      wx.hideLoading();
      console.log('📥 getPolicies 返回:', res);

      if (res.result && res.result.code === 0) {
        const data = res.result.data || [];
        const cities = [...new Set(data.map(item => item.city).filter(Boolean))];
        console.log('🏙️ 获取到的城市:', cities);

        this.setData({ allCities: cities, pageReady: true });

        // 默认选中两个城市（优先北京、上海）
        let defaultSelected = [];
        if (cities.includes('北京')) defaultSelected.push('北京');
        if (cities.includes('上海')) defaultSelected.push('上海');
        if (defaultSelected.length < 2 && cities.length >= 2) {
          defaultSelected = cities.slice(0, 2);
        } else if (defaultSelected.length < 2 && cities.length === 1) {
          defaultSelected = [cities[0]];
        }

        this.setData({ selectedCities: defaultSelected }, () => {
          this.loadPolicyData(defaultSelected);
        });
      } else {
        wx.showToast({ title: res.result?.message || '加载失败', icon: 'none' });
        this.setData({ pageReady: true });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('❌ loadAllCities 错误:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      this.setData({ pageReady: true });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadPolicyData(cities) {
    if (!cities || cities.length === 0) {
      this.setData({ cityPolicyList: [] });
      return;
    }

    try {
      this.setData({ loading: true });
      wx.showLoading({ title: '加载政策数据...', mask: true });

      const res = await wx.cloud.callFunction({
        name: 'getPolicies',
        data: { cities: cities, petType: '犬' }
      });

      wx.hideLoading();
      console.log('📥 getPolicies(cities) 返回:', res);

      if (res.result && res.result.code === 0) {
        const data = res.result.data || [];
        const policyList = cities.map(city => {
          const found = data.find(item => item.city === city);
          return {
            city: city,
            policy: found || {
              summary: '无数据',
              bannedBreeds: [],
              restrictedAreas: '无',
              fee: '无',
              penalty: '无'
            }
          };
        });
        this.setData({ cityPolicyList: policyList });
      } else {
        wx.showToast({ title: res.result?.message || '加载失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('❌ loadPolicyData 错误:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 城市选择页回调（新增）
  setCity(cityName) {
    if (!cityName) return;
    const selected = this.data.selectedCities;
    if (selected.includes(cityName)) {
      wx.showToast({ title: '已添加该城市', icon: 'none' });
      return;
    }
    if (selected.length >= 4) {
      wx.showToast({ title: '最多对比4个城市', icon: 'none' });
      return;
    }
    const newSelected = selected.concat([cityName]);
    this.setData({ selectedCities: newSelected }, () => {
      this.loadPolicyData(newSelected);
    });
  },

  // 点击“添加城市”跳转到全国城市选择页
  showCityPicker() {
    if (this.data.selectedCities.length >= 4) {
      wx.showToast({ title: '最多对比4个城市', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/city-select/index'
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
      this.loadPolicyData(selected);
    });
  },

  shareCompare() {
    wx.showToast({ title: '分享功能开发中', icon: 'none' });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});