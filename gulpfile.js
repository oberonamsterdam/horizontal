const gulp = require('gulp');
const ts = require('gulp-typescript');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

const tsProject = ts.createProject('tsconfig.json');

exports.default = function() {
    return gulp.src(['src/global.ts', 'src/index.ts'])
        .pipe(tsProject())
        .js
        .pipe(concat('src.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('dist/'));
}
