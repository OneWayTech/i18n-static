var path = require('path'),
  fs = require('fs-extra'),
  gulp = require('gulp'),
  debug = require('gulp-debug'),
  replace = require('gulp-replace'),
  object = require('sugar').Object,
  initConf = require('./conf/'),
  isUndefined = require('./utils/typeof').undefined,
  collectI18nFromDir = require('./collect-i18n-from-dir'),
  i18nContent2Locales = require('./i18n-content2locales');

module.exports = function (customConf) {
  var conf = initConf(customConf),
    i18nContent = collectI18nFromDir(conf.srcDir, conf.regI18nContent, conf.defaultLang),
    locales = i18nContent2Locales(i18nContent, conf.sourceLang, conf.defaultLang),
    langs = object.keys(locales);

  if (conf.saveLocalesTo) fs.outputJson(conf.saveLocalesTo, {
    i18nContent: i18nContent, locales: locales
  });

  langs.forEach(function (lang) {
    var targetDir = path.join(conf.distDir, lang);
    fs.copySync(conf.buildDir, targetDir);

    gulp.src(conf.glob, { cwd: targetDir })
      .pipe(debug({ title: '[I18N Translating ' + lang + '] ' }))
      .pipe(replace(conf.regDelimeter, function (match, target) {
        // no need to translate, just trim the delimeters
        if (lang === conf.sourceLang) return target;
        
        var translation = locales[lang][target];
        return isUndefined(translation)
          ? console.log('>>>>>>>>>> [', match, '] is not translated\n') || target
          : translation;
      }))
      .pipe(gulp.dest(targetDir));
  });
};
