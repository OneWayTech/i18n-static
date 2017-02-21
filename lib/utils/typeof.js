/**
 * A better `typeof`
 * @param  {Any}    any
 * @return {String} name of type 
 */
var typeOf = (function () {
  var toString = Object.prototype.toString,
    regType = /^\[object\s(\w*?)\]$/; // match name of type

  return function (any) {
    return toString.call(any).match(regType)[1].toLowerCase();
  };
})();

/**
 * @param  {String}   type
 * @return {Function} type detector
 */
function is(type) {
  return function (any) {
    return typeOf(any) === type;
  };
}

exports.default = typeOf;
exports.string = is('string');
exports.object = is('object');
exports.regexp = is('regexp');
exports.undefined = is('undefined');
