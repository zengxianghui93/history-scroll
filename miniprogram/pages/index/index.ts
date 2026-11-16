import { discoveryPath, readDiscovery } from "../../data/beijing-discovery";

// 首页：每日一卷（内容式主阅读入口）
Page({
  data: {
    pet: null as unknown as Record<string, unknown> | null,
    chapter: null as Record<string, unknown> | null,
    city: null as Record<string, unknown> | null,
    story: "" as string,
    landmarks: [] as string[],
    mileagePct: 0 as number,
    collected: false as boolean,
    discoveryCollected: false,
  },
  onShow(): void {
    const app = getApp() as unknown as {
      globalData: {
        pet: Record<string, unknown> | null;
        chapters: Record<string, unknown>[];
        cities: Record<string, unknown>[];
      };
    };
    const pet = app.globalData.pet;
    const chapters = (app.globalData.chapters || []).filter(
      (item) => item.trigger === "daily",
    );
    const cities = app.globalData.cities || [];
    const today = new Date();
    const dayIdx = Math.floor(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) /
        86400000,
    );
    const chapter = chapters.length ? chapters[dayIdx % chapters.length] : null;
    const city = chapter
      ? cities.find((c) => c.id === (chapter as Record<string, unknown>).cityId)
      : null;
    const story = chapter ? (chapter.diary as string) || "" : "";
    const origin = city ? (city.origin as Record<string, unknown>) || {} : {};
    const landmarks = ((origin.landmarks as string[]) || []).slice(0, 3);
    const mileage = pet ? (pet.mileage as number) || 0 : 0;
    const collectedChapters = wx.getStorageSync("dqxj_collected") || [];

    this.setData({
      pet,
      discoveryCollected: readDiscovery().collectedAt !== null,
      chapter: chapter || null,
      city: city || null,
      story,
      landmarks,
      mileagePct: Math.min(Math.round((mileage / 5) * 100), 100),
      collected: chapter
        ? collectedChapters.includes((chapter as Record<string, unknown>).id)
        : false,
    });
  },
  goExplore(): void {
    wx.switchTab({ url: "/pages/beijing/beijing" });
  },
  goDiscovery(): void {
    wx.navigateTo({ url: discoveryPath });
  },
  goRead(): void {
    const ch = this.data.chapter as Record<string, unknown> | null;
    const c = this.data.city as Record<string, unknown> | null;
    if (ch && c) {
      wx.navigateTo({
        url:
          "/pages/city/city?cityId=" +
          (c.id as string) +
          "&chapterId=" +
          (ch.id as string),
      });
    }
  },
  onCollect(): void {
    const chapter = this.data.chapter as Record<string, unknown> | null;
    if (!chapter) return;
    const id = chapter.id as string;
    const list = wx.getStorageSync("dqxj_collected") || [];
    const idx = list.indexOf(id);
    if (idx >= 0) {
      list.splice(idx, 1);
      this.setData({ collected: false });
    } else {
      list.push(id);
      this.setData({ collected: true });
    }
    wx.setStorageSync("dqxj_collected", list);
    wx.showToast({
      title: this.data.collected ? "已收藏" : "已取消",
      icon: "none",
    });
  },
  onShareAppMessage(): { title: string; path: string } {
    const pet = this.data.pet as Record<string, unknown> | null;
    const city = this.data.city as Record<string, unknown> | null;
    const name = pet ? (pet.name as string) : "萌宠";
    const cityName = city ? (city.name as string) : "世界";
    return {
      title: `${name}带你看${cityName}`,
      path:
        "/pages/city/city?cityId=" +
        (city ? (city.id as string) : "") +
        "&chapterId=" +
        (this.data.chapter ? (this.data.chapter.id as string) : ""),
    };
  },
});
