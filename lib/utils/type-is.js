var typeOf = require('./type-of');

/**
 * @param  {String}   type
 * @return {Function} type detector
 */
function typeIs(type) {
  return function (any) {
    return typeOf(any) === type;
  };
}

[
  'undefined', 'null', 'boolean', 'number', 'string', 'object',
  'array', 'function', 'regexp', 'error', 'date', 'symbol'
].forEach(function(type) {
  exports[type] = typeIs(type);
});
