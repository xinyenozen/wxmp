// pages/policy/correct/index.js
// pages/policy/correct/index.js
Page({
  data: {
    city: '',          // 城市名
    type: '',          // 错误类型
    content: '',       // 正确内容
    images: [],        // 图片临时路径
    contact: ''        // 联系方式
  },

  // 选择城市（跳转到城市选择页）
  selectCity() {
    wx.navigateTo({
      url: '/pages/city-select/index'
    });
  },

  // 城市选择页的回调（通过 setCity 方法接收）
  setCity(cityName) {
    if (cityName) {
      this.setData({ city: cityName });
    }
  },

  // 选择错误类型
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ type });
  },

  // 输入正确内容
  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  // 上传图片
  uploadImage() {
    const currentCount = this.data.images.length;
    const remain = 4 - currentCount;
    if (remain <= 0) {
      wx.showToast({ title: '最多上传4张', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = this.data.images.concat(res.tempFilePaths);
        this.setData({ images: newImages });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images: images });
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  // 提交纠错
  submitCorrection() {
    const { city, type, content, images, contact } = this.data;
    // 验证必填项
    if (!city) {
      wx.showToast({ title: '请选择城市', icon: 'none' });
      return;
    }
    if (!type) {
      wx.showToast({ title: '请选择错误类型', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      wx.showToast({ title: '请填写正确内容', icon: 'none' });
      return;
    }

    // 检查用户是否登录（缓存取用户信息）
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (!userInfo.nickName) {
      wx.showModal({
        title: '提示',
        content: '请先登录再提交纠错',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/user/index' });
          }
        }
      });
      return;
    }

    // 构建纠错数据对象
    const correction = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      city,
      type,
      content: content.trim(),
      images,
      contact,
      userId: userInfo.nickName,
      userAvatar: userInfo.avatarUrl || '',
      createTime: new Date().toISOString(),
      status: 'pending' // pending, approved, rejected
    };

    // 存储到本地缓存（模拟数据库）
    const corrections = wx.getStorageSync('corrections') || [];
    corrections.unshift(correction);
    wx.setStorageSync('corrections', corrections);

    // 积分奖励（+5分）
    const stats = wx.getStorageSync('userStats') || {
      level: 1,
      score: 0,
      annotations: 0,
      favorites: 0,
      pendingCount: 0,
      migrationKits: 0
    };
    stats.score = (stats.score || 0) + 5;
    stats.pendingCount = (stats.pendingCount || 0) + 1;
    stats.level = Math.floor(stats.score / 100) + 1;
    wx.setStorageSync('userStats', stats);

    wx.showToast({
      title: '纠错提交成功！+5积分',
      icon: 'success',
      duration: 2000
    });

    // 延时返回上一页
    setTimeout(() => {
      wx.navigateBack({ delta: 1 });
    }, 1500);
  }
});