// 引入模拟数据
import { getPOIData, getCityList } from '../../utils/mockData';
const app = getApp();
Page({
  data: {
    // 地图状态
    centerLongitude: 116.397428,
    centerLatitude: 39.90923,
    scale: 14,
    showLocation: true,
    
    // 当前城市
    currentCity: '北京',
    cityList: [],
    
    // 图层: 'living' | 'facility' | 'safety'
    currentLayer: 'living',
    
    // 标记点
    markers: [],
    
    // 所有POI数据（按城市+图层缓存）
    allPOIData: {}
  },

  onLoad() {
    // 初始化城市列表
    const cities = getCityList();
    this.setData({ cityList: cities });
    
    // 加载当前城市的POI数据
    this.loadPOIForCity(this.data.currentCity);
  },

  /**
   * 加载指定城市的POI数据
   */
  loadPOIForCity(city) {
    const data = getPOIData(city);
    const cacheKey = `${city}_${this.data.currentLayer}`;
    
    // 按当前图层筛选
    const layerData = data.filter(item => item.type === this.data.currentLayer);
    
    // 转换为地图markers格式
    const markers = this.convertToMarkers(layerData);
    
    this.setData({
      allPOIData: data,
      markers: markers
    });
  },

  /**
   * 将POI数据转换为微信地图markers格式
   */
  convertToMarkers(poiList) {
    // 图层对应的图标颜色
    const colorMap = {
      living: '#4CAF50',    // 绿色
      facility: '#2196F3',  // 蓝色
      safety: '#F44336'     // 红色
    };
    const color = colorMap[this.data.currentLayer] || '#FF8C42';

    return poiList.map((item, index) => ({
      id: item.id || index,
      latitude: item.latitude,
      longitude: item.longitude,
      title: item.name,
      width: 32,
      height: 32,
      // 使用自定义图标（也可使用iconPath指定图片）
      iconPath: this.getMarkerIcon(item.type, item),
      // 气泡标注（简版）
      callout: {
        content: item.name,
        color: '#333',
        fontSize: 13,
        borderRadius: 8,
        bgColor: '#ffffff',
        padding: 6,
        display: 'BYCLICK'  // 点击才显示
      },
      // 自定义扩展数据（用于点击回调）
      poiData: item
    }));
  },

  /**
   * 获取标记点图标（纯色圆点+字母，无需图片资源）
   */
  getMarkerIcon(type, item) {
    // 如果项目有图片资源，可返回图片路径，如：'/images/marker-living.png'
    // 这里返回空字符串，使用微信默认标记样式 + callout展示信息
    return '';
  },

  /**
   * 切换图层
   */
  switchLayer(e) {
    const layer = e.currentTarget.dataset.layer;
    this.setData({ currentLayer: layer });
    this.loadPOIForCity(this.data.currentCity);
  },

  /**
   * 选择城市
   */
  onSelectCity() {
    // 使用微信内置的picker或者自定义城市选择页
    // 简化版：使用showActionSheet选择
    const cityNames = this.data.cityList.map(c => c.name);
    wx.showActionSheet({
      itemList: cityNames,
      success: (res) => {
        const selected = this.data.cityList[res.tapIndex];
        this.setData({ currentCity: selected.name });
        // 移动地图到该城市中心
        this.setData({
          centerLongitude: selected.longitude,
          centerLatitude: selected.latitude
        });
        this.loadPOIForCity(selected.name);
      }
    });
  },

  /**
   * 点击标记点
   */
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const markers = this.data.markers;
    const marker = markers.find(m => m.id === markerId);
    if (marker && marker.poiData) {
      // 存入全局
      app.globalData.selectedPOI = marker.poiData;
      // 跳转到详情页
      wx.navigateTo({
        url: '/pages/poi-detail/index'
      });
    }
  },

  /**
   * 地图区域变化（用于更新视野）
   */
  onRegionChange(e) {
    // 可在此监听地图移动、缩放，用于加载周边数据
    // e.type: 'begin' | 'end'
    if (e.type === 'end') {
      // 地图停止移动后可加载周边POI（如需要）
    }
  },

  /**
   * 定位到当前位置
   */
  moveToCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          centerLongitude: res.longitude,
          centerLatitude: res.latitude,
          scale: 15
        });
        // 可选：加载当前位置周边的POI
        // this.loadNearbyPOI(res.latitude, res.longitude);
      },
      fail: () => {
        wx.showToast({
          title: '请授权位置权限',
          icon: 'none'
        });
      }
    });
  },
  /**
   * 快速标注入口
   */
  onPublish() {
    const { centerLongitude, centerLatitude } = this.data;
    wx.navigateTo({
      url: `/pages/publish/index?lat=${centerLatitude}&lng=${centerLongitude}`
    });
  }
});