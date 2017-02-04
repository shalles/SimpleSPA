## SPA

 loadStyle      loadHtml                loadScript
     |              |                        |
     -------------->|         inner          |          outer
                    |                        |

 |---->  ready
 |循       |  ---------->     init         reg/do  ->    init
 |         v  ---------->  bing event      reg/do  -> bind event 
 |  |--> show                             register ->   onShow
 |  |循    |  ->afterShow->onAfterShow    register -> onAfterShow
 |  |环    v     (一个生命周期只执行一次)
 |  |--- hide                             register ->   onHide
 |         |
 |环       v
 |-----  destroy --------> unbing event --register---->onDestroy
 |                                                         |
 |<---------------------------------------------------------

### Page

```javascript
/**
 * page config中
 *
 * name: 页面名字标识 
 * url: #hash 访问hash
 * ani: 入场动画方式.执行时机.出场动画方式(默认与出场反向)，目前暂只支持这些动画方式，需要的话自己添加，lib/css中有一个动画库，在需要的页面引入即可使用，如果给页面切换效果添加则还需要在page-manager.js的parsePageAnimation方法中配置aniMap
 *     'fir': 'fade-in-right', 
 *     'fil': 'fade-in-left', 
 *     'eid': 'elastic-in-down',
 *     'ii': 'immed-in',
 *     .
 *     bl: before load
 *     bs: before show
 *     al: after load
 *     as: after show
 *     .
 *     'for': 'fade-out-right', 
 *     'fol': 'fade-out-left', 
 *     'io': 'immed-out'
 * tpl: 页面模板 数组表明外链加载  html string直接解析
 *     [{ // 数组只有一个值时use默认为1, 最后一个之和不为1默认最后一个补齐和为1
 *         url: '',
 *         use: 0.6
 *     },{
 *         url: '',
 *         use: 0.4
 *     }]
 *     'html string' //
 * share: default : false | true //处理有的页面可分享 将备用数据存到search上
 * events: SPA提供管理事件的注册方式
 * init: 出事话方法
 * onReady:
 * onShow:
 * onAfterShow:
 * onHide:
 * onDestroy:
 */

/**
 * pageManagerData中 与用户数据分离
 * 
 * status: 页面当前状态
 *     active 当前显示最上层
 *     stack 显示但不在最上层
 *     destroy 已销毁的
 *     unload 未加载的或已卸载的  比如pageA页->pageB页后pageA页不在需要即可unload
 * data: 页面存储数据
 *     
 * id: page dom id 和 页面标识
 * tempSpecial: 临时传输数据 页面销毁时删除
 */
```

**page** 的生命周期

如：A(表示A页面)，B(表示B页面)

每个页面的出现到销毁都会经历如下流程

> register -> loaded -> Ready -> Show -> AfterShow -> Hide -> Destroy

> Destroy -> Ready  -> Show -> AfterShow -> Hide -> Destroy

> Show <=> Hide在一个生命周期内科任意切换（go <=> back）


1. 已有A（afterShow），A->B B->A

A经历了onHide()->onShow()；
B经历了
`register -> loaded -> Ready -> Show -> AfterShow -> Hide -> Destroy`
或B已加载则
`Ready -> Show -> AfterShow -> Hide -> Destroy`
即，back则销毁B,触发destroy

2. 已有A（afterShow），A->B B->A A->B

第二次A->B B不再执行`register -> loaded` 或 `loaded`

3. go/back的时候提供了last参数，这个参数控制当前页的生杀大权 A->B B->(back=退出应用)

A->B的时候，SPA.go('A', {
    get: {},
    last: 'destroy'/'kill'
})

B->back回退，此时B直接回退到了A的前一页，如果没有则退出app。(内部实现其实很简单，'destroy'/'kill'走location.replace()并没有增加新的浏览记录)

这里注意区分一下，`destroy`和`kill`。
destroy和正常的`SPA.back()`，`destroy`销毁当前页一样。
而kill则是将当前页destroy后强制删除了当前页的所有数据，包括页面`管理数据`，页面`逻辑数据`。 也就是后面的流程再也找不到这个页面。

### 路由

使用hash，走浏览器历史记录，监听hashchange，在本地存储可用的时候使用session记录页面间的浏览顺序。使得SPA的兼容性几乎涵盖时下所有平台和版本。

