// 云端地标目录从已上线城市注册表构建，进度分母与小程序保持一致。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const modules = new Map();
const context = vm.createContext({});
function load(filename) {
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = { exports: {} }; modules.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const execute = vm.runInContext('(function(require,module,exports){' + code + '\n})', context, { filename });
  execute((request) => load(path.resolve(path.dirname(filename), request + '.ts')), module, module.exports);
  return module.exports;
}
const { publishedCityScrolls } = load(path.join(root, 'miniprogram/data/city-scrolls.ts'));
const catalog = Object.fromEntries(publishedCityScrolls.map((city) => {
  const landmarks = city.stampSections.flatMap((section) => section.landmarks.map((landmark) => landmark.id));
  const legacyLandmarks = city.pastStamps.map((landmark) => landmark.id);
  assert.equal(new Set(landmarks).size, landmarks.length, '正式地标不能重复：' + city.id);
  assert.ok(legacyLandmarks.every((id) => !landmarks.includes(id)), '历史印章不计入正式地标：' + city.id);
  return [city.id, { landmarks, legacyLandmarks }];
}));
fs.writeFileSync(path.join(root, 'cloudfunctions/exploration/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
