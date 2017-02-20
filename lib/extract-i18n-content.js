var readFileSync = require('fs').readFileSync,
  str2obj = require('./utils/str2obj'),
  mergeObj = require('./utils/merge-obj');

/**
 * @param  {String} pathToFile
 * @return {Object} i18n content
 */
var extractI18nContent = (function (regI18n) {
  regI18n = regI18n || /<i18n>([\s\S]*?)<\/i18n>/g; // match i18n content
  var regLineBreaks = /(\r\n|\n|\r)/gm; // match line breaks for all OS

  return function (pathToFile) {
    var origContent = readFileSync(pathToFile, 'utf-8'),
      i18nContent = {}, re;

    while (re = regI18n.exec(origContent)) {
      mergeObj(i18nContent, str2obj(re[1].replace(regLineBreaks, '')));
    }

    return i18nContent;
  };
})();

module.exports = extractI18nContent;

/* e.g.
--------------------------- Filename: test.js -------------------------------

// <i18n>{ '你好': { 'en': 'Hello', 'jp': 'こんにちは', 'fr': 'Bonjour' } }</i18n>
console.log('_#你好#_');

// <i18n>{ '热爱': { 'en': 'Love', 'jp': '熱愛', 'fr': 'Aimer' } }</i18n>
alert('_#热爱#_');

-----------------------------------------------------------------------------

var i18nContent = extractI18nContent('./test.js');
console.log(i18nContent);

{
  '你好': { 'en': 'Hello', 'jp': 'こんにちは', 'fr': 'Bonjour' },
  '热爱': { 'en': 'Love', 'jp': '熱愛', 'fr': 'Aimer' } }
}
 */
