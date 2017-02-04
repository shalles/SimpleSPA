## 常用版

## SPA Page说明

**目录结构**
-default中包含整个app入口的一些

-main.pageA
--js
    入口(index.js) + 其他业务模块
--css
    入口(index.scss) + 其他业务模块
--img
--tpl
入口(index.html)
 
**index.html**

模块内容可以运行时插入。 为减少模块插入时页面大面积重绘（paint）,因此，在index.html中最好放置页面结构模块定位并创建层。

```scss
@charset "utf-8";

/*使用*/
@import 'scss-utils'; /*需引入公共工具库*/
.c-header{
    @extend %compositor-layer;
}
```

如:

```html
window.SimpleSPA.pageHtmlList['main.pageB'] = '\
<header class="c-header"></header>\
<!-- main start -->\

<!-- main end -->\
<!-- footer start -->\

<!-- footer end-->\
```

**index.js**

最简单的用法

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
});
```

用法二：

```js
window.SimpleSPA.pageInit('main.pageB', function(pageEle, pageData){
    //最简单的使用方式
    // 引入依赖
    // var utils = require('js_lib/utils.js');
    // var dialog = require('components/dialog');
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
    // var dialog = require('components/dialog');
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

### 本主要业务

**其他**

看各个页面的README
