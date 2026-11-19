const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const raster=require('@napi-rs/canvas');
raster.GlobalFonts.registerFromPath('C:/Windows/Fonts/simsun.ttc','SimSun');
raster.GlobalFonts.registerFromPath('C:/Windows/Fonts/simsun.ttc','serif');
const {zipSync,strToU8}=require('fflate');
const {parseBook}=require('../miniprogram/reading/parser');
const {createReadingCloudHarness}=require('./reading-cloud-runtime.cjs');
const buffer=bytes=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const txt=parseBook(buffer(strToU8('第一章\n这是一段真正的 UTF-8 正文。')),'测试.txt');
assert.equal(txt.title,'测试');assert.ok(txt.chapters[0].text.includes('正文'));
assert.throws(()=>parseBook(buffer(strToU8('')),'empty.txt'),/正文/);
const epub=zipSync({
 'META-INF/container.xml':strToU8('<container><rootfiles><rootfile full-path="OEBPS/book.opf"/></rootfiles></container>'),
 'OEBPS/book.opf':strToU8('<package><metadata><dc:title xmlns:dc="dc">我的测试书</dc:title><dc:creator xmlns:dc="dc">作者</dc:creator></metadata><manifest><item id="one" href="text/ch1.xhtml" media-type="application/xhtml+xml"/><item id="two" href="text/ch2.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="two"/><itemref idref="one"/></spine></package>'),
 'OEBPS/text/ch1.xhtml':strToU8('<html><body><h1>第一章</h1><p>甲 &amp; 乙。</p><script>不要执行</script></body></html>'),
 'OEBPS/text/ch2.xhtml':strToU8('<html><body><h1>第二章</h1><p>乙的故事。</p></body></html>')
});
const parsed=parseBook(buffer(epub),'test.epub');assert.equal(parsed.title,'我的测试书');assert.equal(parsed.chapters[0].title,'第二章');assert.ok(!parsed.chapters[1].text.includes('不要执行'));assert.ok(parsed.chapters[1].text.includes('甲 & 乙'));
const imageZip=require('fflate').unzipSync(epub);
imageZip['OEBPS/text/ch2.xhtml']=strToU8('<html><body><p>前文</p><img src="../images/test.png"/><p>后文</p></body></html>');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
imageZip['OEBPS/images/test.png']=new Uint8Array(png);
const illustrated=parseBook(buffer(zipSync(imageZip)),'图文.epub');
assert.equal(illustrated.chapters[0].images.length,1);assert.equal(illustrated.chapters[0].text[illustrated.chapters[0].images[0].offset],'\uFFFC');
assert.deepEqual(Buffer.from(illustrated.chapters[0].images[0].data,'base64'),png,'图片字节不得丢失');
const cleanTxt=parseBook(buffer(strToU8('  第一段\r\n\r\n\r\n\r\n　 第二段  \r\n∨\r\n第三段')),'空行.txt');assert.equal(cleanTxt.chapters[0].text,'第一段\n\n第二段\n∨\n第三段','压缩空行但保留原文分隔符');
const storage=new Map(),files=new Map(),modules=new Map();let pageDefinition;const navigation=[];
const runtime={console,Date,Math,JSON,Set,Promise,setTimeout,clearTimeout,setInterval:()=>1,clearInterval:()=>{},wx:{
 env:{USER_DATA_PATH:'/sandbox'},getFileSystemManager:()=>({getFileInfo:options=>options.success({digest:require('node:crypto').createHash('md5').update(Buffer.from(files.get(options.filePath))).digest('hex')}),accessSync:file=>{if(file!=='/sandbox/book-reader'&&!files.has(file))throw Error('readFileSync:fail no such file');},mkdirSync:()=>{},readFileSync:file=>{if(!files.has(file))throw Error('readFileSync:fail no such file');return files.get(file);},writeFileSync:(file,value)=>files.set(file,value),unlinkSync:file=>files.delete(file)}),
 getStorageSync:key=>structuredClone(storage.get(key)||''),setStorageSync:(key,value)=>storage.set(key,structuredClone(value)),removeStorageSync:key=>storage.delete(key),getStorageInfoSync:()=>({keys:[...storage.keys()]}),
 createOffscreenCanvas:()=>raster.createCanvas(1,1),nextTick:callback=>callback(),getWindowInfo:()=>({windowWidth:390,windowHeight:760}),navigateTo:option=>navigation.push(option.url),showModal:async()=>({confirm:false}),showToast:()=>{},
 cloud:{callFunction:async()=>{throw Error('offline');}}
 },Page:definition=>{pageDefinition={...definition,createSelectorQuery(){return {select(){return this;},boundingClientRect(callback){this.callback=callback;return this;},exec(){this.callback({width:338,height:550});}};}};}};
