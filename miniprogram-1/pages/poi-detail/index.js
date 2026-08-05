// pages/poi-detail/index.js
// pages/poi-detail/index.js
Page({
  data: {
    poi: {},              // POI 数据
    typeLabel: '',        // 类型中文名
    bgColor: '#FF8C42'    // 背景色
  },

  onLoad(options) {
    // 从全局数据获取选中的 POI
    const app = getApp();
    const poi = app.globalData.selectedPOI;
    if (poi) {
      this.setData({ poi });
      this.setTypeStyle(poi.type);
    } else {
      // 没有数据时，显示默认提示
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
      // 延迟返回
      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    }
  },

  setTypeStyle(type) {
    let label = '';
    let color = '#FF8C42';
    switch (type) {
      case 'living':
        label = '🏠 居住友好';
        color = '#4CAF50';
        break;
      case 'facility':
        label = '🏪 便利设施';
        color = '#2196F3';
        break;
      case 'safety':
        label = '⚠️ 安全预警';
        color = '#F44336';
        break;
      default:
        label = '📍 地点';
        color = '#FF8C42';
    }
    this.setData({
      typeLabel: label,
      bgColor: color
    });
  },

  // 导航（调用微信地图）
  onNavigate() {
    const poi = this.data.poi;
    if (!poi.latitude || !poi.longitude) {
      wx.showToast({ title: '地点坐标缺失', icon: 'none' });
      return;
    }
    wx.openLocation({
      latitude: poi.latitude,
      longitude: poi.longitude,
      name: poi.name,
      address: poi.address,
      scale: 16
    });
  },

  // 反馈（跳转发布页，并携带地点信息）
  onFeedback() {
    const poi = this.data.poi;
    // 跳转到发布页，并传递数据（通过URL参数或全局）
    // 这里我们用URL参数，但数据较多，我们只传名称和坐标，描述可以用户填写
    wx.navigateTo({
      url: `/pages/publish/index?name=${encodeURIComponent(poi.name)}&address=${encodeURIComponent(poi.address)}&lat=${poi.latitude}&lng=${poi.longitude}`
    });
  }
});