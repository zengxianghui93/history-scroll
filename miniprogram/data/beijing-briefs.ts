import { cloudAsset } from '../services/cloud-assets';
import { writeProgress } from '../services/cloud-account';
import { discoveryPath } from './beijing-discovery';
import { FengwuEntry, fengwuPath, findBeijingFengwu } from './beijing-fengwu';

interface BriefDefinition {
  id: string;
  detailLabel: string;
  detailPath: string;
  article?: BriefArticle;
}

interface BriefArticleSection {
  id: string;
  title: string;
  paragraphs: string[];
  illustration?: { src: string; alt: string; caption: string };
}

interface BriefArticle {
  intro?: string;
  title: string;
  duration: string;
  sections: BriefArticleSection[];
  guide?: LandmarkArticleGuide;
}

interface LandmarkArticleGuide {
  intro: string;
  tags: string[];
  figure: { src: string; alt: string; rows: { id: string; beasts: { number: number; name: string }[] }[] };
  route: { name: string; observation: string }[];
  visit: { checkedOn: string; officialUrl: string; notes: { title: string; text: string }[] };
}

// 湖山布局和长廊走向核对自联合国教科文组织、北京市公园管理中心。
// https://whc.unesco.org/en/list/880/
// https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/201912/t20191211_1048116.html
// https://www.beijing.gov.cn/renwen/rwzyd/qxdw/myhdlzqzh/yhy/202309/t20230921_3263787.html
const summerPalaceArticle: BriefArticle = {
  title: '一座山、一片湖，怎样撑起一座园林？',
  duration: '约 2 分钟',
  sections: [
    {
      id: 'lake', title: '先看水面，再找山上的楼阁',
      paragraphs: [
        '试着从昆明湖南岸向北看。你会先看到一大片水，再看到对岸的万寿山。佛香阁在山坡高处，层层屋檐从树梢上露出来。湖面约占颐和园四分之三，隔着这样宽的一片水，整面山坡都能收进眼里。',
        '颐和园是清代皇家园林。修园时，人们在原有山水的基础上疏浚、拓宽湖面，再沿山坡布置建筑。湖给观景的人留出了距离，山让楼阁有了高低。',
      ],
    },
    {
      id: 'corridor', title: '山和水之间，还藏着一条长廊',
      paragraphs: [
        '走近北岸，你会在山脚找到长廊。它沿着湖岸东西延伸，跟着山脚起伏，也跟着岸线转弯。山上的建筑把视线往高处引，长廊却把脚步带向两侧。',
        '廊有顶，朝湖一侧敞开。沿廊走，柱子像一排画框，同一片湖会在不同的位置重新出现。走到这里，你既能看见湖，也能感受到园林怎样安排人去看湖。',
      ],
      illustration: {
        src: cloudAsset('/images/beijing/summer-palace-landscape.jpg'),
        alt: '从昆明湖望向万寿山，湖岸长廊横向展开，山上的楼阁逐层升高',
        caption: '昆明湖、长廊与万寿山的空间关系示意',
      },
    },
    {
      id: 'observe', title: '换个位置，重看同一座园',
      paragraphs: [
        '下次看颐和园的照片，可以找两张来对照：一张从湖对岸拍山，一张从长廊向外拍湖。第一张让你看到建筑如何沿山坡展开，第二张让你体会湖景如何随着步子变化。',
        '认出这两种视角，就抓住了这座园林的布局：山上的楼阁立起远景，湖边的长廊串起一路的近景。',
      ],
    },
  ],
};

