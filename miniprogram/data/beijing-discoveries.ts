import { FengwuEntry, readBeijingFengwuIds } from './beijing-fengwu';
import { BeijingBrief, beijingBriefs, readBeijingBriefIds } from './beijing-briefs';
import { readBeijingJourney } from './beijing-journey';
import { beijingMapEntries, readSeenMapEntries } from './beijing-map';
import { MoreFengwuCard, readMoreFengwuCards } from './beijing-more';

export interface DailyDiscovery {
  entry: FengwuEntry;
  path: string;
  state: 'unseen' | 'revisit';
  stateText: string;
  introduction: string;
}

/** 旧版单地点浏览与收藏也视为看过；打开美食列表不等于看过其中五张卡。 */
export function readSeenBeijingFengwuIds(): string[] {
  const mapSeen: string[] = readSeenMapEntries();
  const singleIds: string[] = beijingMapEntries
    .filter((entry): boolean => entry.fengwuIds.length === 1 && mapSeen.includes(entry.id))
    .map((entry): string => entry.fengwuIds[0]);
  const moreIds: string[] = readMoreFengwuCards().filter((card: MoreFengwuCard): boolean => card.state !== 'unseen')
    .map((card: MoreFengwuCard): string => card.id);
  return Array.from(new Set([...readBeijingJourney().seenIds, ...readBeijingFengwuIds(), ...readBeijingBriefIds(), ...singleIds, ...moreIds]));
}

/** 同一天、同一份记录得到同一推荐；看过后回首页，继续提供未看内容。 */
export function readDailyDiscovery(today: Date): DailyDiscovery {
  const dayIndex: number = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
  if (!Number.isFinite(dayIndex)) throw new RangeError('今日发现需要有效日期');
  const readIds: string[] = readBeijingBriefIds();
  const unseen: BeijingBrief[] = beijingBriefs.filter((brief: BeijingBrief): boolean => !readIds.includes(brief.id));
  const candidates: BeijingBrief[] = unseen.length > 0 ? unseen : beijingBriefs;
  const brief: BeijingBrief = candidates[((dayIndex % candidates.length) + candidates.length) % candidates.length];
  return {
    entry: brief.entry,
    path: brief.path,
    state: unseen.length > 0 ? 'unseen' : 'revisit',
    stateText: unseen.length > 0 ? '北京短读' : '已读 · 可回看',
    introduction: unseen.length > 0 ? '一张图，讲清一个问题' : '五则短读已读完，回味一个细节',
  };
}
