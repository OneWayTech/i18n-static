var object = require('sugar').Object, //https://sugarjs.com
  isString = require('./type-is').string;

var opts = { deep: true, resolve: resolveFn };

// https://sugarjs.com/docs/#/Object/add
function resolveFn(key, targetVal, srcVal, targetObj, srcObj) {
  if (isString(targetVal) && isString(srcVal) && targetVal !== srcVal) {
    console.log('[I18N conflict] [', key, '] has different values: [', targetVal, '] and [', srcVal, ']');
    console.log('>>>>>>>>>> Target:', targetObj);
    console.log('>>>>>>>>>> Source:', srcObj);
    process.exit();
  }
  return object.add(targetVal, srcVal, opts);
}

// https://sugarjs.com/docs/#/Object/merge
module.exports = function mergeObj(targetObj, srcObj) {
  return object.merge(targetObj, srcObj, opts);
};
