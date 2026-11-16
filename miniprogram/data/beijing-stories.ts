import { BeijingBrief, findBeijingArticle, beijingPlacePath } from './beijing-briefs';
import { beijingMoreFengwuIds, FengwuEntry, findBeijingFengwu } from './beijing-fengwu';
import { beijingTopics } from './beijing-topics';

export interface BeijingStory {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  cover?: string;
  duration?: string;
}

export const featuredBeijingStories: BeijingStory[] = beijingTopics.filter((topic): boolean => topic.id !== 'royal');

export const additionalBeijingPlaces: BeijingStory[] = beijingMoreFengwuIds.map((id: string): BeijingStory => {
  const entry: FengwuEntry = findBeijingFengwu(id);
  const brief: BeijingBrief | undefined = findBeijingArticle(id);
  return {
    id,
    title: brief?.article?.title ?? entry.question,
    subtitle: entry.name,
    path: beijingPlacePath(id),
    cover: entry.image,
    duration: brief?.article?.duration,
  };
});

export function findBeijingStory(id: unknown): BeijingStory {
  const story: BeijingStory | undefined = [...featuredBeijingStories, ...additionalBeijingPlaces]
    .find((item: BeijingStory): boolean => item.id === id);
  if (!story) throw new RangeError('北京故事不存在：' + String(id));
  return story;
}
