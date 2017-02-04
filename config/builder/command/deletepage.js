var fs = require('fs');
var path = require('path');
var del = require('del');
// var cwd = process.cwd();
// var argv = process.argv;

function genSourceConfigRegEx(pageName) {
  return new RegExp('\"' + pageName + '\": \[\{[\\r\\n ]*\"page\".*[\\r\\n ]*\"scripts\".*[\\r\\n ]*\"styles\".*[\\r\\n ]*\}\],[\\r\\n ]+')
}

function genRegisterRegEx(pageName) {
  return new RegExp('window.SimpleSPA.register\\(\\{[\\r\\n ]*name: *\'' + pageName + '\',([\\r\\n ]*[^})]*)+\\}\\);[\\r\\n ]')
}

function genWebpackRegEx(pageName) {
  pageName = pageName.replace('.', '\\/')
  return new RegExp('[\\n\\r \\t]*,\'' + pageName + '\\/js\\/index\' *: *path.join\\(entryPath, *\'' + pageName + '\\/js\\/index\\.js\'\\)')

}

module.exports = function (page, cwd) {
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

  if (fs.existsSync(packageAbsolutePath)) {
    if (fs.existsSync(entryAbsolutePath)) {
      del.sync(entryAbsolutePath);
    }
    // 处理webpack.config
    var webpackConfigPath = path.join(cwd, 'config/webpack.config.js')
      // console.log('webpackConfigPath:', webpackConfigPath)
    var webpackConfigContent =
      fs.readFileSync(webpackConfigPath).toString()
      .replace(genWebpackRegEx(pageName), '');
    fs.writeFileSync(webpackConfigPath, webpackConfigContent);

    // 处理register
    var registerPath = path.join(packageAbsolutePath, 'entry/js/index.js');
    var registerContent =
      fs.readFileSync(registerPath).toString()
      .replace(genRegisterRegEx(pageName), '');
    fs.writeFileSync(registerPath, registerContent);

    // 处理Page Source Map
    var srcMapPath = path.join(cwd, 'pages', packageName, 'index.html');
    var srcMapContent =
      fs.readFileSync(srcMapPath).toString()
      .replace(genSourceConfigRegEx(pageName), '');
    fs.writeFileSync(srcMapPath, srcMapContent);

    var msg = pageName + '删除成功';
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
  }
}