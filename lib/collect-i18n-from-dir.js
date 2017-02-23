var recursiveReadSync = require('recursive-readdir-sync'),
  mergeObj = require('./utils/merge-obj');

/**
 * @param  {String} baseDir
 * @param  {Regexp} regI18nContent
 * @param  {String} defaultLang
 * @return {Object}
 */
module.exports = function (baseDir, regI18nContent, defaultLang) {
  var extractI18nContent = require('./extract-i18n-content')(regI18nContent, defaultLang),
    files = recursiveReadSync(baseDir),
    i18nContent = {};

  files.forEach(function (pathToFile, idx) {
    console.log(
      '[I18N extracting (' + (idx + 1) + '/' + files.length + ')]',
      pathToFile
    );
    mergeObj(i18nContent, extractI18nContent(pathToFile));
  });

  return i18nContent;
};
