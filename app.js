// app.js
App({
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-d9gg61ofwde0eb6e5',
      traceUser: true
    })
  },
  globalData: {
    userInfo: null,
    selectedPOI: null,
    routePlan: null
  }
})
