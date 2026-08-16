// pages/login/index.js
// pages/login/index.js
Page({
  data: {
    loading: false,
    adminLoading: false,
    showAdminLogin: false,
    adminAccount: '',
    adminPassword: '',
    // 用于触发管理员登录入口的点击计数
    logoClickCount: 0
  },

  onLoad() {
    // 检查是否已登录（可跳过登录页，但为了演示，不自动跳转）
    // 因为可能从其他页面退出登录回到这里
    const token = wx.getStorageSync('userToken');
    if (token) {
      // 已登录直接跳转主页
      wx.reLaunch({ url: '/pages/map/index' });
    }
  },

  /**
   * 微信一键登录
   */
  async handleWechatLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      // 1. 调用 wx.login 获取 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });
      const { code } = loginRes;

      // 2. 调用 login 云函数
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: { code }
      });

      if (res.result && res.result.code === 0) {
        const { token, userInfo, stats } = res.result.data;
        // 存储登录信息
        wx.setStorageSync('userToken', token);
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('userStats', stats);

        // 更新全局数据（可选）
        const app = getApp();
        app.globalData.userInfo = userInfo;
        app.globalData.isAdmin = userInfo.isAdmin || false;

        wx.showToast({ title: '登录成功', icon: 'success' });
        // 跳转到主页
        wx.reLaunch({ url: '/pages/map/index' });
      } else {
        wx.showToast({ title: res.result.message || '登录失败', icon: 'none' });
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 管理员登录（模拟，实际应调用后端接口验证）
   */
  async handleWechatLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });
  
    try {
      // 1. 获取 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });
      const { code } = loginRes;
  
      // 2. 调用云函数
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: { code }
      });
  
      console.log('云函数返回结果:', res);  // ✅ 打印完整返回，便于调试
  
      // ⚠️ 关键：先判断 code 是否为 0
      if (res.result && res.result.code === 0) {
        const { token, userInfo, stats } = res.result.data;
  
        // 保存登录信息
        wx.setStorageSync('userToken', token);
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('userStats', stats);
  
        const app = getApp();
        app.globalData.userInfo = userInfo;
        app.globalData.isAdmin = userInfo.isAdmin || false;
  
        wx.showToast({ title: '登录成功', icon: 'success' });
        wx.reLaunch({ url: '/pages/map/index' });
      } else {
        // 云函数返回了错误信息
        const errMsg = res.result?.message || '登录失败，请重试';
        wx.showToast({ title: errMsg, icon: 'none' });
      }
    } catch (err) {
      console.error('登录异常:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 切换管理员登录表单（普通用户通过点击“管理员登录”触发）
   */
  toggleAdminLogin() {
    this.setData({
      showAdminLogin: !this.data.showAdminLogin,
      adminAccount: '',
      adminPassword: ''
    });
  },

  /**
   * 点击 Logo 触发隐藏管理员入口（连续点击5次）
   */
  onLogoClick() {
    let count = this.data.logoClickCount + 1;
    if (count >= 5) {
      this.setData({ logoClickCount: 0, showAdminLogin: true });
      wx.showToast({ title: '管理员入口已开启', icon: 'none' });
    } else {
      this.setData({ logoClickCount: count });
    }
  },

  // 输入框绑定
  onAdminAccountInput(e) {
    this.setData({ adminAccount: e.detail.value });
  },
  onAdminPasswordInput(e) {
    this.setData({ adminPassword: e.detail.value });
  }
});