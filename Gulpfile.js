// Gulpfile.js
var gulp = require('gulp')
  , nodemon = require('gulp-nodemon')
  , jshint = require('gulp-jshint')
  , mocha = require('gulp-mocha')
  , gutil = require('gulp-util')
  , uglify = require('gulp-uglify')
  , coffee = require('gulp-coffee')
  , concat = require('gulp-concat');

var libs = [
    'lib/jquery/jquery.min.js'
  , 'lib/angular/angular.min.js'
  , 'lib/angular/angular-qrcode.js'
  , 'lib/angular/angular-resource.min.js'
  , 'lib/zeroclipboard/ZeroClipboard.min.js'
  , 'lib/angular/ng-clip.min.js'
  , 'lib/bootstrap/js/bootstrap.js'
  , 'lib/qrcode-generator/qrcode.js'
]

var paths = {
  scripts: ['./app.js', './models/*.js', 'public/javascripts/main.js', 'public/javascripts/profile.js', 'routes/*.js', 'config/*.js'],
  libs: libs,
  tests: ['./test/*.js']
}



gulp.task('coffee', function() {
  gulp.src('./public/javascripts/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(uglify())
    .pipe(gulp.dest('./public/javascripts'))
});
gulp.task('merge_libs', function() {
  gulp.src(paths.libs)
    .pipe(uglify())
    .pipe(concat('all_libraries.min.js'))
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
    .on('change', ['lint', 'coffee', 'merge_libs'])
    .on('restart', function () {
      console.log('restarted!')
    })
})

gulp.task('default', ['lint', 'coffee', 'merge_libs', 'develop']);
