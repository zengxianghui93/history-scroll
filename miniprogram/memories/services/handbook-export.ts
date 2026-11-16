import { CityHandbook, HandbookLeaf } from '../data/handbook';

type Context = WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D;
interface CanvasRecord { node?: WechatMiniprogram.Canvas }
interface ExportSurface { canvas: WechatMiniprogram.Canvas; context: Context }

async function exportSurface(width: number, height: number): Promise<ExportSurface> {
  const canvas: WechatMiniprogram.Canvas = await new Promise((resolve, reject): void => {
    wx.createSelectorQuery().select('#handbook-canvas').fields({ node: true, size: true }).exec((records: CanvasRecord[]): void => {
      if (!records[0]?.node) { reject(new Error('探索手册画布未就绪，请稍后重试')); return; }
      resolve(records[0].node);
    });
  });
  canvas.width = width; canvas.height = height;
  return { canvas, context: canvas.getContext('2d') };
}

async function downloadArt(fileID: string): Promise<string> {
  for (let attempt: number = 1; attempt <= 3; attempt += 1) {
    try { return (await wx.cloud.downloadFile({ fileID })).tempFilePath; }
    catch (error) {
      console.warn('探索手册插画下载失败', { fileID, attempt, error });
      if (attempt === 3) throw error;
    }
  }
  throw new Error('探索手册插画下载未完成：' + fileID);
}

async function loadArt(canvas: WechatMiniprogram.Canvas, fileID: string): Promise<WechatMiniprogram.Image> {
  const src: string = await downloadArt(fileID);
  return new Promise((resolve, reject): void => {
    const image: WechatMiniprogram.Image = canvas.createImage();
    image.onload = (): void => { resolve(image); };
    image.onerror = (error: unknown): void => { reject(new Error('探索手册插画解码失败：' + JSON.stringify({ fileID, src, error }))); };
    image.src = src;
  });
}

function fitArt(context: Context, image: WechatMiniprogram.Image, x: number, y: number, width: number, height: number): void {
  const scale: number = Math.max(width / image.width, height / image.height);
  const sw: number = width / scale;
  const sh: number = height / scale;
  context.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, width, height);
}

function fullArt(context: Context, image: WechatMiniprogram.Image): void {
  const scale: number = Math.min(1280 / image.width, 1010 / image.height);
  const width: number = image.width * scale;
  const height: number = image.height * scale;
  context.drawImage(image, 110 + (1280 - width) / 2, 190 + (1010 - height) / 2, width, height);
}

function palaceInk(context: Context, image: WechatMiniprogram.Image, x: number, y: number, size: number): void {
  // 从已有盖章成品中取朱印本体，不把盖章场景缩成一枚小图。
  context.drawImage(image,image.width*.29,image.height*.554,image.width*.395,image.height*.263,x,y,size,size);
}

function paper(context: Context): void {
  context.fillStyle = '#f7efdd'; context.fillRect(0, 0, 1500, 2100);
  context.strokeStyle = '#e3d6bc'; context.lineWidth = 1;
  for (let y: number = 2; y < 2100; y += 13) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(1500, y + 7); context.stroke();
  }
  context.strokeStyle = '#bfa77f'; context.lineWidth = 2; context.strokeRect(40, 40, 1420, 2020);
  context.fillStyle = '#b09a7030'; context.fillRect(50, 40, 20, 2020);
  context.strokeStyle = '#aa9670'; context.setLineDash([15, 21]); context.beginPath(); context.moveTo(63, 95); context.lineTo(63, 2000); context.stroke(); context.setLineDash([]);
}

function wrapText(context: Context, value: string, x: number, y: number, width: number, lineHeight: number): void {
  let line: string = '';
  let lineY: number = y;
  for (const char of value) {
    if (context.measureText(line + char).width > width && line) {
      context.fillText(line, x, lineY); line = char; lineY += lineHeight;
    } else line += char;
  }
  if (line) context.fillText(line, x, lineY);
}

function polygon(context: Context, points: readonly (readonly [number, number])[]): void {
  context.beginPath(); points.forEach(([x, y], index): void => { if (index === 0) context.moveTo(x, y); else context.lineTo(x, y); }); context.closePath(); context.fill();
}

