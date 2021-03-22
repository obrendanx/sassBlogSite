var gulp = require( 'gulp' );
var rename = require( 'gulp-rename' );
var sass = require( 'gulp-sass' );
var minifyCSS = require('gulp-clean-css');
var changed = require('gulp-changed');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');
var browserify = require('browserify');
var babelify = require('babelify');
var babelcore = require('babel-core');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var runSequence = require('run-sequence');

var styleSRC = './src/scss/style.scss';
var styleDIST = './dist/css/';
var styleWatch = './src/scss/**/*.scss';

var jsSRC = 'script.js';
var jsFolder = 'src/js/';
var jsDIST = './dist/js/';
var jsWatch = './src/js/**/*.js';
var jsFILES = [jsSRC];

var htmlWatch = '**/*.html';
var phpWatch = '**/*.php';

gulp.task('browserSync', function(){
  return browserSync.init({
    open: false,
    injectChanges: true,
    server: {
      baseDir: "./"
    }
    //proxy: 'http://sitename.dev',
    //https: {
    //  key: '',
    //  cert: ''
    //}
  });
});

gulp.task('style', function(){
  return gulp.src( styleSRC )
      .pipe( sourcemaps.init() )
      .pipe( sass({
        errorLogToConsole: true,
      }) )
      .on( 'error', console.error.bind( console ) )
      .pipe( autoprefixer()  )
      .pipe(minifyCSS())
      .pipe( rename( { suffix: '.min' } ) )
      .pipe( sourcemaps.write('./') )
      .pipe(changed(styleDIST))
      .pipe( gulp.dest( styleDIST ) )
      .pipe( browserSync.stream() );
});

gulp.task('js',  async function(){
    return jsFILES.map(function( entry ){
    return browserify({
      entries: [jsFolder + entry]
    })
    .transform( babelify, {presets: ['env']} )
    .bundle()
    .pipe( source( entry ) )
    .pipe( rename({extname: '.min.js' }) )
    .pipe( buffer() )
    .pipe( sourcemaps.init({ loadMaps: true }) )
    .pipe( uglify() )
    .pipe( sourcemaps.write( './' ) )
    .pipe( gulp.dest( jsDIST ) )
    .pipe( browserSync.stream() );
  });
});

gulp.task('default', gulp.parallel('style', 'js') );

gulp.task('watch-scss', () => {
    return gulp.watch( styleWatch, gulp.series('style')).on("change", browserSync.reload);
});

gulp.task('watch-js', () => {
    return gulp.watch( jsWatch, gulp.series('js')).on("change", browserSync.reload);
});

gulp.task('watch-html', () => {
    return gulp.watch( htmlWatch ).on("change", browserSync.reload);
});

function watchSass() {
    return gulp.watch( styleWatch, gulp.series('style')).on("change", browserSync.reload);
};

function watchJs() {
    return gulp.watch( jsWatch, gulp.series('js')).on("change", browserSync.reload);
};

function watchHtml() {
    return gulp.watch( htmlWatch ).on("change", browserSync.reload);
};

exports.watch = gulp.parallel("browserSync", watchSass, watchHtml);
