// pages/publish/index.js
// pages/publish/index.js
Page({
  data: {
    formData: {
      type: 'living',           // living, facility, safety
      name: '',
      address: '',
      city: '',                 // 新增城市字段，从地址中解析
      latitude: 0,
      longitude: 0,
      description: '',
      images: [],
      isAnonymous: true
    },
    submitting: false
  },

  onLoad(options) {
    // 从地图页传入经纬度（可选）
    if (options.lat && options.lng) {
      const lat = parseFloat(options.lat);
      const lng = parseFloat(options.lng);
      // 通过逆地理编码获取城市名（使用腾讯地图API，这里简化处理）
      // 或者让用户自行选择位置，此处仅作为默认值
      this.setData({
        'formData.latitude': lat,
        'formData.longitude': lng,
        'formData.name': '地图选点',
        'formData.address': `经度${lng}，纬度${lat}`
      });
    }
  },

  // ========== 表单交互 ==========
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 'formData.type': type });
  },

  chooseLocation() {
    const that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          that.doChooseLocation();
        } else {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => { that.doChooseLocation(); },
            fail: () => {
              wx.showModal({
                title: '需要位置权限',
                content: '用于标注地点位置，请开启位置权限',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) wx.openSetting();
                }
              });
            }
          });
        }
      },
      fail: () => { that.doChooseLocation(); }
    });
  },

  doChooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        // 从地址中提取城市（例如：北京市朝阳区xxx → 北京）
        const cityMatch = res.address.match(/^([\u4e00-\u9fa5]{2,}?(?:省|自治区|市|自治州|盟|地区|县|区))/);
        const city = cityMatch ? cityMatch[1] : '';
        this.setData({
          'formData.name': res.name || '未知地点',
          'formData.address': res.address || res.name,
          'formData.latitude': res.latitude,
          'formData.longitude': res.longitude,
          'formData.city': city
        });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
        // 降级到 getLocation
        wx.getLocation({
          type: 'gcj02',
          success: (locRes) => {
            this.setData({
              'formData.name': '当前位置',
              'formData.address': '附近区域（自动定位）',
              'formData.latitude': locRes.latitude,
              'formData.longitude': locRes.longitude,
              'formData.city': ''
            });
            wx.showToast({ title: '已使用当前位置', icon: 'none' });
          },
          fail: () => {
            wx.showToast({ title: '获取位置失败，可手动输入', icon: 'none' });
          }
        });
      }
    });
  },

  onDescInput(e) {
    this.setData({ 'formData.description': e.detail.value });
  },

  // ========== 图片上传（云存储） ==========
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
      success: async (res) => {
        const tempFiles = res.tempFilePaths;
        wx.showLoading({ title: '上传中...', mask: true });
        try {
          const uploaded = [];
          for (let i = 0; i < tempFiles.length; i++) {
            const filePath = tempFiles[i];
            const cloudPath = `annotations/${Date.now()}_${Math.random().toString(36).slice(-6)}.jpg`;
            const uploadRes = await wx.cloud.uploadFile({
              cloudPath,
              filePath
            });
            uploaded.push(uploadRes.fileID);
          }
          wx.hideLoading();
          const newImages = this.data.formData.images.concat(uploaded);
          this.setData({ 'formData.images': newImages });
          wx.showToast({ title: `上传成功 ${uploaded.length} 张`, icon: 'success' });
        } catch (err) {
          wx.hideLoading();
          console.error('上传图片失败:', err);
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      }
    });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.formData.images;
    images.splice(index, 1);
    this.setData({ 'formData.images': images });
  },

  toggleAnonymous(e) {
    this.setData({ 'formData.isAnonymous': e.detail.value });
  },

  // ========== 提交标注 ==========
  async submitAnnotation() {
    if (this.data.submitting) return;
    const form = this.data.formData;

    // 校验
    if (!form.name || !form.address) {
      wx.showToast({ title: '请选择位置', icon: 'none' });
      return;
    }
    if (!form.description.trim()) {
      wx.showToast({ title: '请填写详细描述', icon: 'none' });
      return;
    }

    // 检查登录态
    const token = wx.getStorageSync('userToken');
    const userInfo = wx.getStorageSync('userInfo');
    if (!token || !userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录再发布标注',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) wx.reLaunch({ url: '/pages/login/index' });
        }
      });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...', mask: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'submitAnnotation',
        data: {
          type: form.type,
          name: form.name,
          address: form.address,
          city: form.city || '',
          latitude: form.latitude,
          longitude: form.longitude,
          description: form.description.trim(),
          images: form.images,
          isAnonymous: form.isAnonymous,
          nickName: userInfo.nickName || '用户',
          tags: []
        }
      });

      wx.hideLoading();
      if (res.result && res.result.code === 0) {
        wx.showToast({ title: '提交成功！', icon: 'success' });
        // 清空表单
        this.setData({
          formData: {
            type: 'living',
            name: '',
            address: '',
            city: '',
            latitude: 0,
            longitude: 0,
            description: '',
            images: [],
            isAnonymous: true
          }
        });
        // 延迟返回地图页
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      } else {
        wx.showToast({ title: res.result?.message || '提交失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('提交标注异常:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});