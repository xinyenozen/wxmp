// pages/edit-profile/index.js
Page({
  data: {
    form: {
      avatarUrl: '',
      nickName: '',
      city: '',
      phone: '',
      email: ''
    },
    hasChanged: false,
    originalForm: {},
    saving: false
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      form: {
        avatarUrl: userInfo.avatarUrl || '',
        nickName: userInfo.nickName || '',
        city: userInfo.city || '',
        phone: userInfo.phone || '',
        email: userInfo.email || ''
      },
      originalForm: { ...userInfo }
    });
  },

  onNickNameInput(e) {
    this.updateForm('nickName', e.detail.value);
  },
  onPhoneInput(e) {
    this.updateForm('phone', e.detail.value);
  },
  onEmailInput(e) {
    this.updateForm('email', e.detail.value);
  },

  updateForm(field, value) {
    const newForm = { ...this.data.form, [field]: value };
    this.setData({ form: newForm });
    this.checkChanged(newForm);
  },

  checkChanged(form) {
    const orig = this.data.originalForm;
    const changed = (
      form.nickName !== orig.nickName ||
      form.avatarUrl !== orig.avatarUrl ||
      form.city !== orig.city ||
      form.phone !== orig.phone ||
      form.email !== orig.email
    );
    this.setData({ hasChanged: changed });
  },

  selectCity() {
    wx.navigateTo({
      url: '/pages/city-select/index'
    });
  },

  setCity(cityName) {
    if (cityName) {
      this.updateForm('city', cityName);
    }
  },

  async changeAvatar() {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        });
      });
      const tempFilePath = res.tempFilePaths[0];
      wx.showLoading({ title: '上传中...' });
      const cloudPath = `avatars/${Date.now()}_${Math.random().toString(36).slice(-6)}.jpg`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      });
      wx.hideLoading();
      if (uploadRes.fileID) {
        this.updateForm('avatarUrl', uploadRes.fileID);
        wx.showToast({ title: '头像已更新', icon: 'success' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('上传头像失败:', err);
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  async saveProfile() {
    if (!this.data.hasChanged || this.data.saving) return;
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'updateUserProfile',
        data: {
          nickName: this.data.form.nickName,
          avatarUrl: this.data.form.avatarUrl,
          city: this.data.form.city,
          phone: this.data.form.phone,
          email: this.data.form.email
        }
      });

      wx.hideLoading();
      if (res.result && res.result.code === 0) {
        const userInfo = wx.getStorageSync('userInfo') || {};
        const newUserInfo = {
          ...userInfo,
          nickName: this.data.form.nickName,
          avatarUrl: this.data.form.avatarUrl,
          city: this.data.form.city,
          phone: this.data.form.phone,
          email: this.data.form.email
        };
        wx.setStorageSync('userInfo', newUserInfo);
        const app = getApp();
        app.globalData.userInfo = newUserInfo;

        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      } else {
        wx.showToast({ title: res.result?.message || '保存失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('保存资料失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  }
});