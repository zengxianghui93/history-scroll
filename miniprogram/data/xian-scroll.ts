import { cloudAsset } from '../services/cloud-assets';
import { writeProgress } from '../services/cloud-account';
import { FengwuCard } from './beijing-fengwu';
import { readStoredIds } from './beijing-outcomes';
import { xianCityId } from './city-scroll-position';
import { CityScroll, ScrollLandmark } from './beijing-scrolls';
import { readNewLandmarkStamps, recordCityLandmarkStamp, StampStatus } from './landmark-stamp-ledger';

const stampKey: string = 'dqxj_xian_landmarks_lit';
const storyKey: string = 'dqxj_lit_city_xian';
let pendingSeal: string = '';

export const yongningGate: ScrollLandmark = {
  id: 'yongning-gate', name: '永宁门', x: 41, y: 86,
  takeaway: '从城外到城里，永宁门把一条进城路变成了几道防线。',
  path: '/xian/pages/yongning/yongning',
};

export const bellTower: ScrollLandmark = {
  id: 'bell-tower', name: '钟楼', x: 51, y: 43,
  takeaway: '西安钟楼换过位置：城的中心向东，报时的楼也来到四条大街交会处。',
  path: '/xian/pages/bell-tower/bell-tower',
};

export const drumTower: ScrollLandmark = {
  id: 'drum-tower', name: '鼓楼', x: 32, y: 35,
  takeaway: '钟楼报晨、鼓楼报暮：没有手机的年代，钟鼓声曾是全城共享的时间信号。',
  path: '/xian/pages/drum-tower/drum-tower',
};

export const shuyuanmenBeilin: ScrollLandmark = {
  id: 'shuyuanmen-beilin', name: '书院门 · 碑林', x: 66, y: 70,
  takeaway: '从书院门的笔墨走进碑林，唐代《开成石经》把十二种经典留在114块石碑上。',
  path: '/xian/pages/shuyuanmen/shuyuanmen',
};

export const giantGoosePagoda: ScrollLandmark = {
  id: 'giant-goose-pagoda', name: '大雁塔', x: 51, y: 41,
  takeaway: '大雁塔最初为安放玄奘带回的经卷、佛像而建，是一段求知旅程抵达长安后的落脚处。',
  path: '/xian/pages/giant-goose-pagoda/giant-goose-pagoda',
};

export const datangEverbright: ScrollLandmark = {
  id: 'datang-everbright', name: '大唐不夜城', x: 50, y: 75,
  takeaway: '大雁塔是留存至今的古迹；塔下灯火中的大唐不夜城，是今天的人用新的方式想象长安。',
  path: '/xian/pages/datang-everbright/datang-everbright',
};

export const shaanxiHistoryMuseum: ScrollLandmark = {
  id: 'shaanxi-history-museum', name: '陕西历史博物馆', x: 20, y: 53,
  takeaway: '何家村出土的唐代银香囊，外壳能转，内层香盂却能保持平稳。',
  path: '/xian/pages/shaanxi-history-museum/shaanxi-history-museum',
};

export const changanTwelveHours: ScrollLandmark = {
  id: 'changan-twelve-hours', name: '长安十二时辰', x: 79, y: 76,
  takeaway: '今天可以从容夜游唐风街区；唐代长安的坊门却会随暮鼓关闭，夜间通行受到限制。',
  path: '/xian/pages/changan-twelve-hours/changan-twelve-hours',
};

export const smallGoosePagoda: ScrollLandmark = {
  id: 'small-goose-pagoda', name: '小雁塔', x: 84, y: 30,
  takeaway: '小雁塔的塔顶并非原本如此：明代地震损坏了塔刹和最上两级，留下今天的轮廓。',
  path: '/xian/pages/small-goose-pagoda/small-goose-pagoda',
};

export const terracottaArmy: ScrollLandmark = {
  id: 'terracotta-army', name: '秦始皇兵马俑', x: 35, y: 50,
  takeaway: '今天常见的土色兵马俑，原本大多施有彩绘；残存颜色需要考古人员小心保护。',
  path: '/xian/pages/terracotta-army/terracotta-army',
};

export const damingPalace: ScrollLandmark = {
  id: 'daming-palace', name: '大明宫遗址公园', x: 75, y: 48,
  takeaway: '宫殿不在了，台基的高度、道路的方向和殿前的空间，仍在告诉我们：唐人怎样让一座宫殿显得庄严。',
  path: '/xian/pages/daming-palace/daming-palace',
};

