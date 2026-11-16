// 兼容已发出的明信片链接，产品入口统一使用探索手册。
Page({
  onLoad(): void { wx.redirectTo({ url: '/memories/pages/handbook/handbook?city=city_beijing' }); },
});
