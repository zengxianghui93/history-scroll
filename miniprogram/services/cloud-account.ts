export const cloudEnvironment: string = 'cloud1-d7gp1zt48d1eda997';
export interface CloudLedger { stamps: string[]; day?: number; balance?: number; used?: number }
export interface CloudStampResult { status: 'earned' | 'already-stamped'; passedHalf: boolean }
interface CloudResult { ok: boolean; rewardCities: string[]; revision: number; code?: string; userId: string; ledger: CloudLedger; progress: Record<string, unknown>; status?: 'earned' | 'already-stamped'; passedHalf?: boolean }
interface ProgressChange { id: string; key: string; before: unknown; value: unknown }
interface LegacyMigration { id: string; ledger?: CloudLedger; progress: Record<string, unknown>; stamps: string[] }
interface LocalBackup { createdAt: number; records: Record<string, unknown>; migration: LegacyMigration }
const progressKeys: string[] = ["dqxj_lit_city_beijing", "dqxj_lit_city_xian", "dqxj_collected_cities", "dqxj_collected", "dqxj_timeline", "dqxj_checkins", "dqxj_seen_beijing", "dqxj_seen_beijing_more", "dqxj_beijing_journey", "dqxj_discovery_beijing_axis", "dqxj_beijing_briefs_read", "dqxj_active_scroll_city", "dqxj_last_scroll_city_beijing", "dqxj_last_scroll_city_xian"];
const sessionKey: string = 'dqxj_cloud_user';
const ownerKey: string = 'dqxj_cloud_cache_owner';
const ledgerKey: string = 'dqxj_landmark_stamp_ledger';
const backupKey: string = 'dqxj_cloud_guest_backup_v1';
const queueKey: string = 'dqxj_cloud_pending';
let syncing: Promise<void> | null = null;
let lastErrorAt: number = 0;
export function isLoggedIn(): boolean { return typeof wx.getStorageSync(sessionKey) === 'string' && !!wx.getStorageSync(sessionKey); }
export function initializeCloud(): void { wx.cloud.init({ env: cloudEnvironment, traceUser: false }); }
function recordId(): string { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2); }
async function request(data: Record<string, unknown>): Promise<CloudResult> {
  for (let attempt: number = 1; attempt <= 3; attempt += 1) {
    let response: { result: unknown };
    try { response = await wx.cloud.callFunction({ name: 'exploration', data }); }
    catch (error) {
      console.warn('云开发请求失败', { action: data.action, attempt, error });
      if (attempt === 3) throw error;
      await new Promise<void>((resolve): void => { setTimeout(resolve, attempt * 400); });
      continue;
    }
    const result = response.result as CloudResult;
    if (!result?.ok || !result.userId || !result.ledger || !result.progress) {
      throw new Error('云端校验失败：' + JSON.stringify({ action: data.action, result }));
    }
    const expectedUser: string = wx.getStorageSync(sessionKey);
    if (data.action !== 'login' && expectedUser !== result.userId) {
      wx.removeStorageSync(sessionKey);
      throw new Error('微信账号已变化，请重新登录城市册');
    }
    return result;
  }
  throw new Error('云开发请求未完成');
}
function pending(): ProgressChange[] { return wx.getStorageSync(queueKey) || []; }
function applyLedger(result: CloudResult): boolean {
  const revision: number = wx.getStorageSync('dqxj_cloud_revision') || 0;
  if (result.revision < revision) return false;
  wx.setStorageSync(ledgerKey, result.ledger);
  wx.setStorageSync('dqxj_city_milestones', result.rewardCities);
  wx.setStorageSync('dqxj_cloud_revision', result.revision);
  return true;
}
function notifyPages(): void {
  getCurrentPages().forEach((page): void => {
    const subscriber = page as unknown as { onCloudSnapshot?: () => void };
    if (subscriber.onCloudSnapshot) subscriber.onCloudSnapshot();
  });
}
function applySnapshot(result: CloudResult): void {
  if (!applyLedger(result)) return;
  const queued: ProgressChange[] = pending();
  progressKeys.forEach((key: string): void => {
    if (queued.some((change): boolean => change.key === key)) return;
    if (result.progress[key] !== undefined) wx.setStorageSync(key, result.progress[key]);
    else wx.removeStorageSync(key);
  });
  // 云端已确认接收旧印章后才停用旧数组，完整原值保存在迁移备份中。
  wx.setStorageSync('dqxj_beijing_landmarks_lit', []);
  wx.setStorageSync('dqxj_xian_landmarks_lit', []);
  notifyPages();
}
function createGuestBackup(): LocalBackup {
  const existing: LocalBackup | '' = wx.getStorageSync(backupKey);
  if (existing) return existing;
  const records: Record<string, unknown> = {};
  wx.getStorageInfoSync().keys.filter((key: string): boolean => key.startsWith('dqxj_')).forEach((key: string): void => {
    records[key] = wx.getStorageSync(key);
  });
  const progress: Record<string, unknown> = {};
  progressKeys.forEach((key: string): void => { if (records[key] !== undefined) progress[key] = records[key]; });
  const ledger = records[ledgerKey] as CloudLedger | undefined;
  const beijing = records.dqxj_beijing_landmarks_lit as string[] | undefined;
  const xian = records.dqxj_xian_landmarks_lit as string[] | undefined;
  const migration: LegacyMigration = {
    id: recordId(), progress,
    ...(ledger ? { ledger } : {}),
    stamps: [...(beijing ?? []).map((id: string): string => 'city_beijing/' + id), ...(xian ?? []).map((id: string): string => 'city_xian/' + id)],
  };
  const backup: LocalBackup = { createdAt: Date.now(), records, migration };
  wx.setStorageSync(backupKey, backup);
  return backup;
}
export async function loginCloud(): Promise<void> {
  // 登录重试始终使用同一份不可变备份，服务器按迁移编号去重。
  const owner: string = wx.getStorageSync(ownerKey);
  const legacy: LegacyMigration | undefined = owner ? undefined : createGuestBackup().migration;
  if (owner) {
    const records: Record<string, unknown> = {};
    [...progressKeys, ledgerKey, queueKey].forEach((key: string): void => { records[key] = wx.getStorageSync(key); });
    wx.setStorageSync('dqxj_account_backup_' + owner, { createdAt: Date.now(), records });
  }
  const result = await request({ action: 'login', ...(legacy ? { legacy } : {}) });
  if (owner && owner !== result.userId) { wx.setStorageSync(queueKey, []); wx.removeStorageSync('dqxj_cloud_revision'); }
  wx.setStorageSync(sessionKey, result.userId);
  applySnapshot(result);
  wx.setStorageSync(ownerKey, result.userId);
  if (legacy) wx.setStorageSync('dqxj_cloud_migration_receipt', { id: legacy.id, userId: result.userId, completedAt: Date.now() });
  await refreshCloud();
}
async function synchronize(): Promise<void> {
  while (pending().length > 0) {
    const change: ProgressChange = pending()[0];
    const result = await request({ action: 'progress', ...change });
    wx.setStorageSync(queueKey, pending().filter((item): boolean => item.id !== change.id));
    applySnapshot(result);
  }
  const snapshot = await request({ action: 'snapshot' });
  applySnapshot(snapshot);
  // 请求快照期间新增的收藏操作也必须继续排队发送。
  if (pending().length > 0) await synchronize();
}
export async function refreshCloud(): Promise<void> {
  if (!isLoggedIn()) return;
  if (syncing) return syncing;
  syncing = synchronize();
  try { await syncing; } finally { syncing = null; }
}
export function writeProgress(key: string, value: unknown): void {
  const before: unknown = wx.getStorageSync(key);
  if (JSON.stringify(before) === JSON.stringify(value)) return;
  wx.setStorageSync(key, value);
  if (!isLoggedIn() || !progressKeys.includes(key)) return;
  wx.setStorageSync(queueKey, [...pending(), { id: recordId(), key, before, value }]);
  refreshCloud().catch(showCloudError);
}
export function showCloudError(error: unknown): void {
  console.error('云端同步未完成', { error });
  if (Date.now() - lastErrorAt < 5000) return;
  lastErrorAt = Date.now();
  wx.showToast({ title: '同步未完成，请检查网络后重试', icon: 'none' });
}
export async function stampCloud(cityId: string, landmarkId: string): Promise<CloudStampResult> {
  if (!isLoggedIn()) throw new Error('盖章前请先登录');
  const result = await request({ action: 'stamp', cityId, landmarkId });
  // 盖章只更新权威账本，避免旧响应覆盖同时发生的收藏或阅读记录。
  applyLedger(result);
  if (!result.status || typeof result.passedHalf !== 'boolean') throw new Error('云端盖章结果缺少状态，请更新云函数');
  return { status: result.status, passedHalf: result.passedHalf };
}
