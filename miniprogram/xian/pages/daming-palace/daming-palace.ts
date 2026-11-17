import { xianCityId } from '../../../data/city-scroll-position';
import { damingPalace, damingPalaceStory, readXianStoryIds, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: damingPalace,
    story: damingPalaceStory,
    scene: damingPalaceStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(damingPalace.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(damingPalace.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: damingPalaceStory.question, path: damingPalace.path, imageUrl: xianScrolls[2].image };
  },
});
