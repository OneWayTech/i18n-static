/**
 * @param  {Object} obj
 * @param  {String} field
 * @return {Object}
 */
module.exports = function mapObjValProperty(obj, field) {
  var o = {};
  for (var k in obj) {
    o[k] = obj[k][field];
  }
  return o;
};

/* e.g.
  
  mapObjValProperty({
    Ken: { age: 11, gender: 'male' },
    Amy: { age: 12, gender: 'female' }
  }, 'age')

  { Ken: 11, Amy: 12 }

 */
