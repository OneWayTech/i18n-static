require('sugar/es7'); // polyfills Array.prototype.includes
var object = require('sugar').Object,
  confDef = require('./conf-def'),
  typeOf = require('../utils/type-of'),
  typeIs = require('../utils/type-is'),
  mapObjValProperty = require('../utils/map-obj-val-property');

/**
 * universal config inspector
 * @param  {Object} customConf
 * @return {Object}
 */
module.exports = function init(customConf) {
  var conf = mapObjValProperty(confDef, 'default');
  object.merge(conf, customConf);

  object.keys(conf).forEach(function (field) {
    var fieldDef = confDef[field],
      types = fieldDef.type.split('|'),
      requiredCond = fieldDef.required,
      val = conf[field];

    if (val) {
      if (!types.includes(typeOf(val))) {
        abort('type of', field, 'should be', types, 'but got', JSON.stringify(val));
      }
    } else {
      if (requiredCond) {
        // conditional required
        if (typeIs.string(requiredCond)) {
          /* jshint withstmt:true */
          with (conf) {
            /* jshint evil:true */
            if (eval(requiredCond)) {
              abort(field, 'is required when', requiredCond);
            }
          }
        } else {
          abort(field, 'is required');
        }
      }
    }
  });
  return conf;
};

function abort() {
  console.log('[I18N conf error]', [].join.call(arguments, ' '));
  process.exit();
}
