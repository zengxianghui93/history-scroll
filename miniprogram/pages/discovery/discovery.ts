import { writeProgress } from '../../services/cloud-account';
import { cloudAsset } from '../../services/cloud-assets';
import { clues, discoveryChapterId, discoveryPath, discoverySource, discoveryStorageKey, discoveryTakeaway, emptyProgress, Landmark, markLandmarks, readDiscovery, routeIds, DiscoveryProgress } from '../../data/beijing-discovery';
import { markMapEntrySeen, returnToBeijingMap } from '../../data/beijing-map';
import { awardBeijingStamp, outcomeIcons } from '../../data/beijing-outcomes';

Page({
  data: {
    landmarks: markLandmarks([]),
    progress: emptyProgress(),
    clue: clues[0],
    feedback: '喵，我找到几个有趣的地方。帮我按线索找一找，点地图上的地标就好。',
    takeaway: discoveryTakeaway,
    invited: false,
    allFound: false,
    choiceFeedback: '',
    source: discoverySource,
    outcomeIcons,
    stampAwarded: false,
  },

  onLoad(options: { from?: string }): void {
    markMapEntrySeen('axis');
    this.setData({ invited: options.from === 'share' });
    this.refreshProgress();
  },

  refreshProgress(): void {
    const progress: DiscoveryProgress = readDiscovery();
    this.setData({
      progress,
      landmarks: markLandmarks(progress.foundIds),
      allFound: progress.foundIds.length === routeIds.length,
      clue: clues[progress.foundIds.length] || '三个地标都找到了！看看它们的位置，你发现了什么？',
    });
  },

  onLandmarkTap(event: WechatMiniprogram.TouchEvent): void {
    if (this.data.progress.revealed) return;
    const id: string = event.currentTarget.dataset.id as string;
    const landmark: Landmark | undefined = this.data.landmarks.find((item: Landmark): boolean => item.id === id);
    if (!landmark) throw new RangeError('地图地标不存在：' + id);
    const progress: DiscoveryProgress = this.data.progress;
    if (progress.foundIds.includes(id)) {
      this.setData({ feedback: landmark.note });
      return;
    }
    if (id !== routeIds[progress.foundIds.length]) {
      this.setData({ feedback: routeIds.includes(id) ? '这也是路上的一站！先按当前线索找到下一站，再一起往北走。' : landmark.note });
      return;
    }
    writeProgress(discoveryStorageKey, { ...progress, foundIds: [...progress.foundIds, id] });
    this.setData({ feedback: landmark.note });
    this.refreshProgress();
  },

  onChoose(event: WechatMiniprogram.TouchEvent): void {
    if (!this.data.allFound || this.data.progress.revealed) return;
    const choice: string = event.currentTarget.dataset.choice as string;
    if (choice === 'scattered') {
      this.setData({ choiceFeedback: '再看看三个亮起来的地标：从南到北，它们几乎排成一条直线。试试另一个发现吧。' });
      return;
    }
    if (choice !== 'axis') throw new RangeError('未知的探索选项：' + choice);
    const stampAwarded: boolean = awardBeijingStamp();
    writeProgress(discoveryStorageKey, { ...this.data.progress, revealed: true });
    this.setData({ feedback: '你找到北京的城市骨架啦！这条贯穿南北的线，就是北京中轴线。', choiceFeedback: '', stampAwarded });
    this.refreshProgress();
  },

  onClaimBookmark(): void {
    if (!this.data.progress.revealed || this.data.progress.collectedAt !== null) return;
    const collectedAt: number = Date.now();
    // 书签只记录完整探索，不代替用户读完专题，也不写入阅读记录。
    writeProgress(discoveryStorageKey, { ...this.data.progress, collectedAt });
    this.refreshProgress();
  },

  onReadMore(): void {
    wx.navigateTo({ url: '/pages/city/city?cityId=city_beijing&chapterId=' + discoveryChapterId + '&section=diary' });
  },

  onMyCollection(): void {
    wx.switchTab({ url: '/pages/mine/mine' });
  },

  onExplore(): void {
    returnToBeijingMap();
  },

  onCopySource(): void {
    wx.setClipboardData({ data: discoverySource });
  },

  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return {
      title: '北京藏着一条看不见的线，来和橘橘一起找！',
      path: discoveryPath + '?from=share',
      imageUrl: cloudAsset('/images/covers/cover_beijing.jpg'),
    };
  },

  onShareTimeline(): { title: string; query: string; imageUrl: string } {
    return { title: '和橘橘一起，寻找北京看不见的线', query: 'from=share', imageUrl: cloudAsset('/images/covers/cover_beijing.jpg') };
  },
});
