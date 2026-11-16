import { cloudAsset } from '../services/cloud-assets';
import { writeProgress } from '../services/cloud-account';
import { FengwuCard } from './beijing-fengwu';
import { readStoredIds } from './beijing-outcomes';
import { xianCityId } from './city-scroll-position';
import { CityScroll, ScrollLandmark } from './beijing-scrolls';
import { readNewLandmarkStamps, recordCityLandmarkStamp, StampStatus } from './landmark-stamp-ledger';

const stampKey: string = 'dqxj_xian_landmarks_lit';
const storyKey: string = 'dqxj_lit_city_xian';
let pendingSeal: string = '';

export const yongningGate: ScrollLandmark = {
  id: 'yongning-gate', name: '永宁门', x: 41, y: 86,
  takeaway: '从城外到城里，永宁门把一条进城路变成了几道防线。',
  path: '/xian/pages/yongning/yongning',
};

export const xianScrolls: CityScroll[] = [
  { id: 'ancient-axis', name: '晨钟暮鼓 · 古城中轴', image: cloudAsset('/xian/images/ancient-axis.jpg'), landmarks: [yongningGate] },
  { id: 'yanta', name: '盛世大唐 · 雁塔流光', image: cloudAsset('/xian/images/yanta.jpg'), landmarks: [] },
  { id: 'qin', name: '秦风浩荡 · 帝国背影', image: cloudAsset('/xian/images/qin.jpg'), landmarks: [] },
  { id: 'market', name: '市井烟火 · 长安百态', image: cloudAsset('/xian/images/market.jpg'), landmarks: [] },
];

export const yongningStory: FengwuCard = {
  id: yongningGate.id, name: yongningGate.name, kind: 'spot', emoji: '城',
  question: '进永宁门，为什么要穿过好几道门？',
  answer: '过了第一道门，眼前仍是一座被城墙围住的院子。这里是瓮城，也是古城的一道防线。',
  knowledge: yongningGate.takeaway,
  sourceTitle: '西安曲江新区管理委员会 · 西安城墙',
  sourceUrl: 'https://qjxq.xa.gov.cn/zjqj/gyqj/tsqj/5df21c5565cbd81235fc1efa.html',
  illustrationBrief: '以画卷前景的永宁门为题图，配独立的南北向城门结构示意。',
  lit: false,
};

export function readXianStampIds(): string[] {
  return Array.from(new Set([...readStoredIds(stampKey), ...readNewLandmarkStamps(xianCityId)]));
}

export async function stampXianLandmark(id: string): Promise<{ status: StampStatus; passedHalf: boolean }> {
  if (id !== yongningGate.id) throw new RangeError('西安地标不存在：' + id);
  const ids: string[] = readXianStampIds();
  if (ids.includes(id)) return { status: 'already-stamped', passedHalf: false };
  const result = await recordCityLandmarkStamp(xianCityId, id);
  if (result.status === 'earned') pendingSeal = id;
  return result;
}

export function takeXianSealFeedback(): string {
  const id: string = pendingSeal;
  pendingSeal = '';
  return id;
}

export function readXianStoryIds(): string[] {
  return readStoredIds(storyKey);
}

export function readXianStories(): FengwuCard[] {
  return [{ ...yongningStory, lit: readXianStoryIds().includes(yongningStory.id) }];
}

export function toggleYongningFavorite(): boolean {
  const ids: string[] = readXianStoryIds();
  const collected: boolean = ids.includes(yongningStory.id);
  writeProgress(storyKey, collected ? ids.filter((id): boolean => id !== yongningStory.id) : [...ids, yongningStory.id]);
  return !collected;
}
