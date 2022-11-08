const {src, dest, watch, series, parallel} = require('gulp');
let fs = require('fs');

// Плагины
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size')
const ejs = require('gulp-ejs');



const html = () => {
    return src("./src/bin/*.html")
        .pipe(size({ title: "До сжатия "}))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(size({ title: "После сжатия "}))
        .pipe(dest("./gulp_dist"));
}

const gulpEjs = () => {
  return src("./src/views/**/**/*.ejs")
      .pipe(size({ title: "До сжатия "}))
      .pipe(ejs())
      .pipe(size({ title: "После сжатия "}))
      .pipe(dest("./gulp_dist"));
}

const watcher = () => {
    watch("./src/bin/html/**/*.html", html);
}


// Задачи
exports.html = html;
exports.gulpEjs = gulpEjs;
exports.watcher = watcher;

// Сборка
exports.dev = series(
    html,
    gulpEjs,
    watcher
);
