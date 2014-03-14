// Gulpfile.js
var gulp = require('gulp')
  , nodemon = require('gulp-nodemon')
  , jshint = require('gulp-jshint')
  , mocha = require('gulp-mocha');

var paths = {
  scripts: ['./app.js', './models/*.js', 'public/javascript/*.js', 'routes/*.js', 'test/*.js', 'config/*.js'],
  tests: ['./test/*.js']
}
gulp.task('lint', function() {
  gulp.src(paths.scripts)
    .pipe(jshint({laxcomma: true, asi: true}))
    .pipe(jshint.reporter('default'))
    // .pipe(jshint.reporter('fail')); // Uncomment to raise error on warning
});

gulp.task('develop', function () {
  nodemon({ script: 'app.js', ext: 'html js', ignore: ['test/*', 'Gulpfile.js'] })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!')
    })
})

gulp.task('default', ['lint', 'develop']);