export const huaqingPalace: ScrollLandmark = {
  id: 'huaqing-palace', name: '华清宫 · 骊山', x: 72, y: 80,
  takeaway: '华清宫的海棠汤不靠传说辨认：石砌池沿留下了像花瓣一样的轮廓。',
  path: '/xian/pages/huaqing-palace/huaqing-palace',
};

export const xianScrolls: CityScroll[] = [
  { id: 'ancient-axis', name: '晨钟暮鼓 · 古城中轴', image: cloudAsset('/xian/images/ancient-axis.jpg'), landmarks: [yongningGate, bellTower, drumTower, shuyuanmenBeilin] },
  { id: 'yanta', name: '盛世大唐 · 雁塔流光', image: cloudAsset('/xian/images/yanta.jpg'), landmarks: [giantGoosePagoda, datangEverbright, shaanxiHistoryMuseum, changanTwelveHours, smallGoosePagoda] },
  { id: 'qin', name: '秦风浩荡 · 帝国背影', image: cloudAsset('/xian/images/qin.jpg'), landmarks: [terracottaArmy, damingPalace, huaqingPalace] },
  { id: 'market', name: '市井烟火 · 长安百态', image: cloudAsset('/xian/images/market.jpg'), landmarks: [] },
];

export const yongningStory: FengwuCard = {
  id: yongningGate.id, name: yongningGate.name, kind: 'spot', emoji: '城',
  question: '进永宁门，为什么要穿过好几道门？',
  answer: '过了第一道门，眼前仍是一座被城墙围住的院子。这里是瓮城，也是古城的一道防线。',
  knowledge: yongningGate.takeaway,
  sourceTitle: '西安曲江新区管理委员会 · 西安城墙',
  sourceUrl: 'https://qjxq.xa.gov.cn/zjqj/gyqj/tsqj/5df21c5565cbd81235fc1efa.html',
  illustrationBrief: '以画卷前景的永宁门为题图，配独立的南北向城门结构示意。',
  lit: false,
};

export const bellTowerStory: FengwuCard = {
  id: bellTower.id, name: bellTower.name, kind: 'spot', emoji: '钟',
  question: '西安钟楼，为什么搬过一次家？',
  answer: '它最初在今天的广济街口一带。明代城池扩展、城市中心东移，万历十年迁建到如今四条大街交会处。',
  knowledge: bellTower.takeaway,
  sourceTitle: '西安市地方志办公室 · 西安地铁6号线站名探究',
  sourceUrl: 'https://xadfz.xa.gov.cn/xadq/yxxa/2081926328441991170.html',
  illustrationBrief: '旧址与今址的解释性插画，以四条大街交会处突出今天的钟楼。',
  image: cloudAsset('/xian/images/bell-tower-relocation.jpg'),
  lit: false,
};

export const drumTowerStory: FengwuCard = {
  id: drumTower.id, name: drumTower.name, kind: 'spot', emoji: '鼓',
  question: '没有手机的西安，傍晚听谁报时？',
  answer: '鼓楼曾以鼓声向城中报时；与钟楼的钟声相应，留下“晨钟暮鼓”的城市记忆。',
  knowledge: drumTower.takeaway,
  sourceTitle: '西安市人民政府 · 人文之都旅游线路',
  sourceUrl: 'https://www.xa.gov.cn/ztzl/ztzl/lzledc/ywdc/64e6beb4f8fd1c1a703777a9.html',
  illustrationBrief: '黄昏鼓楼与街巷生活场景，远处遥望钟楼。场景为艺术想象，非史迹复原。',
  image: cloudAsset('/xian/images/drum-tower-dusk.jpg'),
  lit: false,
};

export const shuyuanmenStory: FengwuCard = {
  id: shuyuanmenBeilin.id, name: shuyuanmenBeilin.name, kind: 'spot', emoji: '碑',
  question: '书院门尽头，为什么有一座“石头图书馆”？',
  answer: '碑林里的《开成石经》把十二种经典刻在114块石碑上，共约65万字。',
  knowledge: shuyuanmenBeilin.takeaway,
  sourceTitle: '西安碑林博物馆 · 开成石经',
  sourceUrl: 'https://beilin-museum.com/index.php?a=index&aid=2583&c=View&m=home',
  illustrationBrief: '从书院门的笔墨摊位通向碑林庭院与石经，场景示意而非馆藏复原。',
  image: cloudAsset('/xian/images/shuyuanmen-beilin.jpg'),
  lit: false,
};

