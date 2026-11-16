import { BeijingBrief, beijingBriefs, findBeijingBrief, markBeijingBriefRead, nextBeijingBrief, readBeijingBriefIds } from '../../data/beijing-briefs';
import { readBeijingFengwuIds } from '../../data/beijing-fengwu';
import { beijingMapImage, returnToBeijingMap, fengwuIllustrationStyle, markFengwuSeen } from '../../data/beijing-map';
import { awardBeijingStamp, collectBeijingFengwu, removeBeijingFengwu } from '../../data/beijing-outcomes';
import { markMoreFengwuSeen } from '../../data/beijing-more';
import { rememberFengwuVisit } from '../../data/beijing-journey';
import { landmarkIdForFengwu } from '../../data/beijing-scrolls';

Page({
  data: {
    brief: null as BeijingBrief | null,
    next: null as BeijingBrief | null,
    mapImage: beijingMapImage,
    artStyle: '',
    read: false,
    readCount: 0,
    total: beijingBriefs.length,
    collected: false,
    stampAwarded: false,
    visitExpanded: false,
    landmarkId: '',
  },

  onLoad(options: { id?: string }): void {
    if (!options.id) throw new TypeError('短读链接缺少见闻标识');
    const brief: BeijingBrief = findBeijingBrief(decodeURIComponent(options.id));
    this.setData({ brief, artStyle: fengwuIllustrationStyle(brief.id), landmarkId: landmarkIdForFengwu(brief.id) });
    if (brief.article) {
      markFengwuSeen(brief.id);
      markMoreFengwuSeen(brief.id);
      rememberFengwuVisit(brief.id);
      wx.setNavigationBarTitle({ title: brief.entry.name + ' · 北京' });
    }
  },

  onShow(): void {
    this.refreshProgress();
  },

  refreshProgress(): void {
    const brief: BeijingBrief | null = this.data.brief;
    if (!brief) return;
    const readIds: string[] = readBeijingBriefIds();
    this.setData({
      read: readIds.includes(brief.id),
      readCount: beijingBriefs.filter((item: BeijingBrief): boolean => readIds.includes(item.id)).length,
      collected: readBeijingFengwuIds().includes(brief.id),
      next: nextBeijingBrief(brief.id, readIds),
    });
  },

  onFinish(): void {
    const brief: BeijingBrief | null = this.data.brief;
    if (!brief || this.data.read) return;
    const stampAwarded: boolean = awardBeijingStamp();
    markBeijingBriefRead(brief.id);
    this.setData({ stampAwarded });
    this.refreshProgress();
  },

  onToggleFavorite(): void {
    const brief: BeijingBrief | null = this.data.brief;
    if (!brief) throw new Error('短读尚未加载');
    if (readBeijingFengwuIds().includes(brief.id)) removeBeijingFengwu(brief.id);
    else collectBeijingFengwu(brief.id);
    this.refreshProgress();
  },

  onNext(): void {
    if (!this.data.next) throw new Error('下一则短读尚未加载');
    wx.redirectTo({ url: this.data.next.path });
  },

  onDeepDive(): void {
    if (!this.data.brief) throw new Error('短读尚未加载');
    wx.navigateTo({ url: this.data.brief.detailPath });
  },

  onMap(): void {
    returnToBeijingMap();
  },

  onCopySource(): void {
    if (!this.data.brief) throw new Error('短读尚未加载');
    wx.setClipboardData({ data: this.data.brief.entry.sourceUrl });
  },

  onToggleVisit(): void {
    this.setData({ visitExpanded: !this.data.visitExpanded });
  },

  onCopyVisitUrl(): void {
    const visit = this.data.brief?.article?.guide?.visit;
    if (!visit) throw new Error('参观信息尚未加载');
    wx.setClipboardData({ data: visit.officialUrl });
  },

  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    const brief: BeijingBrief | null = this.data.brief;
    if (!brief) throw new Error('短读尚未加载，无法分享');
    return {
      title: brief.article?.title ?? brief.entry.question,
      path: brief.path,
      imageUrl: brief.article?.guide?.figure.src ?? brief.entry.image ?? beijingMapImage,
    };
  },
});
