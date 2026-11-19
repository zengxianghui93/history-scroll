import { ReadingBook, Invitation, locate } from '../../reading/core';
import { books, reconcileDeletedJournals, bookView, findBook, importBook, identity, request, showError, stats, restoreCloudBooks, sync, syncLabel, move, visibleJournals } from '../../reading/store';
Page({
 data:{book:null as ReturnType<typeof bookView>|null,hasJournal:false,chapter:'',excerpt:'',stats:{days:0,minutes:0},syncText:'',switching:false,library:[] as ReturnType<typeof bookView>[],busy:false,invitations:[] as Invitation[],milestone:''},
 onShow():void{
   this.refresh();
   const milestone:string=wx.getStorageSync('reader_milestone')||''; if(milestone){this.setData({milestone});wx.removeStorageSync('reader_milestone');}
   if(identity())request('inbox',{}).then(reply=>this.setData({invitations:(reply.entries||[]) as Invitation[]})).catch((error:unknown):void=>{console.warn('邀请暂未加载',{error});});
 },
 refresh():void{reconcileDeletedJournals();
   const library:ReadingBook[]=books();const active:string=wx.getStorageSync('reader_active');
   const reading:ReadingBook[]=library.filter(book=>book.status==='reading');
   const selected:ReadingBook|undefined=reading.find(book=>book.id===active)||reading[0];
   if(selected)wx.setStorageSync('reader_active',selected.id);else wx.removeStorageSync('reader_active');
   const position=selected?locate(selected):null;
   this.setData({book:selected?bookView(selected):null,hasJournal:!!selected&&visibleJournals().some(entry=>entry.id===selected.id),library:library.map(bookView),chapter:selected&&position?selected.chapters[position.chapter].title:'',excerpt:selected&&position?selected.chapters[position.chapter].text.slice(position.offset,position.offset+70):'',stats:stats(),syncText:syncLabel()});
 },
 async onImport():Promise<void>{
  if(this.data.busy)return;this.setData({busy:true});
  try{
   const result=await importBook();if(!result)return;
   this.setData({busy:false});await this.onClose();
   this.refresh();
   wx.showToast({title:result.status==='existing'?'已切换到这本书':result.status==='updated'?'排版已更新':'书籍导入成功',icon:'success'});
   sync().then(()=>this.refresh()).catch((error:unknown):void=>{console.warn('书籍已保存，本次云同步未完成',{bookId:result.book.id,error});this.refresh();});
  }catch(error){showError(error);this.refresh();}finally{this.setData({busy:false});}
 },
 onRead():void{if(this.data.book)wx.navigateTo({url:'/pages/book-reader/book-reader?id='+this.data.book.id});},
 async onSwitch():Promise<void>{if(this.data.busy)return;try{await wx.hideTabBar({animation:true});this.setData({switching:true});}catch(error){showError(error);}},
 async onClose():Promise<void>{if(this.data.busy)return;this.setData({switching:false});try{await wx.showTabBar({animation:true});}catch(error){showError(error);}},
 noop():void{},
 async onSelect(event:WechatMiniprogram.TouchEvent):Promise<void>{
  if(this.data.busy)return;
  try{
   const book:ReadingBook=findBook(event.currentTarget.dataset.id);
   if(book.status==='complete'){
    const answer=await wx.showModal({title:'再读一遍这本书？',content:'将从第一页开始新的阅读，之前的时长和感想保留。',confirmText:'重新阅读'});
    if(!answer.confirm)return;
    move({...book,status:'reading',position:0,updatedAt:Date.now()});
   }else if(book.status==='paused')move({...book,status:'reading',updatedAt:Date.now()});
   else wx.setStorageSync('reader_active',book.id);
   await this.onClose();this.refresh();
  }catch(error){showError(error);}
 },
 async onRestore():Promise<void>{
  if(this.data.busy)return;this.setData({busy:true});
  try{const result=await restoreCloudBooks();this.refresh();await wx.showModal({title:'云端恢复完成',content:result.restored?'已恢复 '+result.restored+' 本书。'+(result.unavailable?'另有 '+result.unavailable+' 本未找到已完成同步的云端正文，请重新导入原文件。':'可以回到书架继续阅读。'):result.unavailable?'有 '+result.unavailable+' 本书未找到已完成同步的云端正文，请重新导入原文件。':'没有需要恢复的书籍，已有本机正文不会被覆盖。',showCancel:false});}
  catch(error){showError(error);this.refresh();}finally{this.setData({busy:false});}
 },
 async onSync():Promise<void>{if(this.data.busy)return;this.setData({busy:true});try{await sync();this.refresh();}catch(error){showError(error);this.refresh();}finally{this.setData({busy:false});}},
 encouragementBusy:false,
 async onInvitation():Promise<void>{
  if(this.encouragementBusy)return;const entries=this.data.invitations;if(!entries.length)return;this.encouragementBusy=true;
  try{await wx.showModal({title:'收到新的阅读鼓励',content:entries.map(entry=>entry.name+'：'+entry.message).join('\n\n'),showCancel:false,confirmText:'收到了'});await request('readInbox',{ids:entries.map(entry=>entry.id)});this.setData({invitations:this.data.invitations.filter(entry=>!entries.some(read=>read.id===entry.id))});}
  catch(error){showError(error);}finally{this.encouragementBusy=false;}
 },
 onDismiss():void{this.setData({milestone:''});},
 onJournal():void{this.setData({milestone:''});if(this.data.book&&this.data.hasJournal)wx.navigateTo({url:'/pages/book-journal/book-journal?id='+this.data.book.id});}
});