/** 与公用朱印沿用相同的建筑识别元素和朱红、暖金配色。 */
function inkSymbol(context: Context, id: string): void {
  context.fillStyle = '#ffe3b4';
  if (id === 'daxing') {
    context.save(); context.translate(6,0); context.scale(.88,1);
    polygon(context,[[46,15],[54,15],[56,34],[62,36],[88,20],[97,23],[97,29],[65,46],[67,50],[94,63],[94,69],[86,72],[60,58],[56,58],[56,77],[50,80],[44,77],[44,58],[40,58],[14,72],[6,69],[6,63],[33,50],[35,46],[3,29],[3,23],[12,20],[38,36],[44,34]]);
    context.fillStyle = '#963b2d';
    polygon(context,[[47,41],[53,41],[56,47],[53,52],[47,52],[44,47]]);
    context.restore(); context.fillStyle = '#ffe3b4'; return;
  }
  if (id === 'longfu') {
    polygon(context,[[8,29],[16,31],[30,22],[40,12],[60,12],[70,22],[84,31],[92,29],[90,36],[80,40],[20,40],[10,36]]);
    context.fillRect(24,40,52,17);
    context.fillStyle = '#963b2d';
    for (let door: number = 0; door < 3; door += 1) context.fillRect(30+door*15,43,9,14);
    context.fillStyle = '#ffe3b4'; context.fillRect(6,60,88,3); context.fillRect(10,66,80,13);
    context.fillStyle = '#963b2d';
    for (let window: number = 0; window < 3; window += 1) context.fillRect(17+window*25,70,16,5);
    context.fillStyle = '#ffe3b4'; return;
  }
  if (id === 'sanlitun') {
    polygon(context,[[8,20],[35,25],[35,64],[8,59]]);
    polygon(context,[[65,30],[92,25],[92,59],[65,64]]);
    context.fillStyle = '#963b2d';
    for (let row: number = 0; row < 3; row += 1) {
      const y: number = 31 + row * 9;
      context.fillRect(14,y,6,4); context.fillRect(24,y,6,4);
      context.fillRect(70,y+4,6,4); context.fillRect(80,y+4,6,4);
    }
    context.fillStyle = '#ffe3b4';
    polygon(context,[[48,48],[52,48],[75,77],[25,77]]); return;
  }
  if (id === 'art-798') {
    for (let bay: number = 0; bay < 3; bay += 1) {
      const left: number = 8 + bay * 28;
      context.beginPath(); context.moveTo(left, 49); context.bezierCurveTo(left+3,35,left+12,22,left+22,21); context.lineTo(left+28,49); context.closePath(); context.fill();
    }
    context.fillRect(8,49,84,23);
    context.fillStyle = '#963b2d';
    for (let window: number = 0; window < 3; window += 1) {
      const x: number = 17 + window * 28;
      context.fillRect(x,54,10,5); context.fillRect(x,61,10,5);
    }
    context.fillStyle = '#ffe3b4'; context.fillRect(8,77,84,1); return;
  }
  if (id === 'canal-culture') {
    polygon(context,[[8,52],[20,41],[32,52],[32,72],[8,72]]);
    context.fillStyle = '#963b2d'; context.fillRect(15,59,10,13); context.fillStyle = '#ffe3b4';
    polygon(context,[[36,24],[41,20],[47,20],[50,24],[53,20],[59,20],[64,24],[61,33],[56,41],[51,54],[49,54],[44,41],[39,33]]);
    context.strokeStyle = '#ffe3b4'; context.lineWidth = 1.5; context.beginPath(); context.moveTo(50,51); context.lineTo(50,67); context.stroke();
    polygon(context,[[86,32],[87,62],[94,71],[66,71],[63,66],[70,61],[78,49]]);
    context.fillRect(8,77,86,1); context.fillRect(8,81,86,1); return;
  }
  if (id === 'shougang') {
    polygon(context,[[12,20],[38,20],[34,34],[32,47],[34,59],[43,72],[7,72],[16,59],[18,47],[16,34]]);
    context.fillStyle = '#963b2d'; context.beginPath(); context.ellipse(25,22,10,2,0,0,Math.PI*2); context.fill();
    context.strokeStyle = '#ffe3b4'; context.lineWidth = 4;
    context.beginPath(); context.moveTo(51,24); context.bezierCurveTo(56,44,61,61,75,62); context.bezierCurveTo(81,62,85,58,88,55); context.stroke();
    context.lineWidth = 1.5; context.beginPath(); context.moveTo(51,28); context.lineTo(51,74); context.moveTo(65,58); context.lineTo(65,74); context.stroke();
    context.fillStyle = '#ffe3b4'; context.fillRect(7,77,85,1); return;
  }
  if (id === 'lugou') {
    polygon(context,[[63,30],[69,23],[72,17],[85,17],[89,23],[95,30],[94,33],[63,33]]);
    context.fillRect(67,31,24,27); context.fillRect(8,53,52,19);
    context.fillStyle = '#963b2d';
    context.beginPath(); context.arc(79,48,4,Math.PI,Math.PI*2); context.fill(); context.fillRect(75,48,8,10);
    for (let arch: number = 0; arch < 4; arch += 1) {
      const x: number = 15 + arch * 13;
      context.beginPath(); context.arc(x,63,4,Math.PI,Math.PI*2); context.fill(); context.fillRect(x-4,63,8,9);
    }
    context.fillStyle = '#ffe3b4'; context.fillRect(8,77,52,1); context.fillRect(8,81,52,1); return;
  }
  if (id === 'qianmen') {
    context.beginPath(); context.moveTo(29,32); context.quadraticCurveTo(29,19,42,19); context.lineTo(58,19); context.quadraticCurveTo(71,19,71,32); context.lineTo(71,65); context.quadraticCurveTo(71,70,66,70); context.lineTo(34,70); context.quadraticCurveTo(29,70,29,65); context.closePath(); context.fill();
    context.fillStyle = '#963b2d';
    for (let column: number = 0; column < 3; column += 1) context.fillRect(33+column*12,30,10,18);
    context.beginPath(); context.arc(50,59,3.5,0,Math.PI*2); context.fill(); context.fillRect(33,65,34,2);
    context.strokeStyle = '#ffe3b4'; context.lineWidth = 2;
    context.beginPath(); context.moveTo(38,71); context.lineTo(32,81); context.moveTo(62,71); context.lineTo(68,81); context.stroke(); return;
  }
  if (id === 'olympic') {
    context.strokeStyle = '#ffe3b4'; context.lineWidth = 2;
    context.strokeRect(9,40,31,27);
    context.save(); context.beginPath(); context.rect(9,40,31,27); context.clip();
    [[14,43],[31,44],[17,60],[35,62]].forEach(([x,y]): void => { context.beginPath(); context.ellipse(x,y,11,9,.1,0,Math.PI*2); context.stroke(); }); context.restore();
    context.save(); context.beginPath(); context.ellipse(68,49,23,20,0,0,Math.PI*2); context.stroke(); context.clip();
    for (let step: number = -3; step < 6; step += 1) {
      context.beginPath(); context.moveTo(38+step*10,22); context.lineTo(68+step*10,76); context.stroke();
      context.beginPath(); context.moveTo(48+step*10,22); context.lineTo(18+step*10,76); context.stroke();
    }
    context.restore(); context.beginPath(); context.ellipse(68,35,16,5,0,0,Math.PI*2); context.fillStyle = '#963b2d'; context.fill(); context.stroke();
    context.fillStyle = '#ffe3b4'; context.fillRect(8,75,84,1); return;
  }
  if (id === 'hutong-lane') {
    context.fillRect(49,14,3,64);
    for (let row: number = 0; row < 8; row += 1) {
      const left: number = row % 3 === 2 ? 24 : row % 4 === 3 ? 19 : 15;
      const right: number = row % 2 === 1 ? 86 : 80;
      context.fillRect(left,20+row*7,50-left,2);
      context.fillRect(50,21+row*7,right-50,2);
    }
    return;
  }
  if (id === 'lama') {
    for (let column: number = 0; column < 6; column += 1) context.fillRect(24 + column * 10,58,3,15);
    context.fillRect(20,72,60,3);
    polygon(context,[[8,44],[16,48],[28,42],[35,35],[65,35],[72,42],[84,48],[92,44],[90,56],[80,62],[20,62],[10,56]]);
    const skylights: readonly (readonly [number,number,number])[] = [[20,30,10],[33,24,10],[45,13,15],[60,24,10],[73,30,10]];
    skylights.forEach(([x,y,height]): void => { polygon(context,[[x,y+height],[x+2,y+height*.45],[x,y+height*.3],[x+4,y+height*.18],[x+5,y],[x+6,y+height*.18],[x+10,y+height*.3],[x+8,y+height*.45],[x+10,y+height]]); });
    context.fillRect(14,78,72,1); context.fillRect(14,81,72,1); return;
  }
  if (id === 'bell-drum') {
    polygon(context, [[23,27],[29,27],[29,33],[36,38],[39,59],[44,65],[44,70],[8,70],[8,65],[13,59],[16,38],[23,33]]);
    context.strokeStyle = '#ffe3b4'; context.lineWidth = 5; context.strokeRect(53, 39, 30, 27); return;
  }
  if (id === 'summer') {
    context.fillRect(23,32,14,35);
    for (let tier: number = 0; tier < 3; tier += 1) {
      const left: number = 15 - tier * 4;
      polygon(context, [[left,35+tier*10],[24,24+tier*10],[36,24+tier*10],[60-left,35+tier*10],[56-left,39+tier*10],[left+4,39+tier*10]]);
    }
    context.fillRect(9,66,42,6);
    context.fillRect(62,43,7,29); context.fillRect(76,34,7,38); context.fillRect(87,53,6,19);
    context.fillRect(59,40,13,3); context.fillRect(73,31,13,3); context.fillRect(84,50,12,3);
    context.fillRect(8,75,86,1); return;
  }
  const tiers: number = id === 'temple-heaven' || id === 'yongding' ? 3 : 2;
  context.fillRect(23,40,54,34);
  for (let tier: number = 0; tier < tiers; tier += 1) {
    const left: number = 24 - tier * 6;
    polygon(context, [[left,35+tier*11],[45,20+tier*11],[55,20+tier*11],[100-left,35+tier*11],[100-left,39+tier*11],[left,39+tier*11]]);
  }
  context.fillRect(12,72,76,7);
  context.fillStyle = '#963b2d';
  if (id === 'archery-tower') {
    for (let row: number = 0; row < 3; row += 1) for (let col: number = 0; col < 6; col += 1) context.fillRect(27 + col*8, 46 + row*8, 3, 4);
  } else {
    for (let col: number = 0; col < 5; col += 1) context.fillRect(30 + col*9, 61, 4, 11);
  }
}

