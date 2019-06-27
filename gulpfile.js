'use strict';

var gulp = require('gulp'),
    autoprefix = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rigger = require('gulp-rigger'),
    rimraf = require('rimraf'),
    cleanCSS = require('gulp-clean-css'),
    connect = require('gulp-connect'),
    mjml = require('gulp-mjml')
;

var path = {
    build: { // production
        html: 'build/',
        js: 'build/js/',
        jsLib: 'build/js/lib/',
        css: 'build/css/',
        cssLib: 'build/css/lib/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { // development
        html: 'src/*.html',
        jsPlugins: 'src/js/plugins.js',
        jsLib: 'src/js/lib/**/*.*',
        js: 'src/js/app/app.js',
        style: 'src/styles/main.less',
        styleLib: 'src/styles/lib/*.css',
        styleLibFiles: 'src/styles/lib/**/*.*',
        styleLibIgnore: '!src/styles/lib/*.css',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/styles/**/*.*',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};


/* =====================================================
    SERVER
    ===================================================== */

gulp.task('connect', function() {
    connect.server({
        root: 'build',
        port: 8880
    });
});


/* =====================================================
    HTML
    ===================================================== */

gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
    ;
});


/* =====================================================
    JS
    ===================================================== */

gulp.task('jsPlugins:build', function () {
    return gulp.src(path.src.jsPlugins)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
    ;
});

gulp.task('jsLib:build', function () {
    return gulp.src(path.src.jsLib)
        //.pipe(uglify())
        .pipe(gulp.dest(path.build.jsLib))
    ;
});

gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(rigger())
        //.pipe(uglify())
        .pipe(gulp.dest(path.build.js))
    ;
});


/* =====================================================
    STYLES
    ===================================================== */

gulp.task('style:build:main', function () {
    return gulp.src(path.src.style)
        .pipe(less())
        .pipe(autoprefix({
            browsers: ['last 30 versions', '> 1%', 'ie 8', 'ie 9'],
            cascade: true
        }))
        .pipe(rename('main.source.css'))
        .pipe(gulp.dest(path.build.css))
    ;
});

gulp.task('style:build', function () {
    return gulp.src(path.src.style)
        .pipe(less())
        .pipe(autoprefix({
            browsers: ['last 30 versions', '> 1%', 'ie 8', 'ie 9'],
            cascade: true
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(path.build.css))
    ;
});

gulp.task('styleLib:build', function () {
    return gulp.src(path.src.styleLib)
        .pipe(autoprefix({
            browsers: ['last 30 versions', '> 1%', 'ie 8', 'ie 9'],
            cascade: true
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(path.build.cssLib))
    ;
});

gulp.task('styleLibFiles:build', function () {
    return gulp.src([path.src.styleLibFiles, path.src.styleLibIgnore])
        .pipe(gulp.dest(path.build.cssLib))
});

gulp.task('style:build:source', function () {
    gulp.src('./src/styles/**/*.less')
        .pipe(less())
        .pipe(autoprefix({
            browsers: ['last 30 versions', '> 1%', 'ie 8', 'ie 9'],
            cascade: true
        }))
        .pipe(gulp.dest('./build/css/separate/'))
    ;
});

gulp.task('style:build:minify', function () {
    gulp.src('./src/styles/**/*.less')
        .pipe(less())
        .pipe(autoprefix({
            browsers: ['last 30 versions', '> 1%', 'ie 8', 'ie 9'],
            cascade: true
        }))
        .pipe(cleanCSS())
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest('./build/css/separate/'))
    ;
});

gulp.task('emails', function () {
    gulp.src('./mail/**/*.mjml')
        .pipe(mjml())
        .pipe(gulp.dest('./build/emails'))
    ;
    gulp.src('./mail/img/**/*')
        .pipe(gulp.dest('./build/emails/img'))
});

/* =====================================================
    IMAGES
    ===================================================== */

gulp.task('image:build', function (cb) {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img)).on('end', cb).on('error', cb);
});


/* =====================================================
    FONTS
    ===================================================== */

gulp.task('fonts:build', function() {
    return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
});


/* =====================================================
    BUILD TASK
    ===================================================== */
gulp.task('build', [
    'html:build',
    'fonts:build',
    'jsPlugins:build',
    'jsLib:build',
    'js:build',
    'style:build',
    'style:build:main',
    'styleLib:build',
    'styleLibFiles:build',
    'emails'
    //'image:build'
]);


/* =====================================================
    WATCH
    ===================================================== */



/* =====================================================
    CLEAN PRODUCTION
    ===================================================== */

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('watch', function () {
    gulp.watch(path.watch.html, ['html:build']);
    gulp.watch(path.watch.style, ['style:build', 'style:build:main', 'style:build:minify', 'styleLib:build', 'styleLibFiles:build']);
    gulp.watch(path.watch.js, ['jsPlugins:build', 'jsLib:build', 'js:build']);
});

/* =====================================================
    DEFAULT TASK
    ===================================================== */

gulp.task('default', ['build', 'watch', 'connect']);

gulp.task('prod', ['build', 'image:build', 'style:build:source', 'style:build:minify', 'emails']);