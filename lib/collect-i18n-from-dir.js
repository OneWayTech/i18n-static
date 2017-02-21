var recursiveReadSync = require('recursive-readdir-sync'),
  mergeObj = require('./utils/merge-obj');

module.exports = function (baseDir, regI18nContent) {
  var extractI18nContent = require('./extract-i18n-content')(regI18nContent),
    files = recursiveReadSync(baseDir),
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
