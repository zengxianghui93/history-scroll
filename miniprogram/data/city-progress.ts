import { isPublishedCity } from './city-release';
import { publishedCityScrolls } from './city-scrolls';
export interface CityProgress { count: number; total: number; percent: number; rewardThreshold: number; rewardReady: boolean; complete: boolean }
/** 只计算当前正式地标，历史独立印章仍可回看但不参与进度。 */
export function readCityProgress(cityId: string): CityProgress {
  const city = publishedCityScrolls.find((entry): boolean => entry.id === cityId);
  if (!city) throw new RangeError('城市不存在：' + cityId);
  const ids: string[] = [...new Set(city.stampSections.flatMap((section): string[] => section.landmarks.map((entry): string => entry.id)))];
  const stamps: string[] = city.readStampIds();
  const count: number = ids.filter((id): boolean => stamps.includes(id)).length;
  const total: number = ids.length;
  const rewardThreshold: number = Math.ceil(total / 2);
  const earnedMilestones: string[] = wx.getStorageSync('dqxj_city_milestones') || [];
  return { count, total, percent: total ? Math.floor(count * 100 / total) : 0, rewardThreshold,
    rewardReady: isPublishedCity(cityId) && (earnedMilestones.includes(cityId) || (total > 0 && count >= rewardThreshold)), complete: isPublishedCity(cityId) && total > 0 && count === total };
}
