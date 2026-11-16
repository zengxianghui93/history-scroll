export {};

// 萌宠页：档案大图 + 双进度 + 旅行时间线 + 阶段二占位
interface TripItem {
  chapterId: string;
  cityId: string;
  date: string;
  label: string;
  sort: number;
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return (m < 10 ? '0' + m : '' + m) + '.' + (day < 10 ? '0' + day : '' + day);
}

Page({
  data: {
    pet: null as unknown as Record<string, unknown> | null,
    intimacyPct: 0,
    mileagePct: 0,
    trips: [] as TripItem[],
  },

  onShow(): void {
    const app = getApp() as unknown as {
      globalData: { pet: Record<string, unknown> | null; chapters: Record<string, unknown>[]; cities: Record<string, unknown>[] };
    };
    const pet = app.globalData.pet;
    const chapters = app.globalData.chapters || [];
    const cities = app.globalData.cities || [];
    const timeline = (wx.getStorageSync('dqxj_timeline') || []) as Array<{ id: string; ts: number | null }>;
    const collectedChapters = (wx.getStorageSync('dqxj_collected') || []) as string[];

    // 时间线 = 带日期的旅行记录，历史收藏兜底（无日期显示"已解锁"）
    const dateMap: Record<string, number | null> = {};
    timeline.forEach((t) => {
      if (t && t.id) dateMap[t.id] = typeof t.ts === 'number' ? t.ts : null;
    });
    collectedChapters.forEach((id) => {
      if (!(id in dateMap)) dateMap[id] = null;
    });

    const trips: TripItem[] = [];
    Object.keys(dateMap).forEach((chapterId) => {
      const ch = chapters.find((c) => c.id === chapterId) as Record<string, unknown> | undefined;
      if (!ch) return;
      const city = cities.find((ci) => ci.id === ch.cityId) as Record<string, unknown> | undefined;
      const ts = dateMap[chapterId];
      trips.push({
        chapterId,
        cityId: ch.cityId as string,
        date: ts ? fmtDate(ts) : '已解锁',
        label: (city ? (city.name as string) : '') + ' · ' + (ch.title as string),
        sort: ts || 0,
      });
    });
    trips.sort((a, b) => b.sort - a.sort);

    const intimacy = pet ? ((pet.intimacy as number) || 0) : 0;
    const mileage = pet ? ((pet.mileage as number) || 0) : 0;
    this.setData({
      pet,
      intimacyPct: Math.min(intimacy, 100),
      mileagePct: Math.min(Math.round((mileage / 5) * 100), 100),
      trips,
    });
  },

  goTrip(e: WechatMiniprogram.TouchEvent): void {
    const cityId = e.currentTarget.dataset.cityid as string;
    if (cityId) wx.navigateTo({ url: '/pages/city/city?cityId=' + cityId });
  },
  onDecorate(): void {
    wx.showToast({ title: '装扮敬请期待', icon: 'none' });
  },
  onGacha(): void {
    wx.showToast({ title: '抽卡敬请期待', icon: 'none' });
  },
});
