import { isPublishedCity, xianPreviewPath } from '../../data/city-release';
import { readCityProgress } from '../../data/city-progress';
import { isLoggedIn } from '../../services/cloud-account';
import { cloudAsset } from '../../services/cloud-assets';
import { outcomeIcons, readCityStampIds, readChapterIds } from '../../data/beijing-outcomes';
import { FengwuCard, FengwuEntry } from '../../data/beijing-fengwu';
import { resumeCityMap } from '../../data/beijing-map';
import { readResumeFengwu } from '../../data/beijing-journey';
import { BeijingBrief, beijingBriefs, beijingPlacePath, findBeijingBrief, readBeijingBriefIds } from '../../data/beijing-briefs';
import { beijingScrolls, scrollLandmarks } from '../../data/beijing-scrolls';
import { beijingCityId, CityAlbumSection, CityAlbumStamp, otherPublishedCityScrolls, nextPublishedCityScroll, publishedCityScrolls, PublishedCityScroll, readCityScrollId } from '../../data/city-scrolls';
import { readActiveScrollCity, xianCityId } from '../../data/city-scroll-position';
import { xianScrolls } from '../../data/xian-scroll';

interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  on: boolean;
}

interface ReadingRecord {
  id: string;
  cityId: string;
  cityName: string;
  title: string;
  takeaway: string;
}

interface AlbumStamp extends CityAlbumStamp {
  collected: boolean;
  imprint: string;
}

interface AlbumSection extends Omit<CityAlbumSection, 'landmarks'> {
  stamps: AlbumStamp[];
  rows: number;
}

interface CityAlbum {
  preview: boolean;
  cover: string;
  unopened: boolean;
  id: string;
  name: string;
  sections: AlbumSection[];
  collected: number;
  total: number;
  archived: boolean;
}

interface SavedStory extends FengwuCard {
  cityId: string;
  cityName: string;
  path: string;
  key: string;
}

function readAlbum(city: PublishedCityScroll, latestCityId: string): CityAlbum {
  const stampIds: string[] = city.readStampIds();
  const asStamp = (entry: CityAlbumStamp): AlbumStamp => ({
    ...entry,
    collected: stampIds.includes(entry.id),
    imprint: entry.name.split(' · ')[0],
  });
  const sections: AlbumSection[] = city.stampSections.map((section): AlbumSection => ({
    id: section.id, name: section.name, stamps: section.landmarks.map(asStamp), rows: Math.ceil(section.landmarks.length / 3),
  }));
  const currentStamps: AlbumStamp[] = sections.flatMap((section): AlbumStamp[] => section.stamps);
  const collected: number = currentStamps.filter((stamp): boolean => stamp.collected).length;
  const pastStamps: AlbumStamp[] = city.pastStamps.map(asStamp).filter((stamp): boolean => stamp.collected);
  if (pastStamps.length) sections.push({ id: 'past', name: '早期印章', stamps: pastStamps, rows: Math.ceil(pastStamps.length / 3) });
  const total: number = currentStamps.length;
  return { preview: !isPublishedCity(city.id), cover: city.cover, unopened: city.id !== beijingCityId && collected === 0, id: city.id, name: city.name, sections, collected, total, archived: isPublishedCity(city.id) && total > 0 && collected === total && city.id !== latestCityId };
}

