# Simple SPA webapp

## 项目介绍

### 项目目录及功能介绍

**build**

开发和最终发布的目录结构和导出文件，
目前里面包含两类文件，page和static资源

**config**

这里面我们只有mock-rules.js文件和mock文件夹需要关心，当我们有新接口需要在开发中mock数据的时候，我们需要在mock-rules.js中添加匹配规则，并在mock文件夹中添加相应的mock data文件

下面的可以不用管 需要了解可以去config下的README

**demo**

demo里面按文件夹区分。

如果你写了一个widget，如src/lib/css/widget/w-star-level 你可以在demo文件夹下建一个w-star-level文件夹且里面包含你的测试和使用代码和说明

**pages**

这里是app的主页，这里的页面可能需要放到服务端项目目录里（当然这些都可以在发布的时候去实现）。
前后端分离这也是一种实现方式。如果完全请求静态页面，还需要开跨域等。

**share**

这里面放置可能的共享的资源文件，图片、字体、音频...

**src**

1. **components**（组件目录，为了以后开发效率和稳定一致性，我们还是尽量抽出一些组件来共用）
这里面的组件都应该是如下结构
-component_name
--index.js  （全局挂在或cmd模式）
--index.scss 
--README.md
--js/  (模块)
--css/ (模块)
--tpl/ (结构模板)
--img/

引用的时候

```js
require("components/component_name"); //即可 components是别名，任何地方都这样写都会指定到正确组件目录的，然后别忘了在使用的页面或全局import scss
```

```scss
@import 'component_name/index'; //同样配置了路劲直接指定组件名和文件就可以了
```

2. **entries** 是每个子页面的入口
这里分了一下类，目前只有main

3. lib 顾名思义， lib下放置的是js和css公用的一些功能库文件, 但我们这里扩展一些，把可能公共的文件都放了进来

4. temp 放置一些项目构建中的临时文件，每次构建都会自动删除并重新创建，因此不要在里面放任何东西。他的存在只是便于我们查找当前对应文件的版本。

### 构建说明

```
// 因为依赖libsass 第一次可能需要编译较长时间
$ npm install
```

需要使用浏览器监控文件更新自动刷新需要安装chrome插件[LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)

### 构建工具依赖模块选择

**[webpack](http://webpack.github.io/docs/)**

管理组件component的打包

<!-- **[gulp-fecmd](https://www.npmjs.com/package/gulp-fecmd)** -->
**[webpack](http://webpack.github.io/docs/)**

管理scripts的打包

**[ESLint](https://www.npmjs.com/package/gulp-eslint)**

相比于JSLint和其衍生版JSHint（二者无法根据错误定位到对应的规则），它的初衷就是为了能让开发者能自定义自己的linting rules。而且它提供了一套相当完善的插件机制，可以自由的扩展，动态加载配置规则，同时可以方便的根据报错定位到具体的规则配置。

默认规则里面包含了JSLint和JSHint的规则
可配置为警告和错误两个等级，或者直接禁用掉

**node-sass管理css**

[sass文档参考](http://sass.bootcss.com/docs/sass-reference/)
可以查看lib/css下的文件，定义组件使用色系样式等请参考lib/css/config

### 创建新页面可以使用简单的builder工具

```js
// main.feedback 为新创建的页面name 表示放在main包下的feedback实体 默认url: #feedback
node config/builder/create.js main.feedback

// 当然也有界面操作 
// 直接运行gulp/gulp debug/gulp debug.l/gulp beta.l 只要是启动本地的命令默认都会启动builder的开发操作界面
```

### 构建命令gulp +

```js
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
 *     public: '//shalles.com/webapp/', // 上线的时候用
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

  "scripts": {
    "debug:local": "gulp debug.l",  // 启动本地dev打包规格测试版本
    "debug:remote": "gulp debug.r", // 发布到开发机dev打包规格测试版本
    "debug:public": "gulp debug.p", // 启动本地dev打包规格测试版本 走线上静态文件路径
    "debug:l": "gulp debug.l",
    "debug:r": "gulp debug.r",
    "debug:p": "gulp debug.p",
    "debug:p:r": "gulp debug.p.r",
    "beta:local": "gulp beta.l",    // 启动本地prd打包规格测试版本
    "beta:remote": "gulp beta.r",   // 发布到开发机prd打包规格测试版本
    "beta:public": "gulp beta.p",   // 发布到开发机prd打包规格测试版本 走线上静态文件路径
    "beta:l": "gulp beta.l",
    "beta:r": "gulp beta.r",
    "beta:p": "gulp beta.p",        // 发布到开发机dev打包规格测试版本 走线上静态文件路径
    "beta:p:l": "gulp beta.p.l",    // 启动本地prd打包规格测试版本 走线上静态文件路径
    "public": "gulp public"         // 上线前打包使用 仅打包
  },
```


### 配置开发机免密登陆

需要发布到开发机的时候需要开发机的密码
但我们为了避免每次都输入密码，尽量配置响应开发机的免密登陆

1. 复制自己电脑上的pub ssh key, 一般在`~/.ssh/id_rsa.pub`

`或` **没有则新生成**

```shell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
// 之后一路回车即可 
vim ~/.ssh/id_rsa.pub
// 复制
```

2. 先密码登陆到相应开发机；

```shell
vim ~/.ssh/authorized_keys 
// 然后将复制的自己的pub key 换行追加粘贴到文本后面（记住是追加的形式不要覆盖别人的key）
// 最后保存退出即可
```
