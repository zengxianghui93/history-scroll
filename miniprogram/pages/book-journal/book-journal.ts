import { chinaDay } from '../../reading/core';
import { books, events, showError, deletedJournalIds } from '../../reading/store';
interface Leaf { id:string; title:string; subtitle:string; note:string; seal:string; minutes:number }
Page({
 data:{id:'',title:'',leaves:[] as Leaf[],current:0,details:false,busy:false,exported:'',exists:false},
 onLoad(query:Record<string,string>):void{if(deletedJournalIds().includes(query.id)){showError(new Error('这本纪念册已删除，书架中的书籍仍可继续阅读'));return;}const book=books().find(b=>b.id===query.id);const archive=wx.getStorageSync('reader_archive_'+query.id) as {title:string}|undefined;if(!book&&!archive){showError(new Error('找不到这本阅读纪念册'));return;}const title=book?.title||archive?.title||'';const records=events().filter(e=>e.bookId===query.id);if(!records.some(record=>record.seconds>0)){showError(new Error('完成一段阅读后，会自动生成这本纪念册'));return;}const dates=Array.from(new Set(records.map(e=>chinaDay(e.startedAt))));const leaves:Leaf[]=[{id:'cover',title,subtitle:'我的阅读手记',note:'零碎的时间，也能留下完整的回忆。',seal:'开卷',minutes:0}];
 dates.forEach(date=>{const daily=records.filter(e=>chinaDay(e.startedAt)===date);leaves.push({id:date,title:date.replace(/-/g,' · '),subtitle:'给自己留一点时间',minutes:Math.floor(daily.reduce((n,e)=>n+e.seconds,0)/60),note:daily.filter(e=>e.note).map(e=>e.note).join('\n\n'),seal:'读过'});});
 if(wx.getStorageSync('reader_half_'+query.id))leaves.push({id:'half',title:'已经走到一半',subtitle:'半程纪念',minutes:0,note:'那本一直想读的书，正在被你一点点读下去。',seal:'半程'});
 if(book?.status==='complete')leaves.push({id:'complete',title:'这一册，读完了',subtitle:'为这段坚持，留一枚印记',minutes:0,note:'读过的文字与自己的想法，留在这一册里。',seal:'读毕'});
 else leaves.push({id:'continue',title:'故事还在继续',subtitle:'等有空，接着读',minutes:0,note:'不必赶路。上次停留的地方，还在等你。',seal:'待续'});
 this.setData({id:query.id,title,leaves,exists:!!book});
 },
 onChange(event:WechatMiniprogram.SwiperChange):void{this.setData({current:event.detail.current,exported:''});},
 onRead():void{if(this.data.exists)wx.redirectTo({url:'/pages/book-reader/book-reader?id='+this.data.id});},
 onDetails():void{this.setData({details:!this.data.details,exported:''});},
 async onExport():Promise<void>{
  if(this.data.busy)return;this.setData({busy:true});
  try{
   const canvas=await new Promise<WechatMiniprogram.Canvas>((resolve,reject):void=>{this.createSelectorQuery().select('#journal-canvas').fields({node:true,size:true}).exec((result: Array<{node:WechatMiniprogram.Canvas}>):void=>{if(!result[0]?.node){reject(new Error('无法初始化分享画布'));return;}resolve(result[0].node);});});
   canvas.width=750;canvas.height=1100;const context=canvas.getContext('2d');
   context.fillStyle='#f6efdf';context.fillRect(0,0,750,1100);context.strokeStyle='#c3b498';context.lineWidth=2;context.strokeRect(30,30,690,1040);context.strokeRect(40,40,670,1020);
   context.fillStyle='#40584b';context.font='24px sans-serif';context.fillText('一 页 阅 读 手 记',75,110);
   const wrap=(text:string,x:number,y:number,width:number,lineHeight:number,maxLines:number):void=>{let line='';let row=0;for(const char of text){if(char==='\n'||context.measureText(line+char).width>width){context.fillText(line,x,y+row*lineHeight);row++;line=char==='\n'?'':char;if(row>=maxLines){context.fillText('…',x,y+row*lineHeight);return;}}else line+=char;}if(line)context.fillText(line,x,y+row*lineHeight);};
   const leaf=this.data.leaves[this.data.current];context.fillStyle='#303831';context.font='bold 45px serif';wrap(this.data.details?this.data.title:'我的阅读纪念',75,210,600,64,2);
   const imageInfo=await wx.getImageInfo({src:'/images/reading/cover.jpg'});
   const art=canvas.createImage();await new Promise<void>((resolve,reject):void=>{art.onload=():void=>resolve();art.onerror=():void=>reject(new Error('分享插画加载失败'));art.src=imageInfo.path;});
   context.drawImage(art,0,art.height*.4,art.width,art.height*.6,75,320,600,340);
   context.fillStyle='#40584b';context.font='34px serif';wrap(leaf.id==='cover'?'从一页开始':leaf.id==='half'?'已经走到一半':leaf.id==='complete'?'这一册，读完了':'今天，为自己留了一点时间',75,725,600,48,2);
   context.fillStyle='#7b7e6e';context.font='27px serif';wrap(this.data.details?(leaf.note||leaf.subtitle):'一点一点，读进自己的生活。',75,825,600,38,2);
   if(this.data.details&&leaf.minutes>0){context.font='23px sans-serif';context.fillText(leaf.title+' · '+leaf.minutes+' 分钟',75,920);}
   context.strokeStyle='#a65b43';context.lineWidth=4;context.strokeRect(575,940,95,80);context.strokeRect(582,947,81,66);context.fillStyle='#a65b43';context.font='30px serif';context.fillText(leaf.seal,590,991);
   context.fillStyle='#8c887c';context.font='20px sans-serif';context.fillText('每一小段，都算数。',75,1010);
   const result=await new Promise<WechatMiniprogram.CanvasToTempFilePathSuccessCallbackResult>((resolve,reject):void=>{wx.canvasToTempFilePath({canvas,fileType:'jpg',quality:.95,success:resolve,fail:reject},this);});
   this.setData({exported:result.tempFilePath});await wx.previewImage({urls:[result.tempFilePath],current:result.tempFilePath});
  }catch(error){showError(error);}finally{this.setData({busy:false});}
 },
 async onSave():Promise<void>{try{await wx.saveImageToPhotosAlbum({filePath:this.data.exported});wx.showToast({title:'已保存，可自行分享',icon:'none'});}catch{wx.showModal({title:'未保存到相册',content:'请在微信权限设置中允许保存图片后重试。',showCancel:false});}}
});

