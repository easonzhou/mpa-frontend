var gulp = require('gulp'),
    sass = require('gulp-sass'),
    coffee = require('gulp-coffee'),
    jade = require('gulp-jade');
    autoprefixer = require("gulp-autoprefixer"),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    del = require('del'),
    jshint = require('gulp-jshint'),
    gulp   = require('gulp');

gulp.task('styles',function(){
  gulp.src('./public/stylesheets/*.scss')
    .pipe(sass())
    .pipe(autoprefixer('last 2 version'))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./public/build/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('./public/build/css'))
    .pipe(notify('Style task complete'))
})

gulp.task('scripts',function(){
  gulp.src('./public/javascript/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/build/js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/build/js'))
    .pipe(notify('Scripts task complete'))
})


gulp.task('templates', function() {
    var YOUR_LOCALS = {};

    gulp.src('./public/views/**/*.jade')
    .pipe(jade({
        locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest('./public/'))
    .pipe(notify("Templates task complete"))
});


gulp.task('clean',function(cb){
  del(['./public/build'],cb)
})

gulp.task('lint', function(cb, err) {
  gulp.src('./public/javascript/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
  cb(err);
});

gulp.task('default',['clean', 'lint'],function(){
  gulp.start('styles','scripts','templates');
  //gulp.start('styles','templates');
})

gulp.task('watch',function(){
  gulp.watch('./public/stylesheets/*.scss',['styles']);
  gulp.watch('./public/javascript/*.js', ['lint']);
  //gulp.watch('./public/javascript/*.js',['scripts']);
  gulp.watch('./public/views/**/*.jade',['templates']);
})

