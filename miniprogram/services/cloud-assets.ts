const cloudAssetRoot: string = 'cloud://cloud1-d7gp1zt48d1eda997.636c-cloud1-d7gp1zt48d1eda997-1307123389/cloud-assets';
const assetPaths: Readonly<Record<string, string>> = {
  "/images/beijing/daxing-radial-terminal.jpg": "cities/beijing/landmarks/daxing-radial-terminal.jpg",
  "/images/beijing/longfu-rooftop.jpg": "cities/beijing/landmarks/longfu-rooftop.jpg",
  "/images/beijing/sanlitun-open-lanes.jpg": "cities/beijing/landmarks/sanlitun-open-lanes.jpg",
  "/images/beijing/art-798-skylight.jpg": "cities/beijing/landmarks/art-798-skylight.jpg",
  "/images/beijing/canal-cultural-trio.jpg": "cities/beijing/landmarks/canal-cultural-trio.jpg",
  "/images/beijing/shougang-cooling-towers.jpg": "cities/beijing/landmarks/shougang-cooling-towers.jpg",
  "/images/beijing/lugou-wanping.jpg": "cities/beijing/landmarks/lugou-wanping.jpg",
  "/images/beijing/qianmen-tram.jpg": "cities/beijing/landmarks/qianmen-tram.jpg",
  "/images/beijing/olympic-round-square.jpg": "cities/beijing/landmarks/olympic-round-square.jpg",
  "/images/beijing/nanluogu-fishbone.jpg": "cities/beijing/landmarks/nanluogu-fishbone.jpg",
  "/images/beijing/lama-bracelet.jpg": "cities/beijing/landmarks/lama-bracelet.jpg",
  "/images/beijing/imperial-gardens-comparison.jpg": "cities/beijing/landmarks/imperial-gardens-comparison.jpg",
  "/images/beijing/yongding-axis.jpg": "cities/beijing/landmarks/yongding-axis.jpg",
  "/images/beijing/temple-heaven-comparison.jpg": "cities/beijing/landmarks/temple-heaven-comparison.jpg",
  "/images/beijing/archery-windows.jpg": "cities/beijing/landmarks/archery-windows.jpg",
  "/images/beijing/beijing-map.jpg": "cities/beijing/scrolls/beijing-map.jpg",
  "/images/beijing/birds-nest.jpg": "cities/beijing/landmarks/birds-nest.jpg",
  "/images/beijing/national-theatre.jpg": "cities/beijing/landmarks/national-theatre.jpg",
  "/images/beijing/palace-ridge-beasts.jpg": "cities/beijing/landmarks/palace-ridge-beasts.jpg",
  "/images/beijing/palace-seal-blank.jpg": "cities/beijing/stamps/palace-seal-blank.jpg",
  "/images/beijing/palace-seal-reveal.jpg": "cities/beijing/stamps/palace-seal-reveal.jpg",
  "/images/beijing/scroll-axis.jpg": "cities/beijing/scrolls/scroll-axis.jpg",
  "/images/beijing/scroll-heritage.jpg": "cities/beijing/scrolls/scroll-heritage.jpg",
  "/images/beijing/scroll-modern.jpg": "cities/beijing/scrolls/scroll-modern.jpg",
  "/images/beijing/summer-palace-landscape.jpg": "cities/beijing/landmarks/summer-palace-landscape.jpg",
  "/images/beijing/temple-heaven.jpg": "cities/beijing/landmarks/temple-heaven.jpg",
  "/images/beijing/water-cube-ice-cutaway.jpg": "cities/beijing/landmarks/water-cube-ice-cutaway.jpg",
  "/images/beijing/water-cube.jpg": "cities/beijing/landmarks/water-cube.jpg",
  "/images/covers/cover_beijing.jpg": "shared/covers/cover_beijing.jpg",
  "/images/covers/cover_chengdu.jpg": "shared/covers/cover_chengdu.jpg",
  "/images/covers/cover_hangzhou.jpg": "shared/covers/cover_hangzhou.jpg",
  "/images/covers/cover_harbin.jpg": "shared/covers/cover_harbin.jpg",
  "/images/covers/cover_xian.jpg": "shared/covers/cover_xian.jpg",
  "/xian/images/ancient-axis.jpg": "cities/xian/scrolls/ancient-axis.jpg",
  "/xian/images/market.jpg": "cities/xian/scrolls/market.jpg",
  "/xian/images/qin.jpg": "cities/xian/scrolls/qin.jpg",
  "/xian/images/yanta.jpg": "cities/xian/scrolls/yanta.jpg"
};

/** 资源键保持稳定，图片按城市和用途存放在云目录中。 */
export function cloudAsset(path: string): string {
  const assetPath: string | undefined = assetPaths[path];
  if (!assetPath) throw new RangeError('云插画资源未登记：' + path);
  return cloudAssetRoot + '/' + assetPath;
}
