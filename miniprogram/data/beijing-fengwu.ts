import { cloudAsset } from '../services/cloud-assets';
import { discoverySource, discoveryTakeaway } from './beijing-discovery';

export interface FengwuEntry {
  id: string;
  name: string;
  kind: 'food' | 'spot';
  emoji: string;
  question: string;
  answer: string;
  knowledge: string;
  sourceTitle: string;
  sourceUrl: string;
  illustrationBrief: string;
  image?: string;
  detailPath?: string;
  observation?: string;
}

export interface FengwuCard extends FengwuEntry {
  lit: boolean;
}

export const beijingFengwuKey: string = 'dqxj_lit_city_beijing';
export const bellDrumFengwuId: string = 'spot:钟鼓楼';
export const tiananmenSquareFengwuId: string = 'spot:天安门广场';
export const archeryTowerFengwuId: string = 'spot:正阳门箭楼';
export const yongdingFengwuId: string = 'spot:永定门';
export const summerGardensFengwuId: string = 'spot:颐和园·圆明园';
export const lamaFengwuId: string = 'spot:雍和宫';
export const nanluoguFengwuId: string = 'spot:南锣鼓巷';
export const olympicFengwuId: string = 'spot:奥林匹克公园';
export const qianmenFengwuId: string = 'spot:前门大街';
export const lugouFengwuId: string = 'spot:卢沟桥·宛平城';
export const shougangFengwuId: string = 'spot:首钢园';
export const daxingFengwuId: string = 'spot:大兴机场';
export const longfuFengwuId: string = 'spot:隆福寺';
export const sanlitunFengwuId: string = 'spot:三里屯太古里';
export const art798FengwuId: string = 'spot:798艺术园区';
export const canalCultureFengwuId: string = 'spot:运河畔三座建筑';

