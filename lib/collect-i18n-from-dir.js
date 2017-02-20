var recursiveReadSync = require('recursive-readdir-sync'),
  extractI18nContent = require('./extract-i18n-content'),
  mergeObj = require('./utils/merge-obj');

module.exports = function (baseDir) {
  var files = recursiveReadSync(baseDir),
    i18nContent = {};

  files.forEach(function (pathToFile, idx) {
    console.log(
      '[I18N Extracting (' + (idx + 1) + '/' + files.length + ')]',
      pathToFile
    );
    mergeObj(i18nContent, extractI18nContent(pathToFile));
  });

  return i18nContent;
};
