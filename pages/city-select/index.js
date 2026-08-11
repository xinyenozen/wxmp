// pages/city-select/index.js
import { CITY_DATA } from '../../utils/chinaCities.js';

Page({
  data: {
    keyword: '',
    filteredCities: [],
    indexLetters: [],
    scrollToId: ''
  },

  onLoad() {
    // 按字母分组
    const grouped = this.groupCitiesByLetter(CITY_DATA);
    this.setData({
      filteredCities: grouped,
      indexLetters: grouped.map(item => item.letter)
    });
  },

  /**
   * 将城市数组按首字母分组
   */
  groupCitiesByLetter(cities) {
    const map = {};
    cities.forEach(city => {
      const letter = city.firstLetter;
      if (!map[letter]) map[letter] = [];
      map[letter].push(city);
    });
    // 排序字母
    const sortedLetters = Object.keys(map).sort();
    return sortedLetters.map(letter => ({
      letter,
      cities: map[letter].sort((a, b) => a.name.localeCompare(b.name))
    }));
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ keyword });
    if (!keyword) {
      // 清空搜索，恢复全部列表
      const grouped = this.groupCitiesByLetter(CITY_DATA);
      this.setData({
        filteredCities: grouped,
        indexLetters: grouped.map(item => item.letter)
      });
      return;
    }
    // 过滤城市（按名称拼音或汉字匹配）
    const lowerKeyword = keyword.toLowerCase();
    const filtered = CITY_DATA.filter(city => 
      city.name.includes(keyword) || 
      city.pinyin.includes(lowerKeyword)
    );
    const grouped = this.groupCitiesByLetter(filtered);
    this.setData({
      filteredCities: grouped,
      indexLetters: grouped.map(item => item.letter)
    });
  },

  /**
   * 清空搜索
   */
  clearSearch() {
    this.setData({ keyword: '' });
    const grouped = this.groupCitiesByLetter(CITY_DATA);
    this.setData({
      filteredCities: grouped,
      indexLetters: grouped.map(item => item.letter)
    });
  },

  /**
   * 点击字母索引，滚动到对应分组
   */
  scrollToLetter(e) {
    const letter = e.currentTarget.dataset.letter;
    this.setData({
      scrollToId: `group-${letter}`
    });
  },

  /**
   * 选择城市，返回上一页并传递城市名
   */
  selectCity(e) {
    const cityName = e.currentTarget.dataset.city;
    // 获取上一页的页面实例
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      // 调用上一页的 setCity 方法，传递选中的城市
      if (typeof prevPage.setCity === 'function') {
        prevPage.setCity(cityName);
      } else {
        // 如果没有方法，直接通过事件或设置全局变量
        prevPage.data.selectedCity = cityName;
      }
    }
    // 返回上一页
    wx.navigateBack({
      delta: 1
    });
  }
});