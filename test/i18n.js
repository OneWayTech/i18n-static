var path = require('path'),
  i18n = require('../lib');

i18n({
  srcDir: path.join(__dirname, 'src'), // containing locales
  buildDir: path.join(__dirname, 'dist/__build__'), // build code for i18n
  distDir: path.join(__dirname, 'dist') // for gulp.dest
});
