import { xianPreviewPath } from '../../data/city-release';
import { writeProgress } from '../../services/cloud-account';
import { markBeijingChapterRead, outcomeIcons, readCityStampIds } from '../../data/beijing-outcomes';
import { discoveryPath } from '../../data/beijing-discovery';
import { findBeijingFengwu, readBeijingFengwuCards } from '../../data/beijing-fengwu';
import { beijingPlacePath } from '../../data/beijing-briefs';
import { beijingMapPath, returnToBeijingMap } from '../../data/beijing-map';

// 城市主页：封面 → 名称溯源 → 玩法卡 → 风物见闻 → 橘橘日记(浅/深卷) → 延伸知识 → 时间线
interface CityBlock {
  id: string;
  icon: string;
  title: string;
  text: string;
  facts: string[];
  nodes: string[];
  needFold: boolean;
  expanded: boolean;
}

interface DeepPoint {
  icon: string;
  title: string;
  text: string;
}

// 风物卡：美食 / 景点，插画展示与见闻收藏
interface FenwuCard {
  id: string;
  name: string;
  emoji: string;
  intro: string;
  cls: string;
  kind: 'food' | 'spot';
  lit: boolean;
}

interface TravelNode {
  date: string;
  cityName: string;
  title: string;
}

interface ChapterTab {
  id: string;
  title: string;
}

interface ChapterSource {
  title: string;
  url: string;
}

function spotIcon(type: string): { icon: string; cls: string } {
  const t = (type || '').toLowerCase();
  if (t.indexOf('mountain') >= 0) return { icon: '🏔', cls: 'green' };
  if (t.indexOf('park') >= 0) return { icon: '🏞', cls: 'green' };
  if (t.indexOf('water') >= 0 || t.indexOf('river') >= 0 || t.indexOf('lake') >= 0) return { icon: '🌊', cls: 'blue' };
  if (t.indexOf('historic') >= 0 || t.indexOf('temple') >= 0 || t.indexOf('palace') >= 0) return { icon: '🏛', cls: 'orange' };
  return { icon: '🎡', cls: 'orange' };
}

// 美食插画占位 emoji（后续替换为 AI 插画）
function foodEmoji(name: string): string {
  const n = (name || '');
  if (n.indexOf('鸭') >= 0) return '🦆';
  if (n.indexOf('涮') >= 0 || n.indexOf('火锅') >= 0 || n.indexOf('锅') >= 0) return '🍲';
  if (n.indexOf('面') >= 0) return '🍜';
  if (n.indexOf('肠') >= 0) return '🌭';
  if (n.indexOf('冰') >= 0 || n.indexOf('棍') >= 0) return '🍦';
  if (n.indexOf('饼') >= 0 || n.indexOf('包') >= 0 || n.indexOf('馍') >= 0) return '🥯';
  if (n.indexOf('豆腐') >= 0) return '🥘';
  if (n.indexOf('鱼') >= 0) return '🐟';
  if (n.indexOf('虾') >= 0) return '🍤';
  if (n.indexOf('肉') >= 0) return '🥩';
  if (n.indexOf('糕') >= 0 || n.indexOf('卷') >= 0) return '🍡';
  if (n.indexOf('酒') >= 0 || n.indexOf('饮') >= 0) return '🥤';
  return '🍜';
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return (d.getMonth() + 1) + '/' + d.getDate();
}

