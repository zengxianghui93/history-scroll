import { xianCityId } from '../../../data/city-scroll-position';
import { readXianStoryIds, shuyuanmenBeilin, shuyuanmenStory, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: shuyuanmenBeilin,
    story: shuyuanmenStory,
    cover: xianScrolls[0].image,
    scene: shuyuanmenStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(shuyuanmenBeilin.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(shuyuanmenBeilin.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: shuyuanmenStory.question, path: shuyuanmenBeilin.path, imageUrl: xianScrolls[0].image };
  },
});
