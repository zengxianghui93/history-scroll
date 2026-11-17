import { bellTower, changanTwelveHours, damingPalace, datangEverbright, drumTower, giantGoosePagoda, huaqingPalace, shaanxiHistoryMuseum, shuyuanmenBeilin, smallGoosePagoda, terracottaArmy, xianScrolls, yongningGate } from '../../../data/xian-scroll';
import { resumeBeijingMap } from '../../../data/beijing-map';
import { xianPreviewPath } from '../../../data/city-release';

Page({
  data: { cover: xianScrolls[0].image },
  onRead(): void { wx.navigateTo({ url: yongningGate.path }); },
  onReadBellTower(): void { wx.navigateTo({ url: bellTower.path }); },
  onReadDrumTower(): void { wx.navigateTo({ url: drumTower.path }); },
  onReadShuyuanmen(): void { wx.navigateTo({ url: shuyuanmenBeilin.path }); },
  onReadGiantGoose(): void { wx.navigateTo({ url: giantGoosePagoda.path }); },
  onReadDatangEverbright(): void { wx.navigateTo({ url: datangEverbright.path }); },
  onReadShaanxiHistory(): void { wx.navigateTo({ url: shaanxiHistoryMuseum.path }); },
  onReadChanganTwelveHours(): void { wx.navigateTo({ url: changanTwelveHours.path }); },
  onReadSmallGoose(): void { wx.navigateTo({ url: smallGoosePagoda.path }); },
  onReadTerracottaArmy(): void { wx.navigateTo({ url: terracottaArmy.path }); },
  onReadDamingPalace(): void { wx.navigateTo({ url: damingPalace.path }); },
  onReadHuaqingPalace(): void { wx.navigateTo({ url: huaqingPalace.path }); },
  onBeijing(): void { resumeBeijingMap(); },
  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return { title: '西安先睹为快 · 十二处地标，十二个小发现', path: xianPreviewPath, imageUrl: this.data.cover };
  },
});
