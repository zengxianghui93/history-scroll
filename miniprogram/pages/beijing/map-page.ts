import { isPublishedCity, xianPreviewPath } from '../../data/city-release';
import { beijingMapEntries, beijingMapPath, beijingMapSharePath, countBeijingLandmarkStamps, MapEntryView, readLitMapEntryIds, readMapEntries, takeBeijingResumeRequest, takeLandmarkSealFeedback } from '../../data/beijing-map';
import { FengwuCard, readBeijingFengwuCards } from '../../data/beijing-fengwu';
import { beijingScrolls, CityScroll, findScrollLandmark, ScrollLandmark, scrollIndexForLandmark, scrollLandmarks } from '../../data/beijing-scrolls';
import { beijingCityId, readCityScrollId, saveCityScrollId } from '../../data/city-scrolls';
import { readActiveScrollCity, xianCityId } from '../../data/city-scroll-position';
import { readXianStampIds, takeXianSealFeedback, xianScrolls, yongningGate } from '../../data/xian-scroll';

const mapUnfoldedKey: string = 'dqxj_beijing_map_unfolded';
const scrollHintKey: string = 'dqxj_beijing_scroll_hint_seen';
const legacyScrollPins: Readonly<Record<string, string>> = { axis: 'square', shichahai: 'hutong-lane', flavors: 'qianmen' };

function lastScrollIndex(cityId: string, scrolls: CityScroll[]): number {
  const scrollId: string = readCityScrollId(cityId);
  return Math.max(0, scrolls.findIndex((scroll): boolean => scroll.id === scrollId));
}

function cityMap(cityId: string): { cityId: string; cityName: string; inXian: boolean; scrolls: CityScroll[]; totalLandmarks: number } {
  const inXian: boolean = cityId === xianCityId;
  const scrolls: CityScroll[] = inXian ? xianScrolls : beijingScrolls;
  return { cityId, cityName: inXian ? '西安' : '北京', inXian, scrolls, totalLandmarks: inXian ? 1 : scrollLandmarks.length };
}

function findLegacyRecommendation(id: string): ScrollLandmark {
  const entry = beijingMapEntries.find((item): boolean => item.id === id);
  if (!entry) throw new RangeError('北京画卷旧分享地标不存在：' + id);
  return entry;
}