/** 北京插画生产清单：共用 4:3 暖色纸感构图，主体置于中央 80% 安全区，不含文字；每项 brief 指定必须表现的辨识细节。 */
export const beijingFengwu: FengwuEntry[] = [

  {
    id: 'food:北京烤鸭', name: '北京烤鸭', kind: 'food', emoji: '🦆',
    question: '北京烤鸭，都用同一种炉子烤吗？',
    answer: '不一样，挂炉和焖炉是两种不同的烤制流派。',
    knowledge: '挂炉烤鸭在特制炉中以果木明火烤制；焖炉采用另一套炉具和加热工艺。认识烤鸭，可以先从炉子开始，再观察片鸭、薄饼和配料如何搭配。',
    sourceTitle: '北京市政府 · 北京烤鸭制作工艺',
    sourceUrl: 'https://www.beijing.gov.cn/renwen/sy/whkb/201901/t20190104_1865061.html',
    illustrationBrief: '片鸭瓷盘配薄饼、葱丝，背景以小幅炉具表现挂炉烤鸭；不要用活鸭替代菜肴。',
  },
  {
    id: 'food:炸酱面', name: '炸酱面', kind: 'food', emoji: '🍜',
    question: '炸酱面旁边的小碟蔬菜，有一个什么名字？',
    answer: '它们叫“菜码”，也是这碗面的重要组成。',
    knowledge: '北京炸酱面由面条、炸酱和菜码搭配而成。黄瓜丝等蔬菜让颜色、口感更丰富；吃之前把酱和菜码拌进面里，就能认识这道家常风味的组合。',
    sourceTitle: '北京旅游网 · 京味美食',
    sourceUrl: 'https://www.visitbeijing.com.cn/article/4FrL1w246R7',
    illustrationBrief: '面碗居中，炸酱单独可辨，周围小碟黄瓜丝与蔬菜菜码；突出拌前的组合。',
  },
  {
    id: 'food:豆汁焦圈', name: '豆汁焦圈', kind: 'food', emoji: '🥣',
    question: '豆汁和常见的豆浆，是同一种饮品吗？',
    answer: '不是。北京豆汁与绿豆发酵有关。',
    knowledge: '豆汁以绿豆为原料，经过发酵等工序，形成独特的酸香。它与常见豆浆的制作和风味不同；这张卡把豆汁与焦圈放在一起，记录一组京味小吃。',
    sourceTitle: '北京旅游网 · 京味美食',
    sourceUrl: 'https://www.visitbeijing.com.cn/article/4FrL1w246R7',
    illustrationBrief: '浅灰绿色豆汁小碗配金色环状焦圈；不要画成白豆浆或甜甜圈。',
  },
  {
    id: 'food:铜锅涮肉', name: '铜锅涮肉', kind: 'food', emoji: '🍲',
    question: '北京铜锅涮肉，为什么常能看见清清的锅底？',
    answer: '清水锅底能让人把注意力放在肉本身的鲜味上。',
    knowledge: '清水锅底、薄切羊肉和麻酱，是北京铜锅涮肉常见的搭配。与浓重汤底相比，这种组合更容易让人分辨肉的味道，再用蘸料增加风味。',
    sourceTitle: '北京旅游网 · 铜锅涮肉',
    sourceUrl: 'https://www.visitbeijing.com.cn/article/4PqefVQlqSe',
    illustrationBrief: '中央烟囱式铜锅、清汤与薄切羊肉，旁放麻酱小碗；避免画成红油火锅。',
  },
  {
    id: 'food:驴打滚', name: '驴打滚', kind: 'food', emoji: '🍡',
    question: '名字带“驴”，这道小吃里面真有驴肉吗？',
    answer: '没有。观察外面那层黄豆面，就能找到命名的线索。',
    knowledge: '驴打滚是夹馅的黏面卷，外面滚上黄豆面。常见解释把它滚豆面的样子与驴在土里打滚作比；看切面还能发现卷皮和豆沙的层次。',
    sourceTitle: '北京市海淀区政府 · 驴打滚制作体验',
    sourceUrl: 'https://zyk.bjhd.gov.cn/jbdt/auto4533_51829/auto4533_55719/auto4533/auto4533/201811/t20181119_3918010.shtml',
    illustrationBrief: '豆面覆盖的黏面豆沙卷，至少一个切面显示螺旋层次；不画驴或肉馅。',
  },
  {
    id: 'spot:八达岭长城', name: '八达岭长城', kind: 'spot', emoji: '🏯',
    observation: '城墙怎样顺着山势起伏？再找找沿线高起的楼台。',
    question: '我们说的万里长城，是一次就建成的吗？',
    answer: '不是。长城是历代修筑、延续发展的防御体系。',
    knowledge: '长城由墙体、关隘等设施共同构成，并非同一时期一次建成的一堵墙。北京的八达岭是认识长城的重要一站；看城墙沿山势起伏，试着想想地形怎样参与防御。',
    sourceTitle: '联合国教科文组织 · 长城',
    sourceUrl: 'https://whc.unesco.org/en/list/438/',
    illustrationBrief: '沿山脊起伏的砖城墙、垛口与敌楼；保留山势，不画平地上的孤立城门。',
  },
  {
    id: 'spot:香山', name: '香山', kind: 'spot', emoji: '🍁',
    question: '香山只有秋天的红叶值得认识吗？',
    answer: '它也是一座具有山林特色的皇家园林。',
    knowledge: '香山公园的特点不止红叶，还有山林与园林相结合的空间。看山坡、树木和建筑怎样相互映衬，就能从“赏一种颜色”走向观察一座园林。',
    sourceTitle: '北京市园林绿化局 · 香山公园科普基地',
    sourceUrl: 'https://yllhj.beijing.gov.cn/ztxx/kpjd/202312/t20231222_3508036.shtml',
    illustrationBrief: '山林秋色与园林建筑共同构图，近景彩叶、远景山坡；避免只画一片枫叶。',
  },
  {
    id: 'spot:颐和园', name: '颐和园', kind: 'spot', emoji: '🏞',
    question: '颐和园的山与湖，只是建筑旁边的背景吗？',
    answer: '它们本身就是园林布局的骨架。',
    knowledge: '颐和园以万寿山和昆明湖为基本框架，将自然景观与人工建筑结合。认识这座园林，可以先找到山与水，再观察建筑如何依山临水安排。',
    sourceTitle: '联合国教科文组织 · 颐和园',
    sourceUrl: 'https://whc.unesco.org/en/list/880/',
    illustrationBrief: '昆明湖水面与万寿山形成主体关系，建筑依山临水；不把建筑画成湖心孤岛。',
  },
  {
    id: 'spot:故宫', name: '故宫', kind: 'spot', emoji: '🏛',
    observation: '宫殿是并排展开，还是沿着一条方向层层深入？',
    question: '故宫里，办典礼和日常居住的地方怎样区分？',
    answer: '可以先认识“前朝后寝”的空间安排。',
    knowledge: '外朝的太和殿、中和殿、保和殿合称三大殿，是举行国家大典礼的地方；内廷的乾清宫、交泰殿、坤宁宫合称后三宫。两组建筑帮助我们理解宫城的功能分区。',
    sourceTitle: '故宫博物院 · 全景故宫',
    sourceUrl: 'https://pano.dpm.org.cn/',
    illustrationBrief: '红墙黄瓦宫殿按南北纵深排列，前方广场开阔；避免把三大殿画成并排三座。',
  },
  {
    id: 'spot:什刹海', name: '什刹海', kind: 'spot', emoji: '🌊',
    question: '什刹海的“海”，真的是大海吗？',
    answer: '这里说的是前海、后海、西海等湖泊水域。',
    knowledge: '什刹海风景区由前海、后海、西海及周边地区组成。湖岸连接着民居与日常生活，看水面，也可以看看沿岸街巷怎样与水相伴。',
    sourceTitle: '北京市西城区政府 · 什刹海风景区',
    sourceUrl: 'https://www.bjxch.gov.cn/zt/schjmp/xxxq/pnidpv932631.html',
    illustrationBrief: '湖面、岸边垂柳与胡同民居，画小桥和沿岸步行空间；不要画海浪海滩。',
  },
  {
    id: 'spot:鸟巢', name: '鸟巢', kind: 'spot', emoji: '🏟',
    image: cloudAsset('/images/beijing/birds-nest.jpg'),
    observation: '找找外层钢构件的交织方向：它更像整齐的网格，还是编织的枝条？',
    question: '鸟巢外面交错的“枝条”，只是装饰吗？',
    answer: '这座建筑把钢结构与造型结合在了一起。',
    knowledge: '国家体育场的外观像由枝条编织而成的鸟巢。交织的钢构件不仅形成独特的外观，也参与建筑的结构体系。看这座场馆，可以把“长什么样”和“怎样建起来”放在一起理解。',
    sourceTitle: '北京市住建委 · 国家体育场工程',
    sourceUrl: 'https://zjw.beijing.gov.cn/bjjs/kjcxytg/jzyxjsyysfgc/ysgs/743807701/index.shtml',
    illustrationBrief: '低矮椭圆体育场，灰色钢构件编织交错、内层隐约红色；不画真正的鸟窝。',
  },
  {
    id: 'spot:水立方', name: '水立方', kind: 'spot', emoji: '🫧',
    image: cloudAsset('/images/beijing/water-cube.jpg'),
    observation: '先看立方体轮廓与“气泡”外墙，再了解里面的场地如何变化。',
    question: '水立方变成冰立方，是把整池水冻起来吗？',
    answer: '不是。转换依靠可拆装的结构与制冰系统。',
    knowledge: '为适应冰上赛事，建设团队在原有泳池空间搭建可转换结构，并安装可拆装制冰系统，形成新的冰上场地。这让同一座场馆能服务不同运动，也展示了建筑反复利用的可能。',
    sourceTitle: '中国建筑 · 水立方的水冰转换',
    sourceUrl: 'https://www.cscec.com/ztzl_new/xy20d/sxzjhd/202209/3572700.html',
    illustrationBrief: '低矮方盒体、浅蓝半透明不规则气泡膜外墙；不画成玻璃高楼或整池冰块。',
  },
  {
    id: 'spot:天坛', name: '天坛', kind: 'spot', emoji: '🏛',
    detailPath: '/pages/brief/brief?id=' + encodeURIComponent('spot:天坛'),
    image: cloudAsset('/images/beijing/temple-heaven.jpg'),
    observation: '北侧找三重蓝顶的祈年殿，南侧找露天圆坛圜丘。',
    question: '皇帝到天坛，为什么要去两个不同的地方？',
    answer: '祈年殿为丰收祈愿，圜丘承载冬至祭天之礼。',
    knowledge: '天坛是一组祭祀建筑。清代正月在北侧祈年殿举行祈谷礼，冬至祭天在南侧圜丘举行。看建筑时，把有蓝色圆顶的大殿和露天圆坛分别与用途对应起来。',
    sourceTitle: '北京市文物局 · 北京天坛圜丘坛建筑尺度研究',
    sourceUrl: 'https://wwj.beijing.gov.cn/bjww/362760/362770/436348561/index.html',
    illustrationBrief: '祈年殿圆形三重蓝瓦屋顶、红柱与白色圆形台基，完整展示建筑轮廓。',
  },
  {
    id: 'spot:国家大剧院', name: '国家大剧院', kind: 'spot', emoji: '🎭',
    image: cloudAsset('/images/beijing/national-theatre.jpg'),
    observation: '沿着银灰色屋顶找那道透明的“开口”，再看看水面倒影。',
    question: '看起来像一整块的外壳，真的只有一种材料吗？',
    answer: '它由钛金属板与透明玻璃共同组成。',
    knowledge: '国家大剧院的壳体将钛金属板和透明玻璃拼接，形成像舞台帷幕拉开一样的曲线。水面又让建筑产生倒影；看材料、曲线与倒影，能发现这座艺术建筑的另一种表达。',
    sourceTitle: '国家大剧院 · 剧院景观',
    sourceUrl: 'https://www.chncpa.org/cgylx/jyjg/',
    illustrationBrief: '低矮半椭球形银灰色钛金属壳体，中间透明玻璃如拉开的帷幕，水面倒影；不画悉尼歌剧院。',
  },
  {
    id: 'spot:北京中轴线', name: '北京中轴线', kind: 'spot', emoji: '🧭',
    question: '永定门、天安门和钟鼓楼，为什么能连成一条线？',
    answer: '从南到北，它们都是北京中轴线上的地标。',
    knowledge: discoveryTakeaway,
    sourceTitle: '联合国教科文组织 · 北京中轴线',
    sourceUrl: discoverySource,
    illustrationBrief: '用三个地标表现从南到北的排列，只作位置关系示意。',
  },
  {
    id: bellDrumFengwuId, name: '钟鼓楼', kind: 'spot', emoji: '🔔',
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=bell-drum',
    question: '一座城，怎么听见同一个时间？',
    answer: '旧时鼓楼入夜报时曾击鼓一百零八声。古人把这个数与十二个月、二十四节气和七十二候相联系。',
    knowledge: '鼓楼曾用铜壶滴漏计时，再用钟鼓声把时刻传向街巷。',
    sourceTitle: '北京市文物局 · 龙尾之曜——浅记北京鼓楼',
    sourceUrl: 'https://wwj.beijing.gov.cn/bjww/362760/362770/1757494/index.html',
    illustrationBrief: '北京中轴线北端的鼓楼与钟楼。',
  },
  {
    id: tiananmenSquareFengwuId, name: '天安门广场', kind: 'spot', emoji: '🏯',
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=square',
    question: '一条中轴线，怎样展开成一座广场？',
    answer: '天安门和人民英雄纪念碑在南北轴线上，人民大会堂与中国国家博物馆分列东西两侧。',
    knowledge: '在天安门广场，沿南北方向找中轴，再转头看东西两侧的建筑怎样围出广场的宽度。',
    sourceTitle: '首都之窗 · 北京中轴线',
    sourceUrl: 'https://www.beijing.gov.cn/renwen/zt/pwzz/index.html',
    illustrationBrief: '天安门、人民英雄纪念碑与广场两侧的建筑。',
  },
  {
    id: archeryTowerFengwuId, name: '正阳门箭楼', kind: 'spot', emoji: '🏯',
    image: cloudAsset('/images/beijing/archery-windows.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=archery-tower',
    question: '箭楼窗户上的白色“小帽子”，是古时候就有的吗？',
    answer: '白色弧形遮檐是近代改造时添上的西式细节，一座箭楼因而留下了两个时代的线索。',
    knowledge: '正阳门箭楼的箭窗原有86孔，1915年改造时后抱厦两侧各增4孔，成为94孔。读一座城门，可以先从窗户认出防御功能，再从遮檐等细节发现它在近代的变化。',
    sourceTitle: '北京市文物局 · 正阳门箭楼箭窗之谜',
    sourceUrl: 'https://wwj.beijing.gov.cn/bjww/362760/362770/623138/index.html',
    illustrationBrief: '借画卷局部辨认箭楼外形；专属朱印以成排箭窗、灰砖楼身和城台门洞为识别元素。',
  },
  {
    id: yongdingFengwuId, name: '永定门', kind: 'spot', emoji: '🏯',
    image: cloudAsset('/images/beijing/yongding-axis.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=yongding',
    question: '永定门，为什么消失后又回来了？',
    answer: '复建的城楼，让北京老城中轴线的南端重新变得可见。',
    knowledge: '历史上的永定门是外城正南门。原城楼于1957年被拆除，2004年依测绘图纸、照片等资料复建。现存城楼与南侧的地面标识，共同帮助人们辨认历史城门的位置和格局。',
    sourceTitle: '联合国教科文组织 · 复建永定门，与世界遗产价值的阐释',
    sourceUrl: 'https://www.unesco.org/zh/articles/zhongguofujianyongdingmenyushijieyichanjiazhidechanshi',
    illustrationBrief: '前景画现存复建城楼，沿历史中轴线向北串联正阳门、故宫与钟鼓楼；不把瓮城和箭楼画成现存实体。',
  },
  {
    id: summerGardensFengwuId, name: '颐和园 · 圆明园', kind: 'spot', emoji: '🏞️',
    image: cloudAsset('/images/beijing/imperial-gardens-comparison.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=summer',
    question: '同是皇家园林，为什么留下了不同的风景？',
    answer: '清漪园也曾遭到焚毁，重修后更名颐和园；圆明园今天以遗址与园林共同讲述历史。',
    knowledge: '看颐和园的湖山与长廊，再看圆明园的遗存与水面：今天的园景也记录了园林遭毁、修复和保护的经历。西洋楼只是圆明园的一部分。',
    sourceTitle: '北京市公园管理中心 · 颐和园、圆明园；故宫博物院 ·《圆明园长春园图》',
    sourceUrl: 'https://gygl.beijing.gov.cn/mlgy/mlgy_lsmy/201911/t20191129_732237.html',
    illustrationBrief: '上下对照昆明湖、佛香阁、长廊与西洋楼遗址、水面、树木，表现今日园景，不作历史复原。',
  },
  {
    id: lamaFengwuId, name: '雍和宫', kind: 'spot', emoji: '🏯',
    image: cloudAsset('/images/beijing/lama-bracelet.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=lama',
    question: '年轻人为什么想从雍和宫，带走一串手串？',
    answer: '手串可以承载一份旅行的念想；名字中的“宫”，则留下了这里从王府、行宫到寺院的身世。',
    knowledge: '从琉璃的通透与色泽走近雍和宫：它在1725年升格行宫，1744年改建为藏传佛教寺院。把小物件的纪念意义与地标的历史联系起来，不把颜色寓意当成功效。',
    sourceTitle: '北京旅游网 · 雍和宫“香灰手串”广受喜爱；北京市民族宗教事务委员会 · 雍和宫',
    sourceUrl: 'https://s.visitbeijing.com.cn/index.php/gallery/19203',
    illustrationBrief: '红墙黄瓦与树影下，年轻游客安静欣赏琉璃手串，不表现超自然效果、售卖或未经核实的院猫故事。',
  },
  {
    id: nanluoguFengwuId, name: '南锣鼓巷', kind: 'spot', emoji: '🏘️',
    image: cloudAsset('/images/beijing/nanluogu-fishbone.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=hutong-lane',
    question: '南锣鼓巷，为什么像一条“蜈蚣”？',
    answer: '南北主巷的东西两侧各连接八条胡同，鱼骨状路网让这片街区有了“蜈蚣巷”的形象叫法。',
    knowledge: '这片街区保留着元大都街巷格局的线索，不意味着每座现存院落都建于元代。雨儿胡同与帽儿胡同位于主巷西侧，可以从公共街巷观察道路和院门的关系。',
    sourceTitle: '北京市方志馆 · 北京老城故事：形似蜈蚣的南锣鼓巷',
    sourceUrl: 'https://xinwen.bjd.com.cn/content/s647d4e47e4b02cf67bd03d25.html',
    illustrationBrief: '微缩俯视街区，中央南北主巷左右各连接八条支巷，灰瓦院落与少量树木、红门；支巷长短与间距适度简化，不作历史复原或导航。',
  },
  {
    id: olympicFengwuId, name: '奥林匹克公园', kind: 'spot', emoji: '🏟️',
    image: cloudAsset('/images/beijing/olympic-round-square.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=olympic',
    question: '鸟巢和水立方，为什么偏偏是一圆一方？',
    answer: '东侧鸟巢与西侧水立方，一圆一方的组合呼应“天圆地方”，也留下了北京两届奥运会的记忆。',
    knowledge: '鸟巢是椭圆形国家体育场，水立方是方盒形国家游泳中心；对照两者的位置、外墙与双奥用途，再认识北京城市中轴线北延区域。再从2008与2022的双奥经历，看同一片城市空间怎样继续被使用。',
    sourceTitle: '北京旅游网 · 品读建筑线路游；首都之窗 · 国家体育场、北京奥林匹克公园',
    sourceUrl: 'https://s.visitbeijing.com.cn/index.php/line/990',
    illustrationBrief: '面朝北看两座场馆，左侧浅蓝水立方、右侧钢构鸟巢，傍晚公共空间有人散步拍照，不虚构固定市集与赛事。',
  },
  {
    id: qianmenFengwuId, name: '前门大街', kind: 'spot', emoji: '🚋',
    image: cloudAsset('/images/beijing/qianmen-tram.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=qianmen',
    question: '前门这辆“老电车”，真是从民国一直开到今天的吗？',
    answer: '不是同一批老车一直运营至今。后来复古铛铛车回到前门，用熟悉的样子延续城市记忆。',
    knowledge: '1924年，前门至西直门的1路有轨电车开通；旧式有轨电车后来退出，2009年元旦复古铛铛车在前门重新开通。看车身和轨道，也看两侧铺面及相连的大栅栏、鲜鱼口街。',
    sourceTitle: '北京旅游网 · 铛铛车，老北京城的一道风景线；首都之窗 · 北京旧城保护规划',
    sourceUrl: 'https://www.visitbeijing.com.cn/article/49C3dcRY6yv',
    illustrationBrief: '当代前门商业街，乳白深棕铛铛车停在嵌入石板的轨道上，两侧铺面与现代游客，不作民国实景复原或实时运行示意。',
  },
  {
    id: lugouFengwuId, name: '卢沟桥 · 宛平城', kind: 'spot', emoji: '🌉',
    image: cloudAsset('/images/beijing/lugou-wanping.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=lugou',
    question: '一座桥，为什么还需要一座城来守？',
    answer: '卢沟桥连接永定河两岸，桥东的宛平城承担守卫京城的作用；桥与城共同见证了抗战历史。',
    knowledge: '把跨河古桥与桥东卫城一起看，再观察石狮的大小、姿态，并结合现场说明认识抗战遗存。街区的交通、防守与历史记忆，因一座桥和一座城联系起来。',
    sourceTitle: '丰台区政府 · 卢沟桥；北京旅游网 · 宛平城；丰台时报 · 七七事变纪念',
    sourceUrl: 'https://www.bjft.gov.cn/ftq/c100033/201903/473059a6cd8940b2b314026195e0aa42.shtml',
    illustrationBrief: '前景大小石狮，中景多孔石拱桥跨河，桥东陆地上有宛平城门与当代参观者，不添加战争场面或虚构弹痕。',
  },
  {
    id: shougangFengwuId, name: '首钢园', kind: 'spot', emoji: '🏭',
    image: cloudAsset('/images/beijing/shougang-cooling-towers.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=shougang',
    question: '滑雪大跳台旁，为什么站着几座“大烟囱”？',
    answer: '它们是原首钢电力厂的冷却塔。旧塔保留下来，与新建大跳台一起成为首钢园转型的景观。',
    knowledge: '先从收腰轮廓认出冷却塔，区分它与烟囱、高炉，再看大跳台与敦煌飞天飘带相联系的曲线。旧工业景观与新运动用途在同一片空间相遇。',
    sourceTitle: '央广网 · 首钢滑雪大跳台场馆团队介绍；清华大学 · 张利谈雪飞天设计',
    sourceUrl: 'https://ent.cnr.cn/dsyyl/20220222/t20220222_525747384.shtml',
    illustrationBrief: '湖岸傍晚的大跳台与四座收腰冷却塔，前景有人散步拍照；不画塔顶烟雾、比赛或常年积雪，不把冷却塔画成高炉。',
  },
  {
    id: canalCultureFengwuId, name: '运河畔三座建筑', kind: 'spot', emoji: '📚',
    image: cloudAsset('/images/beijing/canal-cultural-trio.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=canal-culture',
    question: '这三座新建筑，为什么像粮仓、森林和船？',
    answer: '艺术中心借鉴古粮仓，图书馆把银杏树冠带进阅读空间，博物馆用船、帆、水的意象讲述运河。',
    knowledge: '从粮仓屋脊、图书馆室内的叶片顶棚和博物馆船帆屋顶，认识北京艺术中心、北京城市图书馆与北京大运河博物馆。它们是各有功能的新建文化空间，参观安排分别确认。',
    sourceTitle: '北京艺术中心官网；Snøhetta · 北京城市图书馆；首都博物馆 · 北京大运河博物馆',
    sourceUrl: 'https://www.bpac.org.cn/cgyl/',
    illustrationBrief: '竖版三联独立场景，上为艺术中心外观，中为图书馆银杏树冠室内，下为博物馆船帆屋顶与水街，不拼成连续地理全景。',
  },
  {
    id: art798FengwuId, name: '798 艺术园区', kind: 'spot', emoji: '🎨',
    image: cloudAsset('/images/beijing/art-798-skylight.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=art-798',
    question: '逛 798，先抬头看看屋顶为什么长着“锯齿”',
    answer: '代表性的老厂房用锯齿弧形屋顶与北向高窗组织采光，原来的工业空间后来迎来艺术创作与展览。',
    knowledge: '798由电子工业老厂区逐步转为艺术街区。观察弧形屋顶、高处采光窗和保留的砖墙管线，再看它们与今天展览的关系；并非园内所有建筑或展厅都有同样的采光方式。',
    sourceTitle: '北京旅游网 · 北京798艺术区；798园区官方问答',
    sourceUrl: 'https://www.visitbeijing.com.cn/article/47Qpveks7jD',
    illustrationBrief: '水彩街巷呈现锯齿弧形屋顶、高窗、红砖和开放展厅，有当代参观者，不画废墟或虚构具体展览。',
  },
  {
    id: sanlitunFengwuId, name: '三里屯太古里', kind: 'spot', emoji: '🏙️',
    image: cloudAsset('/images/beijing/sanlitun-open-lanes.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=sanlitun',
    question: '逛三里屯，为什么买东西总要先走到室外？',
    answer: '这里把店铺分布在独立楼体中，用开放街巷和小广场串联逛街，借鉴了北京胡同与院落的空间思路。',
    knowledge: '在现代玻璃与金属立面之间，观察通道、转角和小广场怎样连接。借鉴的是街巷与院落的空间关系，并不是把一片历史胡同直接改成商场。',
    sourceTitle: '太古地产 · 三里屯太古里；欧华尔顾问有限公司 · 三里屯太古里项目介绍',
    sourceUrl: 'https://www.swireproperties.com/en/about-us/50th-anniversary/place/16-taikoo-li-sanlitun/',
    illustrationBrief: '傍晚略俯视街角，现代低层楼体围合交错步行街巷和小广场，呈现散步聊天的人群，不依赖品牌标识或复原具体店铺。',
  },
  {
    id: longfuFengwuId, name: '隆福寺', kind: 'spot', emoji: '📖',
    image: cloudAsset('/images/beijing/longfu-rooftop.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=longfu',
    question: '来隆福寺，寺在哪里？',
    answer: '名字来自古寺，也留下了庙会、市场和商场的记忆；今天逛的是文化街区，楼顶仿古院落并非明代寺院原物。',
    knowledge: '隆福寺的文庙会曾吸引寻书看物的人，后来市场、百货与文化空间接续改变这里的日常。认识地名，也分清古寺、现代大厦和楼顶仿古文化空间的不同。',
    sourceTitle: '东城区政府 · 隆福寺书香文脉与隆福文化中心介绍；北京工程勘察设计协会 · 隆福寺地区复兴设计',
    sourceUrl: 'https://www.beijing.gov.cn/ywdt/gqrd/202604/t20260423_4605116.html',
    illustrationBrief: '现代楼体上红墙金瓦仿古院落与远处灰瓦老城相望，保留露台栏杆和现代楼体，不画成地面古寺，不代表实时开放状态。',
  },
  {
    id: daxingFengwuId, name: '大兴机场', kind: 'spot', emoji: '✈️',
    image: cloudAsset('/images/beijing/daxing-radial-terminal.jpg'),
    detailPath: '/pages/beijing-landmark/beijing-landmark?id=daxing',
    question: '大兴机场为什么长得像一只“海星”？',
    answer: '五条登机指廊从中央核心放射展开，让更多飞机靠近航站楼，同时控制核心区到登机口的步行距离。',
    knowledge: '把鸟瞰轮廓与实际乘机路线连起来：登机指廊向机坪展开，另一侧连接道路和地面交通；大厅曲面支撑与天窗帮助认识内部空间。设计中的步行时间不等于值机、安检到登机的全流程时间。',
    sourceTitle: 'ZHA · 北京大兴国际机场设计介绍；北京市重点站区管理委员会 · 机场基本情况',
    sourceUrl: 'https://www.zha.com/projects/architecture/beijing-daxing-international-airport',
    illustrationBrief: '竖版双景，上景暖金航站楼中央核心、五条登机指廊与陆侧道路，下景曲面支撑和天窗下的旅客；场景分开，不作精确导览或运行说明。',
  },
];

export const beijingMoreFengwuIds: string[] = ['spot:鸟巢', 'spot:水立方', 'spot:天坛', 'spot:国家大剧院'];

export function fengwuPath(id: string): string {
  return beijingFengwu.find((entry): boolean => entry.id === id)?.detailPath
    ?? '/pages/fengwu/fengwu?id=' + encodeURIComponent(id);
}

export function findBeijingFengwu(id: string): FengwuEntry {
  const entry: FengwuEntry | undefined = beijingFengwu.find((item: FengwuEntry): boolean => item.id === id);
  if (!entry) throw new RangeError('北京风物不存在：' + id);
  return entry;
}

export function readBeijingFengwuIds(): string[] {
  const stored: unknown = wx.getStorageSync(beijingFengwuKey);
  if (stored === '') return [];
  if (!Array.isArray(stored) || !stored.every((id: unknown): boolean => typeof id === 'string')) {
    throw new TypeError('北京风物收藏格式错误，请检查本地存储：' + beijingFengwuKey);
  }
  return Array.from(new Set(stored as string[]));
}

export function readBeijingFengwuCards(): FengwuCard[] {
  const ids: string[] = readBeijingFengwuIds();
  return beijingFengwu.map((entry: FengwuEntry): FengwuCard => ({ ...entry, lit: ids.includes(entry.id) }));
}
