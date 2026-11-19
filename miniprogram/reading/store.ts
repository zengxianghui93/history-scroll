import { BookImage, Chapter, ReadingBook, ReadingEvent, ReaderPreferences, ReadingProfile, defaultPreferences, progress, summarize } from './core';
import { parseBook } from './parser';
const root: string = wx.env.USER_DATA_PATH + '/book-reader';
const fs = wx.getFileSystemManager();
interface CloudReply { ok: boolean; error?: string; profile?: ReadingProfile; books?: Array<Omit<ReadingBook, 'chapters' | 'cloudSaved'> & { parts: number }>; text?: string; entries?: unknown[] }
interface Operation { id: string; action: string; payload: Record<string, unknown> }
let syncing: Promise<void> | null = null;
function ensureRoot(): void { try { fs.accessSync(root); } catch { fs.mkdirSync(root, true); } }
export function identity(): ReadingProfile | null { return wx.getStorageSync('reader_profile') || null; }
function fileError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'errMsg' in error) return String(error.errMsg);
  return String(error);
}
export function books(): ReadingBook[] {
  ensureRoot();
  const ids: string[] = wx.getStorageSync('reader_book_ids') || [];
  const available: ReadingBook[] = [];
  const missing: string[] = [];
  for (const id of ids) {
    const path: string = root + '/' + id + '.json';
    let body: string;
    try { body = fs.readFileSync(path, 'utf8') as string; }
    catch (error) {
      if (!/no such file|no sunch file|ENOENT/i.test(fileError(error))) throw new Error('读取本机书籍失败：' + path + '；' + fileError(error));
      console.warn('书籍正文缺失，保留索引等待重新导入', { bookId: id, path, error });
      missing.push(id); continue;
    }
    available.push(JSON.parse(body) as ReadingBook);
  }
  wx.setStorageSync('reader_missing_book_ids', missing);
  return available;
}
export function saveBook(book: ReadingBook): void {
  ensureRoot(); fs.writeFileSync(root + '/' + book.id + '.json', JSON.stringify(book), 'utf8');
  const { chapters, ...metadata } = book;
  wx.setStorageSync('reader_book_meta_' + book.id, metadata);
  const ids: string[] = wx.getStorageSync('reader_book_ids') || []; if (!ids.includes(book.id)) wx.setStorageSync('reader_book_ids', [...ids, book.id]);
}
export function findBook(id: string): ReadingBook { const book: ReadingBook | undefined = books().find((entry): boolean => entry.id === id); if (!book) throw new Error('本机找不到这本书，请重新导入'); return book; }
function readList<T>(name: string): T[] { ensureRoot(); const file: string = root + '/' + name + '.json'; try { fs.accessSync(file); } catch { return []; } return JSON.parse(fs.readFileSync(file, 'utf8') as string) as T[]; }
function writeList<T>(name: string, values: readonly T[]): void { ensureRoot(); fs.writeFileSync(root + '/' + name + '.json', JSON.stringify(values), 'utf8'); }
export function events(): ReadingEvent[] { return readList<ReadingEvent>('events'); }
export function preferences(): ReaderPreferences { return wx.getStorageSync('reader_preferences') || defaultPreferences; }
export function setPreferences(value: ReaderPreferences): void { wx.setStorageSync('reader_preferences', value); }
export function uniqueId(): string { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }
export function showError(error: unknown): void { console.error('阅读操作未完成', { error }); wx.showModal({ title: '暂未完成', content: fileError(error), showCancel: false }); }
export async function request(action: string, payload: Record<string, unknown>): Promise<CloudReply> {
  for (let attempt: number = 1; attempt <= 3; attempt += 1) {
    let result: { result: unknown };
    try { result = await wx.cloud.callFunction({ name: 'reading', data: { action, ...payload } }); }
    catch (error) { console.warn('阅读云请求失败', { action, attempt, error }); if (attempt === 3) throw new Error('阅读云服务未连接。请确认 reading 云函数已部署，联网后点击“同步”。'); await new Promise<void>((resolve): void => { setTimeout(resolve, attempt * 300); }); continue; }
    const reply = result.result as CloudReply;
    if (!reply?.ok) throw new Error(reply?.error || '云函数返回格式错误');
    return reply;
  }
  throw new Error('云请求未完成');
}
export async function login(): Promise<ReadingProfile> {
  const reply: CloudReply = await request('login', {}); if (!reply.profile) throw new Error('登录未返回用户身份');
  const previous: ReadingProfile | null = identity();
  if (previous && previous.id !== reply.profile.id) throw new Error('当前微信账号与本机书库不一致，请先退出原账号并清理本机阅读数据');
  wx.setStorageSync('reader_profile', reply.profile); return reply.profile;
}
function queue(): Operation[] { return readList<Operation>('queue'); }
function enqueue(action: string, payload: Record<string, unknown>): void { writeList('queue', [...queue(), { id: uniqueId(), action, payload }]); }
export function record(entry: ReadingEvent): void {
  if (entry.seconds <= 0 && !entry.note) return;
  if (events().some((event): boolean => event.id === entry.id)) return;
  writeList('events', [...events(), entry]); enqueue('record', { record: entry });
}
export function move(book: ReadingBook): void {
  saveBook(book);
  if(book.status==='reading')wx.setStorageSync('reader_active',book.id);
  else if(wx.getStorageSync('reader_active')===book.id)wx.removeStorageSync('reader_active');
  const old: Operation[] = queue().filter((item): boolean => !(item.action === 'position' && item.payload.bookId === book.id));
  writeList('queue', [...old, { id: uniqueId(), action: 'position', payload: { bookId: book.id, position: book.position, status: book.status } }]);
}
export function imageSource(bookId: string, chapter: number, image: BookImage): string {
  ensureRoot();
  const path: string = root + '/' + bookId + '-' + chapter + '-' + image.offset + '.' + image.extension;
  try { fs.accessSync(path); }
  catch { fs.writeFileSync(path, image.data, 'base64'); }
  return path;
}
export interface ImportResult { book: ReadingBook; status: 'imported' | 'existing' | 'updated' }
export async function importBook(): Promise<ImportResult | null> {
  let choice: WechatMiniprogram.ChooseMessageFileSuccessCallbackResult;
  try { choice = await wx.chooseMessageFile({ count: 1, type: 'file', extension: ['txt', 'epub'] }); }
  catch (error) { if (/cancel/i.test(fileError(error))) return null; throw error; }
  const file = choice.tempFiles[0]; if (!file) throw new Error('未选择文件');
  if (file.size > 10 * 1024 * 1024) throw new Error('请选择 10MB 以内的 EPUB 或 UTF-8 TXT');
  wx.showLoading({ title: '解析书籍中', mask: true });
  let parsed: ReturnType<typeof parseBook>;
  let digest: string;
  try { let bytes: ArrayBuffer;
    try { bytes = fs.readFileSync(file.path) as ArrayBuffer; }
    catch (error) { console.error('读取选择的书籍失败', { name: file.name, path: file.path, error }); throw new Error('无法读取刚选择的文件「' + file.name + '」。请在微信聊天中重新下载该文件，再选择导入。详情：' + fileError(error)); }
    parsed = parseBook(bytes, file.name); digest = (await new Promise<WechatMiniprogram.GetFileInfoSuccessCallbackResult>((resolve, reject): void => { fs.getFileInfo({ filePath: file.path, digestAlgorithm: 'md5', success: resolve, fail: reject }); })).digest; }
  finally { wx.hideLoading(); }
  const id: string = 'b-' + digest;
  const existing: ReadingBook | undefined = books().find((book): boolean => book.id === id);
  if (existing) {
    if (existing.parsingVersion === 2) { wx.setStorageSync('reader_active', id); return {book:existing,status:'existing'}; }
    const answer = await wx.showModal({ title: '更新这本书的排版？', content: '将使用新版段落和插图解析，保留书名、感想与阅读时长，并按附近正文定位阅读进度。', confirmText: '更新排版' });
    if (!answer.confirm) return null;
    const oldText: string = existing.chapters.map(chapter => chapter.text).join('');
    const newText: string = parsed.chapters.map(chapter => chapter.text).join('');
    const anchor: string = oldText.slice(existing.position, existing.position + 40).trim();
    const matched: number = anchor ? newText.indexOf(anchor) : -1;
    const upgraded: ReadingBook = { ...existing, chapters: parsed.chapters, parsingVersion: 2, position: matched >= 0 ? matched : Math.min(existing.position, newText.length), cloudSaved: false, updatedAt: Date.now() };
    saveBook(upgraded); move(upgraded); return {book:upgraded,status:'updated'};
  }
  if (books().length >= 30) throw new Error('第一版书架最多 30 本，请先整理书架');
  const confirm = await wx.showModal({ title: '导入到私人书架', content: parsed.title, editable: true, placeholderText: '书名', confirmText: '导入' });
  if (!confirm.confirm) return null;
  const book: ReadingBook = { id, parsingVersion: 2, title: (confirm.content || parsed.title).slice(0, 100), author: parsed.author, chapters: parsed.chapters, position: 0, status: 'reading', createdAt: Date.now(), updatedAt: Date.now(), cloudSaved: false };
  const restored: ReadingBook = restoreImportedBook(book);
  saveBook(restored); wx.setStorageSync('reader_active', id); return {book:restored,status:'imported'};
}
export function restoreImportedBook(book: ReadingBook): ReadingBook {
  const indexed: string[] = wx.getStorageSync('reader_book_ids') || [];
  if (!indexed.includes(book.id)) return book;
  const metadata: Omit<ReadingBook, 'chapters'> | undefined = wx.getStorageSync('reader_book_meta_' + book.id) || undefined;
  const positions: Operation[] = queue().filter(item => item.action === 'position' && item.payload.bookId === book.id);
  const pending: Operation | undefined = positions[positions.length - 1];
  const readings: ReadingEvent[] = events().filter(entry => entry.bookId === book.id).sort((a, b) => b.endedAt - a.endedAt);
  const position: number = pending ? Number(pending.payload.position) : metadata ? metadata.position : readings[0]?.position || 0;
  const length: number = book.chapters.reduce((sum, chapter) => sum + chapter.text.length, 0);
  return { ...book, ...(metadata || {}), chapters: book.chapters, position: Math.max(0, Math.min(Number.isFinite(position) ? position : 0, length)), cloudSaved: false, parsingVersion: book.parsingVersion, updatedAt: Date.now() };
}
export interface RestoreResult { restored: number; unavailable: number }
function validateChapters(value: unknown): Chapter[] {
  if (!Array.isArray(value) || !value.length) throw new Error('云端书籍章节为空，恢复已停止');
  let total: number = 0;
  for (const chapter of value as Chapter[]) {
    if (!chapter || typeof chapter.title !== 'string' || typeof chapter.text !== 'string') throw new Error('云端正文结构不完整，恢复已停止');
    total += chapter.text.length;
    if (chapter.images !== undefined) {
      if (!Array.isArray(chapter.images)) throw new Error('云端插图结构无效');
      let previous: number = -1;
      for (const image of chapter.images) {
        if (!image || !Number.isInteger(image.offset) || image.offset <= previous || chapter.text[image.offset] !== '\uFFFC' || !/^(png|jpg|gif|webp)$/.test(image.extension) || typeof image.data !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(image.data) || image.data.length > 700000) throw new Error('云端插图数据无效，恢复已停止');
        previous = image.offset;
      }
    }
  }
  if (!total || total > 1000000) throw new Error('云端正文长度无效，恢复已停止');
  return value as Chapter[];
}
async function performRestore(): Promise<RestoreResult> {
  await login();
  const available: Set<string> = new Set(books().map(book => book.id));
  const missing: string[] = wx.getStorageSync('reader_missing_book_ids') || [];
  const response: CloudReply = await request('library', {});
  if (!Array.isArray(response.books)) throw new Error('云端未返回书库列表，请更新 reading 云函数');
  let restored: number = 0;
  for (const cloudBook of response.books) {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(cloudBook.id) || !Number.isInteger(cloudBook.parts) || cloudBook.parts < 1 || cloudBook.parts > 80) throw new Error('云端书籍索引无效');
    if (available.has(cloudBook.id) || wx.getStorageSync('reader_archive_' + cloudBook.id)) continue;
    const local: Omit<ReadingBook,'chapters'> | undefined = wx.getStorageSync('reader_book_meta_' + cloudBook.id) || undefined;
    if (local && !local.cloudSaved) throw new Error('「' + local.title + '」有未同步的本机版本，请重新导入原文件，以免恢复旧版正文导致进度错位');
    let body: string = '';
    for (let index: number = 0; index < cloudBook.parts; index += 1) {
      const reply: CloudReply = await request('getPart', {bookId:cloudBook.id,index,updatedAt:cloudBook.updatedAt});
      if (typeof reply.text !== 'string') throw new Error('云端书籍分片缺失：' + cloudBook.title + '，第 ' + (index + 1) + ' 片');
      body += reply.text;
      if (body.length > 3200000) throw new Error('云端书籍数据超出恢复上限');
    }
    const chapters: Chapter[] = validateChapters(JSON.parse(body));
    const length: number = chapters.reduce((sum, chapter) => sum + chapter.text.length, 0);
    const pending: Operation | undefined = queue().filter(item => item.action === 'position' && item.payload.bookId === cloudBook.id).slice(-1)[0];
    const recent: ReadingEvent | undefined = events().filter(entry => entry.bookId === cloudBook.id).sort((a,b) => b.endedAt - a.endedAt)[0];
    const position: number = pending ? Number(pending.payload.position) : local ? local.position : recent && recent.endedAt > cloudBook.updatedAt ? recent.position : cloudBook.position;
    const status: ReadingBook['status'] = pending ? pending.payload.status as ReadingBook['status'] : local ? local.status : cloudBook.status;
    if (!Number.isFinite(position) || !['reading','complete','paused'].includes(status)) throw new Error('云端阅读进度无效：' + cloudBook.title);
    saveBook({...cloudBook,chapters,position:Math.max(0,Math.min(position,length)),status,cloudSaved:true});
    available.add(cloudBook.id);restored += 1;
  }
  const unavailable: number = missing.filter(id => !available.has(id)).length;
  books();
  return {restored,unavailable};
}
export async function restoreCloudBooks(): Promise<RestoreResult> {
  if (syncing) await syncing;
  const operation: Promise<RestoreResult> = performRestore();
  const lock: Promise<void> = operation.then(() => undefined, () => undefined);
  syncing = lock;
  try { return await operation; } finally { if (syncing === lock) syncing = null; }
}
async function upload(book: ReadingBook): Promise<void> {
  const content: string = JSON.stringify(book.chapters); const parts: number = Math.ceil(content.length / 40000);
  await request('beginBook', { book: { id: book.id, title: book.title, author: book.author, parts, parsingVersion: book.parsingVersion || 1 } });
  for (let index: number = 0; index < parts; index += 1) await request('putPart', { bookId: book.id, index, text: content.slice(index * 40000, (index + 1) * 40000) });
  await request('finishBook', { bookId: book.id });
  saveBook({ ...findBook(book.id), cloudSaved: true });
}
async function performSync(): Promise<void> {
  await login();
  for (const book of books().filter((entry): boolean => !entry.cloudSaved)) await upload(book);
  while (queue().length) {
    const operation: Operation = queue()[0];
    await request(operation.action, operation.payload);
    writeList('queue', queue().filter((entry): boolean => entry.id !== operation.id));
  }
  wx.setStorageSync('reader_last_sync', Date.now()); wx.removeStorageSync('reader_sync_error');
}
export async function sync(): Promise<void> {
  if (syncing) return syncing;
  syncing = performSync();
  try { await syncing; } catch (error) { wx.setStorageSync('reader_sync_error', error instanceof Error ? error.message : '同步失败'); throw error; } finally { syncing = null; }
}
export function syncQuietly(): void { if (!identity()) return; sync().catch((error: unknown): void => { console.warn('阅读记录留在本机待重试', { error }); }); }
export function syncLabel(): string { if (wx.getStorageSync('reader_sync_error')) return '同步未完成 · 点击重试'; if (queue().length || books().some((book): boolean => !book.cloudSaved)) return '本机已保存 · 待云端同步'; return wx.getStorageSync('reader_last_sync') ? '已同步到私人云书库' : '登录并同步私人书库'; }
export function bookView(book: ReadingBook): ReadingBook & { percent: number; initial: string } { return { ...book, chapters: [], percent: progress(book), initial: book.title.slice(0, 1) }; }
export function deletedJournalIds(): string[] { return wx.getStorageSync('reader_deleted_journals') || []; }
export function deleteJournal(id: string): void {
  const deleted: string[] = deletedJournalIds();
  const book: ReadingBook | undefined = books().find(item=>item.id===id);
  if(book?.status==='reading')move({...book,status:'paused',updatedAt:Date.now()});
  if (!deleted.includes(id)) wx.setStorageSync('reader_deleted_journals', [...deleted, id]);
  const processed: string[] = wx.getStorageSync('reader_deleted_journal_paused') || [];
  if(!processed.includes(id))wx.setStorageSync('reader_deleted_journal_paused',[...processed,id]);
}
/** 旧版已隐藏的纪念册仅迁移一次，重新选择续读后不重复暂停。 */
export function reconcileDeletedJournals(): void {
  const processed: string[] = wx.getStorageSync('reader_deleted_journal_paused') || [];
  for(const id of deletedJournalIds())if(!processed.includes(id))deleteJournal(id);
}
export interface JournalEntry { id: string; title: string }
export function journalEntries(): JournalEntry[] {
  const recorded: Set<string> = new Set(events().filter(entry=>entry.seconds>0).map(entry=>entry.bookId));
  const titles: Map<string,JournalEntry> = new Map();
  for(const book of books())titles.set(book.id,{id:book.id,title:book.title});
  for(const key of wx.getStorageInfoSync().keys.filter(key=>key.startsWith('reader_archive_'))){
    const archive: JournalEntry = wx.getStorageSync(key);if(!titles.has(archive.id))titles.set(archive.id,archive);
  }
  return Array.from(titles.values()).filter(entry=>recorded.has(entry.id));
}
export function visibleJournals(): JournalEntry[] { const hidden=new Set(deletedJournalIds());return journalEntries().filter(entry=>!hidden.has(entry.id)); }
export function hiddenJournals(): JournalEntry[] { const hidden=new Set(deletedJournalIds());return journalEntries().filter(entry=>hidden.has(entry.id)); }
export function restoreJournalDisplay(id: string): void {
  if(!hiddenJournals().some(entry=>entry.id===id))throw new Error('未找到可恢复显示的纪念册');
  wx.setStorageSync('reader_deleted_journals',deletedJournalIds().filter(key=>key!==id));
}
export function stats(): { days: number; minutes: number } { return summarize(events(), Date.now()); }
export async function deleteBook(id: string, keepNotes: boolean): Promise<void> {
  const book: ReadingBook = findBook(id);
  if (book.cloudSaved) { await sync(); await request('deleteBook', { bookId: id }); }
  writeList('queue', queue().filter((entry): boolean => entry.payload.bookId !== id && (entry.payload.record as ReadingEvent | undefined)?.bookId !== id));
  if (keepNotes) wx.setStorageSync('reader_archive_' + id, { id: book.id, title: book.title, author: book.author });
  else writeList('events', events().filter((entry): boolean => entry.bookId !== id));
  fs.unlinkSync(root + '/' + id + '.json');
  wx.setStorageSync('reader_book_ids', (wx.getStorageSync('reader_book_ids') as string[]).filter((key): boolean => key !== id));
  if(wx.getStorageSync('reader_active')===id)wx.removeStorageSync('reader_active');
  wx.removeStorageSync('reader_book_meta_'+id);
}