路由状态管理实现核心代码, 可以看到支持本地存储的浏览器不需要`replaceState`  `pushState`的支持，兼容性相对好一些。

```js
var pageStateStore = window.sessionStorage ? new utils.LocalStore('spapm_', true, true) : '';
var routerStateManager = {
    set: function(state, url, href){
        url = url || getHash().hash;
        if(!pageStateStore){
            var _state = history.state || {};
            // 解决一些老版本手机浏览器在用hash改变url后histroy.replaseState时共用一个histroy.state
            _state[url] = state;
            history.replaceState && history.replaceState(_state, '', href || location.href);
        } else {
            pageStateStore.setItem(url, state);
        }
    },
    get: function(url){
        var url = url || getHash().hash;
        if(!pageStateStore){
            var state = history.state || {};
            // 解决一些老版本手机浏览器在用hash改变url后histroy.replaseState时共用一个histroy.state
            if(!state[url]) state[url] = {};
            return state[url];
        } else {
            return pageStateStore.getItem(url);
        }
    },
    remove: function(url){
        pageStateStore.removeItem(url);
    }
}
```

### 资源

可以指定pageSrcMap

1. 值为字符串的时候SPA会当做资源链接去请求json数据（这里要考虑跨域问题）
2. 值为对象map时直接使用

```js
// source-map.json
{
    "main.pageA": [{
        "use": 0.6,
        "page": "/build/webapp/main/pageA/index.html",
        "scripts": ["/build/webapp/main/pageA/js/index.bundle.js"],
        "styles": ["/build/webapp/main/pageA/css/index.css"]
    }],
    "main.pageC": [{
        "page": "/build/webapp/main/pageC/index.html",
        "scripts": ["/build/webapp/main/pageC/js/index.bundle.js"],
        "styles": ["/build/webapp/main/pageC/css/index.css"]
    }],
    "external": {
        "supper-shot.js": "/build/webapp/external/supper-shot/index.js"
    }
}

```

**小流量控制**

SPA的资源加载器sourceManager支持通过以下方式书写页面资源实现灰度。

```html
"main.pageA": [{
    "use": 0.6,
    "page": _baseUrl + "main/pageA/index.html",
    "scripts": [_baseUrl + "main/pageA/js/index.bundle.js"],
    "styles": [_baseUrl + "main/pageA/css/index.css"]
},{
    "use": 0.4,
    "page": _baseUrl + "main/pageA/index_v2.html",
    "scripts": [_baseUrl + "main/pageA/js/index_v2.bundle.js"],
    "styles": [_baseUrl + "main/pageA/css/index_v2.css"]
}],
```


### 事件

1. 事件可以通过SPA提供的配置page.events或方法pageEvents绑定，这样SPA会处理后续销毁
2. 可以在ready后自己处理绑定和销毁
3. 将事件委托到pageEle上 SPA处理后续销毁

### 使用

```js
SPA.register({
    name: 'main.pageA',
    title: 'Simple SPA webapp - pageA',
    url: '#pageA',
    ani: 'eid.as.for',
    tpl: '', //这里支持以字符串形式指定页面内容，且指定后页面不会再重pageSrcMap中加载
    init: function(pageEle, pageData){},
    events: {
        selector_string: {
            event_type: function handler(){}
            event_type2: function handler(){}
        }
    }
});

SPA.register(...)

SPA.create({
    default: 'default',
    title: 'Simple SPA webapp',
    share: true, //加上以后get参数才会显示到url上
    ani: 'fir.as.for',
    draggable: !commData.flags.isWeixin, // 和微信类似的左侧10px滑动回退页面
    pageSrcMap: window.pageSrcMap || document.getElementById('suorce-map').value || '/build/main/source-map.json',
    beforeGoPage: function(page){
        dialog.loading();
    },
    ready: function(pageEle, pageData){
        dialog.hide();
        global.oid || (global.oid = pageData.oid); //
    }
});

```

**index.html**

这里需要用到字符串，但也支持ajax请求（需考虑跨域）

```js
window.SimpleSPA.pageHtmlList['main.pageB'] = '\
<header class="c-header"></header>\
<!-- main start -->\

<!-- main end -->\
<!-- footer start -->\

<!-- footer end-->\
```

**index.js**

