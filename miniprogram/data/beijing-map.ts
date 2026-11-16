import { isPublishedCity, xianPreviewPath } from './city-release';
import { cloudAsset } from '../services/cloud-assets';
import { writeProgress } from '../services/cloud-account';
import { discoveryPath, readDiscovery } from './beijing-discovery';
import { FengwuCard, fengwuPath, readBeijingFengwuCards } from './beijing-fengwu';
import { beijingPlacePath } from './beijing-briefs';
import { findScrollLandmark, ScrollLandmark, scrollLandmarks } from './beijing-scrolls';
import { beijingCityId, readActiveScrollCity, saveActiveScrollCity } from './city-scroll-position';
import { readNewLandmarkStamps, recordCityLandmarkStamp, StampStatus } from './landmark-stamp-ledger';

export type MapEntryId = 'palace' | 'summer' | 'shichahai' | 'flavors' | 'axis' | 'wall';
export type MapEntryState = 'unseen' | 'seen' | 'collected';

export interface MapEntry {
  id: MapEntryId;
  name: string;
  caption: string;
  question: string;
  takeaway: string;
  x: number;
  y: number;
  artX: number;
  artY: number;
  number: string;
  path: string;
  fengwuIds: string[];
}

export interface MapEntryView extends MapEntry {
  lit: boolean;
  state: MapEntryState;
  stateText: string;
  collectionCount: number;
}

export const beijingMapPath: string = '/pages/beijing/beijing';
export const beijingMapSharePath: string = '/pages/beijing-share/beijing-share';
export const beijingMapImage: string = cloudAsset('/images/beijing/beijing-map.jpg');
export const beijingSeenKey: string = 'dqxj_seen_beijing';
const litLandmarksKey: string = 'dqxj_beijing_landmarks_lit';
let resumeRequested: boolean = false;

export function resumeBeijingMap(): void {
  resumeCityMap(beijingCityId);
}

export function resumeCityMap(cityId: string): void {
  if (!isPublishedCity(cityId)) { wx.navigateTo({ url: xianPreviewPath }); return; }
  const previousCity: string = readActiveScrollCity();
  if (previousCity !== cityId) saveActiveScrollCity(cityId);
  resumeRequested = true;
  wx.switchTab({ url: beijingMapPath, fail: (error): void => {
    resumeRequested = false;
    if (previousCity !== cityId) saveActiveScrollCity(previousCity);
    console.error('打开城市画卷失败', { cityId, error: error.errMsg });
    wx.showToast({ title: '暂时打不开城市画卷', icon: 'none' });
  } });
}

export function takeBeijingResumeRequest(): boolean {
  const requested: boolean = resumeRequested;
  resumeRequested = false;
  return requested;
}
let pendingLandmarkSeal: string = '';

/** 六个入口只概括空间关系；京味小街为文化主题，八达岭为远郊插图，不提供现实导航。 */
export const beijingMapEntries: MapEntry[] = [
  { id: 'summer', name: '颐和园', caption: '山水成园', question: '山与湖怎样成为一座园林的骨架？',
    takeaway: '颐和园顺着万寿山和昆明湖来布置，山和湖本身就是园林的骨架。',
    x: 24, y: 31, artX: 24, artY: 23, number: '01', path: beijingPlacePath('spot:颐和园'), fengwuIds: ['spot:颐和园'] },
  { id: 'wall', name: '八达岭', caption: '远郊 · 山间长城', question: '长城为什么顺着山势起伏？',
    takeaway: '仔细看画里的山脊，八达岭的城墙就顺着山势一段段延伸。',
    x: 78, y: 25, artX: 78, artY: 15, number: '02', path: fengwuPath('spot:八达岭长城'), fengwuIds: ['spot:八达岭长城'] },
  { id: 'shichahai', name: '什刹海', caption: '水岸与胡同', question: '名字里有“海”，这里真的是海吗？',
    takeaway: '什刹海的“海”是湖泊水域，前海、后海和西海是这里的三片水面。',
    x: 30, y: 51, artX: 32, artY: 43, number: '03', path: fengwuPath('spot:什刹海'), fengwuIds: ['spot:什刹海'] },
  { id: 'palace', name: '故宫', caption: '红墙里的秩序', question: '宫殿为什么要这样排列？',
    takeaway: '从南往北，故宫先是举行大典的外朝，再到日常起居的内廷。',
    x: 66, y: 64, artX: 65, artY: 55, number: '04', path: fengwuPath('spot:故宫'), fengwuIds: ['spot:故宫'] },
  { id: 'flavors', name: '京味小街', caption: '一城五味', question: '炸酱面旁边的小碟蔬菜叫什么？',
    takeaway: '炸酱面旁边的小碟蔬菜叫“菜码”，拌面时和炸酱一起加进去。',
    x: 25, y: 81, artX: 25, artY: 72, number: '05', path: '/pages/foodstreet/foodstreet', fengwuIds: ['food:北京烤鸭', 'food:炸酱面', 'food:豆汁焦圈', 'food:铜锅涮肉', 'food:驴打滚'] },
  { id: 'axis', name: '中轴线', caption: '沿线找发现', question: '城市里那条看不见的线在哪里？',
    takeaway: '从南往北，把永定门、天安门和钟鼓楼连起来，就能在画上找到北京中轴线。',
    x: 66, y: 91, artX: 62, artY: 81, number: '06', path: discoveryPath, fengwuIds: [] },
];

