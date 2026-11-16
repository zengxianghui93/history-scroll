import { beijingMapImage, returnToBeijingMap } from '../../data/beijing-map';
import { beijingMorePath } from '../../data/beijing-more';
import { additionalBeijingPlaces, findBeijingStory } from '../../data/beijing-stories';

Page({
  data: {
    image: beijingMapImage,
    readingCards: additionalBeijingPlaces,
  },

  onOpenReading(event: WechatMiniprogram.TouchEvent): void {
    const story = findBeijingStory(event.currentTarget.dataset.id);
    wx.navigateTo({ url: story.path });
  },

  onMap(): void {
    returnToBeijingMap();
  },

  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: '更多北京地标', path: beijingMorePath, imageUrl: beijingMapImage };
  },
});
