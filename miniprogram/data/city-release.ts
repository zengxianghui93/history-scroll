export type CityReleaseStatus = 'published' | 'preview';

/** 发布状态独立于历史记录；筹备城市只开放已完成的试读，不参与正式换城。 */
const cityReleases: Readonly<Record<string, CityReleaseStatus>> = {
  city_beijing: 'published',
  city_xian: 'preview',
};

export const xianPreviewPath: string = '/xian/pages/preview/preview';

export function isPublishedCity(cityId: string): boolean {
  const status: CityReleaseStatus | undefined = cityReleases[cityId];
  if (!status) throw new RangeError('城市发布状态未登记：' + cityId);
  return status === 'published';
}
