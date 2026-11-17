import { xianCityId } from '../../../data/city-scroll-position';
import { giantGoosePagoda, giantGooseStory, readXianStoryIds, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: giantGoosePagoda,
    story: giantGooseStory,
    cover: xianScrolls[1].image,
    scene: giantGooseStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(giantGoosePagoda.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(giantGoosePagoda.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: giantGooseStory.question, path: giantGoosePagoda.path, imageUrl: xianScrolls[1].image };
  },
});