function load(filename){filename=path.resolve(filename);if(modules.has(filename))return modules.get(filename);const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const module={exports:{}};vm.runInNewContext('(function(require,module,exports){'+code+'\n})',runtime)(name=>{if(name==='./parser')return {parseBook};const target=path.resolve(path.dirname(filename),name+'.ts');return load(target);},module,module.exports);modules.set(filename,module.exports);return module.exports;}
const store=load('miniprogram/reading/store.ts');const core=load('miniprogram/reading/core.ts');
const book={id:'book1',title:'我的书',author:'作者',chapters:[{title:'第一章',text:('一段正文。\n\n').repeat(200)}],position:0,createdAt:Date.now(),updatedAt:Date.now(),status:'reading',cloudSaved:false};
store.saveBook(book);store.move({...book,position:100});assert.equal(store.findBook('book1').position,100);
store.move({...book,position:20});assert.equal(store.findBook('book1').position,20,'重读不能被最远位置覆盖');
const at=Date.now();const event={id:'event-local',bookId:'book1',startedAt:at-60000,endedAt:at,seconds:60,position:20,note:'自己的感想'};
store.record(event);store.record(event);assert.equal(store.events().length,1);
const savedBody=files.get('/sandbox/book-reader/book1.json');
files.delete('/sandbox/book-reader/book1.json');
assert.equal(store.books().length,0,'缺失正文不得阻断书架和重新导入');
assert.equal(storage.get('reader_book_ids')[0],'book1','保留旧索引');
assert.equal(store.events().length,1,'保留私人感想和阅读记录');
const recovered=store.restoreImportedBook({...book,position:0});
assert.equal(recovered.position,20,'重新导入恢复最近位置，不取最远位置');
store.saveBook(recovered);assert.equal(store.books().length,1);
files.set('/sandbox/book-reader/book1.json',savedBody);
store.saveBook({...book,id:'empty-journal'});assert.ok(!store.visibleJournals().some(entry=>entry.id==='empty-journal'),'仅导入不成册');
store.record({...event,id:'note-only',bookId:'empty-journal',seconds:0,note:'只有感想'});assert.ok(!store.visibleJournals().some(entry=>entry.id==='empty-journal'),'仅写感想不冒充有效阅读');
files.delete('/sandbox/book-reader/empty-journal.json');storage.set('reader_book_ids',['book1']);files.set('/sandbox/book-reader/events.json',JSON.stringify([event]));files.set('/sandbox/book-reader/queue.json',JSON.stringify(JSON.parse(files.get('/sandbox/book-reader/queue.json')).filter(item=>item.payload.record?.bookId!=='empty-journal')));
store.deleteJournal('book1');store.deleteJournal('book1');
assert.equal(store.deletedJournalIds().length,1,'重复删除纪念册幂等');assert.equal(store.findBook('book1').status,'paused','删除纪念册将对应在读书籍暂时放下');
assert.equal(store.findBook('book1').position,20,'删除纪念册保留阅读进度');
assert.equal(store.events().length,1,'删除纪念册保留统计与感想');
load('miniprogram/pages/reading-mine/reading-mine.ts');const mine={...pageDefinition,data:structuredClone(pageDefinition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();}};mine.refresh();assert.equal(mine.data.journals.length,0,'删除后刷新不重新出现');
const pausedPosition=store.findBook('book1').position;store.restoreJournalDisplay('book1');assert.equal(store.visibleJournals().length,1);assert.equal(store.findBook('book1').status,'paused','恢复显示不恢复在读状态');assert.equal(store.findBook('book1').position,pausedPosition);
storage.delete('reader_deleted_journals');store.move({...store.findBook('book1'),status:'reading'});
const illustratedPages=core.paginateChapter(illustrated.chapters[0],16,12);
assert.equal(illustratedPages.length,3);assert.equal(illustratedPages[1].image.extension,'png');assert.equal(illustratedPages[2].text.trim(),'后文');
store.saveBook({...book,id:'image-book',chapters:illustrated.chapters});
load('miniprogram/pages/book-reader/book-reader.ts');const imageReader={...pageDefinition,data:structuredClone(pageDefinition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();}};
imageReader.onLoad({id:'image-book'});imageReader.onReady();imageReader.onNext();assert.ok(imageReader.data.image.endsWith('.png'));imageReader.finishTurn();const imagePosition=imageReader.position();imageReader.stop();
const reopened={...pageDefinition,data:structuredClone(pageDefinition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();}};reopened.onLoad({id:'image-book'});reopened.onReady();assert.equal(reopened.position(),imagePosition);assert.ok(reopened.data.image);
imageReader.onPrevious();imageReader.finishTurn();assert.equal(imageReader.data.image,'');
files.delete('/sandbox/book-reader/image-book.json');storage.set('reader_book_ids',['book1']);
// 使用真实字体测量覆盖窄屏、英文长词、大字号及图文交界。
const typography=load('miniprogram/reading/typography.ts');
const mixed='中文长段落。'.repeat(80)+'\n\n'+('WWWW illl English words-with-punctuation '+ 'a'.repeat(90)+' ').repeat(20)+'\n👩‍👩‍👧‍👦 e\u0301 结束';
for(const width of [268,338,378])for(const fontSize of [16,22,26])for(const lineHeight of [1.9,2.2]){
 const height=430;const context=raster.createCanvas(1,1).getContext('2d');context.font=fontSize+'px '+typography.READER_FONT;
 const pages=typography.layoutChapter({title:'混排',text:mixed},width,height,{fontSize,lineHeight});
 assert.equal(pages.map(page=>page.text).join(''),mixed,'分页不得漏字或重字');
 for(const page of pages){const lines=page.displayText.split('\n');assert.ok(lines.length*fontSize*lineHeight<=height);for(const line of lines)assert.ok(context.measureText(line).width<=width,'显示行不得超出正文区域');assert.ok(!/[\uD800-\uDBFF]$/.test(page.text),'不得拆开代理对');}
}
const measuredIllustration=typography.layoutChapter(illustrated.chapters[0],338,550,{fontSize:20,lineHeight:1.9});assert.equal(measuredIllustration.map(page=>page.text).join(''),illustrated.chapters[0].text,'图文交界原文完整');
const pages=core.paginate(book.chapters[0].text,16,12);assert.equal(pages.map(page=>page.text).join(''),book.chapters[0].text,'分页不得丢字');assert.ok(pages.length>2);
load('miniprogram/pages/book-reader/book-reader.ts');const reader={...pageDefinition,data:structuredClone(pageDefinition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();}};reader.onLoad({id:'book1'});reader.onReady();const first=reader.data.content;reader.onNext();assert.notEqual(reader.pageNumber,0);assert.ok(store.findBook('book1').position>20);assert.equal(reader.data.flipDirection,'next');reader.finishTurn();reader.onPrevious();assert.equal(reader.data.content,first);reader.finishTurn();const before=reader.position();reader.applyPrefs({...reader.data.prefs,fontSize:22});assert.ok(reader.position()<=before,'字号变化仍落在包含原位置的页');reader.onShow();reader.onHide();assert.equal(reader.active,false);
// 验证点击分区、双向手势和长按，避免一次操作重复翻页。
const gestureReader={...reader,data:{...reader.data,toolbar:false},onNext(){this.nextCount++;},onPrevious(){this.previousCount++;},nextCount:0,previousCount:0};
const gesture=(x,y,endX,endY)=>{gestureReader.onTouchStart({touches:[{clientX:x,clientY:y}]});gestureReader.onTouchEnd({changedTouches:[{clientX:endX,clientY:endY}]});};
const windowWidth=runtime.wx.getWindowInfo().windowWidth;
gesture(30,200,30,200);assert.equal(gestureReader.previousCount,1);
gesture(windowWidth-30,200,windowWidth-30,200);assert.equal(gestureReader.nextCount,1);
gesture(windowWidth/2,200,windowWidth/2,200);assert.equal(gestureReader.data.toolbar,true);
gesture(180,300,180,200);assert.equal(gestureReader.nextCount,2);
gesture(180,200,180,300);assert.equal(gestureReader.previousCount,2);
gesture(250,200,150,200);assert.equal(gestureReader.nextCount,3);
gestureReader.onTouchStart({touches:[{clientX:30,clientY:200}]});gestureReader.touchStartedAt-=600;gestureReader.onTouchEnd({changedTouches:[{clientX:30,clientY:200}]});assert.equal(gestureReader.previousCount,2);