function drawInk(context: Context, leaf: HandbookLeaf, x: number, y: number, size: number): void {
  context.save(); context.translate(x+size/2,y+size/2); context.rotate(-.055); context.translate(-size/2,-size/2); context.scale(size/100,size/100);
  context.fillStyle = '#963b2d'; context.fillRect(0,0,100,100);
  context.strokeStyle = '#f2c28d'; context.lineWidth = 2; context.strokeRect(4,4,92,92); context.lineWidth = .7; context.strokeRect(7,7,86,86);
  context.fillStyle = '#ffe3b4'; context.textAlign = 'center';
  if (leaf.customInk) {
    inkSymbol(context,leaf.id); context.font = '11px serif'; context.fillStyle = '#ffe3b4';
    const labels: Readonly<Record<string,string>> = { daxing:'大興',longfu:'隆福',sanlitun:'三里屯','art-798':'798','canal-culture':'運河文苑',shougang:'首鋼',lugou:'盧溝宛平',qianmen:'前門',olympic:'雙奧','hutong-lane':'南鑼鼓巷',lama:'雍和宮',summer:'湖山雙園',square:'天安門','bell-drum':'鐘鼓樓','archery-tower':'正陽門','temple-heaven':'天壇',yongding:'永定門' };
    context.fillText(labels[leaf.id],50,89);
  } else {
    context.font = (leaf.name.length > 7 ? '11' : '15') + 'px serif';
    wrapText(context,leaf.name,50,leaf.name.length > 5 ? 40 : 55,78,21);
  }
  context.restore();
}