export const giantGooseStory: FengwuCard = {
  id: giantGoosePagoda.id, name: giantGoosePagoda.name, kind: 'spot', emoji: '塔',
  question: '玄奘带回的经卷，为什么需要一座塔？',
  answer: '唐永徽三年（652），玄奘在大慈恩寺主持建塔，为从天竺带回的经卷与佛像留下一处安放之所。',
  knowledge: giantGoosePagoda.takeaway,
  sourceTitle: '西安市人民政府 · 人文之都旅游线路',
  sourceUrl: 'https://www.xa.gov.cn/ztzl/ztzl/lzledc/ywdc/64e6beb4f8fd1c1a703777a9.html',
  illustrationBrief: '暮色中的大雁塔与经卷，表现旅程抵达长安；艺术想象，非塔内复原。',
  image: cloudAsset('/xian/images/giant-goose-pagoda-sutras.jpg'),
  lit: false,
};

export const datangEverbrightStory: FengwuCard = {
  id: datangEverbright.id, name: datangEverbright.name, kind: 'spot', emoji: '灯',
  question: '大唐不夜城的灯，照亮的是唐代的长安吗？',
  answer: '眼前的灯街是今天打造的唐文化主题步行街。回望街尽头的大雁塔，才能看见古迹与当代长安同框。',
  knowledge: datangEverbright.takeaway,
  sourceTitle: '西安市人民政府 · 西安市“十四五”商务发展规划',
  sourceUrl: 'https://www.xa.gov.cn/gk/ghjh/fzgh/61309a57f8fd1c0bdc4f2e4b.html',
  illustrationBrief: '今夜的唐文化主题街区与远处大雁塔同框，区分当代夜街与历史古迹。',
  image: cloudAsset('/xian/images/datang-everbright-night.jpg'),
  lit: false,
};

export const shaanxiHistoryMuseumStory: FengwuCard = {
  id: shaanxiHistoryMuseum.id, name: shaanxiHistoryMuseum.name, kind: 'spot', emoji: '囊',
  question: '唐人的银香囊晃来晃去，香灰为什么不容易洒？',
  answer: '葡萄花鸟纹银香囊的球壳里面，还有能相对转动的同心环与香盂。外壳倾斜时，香盂仍可保持平稳。',
  knowledge: shaanxiHistoryMuseum.takeaway,
  sourceTitle: '陕西历史博物馆 · 葡萄花鸟纹银香囊',
  sourceUrl: 'https://www.sxhm.com/collections/detail/9948',
  illustrationBrief: '唐代银香囊的解释性剖视插画；外壳葡萄花鸟纹、内层转环与香盂可辨。',
  image: cloudAsset('/xian/images/shaanxi-history-incense-ball.jpg'),
  lit: false,
};

export const changanTwelveHoursStory: FengwuCard = {
  id: changanTwelveHours.id, name: changanTwelveHours.name, kind: 'spot', emoji: '坊',
  question: '如果你是唐代长安人，入夜后还能出门逛街吗？',
  answer: '唐代长安实行夜禁。暮鼓响后，坊门陆续关闭，人们须在规定时间回到坊内。',
  knowledge: changanTwelveHours.takeaway,
  sourceTitle: '陕西档案信息网 · 唐长安的街与坊',
  sourceUrl: 'https://daj.shaanxi.gov.cn/Article/View?id=1667',
  illustrationBrief: '唐代长安暮色中的坊门与街鼓，市民赶在坊门关闭前归坊；艺术想象。',
  image: cloudAsset('/xian/images/changan-twelve-ward-gate.jpg'),
  lit: false,
};

export const smallGoosePagodaStory: FengwuCard = {
  id: smallGoosePagoda.id, name: smallGoosePagoda.name, kind: 'spot', emoji: '塔',
  question: '小雁塔的塔尖去哪儿了？',
  answer: '明代地震损坏了小雁塔的塔刹和最上两级。今天不完整的塔顶，是岁月留下的可见痕迹。',
  knowledge: smallGoosePagoda.takeaway,
  sourceTitle: '西安博物院 · 小雁塔与荐福寺',
  sourceUrl: 'https://www.xabwy.com/show.html?id=46',
  illustrationBrief: '清晨小雁塔现存的塔顶轮廓与淡墨旧貌对照；旧貌为解释性艺术想象。',
  image: cloudAsset('/xian/images/small-goose-pagoda-top.jpg'),
  lit: false,
};

