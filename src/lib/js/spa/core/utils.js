var datastruct = require('./datastruct');
var LocalStore = require('./local-storage');
function classof(o) {
    return Object.prototype.toString.call(o).slice(8,-1);
}
// 循环解码
function decodeURL(value){
    var temp;
    while((temp = decodeURIComponent(value)) !== value){
        value = temp;
    }
    return temp;
}
function parseURL(url){
    url = url || window.location.search;
    var params = url.slice(url.indexOf('?') + 1);
    var data = {};
    params && params.split('&').forEach(function(item){
        var kv = item.split('=');
        data[kv[0]] = decodeURL(kv[1]);
    });
    return data;
}

function queryStringify(data, search){
    var search = search || '';
    for(var i in data){
        search += (search?'&':'?') + i + '=' + encodeURIComponent(data[i]);
    }
    return search;
}
/**
 * Callbacks 
 * author: shalles
 * email:shalles@163.com
 * create time: 2015.01.02
 * refer to jquery callbacks
 */

function isFunction(fn){
    return typeof fn === 'function';
}

function Callbacks(unique) {
    this.list = [];
    this.unique = !!unique;
}

Callbacks.prototype = {

    // Add a callback or a collection of callbacks to the list
    add: function (fn) {
        if(isFunction(fn)){
            if(this.unique && this.has(fn)){
                this.remove(fn);
            }
            this.list.push(fn);
        }else if(Object.prototype.toString.call(fn) === "[object Array]"){
            for(var i = 0, len = fn.length; i < len; i++){
                 arguments.callee.call(this, fn[i]);   
            }
        }

        return this;
    },

    // Remove a callback from the list
    remove: function (fn) {
        var list = this.list,
            idx;
        if(isFunction(fn)){
            idx = list.indexOf(fn);
            list.splice(idx, 1);
        }
        
        return this;
    },

    // Check if a given callback is in the list.
    has: function (fn) {
        return this.list.indexOf(fn) > -1;
    },

    // Remove all callbacks from the list
    empty: function () {
        if (this.list) {
            this.list = [];
        }
        return this;
    },

    // Call all callbacks with the given context and arguments
    fireWith: function (context, args) {
        var list = this.list;
        for(var i = 0, len; i < list.length; i++){
            list[i].apply(context, args.slice ? args.slice() : args);
        }
        
        return this;
    },

    // Call all the callbacks with the given arguments
    fire: function () {
        this.fireWith(this, arguments);
        return this;
    }
};

function onload(source, callback){
    if(!isFunction(callback)) return;
    source.onload = source.onreadystatechange = function(e){ 
        if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
            callback(e);
        }
    }
}
function loadStyle(href, callback){
    if(!href) return;
    var link = document.createElement('link');
    link.href = href.toString();
    link.rel = 'stylesheet';
    onload(link, callback);
    document.head.appendChild(link);
}
function loadScript(src, callback){
    if(!src) return;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src.toString();
    onload(script, callback);
    document.body.appendChild(script);
}

function upperFirstChar(str){
    return str[0].toUpperCase() + str.slice(1);
}

var utils = {
    ajax: $.ajax,
    extend: $.extend,
    classof: classof,
    isFunction: isFunction,
    parseURL: parseURL,
    decodeURL: decodeURL,
    loadStyle: loadStyle,
    loadScript: loadScript,
    Callbacks: Callbacks,
    LinkStack: datastruct.LinkStack,
    LinkNode: datastruct.LinkNode,
    upperFirstChar: upperFirstChar,
    queryStringify: queryStringify,
    LocalStore: LocalStore,
    vendorPrefix: function(ele, property, val){
        ;['webkit'].forEach(function(prefix){
            ele.style[prefix + upperFirstChar(property)] = val;
        })
        ele.style[property] = val;
    },
    inArray: function(ele, array){
        return array.indexOf(ele) > -1;
    },
    on: function(ele, type, selector, handler){
        $(ele).on(type, selector, handler);
        return this;
    },
    off: function(ele, type, selector, handler){
        $(ele).off(type, selector, handler);
        return this;
    }
};

// weixin android 一些版本不支持classList.add( cls1, cls2, cls3)
;['add', 'remove'].forEach(function(name){
    utils[name+'Class'] = function(ele, classList){
        var type = classof(classList);
        if(type === 'String'){
            ele.classList[name](cls);
        } else if(type === 'Array'){
            classList.forEach(function(cls){
                ele.classList[name](cls);
            })
        }
    }
});
module.exports = utils;