const manifest=JSON.parse(fs.readFileSync('miniprogram/app.json','utf8'));assert.deepEqual(manifest.tabBar.list.map(item=>item.text),['阅读','同读','我的']);
for(const page of manifest.pages.slice(0,5)){for(const ext of ['ts','json','wxml','wxss'])assert.ok(fs.existsSync('miniprogram/'+page+'.'+ext));}
(async()=>{
 const oldModal=runtime.wx.showModal;
 runtime.wx.showModal=async options=>{assert.ok(options.confirmText.length<=4,'确认按钮最多四个字符');return {confirm:false};};
 mine.refresh();await mine.onDeleteJournal({currentTarget:{dataset:{id:'book1'}}});assert.equal(mine.data.journals.length,1,'取消删除保留纪念册');
 runtime.wx.showModal=async options=>{assert.ok(options.confirmText.length<=4);return {confirm:true};};
 await mine.onDeleteJournal({currentTarget:{dataset:{id:'book1'}}});assert.equal(mine.data.journals.length,0,'确认后删除纪念册');assert.equal(mine.data.busy,false);
 storage.delete('reader_deleted_journals');runtime.wx.showModal=oldModal;
 // 用可控时钟验证页面生命周期、暂停边界和秒数余量。
 const RealDate=runtime.Date;let clockNow=Date.now();
 runtime.Date=class extends Date{static now(){return clockNow;}};
 const timerStorage=new Map([...storage].map(([key,value])=>[key,structuredClone(value)]));const timerFiles=new Map(files);
 load('miniprogram/pages/book-reader/book-reader.ts');const clockReader={...pageDefinition,data:structuredClone(pageDefinition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();}};
 clockReader.onLoad({id:'book1'});clockReader.onShow();clockNow+=10000;clockReader.tick();assert.equal(clockReader.readingMs,0,'正文未显示不计时');
 clockReader.onReady();assert.equal(clockReader.contentReady,true);clockReader.interact();clockNow+=1250;clockReader.tick();clockNow+=1250;clockReader.tick();assert.equal(clockReader.readingMs,2500,'保留调度间隔内的小数秒');
 clockReader.onDirectory();assert.equal(clockReader.readingMs,500,'落盘后保留不足一秒的余量');clockNow+=60000;clockReader.tick();assert.equal(clockReader.readingMs,500,'目录期间暂停');clockReader.onClose();
 const countSeconds=()=>store.events().filter(entry=>entry.id!=='event-local').reduce((sum,entry)=>sum+entry.seconds,0);
 const beforeIdle=countSeconds();clockNow+=360000;clockReader.tick();assert.equal(countSeconds()-beforeIdle,300,'超时最多计到五分钟边界');assert.equal(clockReader.data.idle,true);
 clockNow+=600000;clockReader.interact();clockNow+=1500;clockReader.tick();clockReader.flush('');assert.equal(countSeconds()-beforeIdle,302,'触摸恢复只计当前新增时间，包含此前半秒余量');
 clockReader.onSettings();const beforeSettings=countSeconds();clockNow+=30000;clockReader.tick();clockReader.onClose();assert.equal(countSeconds(),beforeSettings,'设置期间不计时');
 const oldDialog=runtime.wx.showModal;runtime.wx.showModal=async()=>{clockNow+=90000;clockReader.tick();return {confirm:false};};
 const beforeDialog=countSeconds();await clockReader.onFinish();await clockReader.onNote();clockReader.flush('');assert.equal(countSeconds(),beforeDialog,'感想及读完确认弹窗都暂停');runtime.wx.showModal=oldDialog;
 clockReader.pauseContent();clockNow+=10000;clockReader.tick();const beforeImage=countSeconds();clockReader.onImageLoad({currentTarget:{dataset:{source:clockReader.data.image}}});assert.equal(clockReader.contentReady,true);clockNow+=1500;clockReader.tick();clockReader.flush('');assert.ok(countSeconds()-beforeImage<=2,'等待图片显示期间不计时');
 clockNow+=1500;clockReader.onHide();const beforeBackground=countSeconds();clockNow+=600000;clockReader.onShow();clockNow+=1500;clockReader.tick();clockReader.onHide();assert.ok(countSeconds()-beforeBackground<=2,'不补计后台时长');
 clockReader.onShow();clockReader.onImageError({detail:{errMsg:'测试图片失败'}});clockNow+=60000;clockReader.tick();assert.equal(clockReader.contentReady,false);clockReader.onHide();
 assert.equal(store.events().length,new Set(store.events().map(entry=>entry.id)).size);
 runtime.Date=RealDate;storage.clear();for(const [key,value] of timerStorage)storage.set(key,value);files.clear();for(const [key,value] of timerFiles)files.set(key,value);
 // 首页只展示在读书籍，读完、暂停和删除均不能回退成正在读。
 load('miniprogram/pages/reading-home/reading-home.ts');const homeState={...pageDefinition,data:structuredClone(pageDefinition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();}};
 const stateStorage=new Map([...storage].map(([key,value])=>[key,structuredClone(value)]));const stateFiles=new Map(files);
 store.saveBook({...book,status:'complete'});storage.set('reader_active','book1');homeState.refresh();assert.equal(homeState.data.book,null,'已读完回到起始状态');assert.equal(homeState.data.library.length,1,'已读完仍保留在书架');
 store.saveBook({...book,id:'other',title:'另一本',status:'reading'});homeState.refresh();assert.equal(homeState.data.book.id,'other','自动展示其他在读书籍');
 storage.set('reader_deleted_journals',['other']);storage.delete('reader_deleted_journal_paused');homeState.refresh();assert.equal(homeState.data.book,null,'删除纪念册后首页移除对应在读书');assert.equal(store.findBook('other').chapters[0].text,book.chapters[0].text,'纪念册删除不影响正文');
 store.move({...store.findBook('other'),status:'reading'});homeState.refresh();assert.equal(homeState.data.book.id,'other','旧删除记录迁移后允许主动恢复续读');
 await store.deleteBook('other',true);homeState.refresh();assert.ok(!homeState.data.library.some(entry=>entry.id==='other'),'删除正文后书架和首页均不再展示');
 storage.set('reader_active','book1');homeState.refresh();assert.equal(homeState.data.book,null,'失效的当前书标记不得复活已读完书');
 storage.clear();for(const [key,value] of stateStorage)storage.set(key,value);files.clear();for(const [key,value] of stateFiles)files.set(key,value);
 // 导入成功先关闭书架；同步失败不能覆盖成功反馈。
 const beforeImportIds=structuredClone(storage.get('reader_book_ids'));const notices=[];const dialogs=[];
 const previousToast=runtime.wx.showToast;const previousCall=runtime.wx.cloud.callFunction;
 runtime.wx.showToast=options=>notices.push(options.title);runtime.wx.showModal=async options=>{dialogs.push(options);return {confirm:true,content:'导入成功体验书'};};
 runtime.wx.showLoading=()=>{};runtime.wx.hideLoading=()=>{};
 let tabHidden=false;runtime.wx.hideTabBar=async()=>{tabHidden=true;};runtime.wx.showTabBar=async()=>{tabHidden=false;};
 const importBytes=buffer(strToU8('第一章\n这是用来验证导入交互的原创正文。'));
 files.set('/selected.txt',importBytes);runtime.wx.chooseMessageFile=async()=>({tempFiles:[{name:'导入.txt',path:'/selected.txt',size:importBytes.byteLength}]});
 runtime.wx.cloud.callFunction=async()=>({result:{ok:false,error:'测试：云端暂未连接'}});
 load('miniprogram/pages/reading-home/reading-home.ts');const home={...pageDefinition,data:structuredClone(pageDefinition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();}};home.refresh();await home.onSwitch();assert.equal(tabHidden,true);
 await home.onImport();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(home.data.switching,false);assert.equal(tabHidden,false);assert.equal(home.data.busy,false);assert.equal(home.data.book.title,'导入成功体验书');assert.ok(notices.includes('书籍导入成功'));assert.equal(dialogs.filter(dialog=>dialog.title==='暂未完成').length,0,'云同步失败不弹导入失败提示');assert.ok(home.data.syncText.includes('同步未完成'));
 await home.onSwitch();const modalCount=dialogs.length;runtime.wx.chooseMessageFile=async()=>{throw {errMsg:'chooseMessageFile:fail cancel'};};await home.onImport();assert.equal(home.data.switching,true);assert.equal(dialogs.length,modalCount,'取消选文件不提示失败');
 runtime.wx.chooseMessageFile=async()=>({tempFiles:[{name:'导入.txt',path:'/selected.txt',size:importBytes.byteLength}]});await home.onImport();await new Promise(resolve=>setImmediate(resolve));assert.equal(home.data.switching,false);assert.ok(notices.includes('已切换到这本书'));
 storage.set('reader_book_ids',beforeImportIds);storage.delete('reader_sync_error');runtime.wx.showToast=previousToast;runtime.wx.showModal=oldModal;runtime.wx.cloud.callFunction=previousCall;
 const cloud=createReadingCloudHarness();
 const invoke=async(action,payload)=>{const result=await cloud.invoke({action,...payload});assert.equal(result.ok,true,result.error);return result;};
 const a=(await invoke('login',{})).profile;assert.equal(a.joined,true,'登录后自动加入大厅');
 await invoke('beginBook',{book:{id:'book1',title:'私密书名',author:'作者',parts:1}});
 await invoke('putPart',{bookId:'book1',index:0,text:JSON.stringify(txt.chapters)});await invoke('finishBook',{bookId:'book1'});
 await invoke('beginBook',{book:{id:'book1',title:'私密书名',author:'作者',parts:2}});await invoke('putPart',{bookId:'book1',index:1,text:'旧尾片'});
 await invoke('beginBook',{book:{id:'book1',title:'私密书名',author:'作者',parts:1}});await invoke('putPart',{bookId:'book1',index:0,text:JSON.stringify(illustrated.chapters)});await invoke('finishBook',{bookId:'book1'});
 assert.equal(JSON.parse((await invoke('getPart',{bookId:'book1',index:0})).text)[0].images[0].data,illustrated.chapters[0].images[0].data,'图文云同步保留图片');

 const originalCall=runtime.wx.cloud.callFunction;
 runtime.wx.cloud.callFunction=async options=>({result:await cloud.invoke(options.data)});
 store.move({...store.findBook('book1'),position:3,cloudSaved:true});files.delete('/sandbox/book-reader/book1.json');
 const noteCount=store.events().length;
 const recovery=await store.restoreCloudBooks();assert.equal(recovery.restored,1);assert.equal(store.findBook('book1').position,3,'恢复保留本机待同步的最近位置');assert.equal(store.events().length,noteCount,'恢复不改写私人记录');assert.ok(store.findBook('book1').chapters[0].images);
 assert.equal((await store.restoreCloudBooks()).restored,0,'重复恢复不覆盖本机书');
 await invoke('beginBook',{book:{id:'incomplete',title:'未同步完',parts:1}});
 assert.equal((await store.restoreCloudBooks()).restored,0,'未同步完成的书籍不恢复');
 await invoke('beginBook',{book:{id:'invalid',title:'损坏章节',parts:1}});await invoke('putPart',{bookId:'invalid',index:0,text:'[{"title":"坏章节"}]'});await invoke('finishBook',{bookId:'invalid'});
 await assert.rejects(store.restoreCloudBooks(),/正文结构/);assert.ok(!files.has('/sandbox/book-reader/invalid.json'),'损坏数据不得写入书架');
 await invoke('deleteBook',{bookId:'invalid'});await invoke('deleteBook',{bookId:'incomplete'});
 runtime.wx.cloud.callFunction=originalCall;
 const cloudEvent={...event,id:'record1',note:'私人感想'};
 await Promise.all([invoke('record',{record:cloudEvent}),invoke('record',{record:cloudEvent})]);
 assert.equal((await invoke('rank',{})).entries[0].seconds,60,'重复记录不增加时长');
 const overlap=await cloud.invoke({action:'record',record:{...cloudEvent,id:'record2'}});assert.equal(overlap.ok,false,'同一时段换编号不能刷榜');
 const feedA=await invoke('feed',{});assert.equal(feedA.entries.length,1);assert.ok(!JSON.stringify(feedA).includes('私密书名'));assert.ok(!JSON.stringify(feedA).includes('私人感想'));
 cloud.setUser('reader-b');await invoke('login',{});assert.equal((await invoke('library',{})).books.length,0);
 assert.equal((await cloud.invoke({action:'getPart',bookId:'book1',index:0})).ok,false,'其他人不能读取正文');
 await invoke('profile',{joined:true,invitations:true});await invoke('star',{target:feedA.entries[0].id,enabled:true});await invoke('star',{target:feedA.entries[0].id,enabled:true});assert.equal((await invoke('feed',{})).entries[0].stars,1);
 await invoke('tomato',{target:a.id,message:0});assert.equal((await cloud.invoke({action:'tomato',target:a.id,message:0})).ok,false,'番茄每日去重');
 cloud.setUser('reader-a');const inbox=await invoke('inbox',{});assert.equal(inbox.entries.length,2);assert.ok(inbox.entries.some(entry=>entry.kind==='star'));assert.ok(inbox.entries.some(entry=>entry.kind==='tomato'));await invoke('readInbox',{ids:inbox.entries.map(e=>e.id)});assert.equal((await invoke('inbox',{})).entries.length,0);
 await invoke('profile',{joined:false,invitations:false});assert.equal((await invoke('feed',{})).entries.length,1);assert.equal((await invoke('rank',{})).entries.length,1);assert.equal((await invoke('login',{})).profile.invitations,false,'自动加入不覆盖番茄接收偏好');
 cloud.setUser('long-reader');await invoke('login',{});await invoke('beginBook',{book:{id:'long',title:'长时间阅读',parts:1}});await invoke('putPart',{bookId:'long',index:0,text:JSON.stringify(txt.chapters)});await invoke('finishBook',{bookId:'long'});
 const todayStart=Date.UTC(2026,10,19)-28800000;const longNow=todayStart+12*3600000;const actualNow=Date.now;Date.now=()=>longNow;
 try{for(let index=0;index<73;index++)await invoke('record',{record:{id:'long-'+index,bookId:'long',startedAt:todayStart+index*300000,endedAt:todayStart+(index+1)*300000,seconds:300,position:0,note:''}});assert.equal((await invoke('rank',{})).entries.find(entry=>entry.mine).seconds,21900,'超过六小时不截断榜单时长');}finally{Date.now=actualNow;}
 cloud.setUser('reader-a');
 await invoke('deleteBook',{bookId:'book1'});assert.equal((await invoke('library',{})).books.length,0);assert.equal((await cloud.invoke({action:'getPart',bookId:'book1',index:0})).ok,false);
 // 双用户闭环：页面先同步阅读记录，读友送星星和番茄，返回首页轻提示并确认已读。
 const flowStorage=new Map([...storage].map(([key,value])=>[key,structuredClone(value)]));const flowFiles=new Map(files);const flowCall=runtime.wx.cloud.callFunction;const flowModal=runtime.wx.showModal;
 const flow=createReadingCloudHarness();flow.setUser('flow-reader');runtime.wx.cloud.callFunction=async options=>({result:await flow.invoke(options.data)});
 storage.clear();files.clear();store.saveBook({...book,id:'flow-book'});const flowTime=Date.now();store.record({id:'flow-record',bookId:'flow-book',startedAt:flowTime-65000,endedAt:flowTime,seconds:65,position:0,note:'只给自己的感想'});
 load('miniprogram/pages/reading-together/reading-together.ts');const hallDefinition=pageDefinition;
 const makePage=definition=>({...definition,data:structuredClone(definition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();}});
 const hallA=makePage(hallDefinition);await hallA.load();assert.equal(hallA.data.entries.length,1,'大厅加载前完成补传');assert.equal(hallA.data.entries[0].minutes,1);assert.ok(!JSON.stringify(hallA.data.entries).includes('只给自己的感想'));
 const readerState=new Map([...storage].map(([key,value])=>[key,structuredClone(value)]));const readerFiles=new Map(files);
 storage.clear();files.clear();flow.setUser('flow-friend');const hallB=makePage(hallDefinition);await hallB.load();
 const flowId=hallB.data.entries[0].id;await hallB.onStar({currentTarget:{dataset:{id:flowId}}});assert.equal(hallB.data.entries[0].starred,true);
 runtime.wx.showActionSheet=async()=>({tapIndex:0});await hallB.onTomato({currentTarget:{dataset:{id:flowId}}});assert.equal(hallB.data.entries[0].tomatoSent,true);
 storage.clear();for(const [key,value] of readerState)storage.set(key,value);files.clear();for(const [key,value] of readerFiles)files.set(key,value);flow.setUser('flow-reader');
 load('miniprogram/pages/reading-home/reading-home.ts');const encouragedHome=makePage(homeState);let encouragementModals=0;runtime.wx.showModal=async()=>{encouragementModals++;return {confirm:true};};
 encouragedHome.onShow();await new Promise(resolve=>setImmediate(resolve));assert.equal(encouragedHome.data.invitations.length,2);assert.equal(encouragementModals,0,'返回首页不能自动弹窗');await encouragedHome.onInvitation();assert.equal(encouragedHome.data.invitations.length,0);encouragedHome.onShow();await new Promise(resolve=>setImmediate(resolve));assert.equal(encouragedHome.data.invitations.length,0,'查看后不反复提醒');assert.equal(encouragementModals,1);
 runtime.wx.cloud.callFunction=flowCall;runtime.wx.showModal=flowModal;storage.clear();for(const [key,value] of flowStorage)storage.set(key,value);files.clear();for(const [key,value] of flowFiles)files.set(key,value);
 const {createCanvas,GlobalFonts,Image}=require('@napi-rs/canvas');const os=require('os');
 assert.ok(GlobalFonts.registerFromPath('C:/Windows/Fonts/msyh.ttc','sans-serif'));assert.ok(GlobalFonts.registerFromPath('C:/Windows/Fonts/simsun.ttc','serif'));
 const canvas=createCanvas(750,1100);canvas.createImage=()=>new Image();let output='';
 runtime.wx.getImageInfo=async()=>({path:path.resolve('miniprogram/images/reading/cover.jpg')});
 runtime.wx.canvasToTempFilePath=options=>{output=path.join(os.tmpdir(),'reading-journal-share.jpg');fs.writeFileSync(output,options.canvas.toBuffer('image/jpeg',90));options.success({tempFilePath:output});};
 runtime.wx.previewImage=async()=>{};
 load('miniprogram/pages/book-journal/book-journal.ts');
 const journal={...pageDefinition,data:structuredClone(pageDefinition.data),setData(values,callback){Object.assign(this.data,values);if(callback)callback();},createSelectorQuery(){return{select:()=>({fields:()=>({exec:callback=>callback([{node:canvas}])})})};}};
 journal.onLoad({id:'book1'});assert.equal(journal.data.details,false,'分享默认不输出私人感想和书名');assert.ok(journal.data.leaves.length>=3);
 await journal.onExport();assert.ok(output&&fs.statSync(output).size>10000,'真实 Canvas 分享图导出');
 console.log('分享图预览：'+output);
 console.log('通过：真实 TXT/EPUB 解析、章节顺序、正文清洗、分页与重读、阅读退出、本机记录去重、真实云函数边界的私人正文隔离、记录去重、重叠时段拒绝、自动加入大厅、星星与番茄限频、消息读取、正文删除和真实 Canvas 纪念册分享。');
})().catch(error=>{console.error(error);process.exitCode=1;});


