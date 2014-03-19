// Gulpfile.js
var gulp = require('gulp')
  , nodemon = require('gulp-nodemon')
  , jshint = require('gulp-jshint')
  , mocha = require('gulp-mocha')
  , gutil = require('gulp-util')
  , coffee = require('gulp-coffee');

var paths = {
  scripts: ['./app.js', './models/*.js', 'public/javascripts/*.js', 'routes/*.js', 'config/*.js'],
  tests: ['./test/*.js']
}

gulp.task('coffee', function() {
  gulp.src('./public/javascripts/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./public/javascripts'))
});

gulp.task('lint', function() {
  gulp.src(paths.scripts)
    .pipe(jshint({laxcomma: true, asi: true}))
    .pipe(jshint.reporter('default'))
    // .pipe(jshint.reporter('fail')); // Uncomment to raise error on warning
});

gulp.task('develop', function () {
  nodemon({ script: 'app.js', ext: 'html js coffee', ignore: ['test/*', 'Gulpfile.js'] })
    .on('change', ['lint', 'coffee'])
    .on('restart', function () {
      console.log('restarted!')
    })
})

gulp.task('default', ['lint', 'coffee', 'develop']);
