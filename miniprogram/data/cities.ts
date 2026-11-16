import { cloudAsset } from '../services/cloud-assets';
// 由 cities.json 自动迁移（规避 TS/小程序 JSON 导入的编译链差异）
const cities = [
  {
    "id": "city_beijing",
    "type": "city",
    "name": "北京",
    "aliases": [
      "燕京",
      "蓟",
      "幽州",
      "南京",
      "大都",
      "北平"
    ],
    "province": "北京",
    "coord": {
      "lat": 39.9042,
      "lng": 116.4074
    },
    "cover": cloudAsset("/images/covers/cover_beijing.jpg"),
    "slogan": "北方的京城，三千年建城史。",
    "origin": {
      "nameSource": "古称蓟、燕京；辽称南京，金称中都，元称大都；明永乐元年(1403)改北平为北京，意为「北方的京城」。",
      "history": "早期蓟城 → 辽南京 → 金中都 → 元大都 → 明清北京 → 民国北平 → 1949 年定为首都。",
      "landmarks": [
        "故宫",
        "八达岭长城",
        "天坛",
        "颐和园",
        "南锣鼓巷"
      ],
      "climate": "暖温带半湿润季风气候，四季分明，春秋短、冬夏长。",
      "food": [
        "北京烤鸭",
        "炸酱面",
        "豆汁焦圈",
        "铜锅涮肉",
        "驴打滚"
      ]
    },
    "facts": [
      "故宫的外朝三大殿与内廷后三宫，帮助我们认识「前朝后寝」的功能分区。",
      "北京中轴线南起永定门、北至钟鼓楼，长约 7.8 公里，2024 年列入《世界遗产名录》。",
      "什刹海由前海、后海、西海及周边地区组成，水岸与街巷共同构成城市风景。",
      "天坛不止祈年殿，还包括圜丘坛、皇穹宇等建筑与空间。"
    ],
    "checkinUnlock": "本地人带路才知的胡同隐秘小吃地图与钟鼓楼下的老北京市井生活。",
    "achievements": [
      "series_gudu",
      "collect_beijing"
    ],
    "deepChapters": [
      "chapter_beijing_deep_royal",
      "chapter_beijing_deep_history",
      "chapter_beijing_deep_hutong"
    ],
    "spots": [
      {
        "name": "八达岭长城",
        "type": "historic/mountain",
        "intro": "万里长城精华段。",
        "coord": {
          "lat": 40.3595,
          "lng": 116.0156
        }
      },
      {
        "name": "香山",
        "type": "mountain",
        "intro": "红叶名山。",
        "coord": {
          "lat": 39.9959,
          "lng": 116.1883
        }
      },
      {
        "name": "颐和园",
        "type": "park",
        "intro": "皇家园林。",
        "coord": {
          "lat": 39.9999,
          "lng": 116.2755
        }
      },
      {
        "name": "故宫",
        "type": "historic",
        "intro": "明清皇宫。",
        "coord": {
          "lat": 39.9163,
          "lng": 116.3972
        }
      },
      {
        "name": "什刹海",
        "type": "river/lake",
        "intro": "前海后海。",
        "coord": {
          "lat": 39.9402,
          "lng": 116.3833
        }
      }
    ]
  },
  {
    "id": "city_xian",
    "type": "city",
    "name": "西安",
    "aliases": [
      "长安",
      "镐京",
      "京兆",
      "大兴"
    ],
    "province": "陕西",
    "coord": {
      "lat": 34.3416,
      "lng": 108.9398
    },
    "cover": cloudAsset("/images/covers/cover_xian.jpg"),
    "slogan": "十三朝古都，丝绸之路东方起点。",
    "origin": {
      "nameSource": "明洪武二年(1369)改奉元路为西安府，意为「安定西北」；古称长安(长治久安)、镐京、京兆、大兴。",
      "history": "十三朝古都：周丰镐、秦咸阳、汉长安、隋大兴、唐长安；丝绸之路东方起点；明代西安府城墙保存至今。",
      "landmarks": [
        "兵马俑",
        "大雁塔",
        "西安城墙",
        "钟鼓楼",
        "回民街",
        "陕西历史博物馆"
      ],
      "climate": "温带季风气候，四季分明，昼夜温差较大。",
      "food": [
        "肉夹馍",
        "羊肉泡馍",
        "biangbiang面",
        "凉皮",
        "柿子饼"
      ]
    },
    "facts": [
      "西安城墙是中国现存规模最大、保存最完整的古代城垣。",
      "大雁塔是玄奘译经与存放佛指舍利之地，唐代为长安地标。",
      "「长安」作为国都之名使用超千年。",
      "回民街一带饮食融合了丝路带来的西域风味。"
    ],
    "checkinUnlock": "城墙根下听一段秦腔、永宁门夜游的本地玩法。",
    "achievements": [
      "series_gudu",
      "collect_xian"
    ],
    "spots": [
      {
        "name": "大雁塔",
        "type": "historic",
        "intro": "玄奘译经之地。",
        "coord": {
          "lat": 34.2189,
          "lng": 108.964
        }
      },
      {
        "name": "西安城墙",
        "type": "historic",
        "intro": "保存最完整的古代城垣。",
        "coord": {
          "lat": 34.2583,
          "lng": 108.9286
        }
      },
      {
        "name": "兵马俑",
        "type": "historic",
        "intro": "秦始皇陵陪葬坑。",
        "coord": {
          "lat": 34.3853,
          "lng": 109.2785
        }
      },
      {
        "name": "华山",
        "type": "mountain",
        "intro": "周边，五岳之一。",
        "coord": {
          "lat": 34.1596,
          "lng": 110.0865
        }
      },
      {
        "name": "秦岭",
        "type": "mountain",
        "intro": "周边，中国南北分界线。",
        "coord": {
          "lat": 33.9,
          "lng": 107.7
        }
      }
    ]
  },
  {
    "id": "city_chengdu",
    "type": "city",
    "name": "成都",
    "aliases": [
      "锦官城",
      "蓉城",
      "益州"
    ],
    "province": "四川",
    "coord": {
      "lat": 30.5728,
      "lng": 104.0668
    },
    "cover": cloudAsset("/images/covers/cover_chengdu.jpg"),
    "slogan": "天府之国，城名两千年未改。",
    "origin": {
      "nameSource": "成都之名始于战国，蜀语中「成」有「终了、完成」或「蜀人聚居中心」之意；一说「成」为平原、「都」为止境。建城 2300 余年城名未改、城址未迁。",
      "history": "古蜀文明(三星堆、金沙) → 秦设蜀郡、李冰修都江堰 → 汉益州 → 蜀汉都城 → 唐宋「扬一益二」 → 前后蜀 → 明清至今。",
      "landmarks": [
        "宽窄巷子",
        "武侯祠",
        "锦里",
        "春熙路",
        "大熊猫基地",
        "杜甫草堂"
      ],
      "climate": "亚热带湿润季风气候，多雾湿润，「天府之国」。",
      "food": [
        "火锅",
        "串串香",
        "担担面",
        "麻婆豆腐",
        "龙抄手",
        "钟水饺"
      ]
    },
    "facts": [
      "都江堰历经 2200 余年仍在灌溉成都平原，是仍在使用的古代水利工程。",
      "成都别称「锦官城」，因汉代设锦官管理织锦得名，杜甫有「锦官城外柏森森」。",
      "大熊猫栖息地就在成都周边。",
      "宽窄巷子是清朝满城遗存的少数街道。"
    ],
    "checkinUnlock": "本地人才知道的苍蝇馆子清单与喝茶听评书的老茶馆。",
    "achievements": [
      "collect_chengdu"
    ],
    "spots": [
      {
        "name": "青城山",
        "type": "mountain",
        "intro": "道教名山。",
        "coord": {
          "lat": 30.898,
          "lng": 103.568
        }
      },
      {
        "name": "都江堰",
        "type": "historic/river",
        "intro": "千年水利工程。",
        "coord": {
          "lat": 31.004,
          "lng": 103.616
        }
      },
      {
        "name": "西岭雪山",
        "type": "mountain",
        "intro": "杜甫「窗含西岭千秋雪」。",
        "coord": {
          "lat": 30.6,
          "lng": 103.2
        }
      },
      {
        "name": "大熊猫基地",
        "type": "park/modern",
        "intro": "看滚滚的地方。",
        "coord": {
          "lat": 30.734,
          "lng": 104.146
        }
      },
      {
        "name": "锦江",
        "type": "river",
        "intro": "府河与南河。",
        "coord": {
          "lat": 30.64,
          "lng": 104.07
        }
      }
    ]
  },
  {
    "id": "city_hangzhou",
    "type": "city",
    "name": "杭州",
    "aliases": [
      "临安",
      "钱塘",
      "武林"
    ],
    "province": "浙江",
    "coord": {
      "lat": 30.2741,
      "lng": 120.1551
    },
    "cover": cloudAsset("/images/covers/cover_hangzhou.jpg"),
    "slogan": "江南忆，最忆是杭州。",
    "origin": {
      "nameSource": "隋开皇九年(589)置杭州；「杭」本义方舟、渡口(《说文》「杭，方舟也」)，相传大禹「舍舟登陆」称「禹杭」→「余杭」→「杭州」；古称临安、钱塘、武林。",
      "history": "吴越国都(钱镠) → 南宋行在临安(1129 后) → 京杭大运河南端终点 → 西湖文化景观列入世界遗产。",
      "landmarks": [
        "西湖",
        "灵隐寺",
        "雷峰塔",
        "西溪湿地",
        "河坊街",
        "京杭大运河杭州段"
      ],
      "climate": "亚热带季风气候，温和湿润，四季分明。",
      "food": [
        "西湖醋鱼",
        "龙井虾仁",
        "东坡肉",
        "片儿川",
        "定胜糕"
      ]
    },
    "facts": [
      "西湖原为海湾，经泥沙淤积成潟湖，再成淡水湖。",
      "白堤、苏堤分别因白居易、苏轼治理西湖而得名。",
      "京杭大运河是世界上里程最长的人工运河。",
      "灵隐寺始建于东晋，是江南著名古刹。"
    ],
    "checkinUnlock": "本地人晨练的西湖秘径与龙井村问茶路线。",
    "achievements": [
      "collect_hangzhou"
    ],
    "spots": [
      {
        "name": "西湖",
        "type": "park/lake",
        "intro": "世界文化遗产。",
        "coord": {
          "lat": 30.259,
          "lng": 120.149
        }
      },
      {
        "name": "灵隐寺",
        "type": "historic",
        "intro": "东晋古刹。",
        "coord": {
          "lat": 30.241,
          "lng": 120.101
        }
      },
      {
        "name": "西溪湿地",
        "type": "park",
        "intro": "城市湿地。",
        "coord": {
          "lat": 30.27,
          "lng": 120.07
        }
      },
      {
        "name": "宝石山",
        "type": "mountain",
        "intro": "俯瞰西湖。",
        "coord": {
          "lat": 30.27,
          "lng": 120.14
        }
      },
      {
        "name": "京杭大运河",
        "type": "river",
        "intro": "杭州段。",
        "coord": {
          "lat": 30.32,
          "lng": 120.15
        }
      }
    ]
  },
  {
    "id": "city_harbin",
    "type": "city",
    "name": "哈尔滨",
    "aliases": [
      "冰城",
      "东方莫斯科",
      "阿勒锦（古称）"
    ],
    "province": "黑龙江",
    "coord": {
      "lat": 45.8038,
      "lng": 126.535
    },
    "cover": cloudAsset("/images/covers/cover_harbin.jpg"),
    "slogan": "冰城之下，是金源文明的余温。",
    "origin": {
      "nameSource": "满语/女真语「阿勒锦」(意为晒网场)音译而来；另说女真语「荣誉、声望」之意。近代因中东铁路建设成为城市，别称「东方莫斯科」「冰城」。",
      "history": "清末中东铁路修建促使其发展为近代城市；20 世纪初因冰雪与多元建筑(俄式、巴洛克)闻名；日据时期称「滨江」；后定名哈尔滨。",
      "landmarks": [
        "中央大街",
        "圣索菲亚大教堂",
        "冰雪大世界",
        "防洪纪念塔",
        "老道外中华巴洛克"
      ],
      "climate": "中温带大陆性季风气候，冬季漫长严寒(常低于 -20℃)，故称「冰城」。",
      "food": [
        "锅包肉",
        "红肠",
        "马迭尔冰棍",
        "格瓦斯",
        "大列巴"
      ]
    },
    "facts": [
      "中央大街的面包石由俄国工匠铺设，当年每块造价曾值一块银元。",
      "冰雪大世界用冰多取自松花江，年用冰量以万立方米计。",
      "哈尔滨之夏音乐会是新中国历史最久的综合性音乐会之一。",
      "圣索菲亚大教堂是远东地区最大的东正教堂之一。"
    ],
    "checkinUnlock": "本地人才知道的中央大街面包石故事与老道外中华巴洛克老街。",
    "achievements": [
      "collect_harbin",
      "series_ice"
    ],
    "spots": [
      {
        "name": "松花江",
        "type": "river",
        "intro": "母亲河，冬季封冻成天然冰雪场。",
        "coord": {
          "lat": 45.77,
          "lng": 126.63
        }
      },
      {
        "name": "太阳岛",
        "type": "park",
        "intro": "松花江北岸避暑与雪博会胜地。",
        "coord": {
          "lat": 45.79,
          "lng": 126.56
        }
      },
      {
        "name": "冰雪大世界",
        "type": "modern",
        "intro": "年度冰雪主题园区，用冰取自松花江。",
        "coord": {
          "lat": 45.68,
          "lng": 126.6
        }
      },
      {
        "name": "中央大街",
        "type": "historic/modern",
        "intro": "百年面包石步行街，俄式建筑长廊。",
        "coord": {
          "lat": 45.77,
          "lng": 126.62
        }
      },
      {
        "name": "帽儿山",
        "type": "mountain",
        "intro": "哈尔滨周边徒步登山目的地。",
        "coord": {
          "lat": 45.33,
          "lng": 127.58
        }
      }
    ]
  }
];

export default cities;