// 水冰转换与构件编号核对自国际奥委会场馆说明和中建集团工程记录。
// https://www.olympics.com/ioc/news/reuse-repurpose-revitalise
// https://www.cscec.com/ztzl_new/xxjx/lljl/202204/3513018.html
const waterCubeArticle: BriefArticle = {
  title: '泳池上方，搭起一座冬奥冰场',
  duration: '约 2 分钟',
  sections: [
    {
      id: 'two-games', title: '同一个地方，两届奥运',
      paragraphs: [
        '2008 年，北京奥运会的游泳、跳水比赛在国家游泳中心举行。人们熟悉它的蓝色外墙，也熟悉它的名字：水立方。',
        '到了 2022 年北京冬奥会，观众在同一座场馆里看到了冰壶比赛，水立方也有了另一个叫法：冰立方。改造团队面对的问题是，怎样让冰壶在这里比赛，又把游泳的空间留给下一次使用？',
      ],
    },
    {
      id: 'pool', title: '先把池水抽干，再往上搭',
      paragraphs: [
        '改造从抽干泳池开始。团队在池底搭起可以拆装的钢架，再用轻质混凝土预制板铺出平台。在平台上铺好保温、防水层，装上制冰系统，就可以在最上面做出比赛用的冰面。',
        '从观众席上看，眼前是一片平整的冰场。顺着剖面往下看，托住冰场的是一套架子，架子立在原来的泳池里。',
      ],
      illustration: {
        src: cloudAsset('/images/beijing/water-cube-ice-cutaway.jpg'),
        alt: '水立方剖面插画，冰壶场在上方，钢架立在已经排水的泳池底部',
        caption: '冰场与泳池的空间关系示意',
      },
    },
    {
      id: 'pieces', title: '每块板都知道自己该放哪儿',
      paragraphs: [
        '拆装只是第一步。等到下一次要搭冰场，怎么知道哪根钢梁、哪块板该放在哪儿？团队给约 2600 根薄壁钢构件和 1570 块轻质混凝土预制板都分配了数字编号，并在模型里记录它们的位置。再搭的时候，可以按编号把构件放回原位。',
        '冰场拆走后，泳池可以重新注水。下一场比赛是游泳还是冰壶，同一座场馆都有办法接住。',
      ],
    },
  ],
};

// 走兽名次与檐脊做法核对自故宫博物院词条，参观信息核对自馆方导览及预约须知。
// https://www.dpm.org.cn/lemmas/241413.html
// https://www.dpm.org.cn/show/225724.html
// https://www.dpm.org.cn/Visit.html
// https://www.dpm.org.cn/singles_detail/259831.html
// https://whc.unesco.org/en/list/439/
const palaceArticle: BriefArticle = {
  title: '太和殿屋顶的第十只小兽',
  duration: '约 2 分钟',
  sections: [
    {
      id: 'count', title: '先从檐角往上数',
      paragraphs: [
        '走到太和殿前，先别急着看匾额。抬头找一侧上翘的檐角，顺着斜斜的屋脊往上看，琉璃小兽正排成一列。最前面的骑凤仙人是队伍的领头，走兽要从它身后的龙开始数。',
        '檐角的走兽通常成单数，太和殿却用了十个。最后一只叫「行什」，有一张像猴子的脸，背上还有翅膀。把目光移到队尾，就能找到这只格外好认的小兽。',
      ],
    },
    {
      id: 'roof', title: '屋顶上的小兽，从哪儿来的？',
      paragraphs: [
        '几面屋顶相接的地方，要铺脊瓦盖住接缝。斜坡上的瓦件容易滑动，早期的做法会用铁钉固定，兽形装饰正好盖住钉帽。后来固定办法变了，小兽仍留在檐角，逐渐成了辨认建筑等级的线索。',
        '太和殿是紫禁城里规模最大的殿宇，也是举行大典的地方。下次遇到一座宫殿，可以先数数檐角的小兽，再猜它在宫城里承担什么角色。',
      ],
    },
  ],
  guide: {
    intro: '明清两代的皇家宫殿。沿中轴线从外朝走到内廷，可以看见典礼和起居怎样分在不同的空间里。',
    tags: ['世界文化遗产', '北京中轴线'],
    figure: {
      src: cloudAsset('/images/beijing/palace-ridge-beasts.jpg'),
      alt: '太和殿十个走兽的形象示意，依次为龙、凤、狮子、天马、海马、狻猊、押鱼、獬豸、斗牛、行什',
      rows: [
        { id: 'first', beasts: [{ number: 1, name: '龙' }, { number: 2, name: '凤' }, { number: 3, name: '狮子' }, { number: 4, name: '天马' }, { number: 5, name: '海马' }] },
        { id: 'second', beasts: [{ number: 6, name: '狻猊' }, { number: 7, name: '押鱼' }, { number: 8, name: '獬豸' }, { number: 9, name: '斗牛' }, { number: 10, name: '行什' }] },
      ],
    },
    route: [
      { name: '午门', observation: '入院后沿中路往北，先留意视线怎样被一重重门和院落引向中央。' },
      { name: '三大殿', observation: '在太和殿前抬头找檐角，从骑凤仙人身后的第一只走兽数起。' },
      { name: '后三宫', observation: '过乾清门，看看乾清宫一带的院落，和刚才的外朝广场有什么不同。' },
      { name: '御花园 · 神武门方向', observation: '走到御花园，比较树木、假山和小径带来的变化，再向北往神武门方向。' },
    ],
    visit: {
      checkedOn: '2026 年 11 月 10 日',
      officialUrl: 'https://ticket.dpm.org.cn/',
      notes: [
        { title: '门票与开放', text: '最早可于参观前 7 天 20:00 预约，不售当日票。通常周一闭馆，法定节假日除外。临时开放安排以馆方公告为准。' },
        { title: '怎么到入口', text: '请认准午门入院。乘地铁出行可结合馆方交通导览，从东、西筒子河路前往午门。离院可走神武门或东华门。' },
        { title: '附近再看一处', text: '从神武门出，可顺路去北侧的景山公园。换到高处回望，更容易看清刚才走过的中轴线。' },
      ],
    },
  },
};

