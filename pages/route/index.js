// pages/route/index.js
// pages/route/index.js
import { DOG_BREEDS, CAT_BREEDS } from '../../utils/mockRouteData.js';

Page({
  data: {
    startCity: '',
    endCity: '',
    petType: '',
    breed: '',
    breedList: [],
    selecting: '',
    loading: false
  },

  onLoad() {
    // 可以从缓存恢复上次选择
    const cached = wx.getStorageSync('routeForm') || {};
    if (cached.startCity) this.setData({ startCity: cached.startCity });
    if (cached.endCity) this.setData({ endCity: cached.endCity });
    if (cached.petType) {
      this.setData({ petType: cached.petType });
      const breedList = cached.petType === '狗' ? DOG_BREEDS : CAT_BREEDS;
      this.setData({ breedList });
    }
    if (cached.breed) this.setData({ breed: cached.breed });
  },

  /**
   * 选择起点城市
   */
  selectStartCity() {
    this.setData({ selecting: 'start' });
    wx.navigateTo({
      url: '/pages/city-select/index'
    });
  },

  /**
   * 选择终点城市
   */
  selectEndCity() {
    this.setData({ selecting: 'end' });
    wx.navigateTo({
      url: '/pages/city-select/index'
    });
  },

  /**
   * 城市选择页回调
   */
  setCity(cityName) {
    if (!cityName) return;
    const key = this.data.selecting;
    if (key === 'start') {
      this.setData({ startCity: cityName, selecting: '' });
    } else if (key === 'end') {
      this.setData({ endCity: cityName, selecting: '' });
    }
    // 保存到缓存
    const cached = wx.getStorageSync('routeForm') || {};
    cached[key === 'start' ? 'startCity' : 'endCity'] = cityName;
    wx.setStorageSync('routeForm', cached);
  },

  /**
   * 选择宠物类型
   */
  selectPetType(e) {
    const type = e.currentTarget.dataset.type;
    const breedList = type === '狗' ? DOG_BREEDS : CAT_BREEDS;
    this.setData({
      petType: type,
      breedList: breedList,
      breed: ''
    });
    const cached = wx.getStorageSync('routeForm') || {};
    cached.petType = type;
    wx.setStorageSync('routeForm', cached);
  },

  /**
   * 品种选择
   */
  onBreedChange(e) {
    const index = e.detail.value;
    const breed = this.data.breedList[index];
    this.setData({ breed });
    const cached = wx.getStorageSync('routeForm') || {};
    cached.breed = breed;
    wx.setStorageSync('routeForm', cached);
  },

  /**
   * 生成迁徙方案（调用云函数）
   */
  async generateRoute() {
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

    this.setData({ loading: true });
    wx.showLoading({ title: '生成路线中...', mask: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'generateRoute',
        data: {
          fromCity: startCity,
          toCity: endCity,
          petType: petType,
          breed: breed
        }
      });

      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        const plan = res.result.data;
        // 存入全局，跳转结果页
        const app = getApp();
        app.globalData.routePlan = plan;
        wx.navigateTo({
          url: '/pages/route/result/index'
        });
      } else {
        wx.showToast({ title: res.result?.message || '生成失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('生成路线失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});