const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const terser = require('gulp-terser');
const browserSync = require('browser-sync').create();
const del = require('del');
const webpack = require('webpack-stream');

const paths = {
  src: {
    pug: 'src/**/*.pug',
    scss: 'src/styles/**/*.scss',
    js: 'src/scripts/**/*.js',
    img: 'src/assets/img/**/*'
  },
  dist: 'dist'
};

function clean() {
  return del([paths.dist]);
}

function pugTask() {
  return gulp.src('src/index.pug')
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
}

function scssTask() {
  return gulp.src('src/styles/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dist + '/css'))
    .pipe(browserSync.stream());
}

function jsTask() {
  return gulp.src('src/scripts/main.js')
    .pipe(webpack({
      mode: 'development',
      output: {
        filename: 'main.js'
      }
    }))
    .pipe(gulp.dest(paths.dist + '/js'))
    .pipe(browserSync.stream());
}

function imgTask() {
  return gulp.src(paths.src.img)
    .pipe(gulp.dest(paths.dist + '/img'));
}

function scssBuild() {
  return gulp.src('src/styles/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dist + '/css'));
}

function jsBuild() {
  return gulp.src('src/scripts/main.js')
    .pipe(webpack({
      mode: 'production',
      output: {
        filename: 'main.js'
      }
    }))
    .pipe(terser())
    .pipe(gulp.dest(paths.dist + '/js'));
}

function watchFiles() {
  browserSync.init({
    server: {
      baseDir: paths.dist
    },
    port: 3000,
    open: true
  });

  gulp.watch(paths.src.pug, pugTask);
  gulp.watch(paths.src.scss, scssTask);
  gulp.watch(paths.src.js, jsTask);
  gulp.watch(paths.src.img, imgTask);
}

exports.clean = clean;
exports.pug = pugTask;
exports.scss = scssTask;
exports.js = jsTask;
exports.img = imgTask;
exports.watch = watchFiles;
exports.dev = gulp.series(clean, gulp.parallel(pugTask, scssTask, jsTask, imgTask), watchFiles);
exports.build = gulp.series(clean, gulp.parallel(pugTask, scssBuild, jsBuild, imgTask)); 