// 祈谷仪式核对自北京市公园管理中心，圜丘形制与冬至祭天核对自北京市文物局。
// https://gygl.beijing.gov.cn/whgy/whgy_zlzc/201912/t20191206_884859.html
// https://wwj.beijing.gov.cn/bjww/362760/362770/436348561/index.html
const templeHeavenArticle: BriefArticle = {
  title: '皇帝到天坛，为什么要去两个不同的地方？',
  intro: '天坛是明清皇帝祭天、祈谷的建筑群。北侧的祈年殿和南侧的圜丘，是其中两处不同的祭祀空间。',
  duration: '约 2 分钟',
  sections: [
    {
      id: 'recognize', title: '你熟悉的蓝屋顶，只是故事的起点',
      paragraphs: [
        '提到天坛，你脑海里可能已经出现那座蓝色圆顶、红色柱身的祈年殿。三重屋檐向上收拢，殿前的白石台阶层层展开，这是天坛很容易认出的一幕。',
        '但沿天坛的南北方向看，南侧还有一座露天的圆形高坛——圜丘。一边是有屋顶的殿，一边是向天空敞开的坛。它们为什么会同时出现在这里？用清代的两场祭祀，就能把它们认清。',
      ],
    },
    {
      id: 'harvest', title: '祈年殿：把一年的期盼，落在收成上',
      paragraphs: [
        '先读一读名字：“祈年”，寄托着对年成的祈愿。清代正月，皇帝在祈年殿举行祈谷礼，向皇天上帝祈求五谷丰登。田地能不能有好收成，关系着许多人的一年，这份期盼也被郑重地放进国家的礼仪里。',
        '下次再看祈年殿，可以把蓝色屋顶和“祈谷”连在一起记：这座熟悉的大殿里，曾有一场为丰收而举行的仪式。',
      ],
    },
    {
      id: 'winter', title: '圜丘：到了冬至，祭天的地方在这里',
      paragraphs: [
        '同样在清代，冬至祭天在南侧的圜丘举行。这里的主体是一座三层圆形石坛，围着石栏，台阶通向中央。走上最高一层，头顶直接是天空。',
        '把两处放到一起看，区别就清楚了：祈年殿让你记住正月祈谷，圜丘让你记住冬至祭天。它们同在天坛，用不同的建筑空间承接不同的祭祀安排。',
      ],
      illustration: {
        src: cloudAsset('/images/beijing/temple-heaven-comparison.jpg'),
        alt: '双景水彩插画：北侧祈年殿有三重蓝顶，标注祈谷；南侧圜丘为三层露天圆坛，标注冬至祭天',
        caption: '北边有殿，南边有坛。两处建筑与用途的对照插画。',
      },
    },
    {
      id: 'observe', title: '下次看天坛，认出这两个方向',
      paragraphs: [
        '先在北侧找三重蓝色圆顶，认出祈年殿；再在南侧找露天的三层圆坛，认出圜丘。看游览图时，也可以沿南北方向把这两个位置连起来。',
        '记住一句就够了：祈年殿为丰收祈愿，圜丘承载冬至祭天之礼。再看到“天坛”两个字，你想到的就会是一组各有用途的祭祀空间。',
      ],
    },
  ],
};

