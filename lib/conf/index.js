var object = require('sugar').Object,
  defaultConf = require('./default'),
  typeIs = require('../utils/type-is'),
  mapObjValProperty = require('../utils/map-obj-val-property');

module.exports = function init(customConf) {
  var conf = mapObjValProperty(defaultConf, 'default');
  object.merge(conf, customConf);

  // type check
  object.keys(conf).forEach(function (field) {
    var type = defaultConf[field].type,
      val = conf[field];
    
    if (type && !typeIs[type](val) || !val) {
      console.log('[I18N Error]', field, 'should be a', type, 'and not empty');
      process.exit();
    }
  });

  return conf;
};
