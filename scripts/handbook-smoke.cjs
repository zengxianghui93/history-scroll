// 执行正式探索手册导出函数，以真实插画和 Canvas 2D 渲染检查封面、单页及分段长图。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const ts = require('typescript');
const { createCanvas, Image, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'artwork/cloud-assets-manifest.json'), 'utf8'));
let output;
let expectedHeight;
let expectedWidth;
const fontDirectory = path.join(process.env.WINDIR, 'Fonts');
assert.ok(GlobalFonts.registerFromPath(path.join(fontDirectory, 'simsun.ttc'), 'serif'), '中文衬线字体可用');
assert.ok(GlobalFonts.registerFromPath(path.join(fontDirectory, 'msyh.ttc'), 'sans-serif'), '中文界面字体可用');
const canvas = createCanvas(1500, 2100);
canvas.createImage = () => new Image();
let exported = 0;
const modules = new Map();
const context = vm.createContext({ console, wx: {
  getStorageSync: () => '',
  createSelectorQuery: () => ({ select: () => ({ fields: () => ({ exec: (callback) => callback([{ node: canvas }]) }) }) }),
  cloud: { downloadFile: async ({ fileID }) => {
    const asset = manifest.find((entry) => fileID.endsWith('/cloud-assets/' + entry.path));
    assert.ok(asset, '下载正式登记的插画');
    return { tempFilePath: path.join(root, 'artwork/cloud-assets', asset.path) };
  } },
  canvasToTempFilePath: async (options) => {
    assert.equal(options.destWidth, expectedWidth); assert.equal(options.destHeight, expectedHeight);
    fs.writeFileSync(output, options.canvas.toBuffer('image/jpeg', 95)); exported += 1;
    return { tempFilePath: output };
  },
} });
function load(filename) {
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = { exports: {} }; modules.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const execute = vm.runInContext('(function(require,module,exports){' + code + '\n})', context, { filename });
  execute((request) => load(path.resolve(path.dirname(filename), request + '.ts')), module, module.exports);
  return module.exports;
}
(async () => {
  const renderer = load(path.join(root, 'miniprogram/memories/services/handbook-export.ts'));
  const model = load(path.join(root, 'miniprogram/memories/data/handbook.ts'));
  const beijing = model.buildHandbook('city_beijing', ['palace', 'summer', 'square', 'bell-drum', 'archery-tower']);
  const xian = model.buildHandbook('city_xian', ['yongning-gate']);
  async function verify(name, width, height, draw) {
    output = path.join(os.tmpdir(), 'history-scroll-handbook-' + name + '.jpg');
    expectedWidth = width; expectedHeight = height;
    const result = await draw();
    assert.equal(result, output);
    const image = await loadImage(result);
    assert.equal(image.width, width); assert.equal(image.height, height);
    console.log('预览：' + output);
  }
  await verify('cover', 1500, 2100, () => renderer.createHandbookCover(beijing));
  await verify('leaf', 1500, 2100, () => renderer.createHandbookLeaf(beijing, beijing.leaves[1]));
  await verify('strip', 1200, 6720, () => renderer.createHandbookStrip(beijing, beijing.leaves.slice(0,4)));
  await verify('last-strip', 1200, 1680, () => renderer.createHandbookStrip(beijing, beijing.leaves.slice(4)));
  await verify('xian', 1500, 2100, () => renderer.createHandbookCover(xian));
  const lama = model.buildHandbook('city_beijing', ['lama']);
  await verify('lama', 1500, 2100, () => renderer.createHandbookLeaf(lama, lama.leaves[0]));
  await verify('lama-cover', 1500, 2100, () => renderer.createHandbookCover(lama));
  const nanluogu = model.buildHandbook('city_beijing', ['hutong-lane']);
  await verify('nanluogu', 1500, 2100, () => renderer.createHandbookLeaf(nanluogu, nanluogu.leaves[0]));
  await verify('nanluogu-cover', 1500, 2100, () => renderer.createHandbookCover(nanluogu));
  const olympic = model.buildHandbook('city_beijing', ['olympic']);
  await verify('olympic', 1500, 2100, () => renderer.createHandbookLeaf(olympic, olympic.leaves[0]));
  await verify('olympic-cover', 1500, 2100, () => renderer.createHandbookCover(olympic));
  const qianmen = model.buildHandbook('city_beijing', ['qianmen']);
  await verify('qianmen', 1500, 2100, () => renderer.createHandbookLeaf(qianmen, qianmen.leaves[0]));
  await verify('qianmen-cover', 1500, 2100, () => renderer.createHandbookCover(qianmen));
  const lugou = model.buildHandbook('city_beijing', ['lugou']);
  await verify('lugou', 1500, 2100, () => renderer.createHandbookLeaf(lugou, lugou.leaves[0]));
  await verify('lugou-cover', 1500, 2100, () => renderer.createHandbookCover(lugou));
  const shougang = model.buildHandbook('city_beijing', ['shougang']);
  await verify('shougang', 1500, 2100, () => renderer.createHandbookLeaf(shougang, shougang.leaves[0]));
  await verify('shougang-cover', 1500, 2100, () => renderer.createHandbookCover(shougang));
  const canal = model.buildHandbook('city_beijing', ['canal-culture']);
  await verify('canal', 1500, 2100, () => renderer.createHandbookLeaf(canal, canal.leaves[0]));
  await verify('canal-cover', 1500, 2100, () => renderer.createHandbookCover(canal));
  const art798 = model.buildHandbook('city_beijing', ['art-798']);
  await verify('art798', 1500, 2100, () => renderer.createHandbookLeaf(art798, art798.leaves[0]));
  await verify('art798-cover', 1500, 2100, () => renderer.createHandbookCover(art798));
  const sanlitun = model.buildHandbook('city_beijing', ['sanlitun']);
  await verify('sanlitun', 1500, 2100, () => renderer.createHandbookLeaf(sanlitun, sanlitun.leaves[0]));
  await verify('sanlitun-cover', 1500, 2100, () => renderer.createHandbookCover(sanlitun));
  const longfu = model.buildHandbook('city_beijing', ['longfu']);
  await verify('longfu', 1500, 2100, () => renderer.createHandbookLeaf(longfu, longfu.leaves[0]));
  await verify('longfu-cover', 1500, 2100, () => renderer.createHandbookCover(longfu));
  const daxing = model.buildHandbook('city_beijing', ['daxing']);
  await verify('daxing', 1500, 2100, () => renderer.createHandbookLeaf(daxing, daxing.leaves[0]));
  await verify('daxing-cover', 1500, 2100, () => renderer.createHandbookCover(daxing));
  assert.equal(exported, 27);
  await assert.rejects(renderer.createHandbookStrip(beijing, []), /1至4页/);
  console.log('通过：正式手册导出函数、北京西安真实插画、封面、单页、四页长图与末段输出。');
})().catch((error) => { console.error(error); process.exitCode = 1; });
