var path = require('path'),
  fs = require('fs-extra'),
  gulp = require('gulp'),
  debug = require('gulp-debug'),
  replace = require('gulp-replace'),
  object = require('sugar').Object,
  initConf = require('./conf/'),
  typeIs = require('./utils/type-is'),
  collectI18nFromDir = require('./collect-i18n-from-dir'),
  i18nContent2Locales = require('./i18n-content2locales');

/**
 * @param  {Object} customConf
 * @param  {Object} locales    # if provided, we don't need to extract locales any more
 */
module.exports = function (customConf, locales) {
  var conf = initConf(customConf);

  if (locales) {
    if (!typeIs.object(locales)) {
      console.log('[I18N Error] locales should be an object, not a path or something else');
      process.exit();
    }
  } else {
    var i18nContent = collectI18nFromDir(conf.srcDir, conf.regI18nContent, conf.defaultLang);
    locales = i18nContent2Locales(i18nContent, conf.sourceLang);

    if (conf.saveLocalesTo) {
      fs.outputJson(conf.saveLocalesTo, { i18nContent: i18nContent, locales: locales });
    }
  }

  var langs = object.keys(locales);
  langs.forEach(function (lang) {
    var targetDir = path.join(conf.distDir, lang);
    fs.copySync(conf.buildDir, targetDir);

    gulp.src(conf.glob, { cwd: targetDir })
      .pipe(debug({ title: '[I18N Translating ' + lang + '] ' }))
      .pipe(replace(conf.regDelimeter, function (match, target) {
        // no need to translate, just trim the delimeters
        if (lang === conf.sourceLang) return target;
        
        var translation = locales[lang][target];
        return typeIs.undefined(translation) ?
          console.log('>>>>>>>>>> Missing', lang, 'translation of', '[', match, ']\n') || target
          : translation;
      }))
      .pipe(gulp.dest(targetDir))
      .on('end', function () {
        console.log('[I18N finished', lang + ']');
      });
  });
};
