var locales = require('../example/dist/locales.json'),
  correctAnswer = require('./locales.json');

if (JSON.stringify(locales) !== JSON.stringify(correctAnswer)) {
  throw new Error('Inconsistent answers! Test failed!');
}
