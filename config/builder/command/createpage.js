var fs = require('fs');
var path = require('path');
// var cwd = process.cwd();
// var argv = process.argv;

module.exports = function(page, cwd){
var config = require(path.join(cwd, 'config/build-config'));

var pageName = page.name;
var pagePathInfo = pageName.split('.');
var packageName = pagePathInfo[0];
var pageEntryName = pagePathInfo[1];
var pageUrl = '#' + (page.url || pageEntryName);

// 相对 cwd
var packageRelativePath = path.join(config.entries, packageName);
var packageAbsolutePath = path.join(cwd, packageRelativePath);

// 相对 config.entries
var entryRelativePath = path.join(packageName, pageEntryName);

var entryAbsolutePath = path.join(packageAbsolutePath, pageEntryName);

if(fs.existsSync(packageAbsolutePath)){
    if(fs.existsSync(entryAbsolutePath)) {
        var msg = '实体' + pageName + '已存在' + entryAbsolutePath;
        console.error(msg);
        return {
            errno: 1,
            errmsg: msg
        }; //已存在则退出
    }
    // 处理webpack.config
    var webpackConfigPath = path.join(cwd, 'config/webpack.config.js')
    // console.log('webpackConfigPath:', webpackConfigPath)
    var webpackConfigContent = 
        fs.readFileSync(webpackConfigPath).toString()
            .replace(/\/\/\s*\{\{\s*@builder\s*create\s*entry\s*\}\}/, 
            ",'" + entryRelativePath + "/js/index' : path.join(entryPath, '" + 
            entryRelativePath + "/js/index.js')\n\t\t// {{ @builder create entry }}");
    fs.writeFileSync(webpackConfigPath, webpackConfigContent);
    // 处理Page Source Map
    var srcMapPath = path.join(cwd, 'pages', packageName, 'index.html');
    var srcMapContent = 
        fs.readFileSync(srcMapPath).toString()
          .replace(/\/\/\s*\{\{\s*@builder\s*create\s*entry\s*\}\}/,
            '"' + pageName + '": [{\n\
                "page": _baseUrl + "' + entryRelativePath + '/index.html",\n\
                "scripts": [_baseUrl + "' + entryRelativePath + '/js/index.bundle.js"],\n\
                "styles": [_baseUrl + "' + entryRelativePath + '/css/index.css"]\n\
            }],\n\
            // {{ @builder create entry }}');
    fs.writeFileSync(srcMapPath, srcMapContent);
    
    // 处理register
    var registerPath = path.join(packageAbsolutePath, 'entry/js/index.js');
    var registerContent = 
        fs.readFileSync(registerPath).toString()
          .replace(/\/\/\s*\{\{\s*@builder\s*create\s*entry\s*\}\}/, "\n\
window.SimpleSPA.register({\n\
    name: '"+ pageName +"',\n\
    title: '" + pageEntryName +"',\n\
    url: '"+ pageUrl +"'\n\
});\n\
// {{ @builder create entry }}");
    fs.writeFileSync(registerPath, registerContent);

    // 创建entry目录
    fs.mkdirSync(entryAbsolutePath);
    fs.writeFileSync(path.join(entryAbsolutePath, 'README.md'), '## ' + pageName);
    fs.writeFileSync(path.join(entryAbsolutePath, 'index.html'), 
        "window.SimpleSPA.pageHtmlList['" + pageName + "'] = '" + pageName + "页面模板填充';");
    var scriptPath = path.join(entryAbsolutePath, 'js');
    fs.mkdirSync(scriptPath);
    fs.writeFileSync(path.join(scriptPath, 'index.js'), "\
window.SimpleSPA.pageInit('"+ pageName +"', function(pageEle, pageData){\
\n//外部初始化\n\
});");
    var stylePath = path.join(entryAbsolutePath, 'css');
    fs.mkdirSync(stylePath);
    fs.writeFileSync(path.join(stylePath, 'index.scss'), "\
@charset 'utf-8';\n\
@import 'scss-utils';\n\
\n#"+ pageName.replace('.', '-') +" {\n\
    background-color: rgb(" + Math.random() * 255 + "," + Math.random() * 255 + ","+ Math.random() * 255 + ");\n}");

    fs.mkdirSync(path.join(entryAbsolutePath, 'img'));

    var msg = '\n\n新页面已创建, 您可以查看：\n\
                \nentry目录:' + entryAbsolutePath +
                '\nwebpack配置文件:' + webpackConfigPath +
                '\npage suorce map配置文件:' + srcMapPath +
                '\npage注册配置文件:' + registerPath +
                '\n\n'
    console.log(msg);
    return {
        errno: 0,
        errmsg: msg,
        page: {
            name: page.name,
            url: pageUrl
        },
        entry: entryAbsolutePath,
        webpack: webpackConfigPath,
        pagesuorcemap: srcMapPath,
        register: registerPath
    }
} else {
    fs.mkdirSync(packageAbsolutePath);
    arguments.callee(page, cwd);
}
}