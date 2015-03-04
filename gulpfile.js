var
  gulp = require('gulp'),
  flatten = require('gulp-flatten');

gulp.task('copy', function () {
  gulp.src('src/**')
    .pipe(flatten())
    .pipe(gulp.dest('build/'));
});

gulp.task('build', ['copy']);