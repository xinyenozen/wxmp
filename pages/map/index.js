// 引入模拟数据
// pages/map/index.js
const app = getApp();

Page({
  data: {
    centerLongitude: 116.397428,
    centerLatitude: 39.90923,
    scale: 14,
    showLocation: true,
    currentCity: '北京',
    cityList: [],
    currentLayer: 'living',
    markers: [],
    loading: false
  },

  onLoad() {
    this.loadCityList();
  },

  async loadCityList() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getPolicies',
        data: { petType: '犬' }
      });
      
      if (res.result && res.result.code === 0) {
        const data = res.result.data || [];
        const cities = [...new Set(data.map(item => item.city).filter(Boolean))];
        if (cities.length > 0) {
          this.setData({ cityList: cities });
          const lastCity = wx.getStorageSync('currentMapCity');
          const targetCity = (lastCity && cities.includes(lastCity)) ? lastCity : cities[0];
          this.setData({ currentCity: targetCity });
          this.loadPOIForCity(targetCity);
          return;
        }
      }
      // 后备城市列表
      this.setData({ cityList: ['北京', '上海', '广州', '成都', '深圳'] });
      this.loadPOIForCity('北京');
    } catch (err) {
      console.error('加载城市列表失败:', err);
      this.setData({ cityList: ['北京', '上海', '广州', '成都', '深圳'] });
      this.loadPOIForCity('北京');
    }
  },

  async loadPOIForCity(city) {
    if (!city || this.data.loading) return;
    this.setData({ loading: true });
    
    try {
      const layer = this.data.currentLayer;
      let res;
      
      if (layer === 'safety') {
        res = await wx.cloud.callFunction({
          name: 'getSafetyEvents',
          data: { city: city, limit: 100 }
        });
      } else {
        res = await wx.cloud.callFunction({
          name: 'getPOIs',
          data: { city: city, type: layer, limit: 100 }
        });
      }
      
      if (res.result && res.result.code === 0) {
        const data = res.result.data || [];
        const markers = this.convertToMarkers(data, layer);
        this.setData({ markers: markers });
        if (city !== this.data.currentCity) {
          this.setData({ currentCity: city });
          wx.setStorageSync('currentMapCity', city);
        }
      } else {
        wx.showToast({ title: res.result?.message || '加载数据失败', icon: 'none' });
        this.setData({ markers: [] });
      }
    } catch (err) {
      console.error('加载POI失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      this.setData({ markers: [] });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 关键修改：使用 Object.assign 代替扩展运算符
  convertToMarkers(poiList, layer) {
    return poiList.map((item, index) => {
      const name = item.name || item.title || '未命名地点';
      const address = item.address || '';
      const lat = item.latitude || (item.location && item.location.latitude) || 0;
      const lng = item.longitude || (item.location && item.location.longitude) || 0;
      
      return {
        id: item._id || index,
        latitude: lat,
        longitude: lng,
        title: name,
        width: 32,
        height: 32,
        iconPath: '',
        callout: {
          content: name,
          color: '#333',
          fontSize: 13,
          borderRadius: 8,
          bgColor: '#ffffff',
          padding: 6,
          display: 'BYCLICK'
        },
        // 使用 Object.assign 合并对象，避免扩展运算符
        poiData: Object.assign({}, item, {
          name: name,
          address: address,
          latitude: lat,
          longitude: lng,
          type: layer === 'safety' ? 'safety' : (item.type || layer)
        })
      };
    });
  },

  switchLayer(e) {
    const layer = e.currentTarget.dataset.layer;
    if (layer === this.data.currentLayer) return;
    this.setData({ currentLayer: layer });
    this.loadPOIForCity(this.data.currentCity);
  },

  onSelectCity() {
    const cityNames = this.data.cityList;
    if (cityNames.length === 0) {
      wx.showToast({ title: '暂无城市数据', icon: 'none' });
      return;
    }
    wx.showActionSheet({
      itemList: cityNames,
      success: (res) => {
        const selected = cityNames[res.tapIndex];
        if (selected && selected !== this.data.currentCity) {
          this.loadPOIForCity(selected);
        }
      }
    });
  },

  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const markers = this.data.markers;
    const marker = markers.find(m => m.id === markerId);
    if (marker && marker.poiData) {
      app.globalData.selectedPOI = marker.poiData;
      wx.navigateTo({
        url: '/pages/poi-detail/index'
      });
    }
  },

  onRegionChange(e) {
    // 可选
  },

  moveToCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          centerLongitude: res.longitude,
          centerLatitude: res.latitude,
          scale: 15
        });
      },
      fail: () => {
        wx.showToast({ title: '请授权位置权限', icon: 'none' });
      }
    });
  },

  onPublish() {
    const { centerLongitude, centerLatitude } = this.data;
    wx.navigateTo({
      url: `/pages/publish/index?lat=${centerLatitude}&lng=${centerLongitude}`
    });
  }
});