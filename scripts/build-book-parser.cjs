const esbuild = require('esbuild');
esbuild.buildSync({ entryPoints:['scripts/book-parser-entry.cjs'],bundle:true,platform:'browser',format:'cjs',target:'es2020',outfile:'miniprogram/reading/parser.js',minify:true,legalComments:'eof' });

