// 由 chapters.json 自动迁移（规避 TS/小程序 JSON 导入的编译链差异）
const chapters = [
  {
    "id": "chapter_beijing_intro",
    "cityId": "city_beijing",
    "type": "intro",
    "title": "北京·初遇篇",
    "knowledgeRef": [
      "origin.nameSource",
      "origin.history"
    ],
    "diary": "它在景山上望向紫禁城，发现眼前不止一片红墙黄瓦，还有层层院落和一座城的故事。它决定先认清这些建筑怎样排列，再慢慢去找今天的肉香。",
    "takeaway": "北京故宫是明清两代的皇宫；认识它，可以先从外朝三大殿与内廷后三宫的布局入手。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false,
    "sources": [
      {
        "title": "故宫博物院 · 建筑",
        "url": "https://www.dpm.org.cn/explore/buildings.html"
      }
    ]
  },
  {
    "id": "chapter_beijing_food",
    "cityId": "city_beijing",
    "type": "food",
    "title": "北京·舌尖篇",
    "knowledgeRef": [
      "origin.food"
    ],
    "diary": "炸酱面它给三分，真爱是铜锅涮肉，肉片在清汤里一涮，它开心得原地转圈，被店家温柔地请出了锅边。",
    "takeaway": "北京烤鸭有挂炉、焖炉等制作流派；炸酱面由面条、炸酱与菜码搭配，做法和组合都藏着城市风味。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false,
    "sources": [
      {
        "title": "北京市政府 · 北京烤鸭制作工艺",
        "url": "https://www.beijing.gov.cn/renwen/sy/whkb/201901/t20190104_1865061.html"
      },
      {
        "title": "北京旅游网 · 京味美食",
        "url": "https://www.visitbeijing.com.cn/article/4FrL1w246R7"
      }
    ]
  },
  {
    "id": "chapter_beijing_deep_royal",
    "cityId": "city_beijing",
    "type": "deep",
    "title": "北京·皇城六百年",
    "knowledgeRef": [],
    "diary": "它从永定门出发，在地图上沿中轴线向北认识北京：城门、广场、宫殿和钟鼓楼，把不同的空间联系起来。来到故宫，它先看外朝三大殿，再认识后面的内廷后三宫，终于发现“建筑怎样排列”和“空间用来做什么”可以一起理解。它想把今天的晚饭也排成一条线，排到最后，还是决定先吃。",
    "takeaway": "北京中轴线长约7.8公里，2024年列入《世界遗产名录》；故宫的外朝与内廷分区，可以帮助理解“前朝后寝”的空间安排。",
    "deepPoints": [
      {
        "icon": "📏",
        "title": "沿一条线认识城市",
        "text": "今天的北京中轴线南起永定门、北至钟鼓楼，串联建筑与公共空间。它的格局经过历史发展形成，不宜把各时期的城门、城址都视作完全相同。"
      },
      {
        "icon": "🏛",
        "title": "看建筑，也看空间",
        "text": "沿线不只有宫殿，也有城门、广场等不同空间。把建筑放回城市之中，才能理解它们怎样共同形成秩序。"
      },
      {
        "icon": "👑",
        "title": "前朝后寝的分区",
        "text": "外朝以太和殿、中和殿、保和殿三大殿为中心；内廷以乾清宫、交泰殿、坤宁宫后三宫为中心，空间功能帮助我们理解宫城布局。"
      }
    ],
    "cover": "",
    "trigger": "dispatch",
    "lockedByCheckin": false,
    "sources": [
      {
        "title": "联合国教科文组织 · 北京中轴线",
        "url": "https://whc.unesco.org/en/list/1714/"
      },
      {
        "title": "故宫博物院 · 建筑",
        "url": "https://www.dpm.org.cn/explore/buildings.html"
      }
    ]
  },
  {
    "id": "chapter_beijing_deep_history",
    "cityId": "city_beijing",
    "type": "deep",
    "title": "北京·三千年建城史",
    "knowledgeRef": [],
    "diary": "它先认识了金中都，又去地图上找元大都，才发现北京的历史不是在同一个圈里不断加大。元大都在金中都东北郊另选新址，后来的城市布局又继续变化。它看着今天还能找到的城垣遗迹和地名，觉得认识一座古城，有时像把不同时代留下的线索慢慢拼起来。",
    "takeaway": "从金中都到元大都，北京的城址和布局经历变化；元大都选址于金中都东北郊，为后来的北京城市格局奠定了基础。",
    "deepPoints": [
      {
        "icon": "🏯",
        "title": "金中都的都城阶段",
        "text": "金代以辽南京旧址为基础扩建中都，这是认识北京建都历史的重要阶段。"
      },
      {
        "icon": "🐎",
        "title": "元大都另择新址",
        "text": "元大都选址在金中都东北郊，城址和规划发生变化。理解这一点，就不会把不同年代的城市误画成始终不变的同一座城。"
      },
      {
        "icon": "🏛",
        "title": "用遗迹理解变化",
        "text": "元大都城垣遗址等遗存，让今天的人能够在现代城市里辨认过去。具体城址、城墙与年代需要分别查看。"
      }
    ],
    "cover": "",
    "trigger": "dispatch",
    "lockedByCheckin": false,
    "sources": [
      {
        "title": "北京市政府 · 元大都城垣遗址公园",
        "url": "https://www.beijing.gov.cn/renwen/rwzyd/qgzdwwbhdw/yddcqyz/202210/t20221031_2848744.html"
      },
      {
        "title": "北京市发改委 · 历史文化名城保护规划",
        "url": "https://fgw.beijing.gov.cn/fzggzl/sswgh2016/ghhg/201912/t20191227_1523410.htm"
      }
    ]
  },
  {
    "id": "chapter_beijing_deep_hutong",
    "cityId": "city_beijing",
    "type": "deep",
    "title": "北京·胡同里的市井",
    "knowledgeRef": [],
    "diary": "它沿着什刹海水岸走进街巷，看到灰色院墙、树影和安静的院门。它想起刚才看过的宫殿：同样是建筑，日常生活却有另一种尺度。它在门外观察一座院落的布局，又听见街边的人声，觉得认识北京，也该给普通人的生活留一个位置。",
    "takeaway": "什刹海由前海、后海、西海及周边地区组成；街巷、水岸和院落，让人从日常生活的角度认识北京。",
    "deepPoints": [
      {
        "icon": "🌊",
        "title": "水岸与街巷",
        "text": "什刹海风景区包括前海、后海、西海及周边地区。认识这里，可以把湖泊、街巷与民居放在一起观察。"
      },
      {
        "icon": "🏡",
        "title": "围绕庭院的住宅",
        "text": "四合院以正房、倒座房、东西厢房等围绕中间庭院形成布局。观察房屋与院子的关系，比仅凭一条固定居住规则理解它更清楚。"
      },
      {
        "icon": "🕊",
        "title": "从日常看城市",
        "text": "沿岸步行、街巷交往与院落生活，是理解城市的另一种视角。具体建筑的历史和居民故事，还需要结合可靠资料与现场介绍。"
      }
    ],
    "cover": "",
    "trigger": "dispatch",
    "lockedByCheckin": false,
    "sources": [
      {
        "title": "北京市西城区政府 · 什刹海风景区",
        "url": "https://www.bjxch.gov.cn/zt/schjmp/xxxq/pnidpv932631.html"
      },
      {
        "title": "北京市政府 · 老北京四合院",
        "url": "https://www.beijing.gov.cn/tsbj/sxym/202007/t20200713_1946380.html"
      }
    ]
  },
  {
    "id": "chapter_xian_intro",
    "cityId": "city_xian",
    "type": "intro",
    "title": "西安·初遇篇",
    "knowledgeRef": [
      "origin.nameSource",
      "origin.history"
    ],
    "diary": "它数着「九千九百九十九间半」的房，数到头晕，改成数屋檐上的小兽；钻进胡同找井，没找到，只找到了卤煮摊。",
    "takeaway": "西安古称长安，是十三朝古都、丝绸之路的东方起点；秦始皇兵马俑在此沉睡了两千余年。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false
  },
  {
    "id": "chapter_xian_food",
    "cityId": "city_xian",
    "type": "food",
    "title": "西安·舌尖篇",
    "knowledgeRef": [
      "origin.food"
    ],
    "diary": "肉夹馍它啃得欢，biangbiang 面让它忘了形象，辣得直吐舌头却不肯停。",
    "takeaway": "肉夹馍实为「肉夹于馍」，腊汁肉配白吉馍；biangbiang 面的「biang」字有五十多笔。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false
  },
  {
    "id": "chapter_chengdu_intro",
    "cityId": "city_chengdu",
    "type": "intro",
    "title": "成都·初遇篇",
    "knowledgeRef": [
      "origin.nameSource",
      "origin.history"
    ],
    "diary": "它听说「成都」城名两千年未改、城址未迁，惊叹：一座城能安稳到连名字都不换，真舒服。",
    "takeaway": "成都城名与城址两千年未变，是古蜀文明的中心；三国蜀汉曾在此立都。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false
  },
  {
    "id": "chapter_chengdu_food",
    "cityId": "city_chengdu",
    "type": "food",
    "title": "成都·舌尖篇",
    "knowledgeRef": [
      "origin.food"
    ],
    "diary": "火锅它辣得直吐舌头却不肯停，担担面被一扫而光，临走还打包了钟水饺。",
    "takeaway": "成都火锅重牛油麻辣；钟水饺、担担面皆是川味小食代表，调味离不了红油与芝麻。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false
  },
  {
    "id": "chapter_hangzhou_intro",
    "cityId": "city_hangzhou",
    "type": "intro",
    "title": "杭州·初遇篇",
    "knowledgeRef": [
      "origin.nameSource",
      "origin.history"
    ],
    "diary": "它沿白堤、苏堤走了一圈，心想：一条堤能因两个人得名，这城，真浪漫。",
    "takeaway": "杭州古称临安，西湖被列入世界遗产；白居易、苏轼都曾疏浚此湖，留下白堤、苏堤。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false
  },
  {
    "id": "chapter_hangzhou_food",
    "cityId": "city_hangzhou",
    "type": "food",
    "title": "杭州·舌尖篇",
    "knowledgeRef": [
      "origin.food"
    ],
    "diary": "西湖醋鱼它眯眼细品，龙井虾仁让它打了一个清香的嗝，东坡肉让它决定多留一夜。",
    "takeaway": "西湖醋鱼讲究活鱼现烹、糖醋琉璃芡；龙井虾仁以明前龙井入馔，清鲜回甘。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false
  },
  {
    "id": "chapter_harbin_intro",
    "cityId": "city_harbin",
    "type": "intro",
    "title": "哈尔滨·初遇篇",
    "knowledgeRef": [
      "origin.nameSource",
      "origin.history"
    ],
    "diary": "它在教堂鸽群里写下：原来一座城可以又冷又热——天气冷，人情热。它决定多待两天。",
    "takeaway": "哈尔滨有「东方莫斯科」之称；中央大街的面包石路铺于上世纪初，两侧多欧式建筑。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false
  },
  {
    "id": "chapter_harbin_food",
    "cityId": "city_harbin",
    "type": "food",
    "title": "哈尔滨·舌尖篇",
    "knowledgeRef": [
      "origin.food"
    ],
    "diary": "它在中央大街连吃三根马迭尔冰棍，东北人看了都沉默；锅包肉获四爪好评。",
    "takeaway": "哈尔滨红肠源自东欧风味，秋林里道斯是百年老字号；锅包肉是鲁菜闯关东后的变体。",
    "cover": "",
    "trigger": "daily",
    "lockedByCheckin": false
  }
];

export default chapters;
