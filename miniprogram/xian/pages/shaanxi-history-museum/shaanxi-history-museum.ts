import { xianCityId } from '../../../data/city-scroll-position';
import { readXianStoryIds, shaanxiHistoryMuseum, shaanxiHistoryMuseumStory, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: shaanxiHistoryMuseum,
    story: shaanxiHistoryMuseumStory,
    cover: xianScrolls[1].image,
    scene: shaanxiHistoryMuseumStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(shaanxiHistoryMuseum.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(shaanxiHistoryMuseum.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: shaanxiHistoryMuseumStory.question, path: shaanxiHistoryMuseum.path, imageUrl: xianScrolls[1].image };
  },
});
