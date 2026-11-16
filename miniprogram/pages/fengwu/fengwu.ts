import { FengwuEntry, fengwuPath, findBeijingFengwu, readBeijingFengwuIds } from '../../data/beijing-fengwu';
import { beijingPlacePath } from '../../data/beijing-briefs';
import { beijingMapImage, fengwuIllustrationStyle, markFengwuSeen, returnToBeijingMap } from '../../data/beijing-map';
import { beijingTopics } from '../../data/beijing-topics';
import { markMoreFengwuSeen } from '../../data/beijing-more';
import { FengwuRecommendation, readFengwuRecommendation, rememberFengwuVisit } from '../../data/beijing-journey';
import { FengwuLearning, findFengwuLearning, LearningFocus } from '../../data/beijing-learning';
import { awardBeijingStamp, collectBeijingFengwu, outcomeIcons, removeBeijingFengwu } from '../../data/beijing-outcomes';
import { landmarkIdForFengwu } from '../../data/beijing-scrolls';

Page({
  data: {
    entry: null as FengwuEntry | null,
    revealed: false,
    collected: false,
    image: beijingMapImage,
    artStyle: '',
    topics: beijingTopics,
    justCollected: false,
    answerFresh: false,
    learningChanged: false,
    outcomeIcons,
    stampAwarded: false,
    recommendation: null as FengwuRecommendation | null,
    learning: null as FengwuLearning | null,
    activeFocus: null as LearningFocus | null,
    landmarkId: '',
  },

  onLoad(options: { id?: string }): void {
    if (!options.id) throw new TypeError('打开风物卡需要 id 参数');
    const entry: FengwuEntry = findBeijingFengwu(decodeURIComponent(options.id));
    if (entry.detailPath) { wx.redirectTo({ url: entry.detailPath }); return; }
    markFengwuSeen(entry.id);
    markMoreFengwuSeen(entry.id);
    rememberFengwuVisit(entry.id);
    const collected: boolean = readBeijingFengwuIds().includes(entry.id);
    const learning: FengwuLearning | null = findFengwuLearning(entry.id);
    this.setData({ entry, collected, revealed: collected, artStyle: fengwuIllustrationStyle(entry.id), learning, activeFocus: learning ? learning.focuses[0] : null, landmarkId: landmarkIdForFengwu(entry.id) });
    wx.setNavigationBarTitle({ title: entry.name + ' · 北京风物' });
  },

  onShow(): void {
    if (this.data.entry) {
      const collected: boolean = readBeijingFengwuIds().includes(this.data.entry.id);
      this.setData({ collected, revealed: this.data.revealed || collected, recommendation: collected ? readFengwuRecommendation(this.data.entry.id) : null });
    }
  },

  onReveal(): void {
    if (this.data.revealed) return;
    this.setData({ revealed: true, answerFresh: true, stampAwarded: awardBeijingStamp() });
  },

  onAnswerMotionEnd(): void {
    this.setData({ answerFresh: false });
  },

  onStampMotionEnd(): void {
    this.setData({ justCollected: false });
  },

  onHide(): void {
    this.setData({ justCollected: false, answerFresh: false, learningChanged: false, stampAwarded: false });
  },

  onCollect(): void {
    const entry: FengwuEntry | null = this.data.entry;
    if (!entry || !this.data.revealed || this.data.collected) return;
    collectBeijingFengwu(entry.id);
    this.setData({ collected: true, justCollected: true, recommendation: readFengwuRecommendation(entry.id) });
  },

  onRemove(): void {
    const entry: FengwuEntry | null = this.data.entry;
    if (!entry || !this.data.collected) return;
    removeBeijingFengwu(entry.id);
    this.setData({ collected: false, justCollected: false, recommendation: null });
  },

  onMyCollection(): void {
    wx.switchTab({ url: '/pages/mine/mine' });
  },

  onCity(): void {
    returnToBeijingMap();
  },

  onLearningFocus(event: WechatMiniprogram.TouchEvent): void {
    const id: string = event.currentTarget.dataset.id as string;
    const focus: LearningFocus | undefined = this.data.learning?.focuses.find((item: LearningFocus): boolean => item.id === id);
    if (!focus) throw new RangeError('当前风物观察项目不存在：' + id);
    if (this.data.activeFocus?.id === id) return;
    this.setData({ activeFocus: focus, learningChanged: true });
  },

  onNextDiscovery(): void {
    if (!this.data.entry || !this.data.collected) return;
    const recommendation: FengwuRecommendation | null = readFengwuRecommendation(this.data.entry.id);
    this.setData({ recommendation });
    if (!recommendation) {
      wx.showToast({ title: '相关见闻都已收藏，可以回画卷自由探索', icon: 'none' });
      return;
    }
    wx.redirectTo({ url: beijingPlacePath(recommendation.entry.id) });
  },

  onTopic(event: WechatMiniprogram.TouchEvent): void {
    const topic = beijingTopics.find((item): boolean => item.id === event.currentTarget.dataset.id);
    if (!topic) throw new RangeError('北京专题不存在：' + event.currentTarget.dataset.id);
    wx.navigateTo({ url: topic.path });
  },

  onCopySource(): void {
    if (this.data.entry) wx.setClipboardData({ data: this.data.entry.sourceUrl });
  },

  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    const entry: FengwuEntry | null = this.data.entry;
    if (!entry) throw new Error('风物卡尚未加载，无法分享');
    return { title: entry.question, path: fengwuPath(entry.id), imageUrl: entry.image ? entry.image : beijingMapImage };
  },
});
