/*
 * $ webpack --config XXX.js   //使用另一份配置文件（比如webpack.config2.js）来打包
 * 
 * $ webpack --watch   //监听变动并自动打包
 * 
 * $ webpack -p    //压缩混淆脚本，这个非常非常重要！
 * 
 * $ webpack -d    //生成map映射文件，告知哪些模块被最终打包到哪里了
 */
var path = require('path');
var webpack = require('webpack');
// var buildConfig = require('build-config');
// var HtmlWebpackPlugin = require('html-webpack-plugin');
// var ExtractTextPlugin = require("extract-text-webpack-plugin");

var cwd = process.cwd();
var entryPath = path.join(cwd, 'src/entries/');
var libPath = path.join(cwd, 'src/lib/js');
var componentPath = path.join(cwd, 'src/components');

module.exports = {
    // 页面入口文件配置, output 是对应输出项配置（即入口文件最终要生成什么名字的文件、存放到哪里），其语法大致为
    entry: {
        'main/entry/js/index': path.join(entryPath, 'main/entry/js/index.js')
		,'main/pageA/js/index' : path.join(entryPath, 'main/pageA/js/index.js')
		,'main/pageB/js/index' : path.join(entryPath, 'main/pageB/js/index.js')
		// {{ @builder create entry }}
        // 'vendor': path.join(libPath, 'zepto.js')
    },
    // 入口文件输出配置
    output: {
        path: entryPath,
        filename: '[name].bundle.js',
        publicPath: '//shalles.org/webapp/', // buildConfig.publicPath,
        sourceMapFilename: '[file].map'
    },
    // 插件项，这里我们使用了一个 CommonsChunkPlugin 的插件，它用于提取多个入口文件的公共脚本部分，然后生成一个 common.js 来方便多页面之间进行复用。
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 2
        })
    ],
    // 
    module: {
        //加载器配置 告知 webpack 每一种文件都需要使用什么加载器来处理
        loaders: [
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.html$/, loader: "html" },
            { test: /\.tpl$/, loader: "html" }
            // 导出文件
            // {
            //     test: /\.css$/,
            //     loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            // },
            //我们需要对不符合规范的模块（比如一些直接返回全局变量的插件）进行 shim 处理，这时候我们需要使用 exports-loader 
            // { test: require.resolve(process.cwd(), "./src/lib/js/zepto.js"),  loader: "exports?swipe"}
        ],

        noParse:[
            // { test: /\.css$/, loader: 'style!css' }
        ]
    },
    //其它解决方案配置
    resolve: {
        // 绝对路径 
        // 从这里开始查找 module 
        root: [
            cwd
        ], 
        modulesDirectories: [
            "web_modules",
            "node_modules"
        ],
        // 自动扩展文件后缀名，我们require模块可以省略不写的后缀名配置
        extensions: ['', '.js', '.json', '.scss'],
        // 别名配置
        alias: {
            "js_lib": path.join(cwd, "src/lib/js"),
            "components": path.join(cwd, "src/components")
        }
    }
};