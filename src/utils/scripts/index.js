import {
  extend,
  classof
} from './utils.js'
import PageManager from './core/page-manager.js'

// 可能依赖全局变量
// window.pageSrcMap
// window.SimpleSPA.pageHtmlList

let openAPI = [
  'go',
  'back',
  'pageInit',
  'register',
  'getPageData',
  'pageEvents',
  'killPage',
  'preLoadPage',
  'pageOnShow',
  'pageOnHide',
  'pageOnDestroy',
  'setOptionsPromise',
  'setPageOption',
  'updatePage'
]

let SimpleSPA = {
  global: {},
  pageHtmlList: [],
  create(config) {
    // create保证参数的有效性，PageManager不做过多处理
    PageManager.init(extend(true, {
      selector: '#page-container',
      default: 'index', // name
      title: '', // 默认title
      draggable: false,
      sourceCache: true,
      ani: 'fir.as.for', // 指定所有页面的默认规则 针对每个页面可独立设置
      loadErrorTpl: './pages/page-load-error.html'
    }, config))
  },
  replace(name, data, violent) {
    data = data || {}
    data.last = violent ? 'kill' : 'destroy'
    return SimpleSPA.go(name, data)
  },
  // 约定key最好不要以$开头 
  define(pageEle, key, selector, value, callback, enHtml) {
    let defineProp = (key, selector, value, callback, enHtml) => {
      let $data = pageEle.$data || {}
        // if(!pageEle.$data) pageEle.$data = {}
      let dom = pageEle.querySelector(selector)
      if (!dom) return false
      if (!$data[key]) {
        Object.defineProperty($data, key, {
          enumerable: true,
          configurable: false,
          // writable: true,
          // value: value,
          get() {
            return dom.innerHTML || ''
          },
          set(value) {
            dom.innerHTML = value
          }
        })
        value && ($data[key] = value)
        $data['$' + key] = dom
        pageEle.$data = $data
      }
    }

    if (classof(key) === 'Array') {
      key.forEach((item) => {
        defineProp(item.key, item.selector, item.value, item.callback, item.enHtml)
      })
    } else {
      defineProp(key, selector, value, callback, enHtml)
    }

    return pageEle.$data
  }
}

openAPI.forEach((key) => {
  SimpleSPA[key] = function() {
    PageManager[key].apply(PageManager, arguments)
    return this
  }
})

export default SimpleSPA