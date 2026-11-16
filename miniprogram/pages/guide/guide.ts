// 首次领养引导页（选猫/狗 + 命名）
Page({
  data: {
    species: 'cat' as string,
    name: '' as string,
  },
  selectSpecies(e: WechatMiniprogram.TouchEvent): void {
    this.setData({ species: e.currentTarget.dataset.species });
  },
  onNameInput(e: WechatMiniprogram.Input): void {
    this.setData({ name: e.detail.value });
  },
  onConfirm(): void {
    const name = (this.data.name || '').trim() || (this.data.species === 'cat' ? '橘座' : '豆豆');
    const pet = {
      petId: 'pet_' + this.data.species + '_001',
      species: this.data.species,
      name,
      level: 1,
      intimacy: 0,
      mileage: 0,
      wardrobe: [] as string[],
      trips: [] as string[],
    };
    wx.setStorageSync('dqxj_pet', pet);
    const app = getApp() as unknown as { globalData: { pet: typeof pet } };
    app.globalData.pet = pet;
    wx.reLaunch({ url: '/pages/beijing/beijing' });
  },
});
