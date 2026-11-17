import { isPublishedCity } from '../../data/city-release';
import { publishedCityScrolls, PublishedCityScroll } from '../../data/city-scrolls';
import { beijingScrolls, ScrollLandmark } from '../../data/beijing-scrolls';
import { xianScrolls } from '../../data/xian-scroll';

export interface HandbookLeaf {
  id: string;
  name: string;
  image: string;
  excerpt: string;
  path: string;
  inkArt: string;
  customInk: boolean;
  fullArt: boolean;
}

export interface CityHandbook {
  cityId: string;
  cityName: string;
  preview: boolean;
  cover: string;
  sentence: string;
  total: number;
  complete: boolean;
  leaves: HandbookLeaf[];
}

const customInks: readonly string[] = ['yongning-gate', 'bell-tower', 'drum-tower', 'shuyuanmen-beilin', 'giant-goose-pagoda', 'datang-everbright', 'shaanxi-history-museum', 'changan-twelve-hours', 'small-goose-pagoda', 'terracotta-army', 'daming-palace', 'huaqing-palace', 'bell-drum', 'square', 'archery-tower', 'temple-heaven', 'yongding', 'summer', 'lama', 'hutong-lane', 'olympic', 'qianmen', 'lugou', 'shougang', 'canal-culture', 'art-798', 'sanlitun', 'longfu', 'daxing'];

export function handbookCity(cityId: string): PublishedCityScroll {
  const city: PublishedCityScroll | undefined = publishedCityScrolls.find((entry): boolean => entry.id === cityId);
  if (!city) throw new RangeError('探索手册城市不存在：' + cityId);
  return city;
}

/** 只读取正式印章；分享快照不写入接收者的收藏、印章或阅读记录。 */
export function buildHandbook(cityId: string, stampIds: readonly string[]): CityHandbook {
  const city: PublishedCityScroll = handbookCity(cityId);
  const stamps = city.stampSections.flatMap((section) => section.landmarks);
  const scrolls = cityId === 'city_beijing' ? beijingScrolls : xianScrolls;
  const leaves: HandbookLeaf[] = Array.from(new Set(stampIds)).flatMap((id): HandbookLeaf[] => {
    const stamp = stamps.find((entry): boolean => entry.id === id);
    if (!stamp) return [];
    const scroll = scrolls.find((entry): boolean => entry.landmarks.some((landmark): boolean => landmark.id === id));
    const landmark: ScrollLandmark | undefined = scroll?.landmarks.find((entry): boolean => entry.id === id);
    if (!landmark || !scroll) throw new RangeError('手册地标未关联画卷：' + cityId + '/' + id);
    const card = city.readStories().find((entry): boolean => entry.id === landmark.fengwuId || entry.id === id);
    const figure = landmark.story?.cover ?? landmark.story?.sections.find((section): boolean => !!section.illustration)?.illustration;
    return [{ id, name: stamp.name, path: stamp.path, image: figure?.src ?? card?.image ?? scroll.image,
      excerpt: landmark.takeaway, inkArt: stamp.art ?? '', customInk: customInks.includes(id),
      fullArt: !!figure || (!!card?.image && card.image !== scroll.image) }];
  });
  return { cityId, cityName: city.name, preview: !isPublishedCity(cityId), cover: city.cover, total: stamps.length, complete: isPublishedCity(cityId) && stamps.length > 0 && leaves.length === stamps.length,
    sentence: cityId === 'city_beijing' ? '从宫城到湖山，把北京慢慢读进心里。' : '从一道城门出发，把长安慢慢读进心里。', leaves };
}

export function readHandbook(cityId: string): CityHandbook {
  return buildHandbook(cityId, handbookCity(cityId).readStampIds());
}

export function handbookSharePath(book: CityHandbook): string {
  return '/memories/pages/handbook/handbook?city=' + encodeURIComponent(book.cityId)
    + '&from=share&stamps=' + encodeURIComponent(book.leaves.map((leaf): string => leaf.id).join(','));
}

export function parseSharedStamps(raw: string): string[] {
  if (raw.length > 2000) throw new RangeError('分享手册参数过长，请重新分享');
  return raw === '' ? [] : raw.split(',');
}
