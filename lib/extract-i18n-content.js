var readFileSync = require('fs').readFileSync,
  str2obj = require('./utils/str2obj'),
  mergeObj = require('./utils/merge-obj');

/**
 * Extract i18n content from the file of the giving path
 * @param  {String} pathToFile
 * @return {Object} i18n content
 */
// regI18nContent is /<i18n>([\s\S]*?)<\/i18n>/g by default
module.exports = function (regI18nContent) {
  var regLineBreaks = /(\r\n|\n|\r)/gm; // match line breaks
  return function extractI18nContent(pathToFile) {
    var origContent = readFileSync(pathToFile, 'utf-8'),
      i18nContent = {}, re;

    while (re = regI18nContent.exec(origContent)) {
      mergeObj(i18nContent, str2obj(re[1].replace(regLineBreaks, '')));
    }

    return i18nContent;
  };
};

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
