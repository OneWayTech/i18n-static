var readFileSync = require('fs').readFileSync,
  str2obj = require('./utils/str2obj');

/**
 * @param  {String} pathToFile
 * @return {Object} locales
 */
module.exports = function readLocalesFile(pathToFile) {
  return str2obj(readFileSync(pathToFile, 'utf-8'));
};
