import { loginCloud } from '../../../services/cloud-account';
Page({
  data: { busy: false, error: '' },
  async onLogin(): Promise<void> {
    if (this.data.busy) return;
    this.setData({ busy: true, error: '' });
    try { await loginCloud(); if (getCurrentPages().length > 1) wx.navigateBack({ delta: 1 }); else wx.switchTab({ url: '/pages/mine/mine' }); }
    catch (error) { console.error('微信登录失败', { error }); this.setData({ error: '登录未完成，请检查网络后重试' }); }
    finally { this.setData({ busy: false }); }
  },
});
