import { layoutChapter } from '../../reading/typography';
import { ReadingBook, ReaderPreferences, locate, ReaderPage, chapterStart, progress, totalLength } from '../../reading/core';
import { findBook, move, record, uniqueId, preferences, setPreferences, events, syncQuietly, showError, imageSource, visibleJournals } from '../../reading/store';
Page({
 data:{book:null as ReadingBook|null,title:'',content:'',image:'',turnImage:'',underImage:'',percent:0,pageNumber:1,pageCount:1,toolbar:false,panel:'',prefs:preferences(),chapter:0,flip:false,flipDirection:'next',turnContent:'',underContent:'',error:'',idle:false},
 areaWidth:0,areaHeight:0,readingBook:null as ReadingBook|null,pages:[] as ReaderPage[],pageIndex:0,flipTimer:0,timer:0,readingMs:0,contentReady:false,renderToken:0,segmentStart:0,lastTick:0,lastActivity:0,touchX:0,touchY:0,touchStartedAt:0,active:false,natural:false,dialog:false,
 onLoad(query:Record<string,string>):void{try{const book=findBook(query.id);this.readingBook=book;const at=locate(book);this.setData({book:{...book,chapters:book.chapters.map(chapter=>({title:chapter.title,text:''}))},chapter:at.chapter,prefs:preferences()});}catch(error){this.setData({error:error instanceof Error?error.message:'无法打开书籍'});}},
 onReady():void{this.measureLayout();},
 onResize():void{this.pauseContent();this.finishTurn();this.measureLayout();},
 measureLayout():void{
   if(!this.readingBook)return;
   const offset=this.pages[this.pageIndex]?.start ?? locate(this.readingBook).offset;
   wx.nextTick(()=>this.createSelectorQuery().select('.page-stage').boundingClientRect(rect=>{
     if(!rect||Array.isArray(rect)||rect.width<=0||rect.height<=0){this.pauseContent();this.setData({error:'无法测量阅读区域，请重新打开书籍'});return;}
     this.areaWidth=rect.width;this.areaHeight=rect.height;
     try{this.layout(offset);}catch(error){this.pauseContent();this.setData({error:error instanceof Error?error.message:'正文排版失败'});}
   }).exec());
 },
 onShow():void{clearInterval(this.timer);const now=Date.now();this.active=true;this.segmentStart=now;this.lastTick=now;this.lastActivity=now;this.setData({idle:false});this.timer=setInterval(()=>this.tick(),1000);},
 onHide():void{this.stop();},onUnload():void{this.stop();},
 stop():void{this.finishTurn();if(!this.active)return;this.flush('');this.active=false;clearInterval(this.timer);this.persist();syncQuietly();},
 settleTime():void{
   const now=Date.now();
   if(this.active&&this.contentReady&&!this.dialog&&!this.data.panel&&!this.data.error){
     this.readingMs+=Math.max(0,Math.min(now,this.lastActivity+300000)-this.lastTick);
   }
   this.lastTick=now;
   this.setData({idle:this.active&&this.contentReady&&!this.dialog&&!this.data.panel&&now>=this.lastActivity+300000});
 },
 tick():void{this.settleTime();if(this.active&&Date.now()-this.segmentStart>=30000)this.flush('');},
 flush(note:string):void{
   this.settleTime();if(!this.readingBook)return;
   const now=Date.now();let seconds=Math.floor(this.readingMs/1000);let start=this.segmentStart;
   while(seconds>300){record({id:uniqueId(),bookId:this.readingBook.id,startedAt:start,endedAt:start+300000,seconds:300,position:this.position(),note:''});start+=300000;seconds-=300;this.readingMs-=300000;}
   if(seconds>0||note)record({id:uniqueId(),bookId:this.readingBook.id,startedAt:start,endedAt:now,seconds,position:this.position(),note});
   this.readingMs-=seconds*1000;this.segmentStart=now;
 },
 pauseContent():void{this.flush('');this.contentReady=false;this.renderToken+=1;},
 contentShown(token:number):void{
   if(token!==this.renderToken||this.data.error)return;
   this.settleTime();if(!this.contentReady){this.lastActivity=Date.now();this.setData({idle:false});}this.contentReady=true;this.lastTick=Date.now();
 },
 position():number{return this.readingBook?chapterStart(this.readingBook,this.data.chapter)+(this.pages[this.pageIndex]?.start||0):0;},
 persist():void{
   if(!this.readingBook)return;
   const book:ReadingBook={...this.readingBook,position:this.position(),updatedAt:Date.now()};
   move(book);
   const readSeconds=events().filter(e=>e.bookId===book.id).reduce((sum,e)=>sum+e.seconds,0);
   if(this.natural&&progress(book)>=50&&readSeconds>=120&&!wx.getStorageSync('reader_half_'+book.id)){wx.setStorageSync('reader_half_'+book.id,true);wx.setStorageSync('reader_milestone',book.id);}
   this.natural=false;this.readingBook=book;
 },
 layout(offset:number):void{
   const book=this.readingBook;if(!book||!this.areaWidth||!this.areaHeight)return;
   this.pages=layoutChapter(book.chapters[this.data.chapter],this.areaWidth,this.areaHeight,this.data.prefs);
   this.pageIndex=Math.max(0,this.pages.findIndex((page,index)=>offset>=page.start&&(index===this.pages.length-1||offset<this.pages[index+1].start)));
   this.paint();
 },
 paint():void{
   const book=this.readingBook;if(!book)return;this.pauseContent();const token=this.renderToken;
   const position=chapterStart(book,this.data.chapter)+(this.pages[this.pageIndex]?.start||0);const image=this.pages[this.pageIndex]?.image;
   const source=image?imageSource(book.id,this.data.chapter,image):'';
   this.setData({image:source,title:book.chapters[this.data.chapter].title,content:this.pages[this.pageIndex]?.displayText ?? this.pages[this.pageIndex]?.text ?? '',pageNumber:this.pageIndex+1,pageCount:this.pages.length,percent:Math.floor(position/Math.max(1,totalLength(book))*100)},()=>{
     if(!source)wx.nextTick(()=>this.contentShown(token));
   });
 },
 interact():void{this.settleTime();this.lastActivity=Date.now();this.lastTick=this.lastActivity;this.setData({idle:false});},
 onTouchStart(event:WechatMiniprogram.TouchEvent):void{this.touchStartedAt=Date.now();this.touchX=event.touches[0].clientX;this.touchY=event.touches[0].clientY;this.interact();},
 onTouchEnd(event:WechatMiniprogram.TouchEvent):void{
   if(this.data.panel||this.dialog||this.data.flip||!this.pages.length)return;
   const touch=event.changedTouches[0];if(!touch)return;
   const x=touch.clientX-this.touchX;const y=touch.clientY-this.touchY;
   const distance=Math.max(Math.abs(x),Math.abs(y));
   if(distance>45){
     const direction=Math.abs(x)>=Math.abs(y)?x:y;
     this.setData({toolbar:false});
     if(direction<0)this.onNext();else this.onPrevious();
   }else if(distance<12&&Date.now()-this.touchStartedAt<500){
     const width=wx.getWindowInfo().windowWidth;
     if(touch.clientX<width*0.28){this.setData({toolbar:false});this.onPrevious();}
     else if(touch.clientX>width*0.72){this.setData({toolbar:false});this.onNext();}
     else this.setData({toolbar:!this.data.toolbar});
   }
 },
 onNext():void{
   if(this.data.flip)return;this.interact();const book=this.readingBook;if(!book)return;const oldContent=this.data.content;const oldImage=this.data.image;const previousPercent=this.data.percent;
   if(this.pageIndex<this.pages.length-1)this.pageIndex+=1;
   else if(this.data.chapter<book.chapters.length-1){this.setData({chapter:this.data.chapter+1});this.layout(0);}
   else{this.onFinish();return;}
   this.setData({turnImage:oldImage});this.animate('next',oldContent);this.paint();this.natural=previousPercent<50&&this.data.percent>=50;this.persist();
 },
 onPrevious():void{
   if(this.data.flip||(!this.pageIndex&&!this.data.chapter))return;
   this.setData({underContent:this.data.content,underImage:this.data.image});this.interact();if(this.pageIndex>0)this.pageIndex-=1;else if(this.data.chapter>0){this.setData({chapter:this.data.chapter-1});this.layout(0);this.pageIndex=this.pages.length-1;}
   const image=this.pages[this.pageIndex]?.image;this.setData({turnImage:image&&this.readingBook?imageSource(this.readingBook.id,this.data.chapter,image):''});this.animate('previous',this.pages[this.pageIndex]?.displayText ?? this.pages[this.pageIndex]?.text ?? '');this.paint();this.persist();
 },
 animate(direction:'next'|'previous',content:string):void{
   if(!this.data.prefs.animation)return;
   this.setData({flip:true,flipDirection:direction,turnContent:content});
   this.flipTimer=setTimeout(()=>this.finishTurn(),400);
 },
 finishTurn():void{clearTimeout(this.flipTimer);this.flipTimer=0;this.setData({flip:false,turnContent:'',turnImage:'',underImage:''});},
 async onFinish():Promise<void>{
   if(this.dialog)return;this.flush('');this.dialog=true;
   try{
     const answer=await wx.showModal({title:'已经到最后一页',content:'如果已经读完，可以留下这一册的完成记录。',confirmText:'标记读完'});
     if(answer.confirm&&this.readingBook){move({...this.readingBook,position:totalLength(this.readingBook),status:'complete',updatedAt:Date.now()});wx.setStorageSync('reader_finished_'+this.readingBook.id,Date.now());this.natural=false;this.active=false;clearInterval(this.timer);syncQuietly();if(visibleJournals().some(entry=>entry.id===this.readingBook?.id))wx.redirectTo({url:'/pages/book-journal/book-journal?id='+this.readingBook.id});else wx.switchTab({url:'/pages/reading-mine/reading-mine'});}
   }catch(error){showError(error);}finally{this.settleTime();this.dialog=false;this.interact();}
 },
 onImageLoad(event:WechatMiniprogram.ImageLoad):void{if(event.currentTarget.dataset.source===this.data.image)this.contentShown(this.renderToken);},
 onImageError(event:WechatMiniprogram.ImageError):void{this.pauseContent();this.setData({error:'书内插图加载失败，请重新打开书籍'});showError(new Error('书内插图加载失败：'+event.detail.errMsg));},
 onDirectory():void{this.flush('');this.finishTurn();this.setData({panel:'directory'});},
 onSettings():void{this.flush('');this.finishTurn();this.setData({panel:'settings'});},
 onClose():void{this.settleTime();this.setData({panel:''});this.interact();},noop():void{},
 onChapter(event:WechatMiniprogram.TouchEvent):void{this.flush('');this.setData({chapter:Number(event.currentTarget.dataset.index),panel:''});this.natural=false;this.layout(0);this.persist();this.interact();},
 async onNote():Promise<void>{
   if(this.dialog)return;this.flush('');this.dialog=true;
   try{const answer=await wx.showModal({title:'记一句，只留给自己',editable:true,placeholderText:'此刻想到什么？最多 500 字',confirmText:'保存'});if(answer.confirm&&answer.content?.trim()){this.flush(answer.content.trim().slice(0,500));wx.showToast({title:'已记入阅读手册',icon:'none'});}}
   catch(error){showError(error);}finally{this.settleTime();this.dialog=false;this.interact();}
 },
 onFont(event:WechatMiniprogram.TouchEvent):void{const size=Math.max(16,Math.min(26,this.data.prefs.fontSize+Number(event.currentTarget.dataset.delta)));this.applyPrefs({...this.data.prefs,fontSize:size});},
 onLine():void{this.applyPrefs({...this.data.prefs,lineHeight:this.data.prefs.lineHeight===1.9?2.2:1.9});},
 onDark():void{this.applyPrefs({...this.data.prefs,dark:!this.data.prefs.dark});},
 onAnimation():void{this.applyPrefs({...this.data.prefs,animation:!this.data.prefs.animation});},
 applyPrefs(value:ReaderPreferences):void{this.pauseContent();this.finishTurn();const offset=this.pages[this.pageIndex]?.start||0;setPreferences(value);this.setData({prefs:value});this.layout(offset);this.interact();}
});

