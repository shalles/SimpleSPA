var utils = require('./core/utils.js');
var PageManager = require('./core/page-manager.js');

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