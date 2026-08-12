// pages/user/index.js
// pages/user/index.js
Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      isAdmin: false
    },
    stats: {
      level: 1,
      score: 0,
      annotations: 0,
      favorites: 0,
      pendingCount: 0,
      migrationKits: 0
    },
    levelTitle: '初来乍到',
    loading: false
  },

  onLoad() {
    this.checkLoginAndLoad();
  },

  onShow() {
    // 每次显示页面时刷新数据（从其他页面返回时更新）
    this.loadUserData();
  },

  /**
   * 检查登录状态并加载数据
   */
  checkLoginAndLoad() {
    const token = wx.getStorageSync('userToken');
    if (!token) {
      // 未登录，跳转登录页
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.loadUserData();
  },

  /**
   * 加载用户信息（调用云函数）
   */
  async loadUserData() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo'
      });

      if (res.result && res.result.code === 0) {
        const { user, stats } = res.result.data;
        // 更新本地缓存
        wx.setStorageSync('userInfo', user);
        wx.setStorageSync('userStats', stats);

        // 更新页面数据
        this.setData({
          userInfo: {
            nickName: user.nickName || '未命名',
            avatarUrl: user.avatarUrl || '',
            isAdmin: user.isAdmin || false
          },
          stats: {
            level: stats.level || 1,
            score: stats.score || 0,
            annotations: stats.annotations || 0,
            favorites: stats.favorites || 0,
            pendingCount: stats.pendingCount || 0,
            migrationKits: stats.migrationKits || 0
          },
          levelTitle: this.getLevelTitle(stats.level || 1)
        });

        // 更新全局数据
        const app = getApp();
        app.globalData.userInfo = user;
        app.globalData.isAdmin = user.isAdmin || false;
      } else {
        // 如果获取失败但本地有缓存，使用缓存数据
        const cachedUser = wx.getStorageSync('userInfo');
        const cachedStats = wx.getStorageSync('userStats');
        if (cachedUser && cachedStats) {
          this.setData({
            userInfo: {
              nickName: cachedUser.nickName || '未命名',
              avatarUrl: cachedUser.avatarUrl || '',
              isAdmin: cachedUser.isAdmin || false
            },
            stats: {
              level: cachedStats.level || 1,
              score: cachedStats.score || 0,
              annotations: cachedStats.annotations || 0,
              favorites: cachedStats.favorites || 0,
              pendingCount: cachedStats.pendingCount || 0,
              migrationKits: cachedStats.migrationKits || 0
            },
            levelTitle: this.getLevelTitle(cachedStats.level || 1)
          });
        } else {
          wx.showToast({ title: '获取用户信息失败', icon: 'none' });
        }
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
      // 降级使用缓存
      const cachedUser = wx.getStorageSync('userInfo');
      const cachedStats = wx.getStorageSync('userStats');
      if (cachedUser && cachedStats) {
        this.setData({
          userInfo: {
            nickName: cachedUser.nickName || '未命名',
            avatarUrl: cachedUser.avatarUrl || '',
            isAdmin: cachedUser.isAdmin || false
          },
          stats: {
            level: cachedStats.level || 1,
            score: cachedStats.score || 0,
            annotations: cachedStats.annotations || 0,
            favorites: cachedStats.favorites || 0,
            pendingCount: cachedStats.pendingCount || 0,
            migrationKits: cachedStats.migrationKits || 0
          },
          levelTitle: this.getLevelTitle(cachedStats.level || 1)
        });
      } else {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 根据等级获取称号
   */
  getLevelTitle(level) {
    const map = {
      1: '初来乍到',
      2: '迁徙新手',
      3: '城市探索者',
      4: '养宠达人',
      5: '安宠专家'
    };
    return map[level] || '安宠专家';
  },

  /**
   * 跳转编辑资料
   */
  goToEditProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/index'
    });
  },

  /**
   * 我的标注（跳转列表页）
   */
  goToMyAnnotations() {
    const pending = this.data.stats.pendingCount || 0;
    if (pending > 0) {
      wx.showToast({ title: `你有 ${pending} 条待审核`, icon: 'none' });
    }
    wx.navigateTo({
      url: '/pages/annotations/index'
    });
  },

  /**
   * 我的收藏（预留）
   */
  goToFavorites() {
    wx.showToast({ title: '收藏功能开发中', icon: 'none' });
  },

  /**
   * 迁徙锦囊（预留）
   */
  goToMigrationKit() {
    const count = this.data.stats.migrationKits || 0;
    wx.showModal({
      title: '🧳 迁徙锦囊',
      content: `您已生成 ${count} 份迁徙方案\n\n可下载完整PDF/图片版本，方便路上查看。`,
      confirmText: '查看锦囊',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '锦囊下载功能开发中', icon: 'none' });
        }
      }
    });
  },

  /**
   * 商家入驻（预留）
   */
  goToMerchantApply() {
    wx.showModal({
      title: '🏪 商家入驻',
      content: '入驻认证版：¥980/年\n旗舰版：¥2980/年\n\n前50名首年5折优惠！\n（入驻申请页开发中）',
      confirmText: '立即咨询',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-000-0000'
          });
        }
      }
    });
  },

  /**
   * 意见反馈（预留）
   */
  goToFeedback() {
    wx.showToast({ title: '反馈页面开发中', icon: 'none' });
  },

  /**
   * 关于我们
   */
  goToAbout() {
    wx.showModal({
      title: '关于安宠智图',
      content: '安宠智图 v1.0.0\n\n让每一次携宠迁徙\n都安心、温暖、有迹可循。\n\n📧 联系：support@anpetmap.com\n©2026 安宠智图团队',
      showCancel: false,
      confirmText: '了解详情'
    });
  },

  /**
   * 退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userToken');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userStats');
          const app = getApp();
          app.globalData.userInfo = null;
          app.globalData.isAdmin = false;
          wx.reLaunch({ url: '/pages/login/index' });
        }
      }
    });
  }
});