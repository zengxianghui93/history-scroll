import { xianCityId } from '../../../data/city-scroll-position';
import { bellTower, bellTowerStory, readXianStoryIds, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: bellTower,
    story: bellTowerStory,
    cover: xianScrolls[0].image,
    relocation: bellTowerStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(bellTower.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(bellTower.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: bellTowerStory.question, path: bellTower.path, imageUrl: xianScrolls[0].image };
  },
});
