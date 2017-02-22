var isObject = require('./typeof').object;

/**
 * @param  {String} s
 * @return {Object}
 */
module.exports = function str2obj(s) {
  var o;
  try {
    o = eval('(' + s + ')');
    if (!isObject(o)) throw new Error('Not an object');
  } catch (e) {
    console.log('[I18N Error] i18n content must be a valid object / JSON');
    console.log('>>>>>>>>>>', s);
    process.exit();
  }
  return o;
};
