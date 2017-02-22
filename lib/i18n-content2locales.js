var mergeObj = require('./utils/merge-obj'),
  objGen = require('./utils/obj-gen');

/**
 * Ensure `lang` exists
 * @param  {Object} locales
 * @param  {String} lang
 * @return {Object} reference of `locales[lang]`
 */
function ensureLang(locales, lang) {
  if (!locales[lang]) locales[lang] = {};
  return locales[lang];
}

/**
 * Transform the `i18nContent` into a group-by-languages object
 * @param  {Object} i18nContent
 * @param  {String} sourceLang
 * @return {Object}
 */
module.exports = function i18nContent2Locales(i18nContent, sourceLang) {
  var locales = {};

  for (var k in i18nContent) {
    var v = i18nContent[k];
    for (var lang in v) {
      mergeObj(ensureLang(locales, lang), objGen(k, v[lang]));
    }
  }

  locales[sourceLang] = {}; // we still need to trim the delimeters of the source code

  return locales;
};

/* e.g.

var i18nContent = {
  '你好': {
    'en': 'Hello',
    'jp': 'こんにちは',
    'fr': 'Bonjour'
  },
  '美味': {
    'en': 'Delicious',
    'jp': 'おいしい',
    'fr': 'Délicieux'
  },
  '热爱': {
    'en': 'Love',
    'jp': '熱愛',
    'fr': 'Aimer'
  }
};

var locales = i18nContent2Locales(i18nContent);
console.log(locales);

{
  en: { '你好': 'Hello', '美味': 'Delicious', '热爱': 'Love' },
  jp: { '你好': 'こんにちは', '美味': 'おいしい', '热爱': '熱愛' },
  fr: { '你好': 'Bonjour', '美味': 'Délicieux', '热爱': 'Aimer' }
}

 */
