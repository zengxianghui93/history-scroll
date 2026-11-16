"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const wx_server_sdk_1 = __importDefault(require("wx-server-sdk"));
const crypto_1 = require("crypto");
wx_server_sdk_1.default.init({ env: 'cloud1-d7gp1zt48d1eda997' });
const options = { env: 'cloud1-d7gp1zt48d1eda997', throwOnNotFound: false };
const database = wx_server_sdk_1.default.database(options);
const collection = 'explorers';
const cityCatalog = require('./catalog.json');
const progressKeys = [
    'dqxj_lit_city_beijing', 'dqxj_lit_city_xian', 'dqxj_collected_cities', 'dqxj_collected',
    'dqxj_timeline', 'dqxj_checkins', 'dqxj_seen_beijing', 'dqxj_seen_beijing_more',
    'dqxj_beijing_journey', 'dqxj_discovery_beijing_axis', 'dqxj_beijing_briefs_read',
    'dqxj_active_scroll_city', 'dqxj_last_scroll_city_beijing', 'dqxj_last_scroll_city_xian',
];
function validStamp(stamp) {
    if (typeof stamp !== 'string')
        return false;
    const [cityId, landmarkId] = stamp.split('/');
    const city = cityCatalog[cityId];
    return stamp.split('/').length === 2 && !!city && [...city.landmarks, ...city.legacyLandmarks].includes(landmarkId);
}
function reachedMilestone(ledger, cityId) {
    const landmarks = cityCatalog[cityId].landmarks;
    const count = landmarks.filter((id) => ledger.stamps.includes(cityId + '/' + id)).length;
    return landmarks.length > 0 && count >= Math.ceil(landmarks.length * 0.5);
}
function newExplorer(event, now) {
    const old = event.legacy?.ledger;
    const stamps = [...(old?.stamps ?? []), ...(event.legacy?.stamps ?? [])].filter(validStamp);
    const progress = Object.fromEntries(Object.entries(event.legacy?.progress ?? {}).filter(([key]) => progressKeys.includes(key)));
    // 旧额度字段原样保留用于兼容，新的盖章流程不再发放或扣减额度。
    return { ledger: { ...old, stamps: [...new Set(stamps)] }, progress, createdAt: now, updatedAt: now };
}
function mergeValue(current, before, value) {
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        const removed = Array.isArray(before) ? before.filter((item) => !value.includes(item)) : [];
        const added = value.filter((item) => !Array.isArray(before) || !before.includes(item));
        const present = Array.isArray(current) ? current : [];
        return [...new Set([...present.filter((item) => !removed.includes(item)), ...added])];
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const base = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
        const previous = before && typeof before === 'object' && !Array.isArray(before) ? before : {};
        return Object.fromEntries(Object.entries(value).map(([key, next]) => [key, mergeValue(base[key], previous[key], next)]));
    }
    return value;
}
/** 合并旧设备的收藏和阅读记录，云端已有的续逛位置优先保留。 */
function mergeLegacy(current, incoming) {
    if (Array.isArray(incoming)) {
        const present = Array.isArray(current) ? current : [];
        return [...present, ...incoming.filter((item) => !present.some((saved) => {
                if (typeof saved === 'object' && saved && !Array.isArray(saved) && typeof item === 'object' && item && !Array.isArray(item)) {
                    return saved.id !== undefined && saved.id === item.id;
                }
                return JSON.stringify(saved) === JSON.stringify(item);
            }))];
    }
    if (incoming && typeof incoming === 'object') {
        const present = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
        return { ...incoming, ...present, ...Object.fromEntries(Object.entries(incoming).map(([key, value]) => [key, mergeLegacy(present[key], value)])) };
    }
    if (typeof incoming === 'boolean' && typeof current === 'boolean')
        return incoming || current;
    if (typeof incoming === 'number' && typeof current === 'number')
        return Math.max(incoming, current);
    return current === undefined ? incoming : current;
}
function migrateExplorer(explorer, legacy) {
    if (!legacy || explorer.migrationBackups?.[legacy.id])
        return explorer;
    const imported = newExplorer({ action: 'login', legacy }, explorer.createdAt);
    const progress = { ...explorer.progress, ...Object.fromEntries(Object.entries(imported.progress).map(([key, value]) => [key, mergeLegacy(explorer.progress[key], value)])) };
    const ledger = { ...explorer.ledger, stamps: [...new Set([...explorer.ledger.stamps, ...imported.ledger.stamps])] };
    return { ...explorer, ledger, progress, migrationBackups: { ...explorer.migrationBackups, [legacy.id]: legacy } };
}
async function main(event) {
    const context = wx_server_sdk_1.default.getWXContext();
    if (!context.OPENID || context.APPID !== 'wx774e5ffb511e5548')
        return { ok: false, code: 'UNAUTHORIZED' };
    if (!['login', 'snapshot', 'stamp', 'progress'].includes(event.action))
        return { ok: false, code: 'INVALID_ACTION' };
    if (event.legacy && (event.action !== 'login' || typeof event.legacy.id !== 'string' || !/^[a-z0-9-]{8,80}$/.test(event.legacy.id) || JSON.stringify(event.legacy).length > 120000))
        return { ok: false, code: 'INVALID_MIGRATION' };
    const userId = (0, crypto_1.createHash)('sha256').update(context.APPID + ':' + context.OPENID).digest('hex');
    const now = Date.now();
    return database.runTransaction(async (transaction) => {
        const document = transaction.collection(collection).doc(userId);
        const { data } = await document.get();
        if (!data && event.action !== 'login')
            return { ok: false, code: 'LOGIN_REQUIRED' };
        const base = data ?? newExplorer(event, now);
        const explorer = event.action === 'login' ? migrateExplorer(base, event.legacy) : base;
        let ledger = explorer.ledger;
        let passedHalf = false;
        const rewardCities = [...(explorer.rewardCities ?? [])];
        Object.keys(cityCatalog).forEach((cityId) => {
            if (reachedMilestone(ledger, cityId) && !rewardCities.includes(cityId))
                rewardCities.push(cityId);
        });
        let status = '';
        if (event.action === 'stamp') {
            const stamp = event.cityId + '/' + event.landmarkId;
            if (!validStamp(stamp))
                return { ok: false, code: 'INVALID_LANDMARK' };
            status = ledger.stamps.includes(stamp) ? 'already-stamped' : 'earned';
            if (status === 'earned') {
                ledger = { ...ledger, stamps: [...ledger.stamps, stamp] };
                const cityId = event.cityId;
                passedHalf = reachedMilestone(ledger, cityId) && !rewardCities.includes(cityId);
                if (passedHalf)
                    rewardCities.push(cityId);
            }
        }
        let progress = explorer.progress;
        if (event.action === 'progress') {
            if (!event.key || !progressKeys.includes(event.key) || event.value === undefined)
                return { ok: false, code: 'INVALID_PROGRESS' };
            if (JSON.stringify(event.value).length > 100000)
                return { ok: false, code: 'PROGRESS_TOO_LARGE' };
            progress = { ...progress, [event.key]: mergeValue(progress[event.key], event.before, event.value) };
        }
        const updated = { ledger, progress, rewardCities, createdAt: explorer.createdAt, updatedAt: now,
            revision: (explorer.revision ?? 0) + 1, ...(explorer.migrationBackups ? { migrationBackups: explorer.migrationBackups } : {}) };
        await document.set({ data: updated });
        return { ok: true, userId, ledger, progress, rewardCities, status, passedHalf, revision: updated.revision };
    }, 5);
}
