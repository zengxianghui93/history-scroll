import { Chapter, ReaderPage, ReaderPreferences, paginateMeasuredChapter } from './core';
export const READER_FONT: string = '"Songti SC", "SimSun", serif';
interface TextContext { font: string; measureText(text: string): {width: number} }
export function layoutChapter(chapter: Chapter, width: number, height: number, preferences: ReaderPreferences): ReaderPage[] {
  const context = wx.createOffscreenCanvas({type:'2d',width:1,height:1}).getContext('2d') as TextContext;
  context.font = preferences.fontSize + 'px ' + READER_FONT;
  const widths: Map<string,number> = new Map();
  const measure = (text: string): number => {
    const cached: number | undefined = widths.get(text); if (cached !== undefined) return cached;
    const width: number = context.measureText(text).width; widths.set(text,width); return width;
  };
  const rows: number = Math.floor((height - 2) / (preferences.fontSize * preferences.lineHeight));
  return paginateMeasuredChapter(chapter,width - 3,rows,measure);
}
