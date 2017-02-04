/* global process */

var gulp = require('gulp');
var frep = require('gulp-frep');
var config = require('./config/build-config.js');
var eslintConfig = require('./config/.eslintrc.js');
/*==START========================================================================*/
/**
 * 命令组成
 * $ gulp task.env
 * gulp 是必须的
 * task:
 * 1. public // 发布上线使用
 * 2. pack // 单独打包
 * 3. sync // 单独发布到指定机器(目前只有开发机权限)
 * 4. beta // beta测试
 * 6. debug // 开发debug
 * 7.       // debug
 * 1,2,3,4打包规格配置是prd上线规格; 5,6,7打包规格配置是dev开发规格
 * 
 * env:
 * public没有远程和本地的区别,
 * public/p      把相对路径替换为线上路径
 * remote/r      把相对路径替换为开发机相对路径
 * local/l/（空） 把相对路径替换为本地相对路径 或 不替换
 * // build-config中配置
 * publicPathMap = {
 *     public: '//shalls.org/webapp/', // 上线的时候用
 *     remote: '/static/webapp/', // 发布到开发机
 *     local: '/build/webapp/' // 本地
 * };
 * $ gulp public // 上线前打包使用
 * $ gulp beta.r 或 beta.remote         // 发布到开发机prd打包规格测试版本
 * $ gulp beta.l 或 beta.local 或 beta   // 启动本地prd打包规格测试版本
 * $ gulp beta.p                        // 发布到开发机prd打包规格测试版本 走线上静态文件路径
 * $ gulp beta.p.l                      // 启动本地prd打包规格测试版本 走线上静态文件路径
 * 
 * $ gulp debug.r 或 debug.remote        // 发布到开发机dev打包规格测试版本
 * $ gulp debug.l 或 debug.local 或 debug // 启动本地dev打包规格测试版本
 * $ gulp debug.p                        // 启动本地dev打包规格测试版本 走线上静态文件路径
 * $ gulp debug.p.r                      // 发布到开发机dev打包规格测试版本 走线上静态文件路径
 * 
 * $ gulp                                // 没有参数则走debug本地build config配置
 */
var params = (process.argv[2] || '').split('.')
var task = params[0];
var ENV = params[1];
var PRD = false;
if (task) {
    PRD = ['public', 'pack', 'sync', 'beta'].indexOf(task) > -1;

    var defTaskENV = {
        public: 'p',
        beta: 'r',
        debug: 'l'
    };

    var shotCmd = {
        p: 'public',
        r: 'remote',
        l: 'local'
    };

    if (!(ENV = ENV ? shotCmd[ENV] || ENV : shotCmd[defTaskENV[task]])) {
        console.error('请指定正确的环境参数');
    }

    switch (task + '.' + ENV) {
        case 'debug.remote':
            config.watch = false;
            config.version = true;
            config.minify = false;
            config.livereload = false;
            break;
        case 'debug.local':
            config.version = true;
            break;
        case 'public.sync':
            ENV = 'public';
            break;
        default:
            break;
    }
}

config.publicPath = config.publicPathMap[ENV] || config.publicPathMap['local'];

/*==============================================================================*/
console.log('pack配置:');
PRD || console.log(
    '\nwatch:\t', config.watch, '\nversion:\t', config.version, '\nminify:\t', config.minify, '\nlivereload:\t', config.livereload
);
console.log('path:\t', config.publicPath)
    /*==============================================================================*/

var build = require('./config/gulpfile.' + (PRD ? 'public' : 'debug') + '.js')(config);

if (PRD) {
    // 发布打包
    gulp.task('public', ['build']);

    gulp.task('pack', ['build']); // 只打包
    gulp.task('sync', build.sync); // 只上传

    // beta测试
    gulp.task('beta', ['build'], build.sync);
    gulp.task('beta.r', ['beta']);
    gulp.task('beta.remote', ['beta.r']);
    gulp.task('beta.l', ['build'], build.servermock);
    gulp.task('beta.local', ['beta.l']);
    gulp.task('beta.p', ['beta.r']);
    gulp.task('beta.p.l', ['beta.l']);

    // 临时 svn -> git 同步git文件到svn
    gulp.task('public.sync', ['public'], function() {
        console.log('正在将build资源同步到svn目录...')
        setTimeout(function(){
            var path = require('path');
            var viewspath = path.join(config.svn.views, 'webapp');

            require('child_process').exec(
                'cp -rf build/pages/main/* ' + viewspath,
                function(error, stdout, stderr) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    console.log('同步完成')
            });
        }, 3000);
    });

}
/*=============================================================*/
else {
    gulp.task('debug', ['build'], build.servermock);
    gulp.task('debug.l', ['debug']);
    gulp.task('debug.local', ['debug.l']);
    gulp.task('debug.r', ['build'], build.sync);
    gulp.task('debug.remote', ['debug.r']);
    gulp.task('debug.p', ['debug.l']);
    gulp.task('debug.p.r', ['debug.r']);

    gulp.task('default', ['debug']);
}