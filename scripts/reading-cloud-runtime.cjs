const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
exports.createReadingCloudHarness=()=>{
 const tables=new Map();let user='reader-a';let serial=Promise.resolve();
 const table=name=>{if(!tables.has(name))tables.set(name,new Map());return tables.get(name);};
 const collection=name=>{
  const ref=id=>({id,get:async()=>({data:table(name).has(id)?structuredClone({...table(name).get(id),_id:id}):null}),set:async({data})=>{if('_id'in data)throw Error('不能设置 _id');table(name).set(id,structuredClone(data));},update:async({data})=>{if(!table(name).has(id))throw Error('不存在');table(name).set(id,{...table(name).get(id),...structuredClone(data)});},remove:async()=>table(name).delete(id)});
  const query=(where,sort,limit)=>({where:next=>query(next,sort,limit),orderBy:(key,direction)=>query(where,{key,direction},limit),limit:n=>query(where,sort,n),get:async()=>{let entries=[...table(name)].map(([id,data])=>({...structuredClone(data),_id:id})).filter(data=>Object.entries(where).every(([key,value])=>data[key]===value));if(sort)entries.sort((a,b)=>(a[sort.key]<b[sort.key]?-1:a[sort.key]>b[sort.key]?1:0)*(sort.direction==='desc'?-1:1));return {data:entries.slice(0,limit)};},count:async()=>({total:(await query(where,sort,Infinity).get()).data.length}),remove:async()=>{for(const item of (await query(where,sort,Infinity).get()).data)table(name).delete(item._id);}});
  return {doc:ref,...query({},null,Infinity)};
 };
 const db={collection,createCollection:async name=>{table(name);},runTransaction:callback=>{const operation=serial.then(async()=>{const backup=structuredClone(tables);try{return await callback({collection});}catch(error){tables.clear();for(const [name,data]of backup)tables.set(name,data);throw error;}});serial=operation.catch(()=>{});return operation;}};
 const sdk={DYNAMIC_CURRENT_ENV:'test',init:()=>{},getWXContext:()=>({OPENID:user}),database:()=>db};
 const module={exports:{}};const filename=path.join(__dirname,'../cloudfunctions/reading/index.js');
 vm.runInNewContext('(function(require,module,exports){'+fs.readFileSync(filename,'utf8')+'\n})',{console:{error:()=>{}},Date})(name=>name==='wx-server-sdk'?sdk:require(name),module,module.exports);
 return {invoke:data=>module.exports.main(structuredClone(data)),setUser:value=>{user=value;},tables};
};