async function paintLeaf(surface: ExportSurface, book: CityHandbook, leaf: HandbookLeaf): Promise<void> {
  const { canvas, context } = surface;
  const art: WechatMiniprogram.Image = await loadArt(canvas,leaf.image);
  paper(context);
  context.fillStyle = '#897759'; context.font = '28px sans-serif'; context.fillText('大千小卷 / ' + book.cityName + '探索手册',110,130);
  if (leaf.fullArt) fullArt(context,art);
  else fitArt(context,art,110,190,1280,1010);
  context.fillStyle = '#494132'; context.font = '65px serif'; wrapText(context,leaf.name,110,1335,1220,85);
  context.font = '42px serif'; context.fillStyle = '#77664e'; wrapText(context,leaf.excerpt,110,1480,1210,75);
  if (leaf.inkArt) palaceInk(context,await loadArt(canvas,leaf.inkArt),1100,1760,230);
  else drawInk(context,leaf,1100,1760,230);
  context.fillStyle = '#8f795a'; context.font = '30px serif'; context.fillText('这一处，已在画卷中点亮',110,1845); context.fillText('一城慢慢看 · 一页慢慢记',110,1910);
  context.font = '24px sans-serif'; context.fillText('微信搜索「大千小卷」，展开你的城市画卷',110,2000);
}