Page({
  data: {
    city: null as Record<string, unknown> | null,
    petName: '',
    petEmoji: '🐱',
    hasDiscovery: false,
    chapter: null as Record<string, unknown> | null,
    deepPoints: [] as DeepPoint[],
    shallowTabs: [] as ChapterTab[],
    deepTabs: [] as ChapterTab[],
    chapterRead: false,
    blocks: [] as CityBlock[],
    fenwu: [] as FenwuCard[],
    fenwuLitCount: 0,
    fenwuTotal: 0,
    collected: false,
    want: false,
    outcomeIcons,
    stampAwarded: false,
    timeline: [] as TravelNode[],
    targetSection: '',
    focusedFengwuId: '',
    focusedFengwuAnchor: '',
  },

  onLoad(options: Record<string, string>): void {
    if (options.cityId === 'city_xian') { wx.redirectTo({ url: xianPreviewPath }); return; }
    if (options.cityId === 'city_beijing' && !options.chapterId && !options.section && options.view !== 'reading') {
      wx.switchTab({ url: beijingMapPath });
      return;
    }
    const app = getApp() as unknown as {
      globalData: { cities: Record<string, unknown>[]; chapters: Record<string, unknown>[]; pet: Record<string, unknown> | null };
    };
    const cities = app.globalData.cities || [];
    const chaptersArr = app.globalData.chapters || [];
    const city = (cities as Record<string, unknown>[]).find((c) => c.id === options.cityId) || null;
    if (!city) throw new RangeError('城市不存在：' + options.cityId);
    wx.setNavigationBarTitle({ title: (city.name as string) || '城市' });

    const pet = app.globalData.pet;
    const petName = pet ? ((pet.name as string) || '萌宠') : '萌宠';
    const petEmoji = pet && (pet.species as string) === 'dog' ? '🐶' : '🐱';

    const origin = (city.origin || {}) as Record<string, unknown>;
    const facts = (city.facts as string[]) || [];
    const food = (origin.food as string[]) || [];
    const history = (origin.history as string) || '';

    const raw: Array<{ id: string; icon: string; title: string; text: string; facts: string[]; nodes: string[] }> = [
      { id: 'name', icon: '📖', title: '名称溯源', text: (origin.nameSource as string) || '', facts: [], nodes: [] },
      { id: 'history', icon: '🏛', title: '历史沿革', text: '', facts: [], nodes: history.split('→').map((s) => s.trim()).filter(Boolean) },
      { id: 'facts', icon: '💡', title: '冷知识', text: '', facts, nodes: [] },
    ];
    const blocks: CityBlock[] = raw.map((b) => ({
      id: b.id,
      icon: b.icon,
      title: b.title,
      text: b.text,
      facts: b.facts,
      nodes: b.nodes,
      needFold: b.id === 'name' ? b.text.length > 54 : false,
      expanded: false,
    }));

    // 风物册：美食 + 景点，插画卡与见闻收藏
    const litKey = 'dqxj_lit_' + (city.id as string);
    const litList = (wx.getStorageSync(litKey) || []) as string[];
    const foodCards: FenwuCard[] = food.map((f: string) => ({
      id: 'food:' + f,
      name: f,
      emoji: foodEmoji(f),
      intro: '',
      cls: 'orange',
      kind: 'food',
      lit: litList.indexOf('food:' + f) >= 0,
    }));
    const spotCards: FenwuCard[] = ((city.spots as Record<string, unknown>[]) || []).map((s) => {
      const ic = spotIcon(s.type as string);
      return {
        id: 'spot:' + (s.name as string),
        name: s.name as string,
        emoji: ic.icon,
        intro: (s.intro as string) || '',
        cls: ic.cls,
        kind: 'spot',
        lit: litList.indexOf('spot:' + (s.name as string)) >= 0,
      } as FenwuCard;
    });
    const fenwu: FenwuCard[] = city.id === 'city_beijing'
      ? readBeijingFengwuCards().map((item): FenwuCard => ({
        id: item.id, name: item.name, emoji: item.emoji, intro: item.question,
        cls: item.kind === 'food' ? 'orange' : 'green', kind: item.kind, lit: item.lit,
      }))
      : [...foodCards, ...spotCards];

    // 日记头：优先传入篇章；否则深卷首章（派遣默认进深卷）；否则该城首篇浅卷
    const chapterId = options.chapterId;
    let chapter: Record<string, unknown> | null = null;
    if (chapterId) {
      chapter = chaptersArr.find((c) => c.id === chapterId && c.cityId === city.id) || null;
      if (!chapter) throw new RangeError('篇章不属于当前城市：' + chapterId + '，cityId=' + options.cityId);
    }
    if (!chapter && city.id !== 'city_beijing') {
      const deep = (city.deepChapters as string[] | undefined) || [];
      if (deep.length) {
        chapter = (chaptersArr as Record<string, unknown>[]).find((c) => c.id === deep[0]) || null;
      }
    }
    if (!chapter) {
      chapter = (chaptersArr as Record<string, unknown>[]).find((c) => (c.cityId as string) === (city.id as string)) || null;
    }

    const cityChapters: Record<string, unknown>[] = chaptersArr.filter((item) => item.cityId === city.id);
    const toTab = (item: Record<string, unknown>): ChapterTab => ({ id: item.id as string, title: (item.title as string).replace((city.name as string) + '·', '') });
    const shallowTabs: ChapterTab[] = cityChapters.filter((item) => item.type !== 'deep').map(toTab);
    const deepTabs: ChapterTab[] = cityChapters.filter((item) => item.type === 'deep').map(toTab);
    const collectedChapters = wx.getStorageSync('dqxj_collected') || [];

    // 玩法卡：有 discovery 配置才显示（当前北京已配置）
    const hasDiscovery = (city.id as string) === 'city_beijing';
    const targetSection: string = options.section || '';
    if (!['', 'name', 'fengwu', 'diary', 'play'].includes(targetSection)) {
      throw new RangeError('未知的城市页定位区域：' + targetSection);
    }
    const focusedFengwuId: string = options.fengwuId ? decodeURIComponent(options.fengwuId) : '';
    if (focusedFengwuId) {
      if (city.id !== 'city_beijing') throw new RangeError('风物定位仅支持北京样板');
      findBeijingFengwu(focusedFengwuId);
    }
    const focusedIndex: number = fenwu.findIndex((item): boolean => item.id === focusedFengwuId);

    this.setData({
      city,
      petName,
      petEmoji,
      hasDiscovery,
      chapter,
      deepPoints: (chapter && (chapter.deepPoints as DeepPoint[])) || [],
      shallowTabs,
      deepTabs,
      chapterRead: chapter ? collectedChapters.indexOf((chapter as Record<string, unknown>).id) >= 0 : false,
      blocks: blocks.map((block): CityBlock => ({ ...block, expanded: block.id === 'name' && targetSection === 'name' })),
      fenwu,
      fenwuLitCount: fenwu.filter((f) => f.lit).length,
      fenwuTotal: fenwu.length,
      collected: readCityStampIds().includes(city.id as string),
      want: (wx.getStorageSync('dqxj_want') || []).indexOf(city.id) >= 0,
      targetSection,
      focusedFengwuId,
      focusedFengwuAnchor: focusedIndex >= 0 ? 'fengwu-' + focusedIndex : '',
    });
  },

  // 等首次布局完成再按稳定锚点定位，普通城市入口保持从封面开始。
  onReady(): void {
    if (this.data.targetSection) {
      wx.pageScrollTo({ selector: '#city-' + this.data.targetSection, duration: 0, offsetTop: -12 });
    }
  },

  onShow(): void {
    const city = this.data.city;
    if (!city) return;
    const chapter = this.data.chapter;
    const collectedChapters = wx.getStorageSync('dqxj_collected') || [];
    this.setData({
      collected: readCityStampIds().includes(city.id as string),
      want: (wx.getStorageSync('dqxj_want') || []).indexOf(city.id) >= 0,
      chapterRead: chapter ? collectedChapters.indexOf((chapter as Record<string, unknown>).id) >= 0 : false,
    });
    if (city.id === 'city_beijing') {
      const cards = readBeijingFengwuCards();
      this.setData({
        fenwu: this.data.fenwu.map((item): FenwuCard => ({ ...item, lit: cards.some((card): boolean => card.id === item.id && card.lit) })),
        fenwuLitCount: cards.filter((item): boolean => item.lit).length,
      });
    }
    this.loadTimeline();
  },

  // 橘橘旅行时间线（分享裂变素材）
  loadTimeline(): void {
    const app = getApp() as unknown as {
      globalData: { cities: Record<string, unknown>[]; chapters: Record<string, unknown>[] };
    };
    const cities = app.globalData.cities || [];
    const chaptersArr = app.globalData.chapters || [];
    const cName: Record<string, string> = {};
    (cities as Record<string, unknown>[]).forEach((c) => { cName[c.id as string] = c.name as string; });
    const tl = wx.getStorageSync('dqxj_timeline') || [];
    const nodes: TravelNode[] = (tl as Array<{ id: string; ts: number | null }>)
      .slice()
      .reverse()
      .map((t) => {
        const ch = (chaptersArr as Record<string, unknown>[]).find((c) => c.id === t.id);
        if (!ch) return null;
        return {
          date: t.ts ? fmtDate(t.ts) : '',
          cityName: cName[ch.cityId as string] || '',
          title: ch.title as string,
        } as TravelNode;
      })
      .filter(Boolean) as TravelNode[];
    this.setData({ timeline: nodes });
  },

  // 浅卷、深卷共用篇章选择，切换时同步新知、深度知识与已读状态。
  onSwitchChapter(e: WechatMiniprogram.TouchEvent): void {
    const id: string = e.currentTarget.dataset.id as string;
    const app = getApp() as unknown as { globalData: { chapters: Record<string, unknown>[] } };
    const chaptersArr = app.globalData.chapters || [];
    const ch = chaptersArr.find((c) => c.id === id && c.cityId === this.data.city?.id);
    if (!ch) throw new RangeError('当前城市篇章不存在：' + id);
    const collectedChapters = wx.getStorageSync('dqxj_collected') || [];
    this.setData({
      chapter: ch,
      stampAwarded: false,
      deepPoints: (ch.deepPoints as DeepPoint[]) || [],
      chapterRead: collectedChapters.indexOf((ch as Record<string, unknown>).id) >= 0,
    });
  },

  onOpenFengwu(e: WechatMiniprogram.TouchEvent): void {
    wx.navigateTo({ url: beijingPlacePath(e.currentTarget.dataset.id as string) });
  },

  onCopyChapterSource(event: WechatMiniprogram.TouchEvent): void {
    const index: number = event.currentTarget.dataset.index as number;
    const sources: ChapterSource[] | undefined = this.data.chapter?.sources as ChapterSource[] | undefined;
    const source: ChapterSource | undefined = sources?.[index];
    if (!source) throw new RangeError('当前篇章来源不存在，索引：' + index);
    wx.setClipboardData({ data: source.url });
  },

  // 北京标记章节已读；其他城市保持原有记录方式。
  onMarkRead(): void {
    const chapter = this.data.chapter as Record<string, unknown> | null;
    const city = this.data.city as Record<string, unknown> | null;
    if (!chapter) return;
    if (this.data.chapterRead) return;
    const cId = chapter.id as string;
    if (city?.id === 'city_beijing') {
      const stampAwarded: boolean = markBeijingChapterRead(cId);
      this.setData({ chapterRead: true, collected: true, stampAwarded });
      this.loadTimeline();
      return;
    }
    const cityId = city ? (city.id as string) : '';
    const list = wx.getStorageSync('dqxj_collected') || [];
    if (list.indexOf(cId) < 0) list.push(cId);
    writeProgress('dqxj_collected', list);
    const timeline: Array<{ id: string; ts: number }> = wx.getStorageSync('dqxj_timeline') || [];
    if (!timeline.some((entry): boolean => entry.id === cId)) {
      writeProgress('dqxj_timeline', [...timeline, { id: cId, ts: Date.now() }]);
    }
    if (cityId) {
      const citiesList = wx.getStorageSync('dqxj_collected_cities') || [];
      if (citiesList.indexOf(cityId) < 0) citiesList.push(cityId);
      writeProgress('dqxj_collected_cities', citiesList);
    }
    this.setData({ chapterRead: true, collected: true });
    this.loadTimeline();
    wx.showToast({ title: '已收下 · 点亮勋章', icon: 'none' });
  },

  // 风物卡点亮 / 取消（收藏自己的城市见闻）
  onToggleFenwu(e: WechatMiniprogram.TouchEvent): void {
    const city = this.data.city as Record<string, unknown>;
    const id = e.currentTarget.dataset.id as string;
    const litKey = 'dqxj_lit_' + (city.id as string);
    const list = (wx.getStorageSync(litKey) || []) as string[];
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(id);
    writeProgress(litKey, list);
    const fenwu = this.data.fenwu.map((f) => {
      if (f.id === id) return { id: f.id, name: f.name, emoji: f.emoji, intro: f.intro, cls: f.cls, kind: f.kind, lit: idx < 0 };
      return f;
    });
    this.setData({ fenwu, fenwuLitCount: fenwu.filter((f) => f.lit).length });
    wx.showToast({ title: idx < 0 ? '已点亮收藏' : '已取消点亮', icon: 'none' });
  },

  onToggleCollect(): void {
    const city = this.data.city as Record<string, unknown>;
    const id = city.id as string;
    if (id === 'city_beijing') throw new Error('北京城市印章由有效探索自动获得');
    const list = wx.getStorageSync('dqxj_collected_cities') || [];
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(id);
    writeProgress('dqxj_collected_cities', list);
    this.setData({ collected: idx < 0 });
    wx.showToast({ title: idx < 0 ? '已收集' : '已取消', icon: 'none' });
  },

  onToggleWant(): void {
    const city = this.data.city as Record<string, unknown>;
    const id = city.id as string;
    const list = wx.getStorageSync('dqxj_want') || [];
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(id);
    writeProgress('dqxj_want', list);
    this.setData({ want: idx < 0 });
    wx.showToast({ title: idx < 0 ? '已标记想去' : '已取消标记', icon: 'none' });
  },

  onViewFengwu(): void {
    wx.pageScrollTo({ selector: '#city-fengwu', duration: 300, offsetTop: -12 });
  },
  onBeijingMap(): void {
    returnToBeijingMap();
  },

  onToggleBlock(e: WechatMiniprogram.TouchEvent): void {
    const id = e.currentTarget.dataset.id as string;
    const blocks = this.data.blocks.map((b) => {
      if (b.id === id) return { id: b.id, icon: b.icon, title: b.title, text: b.text, facts: b.facts, nodes: b.nodes, needFold: b.needFold, expanded: !b.expanded };
      return b;
    });
    this.setData({ blocks });
  },

  onShareTap(): void {
    wx.showShareMenu({ withShareTicket: false });
    wx.showToast({ title: '点右上角 ··· 分享给好友', icon: 'none' });
  },

  onDiscovery(): void {
    wx.navigateTo({ url: discoveryPath });
  },

  onShareAppMessage(): { title: string; path: string } {
    const city = this.data.city as Record<string, unknown> | null;
    const cityName = city ? (city.name as string) : '中国城市';
    return {
      title: '走进' + cityName + '，发现城市的小秘密',
      path: '/pages/city/city?cityId=' + (city ? (city.id as string) : '') + '&chapterId=' + (this.data.chapter ? this.data.chapter.id as string : '')
        + '&section=diary',
    };
  },
});
