var readFileSync = require('fs').readFileSync,
  object = require('sugar').Object,
  typeIs = require('./utils/type-is'),
  objGen = require('./utils/obj-gen'),
  str2obj = require('./utils/str2obj'),
  mergeObj = require('./utils/merge-obj');

/**
 * Extract i18n content from the file of the giving path
 * @param  {String} pathToFile
 * @return {Object} i18n content
 */
module.exports = function (regI18nContent, defaultLang) {
  return function extractI18nContent(pathToFile) {
    var origContent = readFileSync(pathToFile, 'utf-8'),
      i18nContent = {},
      re;

    /* jshint boss:true */
    while (re = regI18nContent.exec(origContent)) {
      re = str2obj(re[1]);
      var k = object.keys(re)[0],
        v = object.values(re)[0];

      if (typeIs.string(v)) {
        re = objGen(k, objGen(defaultLang, v));
      } else {
        if (!typeIs.object(v)) {
          console.log('[I18N type error] value of [', k ,'] is neither string nor object');
          console.log('>>>>>>>>>>', re);
          process.exit();
        }
      }
      mergeObj(i18nContent, re);
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

// <i18n>{ '好的': 'Well' }</i18n> 
console.log('_#好的#_');

-----------------------------------------------------------------------------

var i18nContent = extractI18nContent('./test.js'); // defaultLang = 'en'
console.log(i18nContent);

{
  '你好': { 'en': 'Hello', 'jp': 'こんにちは', 'fr': 'Bonjour' },
  '热爱': { 'en': 'Love', 'jp': '熱愛', 'fr': 'Aimer' } },
  '好的': { 'en': 'Well' }
}
 */
