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
[
  'undefined', 'null', 'boolean', 'number', 'string', 'object',
  'array', 'function', 'regexp', 'error', 'date', 'symbol'
].forEach(function(type) {
  exports[type] = typeIs(type);
});
