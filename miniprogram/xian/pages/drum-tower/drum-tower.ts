import { xianCityId } from '../../../data/city-scroll-position';
import { drumTower, drumTowerStory, readXianStoryIds, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: drumTower,
    story: drumTowerStory,
    cover: xianScrolls[0].image,
    scene: drumTowerStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(drumTower.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(drumTower.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: drumTowerStory.question, path: drumTower.path, imageUrl: xianScrolls[0].image };
  },
});
