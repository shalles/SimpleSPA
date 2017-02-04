var fs = require('fs'),
    del = require('del'),
    path = require('path'),
    gulp = require('gulp'),
    chalk = require('chalk'),
    Rsync = require('rsync'),
    rev = require('gulp-rev'),
    sass = require('gulp-sass'),
    frep = require('gulp-frep'),
    uglify = require('gulp-uglify'),
    eslint = require('gulp-eslint'),
    // gulpFecmd = require('gulp-fecmd'),
    through = require('through2'),
    servermock = require('servermock'),
    imagemin = require('gulp-imagemin'),
    webpack = require('webpack-stream'),
    minifyHTML = require('gulp-htmlmin'),
    minifyCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    livereload = require('gulp-livereload'),
    revreplace = require('gulp-rev-replace'),
    eslintConfig = require('./.eslintrc.js'),
    webpackConfig = require('./webpack.config.js');

module.exports = function (config){
    var cwd = process.cwd();
    var patterns = [{
            pattern: new RegExp('/' + config.exports + '/', 'ig'),
            replacement: config.publicPath
        }];
    var relay = 0;
    function versionRelay(){
        if(++relay >= 4){
            relay = 0;
            index();
        }
    }

    function style() {
        var styles = config.styles;
        var stream = gulp.src(styles.src);

        if(styles.scss){
            stream = stream.pipe(sass({
                    includePaths: styles.libs || [],
                    outputStyle: styles.style || 'expanded' //:nested, :expanded, :compact, or :compressed
                }).on('error', sass.logError));
        }

        stream
            .pipe(frep(patterns))
            .pipe(minifyCSS())
            .pipe(rev())
            .pipe(gulp.dest(styles.exp))
            .pipe(rev.manifest(config.temp + '/css-map.json', {
                base: path.join(cwd, config.temp),
                merge: true
            }))
            .pipe(gulp.dest(config.temp))
            .on('end', function(){
                versionRelay();
            });

        return stream;
    }

    function script() {
        var scripts = config.scripts;

        webpackConfig.output.publicPath = config.publicPath;
        
        var stream = gulp.src(scripts.src)
            .pipe(frep(patterns))
            .pipe(eslint(eslintConfig))
            .pipe(eslint.format())
            .pipe(webpack(webpackConfig))
            .pipe(frep(patterns))
            .pipe(uglify())
            .pipe(rev())
            .pipe(gulp.dest(scripts.exp))
            .pipe(rev.manifest(config.temp + '/js-map.json', {
                base: path.join(cwd, config.temp),
                merge: true
            }))
            .pipe(gulp.dest(config.temp))
            .on('end', function(){
                versionRelay();
            });

        return stream;
    }

    function external(){
        var externals = config.externals;

        var stream = gulp.src(externals.src)
            .pipe(frep(patterns))
            .pipe(uglify())
            .pipe(rev())
            .pipe(gulp.dest(externals.exp))
            .pipe(rev.manifest(config.temp + '/external-map.json', {
                base: path.join(cwd, config.temp),
                merge: true
            }))
            .pipe(gulp.dest(config.temp))
            .on('end', function(){
                versionRelay();
            });

        return stream;
    }

    function image() {
        var images = config.images;
        var data = gulp.src(images.src);

        images.min && (data = data.pipe(imagemin({
            optimizationLevel: 5
        })));

        data.pipe(gulp.dest(images.exp));

        return data;
    }

    function view(cb) {
        var views = config.views;
        var stream = gulp.src(views.src)
            .pipe(frep(patterns))
            .pipe(uglify())
            .pipe(rev())
            .pipe(gulp.dest(views.exp))
            .pipe(rev.manifest(config.temp + '/page-map.json', {
                base: path.join(cwd, config.temp),
                merge: true
            }))
            .pipe(gulp.dest(config.temp))
            .on('end', function(){
                versionRelay();
            });

        return stream;
    }

    function index(cb){
        var indexs = config.indexs;
        var manifest = gulp.src(config.temp + '/*.json');
        var stream = gulp.src(indexs.src)
            .pipe(revreplace({
                replaceInExtensions: ['.html', '.htm', '.json'],
                manifest: manifest
            }))
            .pipe(frep(patterns))
            .pipe(gulp.dest(indexs.exp));

        return stream;
    }

    function dele(src) {
        del.sync(config.temp);
        del.sync(config.exports);
    }

    function sync(remote, msg, cb) {

        var rsync = new Rsync()
            .shell('ssh')
            .flags(remote.flag || 'az')
            .source(remote.source)
            .destination(remote.dest);

        rsync.execute(function(error, code, cmd) {
            error && console.log('err: ', error)
            // console.log('cmd: ', cmd);
            code === 0 && console.log(msg);
            cb && cb();
        });
    }

    gulp.task('styles', style);

    gulp.task('scripts', script);

    gulp.task('images', image);

    gulp.task('views', view);

    gulp.task('externals', external);
    
    dele();
    gulp.task('indexs', ['styles', 'scripts', 'images', 'views', 'externals'], function() {
        index();
    });

    gulp.task('build', ['indexs'], function(){
        gulp.src(['./share/**', '!**/**/README.md'])
            .pipe(gulp.dest(path.join(config.exports, 'share')));
        gulp.src(config.vendor.src)
            .pipe(gulp.dest(config.vendor.exp));
    });

    return {
        sync: function(){
            sync(config.sync, '静态资源已同步到开发机: ' + config.sync.dest, function(){
                sync(config.indexs.remote, 'pages已同步到开发机: ' + config.indexs.remote.dest)
            });
        },
        servermock: function(){
            servermock(config.server);
        }
    }
}