export const terracottaArmyStory: FengwuCard = {
  id: terracottaArmy.id, name: terracottaArmy.name, kind: 'spot', emoji: '俑',
  question: '为什么今天看到的兵马俑大多是土色？',
  answer: '秦俑原本施有彩绘。漫长埋藏与出土后的环境变化让大部分色彩难以留存；考古人员正努力保护残存的颜色。',
  knowledge: terracottaArmy.takeaway,
  sourceTitle: '秦始皇帝陵博物院 · 真彩秦俑',
  sourceUrl: 'https://bmy.com.cn/news/news/993.html',
  illustrationBrief: '同一兵俑的现存土色与彩绘推想并置，彩色一侧为艺术复原，不代表确定原色。',
  image: cloudAsset('/xian/images/terracotta-warrior-colors.jpg'),
  lit: false,
};

export const damingPalaceStory: FengwuCard = {
  id: damingPalace.id, name: damingPalace.name, kind: 'spot', emoji: '宫',
  question: '宫殿消失了，为什么还值得看？',
  answer: '木构殿堂消失后，台基的高度、道路的方向和殿前的空间，仍能让人读懂唐代宫殿的庄严。',
  knowledge: damingPalace.takeaway,
  sourceTitle: '西安曲江新区管理委员会 · 大明宫遗址公园',
  sourceUrl: 'https://qjxq.xa.gov.cn/zjqj/gyqj/tsqj/5df21c62fd8508098d284f14.html',
  illustrationBrief: '从南向北看含元殿高台与殿前空间，淡墨叠影提示消失的殿阁；宫殿轮廓为艺术想象，不画中央御道登殿坡道。',
  image: cloudAsset('/xian/images/daming-palace-ruins.jpg'),
  lit: false,
};

export const huaqingPalaceStory: FengwuCard = {
  id: huaqingPalace.id, name: huaqingPalace.name, kind: 'spot', emoji: '汤',
  question: '海棠汤里没有水，为什么还能看出唐人的讲究？',
  answer: '御汤遗址中，石砌池沿围出海棠花般的轮廓。即使泉水不在，池体仍留下唐代宫苑的生活细节。',
  knowledge: huaqingPalace.takeaway,
  sourceTitle: '华清宫 · 唐华清宫御汤遗址',
  sourceUrl: 'https://www.hqc.cn/Play/Travels/23.html',
  illustrationBrief: '海棠形石砌汤池遗址的俯视插画；一角水光为艺术想象，非遗址原状复刻。',
  image: cloudAsset('/xian/images/huaqing-haitang-pool.jpg'),
  lit: false,
};

export function findXianLandmark(id: string): ScrollLandmark {
  const landmark: ScrollLandmark | undefined = xianScrolls.flatMap((scroll): ScrollLandmark[] => scroll.landmarks)
    .find((entry): boolean => entry.id === id);
  if (!landmark) throw new RangeError('西安地标不存在：' + id);
  return landmark;
}

export function readXianStampIds(): string[] {
  return Array.from(new Set([...readStoredIds(stampKey), ...readNewLandmarkStamps(xianCityId)]));
}

export async function stampXianLandmark(id: string): Promise<{ status: StampStatus; passedHalf: boolean }> {
  findXianLandmark(id);
  const ids: string[] = readXianStampIds();
  if (ids.includes(id)) return { status: 'already-stamped', passedHalf: false };
  const result = await recordCityLandmarkStamp(xianCityId, id);
  if (result.status === 'earned') pendingSeal = id;
  return result;
}

export function takeXianSealFeedback(): string {
  const id: string = pendingSeal;
  pendingSeal = '';
  return id;
}

export function readXianStoryIds(): string[] {
  return readStoredIds(storyKey);
}

export function readXianStories(): FengwuCard[] {
  const ids: string[] = readXianStoryIds();
  return [yongningStory, bellTowerStory, drumTowerStory, shuyuanmenStory, giantGooseStory, datangEverbrightStory, shaanxiHistoryMuseumStory, changanTwelveHoursStory, smallGoosePagodaStory, terracottaArmyStory, damingPalaceStory, huaqingPalaceStory]
    .map((story): FengwuCard => ({ ...story, lit: ids.includes(story.id) }));
}

export function toggleXianFavorite(id: string): boolean {
  findXianLandmark(id);
  const ids: string[] = readXianStoryIds();
  const collected: boolean = ids.includes(id);
  writeProgress(storyKey, collected ? ids.filter((savedId): boolean => savedId !== id) : [...ids, id]);
  return !collected;
}