```js
window.SimpleSPA.pageInit('main.pageB', function(pageEle, pageData){
    //最简单的使用方式
    // 引入依赖
    // var utils = require('js_lib/utils.js');
    // var commData = require('js_lib/biz/commData.js');
    // var commRequest = require('js_lib/biz/commReq.js');
    // var dialog = require('components/dialog');
    // var Header = require('components/header');
    // var global = window.SimpleSPA.global;

    // 逻辑代码

    // 事件绑定
    // 把事件绑定到pageEle上 框架会去帮你管理和销毁
    // $(pageELe).on('tap', 'selector', function handler(){});

    // 跳转页面
    // commRequest.go 或 commRequest.back 
    // 这两个方法是封装后的以与老webapp项目doJump参数一致，但得知道什么时候go什么时候back
});
```

用法二：

```js
window.SimpleSPA.pageInit('main.pageB', function(pageEle, pageData){
    //最简单的使用方式
    // 引入依赖
    // var utils = require('js_lib/utils.js');
    // var commData = require('js_lib/biz/commData.js');
    // var commRequest = require('js_lib/biz/commReq.js');
    // var dialog = require('components/dialog');
    // var Header = require('components/header');
    // var global = window.SimpleSPA.global;

    // 逻辑代码

    // 可以在逻辑分支中给最有可能的下一页预加载
    // window.SimpleSPA.preLoadPage('main.pageD');
    
    // 跳转页面
    // 在go或back传递给下一个页面的参数中，可以通过get或post的方式传递
    // 如go('main.pageD', {
    //     get: { //get的参数会添加到url上
    //         param1: val1,
    //         param2: val2
    //     },
    //     //或
    //     post: { //post的参数通过session缓存传递
    //         param1: val1,
    //         param2: val2
    //     }
    // })

    // 事件绑定
    // 可以这样绑定事件
    window.SimpleSPA.pageEvents('main.pageB', {
        selector_string: {
            event_type: function(){
                //handler
            },
            event_type2: function(){
                //handler
            }
        } 
    });

    //也可以
    window.SimpleSPA.setPageOption('main.pageB', {
        events: {
            selector_string: {
                event_type: function(){
                    //handler
                },
                event_type2: function(){
                    //handler
                }
            }
        },
        // 当然还可以注册
        onShow: function(pageEle, pageData){
            // 把一些状态轮询的操作都可以放这里，使其只有页面显示的时候才会轮询
        },
        onHide: function(pageEle){
            // 把一些关闭状态轮询的操作都可以放这里，使其只有页面显示的时候才会轮询
        },
        onDestroy: function(pageEle){
            // 把一些页面数据清理的操作放到这里
        }
    });
});
```

用法三：

```js
window.SimpleSPA.pageInit('main.pageB', function(pageEle, pageData){
    //最简单的使用方式
    // 引入依赖
    // var utils = require('js_lib/utils.js');
    // var commData = require('js_lib/biz/commData.js');
    // var commRequest = require('js_lib/biz/commReq.js');
    // var dialog = require('components/dialog');
    // var Header = require('components/header');
    // var global = window.SimpleSPA.global;

    // 逻辑代码

    // 可以在逻辑分支中给最有可能的下一页预加载
    // window.SimpleSPA.preLoadPage('main.pageD');
    
    // 跳转页面
    // 在go或back传递给下一个页面的参数中，可以通过get或post的方式传递
    // 如go('main.pageD', {
    //     get: { //get的参数会添加到url上
    //         param1: val1,
    //         param2: val2
    //     },
    //     //或
    //     post: { //post的参数通过session缓存传递
    //         param1: val1,
    //         param2: val2
    //     }
    // })

    // 事件绑定
    // 可以这样绑定事件
    window.SimpleSPA.pageEvents('main.pageB', {
        selector_string: {
            event_type: function(){
                //handler
            },
            event_type2: function(){
                //handler
            }
        }
    });
});

window.SimpleSPA.setOptionsPromise('main.pageB', {
    events: {
        selector_string: {
            event_type: function(){
                //handler
            },
            event_type2: function(){
                //handler
            }
        }
    },
    // 当然还可以注册
    onShow: function(pageEle, pageData){
        // 把一些状态轮询的操作都可以放这里，使其只有页面显示的时候才会轮询
    },
    onHide: function(pageEle){
        // 把一些关闭状态轮询的操作都可以放这里，使其只有页面显示的时候才会轮询
    },
    onDestroy: function(pageEle){
        // 把一些页面数据清理的操作放到这里
    }
});
```

