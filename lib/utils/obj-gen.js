/**
 * JSHint: 'computed property names' is only available in ES6
 * @param  {String} k
 * @param  {Any} v
 * @return {Object}
 */
module.exports = function objGen(k, v) {
  var o = {};
  o[k] = v;
  return o;
};
