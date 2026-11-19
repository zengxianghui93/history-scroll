const { unzipSync, strFromU8 } = require('fflate');
const { XMLParser } = require('fast-xml-parser');
const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, processEntities: false });
const MAX_TEXT = 1000000;
const array = value => value == null ? [] : Array.isArray(value) ? value : [value];
const decode = text => text.replace(/&#(x[0-9a-f]+|\d+);/gi, (_,v) => { const n = v[0].toLowerCase() === 'x' ? parseInt(v.slice(1),16) : Number(v); return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ''; }).replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const normalize = text => text.replace(/\r\n?/g,'\n').replace(/^[ \t\u3000]+|[ \t\u3000]+$/gm,'').replace(/\n{3,}/g,'\n\n').trim();
const plain = html => decode(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<\/?(?:p|div|h[1-6]|li|br|section)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'')).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n\n').trim();
const path = (base, relative) => {
 const parts = (base + '/' + decodeURIComponent(relative.split('#')[0])).split('/'); const out=[];
 for(const part of parts){ if(!part || part === '.')continue; if(part === '..'){if(!out.length)throw new Error('EPUB 路径越界');out.pop();}else out.push(part); }
 return out.join('/');
};
exports.parseBook = (buffer, name) => {
 if(buffer.byteLength > 10 * 1024 * 1024)throw new Error('第一版仅支持 10MB 以内的文字书籍');
 const bytes = new Uint8Array(buffer);
 let title=name.replace(/\.(txt|epub)$/i,''); let author=''; let chapters=[];
 if(/\.txt$/i.test(name)){
   const text=normalize(strFromU8(bytes).replace(/^\uFEFF/,''));
   if(text.includes('\uFFFD'))throw new Error('TXT 编码无法识别，请另存为 UTF-8 后导入');
   chapters=[{title:'正文',text}];
 }else if(/\.epub$/i.test(name)){
   let size=0;
   const zip=unzipSync(bytes,{filter: entry=>{size+=entry.originalSize;if(size>20*1024*1024)throw new Error('EPUB 解压内容超过 20MB，请导入更小的文字版'); return /\.(xml|opf|xhtml|html|htm|png|jpe?g|gif|webp)$/i.test(entry.name);}});
   const xml=file=>{if(!zip[file])throw new Error('EPUB 缺少文件：'+file); const s=strFromU8(zip[file]);if(/<!ENTITY/i.test(s))throw new Error('暂不支持含自定义实体的 EPUB');return s;};
   if(zip['META-INF/encryption.xml'])throw new Error('暂不支持加密或字体加密的 EPUB，请使用无加密文字版');
   const container=parser.parse(xml('META-INF/container.xml'));
   const root=array(container.container?.rootfiles?.rootfile)[0]?.['@_full-path'];
   if(!root)throw new Error('EPUB 缺少目录索引');
   const pkg=parser.parse(xml(root)).package;const base=root.includes('/')?root.slice(0,root.lastIndexOf('/')):'';
   const value=v=>typeof v==='string'?v:typeof v==='number'?String(v):v?.['#text']||'';
   title=value(array(pkg.metadata?.title)[0])||title;author=value(array(pkg.metadata?.creator)[0]);
   const items=array(pkg.manifest?.item);let imageBytes=0;
   const base64=data=>{const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';let result='';for(let i=0;i<data.length;i+=3){const n=(data[i]<<16)|((data[i+1]||0)<<8)|(data[i+2]||0);result+=chars[(n>>>18)&63]+chars[(n>>>12)&63]+(i+1<data.length?chars[(n>>>6)&63]:'=')+(i+2<data.length?chars[n&63]:'=');}return result;};
   for(const ref of array(pkg.spine?.itemref)){
      if(ref['@_linear']==='no')continue;
      const item=items.find(i=>i['@_id']===ref['@_idref']);
      if(!item)throw new Error('EPUB 章节索引不完整');
      if(!/xhtml|html/.test(item['@_media-type']))continue;
      const chapterPath=path(base,item['@_href']);const chapterBase=chapterPath.includes('/')?chapterPath.slice(0,chapterPath.lastIndexOf('/')):'';
      const html=xml(chapterPath);const images=[];
      const body=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<head\b[^>]*>[\s\S]*?<\/head>/i,'').replace(/<(?:img|image)\b[^>]*>/gi,tag=>{
        const source=tag.match(/(?:src|(?:xlink:)?href)\s*=\s*["']([^"']+)["']/i)?.[1];
        if(!source)throw new Error('EPUB 插图缺少图片地址');
        if(/^(?:[a-z]+:|\/\/)/i.test(source))throw new Error('暂不支持包含外部链接图片的 EPUB，请使用图片内嵌在书籍中的版本');
        const imagePath=path(chapterBase,source);const data=zip[imagePath];
        if(!data)throw new Error('EPUB 插图不存在或格式暂不支持：'+imagePath+'（支持 PNG、JPEG、GIF、WebP）');
        imageBytes+=data.byteLength;
        if(data.byteLength>512*1024||imageBytes>1500*1024)throw new Error('书内插图过大，单图需小于 512KB、插图合计需小于 1.5MB，请压缩插图后导入');
        const extension=imagePath.split('.').pop().toLowerCase().replace('jpeg','jpg');
        images.push({offset:0,data:base64(data),extension});return '\n\uFFFC\n';
      });
      const text=normalize(plain(body));let imageIndex=0;
      for(let i=0;i<text.length;i++)if(text[i]==='\uFFFC'&&imageIndex<images.length)images[imageIndex++].offset=i;
      const heading=html.match(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i);
      if(text)chapters.push({title:heading?plain(heading[1]):'第 '+(chapters.length+1)+' 节',text,...(images.length?{images}:{})});
   }
 }else throw new Error('请选择 EPUB 或 UTF-8 TXT 文件');
 if(!chapters.length || !chapters.some(c=>c.text))throw new Error('没有解析到可阅读的正文，暂不支持图片型书籍');
 if(chapters.reduce((n,c)=>n+c.text.length,0)>MAX_TEXT)throw new Error('第一版单本限 100 万字，请拆分后导入');
 if(JSON.stringify(chapters).length>3000000)throw new Error('解析后的图文内容超过 3MB，请压缩图片或拆分后导入');
 return {title:String(title).slice(0,100),author:String(author).slice(0,80),chapters};
};

