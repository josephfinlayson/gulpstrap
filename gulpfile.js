'use strict';
// generated on 2014-04-18 using generator-gulp-webapp 0.0.7

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', [], function (cb) {
    return     gulp.src('app/styles/main.scss')
        .pipe($.rubySass({
            style: 'expanded'
        }))
        .pipe(gulp.dest('_site/styles'))
        // cb();
});

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter($.jshintStylish))
        .pipe(gulp.dest('_site/scripts'))
        .pipe($.size());
});

gulp.task('jekyll', ['scripts'], function (gulpCallback) {
    var spawn = require('child_process').spawn;
    var jekyll = spawn('jekyll', ['build', '--config', 'app/markdown/_config.yml', '--trace'], {stdio: 'inherit'});
  jekyll.on('exit', function (code, signal) {
        gulpCallback(code === 0 ? null : 'ERROR: Jekyll process exited with code: '+code);
    });
});
    
//what does this do ?
gulp.task('html', ['jekyll'],    function (cb) {
    // cb();
    var jsFilter = $.filter('_site/*.js');
    var cssFilter = $.filter('_site/*.css');

    return gulp.src('_site/*.html')
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('_site/'))
        .pipe($.size());
});

// gulp.task('images', function () {
//     return gulp.src('app/images/**/*')
//         .pipe($.cache($.imagemin({
//             optimizationLevel: 3,
//             progressive: true,
//             interlaced: true
//         })))
//         .pipe(gulp.dest('dist/images'))
//         .pipe($.size());
// });

gulp.task('fonts', function () {
    return $.bowerFiles()
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('clean', function (cb) {
    // return    gulp.src(['_site', 'dist'], { read: false }).pipe($.clean());
    cb();
});

gulp.task('build', ['html', 'fonts']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', ['html'], function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('_site'))

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
        return;
});

gulp.task('serve', ['connect', 'html'], function () {
    require('opn')('http://localhost:9000');
});


// inject bower components
gulp.task('wiredep', function (cb) {
    cb();
    // var wiredep = require('wiredep').stream;
    // gulp.src('app/styles/*.scss')
    //     .pipe(wiredep({
    //         directory: 'app/bower_components'
    //     }))
    //     .pipe(gulp.dest('app/styles/'));

    // gulp.src('_site/*.html')
    //     .pipe(wiredep({
    //         directory: 'app/bower_components',
    //         exclude: ['bootstrap-sass']
    //     }))
    //     .pipe(gulp.dest('_site'));
});

//do everything once before launching the app
gulp.task('watch', ['jekyll', 'styles', 'html', 'connect', 'serve'], function () {
    var server = $.livereload();
    // watch for changes
    gulp.watch([
        'app/*.html',
        'app/styles/**/*.css',
        'app/styles/**/*.scss',
        'app/scripts/**/*.js',
        // 'app/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
        console.log(file.path);
    });
    //changes to markdown trigger jekyll build
    gulp.watch('app/markdown/**/*.html', ['html']);
    //changes to sass rebuild main.css
    gulp.watch('app/styles/**/*.scss', ['styles']);
    //changes to js rebuild main.js
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    //changes to images 
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
