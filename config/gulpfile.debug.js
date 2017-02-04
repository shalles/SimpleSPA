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


var cwd = process.cwd();
// var hostname = '127.0.0.1';
// (function () {
//   //自动获取IP并作为启动服务源
//   try {
//     var NETs = os.networkInterfaces();
//     for (var net in NETs) {
//       if (['lo', 'lo0'].indexOf(net) > -1) continue;
//       var IPs = NETs[net];
//       for (var i = 0, len = IPs.length; i < len; i++) {
//         if (IPs[i].family === 'IPv4') {
//           hostname = IPs[i].address;
//           return;
//         }
//       }
//     }
//   } catch (e) {
//     hostname = 'localhost';
//   }
// })();

function onerror() {}

module.exports = function (config) {

  var cwd = process.cwd();
  var patterns = [{
    pattern: new RegExp('/' + config.exports + '/', 'ig'),
    replacement: config.publicPath
  }];
  var relay = 0;

  function versionRelay() {
    if (++relay >= 4) {
      index();
    }
  }

  function style(cb) {
    var styles = config.styles;
    var stream = gulp.src(styles.src);

    if (styles.scss) {
      stream = stream.pipe(sourcemaps.init());
      stream = stream.pipe(sass({
        includePaths: styles.libs || [],
        outputStyle: styles.style || 'expanded' //:nested, :expanded, :compact, or :compressed
      }).on('error', sass.logError));
      stream = stream.pipe(sourcemaps.write());
    }

    config.minify && (stream = stream.pipe(minifyCSS()));

    stream = config.version ?
      stream
      .pipe(frep(patterns))
      .pipe(rev())
      .pipe(gulp.dest(styles.exp))
      .pipe(rev.manifest(config.temp + '/css-map.json', {
        base: path.join(cwd, config.temp),
        merge: true
      }))
      .pipe(gulp.dest(config.temp)) :
      stream.pipe(gulp.dest(styles.exp));
    stream.on('end', function () {
      versionRelay();
    });
    config.livereload && stream.pipe(livereload());

    return stream.on('error', onerror);
  }

  function script(cb) {
    var scripts = config.scripts;

    var stream = gulp.src(scripts.src);

    scripts.eslint && (stream = stream.pipe(eslint(eslintConfig)).pipe(eslint.format()));

    config.minify && (stream = stream.pipe(sourcemaps.init()));

    webpackConfig.output.publicPath = config.publicPath;

    stream = stream
      .pipe(webpack(webpackConfig))
      .pipe(frep(patterns));


    config.minify && (stream = stream.pipe(uglify()).pipe(sourcemaps.write()));

    stream = config.version ?
      stream.pipe(rev())
      .pipe(gulp.dest(scripts.exp))
      .pipe(rev.manifest(config.temp + '/js-map.json', {
        base: path.join(cwd, config.temp),
        merge: true
      }))
      .pipe(gulp.dest(config.temp)) :
      stream.pipe(gulp.dest(scripts.exp));
    stream.on('end', function () {
      versionRelay();
    });
    config.livereload && stream.pipe(livereload());

    return stream.on('error', onerror);
  }

  function external() {
    var externals = config.externals;

    var stream = gulp.src(externals.src);
    config.minify && (stream = stream.pipe(uglify()));
    stream = config.version ?
      stream
      .pipe(frep(patterns))
      .pipe(rev())
      .pipe(gulp.dest(externals.exp))
      .pipe(rev.manifest(config.temp + '/external-map.json', {
        base: path.join(cwd, config.temp),
        merge: true
      }))
      .pipe(gulp.dest(config.temp)) :
      stream.pipe(gulp.dest(externals.exp));
    stream.on('end', function () {
      versionRelay();
    });
    config.livereload && stream.pipe(livereload());

    return stream.on('error', onerror);
  }

  // Copy all static images
  function image() {
    var images = config.images;
    var stream =
      gulp.src(images.src)
      .pipe(gulp.dest(images.exp));

    config.livereload && stream.pipe(livereload());

    return stream.on('error', onerror);
  }

  function view(cb) {
    var views = config.views;
    var stream = gulp.src(views.src);

    config.minify && (stream = stream.pipe(uglify()));
    // config.minify && (stream = stream.pipe(minifyHTML()));
    stream = config.version ?
      stream
      .pipe(frep(patterns))
      .pipe(rev())
      .pipe(gulp.dest(views.exp))
      .pipe(rev.manifest(config.temp + '/page-map.json', {
        base: path.join(cwd, config.temp),
        merge: true
      }))
      .pipe(gulp.dest(config.temp)) :
      stream.pipe(gulp.dest(views.exp));

    stream.on('end', function () {
      versionRelay();
    });

    config.livereload && stream.pipe(livereload());

    return stream.on('error', onerror);
  }

  function index(cb) {
    var indexs = config.indexs;
    var stream = gulp.src(indexs.src);
    var manifest = gulp.src(config.temp + '/*.json');

    if (config.version) {
      stream = stream
        .pipe(frep(patterns))
        .pipe(revreplace({
          replaceInExtensions: ['.html', '.htm', '.json'],
          manifest: manifest
        }));
    }

    stream = stream.pipe(gulp.dest(indexs.exp));

    config.livereload && stream.pipe(livereload());

    return stream.on('error', onerror);
  }

  function watch(all) {
    gulp.watch([config.indexs.src], ['indexs']);
    gulp.watch(config.styles.watch, ['styles']);
    gulp.watch(config.scripts.watch, ['scripts']);
    gulp.watch(config.views.src, ['views']);
    gulp.watch(config.images.src, ['images']);
    gulp.watch(path.join(__dirname, 'builder/data/page.config.js'), function () {
      global.setTimeout(rebuild, 2000);
    });
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

    rsync.execute(function (error, code, cmd) {
      error && console.log('err: ', error)
      console.log('cmd: ', cmd);
      code === 0 && console.log(msg);
      cb && cb();
    });
  }

  function build() {
    gulp.src(['./share/**', '!**/**/README.md'])
      .pipe(gulp.dest(path.join(config.exports, 'share')));
    gulp.src(config.vendor.src)
      .pipe(gulp.dest(config.vendor.exp));
    config.watch && watch();
  }

  function rebuild() {
    dele();
    style();
    script();
    image();
    view();
    external();
    index();
    build();
  }

  gulp.task('styles', style);

  gulp.task('scripts', script);

  gulp.task('images', image);

  gulp.task('views', view);

  gulp.task('externals', external);

  gulp.task('indexs', index);

  gulp.task('del', dele);

  gulp.task('rebuild', ['del'], rebuild)

  dele();

  gulp.task('build', ['styles', 'scripts', 'images', 'views', 'externals'], function () {
    build()
    config.livereload && livereload.listen();
  });

  return {
    sync: function (msg) {
      sync(config.sync, '静态资源已同步到开发机: ' + config.sync.dest, function () {
        sync(config.indexs.remote, 'pages已同步到开发机: ' + config.indexs.remote.dest)
      });
    },
    servermock: function () {
      servermock(config.server);
    }
  }
}