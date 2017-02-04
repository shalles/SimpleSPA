/*
 * 开发参数
 */
window.GLOBAL_ENVIORMENT_DEV = false;


require('js_lib/spa/init.js');
var utils = require('js_lib/utils.js');
var dialog = require('components/dialog');
// global 数据主要来自首页进来url等 以与后面的页面共享  页面自身数据需要传到下一页的在go(page, option)中
var SimpleSPA = window.SimpleSPA;
var global = SimpleSPA.global = {};

SimpleSPA.register({
    name: 'entry', // 入口
    url: '#',
    ani: 'ii.as.for',//
    tpl: '<div class="c-loading">\
            <div class="msg">首页<i class="icon-home"></i></div>\
            <button onclick="SimpleSPA.go(\'main.pageA\')">pageA</button><i class="icon-bin"></i>\
          </div>',
    init: function(pageEle, pageData){ //pageData包含了url的所有参数
        console.log('page index')
    }
});

window.SimpleSPA.register({
    name: 'main.pageA',
    title: 'pageA',
    url: '#pageA'
});

window.SimpleSPA.register({
    name: 'main.pageB',
    title: 'pageB',
    url: '#pageB'
});
// {{ @builder create entry }}
// 该注释用于builder 创建新page 勿删

// SimpleSPA.pageSrcMap = window.pageSrcMap;
SimpleSPA.create({
    default: 'default',
    title: '单页webapp',
    share: true,
    ani: 'fir.as.for',
    draggable: false, // !commData.flags.isWeixin, // 微信有自己的drag 切换页面功能
    pageSrcMap: window.pageSrcMap || '/build/webapp/main/source-map.json',
    onBeforeGoPage: function(page){
        dialog.loading();
    },
    onBeforeBackTo: function(page){
        dialog.hide();
    },
    onReady: function(pageEle, pageData){
        dialog.hide();
        global.phone = global.phone || pageData.phone;
    }
});
