import { xianCityId } from '../../../data/city-scroll-position';
import { changanTwelveHours, changanTwelveHoursStory, readXianStoryIds, toggleXianFavorite, xianScrolls } from '../../../data/xian-scroll';

Page({
  data: {
    cityId: xianCityId,
    landmark: changanTwelveHours,
    story: changanTwelveHoursStory,
    cover: xianScrolls[1].image,
    scene: changanTwelveHoursStory.image,
    collected: false,
  },
  onShow(): void {
    this.setData({ collected: readXianStoryIds().includes(changanTwelveHours.id) });
  },
  onToggleFavorite(): void {
    this.setData({ collected: toggleXianFavorite(changanTwelveHours.id) });
  },
  onShareAppMessage(): { title: string; path: string; imageUrl: string } {
    return { title: changanTwelveHoursStory.question, path: changanTwelveHours.path, imageUrl: xianScrolls[1].image };
  },
});
