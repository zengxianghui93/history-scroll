import { initializeCloud, refreshCloud, showCloudError } from './services/cloud-account';
// 大千小卷 小程序入口
// 内容索引随包发布，插画从云存储读取，个人探索记录由云函数同步。
import cities from './data/cities';
import chapters from './data/chapters';


App({
  globalData: {
    pet: null as unknown as Record<string, unknown> | null,
    cities: null as unknown as unknown[] | null,
    chapters: null as unknown as unknown[] | null,
  },
  onLaunch(): void {
    initializeCloud();
    // 读取本地存储的萌宠
    let pet = wx.getStorageSync('dqxj_pet');

    // MVP 调试期：未领养则默认领养橘猫「橘橘」，直接进入首页。
    // 后续接入引导页时，改回 wx.redirectTo({ url: '/pages/guide/guide' })
    if (!pet) {
      pet = {
        petId: 'pet_cat_001',
        species: 'cat',
        name: '橘橘',
        level: 1,
        intimacy: 0,
        mileage: 0,
        wardrobe: [],
        trips: [],
      };
      wx.setStorageSync('dqxj_pet', pet);
    }

    this.globalData.pet = pet;

    // 加载本地数据
    this.globalData.cities = cities;
    this.globalData.chapters = chapters;
  },
  onShow(): void {
    refreshCloud().catch(showCloudError);
  },
});