const briefs: BriefDefinition[] = [
  { id: 'spot:水立方', detailLabel: '看看水冰转换互动', detailPath: fengwuPath('spot:水立方'), article: waterCubeArticle },
  { id: 'spot:北京中轴线', detailLabel: '去地图上找三个地标', detailPath: discoveryPath },
  { id: 'spot:故宫', detailLabel: '看看故宫的分区', detailPath: fengwuPath('spot:故宫'), article: palaceArticle },
  { id: 'spot:鸟巢', detailLabel: '仔细看看鸟巢', detailPath: fengwuPath('spot:鸟巢') },
  { id: 'food:炸酱面', detailLabel: '逛逛京味小街', detailPath: '/pages/foodstreet/foodstreet?focus=' + encodeURIComponent('food:炸酱面') },
];

const readKey: string = 'dqxj_beijing_briefs_read';

export interface BeijingBrief extends BriefDefinition {
  entry: FengwuEntry;
  path: string;
}

function buildBeijingBrief(brief: BriefDefinition): BeijingBrief {
  return {
    ...brief,
    entry: findBeijingFengwu(brief.id),
    path: '/pages/brief/brief?id=' + encodeURIComponent(brief.id),
  };
}

export const beijingBriefs: BeijingBrief[] = briefs.map(buildBeijingBrief);
const placeArticles: BeijingBrief[] = [
  buildBeijingBrief({ id: 'spot:天坛', detailLabel: '认识天坛', detailPath: fengwuPath('spot:天坛'), article: templeHeavenArticle }),
  buildBeijingBrief({ id: 'spot:颐和园', detailLabel: '认识颐和园', detailPath: fengwuPath('spot:颐和园'), article: summerPalaceArticle }),
];
const allBriefs: BeijingBrief[] = [...beijingBriefs, ...placeArticles];

export function findBeijingBrief(id: string): BeijingBrief {
  const brief: BeijingBrief | undefined = allBriefs.find((item: BeijingBrief): boolean => item.id === id);
  if (!brief) throw new RangeError('北京短读不存在：' + id);
  return brief;
}

export function findBeijingArticle(id: string): BeijingBrief | undefined {
  return allBriefs.find((brief: BeijingBrief): boolean => brief.id === id && !!brief.article);
}

export function beijingPlacePath(id: string): string {
  const article: BeijingBrief | undefined = findBeijingArticle(id);
  return article ? article.path : fengwuPath(id);
}

export function readBeijingBriefIds(): string[] {
  const stored: unknown = wx.getStorageSync(readKey);
  if (stored === '') return [];
  if (!Array.isArray(stored) || !stored.every((id: unknown): boolean => typeof id === 'string')) {
    throw new TypeError('北京短读记录格式错误：' + readKey);
  }
  return Array.from(new Set(stored as string[]));
}

export function markBeijingBriefRead(id: string): void {
  findBeijingBrief(id);
  const readIds: string[] = readBeijingBriefIds();
  if (!readIds.includes(id)) writeProgress(readKey, [...readIds, id]);
}

/** 从当前短卡向后找，优先提供还没读完的内容。 */
export function nextBeijingBrief(id: string, readIds: string[]): BeijingBrief | null {
  const current: BeijingBrief = findBeijingBrief(id);
  const index: number = beijingBriefs.indexOf(current);
  if (index < 0) return null;
  const others: BeijingBrief[] = [...beijingBriefs.slice(index + 1), ...beijingBriefs.slice(0, index)];
  return others.find((brief: BeijingBrief): boolean => !readIds.includes(brief.id)) ?? others[0];
}
