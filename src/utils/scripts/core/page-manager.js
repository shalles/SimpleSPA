import { LocalStore } from './store.js'
import * as utils from './utils.js'
import { staticSourceCacheStarage } from './core.js'

export let pageIndex = 1; // 页面
export let pageConfig = {}; // 针对多有页面初始配置  也做备用默认值
export let defaultPage = null; // 默认页面
export let curActivityPage = null;
export let pageStorageList = []; // 已注册页面
export let pagesHistoryLinkStack; // 活动时页面访问link链
export let pagesContainerEle = null;
export let pageManagerData = {}; // pageManager 管理页面渲染的数据
export let pageDataContainer = {}; // 每个页面使用的数据

export let pageStateStore = window.sessionStorage ? new LocalStore('spapm_', true, true) : '';

export let pageContainer = {
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

let PageManager = {
  init (config) {
    let init => (srcMap) {
      pageContainer.srcMap = srcMap

      pageConfig.aniObject = pageConfig.ani.split('.')

      if (!(pageConfig.selector && (pagesContainerEle = document.querySelector(pageConfig.selector)))) {
        pagesContainerEle = document.createElement('div')
        pagesContainerEle.id = pagesContainerEle.className = 'page-container'
      }

      defaultPage = this.find(pageConfig.default)
        // popstate
      utils.on(window, 'hashchange', () => {
        let page = this.findByUrl()
          // debugger
          // if(!page) return // 支持页面id锚点
        curActivityPage = page || curActivityPage
        let state = routerStateManager.get()
          // 在页面前面或活动链表里的用back
        if (state.pageIndex <= pageIndex || page &&
          (pagesHistoryLinkStack.find(page) ||
            pageManagerData[page.name].tempSpecial &&
            pageManagerData[page.name].tempSpecial.last === 'back')) {
          // back
          page ? this.backTo(page) : history.back()
        } else {
          // TODO: 写step-panel组件在一个页面实现hold-waitting这种状态变化逻辑
          page && this.goPage(page)
        }
      })

      // 页面滑动翻页
      if (pageConfig.draggable) {
        let touchEndOrCancelHandler = (e) => {
          // e.stopPropagation()
          let touch = e.changedTouches[0]
          if (pageContainer.dragLTR) {
            pageContainer.dragLTR = false
            if (pageContainer.lenLTR > pageContainer.lenMax) {
              pageContainer.lenLTR = 0
              e.currentTarget.classList.remove('drag-ltr')
              this.back()
            } else {
              pageContainer.lenLTR = 0
                // e.currentTarget.style.left = pageContainer.lenLTR + 'px'
              utils.vendorPrefix(e.currentTarget, 'transform', 'translate3d(' + pageContainer.lenLTR + 'px,0,0)')
            }
          } else if (pageContainer.dragTTB) {
            pageContainer.dragTTB = false
            document.body.classList.remove('spa-update')
            if (pageContainer.lenTTB >= pageContainer.updataLenMax) {
              pageContainer.lenTTB = 0
              document.body.classList.add('spa-update-end')
              location.reload()
            } else if (pageContainer.lenTTB) {
              pageContainer.lenTTB = 0
              utils.vendorPrefix(pagesContainerEle, 'transform', 'translate3d(0,' + pageContainer.lenTTB + 'px,0)')
            }

          }
        }
        utils.on(pagesContainerEle, 'touchstart', '.page.draggable', function(e) {
            // e.stopPropagation()
            let touch = e.changedTouches[0]
            if (pageContainer.dragLTR || pageContainer.dragRTL) return
            if (touch.clientX < pageContainer.dragLimitLeft) {
              pageContainer.dragLTR = true
              e.currentTarget.classList.add('drag-ltr')
            } else if (touch.clientY < pageContainer.dragLimitTop) {
              pageContainer.dragTTB = true
              document.body.classList.add('spa-update')
                // e.currentTarget.classList.add('drag-ttb')
            }
          })
          .on(pagesContainerEle, 'touchmove', '.page.draggable', function(e) {
            let touch = e.changedTouches[0]
            if (pageContainer.dragLTR) {
              pageContainer.lenLTR = touch.clientX
                // e.currentTarget.style.left = pageContainer.lenLTR + 'px'
              utils.vendorPrefix(e.currentTarget, 'transform', 'translate3d(' + pageContainer.lenLTR + 'px,0,0)')
            } else if (pageContainer.dragTTB) {
              pageContainer.lenTTB = touch.clientY > pageContainer.updataLenMax ? pageContainer.updataLenMax : touch.clientY
                // e.currentTarget.style.right = pageContainer.lenRTL + 'px'
              utils.vendorPrefix(pagesContainerEle, 'transform', 'translate3d(0,' + pageContainer.lenTTB + 'px,0)')
            }
          })
          .on(pagesContainerEle, 'touchend', '.page.draggable', touchEndOrCancelHandler)
          .on(pagesContainerEle, 'touchcancel', '.page.draggable', touchEndOrCancelHandler)
      }

      let page = self.findByUrl()
      if (page) {
        curActivityPage = page
        let _state = routerStateManager.get(page.url)
        if (_state && _state.pageIndex) {
          pageIndex = _state.pageIndex
        }

        --pageIndex
        self.goPage(page)
      }
    }

    pageConfig = utils.extend(true, {}, pageConfig, config)

    staticSourceCacheStarage = pageConfig.sourceCache && new LocalStore('spapm', true)
    // 加载source map
    if (typeof pageConfig.pageSrcMap === 'string') {
      // 这里可能需要跨域
      loadTemplate(pageConfig.pageSrcMap, init, 'json')
    } else {
      init(pageConfig.pageSrcMap)
    }

    return this
  },
  register (page) {
    // 必要数据处理
    if (this.find('name', page.name)) throw Error('param error page name 不唯一， 重复name:' + page.name)
    if (this.find('url', page.url)) throw Error('param error page url 不唯一， 重复url:' + page.url)

    let curPageMData = pageManagerData[page.name] = {}
    curPageMData.status = 'register'
    curPageMData.id = page.name.replace(/[.#]/g, '-')
    curPageMData.page = page

    curPageMData.onStyleLoadCB = new utils.Callbacks(true) // load page tpl
    curPageMData.onReadyCB = new utils.Callbacks(true) // one page init once
    curPageMData.onShowCB = new utils.Callbacks(true) // one page could show hide many times
    curPageMData.onAfterShowCB = new utils.Callbacks(true) // one page render once
    curPageMData.onHideCB = new utils.Callbacks(true)
    curPageMData.onDestroyCB = new utils.Callbacks(true) // one page destroy once

    curPageMData.onReadyCB.add((pageEle, requestData) => {
      curPageMData.status = 'ready'

      pageConfig.onReady && pageConfig.onReady(pageEle, requestData)
      page.onReady && page.onReady(pageEle, requestData)

      page.init && page.init(pageEle, requestData)
      page.events && this.bindEvent(pageEle, page.events)
    })
    // 渲染基本完成 动画启动 或者隐藏的页面触发show立即显示
    curPageMData.onShowCB.add((pageEle, requestData) => {
      curPageMData.status = 'show'
        // console.log(page.name, 'show')
      document.title = page.title || pageConfig.title

      pageConfig.onShow && pageConfig.onShow(pageEle, requestData)
      page.onShow && page.onShow(pageEle, requestData)
    })
    curPageMData.onAfterShowCB.add((pageEle, requestData) => {
      curPageMData.status = 'after_show'
        // console.log(page.name, 'after show')

      pageConfig.onAfterShow && pageConfig.onAfterShow(pageEle, requestData)
      page.onAfterShow && page.onAfterShow(pageEle, requestData)
    })
    // 非活动show的页面触发hide
    curPageMData.onHideCB.add((pageEle, requestData) => {
      curPageMData.status = 'hide'
        // console.log(page.name, 'hide')

      pageConfig.onHide && pageConfig.onHide(pageEle, requestData)
      page.onHide && page.onHide(pageEle, requestData)
    })
    // 页面销毁的时候
    curPageMData.onDestroyCB.add((pageEle) => {
      curPageMData.status = 'destroy'

      curPageMData.tempSpecial = null

      pageConfig.onDestroy && pageConfig.onDestroy(pageEle)
      page.onDestroy && page.onDestroy(pageEle)

      utils.off(pageEle)
    })

    pageStorageList.push(page)

    return this
  },
  bindEvent (ele, events) {
    let type = utils.classof(events)

    if (type === 'Array') {
      events.forEach((ele, key) => {
        let selector = ele.selector
        ele.selector = undefined
        for (let type in ele) {
          utils.on(ele, type, selector, ele[type])
        }
      })
    } else if (type === 'Object') {
      for (let selector in events) {
        let typesHandler = events[selector]
        for (let type in typesHandler) {
          utils.on(ele, type, selector, typesHandler[type])
        }
      }
    } else {
      return false
    }
    return true
  },
  find (key, val) {
    for (let i in pageStorageList) {
      let page = pageStorageList[i]
      if (page[key] === val) {
        return page
      }
    }
    return false
  },
  findByUrl () {
    let hash = getHash().hash
    let url = hash.indexOf('#') === 0 ? hash : '#'
    return this.find('url', url) || (url === '#' && defaultPage)
  },
  goPage (page) {
    pageConfig.onBeforeGoPage && pageConfig.onBeforeGoPage(page)

    routerStateManager.set({
      pageIndex: ++pageIndex
    }, page.url)
    pageRender.show(page)
  },
  //page要到的page 
  backTo (page) {
    pageConfig.onBeforeBackTo && pageConfig.onBeforeBackTo(page)

    let pageNode = pagesHistoryLinkStack.find(page)
    if (!pageNode) { //返回已被删除的页面
      let delPageMData = pageManagerData[page.name]
      delPageMData.tempSpecial
        ? delPageMData.tempSpecial.ani = 'imi.as.for'
        : delPageMData.tempSpecial = {
            ani: 'imi.as.for'
          }
      let referNode = pagesHistoryLinkStack.last
      pageNode = pagesHistoryLinkStack.insert(page, referNode)
      pageRender.show(page, pageManagerData[referNode.value.name].id)
    }

    let curNode
    while ((curNode = pagesHistoryLinkStack.last) !== pageNode) {
      if (!(page = curNode.value)) return // || page.name === pageConfig.default

      pagesHistoryLinkStack.pop()
      --pageIndex
      pageRender.hide(page)
    }
  },
  /** 
   * name 页面name
   * option
   *    ani: 指定下一页的动画
   *    last: kill 指定当前页的处理
   */
  go (name, option) {
    let page = this.find('name', name)
    let hashSearch = ''
    if (page) {
      if (option) {
        // 给即将go到的页面的特殊数据， get post等  该页面需要分享的话把get参数加到url上
        // 只有share的时候才支持get参数 即 页面需要通过url直接访问
        if (page.share = page.share === false ? false : pageConfig.share) {
          let hash = pageConfig.preHashData ? location.hash : ''
          hashSearch = pageRequestData.set(name, option, hash)
        } else {
          option.get = null
          pageRequestData.set(name, option, '')
        }
        let curPage = curActivityPage
          // 处理当前页面将被销毁的逻辑
        if (option.last === 'kill') {
          // let state = routerStateManager.get(name)
          // state.killed = true(state)
          // maybe add to render after animation before show
          pageManagerData[name].onAfterShowCB.add(() => this.killPage(curPage.name))
        } else if (option.last === 'destroy') {
          let lastDestroyHandler = () => {
            PageManager.destroyPage(curPage.name)
            pageManagerData[name].onAfterShowCB.remove(lastDestroyHandler)
          }
          pageManagerData[name].onAfterShowCB.add(lastDestroyHandler)
        }
      }
      // 给即将go到的页面的特殊数据， get post等
      pageManagerData[name].tempSpecial = option
    }
    let nextHash = (page.url + hashSearch) ||
      '#default' ['kill', 'destroy', 'back'].indexOf(option.last) === -1
        ? (location.hash = nextHash)
        : location.replace(location.pathname + location.search + nextHash)
  },
  // 默认回退到指定页
  back (name, option) {
    if (name) {
      let page = this.find('name', name)
      if (page) {
        let backIdx = pagesHistoryLinkStack.lastIndexOf(page)
        if (backIdx < 0) {
          history.go(backIdx) // backIdx 为0则不跳转
        } else { // 大于零  用户可能刷新了 走go 再根据history.state判断goPage还是backTo
          this.go(name, utils.extend(true, option, {
            ani: 'imi.as.for',
            last: 'back'
          }))
        }
      }
    } else {
      history.back()
    }
  },
  setOptionsPromise(name, options) {
    let self = this
    let cbList = ['init', 'events', 'onShow', 'onHide', 'onDestroy']
    for (let na in options) {
      let fn = 'page' + utils.upperFirstChar(na)
      utils.inArray(na, cbList) && self[fn] &&
        self[fn](name, options[na])
    }
  },
  setPageOption(name, option) {
    // let curPageMData = pageManagerData[name]
    let page = this.find('name', name)
    if (page) {
      utils.extend(page, option, { //标识不可改
        name: page.name,
        url: page.url
      })
      return true
    }
    return false
  },
  getPageData(name) {
    let page = name ? PageManager.find('name', name) : PageManager.find('url', getHash().hash)
    if (!page) return {}
    return pageRequestData.get(page.name)
  },
  getPageMData(name) {
    return pageManagerData[name] || {}
  },
  destroyPage(name) {
    let page = this.find('name', name)
    if (page) {
      pagesHistoryLinkStack.remove(page)
      // let curPageMData = pageManagerData[name]
      pageRender.hide(page, true)
    }
  },
  /**
   * kill 指定页面
   * 处理不可逆的状态驱动的页面跳转
   * kill后续重新注册 需谨慎使用
   */
  killPage (name) {
    let page = this.find('name', name)
    if (page) {
      try {
        let curPageMData = pageManagerData[name]
        PageManager.destroyPage(name)
        routerStateManager.remove(page.url)
        pageStorageList.splice(pageStorageList.indexOf(page), 1)
        curPageMData.onShowCB.empty()
        curPageMData.onAfterShowCB.empty()
        curPageMData.onHideCB.empty()
        curPageMData.onDestroyCB.empty()
        curPageMData.onStyleLoadCB.empty()
        pageManagerData[name] = null
      } catch (e) {
        // alert(JSON.stringify(e))
        console.warn('kill ', name, ' error')
      }

      return true
    }
    return false
  },
  // 处理page预加载
  preLoadPage (name, callback) {
    if (this.find(name)) {
      callback = callback || function(html) {}
      sourceManager.parse(name, callback)
    }
  },
  updatePage (name, data) {
    let curPageMData = pageManagerData[name]
    let pageEle = pagesContainerEle.querySelector('#' + curPageMData.id)
    let pageData = utils.extend(true, pageRequestData.get(name), data)
    curPageMData.onHideCB.fire(pageEle)
    curPageMData.onDestroyCB.fire(pageEle)
    pageEle.innerHTML = curPageMData.page.tpl
    curPageMData.onReadyCB.fire(pageEle, pageData)
    curPageMData.onShowCB.fire(pageEle, pageData)
    curPageMData.onAfterShowCB.fire(pageEle, pageData)
  }
}

// pageInit(name, outer) pageEvents(name, outer) pageOnShow(name, outer) pageOnHide(name, outer) pageOnDestroy(name, outer)
;
[ //name -> relay -> unique -> data -> relay callback
  ['init', ['show', 'hide', 'ready', 'after_show'], true, true], // 提供给页面外链js初始化页面的入口
  ['events', ['show', 'hide', 'ready', 'after_show'], true, false, function(pageEle, events) {
    PageManager.bindEvent(pageEle, events)
  }], // 提供给页面外链js初始化页面的入口
  ['onShow', ['show', 'after_show'], false, true],
  ['onHide', ['hide', 'destroy'], false, false],
  ['onDestroy', ['destroy'], false, false]
].forEach((item) => {
  PageManager['page' + utils.upperFirstChar(item[0])] = function(name, outer) {
    let curPageMData = pageManagerData[name];
    if (curPageMData && outer) {
      let page = curPageMData.page;
      if (item[2] && page[item[0]]) return;
      if (utils.inArray(curPageMData.status, item[1])) {
        let pageEle = document.getElementById(curPageMData.id)
        item[4] ? item[4](pageEle, outer) : outer.apply(this, [pageEle, item[3] && pageRequestData.get(name)])
      } else {
        item[2] ? page[item[0]] = outer : curPageMData[item[0] + 'CB'].add(outer);
      }
    }
  }
})

export default PageManager