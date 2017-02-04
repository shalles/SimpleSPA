/*
 * utils
 * 与业务数据没有任何关系的公共方法
 */
var spaUtils = require('./spa/core/utils.js');

function Singleton(fn) {
    var _ins = null;
    return function() {
        return _ins || (_ins = fn.apply(this, arguments));
    };
}

function simpleTemplate(str, data) {

    if (!str || !data) return '';

    var type = Object.prototype.toString.call(data),
        strRes = '',
        regex = /\{\{\s*(\w+)\s*\}\}/g;

    switch (type) {
        case '[object Array]':
            for (var i = 0, len = data.length; i < len; i++) {
                strRes += simpleTemplate(str, data[i]);
            }
            break;
        case '[object Object]':
            strRes = str.replace(regex, function ($0, $1) {
                return data[$1];
            });
            break;
        case '[object String]':
            strRes = str.replace(regex, data);
            break;
        default:
            strRes = '';
    }

    return strRes;
}

Date.prototype.Format = function(fmt) { //author:    
    var o = {
        "M+": this.getMonth() + 1, //月份   
        "d+": this.getDate(), //日   
        "h+": this.getHours(), //小时   
        "m+": this.getMinutes(), //分   
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var utils = $.extend({}, $, {
    classof: spaUtils.classof,
    inArray2: spaUtils.inArray, // 区别于$.inArray
    parseURL: spaUtils.parseURL,
    decodeURL: spaUtils.decodeURL,
    loadStyle: spaUtils.loadStyle,
    loadScript: spaUtils.loadScript,
    Callbacks: spaUtils.Callbacks, // 区别于$.Callbacks 简化
    Singleton: Singleton,
    simpleTemplate: simpleTemplate,
    queryStringify: spaUtils.queryStringify,
    stringToDate: function(str){
        return new Date(str.replace(/-/g, "/"));
    },
    getRandom: function(min, max) {
        var random = Math.floor(Math.random() * (max - min + 1) + min);
        return random;
    },
    //函数节流
    throttle: function(fn, operatDelay) {
        var timer;
        return function () {
            var self = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(self, args);
            }, operatDelay);
        }
    },
    //这个节流函数并不适用与更多场景，比如在web游戏中，键盘事件响应控制人物
    //走动，同时更换播放行走的动画帧,上面这个函数用户的点一下走一下，
    //如果用户想长按连续行走(已知浏览器响应按键事件重复执行的间隔远小于每一
    //行走状态的动画时长即fn执行时间，ps:这里面还有异步的问题)，有一个处理方
    //法是增加一个比动画时间稍长一点的延迟,也是就说在这个延迟之后必须执行下
    //下一次调用执行动画，这里使用operatDelay表示操作(比实际多一点)所需要的时间
    //函数节流改进版
    throttleAni: function(fn, delay, operatDelay) {
        var timer, start;
        delay = operatDelay < delay ? delay : operatDelay;//必须让动画播放完
        return function () {
            var self = this, cur = new Date(), args = arguments;
            clearTimeout(timer);
            start || (start = cur);
            //超时后直接执行保持连贯
            if (operatDelay <= cur - start) {
                fn.apply(self, args);
                start = cur;
            }
            else {
                timer = setTimeout(function () {
                    fn.apply(self, args)
                }, delay);
            }
        }
    },
    formatServerMsg: function(str, label){
        label = label || 'em';
        return str ? str.replace(/\{/ig, '<' + label + '>').replace(/\}/ig, '</' + label + '>') : '';
    },
    formatObjectCamel: function(obj){
        var o = {}, reg = /_+([\d\w]?)/ig;
        for(var i in obj){
            var val = obj[i];
            i = i.replace(reg, function($0, $1){
                return ('' + $1).toUpperCase();
            });
            o[i] = val;
        }
        return o;
    },
    vendorPrefix: spaUtils.vendorPrefix,
    copyObjectByArrayTo: function(obj, arr, to, en){
        var toObj = to || {};
        arr.forEach(function(i){
            toObj[i] = (en ? encodeURIComponent(obj[i]) : obj[i]) || '';
        });
        return toObj;
    },
    stringifyURL: function(data){
        var url = '';
        for(var i in data){
            url += '&' + i + '=' + encodeURIComponent(data[i] || '');
        }
        return url;
    },
    // localStore: new LocalStore(),
    isObject: function(){
        return classof(data) === 'Object';
    },
    // isArray: $.isArray,
    getBytesLen: function(str) {
        return str ? str.length + str.replace(/[\u0000-\u00ff]/g, "").length : 0;
    },
    secondsFormat: function(secondCount) {
        var oMinute = ~~(secondCount / 60);
        var oSecond = ~~(secondCount % 60);

        if (~~(oMinute / 10) === 0) {
            oMinute = "0" + oMinute;
        }
        if (~~(oSecond / 10) === 0) {
            oSecond = "0" + oSecond;
        }
        return oMinute + ':' + oSecond;
    },
    //绘画文字
    writeText: function(pen, x, y, txt, color, fontStyle) {
        pen.save();
        pen.beginPath();
        pen.lineWidth = 1;
        pen.fillStyle = color;
        pen.font = fontStyle;
        pen.textAlign = "center";
        pen.fillText(txt, x, y);
        pen.restore();
    },
    Guider: function(items){
        var idx = 0;
        this.show = function(id, data){
            idx = id || idx;
            items[idx] && (items[idx].show(this, data) || this.next());
            return this;
        };
        this.next = function(){
            items[idx] && items[idx].hide(this);
            return this.show(++idx);
        };
        this.hide = function(id){
            idx = id || idx;
            items[idx] && items[idx].hide(this);
            return this;
        };
    }
});
// utils open api
module.exports = utils;