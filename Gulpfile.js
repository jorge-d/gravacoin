// Gulpfile.js
var gulp = require('gulp')
  , nodemon = require('gulp-nodemon')
  , jshint = require('gulp-jshint')
  , mocha = require('gulp-mocha');

var paths = {
  scripts: ['./app.js', './models/*.js', 'public/javascript/*.js', 'routes/*.js', 'spec/*.js', 'config/*.js'],
  tests: ['./spec/*.js']
}
gulp.task('lint', function() {
  gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    // .pipe(jshint.reporter('fail')); // Uncomment to raise error on warning
});

gulp.task('develop', function () {
  nodemon({ script: 'app.js', ext: 'html js', ignore: ['spec/*', 'Gulpfile.js'] })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!')
    })
})

gulp.task('mocha-tests', function () {
    gulp.src(paths.tests)
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test', ['lint', 'mocha-tests']);

gulp.task('default', ['develop']);