async function saveSurface(surface: ExportSurface): Promise<string> {
  const { canvas } = surface;
  const result = await wx.canvasToTempFilePath({ canvas,width:canvas.width,height:canvas.height,destWidth:canvas.width,destHeight:canvas.height,fileType:'jpg',quality:1 });
  return result.tempFilePath;
}

export async function createHandbookCover(book: CityHandbook): Promise<string> {
  const surface: ExportSurface = await exportSurface(1500,2100);
  const { canvas,context } = surface;
  const art: WechatMiniprogram.Image = await loadArt(canvas,book.cover);
  paper(context);
  context.fillStyle = '#88765b'; context.font = '30px sans-serif'; context.fillText('大 千 小 卷  /  探 索 纪 念',110,135);
  context.fillStyle = '#3f3a2f'; context.font = '135px serif'; context.fillText(book.cityName,100,310);
  context.fillStyle = '#88765b'; context.font = '32px serif'; context.fillText(book.preview ? '我的西安试读纪念册' : '我的城市探索手册',110,385);
  fitArt(context,art,110,440,1280,890);
  context.fillStyle = '#536449'; context.font = '30px sans-serif'; context.fillText('已收录 ' + book.leaves.length + ' 枚印章' + (book.complete ? ' · 本城已集齐' : ''),110,1410);
  for (const [index,leaf] of book.leaves.slice(0,3).entries()) {
    const x: number = 170 + index*430;
    if (leaf.inkArt) palaceInk(context,await loadArt(canvas,leaf.inkArt),x,1460,230);
    else drawInk(context,leaf,x,1460,230);
    context.fillStyle = '#79674e'; context.font = '27px serif'; context.textAlign = 'center'; wrapText(context,leaf.name,x+115,1745,370,38); context.textAlign = 'left';
  }
  context.fillStyle = '#494132'; context.font = '43px serif'; wrapText(context,book.leaves[0]?.excerpt ?? book.sentence,110,1870,1250,62);
  context.fillStyle = '#88765b'; context.font = '25px sans-serif'; context.fillText('微信搜索「大千小卷」 · 每一枚印章，都有一段发现',110,2010);
  return saveSurface(surface);
}

export async function createHandbookLeaf(book: CityHandbook, leaf: HandbookLeaf): Promise<string> {
  const surface: ExportSurface = await exportSurface(1500,2100);
  await paintLeaf(surface,book,leaf);
  return saveSurface(surface);
}

export async function createHandbookStrip(book: CityHandbook, leaves: readonly HandbookLeaf[]): Promise<string> {
  if (leaves.length < 1 || leaves.length > 4) throw new RangeError('手册长图每段需包含1至4页');
  const surface: ExportSurface = await exportSurface(1200,leaves.length*1680);
  for (const [index,leaf] of leaves.entries()) {
    surface.context.save(); surface.context.translate(0,index*1680); surface.context.scale(.8,.8);
    await paintLeaf(surface,book,leaf); surface.context.restore();
  }
  return saveSurface(surface);
}
