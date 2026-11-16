import { markFengwuSeen } from '../../data/beijing-map';
import { markMoreFengwuSeen } from '../../data/beijing-more';
import { rememberFengwuVisit } from '../../data/beijing-journey';
import { beijingScrolls, findScrollLandmark, ScrollLandmark, scrollIndexForLandmark } from '../../data/beijing-scrolls';
import { readBeijingFengwuIds } from '../../data/beijing-fengwu';
import { collectBeijingFengwu, removeBeijingFengwu } from '../../data/beijing-outcomes';

const artOffsets: Readonly<Record<string, number>> = { 'bell-drum': -20, square: -320 };

Page({
  data: {
    entry: null as ScrollLandmark | null,
    image: '',
    artTop: 0,
    collected: false,
    expandedSections: [] as boolean[],
  },

  onShow(): void {
    const id: string | undefined = this.data.entry?.fengwuId;
    if (id) this.setData({ collected: readBeijingFengwuIds().includes(id) });
  },

  onToggleFavorite(): void {
    const id: string | undefined = this.data.entry?.fengwuId;
    if (!id) throw new Error('地标没有可收藏的见闻');
    if (readBeijingFengwuIds().includes(id)) removeBeijingFengwu(id);
    else collectBeijingFengwu(id);
    this.onShow();
  },

  onLoad(options: { id?: string }): void {
    const entry: ScrollLandmark = findScrollLandmark(options.id);
    if (!entry.story) throw new RangeError('地标没有独立故事：' + entry.id);
    if (entry.fengwuId) {
      markFengwuSeen(entry.fengwuId);
      markMoreFengwuSeen(entry.fengwuId);
      rememberFengwuVisit(entry.fengwuId);
    }
    const artTop: number = artOffsets[entry.id] ?? -Math.max(0, Math.min(747, (entry.y - 9) * 10.47 - 150));
    this.setData({ entry, image: beijingScrolls[scrollIndexForLandmark(entry.id)].image, artTop });
    wx.setNavigationBarTitle({ title: entry.name });
  },

  onReadSection(event: WechatMiniprogram.TouchEvent): void {
    const index: number = Number(event.currentTarget.dataset.index);
    const link = this.data.entry?.story?.sections[index]?.link;
    if (!link) throw new RangeError('地标延伸内容不存在：' + index);
    wx.navigateTo({ url: link.path });
  },

  onToggleSection(event: WechatMiniprogram.TouchEvent): void {
    const index: number = Number(event.currentTarget.dataset.index);
    const sections = this.data.entry?.story?.sections;
    if (!Number.isInteger(index) || !sections?.[index]?.collapsed) throw new RangeError('可折叠的地标内容不存在：' + index);
    const expandedSections: boolean[] = sections.map((section, position): boolean => section.collapsed === true && (position === index ? !this.data.expandedSections[position] : this.data.expandedSections[position] === true));
    this.setData({ expandedSections });
  },

  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    const entry: ScrollLandmark | null = this.data.entry;
    if (!entry?.story) throw new Error('地标故事尚未加载');
    return {
      title: entry.story.title,
      path: '/pages/beijing-landmark/beijing-landmark?id=' + encodeURIComponent(entry.id) + '&from=share',
      imageUrl: entry.story.cover?.src ?? entry.story.sections.find((section): boolean => !!section.illustration)?.illustration?.src ?? this.data.image,
    };
  },
});
