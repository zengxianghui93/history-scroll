import { xianCityId } from '../../../data/city-scroll-position';
import { readXianStoryIds, toggleYongningFavorite, xianScrolls, yongningGate, yongningStory } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: yongningGate,
    story: yongningStory,
    image: xianScrolls[0].image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(yongningStory.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleYongningFavorite() });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: yongningStory.question, path: yongningGate.path, imageUrl: xianScrolls[0].image };
  },
});
