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
    gulp   = require('gulp'),
    plumber = require('gulp-plumber');

gulp.task('map_styles',function(){
  gulp.src('./public/stylesheets/map/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer('last 2 version'))
    .pipe(concat('map.css'))
    .pipe(gulp.dest('./public/build/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('./public/build/css'))
    .pipe(notify('Map Style task complete'))
})

gulp.task('layout_styles',function(){
  gulp.src('./public/stylesheets/layout/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer('last 2 version'))
    .pipe(concat('layout.css'))
    .pipe(gulp.dest('./public/build/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('./public/build/css'))
    .pipe(notify('Layout Style task complete'))
})

gulp.task('login_styles',function(){
  gulp.src('./public/stylesheets/login/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer('last 2 version'))
    .pipe(concat('login.css'))
    .pipe(gulp.dest('./public/build/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('./public/build/css'))
    .pipe(notify('Login Style task complete'))
})

gulp.task('highUtil_styles',function(){
  gulp.src('./public/stylesheets/highUtil/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer('last 2 version'))
    .pipe(concat('highUtil.css'))
    .pipe(gulp.dest('./public/build/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('./public/build/css'))
    .pipe(notify('HighUtil Style task complete'))
})

gulp.task('scripts',function(){
  gulp.src('./public/javascript/*.js')
    .pipe(plumber())
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
        locals: YOUR_LOCALS,
        pretty: true
    }))
    .pipe(gulp.dest('./public/'))
    .pipe(notify("Templates task complete"))
});


gulp.task('clean',function(cb){
  del(['./public/build/css'],cb)
})

gulp.task('lint', function(cb, err) {
  gulp.src('./public/javascript/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
  cb(err);
});

gulp.task('default',['clean', 'lint'],function(){
  gulp.start('login_styles','layout_styles','map_styles', 'highUtil_styles', 'templates');
  //gulp.start('styles','templates');
})


gulp.task('watch',function(){
  gulp.start('login_styles','layout_styles','map_styles', 'highUtil_styles', 'templates');
  gulp.watch('./public/stylesheets/layout/*.scss',['layout_styles']);
  gulp.watch('./public/stylesheets/login/*.scss',['login_styles']);
  gulp.watch('./public/stylesheets/map/*.scss',['map_styles']);
  gulp.watch('./public/stylesheets/highUtil/*.scss',['highUtil_styles']);
  gulp.watch('./public/javascript/*.js', ['lint']);
  //gulp.watch('./public/javascript/*.js',['scripts']);
  gulp.watch('./public/views/**/*.jade',['templates']);
})

