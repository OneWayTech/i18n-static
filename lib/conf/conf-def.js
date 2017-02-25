module.exports = {
  // if provided, we don't need to extract locales from srcDir any more
  locales: { type: 'string|object', default: null, required: false },

  // source code with i18n content, it's required if locales is missing
  srcDir: { type: 'string', default: null, required: '!locales' },

  // build code dir for i18n
  buildDir: { type: 'string', default: null, required: true },

  // for gulp.dest
  distDir: { type: 'string', default: null, required: true },

  // for gulp.src of buildDir (not srcDir), as it's unnecessary to translate vendor files
  glob: { type: 'string|array', default: '*', required: true },
  
  // don't forget the `g` flag
  regDelimeter: { type: 'regexp', default: /_#(.*?)#_/g, required: true },

  regI18nContent: { type: 'regexp', default: /<i18n>([\s\S]*?)<\/i18n>/g, required: true },
  
  // your mother tongue
  sourceLang: { type: 'string', default: null, required: true },
  
  // defualt language to translate into
  defaultLang: { type: 'string', default: null, required: true },

  // do not translate into these languages
  excludeLangs: { type: 'array', default: [], required: false },
  
  // set it to a falsy value if not needed
  saveI18nContentTo: { type: 'string|boolean|null|undefined', default: null, required: false },

  // if the translations do not change frequently, you can save locales to speed up i18n process
  saveLocalesTo: { type: 'string|boolean|null|undefined', default: null, required: false }
};
