import { xianCityId } from '../../../data/city-scroll-position';
import { datangEverbright, datangEverbrightStory, readXianStoryIds, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: datangEverbright,
    story: datangEverbrightStory,
    cover: xianScrolls[1].image,
    scene: datangEverbrightStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(datangEverbright.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(datangEverbright.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: datangEverbrightStory.question, path: datangEverbright.path, imageUrl: xianScrolls[1].image };
  },
});
