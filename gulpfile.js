// gulp
var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var sass = require('gulp-sass');

// tasks
gulp.task('lint', function() {
    gulp.src(['./app/**/*.js', '!./app/bower_components/**', '!./app/js/game/*.*'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});
gulp.task('clean', function() {
    gulp.src('./dist/*')
        .pipe(clean({force: true}));
});
gulp.task('css', function() {
    var opts = {comments:true,spare:true};
    return gulp.src('./app/css/main.scss')
        .pipe(sass({
            includePaths: ['./bower_components/bootstrap-sass/assets/stylesheets']
        }))
        .pipe(gulp.dest('./dist/css'));
        //.pipe(minifyCSS(opts))
});
gulp.task('minify-js', function() {
    gulp.src(['./app/main.js', './app/**/*.js', '!./app/bower_components/**', '!./app/js/game/*.*'])
        /*.pipe(uglify({
            // inSourceMap:
            // outSourceMap: "app.js.map"
        }))*/
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./dist/js/'))
});
gulp.task('copy-js-game', function() {
    gulp.src(['./app/js/game/*.js'])
        /*.pipe(uglify({
            // inSourceMap:
            // outSourceMap: "app.js.map"
        }))*/
        .pipe(gulp.dest('./dist/js/game/'))
});
gulp.task('copy-bower-components', function () {
    gulp.src('./app/bower_components/**')
        .pipe(gulp.dest('dist/bower_components'));
});
gulp.task('copy-html-files', function () {
    gulp.src('./app/**/*.html')
        .pipe(gulp.dest('dist/'));
});
gulp.task('connect', function () {
    connect.server({
        root: 'app/',
        port: 8888
    });
});
gulp.task('connectDist', function () {
    watch('./app/**/*.*', function() {
        gulp.start('deploy');
    });
});
gulp.task('deploy', ['update'], function(){
    gulp.src(['./dist/*.*', './dist/**/*.*'])
        .pipe(gulp.dest('../unnamed_project/public'));
});

// default task
gulp.task('default',
    ['deploy']
);

// build task
gulp.task('update',
    ['lint', 'css', 'minify-js', 'copy-js-game', 'copy-html-files']
);

// build task
gulp.task('build',
    ['lint', 'css', 'minify-js', 'copy-js-game', 'copy-html-files', 'copy-bower-components']
);

