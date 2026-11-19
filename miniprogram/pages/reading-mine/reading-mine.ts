import { ReadingBook, totalLength } from '../../reading/core';
import { books, reconcileDeletedJournals, bookView, importBook, stats, restoreCloudBooks, sync, syncLabel, showError, move, findBook, identity, login, request, deleteBook, visibleJournals, hiddenJournals, restoreJournalDisplay, deleteJournal } from '../../reading/store';
Page({
 data:{library:[] as ReturnType<typeof bookView>[],journals:[] as Array<{id:string;title:string}>,hidden:[] as Array<{id:string;title:string}>,filter:'reading',bookCount:0,counts:{reading:0,complete:0,paused:0},stats:{days:0,minutes:0},settings:false,busy:false,syncText:'',invitations:true},
 onShow():void{this.refresh();},
 refresh():void{reconcileDeletedJournals();const library=books();this.setData({bookCount:library.length,counts:{reading:library.filter(book=>book.status==='reading').length,complete:library.filter(book=>book.status==='complete').length,paused:library.filter(book=>book.status==='paused').length},library:library.filter(book=>book.status===this.data.filter).map(bookView),journals:visibleJournals(),hidden:hiddenJournals(),stats:stats(),syncText:syncLabel(),invitations:identity()?.invitations!==false});},
 onFilter(event:WechatMiniprogram.TouchEvent):void{this.setData({filter:event.currentTarget.dataset.filter});this.refresh();},
 onRead(event:WechatMiniprogram.TouchEvent):void{wx.setStorageSync('reader_active',event.currentTarget.dataset.id);wx.navigateTo({url:'/pages/book-reader/book-reader?id='+event.currentTarget.dataset.id});},
 onJournal(event:WechatMiniprogram.TouchEvent):void{wx.navigateTo({url:'/pages/book-journal/book-journal?id='+event.currentTarget.dataset.id});},
 async onDeleteJournal(event:WechatMiniprogram.TouchEvent):Promise<void>{
  if(this.data.busy)return;
  const id:string=event.currentTarget.dataset.id;
  const journal=this.data.journals.find(item=>item.id===id);if(!journal)return;
  this.setData({busy:true});
  try{
   const answer=await wx.showModal({title:'删除这本纪念册？',content:'将「'+journal.title+'」从本机纪念册列表移除，可在设置中恢复显示。对应的在读书籍将暂时放下，不再显示在首页；正文、进度、时长和感想保留。',confirmText:'删除',confirmColor:'#a85c46'});
   if(!answer.confirm)return;
   deleteJournal(id);this.refresh();wx.showToast({title:'纪念册已删除',icon:'none'});
  }catch(error){showError(error);}finally{this.setData({busy:false});}
 },
 async onImport():Promise<void>{
  if(this.data.busy)return;this.setData({busy:true});
  try{
   const result=await importBook();if(!result)return;
   this.setData({filter:result.book.status});
   this.refresh();
   wx.showToast({title:result.status==='existing'?'已切换到这本书':result.status==='updated'?'排版已更新':'书籍导入成功',icon:'success'});
   sync().then(()=>this.refresh()).catch((error:unknown):void=>{console.warn('书籍已保存，本次云同步未完成',{bookId:result.book.id,error});this.refresh();});
  }catch(error){showError(error);this.refresh();}finally{this.setData({busy:false});}
 },
 async onManage(event:WechatMiniprogram.TouchEvent):Promise<void>{
  const id:string=event.currentTarget.dataset.id;const book:ReadingBook=findBook(id);
  const choice=await wx.showActionSheet({itemList:['设为在读','暂时放下','标记已读完','删除书籍']}).catch(()=>null);if(!choice)return;
  if(choice.tapIndex===3){const answer=await wx.showModal({title:'删除这本书？',content:'将删除本机和云端正文，阅读记录保留在纪念册中。',confirmText:'删除正文',confirmColor:'#a85c46'});if(!answer.confirm)return;try{await deleteBook(id,true);this.refresh();}catch(error){showError(error);}return;}
  const status:ReadingBook['status']=(['reading','paused','complete'] as const)[choice.tapIndex];move({...book,status,position:status==='complete'?totalLength(book):status==='reading'&&book.status==='complete'?0:book.position,updatedAt:Date.now()});if(status==='complete')wx.setStorageSync('reader_finished_'+id,Date.now());this.refresh();
 },
 onSettings():void{this.setData({settings:true});},onClose():void{this.setData({settings:false});},noop():void{},
 onRestoreJournal(event:WechatMiniprogram.TouchEvent):void{try{restoreJournalDisplay(event.currentTarget.dataset.id);this.refresh();wx.showToast({title:'已恢复显示',icon:'success'});}catch(error){showError(error);}},
 async onRestore():Promise<void>{
  if(this.data.busy)return;this.setData({busy:true});
  try{const result=await restoreCloudBooks();this.refresh();await wx.showModal({title:'云端恢复完成',content:result.restored?'已恢复 '+result.restored+' 本书。'+(result.unavailable?'另有 '+result.unavailable+' 本未找到已完成同步的云端正文，请重新导入原文件。':'可以回到书架继续阅读。'):result.unavailable?'有 '+result.unavailable+' 本书未找到已完成同步的云端正文，请重新导入原文件。':'没有需要恢复的书籍，已有本机正文不会被覆盖。',showCancel:false});}
  catch(error){showError(error);this.refresh();}finally{this.setData({busy:false});}
 },
 async onSync():Promise<void>{if(this.data.busy)return;this.setData({busy:true});try{await sync();this.refresh();}catch(error){showError(error);this.refresh();}finally{this.setData({busy:false});}},
 async onInvitations():Promise<void>{try{const profile=await login();await request('profile',{joined:profile.joined,invitations:!profile.invitations});wx.setStorageSync('reader_profile',{...profile,invitations:!profile.invitations});this.refresh();}catch(error){showError(error);}},
 onStats():void{wx.showModal({title:'我的阅读记录',content:'本周阅读 '+this.data.stats.days+' 天，共 '+this.data.stats.minutes+' 分钟。时长为前台阅读活动记录，不代表知识掌握程度。',showCancel:false});},
 async onInbox():Promise<void>{try{await login();const reply=await request('inbox',{});const entries=(reply.entries||[]) as Array<{id:string;name:string;message:string}>;await wx.showModal({title:'收到的鼓励',content:entries.length?entries.map(e=>e.name+'：'+e.message).join('\n'):'暂时还没有新的阅读鼓励，先给自己一点鼓励吧。',showCancel:false});if(entries.length)await request('readInbox',{ids:entries.map(e=>e.id)});}catch(error){showError(error);}},
 onFeedback():void{wx.showModal({title:'意见反馈',content:'可通过右上角菜单中的“反馈与投诉”提交建议。请说明页面、操作步骤和遇到的问题。',showCancel:false});}
});