### openAPI

1.  'go', 
2.  'back', 
3.  'register',
4.  'pageInit',
5.  'getPageData',
6.  'pageEvents',
7.  'killPage',
8.  'preLoadPage', 
9.  'pageOnShow', 
10. 'pageOnHide', 
11. 'pageOnDestroy', 
12. 'setOptionsPromise', 
13. 'setPageOption', 
14. 'updatePage';

#### 1.go

```js
    // pagename 已注册页面的名字， 如指定未注册的页面页面不跳转
    // data 可为空
    // data.get 如果页面开启share 这里的参数会在对应pagename页的url中的hash上
    // data.post
    //          get和post的数据会传到pagename对应的页面的pageData中，不需要自己取
    // data.last 对上一页的操作，这是一个hack的方法，实现pageA到pageB这种状态变化而非实际逻辑页面切换的不可逆情况。如果这个参数为'kill'那么中pageA页跳到pageB页后回退会跳过pageA页直接到pageA历史记录的前一页
    // data.ani可以指定下一个页面出现的动画
    SPA.go(pagename, data);
```

#### 2. back

```js
    // 不指定参数则简单的调用history.back()
    // 指定参数同go
    SPA.back(pagename, data);
```

#### 3. register

```js
    // config 指定page的score配置参数
    //   .name:
    //   .url:
    //   .ani:
    //   .tpl:
    //   .init:
    //   .onShow:
    //   .onAfterShow
    //   .onHide:
    //   .onDestroy
    SPA.register(config)
```

#### 4. pageInit

```js
    // callback(pageEle, pageData)
    // pageEle 当前
    SPA.pageInit(pagename, callback);
```

#### 5. getPageData

```js
    // 获取指定页面数据
    SPA.getPageData(pagename)
```

#### 6. pageEvent

```js
    // register外绑定事件的方法，events结构同register中 page config.events
    SPA.pageEvent(events)
```

#### 7. killPage

```js
    // 删除指定页的所有信息包括页面管理数据和注册信息
    SPA.killPage(pagename);
```

#### 8. preLoadPage

```js
    // 页面资源预加载
    SPA.preLoadPage(pagename)
```

#### 9. pageOnShow

```js
    // 在register外安全的注册指定页的onShow事件
    // callback(pageEle, pageData)
    SPA.pageOnShow(pagename, callback);
```

#### 10.pageOnHide

```js
    // 在register外安全的注册指定页的onHide事件
    // callback(pageEle, pageData)
    SPA.pageOnHide(pagename, callback);
```

#### 11.pageOnDestroy

```js
    // 在register外安全的注册指定页的onDestroy事件
    SPA.pageOnDestroy(pagename, callback);
```

#### 12.setOptionsPromise

```js
    // 在register 或其他回调，包括init 外安全的批量注册指定页的事件
    // options 
    //      .onShow
    //      .onHide
    //      .onDestroy
    //      .events
    // 可在init外使用，只在script先于html和style文件先加载执行的情况
    SPA.setOptionsPromise(pagename, options);
```

#### 13.setPageOption

```js
    // 在register外init内批量注册指定页的事件
    // options 
    //      .onShow
    //      .onHide
    //      .onDestroy
    //      .events
    // 需要在init或onReady内部使用
    SPA.setOptionsPromise(pagename, options);
```

#### 14.updatePage

```js
    // 安全的动态刷新指定页面内容而不执行动画
    SPA.updatePage(pagename);
```

#### 15. define

```js
    // 一个数据和DOM单向绑定的方法
    // 约定key不能以$开头 
    // pageEle: 指定页容器dom,
    // key: 需要定义的变量
    // selector: 变量对应dom选择器
    // value: 初始值
    // callback: 变量改变回调
    // enHtml: 更新dom的值时是否需要编码
    // @return 返回var $data = pageEle.$data
    // 通过$data[key]访问变量并自动更新dom对应值
    // 可以$data[$ + key]访问key对应dom
    SPA.define(pageEle, key, selector, value, callback, enHtml)
```

#### 16. replace

```js
    // 这只是一个go方法的装饰，可以实现histroy的replace功能，走location.replace
    SPA.replace: function(name, data, violent){
        data = data || {};
        data.last = violent ? 'kill' : 'destroy';
        return SPA.go(name, data);
    }
```
