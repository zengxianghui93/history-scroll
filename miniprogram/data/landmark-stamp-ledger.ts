import { CloudLedger, CloudStampResult, stampCloud } from '../services/cloud-account';
const ledgerKey: string = 'dqxj_landmark_stamp_ledger';
export type StampStatus = 'earned' | 'already-stamped';
function readLedger(): CloudLedger | null {
  const stored: unknown = wx.getStorageSync(ledgerKey);
  if (stored === '') return null;
  if (typeof stored !== 'object' || stored === null) throw new TypeError('地标盖章记录格式错误：' + ledgerKey);
  const ledger = stored as CloudLedger;
  if (!Array.isArray(ledger.stamps) || !ledger.stamps.every((stamp: unknown): boolean => typeof stamp === 'string')) {
    throw new TypeError('地标盖章记录格式错误：' + ledgerKey);
  }
  return ledger;
}
export function readNewLandmarkStamps(cityId: string): string[] {
  const prefix: string = cityId + '/';
  return (readLedger()?.stamps ?? []).filter((stamp): boolean => stamp.startsWith(prefix)).map((stamp): string => stamp.slice(prefix.length));
}
export function readNewStampedCities(): string[] {
  return Array.from(new Set((readLedger()?.stamps ?? []).map((stamp): string => stamp.split('/')[0])));
}
export async function recordCityLandmarkStamp(cityId: string, id: string): Promise<CloudStampResult> {
  return stampCloud(cityId, id);
}
export async function recordLandmarkStamp(cityId: string, id: string): Promise<StampStatus> {
  return (await recordCityLandmarkStamp(cityId, id)).status;
}
