import { buildHandbook, CityHandbook, handbookCity, handbookSharePath, parseSharedStamps, readHandbook } from '../../data/handbook';
import { createHandbookCover, createHandbookLeaf, createHandbookStrip } from '../../services/handbook-export';

Page({
  data: { book: null as CityHandbook | null, shared: false, pageIndex: 0, busy: false, error: '', savedCount: 0 },
  onLoad(options: { city?: string; from?: string; stamps?: string }): void {
    const cityId: string = options.city ?? 'city_beijing';
    const shared: boolean = options.from === 'share';
    this.setData({ shared, book: shared ? buildHandbook(cityId, parseSharedStamps(options.stamps ?? '')) : readHandbook(cityId) });
    wx.setNavigationBarTitle({ title: (shared ? '朋友的' : '我的') + this.data.book!.cityName + (this.data.book!.preview ? '试读纪念册' : '探索手册') });
  },
  onShow(): void { this.onCloudSnapshot(); },
  onCloudSnapshot(): void {
    if (!this.data.book || this.data.shared) return;
    const book: CityHandbook = readHandbook(this.data.book.cityId);
    this.setData({ book, pageIndex: Math.min(this.data.pageIndex, book.leaves.length + 1) });
  },
  onPageChange(event: WechatMiniprogram.SwiperChange): void { this.setData({ pageIndex: event.detail.current }); },
  onExplore(): void { handbookCity(this.data.book!.cityId).open(); },
  onOpenStory(): void {
    const leaf = this.data.book!.leaves[this.data.pageIndex - 1];
    if (!leaf) throw new RangeError('当前不是地标内页');
    wx.navigateTo({ url: leaf.path });
  },
  onOpenSettings(): void {
    wx.openSetting({ fail: (error): void => {
      console.error('相册权限设置未打开', { error });
      this.setData({ error: '未能打开设置，请从微信右上角菜单检查小程序的相册权限。' });
    } });
  },
  async onSaveCover(): Promise<void> {
    if (this.data.busy || !this.data.book?.leaves.length) return;
    this.setData({ busy: true, error: '', savedCount: 0 });
    try {
      const filePath: string = await createHandbookCover(this.data.book);
      await wx.saveImageToPhotosAlbum({ filePath });
      this.setData({ savedCount: 1 });
      wx.showToast({ title: '手册封面已保存', icon: 'success' });
    } catch (error) { this.showExportError(error); }
    finally { this.setData({ busy: false }); }
  },
  async onSaveLeaf(): Promise<void> {
    if (this.data.busy || !this.data.book) return;
    const leaf = this.data.book.leaves[this.data.pageIndex - 1];
    if (!leaf) return;
    this.setData({ busy: true, error: '', savedCount: 0 });
    try {
      const filePath: string = await createHandbookLeaf(this.data.book, leaf);
      await wx.saveImageToPhotosAlbum({ filePath });
      this.setData({ savedCount: 1 });
      wx.showToast({ title: '这一页已保存', icon: 'success' });
    } catch (error) { this.showExportError(error); }
    finally { this.setData({ busy: false }); }
  },
  async onSaveLong(): Promise<void> {
    if (this.data.busy || !this.data.book?.leaves.length) return;
    this.setData({ busy: true, error: '', savedCount: 0 });
    try {
      const book: CityHandbook = this.data.book;
      // 每张最多四页，避免完整城市手册超出手机画布与内存上限。
      for (let start: number = 0; start < book.leaves.length; start += 4) {
        const filePath: string = await createHandbookStrip(book, book.leaves.slice(start, start + 4));
        await wx.saveImageToPhotosAlbum({ filePath });
        this.setData({ savedCount: this.data.savedCount + 1 });
      }
      wx.showToast({ title: '手册长图已保存', icon: 'success' });
    } catch (error) { this.showExportError(error); }
    finally { this.setData({ busy: false }); }
  },
  showExportError(error: unknown): void {
    console.error('探索手册导出失败', { cityId: this.data.book?.cityId, savedCount: this.data.savedCount, error });
    this.setData({ error: (this.data.savedCount ? '已保存 ' + this.data.savedCount + ' 张。' : '') + '保存未完成，请检查网络和相册权限后重试。' });
  },
  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    const book: CityHandbook = this.data.book!;
    return { title: (this.data.shared ? '翻翻这本' : '我的') + book.cityName + (book.preview ? '试读纪念册 · ' : '探索手册 · ') + book.leaves.length + '枚印章，' + book.leaves.length + '段发现', path: handbookSharePath(book), imageUrl: book.cover };
  },
  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    const book: CityHandbook = this.data.book!;
    return { title: (this.data.shared ? '翻翻这本' : '我的') + book.cityName + (book.preview ? '试读纪念册 · ' : '探索手册 · ') + book.leaves.length + '段发现', query: handbookSharePath(book).split('?')[1], imageUrl: book.cover };
  },
});
