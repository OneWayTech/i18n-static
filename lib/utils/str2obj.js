var YAML = require('yamljs'),
  isObject = require('./type-is').object,
  regLineBreaks = /(\r\n|\n|\r)/gm; // match line breaks

/**
 * @param  {String} s # YAML / js object / JSON
 * @return {Object}
 */
module.exports = function str2obj(s) {
  var o;
  try {
    o = YAML.parse(s);
  } catch (e1) {
    try {
      /* jshint evil:true */
      o = eval('(' + s.replace(regLineBreaks, '') + ')');
    } catch (e2) {
      console.log('[I18N parse error] the input is not a valid YAML / JS object / JSON');
      console.log('>>>>>>>>>>', s);
      process.exit();
    }
  }

  if (!isObject(o)) {
    console.log(
      '[I18N type error] the parsed i18n content must be an object, but now get',
      JSON.stringify(o)
    );
    process.exit();
  }

  return o;
};
