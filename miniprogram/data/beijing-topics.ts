interface BeijingTopic {
  id: string;
  title: string;
  subtitle: string;
  chapterId: string;
  path: string;
  number: string;
}

export const hutongTopic: BeijingTopic = {
  id: 'hutong', number: '三', title: '胡同里藏着怎样的生活？', subtitle: '胡同里的市井 · 看见水岸与人家',
  chapterId: 'chapter_beijing_deep_hutong', path: '/pages/city/city?cityId=city_beijing&chapterId=chapter_beijing_deep_hutong&section=diary',
};

export const beijingTopics: BeijingTopic[] = [
  { id: 'royal', number: '一', title: '故宫为什么这样排列？', subtitle: '皇城六百年 · 从建筑读懂秩序', chapterId: 'chapter_beijing_deep_royal', path: '/pages/city/city?cityId=city_beijing&chapterId=chapter_beijing_deep_royal&section=diary' },
  { id: 'history', number: '二', title: '今天的北京，怎样形成？', subtitle: '三千年建城史 · 顺着时间认识城市', chapterId: 'chapter_beijing_deep_history', path: '/pages/city/city?cityId=city_beijing&chapterId=chapter_beijing_deep_history&section=diary' },
  hutongTopic,
];
