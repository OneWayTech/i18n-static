var collectI18nFromDir = require('./collect-i18n-from-dir'),
  i18nContent2Locales = require('./i18n-content2locales');

var i18nContent = collectI18nFromDir('../test');
console.log(i18nContent);
console.log('===================================')
console.log(i18nContent2Locales(i18nContent));
