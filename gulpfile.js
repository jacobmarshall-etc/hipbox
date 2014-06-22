var gulp = require('gulp');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var uglify = require('gulp-uglify');
var prefix = require('gulp-autoprefixer');
var cssmin = require('gulp-minify-css');

var paths = {
    js: 'src/hipbox.js',
    css: 'src/hipbox.css',
    dist: 'dist'
};

gulp.task('jshint', function () {
    gulp.src(paths.js)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
});

gulp.task('js', function () {
    gulp.src(paths.js)
        .pipe(uglify({ compress: true }))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('css', function () {
    gulp.src(paths.css)
        .pipe(prefix('last 10 version'))
        .pipe(cssmin({ compatibility: 'ie8' }))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('default', ['jshint', 'js', 'css']);