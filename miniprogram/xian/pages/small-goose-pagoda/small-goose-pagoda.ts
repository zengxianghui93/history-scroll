import { xianCityId } from '../../../data/city-scroll-position';
import { readXianStoryIds, smallGoosePagoda, smallGoosePagodaStory, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: smallGoosePagoda,
    story: smallGoosePagodaStory,
    cover: xianScrolls[1].image,
    scene: smallGoosePagodaStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(smallGoosePagoda.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(smallGoosePagoda.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: smallGoosePagodaStory.question, path: smallGoosePagoda.path, imageUrl: xianScrolls[1].image };
  },
});
