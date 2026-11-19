export interface BookImage { offset: number; data: string; extension: string }
export interface Chapter { title: string; text: string; images?: BookImage[] }
export interface ReaderPage { start: number; text: string; displayText?: string; image?: BookImage }
export interface ReadingBook { id: string; title: string; author: string; chapters: Chapter[]; position: number; createdAt: number; updatedAt: number; status: 'reading' | 'paused' | 'complete'; cloudSaved: boolean; parsingVersion?: number }
export interface ReadingEvent { id: string; bookId: string; startedAt: number; endedAt: number; seconds: number; position: number; note: string }
export interface ReaderPreferences { fontSize: number; lineHeight: number; dark: boolean; animation: boolean }
export interface ReadingProfile { id: string; name: string; joined: boolean; invitations: boolean }
export interface FeedEntry { id: string; userId: string; name: string; day: string; seconds: number; stars: number; mine: boolean; starred: boolean; tomatoSent: boolean }
export interface Invitation { id: string; name: string; message: string; kind?: 'star' | 'tomato' }
export const defaultPreferences: ReaderPreferences = { fontSize: 19, lineHeight: 1.9, dark: false, animation: true };
export function totalLength(book: ReadingBook): number { return book.chapters.reduce((sum, chapter): number => sum + chapter.text.length, 0); }
export function progress(book: ReadingBook): number { return Math.min(100, Math.floor(book.position / Math.max(1, totalLength(book)) * 100)); }
export function locate(book: ReadingBook): { chapter: number; offset: number } {
  let remaining: number = book.position;
  for (let index: number = 0; index < book.chapters.length; index += 1) {
    if (remaining < book.chapters[index].text.length || index === book.chapters.length - 1) return { chapter: index, offset: remaining };
    remaining -= book.chapters[index].text.length;
  }
  return { chapter: 0, offset: 0 };
}
export function chapterStart(book: ReadingBook, index: number): number { return book.chapters.slice(0, index).reduce((sum, entry): number => sum + entry.text.length, 0); }
export function chinaDay(time: number): string { return new Date(time + 8 * 3600000).toISOString().slice(0, 10); }
export function weekStart(time: number): string {
  const date: Date = new Date(time + 8 * 3600000);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}
export function summarize(events: readonly ReadingEvent[], time: number): { days: number; minutes: number } {
  const selected: ReadingEvent[] = events.filter((entry): boolean => chinaDay(entry.startedAt) >= weekStart(time));
  return { days: new Set(selected.filter((entry): boolean => entry.seconds > 0).map((entry): string => chinaDay(entry.startedAt))).size, minutes: Math.floor(selected.reduce((sum, entry): number => sum + entry.seconds, 0) / 60) };
}
/** 固定文本位置分页，字号变化后重新找包含原位置的页面。 */
export function paginate(text: string, columns: number, rows: number): { start: number; text: string }[] {
  const pages: { start: number; text: string }[] = [];
  let start: number = 0; let row: number = 1; let col: number = 0;
  for (let index: number = 0; index < text.length; index += 1) {
    const char: string = text[index];
    if (char === '\n') { row += 1; col = 0; }
    else { col += /[\x20-\x7e]/.test(char) ? .55 : 1; if (col > columns) { row += 1; col = 1; } }
    if (row > rows && index > start) { pages.push({ start, text: text.slice(start, index) }); start = index; row = 1; col = char === '\n' ? 0 : 1; }
  }
  if (start < text.length) pages.push({ start, text: text.slice(start) });
  return pages;
}


/** 插图单独成页，文本偏移仍以原章节为准。 */
export function paginateChapter(chapter: Chapter, columns: number, rows: number): ReaderPage[] {
  if (!chapter.images?.length) return paginate(chapter.text, columns, rows);
  const pages: ReaderPage[] = [];
  let start: number = 0;
  for (const image of chapter.images) {
    const section: string = chapter.text.slice(start, image.offset);
    pages.push(...paginate(section, columns, rows).filter(page => page.text.trim()).map(page => ({ ...page, start: start + page.start })));
    pages.push({ start: image.offset, text: '', image });
    start = image.offset + 1;
  }
  pages.push(...paginate(chapter.text.slice(start), columns, rows).filter(page => page.text.trim()).map(page => ({ ...page, start: start + page.start })));
  return pages;
}

/** 使用实际字宽分行，保留原文偏移；显示文本的换行不参与进度计算。 */
export function paginateMeasuredChapter(chapter: Chapter, width: number, rows: number, measure: (text: string) => number): ReaderPage[] {
  if (width <= 0 || rows < 1) throw new Error('阅读区域尺寸无效');
  const pages: ReaderPage[] = [];
  const append = (text: string, base: number): void => {
    const lines: Array<{start: number; end: number; display: string}> = [];
    let start: number = 0; let index: number = 0; let line: string = ''; let lineWidth: number = 0;
    const glyphs: string[] = [];
    for (const char of text) {
      if (glyphs.length && (/[\u0300-\u036f\uFE00-\uFE0F]/.test(char) || char === '\u200d' || glyphs[glyphs.length - 1].endsWith('\u200d') || /[\u{1F3FB}-\u{1F3FF}]/u.test(char))) glyphs[glyphs.length - 1] += char;
      else glyphs.push(char);
    }
    for (const glyph of glyphs) {
      if (glyph === '\n') { lines.push({start, end:index + 1, display:line}); index += 1; start=index; line=''; lineWidth=0; continue; }
      const displayGlyph: string = glyph === '\t' ? '    ' : glyph;
      const glyphWidth: number = measure(displayGlyph);
      if (glyphWidth > width) throw new Error('当前字号过大，无法在阅读区域中完整显示字符');
      if (line && lineWidth + glyphWidth > width) { lines.push({start, end:index, display:line}); start=index; line=''; lineWidth=0; }
      line += displayGlyph; lineWidth += glyphWidth; index += glyph.length;
    }
    if (index > start) lines.push({start, end:index, display:line});
    for (let index: number = 0; index < lines.length; index += rows) {
      const selected = lines.slice(index, index + rows);
      const first = selected[0]; const last = selected[selected.length - 1];
      pages.push({start:base + first.start, text:text.slice(first.start,last.end), displayText:selected.map(line => line.display).join('\n')});
    }
  };
  let start: number = 0;
  for (const image of chapter.images || []) {
    append(chapter.text.slice(start,image.offset),start);
    pages.push({start:image.offset,text:'\uFFFC',displayText:'',image}); start=image.offset + 1;
  }
  append(chapter.text.slice(start),start);
  return pages;
}
