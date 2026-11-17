import { xianCityId } from '../../../data/city-scroll-position';
import { readXianStoryIds, terracottaArmy, terracottaArmyStory, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: terracottaArmy,
    story: terracottaArmyStory,
    cover: xianScrolls[2].image,
    scene: terracottaArmyStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(terracottaArmy.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(terracottaArmy.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: terracottaArmyStory.question, path: terracottaArmy.path, imageUrl: xianScrolls[2].image };
  },
});
