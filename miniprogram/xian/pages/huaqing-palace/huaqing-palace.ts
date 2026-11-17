import { xianCityId } from '../../../data/city-scroll-position';
import { huaqingPalace, huaqingPalaceStory, readXianStoryIds, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: huaqingPalace,
    story: huaqingPalaceStory,
    cover: xianScrolls[2].image,
    scene: huaqingPalaceStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(huaqingPalace.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(huaqingPalace.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: huaqingPalaceStory.question, path: huaqingPalace.path, imageUrl: xianScrolls[2].image };
  },
});
