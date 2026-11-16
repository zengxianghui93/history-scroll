import { FengwuCard, fengwuPath, readBeijingFengwuCards } from '../../data/beijing-fengwu';
import { beijingMapImage, fengwuIllustrationStyle, markMapEntrySeen, returnToBeijingMap } from '../../data/beijing-map';

Page({
  data: {
    image: beijingMapImage,
    artStyle: fengwuIllustrationStyle('food:炸酱面'),
    cards: [] as FengwuCard[],
    collectedCount: 0,
    focusedId: '',
  },

  onLoad(options: { focus?: string }): void {
    const focusedId: string = options.focus ? decodeURIComponent(options.focus) : '';
    const cards: FengwuCard[] = readBeijingFengwuCards().filter((card: FengwuCard): boolean => card.kind === 'food');
    if (focusedId && !cards.some((card: FengwuCard): boolean => card.id === focusedId)) {
      throw new RangeError('京味小街中不存在该风物：' + focusedId);
    }
    markMapEntrySeen('flavors');
    this.setData({ focusedId });
  },

  onShow(): void {
    const cards: FengwuCard[] = readBeijingFengwuCards().filter((card: FengwuCard): boolean => card.kind === 'food');
    this.setData({ cards, collectedCount: cards.filter((card: FengwuCard): boolean => card.lit).length });
  },

  onReady(): void {
    if (this.data.focusedId) {
      const index: number = this.data.cards.findIndex((card: FengwuCard): boolean => card.id === this.data.focusedId);
      wx.pageScrollTo({ selector: '#food-' + index, offsetTop: -16, duration: 0 });
    }
  },

  onOpenCard(event: WechatMiniprogram.TouchEvent): void {
    const id: string = event.currentTarget.dataset.id as string;
    if (!this.data.cards.some((card: FengwuCard): boolean => card.id === id)) throw new RangeError('京味小街卡片不存在：' + id);
    wx.navigateTo({ url: fengwuPath(id) });
  },

  onMap(): void {
    returnToBeijingMap();
  },

  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: '北京的一碗面、一口小吃，各有什么讲究？', path: '/pages/foodstreet/foodstreet', imageUrl: beijingMapImage };
  },
});
