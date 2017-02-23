module.exports = {
  // source code with i18n locales
  srcDir: { type: 'string', default: null },

  // build code for i18n
  buildDir: { type: 'string', default: null },

  // for gulp.dest
  distDir: { type: 'string', default: null },

  // for gulp.src
  glob: { default: '*' },
  
  regDelimeter: { type: 'regexp', default: /_#(.*?)#_/g },

  regI18nContent: { type: 'regexp', default: /<i18n>([\s\S]*?)<\/i18n>/g },
  
  sourceLang: { type: 'string', default: '' },
  
  // the translation is English by default
  defaultLang: { type: 'string', default: '' },

  // do not translate into these languages
  excludeLangs: { type: 'array', default: [] },
  
  // set it to a falsy value if not needed
  saveLocalesTo: { type: 'string', default: 'locales.json' }
};
