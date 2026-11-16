import { writeProgress } from '../services/cloud-account';
import { FengwuEntry, findBeijingFengwu, readBeijingFengwuIds } from './beijing-fengwu';

export interface BeijingJourney {
  seenIds: string[];
  lastCardId: string | null;
  guidanceDismissed: boolean;
}

interface RecommendationLink {
  sourceId: string;
  targetId: string;
  reason: string;
}

export interface FengwuRecommendation {
  entry: FengwuEntry;
  reason: string;
}

const journeyKey: string = 'dqxj_beijing_journey';

// 先说明内容之间的联系，再邀请探索下一处；不以收藏数量强制解锁。
const links: RecommendationLink[] = [
  { sourceId: 'spot:故宫', targetId: 'spot:什刹海', reason: '看过宫墙里的秩序，再去水岸街巷看看北京的生活。' },
  { sourceId: 'spot:故宫', targetId: 'spot:颐和园', reason: '从宫殿到园林，看看建筑怎样与山水相处。' },
  { sourceId: 'spot:鸟巢', targetId: 'spot:水立方', reason: '同样是奥运场馆，水立方怎样从水上场地转向冰上场地？' },
  { sourceId: 'spot:鸟巢', targetId: 'spot:国家大剧院', reason: '看过钢结构的编织，再看看金属与玻璃的另一种表达。' },
  { sourceId: 'food:炸酱面', targetId: 'food:豆汁焦圈', reason: '从一碗面，再认识一组味道特别的京味小吃。' },
  { sourceId: 'food:炸酱面', targetId: 'food:北京烤鸭', reason: '从家常面食到烤制工艺，再认识一种北京味道。' },
  { sourceId: 'spot:水立方', targetId: 'spot:鸟巢', reason: '看看另一座奥运场馆，建筑外观怎样与结构结合。' },
  { sourceId: 'spot:水立方', targetId: 'spot:国家大剧院', reason: '继续观察建筑材料，发现另一种透明与金属的组合。' },
  { sourceId: 'spot:什刹海', targetId: 'food:炸酱面', reason: '从水岸街巷走进日常生活，再看看一碗面的讲究。' },
  { sourceId: 'spot:什刹海', targetId: 'spot:颐和园', reason: '同样有水，园林里的湖又怎样组织空间？' },
  { sourceId: 'spot:颐和园', targetId: 'spot:故宫', reason: '从山水园林回看宫城，比较两种建筑布局。' },
  { sourceId: 'spot:颐和园', targetId: 'spot:什刹海', reason: '再看看水岸街巷里的生活，认识另一种城市风景。' },
  { sourceId: 'spot:八达岭长城', targetId: 'spot:故宫', reason: '看过山间城墙，再看看城里宫殿怎样排列。' },
  { sourceId: 'spot:八达岭长城', targetId: 'spot:香山', reason: '沿着山势观察，再去认识山林与园林的结合。' },
  { sourceId: 'spot:香山', targetId: 'spot:颐和园', reason: '从山林园景走向湖山布局，继续观察自然与建筑。' },
  { sourceId: 'spot:天坛', targetId: 'spot:故宫', reason: '从祭祀建筑群到宫城，看看不同功能怎样影响空间。' },
  { sourceId: 'spot:天坛', targetId: 'spot:国家大剧院', reason: '再观察现代建筑中的曲线与空间，比较不同的表达。' },
  { sourceId: 'spot:国家大剧院', targetId: 'spot:水立方', reason: '同样引人注目的外墙，水立方还有怎样的内部变化？' },
  { sourceId: 'spot:国家大剧院', targetId: 'spot:鸟巢', reason: '再看看外观与钢结构怎样结合成一座场馆。' },
  { sourceId: 'food:北京烤鸭', targetId: 'food:铜锅涮肉', reason: '从烤到涮，比较两种北京风味的做法。' },
  { sourceId: 'food:北京烤鸭', targetId: 'food:炸酱面', reason: '再认识一碗更日常的北京味道。' },
  { sourceId: 'food:豆汁焦圈', targetId: 'food:驴打滚', reason: '尝过酸香的故事，再认识一款甜味小吃的名字。' },
  { sourceId: 'food:豆汁焦圈', targetId: 'food:铜锅涮肉', reason: '继续看看另一种京味组合：清汤与蘸料。' },
  { sourceId: 'food:铜锅涮肉', targetId: 'food:北京烤鸭', reason: '从清汤涮肉到炉中烤鸭，认识不同的制作工艺。' },
  { sourceId: 'food:铜锅涮肉', targetId: 'food:驴打滚', reason: '换一种口味，看看甜点名字与制作有什么联系。' },
  { sourceId: 'food:驴打滚', targetId: 'food:豆汁焦圈', reason: '从甜味小吃到酸香饮品，看看另一组京味搭配。' },
  { sourceId: 'food:驴打滚', targetId: 'food:炸酱面', reason: '回到家常一餐，认识炸酱面里的菜码。' },
];

export function readBeijingJourney(): BeijingJourney {
  const stored: unknown = wx.getStorageSync(journeyKey);
  if (stored === '') return { seenIds: [], lastCardId: null, guidanceDismissed: false };
  if (typeof stored !== 'object' || stored === null) throw new TypeError('北京续看记录格式错误：' + journeyKey);
  const value = stored as BeijingJourney;
  if (!Array.isArray(value.seenIds) || !value.seenIds.every((id: unknown): boolean => typeof id === 'string')
    || typeof value.guidanceDismissed !== 'boolean'
    || (value.lastCardId !== null && (typeof value.lastCardId !== 'string' || !value.seenIds.includes(value.lastCardId)))) {
    throw new TypeError('北京续看记录内容错误：' + journeyKey);
  }
  value.seenIds.forEach((id: string): void => { findBeijingFengwu(id); });
  return { seenIds: Array.from(new Set(value.seenIds)), lastCardId: value.lastCardId, guidanceDismissed: value.guidanceDismissed };
}

export function rememberFengwuVisit(id: string): void {
  findBeijingFengwu(id);
  const journey: BeijingJourney = readBeijingJourney();
  writeProgress(journeyKey, { seenIds: Array.from(new Set([...journey.seenIds, id])), lastCardId: id, guidanceDismissed: true });
}

export function dismissBeijingGuidance(): void {
  writeProgress(journeyKey, { ...readBeijingJourney(), guidanceDismissed: true });
}

export function readResumeFengwu(): FengwuEntry | null {
  const id: string | null = readBeijingJourney().lastCardId;
  return id === null ? null : findBeijingFengwu(id);
}

export function readFengwuRecommendation(sourceId: string): FengwuRecommendation | null {
  findBeijingFengwu(sourceId);
  const collected: string[] = readBeijingFengwuIds();
  const journey: BeijingJourney = readBeijingJourney();
  const candidates: RecommendationLink[] = links.filter((link: RecommendationLink): boolean => link.sourceId === sourceId && !collected.includes(link.targetId));
  const next: RecommendationLink | undefined = candidates.find((link: RecommendationLink): boolean => !journey.seenIds.includes(link.targetId)) || candidates[0];
  return next ? { entry: findBeijingFengwu(next.targetId), reason: next.reason } : null;
}
