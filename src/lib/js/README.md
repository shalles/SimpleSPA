## Libiary

### [zepto](http://zeptojs.com/)

**引入模块**

MODULES = "zepto event data ajax deferred callbacks touch"


### 别名配置

1. 1.`js_lib` : `src/lib/js`

2. 2.`components` : `src/components`


### utils

utils中包含了$的所有方法

```js
utils = {
    // return Object.prototype.toString.call(o).slice(8,-1);
    classof: function classof(o) {}, 
    inArray2: function(ele, array){}, // 返回boolean 区别于$.inArray
    parseURL: function parseURL(url){},
    decodeURL: function decodeURL(value){},// 循环解码
    loadStyle: function loadStyle(href, callback){},
    loadScript: function loadScript(src, callback){},
    Callbacks: Callbacks,// class $.Callbacks 简版
    Singleton: Singleton,
    simpleTemplate: simpleTemplate,// 简单模板替换  关键字{{ variable }}
    queryStringify: function(data, search){}, //data为参数对象  search为已有location.search
    //函数节流
    throttle: function(fn, operatDelay) {},
    //这个节流函数并不适用与更多场景，比如在web游戏中，键盘事件响应控制人物
    //走动，同时更换播放行走的动画帧,上面这个函数用户的点一下走一下，
    //如果用户想长按连续行走(已知浏览器响应按键事件重复执行的间隔远小于每一
    //行走状态的动画时长即fn执行时间，ps:这里面还有异步的问题)，有一个处理方
    //法是增加一个比动画时间稍长一点的延迟,也是就说在这个延迟之后必须执行下
    //下一次调用执行动画，这里使用operatDelay表示操作(比实际多一点)所需要的时间
    //函数节流改进版
    throttleAni: function(fn, delay, operatDelay) {},
    formatObjectCamel: function(obj){},
    vendorPrefix: function(ele, property, val){},
    copyObjectByArrayTo: function(obj, arr, to){},
    stringifyURL: function(data){},
    // localStore: new LocalStore(),
    isObject: function(){},
    // isArray: $.isArray,
    getBytesLen: function(str) {},
    secondsFormat: function(secondCount) {},
    //绘画文字
    writeText: function(pen, x, y, txt, color, fontStyle) {}
}

module.exports = $.extend({}, $, utils);
```

### local-storage

封装了本地存储的方法，加前缀和存取对象（使用JSON实现因此只支持非循环对象）

### hybrid-adaptor

包含一些第三方平台或DD客户端给我们webapp的一些bridge api

### biz中集中业务的公共方法和数据管理等

### spa中主要是支持单页的一些如路由管理、资源加载、数据管理、页面生命周期及动画管理的方法
