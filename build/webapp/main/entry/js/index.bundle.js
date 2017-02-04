webpackJsonp([0,3],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * 开发参数
	 */
	window.GLOBAL_ENVIORMENT_DEV = false;


	__webpack_require__(1);
	var utils = __webpack_require__(6);
	var dialog = __webpack_require__(7);
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var PageManager = __webpack_require__(5);

	// 可能依赖全局变量
	// window.pageSrcMap
	// window.SimpleSPA.pageHtmlList

	var openAPI = ['go', 'back', 'pageInit', 'register', 'getPageData', 'pageEvents', 'killPage', 'preLoadPage', 'pageOnShow', 'pageOnHide', 'pageOnDestroy', 'setOptionsPromise', 'setPageOption', 'updatePage'];

	window.SimpleSPA = {
	    global: {},
	    pageHtmlList: [],
	    pageSrcMap: [],
	    create: function(config){
	        // create保证参数的有效性，PageManager不做过多处理
	        config = utils.extend(true, {
	            selector: '#page-container',
	            default: 'index', // name
	            title: '', // 默认title
	            draggable: false,
	            sourceCache: true,
	            ani: 'fir.as.for', // 指定所有页面的默认规则 针对每个页面可独立设置
	            loadErrorTpl: './pages/page-load-error.html'
	        }, config);
	        window.SimpleSPA.pageSrcMap = config.pageSrcMap;
	        config.pageHtmlList = window.SimpleSPA.pageHtmlList;
	        PageManager.init(config);
	    },
	    replace: function(name, data, violent){
	        data = data || {};
	        data.last = violent ? 'kill' : 'destroy';
	        return window.SimpleSPA.go(name, data);
	    },
	    // 约定key最好不要以$开头 
	    define: function(pageEle, key, selector, value, callback, enHtml){

	        if(utils.classof(key) === 'Array'){
	            key.forEach(function(item){
	                defineProp(item.key, item.selector, item.value, item.callback, item.enHtml)
	            });
	        } else {
	            defineProp(key, selector, value, callback, enHtml);
	        }

	        function defineProp(key, selector, value, callback, enHtml){
	            var $data = pageEle.$data || {};
	            // if(!pageEle.$data) pageEle.$data = {};
	            var dom = pageEle.querySelector(selector);
	            if(!dom) return false;
	            if(!$data[key]){
	                Object.defineProperty($data, key, {
	                    enumerable: true,
	                    configurable: false,
	                    // writable: true,
	                    // value: value,
	                    get: function(){
	                        return dom.innerHTML || '';
	                    },
	                    set: function(value){
	                        dom.innerHTML = value;
	                    }
	                });
	                value && ($data[key] = value);
	                $data['$'+key]= dom;
	                pageEle.$data = $data;
	            }
	        }
	        
	        return pageEle.$data;
	    }
	}

	openAPI.forEach(function(key){
	    window.SimpleSPA[key] = function(){
	        PageManager[key].apply(PageManager, arguments);
	        return this;
	    }
	});

	module.exports = window.SimpleSPA;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var datastruct = __webpack_require__(3);
	var LocalStore = __webpack_require__(4);
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

/***/ },
/* 3 */
/***/ function(module, exports) {

	function LinkNode(val){
	    this.value = val || {};
	    this.prev = null;
	    this.next = null;
	}

	function LinkStack(val){
	    this.head = new LinkNode(val);
	    this.last = this.head;
	    this.length = 1;
	}

	LinkStack.prototype = {
	    find: function(val){
	        for(var curNode = this.last; curNode; curNode = curNode.prev){
	            if(curNode.value === val)
	                return curNode;
	        }
	        return false;
	    },
	    lastIndexOf: function(val){
	        var idx = 1;
	        var self = this;
	        for(var curNode = this.last; curNode; curNode = curNode.prev){
	            idx--;
	            if(curNode.value === val)
	                return idx;
	        }
	        return idx;
	    },
	    push: function(val){
	        return this.insert(val);
	    },
	    pop: function(){
	        return this.remove();
	    },
	    remove: function(val){
	        var node = val ? this.find(val) : this.last;
	        if(node){
	            if(node === this.last){
	                this.last = node.prev;
	            } else {
	                node.next.prev = node.prev;
	            }

	            if(node === this.head){
	                this.head = node.next;
	            } else {
	                node.prev.next = node.next;
	            }
	            node.next = node.prev = null;
	            // console.log('remove:', node);
	            this.length--;
	            return node;
	        }
	        return false;
	    },
	    insert: function(val, behindNode){
	        // var node = this.find(key, val);
	        var node = new LinkNode(val);

	        if(behindNode){
	            node.next = behindNode; 
	            if(behindNode === this.head) {
	                this.head = node;
	            } else {
	                behindNode.prev.next = node;
	                node.prev = behindNode.prev;
	            }
	            behindNode.prev = node;

	        } else { // 没有参照节点 执行push操作
	            node.prev = this.last;
	            this.last.next = node,
	            this.last = node;
	        }
	        // console.log('insert:', node);
	        this.length++;
	        return node;
	    }
	}


	module.exports = {
	    LinkStack: LinkStack,
	    LinkNode: LinkNode
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	/*
	 * LocalStore 存储各种数据类型的数据到localStorage或cookie(已删除 业务只在移动设备上使用暂不考虑不支持localStorage的设备)
	 * 
	 * name 存储名
	 * notStr:存储值不是字符串的所有类型，Boolean Number Object Array
	 */
	function LocalStore(prefix, notStr, isSession) {
	    var storage = isSession ? window.sessionStorage : window.localStorage;
	    prefix = prefix ? prefix + '_' : '';
	    //注意动态改变local name值后要用getItem(name)或setItem(name,value)回置
	    this.setItem = notStr ? function (name, value) {//value能为空 name不能为空
	        try{
	            storage.setItem(prefix + name, JSON.stringify(value || {}));
	        } catch(e){
	            console.log(e);
	        }
	    } : function (name, value) {
	        storage.setItem(prefix + name, value);
	    }
	    this.getItem = notStr ? function (name) {
	        var val = storage.getItem(prefix + name) || '{}';
	        try {
	            return JSON.parse(val);
	        } catch(e){
	            console.log(e);
	        }
	        return val;
	    } : function (name) {
	        return storage.getItem(prefix + name);
	    }
	    this.removeItem = function(name){
	        return storage.removeItem(prefix + name);
	    }
	}

	module.exports = LocalStore;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * PageManager
	 * 
	 */
	var utils = __webpack_require__(2);

	var pageIndex = 1; // 页面
	var pageConfig = {}; // 针对多有页面初始配置  也做备用默认值
	var defaultPage = null; // 默认页面
	var curActivityPage = null;
	var pageStorageList = []; // 已注册页面
	var pagesHistoryLinkStack; // 活动时页面访问link链
	var pagesContainerEle = null;
	var pageManagerData = {}; // pageManager 管理页面渲染的数据
	var pageDataContainer = {}; // 每个页面使用的数据
	var pageHtmlList = [];

	var pageStateStore = window.sessionStorage ? new utils.LocalStore('spapm_', true, true) : '';

	var pageContainer = {
	    pageSlideTime: 800,
	    pageReaderTime: 200,
	    srcMap: {},
	    // width: innerWidth,
	    // height: innerHeight,
	    lenMax: 100,
	    updataLenMax: 80,
	    dragRTL: false,
	    dragLTR: false,
	    dragTTB: false,
	    lenLTR: 0,
	    lenRTL: 0,
	    lenTTB: 0,
	    dragLimitTop: 20,
	    dragLimitLeft: 10,
	    dragLimitRigth: innerWidth - 10
	}

	var staticSourceCacheStarage;

	function getHash(hash){
	    hash = (hash || location.hash).split('?');
	    return {
	        hash: hash[0],
	        search: hash[1]
	    };
	}

	function animationEnd(ele, callback, off){
	    var bind = off ? 'off' : 'on';
	    ('onanimationend' in window) ? utils[bind](ele, 'animationend', callback) :
	        utils[bind](ele, 'webkitAnimationEnd', callback);
	}
	function parsePageAnimation(page){
	    // 动画可以更具当前go或back指定而改变  //show动画.执行时机.hide动画
	    var aniMap = {
	        'fir': 'fade-in-right', 
	        'for': 'fade-out-right', 
	        'fol': 'fade-out-left', 
	        'fil': 'fade-in-left', 
	        'eid': 'elastic-in-down',
	        'ii': 'immed-in',
	        'io': 'immed-out'
	    };
	    var timeMap = {
	        'bl': 'before-load',
	        'al': 'after-load',
	        'bs': 'before-show',
	        'as': 'after-show'
	    };
	    var special = pageManagerData[page.name].tempSpecial;
	    var param = (special && special.ani || page.ani || pageConfig.ani).split('.');
	    param = [
	        aniMap[param[0]] && param[0], 
	        timeMap[param[1]] && param[1], 
	        aniMap[param[2]] && param[2]
	    ];
	    param = utils.extend(true, {}, {ani: pageConfig.aniObject}, {ani: param}).ani;
	    
	    return {
	        init: 'ani-' + param[0],
	        show: aniMap[param[0]],
	        time: param[1],
	        hide: aniMap[param[2]],
	        flag: param.join('.')
	    };
	}
	// 加载页面模板
	function loadTemplate(url, callback, type){
	    utils.ajax({
	        url: url,
	        data: type ? { timestamp: Date.now } : {},
	        dataType: type || 'text', // or text
	        success: callback,
	        error: function(){
	            // callback(require(pageConfig.loadErrorTpl));
	        }
	    });
	}

	var sourceManager = {
	    loadStyle: function(name, href){
	        var curPageMData = pageManagerData[name];
	        function cb(){
	            curPageMData.onStyleLoadCB.fire();
	            curPageMData.styleLoaded = true;
	        }
	        if(curPageMData.styleLoaded || !href) return (cb(),true);

	        utils.loadStyle(href, function(e){
	            // console.log(e);
	            setTimeout(cb, 200);
	        });
	    },
	    loadScript: function(name, src){
	        var curPageMData = pageManagerData[name];
	        function cb(){ 
	            curPageMData.scriptsLoaded = true;
	        }
	        if(curPageMData.scriptsLoaded || !src) return (cb(), true);
	        
	        utils.loadScript(src, cb);
	    },
	    load: function(name, src, callback){
	        var curPageMData = pageManagerData[name];
	        src.styles = src.styles || curPageMData.page.styles;
	        src.scripts = src.scripts || curPageMData.page.scripts;
	        sourceManager.loadStyle(name, src.styles);
	        sourceManager.loadScript(name, src.scripts);
	        // console.log(name, curPageMData.page.tpl, pageHtmlList, window.SimpleSPA.pageHtmlList);
	        var tpl = curPageMData.page.tpl || pageHtmlList[name];
	        var storeName = name + '.html';

	        var htmlShowArterStyleLoadedPromise = function(){
	            if(!curPageMData.page.tpl){
	                curPageMData.page.tpl = pageHtmlList[name];
	                pageConfig.sourceCache && staticSourceCacheStarage.setItem(storeName, {
	                    path: src.page,
	                    content: curPageMData.page.tpl
	                });
	                pageHtmlList[name] = '';
	            }

	            curPageMData.styleLoaded ? callback() :
	                curPageMData.onStyleLoadCB.remove(callback).add(function(){
	                    curPageMData.styleLoaded ? curPageMData.onStyleLoadCB.remove(callback) : callback();
	                });
	        }

	        if(tpl){        
	            htmlShowArterStyleLoadedPromise();
	        } else {
	            if(pageConfig.sourceCache){
	                var cacheHTML = staticSourceCacheStarage.getItem(storeName) || {};
	                if(cacheHTML.path === src.page){
	                    curPageMData.page.tpl = cacheHTML.content;
	                    htmlShowArterStyleLoadedPromise();
	                } else {
	                    cacheHTML.path && staticSourceCacheStarage.removeItem(storeName);
	                    utils.loadScript(src.page, htmlShowArterStyleLoadedPromise);
	                }
	            } else {
	                utils.loadScript(src.page, htmlShowArterStyleLoadedPromise);
	            }
	        }
	    },
	    parse: function(name, callback){
	        var sourceList = pageContainer.srcMap[name];
	        var srcLen;
	        if(!sourceList || (srcLen = sourceList.length) === 0){
	            sourceManager.load(name, {}, callback);
	        } else if(srcLen === 1){
	            sourceManager.load(name, sourceList[0], callback);
	        } else {
	            var use = 0;
	            var random = Math.random(); // 0-1之间 超过的忽略

	            for(var i = 0; i < srcLen; i++){
	                var min = use, src = sourceList[0];
	                use += src.use;
	                if(srcLen - i === 1) use = 1; // 最后一个灰度总值不足1补齐
	                if(min < random && random <= use){
	                    sourceList = [src]; // 不刷新单页之间跳转不走灰度判断
	                    sourceManager.load(name, src, callback);
	                    break;
	                }
	            }
	        }
	    }
	}

	var pageRequestData = {
	    get: function(name){
	        var data = pageManagerData[name].tempSpecial;
	        if(!data){
	            data = {};
	            try{
	                data.get = utils.extend(utils.parseURL(location.search), utils.parseURL(getHash().search));
	                data.post = JSON.parse(window.sessionStorage.getItem(pageManagerData[name].id) || '{}');
	            } catch(e){};
	            pageManagerData[name].tempSpecial = data;
	        }
	        // post 大还是 get 大还有待商议
	        return utils.extend({}, data.get, data.post);
	    },
	    set: function(name, data, hash){
	        if(data.post){
	            try{
	                var id = pageManagerData[name].id;
	                window.sessionStorage.setItem(id, JSON.stringify(data.post));
	            } catch(e){}
	        }
	        if(data.get){
	            var hashObj = getHash(hash || '#');
	            var search = hashObj.search;
	            var hashData = search && utils.parseURL(search) || {};
	            // hashData._timestamp = Date.now();
	            utils.extend(true, hashData, data.get);
	            hash = hashObj.hash;
	            search = utils.queryStringify(hashData);
	        }
	        return search;
	    }
	}

	var pageRender = {
	    show: function(page, beforeId){
	        var pageEle = document.createElement('div');
	        var curPageMData = pageManagerData[page.name];

	        pageEle.id = curPageMData.id;
	        pageEle.dataset.name = page.name;
	        pageEle.className = 'page ' + curPageMData.id;
	        pageConfig.draggable && pageEle.classList.add('draggable');

	        curPageMData.ani = parsePageAnimation(page);
	        // console.log(page, curPageMData.ani);

	        switch(curPageMData.ani.time){
	        // case 'bl': 
	        // case 'al': 
	        // case 'bs':
	        // 默认：动画 after show
	        case 'as': 
	        default:
	            sourceManager.parse(page.name, function(){
	                
	                var requestData = pageRequestData.get(page.name);
	                //debugger
	                pageEle.innerHTML = curPageMData.page.tpl;

	                if(beforeId /*&& curPageMData.ani.init === 'imi'*/){

	                    var referEle = document.getElementById(beforeId);
	                    referEle ?
	                        pagesContainerEle.insertBefore(pageEle, referEle) :
	                        pagesContainerEle.appendChild(pageEle);
	                    curPageMData.onReadyCB.fire(pageEle, requestData); //DOM ready
	                    curPageMData.onShowCB.fire(pageEle, requestData); // onShow
	                    curPageMData.onAfterShowCB.fire();

	                } else {
	                    if(!pagesHistoryLinkStack) {
	                        pagesHistoryLinkStack = new utils.LinkStack(page);
	                    } else {
	                        pagesHistoryLinkStack.push(page);
	                    }

	                    pageEle.classList.remove('d-hide');
	                    pageEle.classList.add(curPageMData.ani.init);
	                    pagesContainerEle.appendChild(pageEle);
	                    curPageMData.onReadyCB.fire(pageEle, requestData); //DOM ready
	                    // curPageMData.onRenderCB.fire(pageEle, requestData);
	                    setTimeout(function(){
	                        pageEle.classList.remove(curPageMData.ani.init);
	                        utils.addClass(pageEle, ['ani', curPageMData.ani.show]);
	                        animationEnd(pageEle, function(){
	                            animationEnd(pageEle, null, true);
	                            utils.removeClass(pageEle, ['ani', curPageMData.ani.show]);
	                            // 隐藏底下的页面
	                            var prevPage = pagesHistoryLinkStack.last.prev, prevPageMData, prevEle;
	                            if(prevPage && (prevPage = prevPage.value)){
	                                if((prevPageMData = pageManagerData[prevPage.name]) &&
	                                    (prevEle = document.getElementById(prevPageMData.id))){
	                                    prevEle && prevEle.classList.add('d-hide');
	                                    prevPageMData.onHideCB.fire(prevEle, pageRequestData.get(prevPage.name));
	                                }
	                            }
	                            curPageMData.onAfterShowCB.fire();
	                        });

	                        curPageMData.onShowCB.fire(pageEle, requestData); // onShow
	                    }, pageContainer.pageReaderTime);
	                }
	            });
	        }
	    },
	    hide: function(page, justDestory){
	        var pageEle;
	        if(justDestory !== true){
	            var lastPage = pagesHistoryLinkStack.last, lastPageMData, lastEle;
	            // 返回后底下的页面显示则触发showCB
	            if(lastPage && (lastPage = lastPage.value)){
	                if((lastPageMData = pageManagerData[lastPage.name]) &&
	                    (lastEle = document.getElementById(lastPageMData.id))){
	                    lastEle.classList.remove('d-hide');
	                    lastPageMData.onShowCB.fire(lastEle, pageRequestData.get(lastPage.name));
	                }
	            }
	        }

	        var curPageMData = pageManagerData[page.name];
	        if(!(curPageMData.id && (pageEle = document.getElementById(curPageMData.id)))) return;

	        // 此时页面的状态已不需要更新 触发hide
	        curPageMData.onHideCB.fire(pageEle);

	        // 等待imi show的页面渲染
	        function hidePageAni(){ 
	            utils.addClass(pageEle, ['ani', curPageMData.ani.hide]);
	        }

	        curPageMData.ani.init === 'imi' ? hidePageAni() : 
	            setTimeout(hidePageAni, pageContainer.pageReaderTime);

	        function hideAnimationEnd(){
	            // pageEle.classList.add('hide');
	            // utils.removeClass(pageEle, ['ani', curPageMData.ani.hide]);
	            // 动画完成销毁页面  spa设计在此后销毁page 即返回则移除
	            curPageMData.onDestroyCB.fire(pageEle);
	            setTimeout(function(){
	                // if(pageEle in pagesContainerEle.childNodes){
	                    pagesContainerEle.removeChild(pageEle);
	                // }
	                // callback && callback();
	            }, 300);
	        }
	        justDestory === true ? hideAnimationEnd():
	            animationEnd(pageEle, function(){
	                animationEnd(pageEle, null, true);
	                hideAnimationEnd();
	            });
	    }
	}

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

	var PageManager = {
	    init: function(config){
	        var self = this;
	        pageConfig = utils.extend(true, pageConfig, config);
	        pageHtmlList = config.pageHtmlList;
	        //
	        staticSourceCacheStarage = pageConfig.sourceCache && new utils.LocalStore('spapm', true);
	        // 加载source map
	        if(typeof pageConfig.pageSrcMap === 'string'){
	            // 这里可能需要跨域
	            loadTemplate(pageConfig.pageSrcMap, function(srcMap){
	                init(srcMap);
	            }, 'json');
	        } else {
	            init(pageConfig.pageSrcMap);
	        }
	        function init(srcMap){
	            pageContainer.srcMap = srcMap;

	            pageConfig.aniObject = pageConfig.ani.split('.');

	            if(!(pageConfig.selector && (pagesContainerEle = document.querySelector(pageConfig.selector)))){
	                pagesContainerEle = document.createElement('div');
	                pagesContainerEle.id = pagesContainerEle.className = 'page-container';
	            }

	            defaultPage = self.find(pageConfig.default);
	            // popstate
	            utils.on(window, 'hashchange', function () {
	                var page = self.findByUrl();
	                // debugger
	                // if(!page) return; // 支持页面id锚点
	                curActivityPage = page || curActivityPage;
	                var state = routerStateManager.get();
	                // 在页面前面或活动链表里的用back
	                if (state.pageIndex <= pageIndex || page && 
	                    (pagesHistoryLinkStack.find(page) ||
	                    pageManagerData[page.name].tempSpecial && 
	                    pageManagerData[page.name].tempSpecial.last === 'back')) {

	                    page ? self.backTo(page) : history.back();
	                } else {
	                    // TODO: 写step-panel组件在一个页面实现状态变化逻辑
	                    page && self.goPage(page);
	                }
	            })
	            
	            // 页面滑动翻页
	            if(pageConfig.draggable){
	                var touchEndOrCancelHandler = function(e){
	                    // e.stopPropagation();
	                    var touch = e.changedTouches[0];
	                    if(pageContainer.dragLTR){
	                        pageContainer.dragLTR = false;
	                        if(pageContainer.lenLTR > pageContainer.lenMax){
	                            pageContainer.lenLTR = 0;
	                            e.currentTarget.classList.remove('drag-ltr');
	                            self.back();
	                        } else{
	                            pageContainer.lenLTR = 0;
	                            // e.currentTarget.style.left = pageContainer.lenLTR + 'px';
	                            utils.vendorPrefix(e.currentTarget, 'transform', 'translate3d('+ pageContainer.lenLTR +'px,0,0)');
	                        }
	                    } 
	                    else if(pageContainer.dragTTB){
	                        pageContainer.dragTTB = false;
	                        document.body.classList.remove('spa-update');
	                        if(pageContainer.lenTTB >= pageContainer.updataLenMax){
	                            pageContainer.lenTTB = 0;
	                            document.body.classList.add('spa-update-end');
	                            location.reload();
	                        } else if(pageContainer.lenTTB) {
	                            pageContainer.lenTTB = 0;
	                            utils.vendorPrefix(pagesContainerEle, 'transform', 'translate3d(0,'+ pageContainer.lenTTB +'px,0)');
	                        }

	                    }
	                }
	                utils.on(pagesContainerEle, 'touchstart', '.page.draggable', function(e){
	                    // e.stopPropagation();
	                    var touch = e.changedTouches[0];
	                    if(pageContainer.dragLTR || pageContainer.dragRTL) return;
	                    if(touch.clientX < pageContainer.dragLimitLeft){
	                        pageContainer.dragLTR = true;
	                        e.currentTarget.classList.add('drag-ltr');
	                    } 
	                    else if(touch.clientY < pageContainer.dragLimitTop){
	                        pageContainer.dragTTB = true;
	                        document.body.classList.add('spa-update');
	                        // e.currentTarget.classList.add('drag-ttb');
	                    }
	                })
	                .on(pagesContainerEle, 'touchmove', '.page.draggable', function(e){
	                    var touch = e.changedTouches[0];
	                    if(pageContainer.dragLTR){
	                        pageContainer.lenLTR = touch.clientX;
	                        // e.currentTarget.style.left = pageContainer.lenLTR + 'px';
	                        utils.vendorPrefix(e.currentTarget, 'transform', 'translate3d('+ pageContainer.lenLTR +'px,0,0)');
	                    } 
	                    else if(pageContainer.dragTTB){
	                        pageContainer.lenTTB = touch.clientY > pageContainer.updataLenMax ? pageContainer.updataLenMax : touch.clientY;
	                        // e.currentTarget.style.right = pageContainer.lenRTL + 'px';
	                        utils.vendorPrefix(pagesContainerEle, 'transform', 'translate3d(0,'+ pageContainer.lenTTB +'px,0)');
	                    }
	                })
	                .on(pagesContainerEle, 'touchend', '.page.draggable', touchEndOrCancelHandler)
	                .on(pagesContainerEle, 'touchcancel', '.page.draggable', touchEndOrCancelHandler);
	            }

	            var page = self.findByUrl();
	            if(page){
	                curActivityPage = page;
	                var _state = routerStateManager.get(page.url);
	                if (_state && _state.pageIndex) {
	                    pageIndex = _state.pageIndex;
	                }

	                pageIndex--;
	                self.goPage(page);
	            }
	        }

	        return this;
	    },
	    register: function(page){
	        var self = this;
	        // 必要数据处理
	        if(this.find('name', page.name)) throw Error('param error page name 不唯一， 重复name:'+page.name);
	        if(this.find('url', page.url)) throw Error('param error page url 不唯一， 重复url:'+page.url);
	        
	        var curPageMData = pageManagerData[page.name] = {};
	        curPageMData.status = 'register';
	        curPageMData.id = page.name.replace(/[.#]/g, '-');
	        curPageMData.page = page;

	        curPageMData.onStyleLoadCB = new utils.Callbacks(true); // load page tpl
	        curPageMData.onReadyCB = new utils.Callbacks(true); // one page init once
	        curPageMData.onShowCB = new utils.Callbacks(true); // one page could show hide many times
	        curPageMData.onAfterShowCB = new utils.Callbacks(true); // one page render once
	        curPageMData.onHideCB = new utils.Callbacks(true);
	        curPageMData.onDestroyCB = new utils.Callbacks(true); // one page destroy once

	        curPageMData.onReadyCB.add(function(pageEle, requestData){
	            curPageMData.status = 'ready';
	            // console.log(page.name, 'ready');

	            pageConfig.onReady && pageConfig.onReady(pageEle, requestData);
	            page.onReady && page.onReady(pageEle, requestData);

	            page.init && page.init(pageEle, requestData);
	            page.events && self.bindEvent(pageEle, page.events);
	        });
	        // 渲染基本完成 动画启动 或者隐藏的页面触发show立即显示
	        curPageMData.onShowCB.add(function(pageEle, requestData){
	            curPageMData.status = 'show';
	            // console.log(page.name, 'show');
	            document.title = page.title || pageConfig.title;
	            
	            pageConfig.onShow && pageConfig.onShow(pageEle, requestData);
	            page.onShow && page.onShow(pageEle, requestData);
	        });
	        curPageMData.onAfterShowCB.add(function(pageEle, requestData){
	            curPageMData.status = 'after_show';
	            // console.log(page.name, 'after show');
	            
	            pageConfig.onAfterShow && pageConfig.onAfterShow(pageEle, requestData);
	            page.onAfterShow && page.onAfterShow(pageEle, requestData);
	        });
	        // 非活动show的页面触发hide
	        curPageMData.onHideCB.add(function(pageEle, requestData){
	            curPageMData.status = 'hide';
	            // console.log(page.name, 'hide');
	            
	            pageConfig.onHide && pageConfig.onHide(pageEle, requestData);
	            page.onHide && page.onHide(pageEle, requestData);
	        });
	        // 页面销毁的时候
	        curPageMData.onDestroyCB.add(function(pageEle){
	            curPageMData.status = 'destroy';
	            // console.log(page.name, 'destroy');
	            curPageMData.tempSpecial = null;

	            pageConfig.onDestroy && pageConfig.onDestroy(pageEle);
	            page.onDestroy && page.onDestroy(pageEle);

	            utils.off(pageEle);
	        });

	        pageStorageList.push(page);

	        return this;
	    },
	    bindEvent: function(ele, events){
	        var type = utils.classof(events);

	        if(type === 'Array'){
	            events.forEach(function(ele, key){
	                var selector = ele.selector;
	                ele.selector = undefined;
	                for(var type in ele){
	                    utils.on(ele, type, selector, ele[type]);
	                }
	            })
	        } else if(type === 'Object'){
	            for(var selector in events){
	                var typesHandler = events[selector];
	                for(var type in typesHandler){
	                    utils.on(ele, type, selector, typesHandler[type]);
	                }
	            }
	        } else {
	            return false;
	        }
	        return true;
	    },
	    find: function(key, val){
	        for(var i in pageStorageList){
	            var page = pageStorageList[i];
	            if(page[key] === val){
	                return page;
	            }
	        }
	        return false;
	    },
	    findByUrl: function(){
	        var hash = getHash().hash;
	        var url = hash.indexOf('#') === 0 ? hash : '#';
	        return this.find('url', url) || (url==='#' && defaultPage);
	    },
	    goPage: function(page){
	        pageConfig.onBeforeGoPage && pageConfig.onBeforeGoPage(page);

	        routerStateManager.set({pageIndex: ++pageIndex}, page.url);
	        pageRender.show(page);
	    },
	    //page要到的page 
	    backTo: function(page){
	        pageConfig.onBeforeBackTo && pageConfig.onBeforeBackTo(page);

	        var pageNode = pagesHistoryLinkStack.find(page);
	        if(!pageNode){ //返回已被删除的页面
	            var delPageMData = pageManagerData[page.name];
	            delPageMData.tempSpecial ? 
	                delPageMData.tempSpecial.ani = 'imi.as.for' :
	                delPageMData.tempSpecial = {ani: 'imi.as.for'};
	            var referNode = pagesHistoryLinkStack.last;
	            pageNode = pagesHistoryLinkStack.insert(page, referNode);
	            pageRender.show(page, pageManagerData[referNode.value.name].id);
	        }
	        
	        var curNode;
	        while((curNode = pagesHistoryLinkStack.last) !== pageNode){
	            if(!(page = curNode.value)) return; // || page.name === pageConfig.default

	            pagesHistoryLinkStack.pop();
	            pageIndex--;
	            pageRender.hide(page);
	        }
	    },
	    /** 
	     * name 页面name
	     * option
	     *    ani: 指定下一页的动画
	     *    last: kill 指定当前页的处理
	     */     
	    go: function(name, option){
	        var self = this;
	        var page = this.find('name', name);
	        var hashSearch = '';
	        if(page) {
	            if(option){
	                // 给即将go到的页面的特殊数据， get post等  该页面需要分享的话把get参数加到url上
	                // 只有share的时候才支持get参数 即 页面需要通过url直接访问
	                if(page.share = page.share === false ? false : pageConfig.share){
	                    var hash = pageConfig.preHashData ? location.hash : '';
	                    hashSearch = pageRequestData.set(name, option, hash);
	                } else{
	                    option.get = null;
	                    pageRequestData.set(name, option, '');
	                }
	                var curPage = curActivityPage;
	                // 处理当前页面将被销毁的逻辑
	                if(option.last === 'kill') {
	                    // var state = routerStateManager.get(name);
	                    // state.killed = true;(state);
	                    
	                    // maybe add to render after animation before show
	                    pageManagerData[name].onAfterShowCB.add(function(){
	                        self.killPage(curPage.name);
	                    })
	                } else if(option.last === 'destroy'){
	                    var lastDestroyHandler = function(){
	                        PageManager.destroyPage(curPage.name);
	                        pageManagerData[name].onAfterShowCB.remove(lastDestroyHandler);
	                    }
	                    pageManagerData[name].onAfterShowCB.add(lastDestroyHandler);
	                }
	            }
	            // 给即将go到的页面的特殊数据， get post等
	            pageManagerData[name].tempSpecial = option;
	        }
	        var nextHash = (page.url + hashSearch)|| '#default';
	        (!option || !option.last || (['kill', 'destroy', 'back'].indexOf(option.last) === -1)) ? (location.hash = nextHash) :
	            location.replace(location.pathname + location.search + nextHash);
	    },
	    // 默认回退到指定页
	    // 
	    back: function(name, option){

	        if(name){
	            var page = this.find('name', name);
	            if(page){
	                var backIdx = pagesHistoryLinkStack.lastIndexOf(page);
	                if(backIdx < 0) {
	                    history.go(backIdx); // backIdx 为0则不跳转
	                } else { // 大于零  用户可能刷新了 走go 再根据history.state判断goPage还是backTo
	                    this.go(name, utils.extend(true, option, {ani: 'imi.as.for', last: 'back'}));
	                }
	            }
	        } else {
	            history.back();
	        }
	    },
	    setOptionsPromise: function(name, options){
	        var self = this;
	        var cbList = ['init', 'events', 'onShow', 'onHide', 'onDestroy'];
	        for(var na in options){
	            var fn = 'page' + utils.upperFirstChar(na)
	            utils.inArray(na, cbList) && self[fn] && 
	                    self[fn](name, options[na]);
	        }
	    },
	    setPageOption: function(name, option){
	        // var curPageMData = pageManagerData[name];
	        var page = this.find('name', name);
	        if(page){
	            utils.extend(page, option, { //标识不可改
	                name: page.name,
	                url: page.url
	            });
	            return true;
	        }
	        return false;
	    },
	    getPageData: function(name){
	        var page = name ? PageManager.find('name', name) : PageManager.find('url', getHash().hash);
	        if(!page) return {};
	        return pageRequestData.get(page.name);
	    },
	    getPageMData: function(name){
	        return pageManagerData[name] || {};
	    },
	    destroyPage: function(name){
	        var page = this.find('name', name);
	        if(page){
	            pagesHistoryLinkStack.remove(page);
	            // var curPageMData = pageManagerData[name];
	            pageRender.hide(page, true);
	        }
	    },
	    /**
	     * kill 指定页面
	     * 处理不可逆的状态驱动的页面跳转
	     * kill后续重新注册 需谨慎使用
	     */
	    killPage: function(name){
	        var page = this.find('name', name);
	        if(page){
	            try{
	                var curPageMData = pageManagerData[name];
	                PageManager.destroyPage(name);
	                routerStateManager.remove(page.url);
	                pageStorageList.splice(pageStorageList.indexOf(page), 1);
	                curPageMData.onShowCB.empty();
	                curPageMData.onAfterShowCB.empty();
	                curPageMData.onHideCB.empty();
	                curPageMData.onDestroyCB.empty();
	                curPageMData.onStyleLoadCB.empty();
	                pageManagerData[name] = null;
	            } catch(e){
	                // alert(JSON.stringify(e));
	                console.error('kill ', name, ' error');
	            }
	            
	            return true;
	        }
	        return false;
	    },
	    // 处理page预加载
	    preLoadPage: function(name, callback){
	        if(this.find(name)){
	            callback = callback || function(html){};
	            sourceManager.parse(name, callback);
	        }
	    },
	    updatePage: function(name, data){
	        var curPageMData = pageManagerData[name];
	        var pageEle = pagesContainerEle.querySelector('#' + curPageMData.id);
	        var pageData = utils.extend(true, pageRequestData.get(name), data);
	        curPageMData.onHideCB.fire(pageEle);
	        curPageMData.onDestroyCB.fire(pageEle);
	        pageEle.innerHTML = curPageMData.page.tpl;
	        curPageMData.onReadyCB.fire(pageEle, pageData);
	        curPageMData.onShowCB.fire(pageEle, pageData);
	        curPageMData.onAfterShowCB.fire(pageEle, pageData);
	    }
	}

	// pageInit(name, outer) pageEvents(name, outer) pageOnShow(name, outer) pageOnHide(name, outer) pageOnDestroy(name, outer)
	;[  //name -> relay -> unique -> data -> relay callback
	    ['init', ['show', 'hide', 'ready', 'after_show'], true, true], // 提供给页面外链js初始化页面的入口
	    ['events', ['show', 'hide', 'ready', 'after_show'], true, false, function(pageEle, events){PageManager.bindEvent(pageEle, events)}], // 提供给页面外链js初始化页面的入口
	    ['onShow', ['show', 'after_show'], false, true],
	    ['onHide', ['hide', 'destroy'], false, false],
	    ['onDestroy', ['destroy'], false, false]
	].forEach(function(item){
	    PageManager['page' + utils.upperFirstChar(item[0])] = function(name, outer){
	        var curPageMData = pageManagerData[name];
	        if(curPageMData && outer){
	            var page = curPageMData.page;
	            if(item[2] && page[item[0]]) return;
	            if(utils.inArray(curPageMData.status, item[1])){
	                var pageEle = document.getElementById(curPageMData.id)
	                item[4] ? item[4](pageEle, outer) : outer.apply(this, [pageEle, item[3] && pageRequestData.get(name)])
	            } else {
	                item[2] ? page[item[0]] = outer : curPageMData[item[0] + 'CB'].add(outer);
	            }
	        }
	    }
	})

	module.exports = PageManager;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * utils
	 * 与业务数据没有任何关系的公共方法
	 */
	var spaUtils = __webpack_require__(2);

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

/***/ },
/* 7 */
/***/ function(module, exports) {

	var getType = function(a) {
	    return Object.prototype.toString.call(a).slice(8, -1);
	}
	var Dialog = {
	    _init: function() {
	        this.containerEl = window.document.createElement('div');
	        this.containerEl.id = 'c-dialog';
	        this.containerEl.className = 'display-none';
	        window.document.body.appendChild(this.containerEl);
	    },
	    loading: function(str){
	        this.containerEl.innerHTML = '<div class="toast c-loading c-loading-chrysanthemum"><span class="msg">正在加载...</span></div>';
	        this.show();
	    },
	    show: function() {
	        this.containerEl.classList.remove('display-none');
	    },
	    hide: function() {
	        this.containerEl.classList.add('display-none');
	    }
	}

	Dialog._init();
	module.exports = {
	    loading: Dialog.loading.bind(Dialog),
	    hide: Dialog.hide.bind(Dialog)
	}

/***/ }
]);