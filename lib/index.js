var path = require('path'),
  fs = require('fs-extra'),
  gulp = require('gulp'),
  debug = require('gulp-debug'),
  replace = require('gulp-replace'),
  object = require('sugar').Object,
  is = require('./utils/typeof'),
  mapObjValProperty = require('./utils/map-obj-val-property'),
  collectI18nFromDir = require('./collect-i18n-from-dir'),
  i18nContent2Locales = require('./i18n-content2locales'),
  DEFAULT_CONFIG = require('./DEFAULT_CONFIG');

module.exports = function (config) {
  // merge options
  var conf = object.add(mapObjValProperty(DEFAULT_CONFIG, 'default'), config);

  // type check
  object.keys(conf).forEach(function (field) {
    var type = DEFAULT_CONFIG[field].type,
      val = conf[field];
    
    if (type && !is[type](val) || !val) {
      console.log('[I18N Error]', field, 'should be a', type, 'and not empty');
      process.exit();
    }
  });

  // i18n
  var i18nContent = collectI18nFromDir(conf.srcDir, conf.regI18nContent),
    locales = i18nContent2Locales(i18nContent, conf.sourceLang, conf.defaultLang),
    langs = object.keys(locales);

  langs.forEach(function (lang) {
    var targetDir = path.join(conf.distDir, lang);
    fs.copySync(conf.buildDir, targetDir);

    gulp.src(conf.glob, { cwd: targetDir })
      .pipe(debug({ title: '[I18N Translating ' + lang + '] ' }))
      .pipe(replace(conf.regDelimeter, function (match, target) {
        // no need to translate, just trim the delimeters
        if (lang === conf.sourceLang) return target;
        
        var translation = locales[lang][target];
        return is.undefined(translation) ?
          console.log('\n>>>>>>>>>>', match, 'is not translated\n') || target : translation;
      }))
      .pipe(gulp.dest(targetDir));
  });
};
