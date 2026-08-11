// pages/publish/index.js
Page({
  data: {
    // 表单数据
    formData: {
      type: 'living',               // living, facility, safety
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      description: '',
      images: [],                    // 存储图片临时路径
      isAnonymous: true              // 默认匿名
    }
  },

  onLoad(options) {
    // 如果从详情页传来参数，自动填充
    if (options.name) {
      this.setData({
        'formData.name': decodeURIComponent(options.name || ''),
        'formData.address': decodeURIComponent(options.address || ''),
        'formData.latitude': parseFloat(options.lat) || 0,
        'formData.longitude': parseFloat(options.lng) || 0
      });
    }
  },

  /**
   * 选择标注类型
   */
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'formData.type': type
    });
  },

  /**
   * 选择位置（调用微信地图选点）
   */
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'formData.name': res.name || '未知地点',
          'formData.address': res.address || res.name,
          'formData.latitude': res.latitude,
          'formData.longitude': res.longitude
        });
      },
      fail: (err) => {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({
            title: '获取位置失败，请授权',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 描述输入
   */
  onDescInput(e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  /**
   * 上传图片
   */
  uploadImage() {
    const currentCount = this.data.formData.images.length;
    const remain = 6 - currentCount;
    if (remain <= 0) {
      wx.showToast({ title: '最多上传6张', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = this.data.formData.images.concat(res.tempFilePaths);
        this.setData({
          'formData.images': newImages
        });
      }
    });
  },

  /**
   * 删除图片
   */
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.formData.images;
    images.splice(index, 1);
    this.setData({
      'formData.images': images
    });
  },

  /**
   * 匿名开关
   */
  toggleAnonymous(e) {
    this.setData({
      'formData.isAnonymous': e.detail.value
    });
  },

  /**
   * 提交标注
   */
  submitAnnotation() {
    const form = this.data.formData;

    // 验证必填项
    if (!form.name || !form.address) {
      wx.showToast({ title: '请选择位置', icon: 'none' });
      return;
    }
    if (!form.description.trim()) {
      wx.showToast({ title: '请填写详细描述', icon: 'none' });
      return;
    }

    // 读取当前用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (!userInfo.nickName) {
      wx.showModal({
        title: '提示',
        content: '请先登录再发布标注',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/user/index' });
          }
        }
      });
      return;
    }

    // 构建标注对象
    const annotation = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type: form.type,
      name: form.name,
      address: form.address,
      latitude: form.latitude,
      longitude: form.longitude,
      description: form.description.trim(),
      images: form.images,           // 临时路径，实际项目需上传到服务器
      isAnonymous: form.isAnonymous,
      userId: userInfo.nickName,     // 实际使用openid
      userAvatar: form.isAnonymous ? '' : (userInfo.avatarUrl || ''),
      createTime: new Date().toISOString(),
      status: 'pending'              // pending, passed, rejected
    };

    // 存储到本地缓存（模拟数据库）
    const annotations = wx.getStorageSync('annotations') || [];
    annotations.unshift(annotation);
    wx.setStorageSync('annotations', annotations);

    // 更新用户统计（标注数+1，积分+5）
    const stats = wx.getStorageSync('userStats') || {
      level: 1,
      score: 0,
      annotations: 0,
      favorites: 0,
      pendingCount: 0,
      migrationKits: 0
    };
    stats.annotations = (stats.annotations || 0) + 1;
    stats.score = (stats.score || 0) + 5;
    stats.pendingCount = (stats.pendingCount || 0) + 1;
    // 等级：每100分升1级（示例）
    stats.level = Math.floor(stats.score / 100) + 1;
    wx.setStorageSync('userStats', stats);

    // 提示成功
    wx.showToast({
      title: '提交成功！+5积分',
      icon: 'success',
      duration: 2000
    });

    // 延迟返回上一页或地图页
    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          // 如果无法返回，则跳转到地图
          wx.switchTab({ url: '/pages/map/index' });
        }
      });
    }, 1500);
  }
});