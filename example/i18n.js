var path = require('path'),
  i18n = require('../');

i18n({
  srcDir: path.join(__dirname, 'src'),
  buildDir: path.join(__dirname, 'dist/__build__'),
  distDir: path.join(__dirname, 'dist'),
  sourceLang: 'zh-cn',
  defaultLang: 'en',
  saveLocalesTo: path.join(__dirname, 'dist/locales.json')
});
