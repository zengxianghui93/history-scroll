import { writeProgress } from '../../services/cloud-account';
import { outcomeIcons, readCityStampIds } from '../../data/beijing-outcomes';
import { beijingMapImage, beijingMapPath, fengwuIllustrationStyle } from '../../data/beijing-map';
import { beijingFengwu, FengwuEntry, fengwuPath, readBeijingFengwuCards } from '../../data/beijing-fengwu';
import { readDiscovery } from '../../data/beijing-discovery';
import { readResumeFengwu } from '../../data/beijing-journey';
import { DailyDiscovery, readDailyDiscovery, readSeenBeijingFengwuIds } from '../../data/beijing-discoveries';
import { shareBeijingChallenge } from '../../data/beijing-challenge';

Page({
  onShareAppMessage: shareBeijingChallenge,
  data: {
    total: 0,
    outcomeIcons,
    collectedCount: 0,
    wantCount: 0,
    collectedPct: 0,
    cities: [] as Array<Record<string, unknown>>,
    discovery: null as DailyDiscovery | null,
    resume: null as FengwuEntry | null,
    discoveryArtStyle: '',
    mapImage: beijingMapImage,
    beijingUnseenCount: 0,
    beijingBookmarkCount: 0,
    beijingFengwuCount: 0,
  },

  onShow(): void {
    const app = getApp() as unknown as { globalData: { cities: Record<string, unknown>[]; chapters: Record<string, unknown>[]; pet: Record<string, unknown> | null } };
    const stampIds: string[] = readCityStampIds();
    const cities = (app.globalData.cities || []).filter((city): boolean => city.id === 'city_beijing').map((c) => {
      const id = c.id as string;
      const pet = app.globalData.pet;
      return {
        id,
        name: c.name,
        province: c.province,
        slogan: c.slogan,
        cover: c.cover,
        emoji: pet && (pet.species as string) === 'dog' ? '🐶' : '🐱',
        collected: stampIds.includes(id),
        want: (wx.getStorageSync('dqxj_want') || []).indexOf(id) >= 0,
      };
    });

    const ids = cities.map((c) => c.id);
    const collectedAll: string[] = stampIds;
    const wantAll = wx.getStorageSync('dqxj_want') || [];
    const collectedCount = collectedAll.filter((id: string) => ids.indexOf(id) >= 0).length;
    const wantCount = wantAll.filter((id: string) => ids.indexOf(id) >= 0).length;
    const total = cities.length;

    const discovery: DailyDiscovery = readDailyDiscovery(new Date());
    const seenIds: string[] = readSeenBeijingFengwuIds();

    this.setData({
      total,
      collectedCount,
      wantCount,
      collectedPct: total ? Math.round((collectedCount / total) * 100) : 0,
      cities,
      discovery,
      discoveryArtStyle: fengwuIllustrationStyle(discovery.entry.id),
      resume: readResumeFengwu(),
      beijingUnseenCount: beijingFengwu.filter((entry: FengwuEntry): boolean => !seenIds.includes(entry.id)).length,
      beijingBookmarkCount: readDiscovery().collectedAt === null ? 0 : 1,
      beijingFengwuCount: readBeijingFengwuCards().filter((entry): boolean => entry.lit).length,
    });
  },

  goDiscovery(): void {
    if (!this.data.discovery) throw new Error('今日发现尚未加载');
    wx.navigateTo({ url: this.data.discovery.path });
  },

  onResume(): void {
    if (!this.data.resume) throw new Error('当前没有可续看的北京见闻');
    wx.navigateTo({ url: fengwuPath(this.data.resume.id) });
  },

  goCity(e: WechatMiniprogram.TouchEvent): void {
    const id = e.currentTarget.dataset.id;
    if (id === 'city_beijing') {
      wx.switchTab({ url: beijingMapPath });
      return;
    }
    wx.navigateTo({ url: '/pages/city/city?cityId=' + id });
  },

  onToggleCollect(e: WechatMiniprogram.TouchEvent): void {
    const id = e.currentTarget.dataset.id as string;
    if (id === 'city_beijing') throw new Error('北京城市印章由有效探索自动获得');
    const list = wx.getStorageSync('dqxj_collected_cities') || [];
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(id);
    writeProgress('dqxj_collected_cities', list);

    const cities = this.data.cities.map((c) => {
      if (c.id === id) return { id: c.id, name: c.name, province: c.province, slogan: c.slogan, cover: c.cover, emoji: c.emoji, collected: idx < 0, want: c.want };
      return c;
    });
    const ids = cities.map((c) => c.id);
    const collectedCount = readCityStampIds().filter((cid: string): boolean => ids.includes(cid)).length;
    this.setData({
      cities,
      collectedCount,
      collectedPct: this.data.total ? Math.round((collectedCount / this.data.total) * 100) : 0,
    });
    wx.showToast({ title: idx < 0 ? '已收集' : '已取消', icon: 'none' });
  },
});

