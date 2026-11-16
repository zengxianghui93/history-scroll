export interface Landmark {
  id: string;
  name: string;
  x: number;
  y: number;
  kind: string;
  found: boolean;
  note: string;
}

export interface DiscoveryProgress {
  foundIds: string[];
  revealed: boolean;
  collectedAt: number | null;
}

export const discoveryPath: string = '/pages/discovery/discovery';
export const discoveryStorageKey: string = 'dqxj_discovery_beijing_axis';
export const discoveryChapterId: string = 'chapter_beijing_deep_royal';
export const discoveryTakeaway: string = '北京中轴线南起永定门、北至钟鼓楼，长约 7.8 公里。它串联重要建筑与公共空间，体现中国传统都城的规划秩序，2024 年列入《世界遗产名录》。';
export const discoverySource: string = 'https://whc.unesco.org/en/list/1714/';

// 地图为示意图，仅呈现相对方位，不用于实际导航。
export const landmarks: Landmark[] = [
  { id: 'drum', name: '钟鼓楼', x: 50, y: 15, kind: 'tower', found: false, note: '找到北端了！钟鼓楼曾承担城市报时功能。顺着这条线，北京的空间有了南北呼应。' },
  { id: 'lake', name: '北海', x: 18, y: 35, kind: 'water', found: false, note: '北海在这条线的西侧，湖光很美，不过这次先找线索里的建筑吧。' },
  { id: 'gate', name: '天安门', x: 50, y: 47, kind: 'gate', found: false, note: '天安门也在线上！继续向北，橘橘听到了和时间有关的声音。' },
  { id: 'temple', name: '天坛', x: 81, y: 68, kind: 'temple', found: false, note: '天坛位于中轴线东侧。它是相关遗产的重要组成部分，但不在这次寻找的中心线上。' },
  { id: 'south', name: '永定门', x: 50, y: 83, kind: 'gate', found: false, note: '永定门是北京中轴线的南端。橘橘在这里出发，接下来一起往北走。' },
];

export const routeIds: string[] = ['south', 'gate', 'drum'];
export const clues: string[] = [
  '先找最南边那座城门。名字里藏着“永远安定”的祝愿，它是这次旅程的起点。',
  '往北走，找一座名字里有“天”和“安”的城门。它和刚才的起点有什么位置关系？',
  '继续向北，找曾经为城市报时的地方。名字里有两种会发出声音的东西。',
];

export function emptyProgress(): DiscoveryProgress {
  return { foundIds: [], revealed: false, collectedAt: null };
}

export function readDiscovery(): DiscoveryProgress {
  const stored: unknown = wx.getStorageSync(discoveryStorageKey);
  if (stored === '') return emptyProgress();
  if (typeof stored !== 'object' || stored === null) {
    throw new TypeError('北京探索进度格式错误，请检查本地存储：' + discoveryStorageKey);
  }
  const value = stored as DiscoveryProgress;
  const validIds: boolean = Array.isArray(value.foundIds)
    && value.foundIds.length <= routeIds.length
    && value.foundIds.every((id: unknown, index: number): boolean => id === routeIds[index]);
  const validTime: boolean = value.collectedAt === null
    || (typeof value.collectedAt === 'number' && Number.isFinite(value.collectedAt) && value.collectedAt > 0);
  if (!validIds || typeof value.revealed !== 'boolean' || !validTime
    || (value.revealed && value.foundIds.length !== routeIds.length)
    || (value.collectedAt !== null && !value.revealed)) {
    throw new TypeError('北京探索进度内容错误，请检查本地存储：' + discoveryStorageKey);
  }
  return { foundIds: [...value.foundIds], revealed: value.revealed, collectedAt: value.collectedAt };
}

export function markLandmarks(foundIds: string[]): Landmark[] {
  return landmarks.map((landmark: Landmark): Landmark => ({ ...landmark, found: foundIds.includes(landmark.id) }));
}
