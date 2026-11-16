import { writeProgress } from '../services/cloud-account';
import { beijingMoreFengwuIds, FengwuCard, readBeijingFengwuCards } from './beijing-fengwu';
import { MapEntryState } from './beijing-map';

export interface MoreFengwuCard extends FengwuCard {
  state: MapEntryState;
  stateText: string;
}

export const beijingMorePath: string = '/pages/beijing-more/beijing-more';
const seenMoreKey: string = 'dqxj_seen_beijing_more';

function readSeenMoreIds(): string[] {
  const stored: unknown = wx.getStorageSync(seenMoreKey);
  if (stored === '') return [];
  if (!Array.isArray(stored) || !stored.every((id: unknown): boolean => typeof id === 'string')) {
    throw new TypeError('更多北京见闻的浏览记录格式错误：' + seenMoreKey);
  }
  return Array.from(new Set(stored as string[]));
}

/** 主地图与分册分别记录浏览，打开分册见闻不会虚增六入口进度。 */
export function markMoreFengwuSeen(id: string): void {
  if (beijingMoreFengwuIds.includes(id)) {
    writeProgress(seenMoreKey, Array.from(new Set([...readSeenMoreIds(), id])));
  }
}

export function readMoreFengwuCards(): MoreFengwuCard[] {
  const seen: string[] = readSeenMoreIds();
  return readBeijingFengwuCards().filter((card: FengwuCard): boolean => beijingMoreFengwuIds.includes(card.id))
    .map((card: FengwuCard): MoreFengwuCard => {
      const state: MapEntryState = card.lit ? 'collected' : (seen.includes(card.id) ? 'seen' : 'unseen');
      return { ...card, state, stateText: card.lit ? '已收藏 · 回看' : (state === 'seen' ? '已看过 · 再读读' : '待发现') };
    });
}
