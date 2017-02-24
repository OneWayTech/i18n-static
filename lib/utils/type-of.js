var toString = Object.prototype.toString;

/**
 * A better `typeof`
 * @param  {Any}    any
 * @return {String} name of type 
 */
module.exports = function typeOf(any) {
  return toString.call(any).slice(8, -1).toLowerCase();
};
