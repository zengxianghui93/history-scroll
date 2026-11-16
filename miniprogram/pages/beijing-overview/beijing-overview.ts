import cities from '../../data/cities';
import { discoveryTakeaway } from '../../data/beijing-discovery';
import { beijingMapImage } from '../../data/beijing-map';
import { BeijingStory, featuredBeijingStories } from '../../data/beijing-stories';

const beijing = cities.find((city): boolean => city.id === 'city_beijing');
if (!beijing) throw new RangeError('城市资料缺少北京');

Page({
  data: {
    nameSource: '明永乐元年（1403 年），北平改称北京，取「北方的京城」之意。蓟、燕京、元大都这些名字，也留下了城市在不同时代的印记。',
    history: beijing.origin.history,
    axisFact: discoveryTakeaway,
    image: beijingMapImage,
    readingCards: featuredBeijingStories,
  },

  onOpenReading(event: WechatMiniprogram.TouchEvent): void {
    const card: BeijingStory | undefined = featuredBeijingStories.find((item: BeijingStory): boolean => item.id === event.currentTarget.dataset.id);
    if (!card) throw new RangeError('认识北京的专题不存在：' + String(event.currentTarget.dataset.id));
    wx.navigateTo({ url: card.path });
  },
});
