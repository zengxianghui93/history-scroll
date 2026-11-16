export interface LearningFocus {
  id: string;
  label: string;
  title: string;
  text: string;
  illustrationStyle: string;
}

export interface FengwuLearning {
  kind: 'palace' | 'wall' | 'water';
  title: string;
  caption: string;
  focuses: LearningFocus[];
}

const palace: FengwuLearning = {
  kind: 'palace', title: '从前到后，看两组建筑', caption: '功能分区示意，只画两组核心建筑，不作实际游览导航。',
  focuses: [
    { id: 'outer', label: '外朝', title: '前面的空间，承担典礼功能', text: '外朝以太和殿、中和殿、保和殿三大殿为中心。先看建筑之间的排列，再把它们与举行国家大典礼的功能联系起来。', illustrationStyle: '' },
    { id: 'inner', label: '内廷', title: '继续向后，空间功能发生变化', text: '内廷以乾清宫、交泰殿、坤宁宫后三宫为中心。这里帮助我们认识“前朝后寝”的分区，不表示宫城只有这六座建筑。', illustrationStyle: '' },
  ],
};

const wall: FengwuLearning = {
  kind: 'wall', title: '放大一点，再看城墙', caption: '插画局部观察，不对应精确地形或测绘位置。',
  focuses: [
    { id: 'ridge', label: '沿山的墙体', title: '把目光从一块砖移到整段山势', text: '观察墙体如何随山势延伸。认识长城时，要把墙体、楼台和关隘放回地形与防御体系中理解。', illustrationStyle: 'width:1715rpx;height:2572.5rpx;left:-1025rpx;top:-236rpx;' },
    { id: 'tower', label: '高起的楼台', title: '墙体并不是唯一的组成', text: '再找找沿线高起的楼台。长城是由多种设施组成的体系，不能只把它想成同一时期建成的一堵墙。', illustrationStyle: 'width:2744rpx;height:4116rpx;left:-1595rpx;top:-437rpx;' },
  ],
};

const water: FengwuLearning = {
  kind: 'water', title: '同一个空间，两种使用方式', caption: '概念示意省略工程细节；转换需要配套结构、设备与环境控制。',
  focuses: [
    { id: 'pool', label: '水上使用', title: '先认识原有泳池空间', text: '水上赛事使用泳池。为了再承接冰上赛事，需要重新组织场地与设备，并非把整池水直接冻成冰。', illustrationStyle: '' },
    { id: 'ice', label: '冰上使用', title: '在原空间内搭建可转换场地', text: '先处理原泳池，再搭建可转换支撑结构并安装可拆装制冰系统。图中的冰面位于新搭建的平台上，下面是原泳池空间。', illustrationStyle: '' },
  ],
};

export function findFengwuLearning(id: string): FengwuLearning | null {
  if (id === 'spot:故宫') return palace;
  if (id === 'spot:八达岭长城') return wall;
  if (id === 'spot:水立方') return water;
  return null;
}
