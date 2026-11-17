import { isPublishedCity } from './city-release';
import { cloudAsset } from '../services/cloud-assets';
import { writeProgress } from '../services/cloud-account';
import { beijingMapEntries, readLitMapEntryIds, resumeBeijingMap, resumeCityMap } from './beijing-map';
import { beijingScrolls, scrollLandmarks } from './beijing-scrolls';
import { beijingPlacePath } from './beijing-briefs';
import { FengwuCard, readBeijingFengwuCards, readBeijingFengwuIds } from './beijing-fengwu';
import { beijingCityId, xianCityId } from './city-scroll-position';
import { findXianLandmark, readXianStampIds, readXianStories, readXianStoryIds, xianScrolls } from './xian-scroll';

export interface CityAlbumStamp {
  id: string;
  name: string;
  path: string;
  art?: string;
}

export interface CityAlbumSection {
  id: string;
  name: string;
  landmarks: readonly CityAlbumStamp[];
}

export interface PublishedCityScroll {
  cover: string;
  id: string;
  name: string;
  open: () => void;
  stampSections: readonly CityAlbumSection[];
  pastStamps: readonly CityAlbumStamp[];
  readStampIds: () => string[];
  readStories: () => FengwuCard[];
  readStoryIds: () => string[];
  storyPath: (id: string) => string;
}

export { beijingCityId };
const beijingStoryCovers: Readonly<Record<string, string>> = {
  'spot:故宫': cloudAsset('/images/beijing/scroll-axis.jpg'),
  'spot:颐和园': cloudAsset('/images/beijing/summer-palace-landscape.jpg'),
};

// 城市资料注册表保留筹备城市的旧记录；正式换城须过滤发布状态。
export const publishedCityScrolls: readonly PublishedCityScroll[] = [
  {
    cover: beijingScrolls[0].image, id: beijingCityId, name: '北京', open: resumeBeijingMap,
    stampSections: beijingScrolls.map((scroll): CityAlbumSection => ({
      ...scroll,
      landmarks: scroll.landmarks.map((entry): CityAlbumStamp => entry.id === 'palace'
        ? { ...entry, art: cloudAsset('/images/beijing/palace-seal-reveal.jpg') } : entry),
    })),
    pastStamps: beijingMapEntries.filter((entry): boolean => !scrollLandmarks.some((landmark): boolean => landmark.id === entry.id)),
    readStampIds: readLitMapEntryIds,
    readStories: (): FengwuCard[] => readBeijingFengwuCards().map((card): FengwuCard => ({
      ...card, image: card.image ?? beijingStoryCovers[card.id],
    })),
    readStoryIds: readBeijingFengwuIds,
    storyPath: beijingPlacePath,
  },
  {
    cover: xianScrolls[0].image, id: xianCityId, name: '西安', open: (): void => resumeCityMap(xianCityId),
    stampSections: xianScrolls.filter((scroll): boolean => scroll.landmarks.length > 0),
    pastStamps: [], readStampIds: readXianStampIds, readStories: readXianStories, readStoryIds: readXianStoryIds,
    storyPath: (id: string): string => findXianLandmark(id).path,
  },
];

export function otherPublishedCityScrolls(cityId: string): PublishedCityScroll[] {
  return publishedCityScrolls.filter((city: PublishedCityScroll): boolean => city.id !== cityId && isPublishedCity(city.id));
}

export function readCityScrollId(cityId: string): string {
  const key: string = 'dqxj_last_scroll_' + cityId;
  const stored: unknown = wx.getStorageSync(key);
  if (typeof stored !== 'string') throw new TypeError('城市画卷记录格式错误：' + key);
  return stored;
}

export function saveCityScrollId(cityId: string, scrollId: string): void {
  writeProgress('dqxj_last_scroll_' + cityId, scrollId);
}

/** 下一卷按已上线城市顺序选择，最后一座城市不循环制造新城奖励。 */
export function nextPublishedCityScroll(cityId: string): PublishedCityScroll | undefined {
  const index: number = publishedCityScrolls.findIndex((city): boolean => city.id === cityId);
  if (index < 0) throw new RangeError('城市不存在：' + cityId);
  return publishedCityScrolls.slice(index + 1).find((city): boolean => isPublishedCity(city.id));
}
