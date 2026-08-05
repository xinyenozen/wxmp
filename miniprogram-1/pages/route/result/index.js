// pages/route/result/index.js
// pages/route/result/index.js
Page({
  data: {
    plan: {
      from: '',
      to: '',
      petType: '',
      breed: '',
      transport: '',
      health: '',
      stay: '',
      waypoints: '',
      healthList: [] // 拆分后的列表
    }
  },

  onLoad() {
    const app = getApp();
    const plan = app.globalData.routePlan;
    if (plan) {
      // 将健康清单拆分为数组
      const healthList = plan.health ? plan.health.split('\n').filter(item => item.trim()) : [];
      this.setData({
        plan: {
          ...plan,
          healthList
        }
      });
    } else {
      wx.showToast({ title: '数据加载失败', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    }
  },

  // 保存为图片（简化为提示）
  saveImage() {
    wx.showToast({ title: '保存功能开发中', icon: 'none' });
  },

  // 返回修改
  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});