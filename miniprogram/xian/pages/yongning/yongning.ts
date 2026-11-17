import { xianCityId } from '../../../data/city-scroll-position';
import { readXianStoryIds, toggleXianFavorite, xianScrolls, yongningGate, yongningStory } from '../../../data/xian-scroll';

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
    this.setData({ collected: toggleXianFavorite(yongningGate.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: yongningStory.question, path: yongningGate.path, imageUrl: xianScrolls[0].image };
  },
});
