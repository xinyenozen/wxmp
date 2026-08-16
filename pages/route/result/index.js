// pages/route/result/index.js
// pages/route/result/index.js
Page({
  data: {
    plan: {
      fromCity: '',
      toCity: '',
      petType: '',
      breed: '',
      transport: '',
      health: '',
      stay: '',
      waypoints: '',
      healthList: []
    },
    loading: true
  },

  onLoad() {
    const app = getApp();
    const plan = app.globalData.routePlan;

    if (plan && plan.fromCity) {
      // 将健康清单拆分为数组
      const healthList = plan.health ? plan.health.split('\n').filter(item => item.trim()) : [];
      this.setData({
        plan: {
          ...plan,
          healthList
        },
        loading: false
      });
    } else {
      // 如果没有数据，尝试从缓存读取
      const cached = wx.getStorageSync('lastRoutePlan');
      if (cached && cached.fromCity) {
        const healthList = cached.health ? cached.health.split('\n').filter(item => item.trim()) : [];
        this.setData({
          plan: {
            ...cached,
            healthList
          },
          loading: false
        });
      } else {
        wx.showToast({ title: '数据加载失败', icon: 'none' });
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      }
    }
  },

  /**
   * 保存为图片（使用 Canvas 生成）
   */
  async saveImage() {
    wx.showLoading({ title: '生成中...', mask: true });
    try {
      // 这里简化处理，实际可使用 Canvas 绘制
      wx.hideLoading();
      wx.showToast({ title: '保存功能开发中', icon: 'none' });
    } catch (err) {
      wx.hideLoading();
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  /**
   * 返回修改
   */
  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    const plan = this.data.plan;
    return {
      title: `🧳 ${plan.fromCity} → ${plan.toCity} 迁徙方案`,
      path: '/pages/route/index',
      imageUrl: ''
    };
  }
});