Page({
  data: {
    overviewImage: cloudAsset('/images/beijing/scroll-axis.jpg'),
    showCitySheet: false,
    nextCityAvailable: true,
    rewardTotal: 19,
    nextCityId: xianCityId,
    nextCityName: '西安',
    nextCityCover: xianScrolls[0].image,
    rewardReady: false,
    rewardCount: 0,
    rewardThreshold: 10,
    rewardRemaining: 10,
    rewardPercent: 0,
    loggedIn: false,
    total: 0,
    outcomeIcons,
    beijingStampEarned: false,
    collectedCount: 0,
    footprints: [] as Array<Record<string, unknown>>,
    readingRecords: [] as ReadingRecord[],
    briefRecords: [] as BeijingBrief[],
    albums: [] as CityAlbum[],
    albumIndex: 0,
    sectionIndex: 0,
    latestCityId: '',
    currentLandmarkCount: 0,
    landmarkTotal: scrollLandmarks.length,
    lastScrollName: '',
    hasNewCity: false,
    previewAvailable: !isPublishedCity(xianCityId),
    handbookAlbums: [] as CityAlbum[],
    activeCityId: beijingCityId,
    activeCityName: '北京',
    xianActive: false,
    xianCover: xianScrolls[0].image,
    achievements: [] as Achievement[],
    nextGoal: '' as string,
    fenwuLit: 0,
    fenwuTotal: 0,
    collectedFengwuCards: [] as SavedStory[],
    uncollectedFengwuCards: [] as SavedStory[],
    visibleStories: [] as SavedStory[],
    visibleUncollected: [] as SavedStory[],
    showUncollected: false,
    storyCities: [] as Array<{ id: string; name: string }>,
    storyCity: 'all',
    showOtherRecords: false,
    resume: null as FengwuEntry | null,
  },

  onLogin(): void { wx.navigateTo({ url: '/account/pages/login/login' }); },

  onCloudSnapshot(): void { this.onShow(); },

  onShow(): void {
    this.setData({ loggedIn: isLoggedIn() });
    const app = getApp() as unknown as {
      globalData: { cities: Record<string, unknown>[]; chapters: Record<string, unknown>[] };
    };
    const cities = app.globalData.cities || [];
    const chaptersArr = app.globalData.chapters || [];
    const collectedCities: string[] = readCityStampIds();
    const collectedChapters: string[] = readChapterIds();
    const readBriefIds: string[] = readBeijingBriefIds();
    const checkins = wx.getStorageSync('dqxj_checkins') || [];

    const collectedCount = collectedCities.filter((id): boolean => id === beijingCityId).length;
    const total = cities.filter((city): boolean => city.id === beijingCityId).length;

    const footprints = cities.filter((city): boolean => city.id === beijingCityId || collectedCities.includes(city.id as string)).map((c) => ({
      id: c.id,
      name: c.name,
      on: (collectedCities as string[]).indexOf(c.id as string) >= 0,
    }));

    const latestCityId: string = [...collectedCities].reverse().find((id): boolean =>
      publishedCityScrolls.some((city): boolean => city.id === id && isPublishedCity(city.id))) ?? beijingCityId;
    const albums: CityAlbum[] = publishedCityScrolls.map((city): CityAlbum => readAlbum(city, latestCityId));
    const previousAlbum: CityAlbum | undefined = this.data.albums[this.data.albumIndex];
    const selectedId: string = this.data.latestCityId === latestCityId && previousAlbum ? previousAlbum.id : latestCityId;
    const albumIndex: number = albums.findIndex((album): boolean => album.id === selectedId);
    const sectionIndex: number = selectedId === previousAlbum?.id
      ? Math.min(this.data.sectionIndex, albums[albumIndex].sections.length - 1) : 0;
    const fengwuCards: SavedStory[] = publishedCityScrolls.flatMap((city): SavedStory[] => {
      const storyIds: string[] = city.readStoryIds();
      return city.readStories()
        .sort((first, second): number => storyIds.indexOf(second.id) - storyIds.indexOf(first.id))
        .map((card): SavedStory => ({ ...card, cityId: city.id, cityName: city.name, path: city.storyPath(card.id), key: city.id + ':' + card.id }));
    });
    const collectedFengwuCards: SavedStory[] = fengwuCards.filter((card): boolean => card.lit);
    const uncollectedFengwuCards: SavedStory[] = fengwuCards.filter((card): boolean => !card.lit);
    const storyCities = [{ id: 'all', name: '全部' }, ...publishedCityScrolls.filter((city): boolean => collectedFengwuCards.some((card): boolean => card.cityId === city.id)).map(({ id, name }) => ({ id, name }))];
    const storyCity: string = storyCities.some((city): boolean => city.id === this.data.storyCity) ? this.data.storyCity : 'all';
    const activeCityId: string = readActiveScrollCity();
    const xianActive: boolean = activeCityId === xianCityId;
    const activeAlbum = albums.find((album): boolean => album.id === activeCityId);
    if (!activeAlbum) throw new RangeError('当前城市集章册不存在：' + activeCityId);
    const lastScrollId: string = readCityScrollId(activeCityId);
    const activeScrolls = xianActive ? xianScrolls : beijingScrolls;
    const activeProgress = readCityProgress(activeCityId);
    const nextCity = nextPublishedCityScroll(activeCityId);

    // 阅读记录沿用历史章节数据，与风物收藏分别展示。
    const cName: Record<string, string> = {};
    cities.forEach((c) => { cName[c.id as string] = c.name as string; });
    const readingRecords = Array.from(new Set(collectedChapters)).map((id) => {
      const ch = (chaptersArr as Record<string, unknown>[]).find((c) => c.id === id);
      if (!ch) return null;
      return {
        id,
        cityId: ch.cityId as string,
        cityName: cName[ch.cityId as string] || '',
        title: ch.title as string,
        takeaway: (ch.takeaway as string) || '',
      };
    }).filter(Boolean) as ReadingRecord[];

    const has = (id: string) => (collectedCities as string[]).indexOf(id) >= 0;
    const ACH: Achievement[] = [
      { id: 'beijing-half', icon: '印', name: '半城足迹', desc: '北京地标印章达到一半', on: readCityProgress(beijingCityId).rewardReady },
      { id: 'reader', icon: '📚', name: '读城人', desc: '读满 5 篇小卷', on: readingRecords.length >= 5 },
      { id: 'beijing-full', icon: '册', name: '京城成册', desc: '集齐北京地标印章', on: readCityProgress(beijingCityId).complete },
      { id: 'gudu', icon: '🏯', name: '古都巡礼', desc: '获得北京与西安印章', on: has('city_beijing') && has('city_xian') },
      { id: 'bingcheng', icon: '❄️', name: '冰城客', desc: '获得哈尔滨印章', on: has('city_harbin') },
      { id: 'jingguan', icon: '🐼', name: '锦官城主', desc: '获得成都印章', on: has('city_chengdu') },
      { id: 'jiangnan', icon: '🌿', name: '江南忆', desc: '获得杭州印章', on: has('city_hangzhou') },
      { id: 'quanjuan', icon: '📜', name: '卷遍五城', desc: '读满 10 篇小卷', on: readingRecords.length >= 10 },
      { id: 'qicheng', icon: '🚩', name: '启程', desc: '真实打卡 1 城', on: (checkins as string[]).length >= 1 },
    ];
    // 已获得排前，凸显已有成果
    ACH.sort((a, b) => (b.on ? 1 : 0) - (a.on ? 1 : 0));

    // 最近可完成目标提示
    const beijingProgress = readCityProgress(beijingCityId);
    const nextGoal: string = !beijingProgress.rewardReady ? '半城足迹 · 再点亮 ' + (beijingProgress.rewardThreshold - beijingProgress.count) + ' 处北京地标' : !beijingProgress.complete ? '京城成册 · 再点亮 ' + (beijingProgress.total - beijingProgress.count) + ' 处北京地标' : '';

    this.setData({
      storyCity,
      nextCityAvailable: !!nextCity,
      nextCityId: nextCity?.id ?? '', nextCityName: nextCity?.name ?? '', nextCityCover: nextCity?.cover ?? '',
      rewardReady: activeProgress.rewardReady,
      rewardCount: activeProgress.count,
      rewardTotal: activeProgress.total,
      rewardThreshold: activeProgress.rewardThreshold,
      rewardRemaining: Math.max(0, activeProgress.rewardThreshold - activeProgress.count),
      rewardPercent: activeProgress.rewardThreshold ? Math.min(100, Math.floor(activeProgress.count / activeProgress.rewardThreshold * 100)) : 0,
      beijingStampEarned: collectedCities.includes('city_beijing'),
      total,
      collectedCount,
      footprints,
      readingRecords,
      albums,
      handbookAlbums: albums.filter((album): boolean => !album.preview || album.collected > 0),
      albumIndex,
      sectionIndex,
      latestCityId,
      activeCityId,
      activeCityName: activeAlbum.name,
      xianActive,
      currentLandmarkCount: activeAlbum.collected,
      landmarkTotal: activeAlbum.total,
      lastScrollName: activeScrolls.find((scroll): boolean => scroll.id === lastScrollId)?.name ?? '',
      hasNewCity: otherPublishedCityScrolls(activeCityId).length > 0,
      briefRecords: beijingBriefs.filter((brief: BeijingBrief): boolean => readBriefIds.includes(brief.id)),
      fenwuLit: collectedFengwuCards.length,
      fenwuTotal: fengwuCards.length,
      collectedFengwuCards,
      uncollectedFengwuCards,
      visibleStories: collectedFengwuCards.filter((card): boolean => storyCity === 'all' || card.cityId === storyCity),
      visibleUncollected: uncollectedFengwuCards.filter((card): boolean => storyCity === 'all' || card.cityId === storyCity),
      storyCities,
      resume: readResumeFengwu(),
      achievements: ACH.filter((achievement): boolean => achievement.on || ['beijing-half', 'beijing-full', 'reader'].includes(achievement.id)),
      nextGoal,
    });
  },

  onAlbumTap(event: WechatMiniprogram.TouchEvent): void {
    this.selectAlbum(Number(event.currentTarget.dataset.index));
  },
  onAlbumSwipe(event: WechatMiniprogram.SwiperChange): void {
    if (event.detail.source === 'touch') this.selectAlbum(event.detail.current);
  },
  selectAlbum(index: number): void {
    if (!this.data.albums[index]) throw new RangeError('城市集章册不存在：' + index);
    if (index !== this.data.albumIndex) this.setData({ albumIndex: index, sectionIndex: 0 });
  },
  onSectionTap(event: WechatMiniprogram.TouchEvent): void {
    const sectionIndex: number = Number(event.currentTarget.dataset.index);
    if (!this.data.albums[this.data.albumIndex].sections[sectionIndex]) throw new RangeError('集章册分册不存在：' + sectionIndex);
    this.setData({ sectionIndex });
  },
  onStoryFilter(event: WechatMiniprogram.TouchEvent): void {
    const storyCity: string = event.currentTarget.dataset.id;
    if (!this.data.storyCities.some((city): boolean => city.id === storyCity)) throw new RangeError('见闻城市不存在：' + storyCity);
    const matchesCity = (card: SavedStory): boolean => storyCity === 'all' || card.cityId === storyCity;
    this.setData({
      storyCity,
      visibleStories: this.data.collectedFengwuCards.filter(matchesCity),
      visibleUncollected: this.data.uncollectedFengwuCards.filter(matchesCity),
    });
  },
  goFengwu(event: WechatMiniprogram.TouchEvent): void {
    const { id, city } = event.currentTarget.dataset;
    const entry: SavedStory | undefined = [...this.data.collectedFengwuCards, ...this.data.uncollectedFengwuCards]
      .find((card): boolean => card.id === id && card.cityId === city);
    if (!entry) throw new RangeError('见闻不存在：' + String(id));
    wx.navigateTo({ url: entry.path });
  },
  goReading(event: WechatMiniprogram.TouchEvent): void {
    const id: string = event.currentTarget.dataset.id as string;
    const record = this.data.readingRecords.find((item): boolean => item.id === id);
    if (!record) throw new RangeError('阅读记录不存在：' + id);
    wx.navigateTo({ url: '/pages/city/city?cityId=' + record.cityId + '&chapterId=' + id + '&section=diary' });
  },
  goBrief(event: WechatMiniprogram.TouchEvent): void {
    const id: string = event.currentTarget.dataset.id as string;
    wx.navigateTo({ url: findBeijingBrief(id).path });
  },
  goBeijingFengwu(): void {
    resumeCityMap(this.data.activeCityId);
  },
  onExploreNewCity(): void {
    if (this.data.previewAvailable && !this.data.hasNewCity) { this.setData({ showCitySheet: true }); return; }
    const cities = otherPublishedCityScrolls(this.data.activeCityId);
    if (!cities.length) return;
    const next = nextPublishedCityScroll(this.data.activeCityId);
    if (next && !this.data.rewardReady) {
      this.setData({ showCitySheet: true, nextCityId: next.id, nextCityName: next.name, nextCityCover: next.cover });
      return;
    }
    (next ?? cities[0]).open();
  },
  onCloseCitySheet(): void { this.setData({ showCitySheet: false }); },
  onSheetMove(): void {},
  onOpenPreviewCity(): void {
    if (this.data.previewAvailable && !this.data.nextCityAvailable) { this.onCloseCitySheet(); wx.navigateTo({ url: xianPreviewPath }); return; }
    const city = publishedCityScrolls.find((entry): boolean => entry.id === this.data.nextCityId);
    if (!city) throw new RangeError('下一座城市不存在：' + this.data.nextCityId);
    this.onCloseCitySheet(); city.open();
  },
  onContinueCity(): void { this.onCloseCitySheet(); resumeCityMap(this.data.activeCityId); },
  onOpenAlbumCity(event: WechatMiniprogram.TouchEvent): void {
    const city = publishedCityScrolls.find((entry): boolean => entry.id === event.currentTarget.dataset.city);
    if (!city) throw new RangeError('城市不存在：' + event.currentTarget.dataset.city);
    city.open();
  },
  onHandbook(event: WechatMiniprogram.TouchEvent): void {
    const cityId: string = event.currentTarget.dataset.city;
    if (!publishedCityScrolls.some((city): boolean => city.id === cityId)) throw new RangeError('手册城市不存在：' + cityId);
    wx.navigateTo({ url: '/memories/pages/handbook/handbook?city=' + encodeURIComponent(cityId) });
  },
  goLandmark(event: WechatMiniprogram.TouchEvent): void {
    const { id, city } = event.currentTarget.dataset;
    const album: CityAlbum | undefined = this.data.albums.find((item): boolean => item.id === city);
    const stamp: AlbumStamp | undefined = album?.sections.flatMap((section): AlbumStamp[] => section.stamps)
      .find((entry): boolean => entry.id === id);
    if (!stamp) throw new RangeError('地标印章不存在：' + String(id));
    wx.navigateTo({ url: stamp.path });
  },
  onResume(): void {
    if (!this.data.resume) throw new Error('当前没有可续看的北京见闻');
    wx.navigateTo({ url: beijingPlacePath(this.data.resume.id) });
  },
  onToggleOtherRecords(): void {
    this.setData({ showOtherRecords: !this.data.showOtherRecords });
  },
  onToggleUncollected(): void {
    this.setData({ showUncollected: !this.data.showUncollected });
  },
  onTapAch(e: WechatMiniprogram.TouchEvent): void {
    const name = e.currentTarget.dataset.name as string;
    const desc = e.currentTarget.dataset.desc as string;
    wx.showToast({ title: name + '：' + desc, icon: 'none' });
  },
});
