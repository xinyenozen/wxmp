// pages/annotations/index.js
Page({
  data: {
    list: [],
    pendingCount: 0,
    passedCount: 0,
    rejectedCount: 0,
    showModal: false,
    detailItem: {}
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    // 1. 读取地点标注
    const annotations = wx.getStorageSync('annotations') || [];
    // 2. 读取政策纠错
    const corrections = wx.getStorageSync('corrections') || [];

    // 为标注添加统一字段
    const annotList = annotations.map(item => ({
      ...item,
      itemType: 'annotation',
      typeLabel: this.getTypeLabel(item.type),    // 地点类型
      statusText: this.getStatusText(item.status),
      typeIcon: this.getTypeIcon(item.type),
      displayName: item.name || '未命名地点',
      displayDesc: item.description || '',
      displayAddress: item.address || '',
      displayCity: '',                           // 纠错才用
      displayErrorType: '',                      // 纠错才用
    }));

    // 为纠错添加统一字段
    const correctList = corrections.map(item => {
      // 错误类型映射
      const errorTypeMap = {
        breed: '禁养犬种有误',
        area: '限养区域错误',
        process: '登记流程过时',
        fee: '登记费用不准',
        penalty: '处罚标准有误',
        other: '其他错误'
      };
      return {
        ...item,
        itemType: 'correction',
        typeLabel: '政策纠错',
        statusText: this.getStatusText(item.status),
        typeIcon: '📝',
        displayName: item.city + ' 政策纠错',
        displayDesc: item.content || '',
        displayAddress: errorTypeMap[item.type] || item.type || '未知错误',
        displayCity: item.city,
        displayErrorType: errorTypeMap[item.type] || item.type,
        // 注意：纠错没有图片？但可能有 images 字段，保留
      };
    });

    // 合并并按时间倒序排序
    const all = [...annotList, ...correctList];
    all.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    // 格式化时间
    const formatted = all.map(item => ({
      ...item,
      createTime: this.formatTime(item.createTime)
    }));

    // 统计各种状态
    const pending = formatted.filter(item => item.status === 'pending').length;
    const passed = formatted.filter(item => item.status === 'passed').length;
    const rejected = formatted.filter(item => item.status === 'rejected').length;

    this.setData({
      list: formatted,
      pendingCount: pending,
      passedCount: passed,
      rejectedCount: rejected
    });
  },

  // 辅助方法
  getTypeLabel(type) {
    const map = { living: '居住友好', facility: '便利设施', safety: '安全预警' };
    return map[type] || type;
  },

  getTypeIcon(type) {
    const map = { living: '🏠', facility: '🏪', safety: '⚠️' };
    return map[type] || '📍';
  },

  getStatusText(status) {
    const map = { pending: '待审核', passed: '已通过', rejected: '已驳回' };
    return map[status] || '未知';
  },

  formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  // 查看详情
  viewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.list[index];
    if (item) {
      this.setData({
        showModal: true,
        detailItem: item
      });
    }
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  stopPropagation() {},

  goToMap() {
    wx.switchTab({ url: '/pages/map/index' });
  }
});