import { xianScrolls, yongningGate } from '../../../data/xian-scroll';
import { resumeBeijingMap } from '../../../data/beijing-map';
import { xianPreviewPath } from '../../../data/city-release';

Page({
  data: { cover: xianScrolls[0].image },
  onRead(): void { wx.navigateTo({ url: yongningGate.path }); },
  onBeijing(): void { resumeBeijingMap(); },
  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return { title: '西安先睹为快 · 从永宁门读懂一道城门', path: xianPreviewPath, imageUrl: this.data.cover };
  },
});
