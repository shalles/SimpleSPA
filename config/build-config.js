var path = require('path');
var config = require('./webpack.config.js');
var mockRules = require('./mock-rules.js');
var exoprtPath = "build/webapp";
module.exports = {
    minify: false,
    version: false, //!DEBUG,
    // 此功能需要安装chrome插件 "https"://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
    livereload: true, //DEBUG,
    watch: true,
    exports: "build/webapp",// 本地静态导出目录
    entries: "src/entries",
    temp: "src/temp",
    // publicPath: "/build/webapp/",//"/build/webapp/",
    publicPathMap: {
        public: '//shalles.org/webapp/', // 上线的时候用
        remote: '/static/webapp/', // 发布到开发机
        local: '/build/webapp/' // 本地
    },
    server:{ //more see servermock "https"://www.npmjs.com/package/servermock or "https"://github.com/shalles/servermock
        "port": 8080,
        "protocol": "http", //https\
        //"key": "~/cert/cert.key",
        //"cert": "~cert/cert.crt",
        "hostname": "0.0.0.0",
        "main": "config/builder/index.html", //""src/export/pages/",
        "plugins":[{
            "name": "mock",
            "open": true,
            "param": {
                "datapath": "config/mock/",
                "mockrc": ".mockrc", //相对mock datapath 可用绝对路径 
                "ignore": ["html", "jpg", "png", "gif"],
                "regexurl": mockRules
            }
        }]
    },
    // 需要上传到服务器的时候启用 且值为远程服务器地址 gulp sync
    sync: {
        "flag": "avz", //详细请再命令行rsync -h : shell(value): --rsh=SHELL; delete(): --delete;  progress(): --progress;  archive(): -a;  compress(): -z;  recursive(): -r;  update(): -u;  quiet(): -q;  dirs(): -d;  links(): -l;  dry(): -n;          
        "source": "build/webapp/*",
        "dest": "shalles@0.0.0.0:/home/webrootstatic/webapp/"
    },
    // 视图页面的目录和导出目录
    views: {
        "src": ["src/entries/**/*.html"],
        "exp": "build/webapp/"
    },
    indexs: {
        "src": ["pages/**/*.html"],//, "pages/**/source-map.json"
        "exp": "build/pages",
        "remote": {
            "flag": "avz",
            "source": "build/pages/main/index.html",
            "dest": "shalles@0.0.0.0:/home/webroot/views/webapp/"
        }
    },
    // 脚本的目录和导出目录
    scripts: {
        "alias": {
            "js_lib": path.join(__dirname, "src/lib"),
            "components": path.join(__dirname, "src/components")
        },
        "eslint": true,
        // "exportType": "require",
        "src": ["src/entries/*.js", "src/entries/**/js/*.js"],
        "watch" : ["src/entries/*.js", "src/entries/**/js/*.js", "src/lib/js/**/*.js", "src/components/**/*.js"],
        "exp": "build/webapp/"
    },
    styles: {
        "scss": true,  //使用scss开发时设为ture
        "style": 'expanded',
        "libs": ["src/lib/css", "src/components", "share"],
        "src": ["src/entries/**/css/index.scss"],
        "watch": ["src/entries/**/css/*.scss", "src/lib/css/*.scss", "src/lib/css/**/*.scss", "src/components/**/*.scss"],
        "exp": "build/webapp/"
    },
    images: {
        "min": false,  //需要压缩图片是设为true
        "src": "src/entries/**/img/*",
        "exp": "build/webapp/"
    },
    vendor: {
        "src": ["src/lib/js/zepto.min.js"],
        "exp": "build/webapp/"
    },
    externals: {
        "src": [ // 这里组件名需要加一个通配符*
            "src/components/components1*/index.js"
        ],
        "exp": "build/webapp/external"
    },
    svn: {
        views: '/Users/shalles/SVN_PATH/views'
    }
}