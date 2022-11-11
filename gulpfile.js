const {src, dest, watch, series, parallel} = require('gulp');
let fs = require('fs');
const path = require('path')
const concat = require('gulp-concat')
const cssImport = require('gulp-cssimport')
const autoprefixer = require('gulp-autoprefixer');
const ccso = require('gulp-csso');
const rename = require('gulp-rename')
const gulpLess = require('gulp-less');
const LessAutoprefix = require('less-plugin-autoprefix');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

// Плагины
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size')
const ejs = require('gulp-ejs');

const pathSrc = "./src";
const pathDest = "./gulp_dist";


const html = () => {
    return src(path.join(pathSrc, "/bin/*.html"))
        .pipe(size({ title: "До сжатия "}))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(size({ title: "После сжатия "}))
        .pipe(dest(pathDest));
}

const gulpEjs = () => {
  return src(path.join(pathSrc,"/views/**/**/*.ejs"))
      .pipe(size({ title: "До сжатия "}))
      .pipe(ejs({
          body: '<%- body %>',
          error: {
              message: undefined
          },
          userID: '<%= userID %>'
      }))
      .pipe(size({ title: "После сжатия "}))
      .pipe(dest(pathDest));
}

const css = () => {
  return src(path.join(pathSrc, "/public/stylesheets/**/*.css"))
      .pipe(concat("main.css"))
      .pipe(cssImport())
      .pipe(autoprefixer())
      .pipe(size({ title: "До сжатия css"}))
      .pipe(dest(pathDest, { sourcemaps: true}))
      .pipe(rename({suffix: ".min"}))
      .pipe(ccso())
      .pipe(size({ title: "После сжатия css"}))
      .pipe(dest(pathDest, { sourcemaps: true}))
}

const less = () => {
    return src(path.join(pathSrc,"/public/stylesheets/**/*.less"))
        .pipe(size({ title: "До сжатия less"}))
        .pipe(gulpLess({
            paths: [ path.join(__dirname, 'stylesheets', 'includes') ],
            plugins: [new LessAutoprefix({ browsers: ['last 2 versions'] })]
        }))
        .pipe(size({ title: "После сжатия less"}))
        .pipe(dest(pathDest));
}

const js = () => {
    return src(path.join(pathSrc,"/public/javascripts/**/*.js"), {sourcemaps: true})
        .pipe(size({ title: "До сжатия js"}))
        .pipe(babel({
            "presets": [
                "@babel/preset-env"
            ]
        }))
        .pipe(size({ title: "После сжатия js"}))
        .pipe(uglify())
        .pipe(dest(pathDest), {sourcemaps: true});
}

const watcher = () => {
    watch(path.join(pathSrc, "/bin/html/**/*.html"), html);
}


// Задачи
exports.html = html;
exports.gulpEjs = gulpEjs;
exports.watcher = watcher;
exports.css = css;
exports.less = less;
exports.js = js;

// Сборка
exports.dev = series(
    html,
    parallel(gulpEjs, css, less, js),
    watcher
);
