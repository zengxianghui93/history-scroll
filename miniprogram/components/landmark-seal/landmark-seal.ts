import { isPublishedCity } from '../../data/city-release';
import { readCityProgress } from '../../data/city-progress';
import { cloudAsset } from '../../services/cloud-assets';
import { isLoggedIn, refreshCloud, showCloudError } from '../../services/cloud-account';
import { readLitMapEntryIds, returnToCityMap, stampBeijingLandmark } from '../../data/beijing-map';
import { findScrollLandmark } from '../../data/beijing-scrolls';
import { beijingCityId, nextPublishedCityScroll } from '../../data/city-scrolls';
import { xianCityId } from '../../data/city-scroll-position';
import { readXianStampIds, stampXianLandmark, yongningGate } from '../../data/xian-scroll';

Component({
  properties: {
    landmarkId: { type: String, value: '', observer: 'syncSeal' },
    cityId: { type: String, value: beijingCityId, observer: 'syncSeal' },
  },
  data: {
    revealImage: cloudAsset('/images/beijing/palace-seal-reveal.jpg'),
    blankImage: cloudAsset('/images/beijing/palace-seal-blank.jpg'),
    stamped: false,
    loggedIn: false,
    busy: false,
    showSeal: false,
    sealName: '',
    palaceReveal: false,
    palaceImpactPending: false,
    passedHalf: false,
    nextCityName: '',
    cityName: '北京',
    milestoneCount: 0,
    milestoneTotal: 0,
    complete: false,
  },
  pageLifetimes: {
    show(): void {
      this.syncSeal();
      refreshCloud().then((): void => { this.syncSeal(); }).catch(showCloudError);
    },
    hide(): void {
      this.onCloseSeal();
    },
  },
  methods: {
    syncSeal(): void {
      const id: string = this.properties.landmarkId;
      if (!id) return;
      const inXian: boolean = this.properties.cityId === xianCityId;
      const stamps: string[] = inXian ? readXianStampIds() : readLitMapEntryIds();
      const landmark = inXian ? yongningGate : findScrollLandmark(id);
      this.setData({ loggedIn: isLoggedIn(), stamped: stamps.includes(id), sealName: landmark.name, palaceReveal: !inXian && id === 'palace',
        cityName: inXian ? '西安' : '北京' });
    },
    async onStamp(): Promise<void> {
      if (this.data.stamped || this.data.busy) return;
      if (!isLoggedIn()) { wx.navigateTo({ url: '/account/pages/login/login' }); return; }
      this.setData({ busy: true });
      try {
        const id: string = this.properties.landmarkId;
        const { status, passedHalf: earnedHalf } = this.properties.cityId === xianCityId
          ? await stampXianLandmark(id) : await stampBeijingLandmark(id);
        const progress = readCityProgress(this.properties.cityId);
        const earned: boolean = status === 'earned';
        const passedHalf: boolean = earnedHalf && isPublishedCity(this.properties.cityId);
        const nextCityName: string = passedHalf ? nextPublishedCityScroll(this.properties.cityId)?.name ?? '' : '';
        this.setData({ stamped: true, showSeal: earned, passedHalf, nextCityName, milestoneCount: progress.count, milestoneTotal: progress.total, complete: progress.complete, palaceImpactPending: earned && this.data.palaceReveal });
        if (earned && !this.data.palaceReveal) this.vibrateSeal();
      } catch (error) { showCloudError(error); } finally { this.setData({ busy: false }); }
    },
    onPalaceImpact(event: { detail: { animationName: string } }): void {
      if (!this.data.showSeal || !this.data.palaceImpactPending || event.detail.animationName !== 'palace-seal-drop') return;
      this.setData({ palaceImpactPending: false });
      this.vibrateSeal();
    },
    vibrateSeal(): void {
      if (wx.canIUse('vibrateShort')) {
        wx.vibrateShort({ type: 'light', fail: (error): void => {
          console.warn('地标盖章触感不可用', { id: this.properties.landmarkId, error: error.errMsg });
        } });
      }
    },
    onCloseSeal(): void {
      this.setData({ showSeal: false, passedHalf: false, nextCityName: '' });
    },
    onReturnToMap(): void {
      this.onCloseSeal();
      returnToCityMap(this.properties.cityId);
    },
    onHandbook(): void { this.onCloseSeal(); wx.navigateTo({ url: '/memories/pages/handbook/handbook?city=' + encodeURIComponent(this.properties.cityId) }); },
    onOpenNextCity(): void {
      const city = nextPublishedCityScroll(this.properties.cityId);
      if (!this.data.passedHalf || !city) return;
      this.onCloseSeal();
      city.open();
    },
    onOverlayMove(): void {},
  },
});
