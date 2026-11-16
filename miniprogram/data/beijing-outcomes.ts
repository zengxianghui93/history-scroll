import { writeProgress } from '../services/cloud-account';
import chapters from './chapters';
import { beijingFengwu, beijingFengwuKey, findBeijingFengwu, readBeijingFengwuIds } from './beijing-fengwu';
import { readDiscovery } from './beijing-discovery';
import { readLitMapEntryIds } from './beijing-map';
import { readNewStampedCities } from './landmark-stamp-ledger';

export const outcomeIcons = { city: '◈', bookmark: '▥', fengwu: '▣', reading: '▤' };

interface ReadingMoment {
  id: string;
  ts: number | null;
}

export function readStoredIds(key: string): string[] {
  const stored: unknown = wx.getStorageSync(key);
  if (stored === '') return [];
  if (!Array.isArray(stored) || !stored.every((id: unknown): boolean => typeof id === 'string')) {
    throw new TypeError('探索记录格式错误：' + key);
  }
  return Array.from(new Set(stored as string[]));
}

export function readChapterIds(): string[] {
  return readStoredIds('dqxj_collected');
}

/** 兼容旧印章、已收下章节、风物收藏及完整探索，不改写或删除历史存档。 */
export function readCityStampIds(): string[] {
  const stored: string[] = Array.from(new Set([...readStoredIds('dqxj_collected_cities'), ...readNewStampedCities()]));
  const readIds: string[] = readChapterIds();
  const hasReading: boolean = chapters.some((chapter): boolean => chapter.cityId === 'city_beijing' && readIds.includes(chapter.id));
  const fengwuIds: string[] = readBeijingFengwuIds();
  const hasFengwu: boolean = beijingFengwu.some((entry): boolean => fengwuIds.includes(entry.id));
  const hasExploration: boolean = readDiscovery().revealed;
  const hasLandmark: boolean = readLitMapEntryIds().length > 0;
  // 从旧记录推断出的北京印章早于后来正式收录的城市印章。
  if (!stored.includes('city_beijing') && (hasReading || hasFengwu || hasExploration || hasLandmark)) return ['city_beijing', ...stored];
  return stored;
}

/** 首次有效探索自动获得印章；浏览页面、看地图、打开分享均不触发。 */
export function awardBeijingStamp(): boolean {
  const alreadyEarned: boolean = readCityStampIds().includes('city_beijing');
  awardCityStamp('city_beijing');
  return !alreadyEarned;
}

export function awardCityStamp(cityId: string): void {
  const stored: string[] = readStoredIds('dqxj_collected_cities');
  if (!stored.includes(cityId)) writeProgress('dqxj_collected_cities', [...stored, cityId]);
}

export function collectBeijingFengwu(id: string): void {
  findBeijingFengwu(id);
  const ids: string[] = readBeijingFengwuIds();
  if (ids.includes(id)) return;
  awardBeijingStamp();
  writeProgress(beijingFengwuKey, [...ids, id]);
}

export function removeBeijingFengwu(id: string): void {
  findBeijingFengwu(id);
  const ids: string[] = readBeijingFengwuIds();
  if (!ids.includes(id)) return;
  awardBeijingStamp();
  writeProgress(beijingFengwuKey, ids.filter((savedId: string): boolean => savedId !== id));
}

export function markBeijingChapterRead(id: string): boolean {
  if (!chapters.some((chapter): boolean => chapter.id === id && chapter.cityId === 'city_beijing')) {
    throw new RangeError('北京阅读篇章不存在：' + id);
  }
  const ids: string[] = readChapterIds();
  if (ids.includes(id)) return false;
  const stored: unknown = wx.getStorageSync('dqxj_timeline');
  if (stored !== '' && (!Array.isArray(stored) || !stored.every((entry: unknown): boolean => {
    if (typeof entry !== 'object' || entry === null) return false;
    const moment = entry as ReadingMoment;
    return typeof moment.id === 'string' && (moment.ts === null || (typeof moment.ts === 'number' && Number.isFinite(moment.ts)));
  }))) throw new TypeError('阅读时间记录格式错误：dqxj_timeline');
  const timeline: ReadingMoment[] = stored === '' ? [] : stored as ReadingMoment[];
  const awarded: boolean = awardBeijingStamp();
  writeProgress('dqxj_collected', [...ids, id]);
  if (!timeline.some((moment: ReadingMoment): boolean => moment.id === id)) {
    writeProgress('dqxj_timeline', [...timeline, { id, ts: Date.now() }]);
  }
  return awarded;
}
