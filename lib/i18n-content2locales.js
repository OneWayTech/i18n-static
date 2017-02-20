var typeOf = require('./utils/typeof').default,
  mergeObj = require('./utils/merge-obj');

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
 * A simple object generator
 * @param  {String} key
 * @param  {String} val
 * @return {Object}
 */
function objGen(key, val) {
  return { [key]: val };
}

/**
 * Transform the `i18nContent` into a group-by-languages object
 * @param  {Object} i18nContent
 * @param  {String} defaultLang (default language to translate)
 * @return {Object}
 */
module.exports = function i18nContent2Locales(i18nContent, defaultLang) {
  defaultLang = defaultLang || 'en';
  var locales = {};

  for (var k in i18nContent) {
    var v = i18nContent[k];
    switch (typeOf(v)) {
      case 'string':
        mergeObj(
          ensureLang(locales, defaultLang),
          objGen(k, v)
        );
        break;
      case 'object':
        for (var lang in v) {
          mergeObj(
            ensureLang(locales, lang),
            objGen(k, i18nContent[k][lang])
          );
        }
        break;
      default:
        throw new Error('[I18N Error] Content body of [ ' + k + ' ] is neither string nor object');
        process.exit();
    }
  }

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
