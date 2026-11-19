const cloud = require('wx-server-sdk');
const crypto = require('crypto');
cloud.init({env:cloud.DYNAMIC_CURRENT_ENV});
const db=cloud.database({throwOnNotFound:false}); const names=['book_profiles','book_library','book_content','book_events','book_days','book_stars','book_invites'];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const day=t=>new Date(t+28800000).toISOString().slice(0,10);
const week=t=>{const d=new Date(t+28800000);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);};
const get=async(ref)=>{try{return (await ref.get()).data;}catch(e){if(e.errCode===-1 && /not exist|不存在/.test(e.errMsg||e.message))return null; if(e.errCode==='DATABASE_DOCUMENT_NOT_EXIST')return null; throw e;}};
const check=(condition,message)=>{if(!condition)throw new Error(message);};
const safeId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
exports.main=async event=>{
 try{
  const openid=cloud.getWXContext().OPENID;check(openid,'请从微信小程序登录');const uid=hash(openid).slice(0,32);const now=Date.now();
  const profileRef=db.collection('book_profiles').doc(uid);
  let profile=await get(profileRef);
  if(!profile){profile={name:'读友'+uid.slice(-4),joined:true,invitations:true,seconds:0,week:week(now),owner:openid};await profileRef.set({data:profile});}
  const publicProfile=()=>({id:uid,name:profile.name,joined:profile.joined,invitations:profile.invitations});
  const bookRef=id=>db.collection('book_library').doc(hash(uid+id));
  const action=event.action;
  if(action==='login'){if(!profile.joined){await profileRef.update({data:{joined:true}});profile={...profile,joined:true};}return {ok:true,profile:publicProfile()};}
  if(action==='profile'){
    check(typeof event.joined==='boolean'&&typeof event.invitations==='boolean','参与设置无效');
    await profileRef.update({data:{joined:true,invitations:event.invitations}});
    return {ok:true};
  }
  if(action==='block'){
    check(typeof event.target==='string'&&/^[a-f0-9]{32}$/.test(event.target)&&event.target!==uid,'用户编号无效');
    const blocked=Array.from(new Set([...(profile.blocked||[]),event.target]));check(blocked.length<=100,'屏蔽人数已达上限');
    await profileRef.update({data:{blocked}});return {ok:true};
  }
  if(action==='library'){
    const result=await db.collection('book_library').where({owner:uid,ready:true}).limit(30).get();
    return {ok:true,books:result.data.map(({_id,owner,...rest})=>rest)};
  }
  if(action==='beginBook'){
    const book=event.book;check(book&&safeId(book.id)&&typeof book.title==='string'&&book.title.length<=100,'书籍信息无效');
    check(Number.isInteger(book.parts)&&book.parts>=1&&book.parts<=80,'书籍分片数无效');
    const ref=bookRef(book.id);const existing=await get(ref);
    if(!existing){const count=await db.collection('book_library').where({owner:uid}).count();check(count.total<30,'当前书库最多保存 30 本书');}
    for(let index=book.parts;index<(existing?.parts||0);index++)await db.collection('book_content').doc(hash(uid+book.id+':'+index)).remove();
    await ref.set({data:{id:book.id,owner:uid,title:book.title,author:String(book.author||'').slice(0,80),parsingVersion:book.parsingVersion===2?2:1,parts:book.parts,position:existing?.position||0,status:existing?.status||'reading',createdAt:existing?.createdAt||now,updatedAt:now,ready:false}});
    return {ok:true};
  }
  if(action==='putPart'){
    check(safeId(event.bookId),'书籍编号无效');const book=await get(bookRef(event.bookId));check(book,'书籍不存在');
    check(Number.isInteger(event.index)&&event.index>=0&&event.index<book.parts,'分片编号无效');
    check(typeof event.text==='string'&&event.text.length<=40000,'分片超过限制');
    await db.collection('book_content').doc(hash(uid+event.bookId+':'+event.index)).set({data:{owner:uid,bookId:event.bookId,index:event.index,text:event.text}});
    return {ok:true};
  }
  if(action==='finishBook'){
    const book=await get(bookRef(event.bookId));check(book,'书籍不存在');const parts=await db.collection('book_content').where({owner:uid,bookId:event.bookId}).count();check(parts.total===book.parts,'书籍上传未完成');
    await bookRef(event.bookId).update({data:{ready:true}});return {ok:true};
  }
  if(action==='getPart'){
    check(safeId(event.bookId)&&Number.isInteger(event.index),'下载参数无效');
    const book=await get(bookRef(event.bookId));check(book&&book.ready,'书籍尚未完成同步或已删除');
    check(event.index>=0&&event.index<book.parts,'下载分片编号超出范围');
    if(event.updatedAt!==undefined)check(event.updatedAt===book.updatedAt,'云端书籍正在更新，请稍后重新恢复');
    const part=await get(db.collection('book_content').doc(hash(uid+event.bookId+':'+event.index)));check(part,'书籍分片不存在');return {ok:true,text:part.text};
  }
  if(action==='position'){
    check(safeId(event.bookId)&&Number.isInteger(event.position)&&event.position>=0&&event.position<=1000000,'阅读位置无效');
    check(['reading','paused','complete'].includes(event.status),'书籍状态无效');
    const book=await get(bookRef(event.bookId));check(book&&book.ready,'请先完成书籍同步');
    await bookRef(event.bookId).update({data:{position:event.position,status:event.status,updatedAt:now}});return {ok:true};
  }
  if(action==='deleteBook'){
    check(safeId(event.bookId),'书籍编号无效');
    await db.collection('book_content').where({owner:uid,bookId:event.bookId}).remove();
    await bookRef(event.bookId).remove();return {ok:true};
  }
  if(action==='record'){
    const e=event.record;check(e&&safeId(e.id)&&safeId(e.bookId),'阅读记录编号无效');
    check(Number.isInteger(e.seconds)&&e.seconds>=0&&e.seconds<=300,'单次记录限 5 分钟');
    check(Number.isFinite(e.startedAt)&&Number.isFinite(e.endedAt)&&e.endedAt<=now+60000&&e.startedAt>=1577808000000&&e.endedAt>=e.startedAt&&e.seconds<=Math.ceil((e.endedAt-e.startedAt)/1000),'阅读时间范围无效');
    const book=await get(bookRef(e.bookId));check(book&&book.ready,'请先同步对应书籍');
    check(typeof e.note==='string'&&e.note.length<=500,'感想最多 500 字');
    const recordId=hash(uid+e.id);const date=day(e.startedAt);
    await db.runTransaction(async tx=>{
      const eventRef=tx.collection('book_events').doc(recordId);
      if(await get(eventRef))return;
      const dref=tx.collection('book_days').doc(hash(uid+date));const previous=await get(dref);
      const user=await get(tx.collection('book_profiles').doc(uid));
      check(e.seconds===0||!user.lastReadEnd||e.startedAt>=user.lastReadEnd-1000,'记录时间重叠，请勿重复提交不同编号的同一段阅读');
      const seconds=e.seconds;
      const eventWeek=week(e.startedAt);const currentWeek=week(now);
      await eventRef.set({data:{...e,seconds,owner:uid}});
      await dref.set({data:{owner:uid,name:user.name,day:date,seconds:(previous?.seconds||0)+seconds,updatedAt:now}});
      await tx.collection('book_profiles').doc(uid).update({data:{lastReadEnd:Math.max(user.lastReadEnd||0,e.endedAt),...(eventWeek===currentWeek?{week:currentWeek,seconds:(user.week===currentWeek?user.seconds:0)+seconds}:{})}});
    });return {ok:true};
  }
  if(action==='feed'){
    const result=await db.collection('book_days').where({day:day(now)}).orderBy('updatedAt','desc').limit(50).get();
    const entries=[];
    for(const record of result.data){
      if(record.seconds<=0)continue;
      const user=await get(db.collection('book_profiles').doc(record.owner));if(!user?.joined||(profile.blocked||[]).includes(record.owner))continue;
      const stars=await db.collection('book_stars').where({target:record._id}).count();
      const starred=await get(db.collection('book_stars').doc(hash(uid+record._id)));
      const sent=await get(db.collection('book_invites').doc(hash(uid+record.owner+day(now))));
      entries.push({id:record._id,userId:record.owner,name:user.name,day:record.day,seconds:record.seconds,stars:stars.total,starred:!!starred,mine:record.owner===uid,tomatoSent:!!sent});
    }
    return {ok:true,entries};
  }
  if(action==='rank'){
    const result=await db.collection('book_profiles').where({joined:true,week:week(now)}).orderBy('seconds','desc').limit(50).get();
    return {ok:true,entries:result.data.filter(p=>p.seconds>0).map(p=>({id:p._id,name:p.name,seconds:p.seconds,mine:p._id===uid}))};
  }
  if(action==='star'){
    check(profile.joined,'请刷新同读大厅');check(typeof event.target==='string'&&/^[a-f0-9]{64}$/.test(event.target)&&typeof event.enabled==='boolean','加油参数无效');
    const target=await get(db.collection('book_days').doc(event.target));check(target,'动态已不存在');const user=await get(db.collection('book_profiles').doc(target.owner));check(user?.joined&&target.owner!==uid,'不能为这条记录加油');
    check(!(user.blocked||[]).includes(uid)&&!(profile.blocked||[]).includes(target.owner),'暂时无法为这位读友加油');
    const ref=db.collection('book_stars').doc(hash(uid+event.target));
    if(event.enabled===true)await db.runTransaction(async tx=>{
      const notification=tx.collection('book_invites').doc(hash('star:'+uid+event.target));
      const existing=await get(notification);
      await tx.collection('book_stars').doc(ref.id).set({data:{owner:uid,target:event.target}});
      if(!existing)await notification.set({data:{owner:uid,target:target.owner,name:profile.name,message:'为你的阅读记录送来一颗鼓励星星。',kind:'star',record:event.target,day:day(now),createdAt:now,seen:false}});
    });else await ref.remove();
    return {ok:true};
  }
  if(action==='tomato'){
    check(profile.joined,'请刷新同读大厅');check(typeof event.target==='string'&&/^[a-f0-9]{32}$/.test(event.target)&&event.target!==uid,'邀请对象无效');
    const messages=['我读了一小段，等你有空一起。','今天读一点点，也很好。','不着急，回来接着读就好。'];
    check(Number.isInteger(event.message)&&messages[event.message],'请选择预设祝福');
    const target=await get(db.collection('book_profiles').doc(event.target));check(target?.joined&&target.invitations&&!(target.blocked||[]).includes(uid),'对方暂不接收邀请');
    const ref=db.collection('book_invites').doc(hash(uid+event.target+day(now)));
    await db.runTransaction(async tx=>{
      const invite=tx.collection('book_invites').doc(ref.id);check(!await get(invite),'今天已经送过番茄了');
      const senderRef=tx.collection('book_profiles').doc(uid);const sender=await get(senderRef);
      check(sender.inviteDay!==day(now)||(sender.inviteCount||0)<5,'每天最多送出 5 颗番茄');
      await invite.set({data:{owner:uid,target:event.target,name:profile.name,message:messages[event.message],kind:'tomato',day:day(now),createdAt:now,seen:false}});
      await senderRef.update({data:{inviteDay:day(now),inviteCount:sender.inviteDay===day(now)?(sender.inviteCount||0)+1:1}});
    });return {ok:true};
  }
  if(action==='inbox'){
    const result=await db.collection('book_invites').where({target:uid,seen:false}).orderBy('createdAt','desc').limit(20).get();
    return {ok:true,entries:result.data.filter(e=>!(profile.blocked||[]).includes(e.owner)&&(e.kind==='star'||profile.invitations)).map(e=>({id:e._id,name:e.name,message:e.message,kind:e.kind==='star'?'star':'tomato'}))};
  }
  if(action==='readInbox'){
    check(Array.isArray(event.ids)&&event.ids.length<=20,'消息编号无效');
    for(const id of event.ids){check(typeof id==='string'&&/^[a-f0-9]{64}$/.test(id),'消息编号无效');const ref=db.collection('book_invites').doc(id);const item=await get(ref);if(item&&item.target===uid)await ref.update({data:{seen:true}});}
    return {ok:true};
  }
  throw new Error('不支持的阅读操作');
 }catch(error){console.error('阅读业务请求失败',{action:event.action,message:error.message});return {ok:false,error:error.message};}
};

