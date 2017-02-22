module.exports = {
  srcDir: { type: 'string', default: null }, // source code with i18n locales
  buildDir: { type: 'string', default: null }, // build code for i18n
  distDir: { type: 'string', default: null }, // for gulp.dest
  glob: { default: '*' }, // for gulp.src
  regDelimeter: { type: 'regexp', default: /_#(.*?)#_/g },
  regI18nContent: { type: 'regexp', default: /<i18n>([\s\S]*?)<\/i18n>/g },
  sourceLang: { type: 'string', default: 'zh-cn' },
  defaultLang: { type: 'string', default: 'en' }, // the translation is English by default
  saveLocalesTo: { type: 'string', default: 'locales.json' } // set it to a falsy value if not needed
};
