const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let sequence = 0;

// 云 SDK 的进程边界适配器，直接执行已编译的云函数，不触碰真实用户存档。
exports.createCloudHarness = (getTime) => {
  let identity = 'integration-' + (++sequence);
  let backend = { documents: new Map(), serial: Promise.resolve() };
  let failures = 0;
  const sdk = {
    init: () => {},
    getWXContext: () => ({ OPENID: identity, APPID: 'wx774e5ffb511e5548' }),
    database: () => ({
      collection: () => ({ limit: () => ({ get: async () => ({ data: [] }) }) }),
      runTransaction: (callback) => {
        const task = backend.serial.then(() => callback({ collection: () => ({ doc: (id) => ({
          get: async () => ({ data: backend.documents.has(id) ? structuredClone({ ...backend.documents.get(id), _id: id }) : null }),
          set: async ({ data }) => { if ('_id' in data) throw new Error('database: _id cannot be set'); backend.documents.set(id, structuredClone(data)); },
        }) }) }));
        backend.serial = task.catch(() => {});
        return task;
      },
    }),
  };
  const filename = path.resolve(__dirname, '../cloudfunctions/exploration/index.js');
  const module = { exports: {} };
  const context = vm.createContext({ console, Date: class extends Date { static now() { return getTime(); } } });
  const compiled = vm.runInContext('(function(require,module,exports){' + fs.readFileSync(filename, 'utf8') + '\n})', context);
  compiled((name) => name === 'wx-server-sdk' ? sdk : name === './catalog.json' ? require('../cloudfunctions/exploration/catalog.json') : require(name), module, module.exports);
  return {
    invoke: async ({ data }) => {
      if (failures > 0) { failures -= 1; throw new Error('integration: network unavailable'); }
      return { result: structuredClone(await module.exports.main(structuredClone(data))) };
    },
    rejectCalls: (count) => { failures = count; },
    copyFrom: (other) => { identity = other.identity(); backend = other.backend(); },
    identity: () => identity,
    documents: () => backend.documents,
    backend: () => backend,
  };
};
