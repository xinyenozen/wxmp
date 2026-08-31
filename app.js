// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-d9gg61ofwde0eb6e5',
        traceUser: true,
      });
    }
  },

  globalData: {
    userInfo: null,
    isAdmin: false,
    selectedPOI: null,
    routePlan: null
  },

  checkLogin() {
    const token = wx.getStorageSync('userToken');
    if (!token) {
      // 但这里不能直接跳转，可能当前页面未加载完成
      // 采用在首页判断
    }
  }
})
