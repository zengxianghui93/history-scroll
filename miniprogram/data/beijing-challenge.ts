import { findBeijingBrief } from './beijing-briefs';
import { beijingMapImage, fengwuIllustrationStyle } from './beijing-map';

interface QuestionDefinition {
  id: string;
  illustration: 'pool' | 'nest' | 'palace';
  prompt: string;
  choices: [string, string];
  correctIndex: 0 | 1;
  explanation: string;
}

export interface ChallengeQuestion extends QuestionDefinition {
  name: string;
  image: string;
  artStyle: string;
  briefPath: string;
}

const definitions: QuestionDefinition[] = [
  {
    id: 'spot:水立方', illustration: 'pool',
    prompt: '冰立方的冰面下面，原来的泳池还在吗？',
    choices: ['还在', '已经填平了'], correctIndex: 0,
    explanation: '泳池空间还在，冰场就搭在它上方的支撑平台上。',
  },
  {
    id: 'spot:鸟巢', illustration: 'nest',
    prompt: '鸟巢外面交错的钢梁，有什么用？',
    choices: ['只是装饰', '也参与支撑场馆'], correctIndex: 1,
    explanation: '这些像枝条一样交错的钢梁，既组成了鸟巢的外形，也参与支撑场馆。',
  },
  {
    id: 'spot:故宫', illustration: 'palace',
    prompt: '从故宫南边进来，先到的是哪一组建筑？',
    choices: ['举行大典的外朝', '日常起居的内廷'], correctIndex: 0,
    explanation: '外朝在前、内廷在后，这就是常说的“前朝后寝”。',
  },
];

export const beijingChallengeQuestions: ChallengeQuestion[] = definitions.map((definition: QuestionDefinition): ChallengeQuestion => {
  const brief = findBeijingBrief(definition.id);
  return {
    ...definition,
    name: brief.entry.name,
    image: brief.entry.image ?? beijingMapImage,
    artStyle: brief.entry.image ? '' : fengwuIllustrationStyle(brief.id),
    briefPath: brief.path,
  };
});

/** 分享固定题组入口，朋友从第一题开始自己的挑战。 */
export function shareBeijingChallenge(): { title: string; path: string; imageUrl: string } {
  return {
    title: '冰立方下面还有泳池吗？北京这三题，来猜猜看',
    path: '/pages/challenge/challenge',
    imageUrl: beijingChallengeQuestions[0].image,
  };
}
