/*
 * PageManager
 * 
 */
var utils = require('./utils.js');

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