export function findMapEntry(id: string): MapEntry {
  const entry: MapEntry | undefined = beijingMapEntries.find((item: MapEntry): boolean => item.id === id);
  if (!entry) throw new RangeError('北京地图入口不存在：' + id);
  return entry;
}

export function readSeenMapEntries(): string[] {
  const stored: unknown = wx.getStorageSync(beijingSeenKey);
  if (stored === '') return [];
  if (!Array.isArray(stored) || !stored.every((item: unknown): boolean => typeof item === 'string')) {
    throw new TypeError('北京地图浏览记录格式错误：' + beijingSeenKey);
  }
  return Array.from(new Set(stored as string[]));
}

export function markMapEntrySeen(id: MapEntryId): void {
  findMapEntry(id);
  writeProgress(beijingSeenKey, Array.from(new Set([...readSeenMapEntries(), id])));
}

/** 勋章记录画卷里的主动点亮，和既有的详情浏览及收藏分别存储。 */
export function readLitMapEntryIds(): string[] {
  const previous: unknown = wx.getStorageSync(litLandmarksKey);
  const stored: unknown = previous === '' ? [] : previous;
  if (!Array.isArray(stored) || !stored.every(isBeijingLandmarkId)) {
    throw new TypeError('北京地标勋章格式错误：' + litLandmarksKey);
  }
  return Array.from(new Set([...(stored as string[]), ...readNewLandmarkStamps(beijingCityId)]));
}

function isBeijingLandmarkId(id: unknown): boolean {
  return beijingMapEntries.some((entry: MapEntry): boolean => entry.id === id)
    || scrollLandmarks.some((entry: ScrollLandmark): boolean => entry.id === id);
}

export function countBeijingLandmarkStamps(litIds: readonly string[]): number {
  return scrollLandmarks.filter((entry: ScrollLandmark): boolean => litIds.includes(entry.id)).length;
}

export async function stampBeijingLandmark(id: string): Promise<{ status: StampStatus; passedHalf: boolean }> {
  findScrollLandmark(id);
  const litIds: string[] = readLitMapEntryIds();
  if (litIds.includes(id)) return { status: 'already-stamped', passedHalf: false };
  const { status, passedHalf } = await recordCityLandmarkStamp(beijingCityId, id);
  if (status !== 'earned') return { status, passedHalf: false };
  pendingLandmarkSeal = id;
  // 云端事务按正式地标数的一半确认里程碑，避免多设备并发重复提示。
  return { status, passedHalf };
}

export function takeLandmarkSealFeedback(): string {
  const id: string = pendingLandmarkSeal;
  pendingLandmarkSeal = '';
  return id;
}

export function markFengwuSeen(id: string): void {
  const entry: MapEntry | undefined = beijingMapEntries.find((item: MapEntry): boolean => item.fengwuIds.includes(id));
  if (entry) markMapEntrySeen(entry.id);
}

export function readMapEntries(): MapEntryView[] {
  const seen: string[] = readSeenMapEntries();
  const litIds: string[] = readLitMapEntryIds();
  const cards: FengwuCard[] = readBeijingFengwuCards();
  const hasBookmark: boolean = readDiscovery().collectedAt !== null;
  return beijingMapEntries.map((entry: MapEntry): MapEntryView => {
    const collectionCount: number = entry.id === 'axis' ? (hasBookmark ? 1 : 0)
      : cards.filter((card: FengwuCard): boolean => card.lit && entry.fengwuIds.includes(card.id)).length;
    const state: MapEntryState = collectionCount > 0 ? 'collected' : (seen.includes(entry.id) ? 'seen' : 'unseen');
    return { ...entry, lit: litIds.includes(entry.id), state, collectionCount, stateText: state === 'collected' ? (entry.id === 'axis' ? '已获书签' : '已收藏') : (state === 'seen' ? '已看过' : '待发现') };
  });
}

/** 共用地图插画的局部作为详情页题图，保留原图、不另造无关占位图。 */
export function fengwuIllustrationStyle(id: string): string {
  const entry: MapEntry | undefined = beijingMapEntries.find((item: MapEntry): boolean => item.fengwuIds.includes(id));
  if (!entry) return '';
  return 'width:1715rpx;height:2572.5rpx;left:' + (343 - entry.artX * 17.15) + 'rpx;top:' + (175 - entry.artY * 25.725) + 'rpx;';
}

export function returnToBeijingMap(): void {
  returnToCityMap(beijingCityId);
}

export function returnToCityMap(cityId: string): void {
  if (!isPublishedCity(cityId)) {
    const pages = getCurrentPages();
    const previewIndex: number = pages.findIndex((page): boolean => '/' + page.route === xianPreviewPath);
    if (previewIndex >= 0 && previewIndex < pages.length - 1) wx.navigateBack({ delta: pages.length - 1 - previewIndex });
    else resumeCityMap(cityId);
    return;
  }
  const pages = getCurrentPages();
  for (let index: number = pages.length - 2; index >= 0; index -= 1) {
    const path: string = '/' + pages[index].route;
    const shareCity: unknown = pages[index].options?.city ?? beijingCityId;
    if (path === beijingMapPath || (path === beijingMapSharePath && shareCity === cityId)) {
      if (path === beijingMapPath && readActiveScrollCity() !== cityId) saveActiveScrollCity(cityId);
      wx.navigateBack({ delta: pages.length - 1 - index });
      return;
    }
  }
  resumeCityMap(cityId);
}
