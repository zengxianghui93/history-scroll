import { initializeCloud } from './services/cloud-account';
import { syncQuietly } from './reading/store';

// 阅读业务独立保存，不在启动时迁移或改写城市探索记录。
App({
  globalData: { pet: null as Record<string, unknown> | null, cities: [] as unknown[], chapters: [] as unknown[] },
  onLaunch(): void { initializeCloud(); },
  onShow(): void { syncQuietly(); },
});
