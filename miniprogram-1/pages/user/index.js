// pages/user/index.js
// ============================================================
// 模拟数据（实际项目中替换为接口请求）
// ============================================================
const MOCK_USER = {
  nickName: '',
  avatarUrl: '',
  level: 1,          // 等级从1开始，也可以设为0
  score: 0,
  annotations: 0,
  favorites: 0,
  pendingCount: 0,
  migrationKits: 0
};

// 等级称号映射
const LEVEL_TITLES = {
  1: '初来乍到',
  2: '迁徙新手',
  3: '城市探索者',
  4: '养宠达人',
  5: '安宠专家'
};

// ============================================================
// 页面逻辑
// ============================================================
Page({
  data: {
    // 用户信息
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    userLevel: 1,
    levelTitle: '初来乍到',
    
    // 统计数据
    stats: {
      annotations: 0,
      score: 0,
      favorites: 0
    },
    
    // 待审核数量（角标）
    pendingCount: 0
  },

  onLoad() {
    // 从本地缓存读取用户信息
    this.loadUserData();
  },

  onShow() {
    // 每次页面显示时刷新数据（比如从其他页面返回时）
    this.refreshStats();
  },

  /**
   * 加载用户数据（本地缓存 + 模拟）
   */
  loadUserData() {
    // 1. 读取缓存的用户信息
    const cachedUser = wx.getStorageSync('userInfo');
    
    if (cachedUser && cachedUser.nickName) {
      // 已有登录信息
      this.setData({
        userInfo: cachedUser
      });
    } else {
      // 未登录：显示默认状态
      this.setData({
        userInfo: {
          nickName: '',
          avatarUrl: ''
        }
      });
    }
    
    // 2. 加载统计数据（模拟）
    const stats = wx.getStorageSync('userStats') || MOCK_USER;
    this.setData({
      userLevel: stats.level || 1,
      levelTitle: LEVEL_TITLES[stats.level] || '初来乍到',
      stats: {
        annotations: stats.annotations || 0,
        score: stats.score || 0,
        favorites: stats.favorites || 0
      },
      pendingCount: stats.pendingCount || 0
    });
  },

  /**
   * 刷新统计数据（用于从其他页面返回时更新）
   */
  refreshStats() {
    // 模拟刷新：从全局或缓存读取最新数据
    const stats = wx.getStorageSync('userStats') || MOCK_USER;
    // 仅更新变化的数据，不覆盖用户信息
    this.setData({
      userLevel: stats.level || 1,
      levelTitle: LEVEL_TITLES[stats.level] || '初来乍到',
      'stats.annotations': stats.annotations || 0,
      'stats.score': stats.score || 0,
      'stats.favorites': stats.favorites || 0,
      pendingCount: stats.pendingCount || 0
    });
  },

  /**
   * 登录 / 编辑个人信息
   */
  handleLogin() {
    // 如果已经登录，跳到编辑页（模拟提示）
    if (this.data.userInfo.nickName) {
      wx.showToast({
        title: '编辑功能开发中',
        icon: 'none'
      });
      return;
    }

    // 未登录：调用微信授权获取用户信息
    wx.getUserProfile({
      desc: '用于完善个人资料',
      success: (res) => {
        const userInfo = res.userInfo;
        // 保存到本地缓存
        wx.setStorageSync('userInfo', userInfo);
        
        // 同步初始化统计数据
        const defaultStats = {
          level: 1,
          score: 0,
          annotations: 0,
          favorites: 0,
          pendingCount: 0,
          migrationKits: 0
        };
        wx.setStorageSync('userStats', defaultStats);
        
        this.setData({
          userInfo: userInfo,
          userLevel: 1,
          levelTitle: '初来乍到',
          stats: {
            annotations: 0,
            score: 0,
            favorites: 0
          },
          pendingCount: 0
        });
        
        wx.showToast({
          title: '登录成功！',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '需要授权才能登录',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 我的标注
   */
  goToMyAnnotations() {
    wx.navigateTo({
      url: '/pages/annotations/index'
    });
  },

  /**
   * 我的收藏
   */
  goToFavorites() {
    wx.showToast({
      title: '收藏列表开发中',
      icon: 'none'
    });
    // 实际跳转：
    // wx.navigateTo({ url: '/pages/user/favorites/favorites' });
  },

  /**
   * 迁徙锦囊
   */
  goToMigrationKit() {
    const count = this.data.stats.annotations; // 模拟数据关联
    wx.showModal({
      title: '🧳 迁徙锦囊',
      content: `您已生成 ${count > 0 ? count % 5 + 1 : 0} 份迁徙方案\n\n可下载完整PDF/图片版本，方便路上查看。`,
      confirmText: '查看锦囊',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '锦囊下载功能开发中',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 商家入驻
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
            phoneNumber: '400-000-0000' // 模拟客服电话
          });
        }
      }
    });
  },

  /**
   * 意见反馈
   */
  goToFeedback() {
    wx.showToast({
      title: '反馈页面开发中',
      icon: 'none'
    });
    // 实际跳转：
    // wx.navigateTo({ url: '/pages/user/feedback/feedback' });
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
  }
});