export function registerBeijingMapPage(): void {
  Page({
    data: {
      previewRedirected: false,
      entries: [] as MapEntryView[],
      ...cityMap(beijingCityId),
      mapWidth: 0,
      mapHeight: 0,
      currentScroll: 0,
      litLookup: {} as Record<string, boolean>,
      seenCount: 0,
      collectedCount: 0,
      bookmarkCount: 0,
      litCount: 0,
      freshSealId: '',
      selectedId: '',
      recommendedEntry: null as ScrollLandmark | null,
      recommendedPin: '',
      showScrollHint: false,
      invited: false,
      playMapIntro: false,
    },

    onReady(): void {
      this.measureMapStage();
    },

    onResize(): void {
      this.measureMapStage();
    },

    measureMapStage(): void {
      const query: WechatMiniprogram.SelectorQuery = wx.createSelectorQuery();
      query.select('.map-stage').boundingClientRect();
      query.select('.map-dots').boundingClientRect();
      query.exec((rects: Array<WechatMiniprogram.BoundingClientRectCallbackResult | null>): void => {
        const [stage, dots] = rects;
        if (!stage || !dots || stage.width <= 0 || dots.height <= 0 || stage.height <= dots.height) {
          throw new Error('无法测量北京画卷的可用空间');
        }
        const availableHeight: number = stage.height - dots.height;
        const mapWidth: number = Math.min(stage.width, availableHeight * 2 / 3);
        // 高屏适度拉高画面，低屏仍按原图比例完整展示。
        const mapHeight: number = Math.min(availableHeight, mapWidth * 1.65);
        this.setData({ mapWidth, mapHeight });
      });
    },

    onLoad(options: { entry?: string; from?: string; city?: string }): void {
      if (options.city && !isPublishedCity(options.city)) {
        this.setData({ previewRedirected: true });
        wx.redirectTo({ url: xianPreviewPath });
        return;
      }
      const invited: boolean = options.from === 'share';
      const isHome: boolean = '/' + this.route === beijingMapPath;
      const cityId: string = invited || !isHome ? (options.city === xianCityId ? xianCityId : beijingCityId) : readActiveScrollCity();
      const map = cityMap(cityId);
      const entryId: string | undefined = options.entry || (invited ? (map.inXian ? yongningGate.id : 'shichahai') : undefined);
      const legacyPin: string | undefined = entryId && !map.inXian ? legacyScrollPins[entryId] : undefined;
      const recommendedEntry: ScrollLandmark | null = entryId
        ? (map.inXian ? yongningGate : legacyPin ? findLegacyRecommendation(entryId) : findScrollLandmark(entryId)) : null;
      const recommendedPin: string = legacyPin ?? recommendedEntry?.id ?? '';
      if (map.inXian) wx.setNavigationBarTitle({ title: '西安 · 城市画卷' });
      this.setData({
        ...map,
        invited,
        recommendedEntry,
        recommendedPin,
        currentScroll: recommendedPin ? (map.inXian ? 0 : scrollIndexForLandmark(recommendedPin)) : lastScrollIndex(cityId, map.scrolls),
        showScrollHint: wx.getStorageSync(map.inXian ? 'dqxj_xian_scroll_hint_seen' : scrollHintKey) !== true,
      });
    },

    onCloudSnapshot(): void { this.onShow(); },

    onShow(): void {
      if (this.data.previewRedirected) return;
      const isHome: boolean = '/' + this.route === beijingMapPath;
      const resuming: boolean = isHome && takeBeijingResumeRequest();
      const cityId: string = isHome && (resuming || !this.data.invited) ? readActiveScrollCity() : this.data.cityId;
      const changed: boolean = cityId !== this.data.cityId;
      const map = cityMap(cityId);
      if (changed) wx.setNavigationBarTitle({ title: map.cityName + ' · 城市画卷' });
      if (map.inXian) {
        const ids: string[] = readXianStampIds();
        const freshSealId: string = takeXianSealFeedback();
        const currentScroll: number = freshSealId ? 0 : (resuming || changed ? lastScrollIndex(cityId, map.scrolls) : this.data.currentScroll);
        if (isHome && (freshSealId || ((resuming || !this.data.invited) && !readCityScrollId(cityId)))) saveCityScrollId(cityId, map.scrolls[currentScroll].id);
        this.setData({
          ...map, currentScroll, freshSealId, litCount: ids.includes(yongningGate.id) ? 1 : 0,
          litLookup: { [yongningGate.id]: ids.includes(yongningGate.id) },
          ...(changed || resuming ? { invited: false, recommendedEntry: null, recommendedPin: '', selectedId: '',
            showScrollHint: wx.getStorageSync('dqxj_xian_scroll_hint_seen') !== true } : {}),
        });
        return;
      }
      const entries: MapEntryView[] = readMapEntries();
      const cards: FengwuCard[] = readBeijingFengwuCards();
      const litIds: string[] = readLitMapEntryIds();
      const litLookup: Record<string, boolean> = Object.fromEntries(litIds.map((id: string): [string, boolean] => [id, true]));
      const litCount: number = countBeijingLandmarkStamps(litIds);
      const bookmarkCount: number = entries.filter((entry: MapEntryView): boolean => entry.id === 'axis')
        .reduce((count: number, entry: MapEntryView): number => count + entry.collectionCount, 0);
      const freshSealId: string = takeLandmarkSealFeedback();
      const currentScroll: number = freshSealId ? scrollIndexForLandmark(freshSealId)
        : (resuming || changed ? lastScrollIndex(cityId, map.scrolls) : this.data.currentScroll);
      if (isHome && (freshSealId || ((resuming || !this.data.recommendedPin) && !readCityScrollId(beijingCityId)))) {
        saveCityScrollId(beijingCityId, beijingScrolls[currentScroll].id);
      }
      this.setData({
        ...map,
        entries,
        seenCount: entries.filter((entry: MapEntryView): boolean => entry.state !== 'unseen').length,
        collectedCount: cards.filter((card: FengwuCard): boolean => card.lit).length,
        bookmarkCount,
        litLookup,
        litCount,
        freshSealId,
        currentScroll,
        ...(resuming || changed ? { invited: false, recommendedEntry: null, recommendedPin: '', selectedId: '',
          showScrollHint: wx.getStorageSync(scrollHintKey) !== true } : {}),
      });
    },

    onOpenEntry(event: WechatMiniprogram.TouchEvent): void {
      const id: string = event.currentTarget.dataset.id;
      const entry: ScrollLandmark = this.data.inXian && id === yongningGate.id ? yongningGate : findScrollLandmark(id);
      this.openLandmark(entry);
    },

    onOpenRecommendation(): void {
      if (!this.data.recommendedEntry) throw new Error('北京画卷没有推荐地标');
      this.openLandmark(this.data.recommendedEntry);
    },

    openLandmark(entry: ScrollLandmark): void {
      wx.navigateTo({
        url: entry.path,
        success: (): void => {
          this.setData({ selectedId: entry.id });
        },
        fail: (error: WechatMiniprogram.GeneralCallbackResult): void => {
          console.error('打开北京地标失败', { id: entry.id, url: entry.path, error: error.errMsg });
          wx.showToast({ title: '暂时打不开这处地标', icon: 'none' });
        },
      });
    },

    onScrollChange(event: WechatMiniprogram.SwiperChange): void {
      if (event.detail.source === 'touch') this.selectScroll(event.detail.current);
    },

    onScrollDot(event: WechatMiniprogram.TouchEvent): void {
      this.selectScroll(Number(event.currentTarget.dataset.index));
    },

    selectScroll(index: number): void {
      const { scrolls, cityId, inXian } = this.data;
      if (!Number.isInteger(index) || index < 0 || index >= scrolls.length) {
        throw new RangeError('城市画卷页码不存在：' + index);
      }
      if (index === this.data.currentScroll) return;
      if (this.data.showScrollHint) wx.setStorageSync(inXian ? 'dqxj_xian_scroll_hint_seen' : scrollHintKey, true);
      if ('/' + this.route === beijingMapPath) saveCityScrollId(cityId, scrolls[index].id);
      this.setData({ currentScroll: index, showScrollHint: false, playMapIntro: false, freshSealId: '' });
    },

    // 插画加载后才展开；独立记录展示状态，不改变探索与收藏进度。
    onMapImageLoad(): void {
      const key: string = this.data.inXian ? 'dqxj_xian_map_unfolded' : mapUnfoldedKey;
      const unfolded: unknown = wx.getStorageSync(key);
      if (unfolded === true) return;
      if (unfolded !== '') throw new TypeError('城市画卷展示记录格式错误：' + key);
      wx.setStorageSync(key, true);
      this.setData({ playMapIntro: true });
    },

    onMapIntroEnd(event: { detail: { animationName: string } }): void {
      if (event.detail.animationName === 'map-unfold') this.setData({ playMapIntro: false });
    },

    onHide(): void {
      this.setData({ playMapIntro: false, freshSealId: '' });
    },

    onSealGlowEnd(event: { detail: { animationName: string }; currentTarget: { dataset: { id: string } } }): void {
      if (event.detail.animationName === 'map-seal-glow' && event.currentTarget.dataset.id === this.data.freshSealId) {
        this.setData({ freshSealId: '' });
      }
    },

    onIntroduction(): void {
      wx.navigateTo({ url: '/pages/beijing-overview/beijing-overview' });
    },

    getShareEntry(): ScrollLandmark {
      if (this.data.inXian) return yongningGate;
      const scroll = beijingScrolls[this.data.currentScroll];
      const selected: ScrollLandmark | undefined = scroll.landmarks.find((entry: ScrollLandmark): boolean => entry.id === this.data.selectedId);
      const recommendation: ScrollLandmark | undefined = scroll.landmarks.find((entry: ScrollLandmark): boolean => entry.id === this.data.recommendedPin);
      return selected ?? recommendation ?? scroll.landmarks[0];
    },

    getShareDetails(): { title: string; query: string; imageUrl?: string } {
      const entry: ScrollLandmark = this.getShareEntry();
      if (this.data.inXian) return {
        title: '西安城市画卷 · 从永宁门开始', query: 'from=share&city=' + xianCityId + '&entry=' + entry.id,
      };
      return {
        title: entry.story?.title ?? '北京城市画卷 · 从' + entry.name + '开始',
        query: 'from=share&entry=' + entry.id,
        imageUrl: beijingScrolls[this.data.currentScroll].image,
      };
    },

    onShareAppMessage(): { title: string; path: string; imageUrl?: string } {
      const { title, query, imageUrl } = this.getShareDetails();
      return { title, path: beijingMapSharePath + '?' + query, ...(imageUrl ? { imageUrl } : {}) };
    },

    onShareTimeline(): { title: string; query: string; imageUrl?: string } {
      return this.getShareDetails();
    },
  });
}
