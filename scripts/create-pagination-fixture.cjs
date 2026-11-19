const fs=require('node:fs');
const {zipSync,strToU8}=require('fflate');
const files={
 'mimetype':strToU8('application/epub+zip'),
 'META-INF/container.xml':strToU8('<container><rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>'),
 'OPS/book.opf':strToU8('<package><metadata><title>从一页开始：图文排版体验</title><creator>大千小卷</creator></metadata><manifest><item id="one" href="one.xhtml" media-type="application/xhtml+xml"/><item id="two" href="two.xhtml" media-type="application/xhtml+xml"/><item id="art" href="art.jpg" media-type="image/jpeg"/></manifest><spine><itemref idref="one"/><itemref idref="two"/></spine></package>'),
 'OPS/one.xhtml':strToU8('<html><body><h1>第一章　给自己留一页</h1><p>'+('今天不必读完整本书。坐下来，翻开一页，读清一句话，然后让它在心里停留一会儿。'.repeat(35))+'</p><p>'+('Read a little, pause for a moment, and carry one thought into your day. '.repeat(30))+'</p><p>下面是一张书内插画，翻过它，正文还会继续。</p><img src="art.jpg"/><p>插画之后的文字：阅读不是一次冲刺，留下的痕迹会陪你走得更远。</p></body></html>'),
 'OPS/two.xhtml':strToU8('<html><body><h1>第二章　回来接着读</h1><p>这一章用来确认跨章翻页和返回定位。调整字号，再关闭页面重新打开，看看是否仍在刚才那段文字附近。</p><p>'+('每一次回来，都可以从一小段开始。'.repeat(100))+'</p><p>全文结束。这是为排版体验创作的原创样书。</p></body></html>'),
 'OPS/art.jpg':new Uint8Array(fs.readFileSync('miniprogram/images/reading/cover.jpg'))
};
fs.writeFileSync('scripts/fixtures/图文排版体验.epub',zipSync(files));
