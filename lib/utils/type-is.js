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
function typeIs(type) {
  return function (any) {
    return typeOf(any) === type;
  };
}

exports.default = typeIs;
exports.string = typeIs('string');
exports.object = typeIs('object');
exports.regexp = typeIs('regexp');
exports.undefined = typeIs('undefined');
