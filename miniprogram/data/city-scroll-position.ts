import { isPublishedCity } from './city-release';
import { writeProgress } from '../services/cloud-account';
export const beijingCityId: string = 'city_beijing';
export const xianCityId: string = 'city_xian';

const activeCityKey: string = 'dqxj_active_scroll_city';

export function readActiveScrollCity(): string {
  const stored: unknown = wx.getStorageSync(activeCityKey);
  if (stored === '' || stored === beijingCityId) return beijingCityId;
  if (stored === xianCityId) return isPublishedCity(stored) ? stored : beijingCityId;
  throw new TypeError('当前画卷城市记录格式错误：' + activeCityKey);
}

export function saveActiveScrollCity(cityId: string): void {
  writeProgress(activeCityKey, cityId);
}
