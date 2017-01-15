import * as utils from './utils.js'
import { pageManagerData, pageConfig } from './page-manager.js'

export let render = {
  show (page, beforeId) {
    let pageEle = document.createElement('div')
    let curPageMData = pageManagerData[page.name]

    pageEle.id = curPageMData.id
    pageEle.dataset.name = page.name
    pageEle.className = 'page ' + curPageMData.id
    pageConfig.draggable && pageEle.classList.add('draggable')

    curPageMData.ani = parsePageAnimation(page)
    // console.log(page, curPageMData.ani)

    switch (curPageMData.ani.time) {
      // case 'bl':
      // case 'al':
      // case 'bs':
      // 默认：动画 after show
      case 'as':
      default:
        sourceManager.parse(page.name, function() {

          let requestData = pageRequestData.get(page.name)
          //debugger
          pageEle.innerHTML = curPageMData.page.tpl

          if (beforeId /*&& curPageMData.ani.init === 'imi'*/ ) {

            let referEle = document.getElementById(beforeId)
            referEle
              ? pagesContainerEle.insertBefore(pageEle, referEle)
              : pagesContainerEle.appendChild(pageEle)
            curPageMData.onReadyCB.fire(pageEle, requestData) //DOM ready
            curPageMData.onShowCB.fire(pageEle, requestData) // onShow
            curPageMData.onAfterShowCB.fire()

          } else {
            if (!pagesHistoryLinkStack) {
              pagesHistoryLinkStack = new utils.LinkStack(page)
            } else {
              pagesHistoryLinkStack.push(page)
            }

            pageEle.classList.add(curPageMData.ani.init)
            pagesContainerEle.appendChild(pageEle)
            curPageMData.onReadyCB.fire(pageEle, requestData) //DOM ready
            // curPageMData.onRenderCB.fire(pageEle, requestData)
            setTimeout(() => {
              pageEle.classList.remove(curPageMData.ani.init)
              utils.addClass(pageEle, ['ani', curPageMData.ani.show])
              animationEnd(pageEle, () => {
                animationEnd(pageEle, null, true)
                utils.removeClass(pageEle, ['ani', curPageMData.ani.show])
                // 隐藏底下的页面
                let prevPage = pagesHistoryLinkStack.last.prev
                let prevPageMData
                let prevEle
                if (prevPage && (prevPage = prevPage.value)) {
                  if ((prevPageMData = pageManagerData[prevPage.name]) &&
                    (prevEle = document.getElementById(prevPageMData.id))) {
                    prevEle && prevEle.classList.add('d-hide')
                    prevPageMData.onHideCB.fire(prevEle, pageRequestData.get(prevPage.name))
                  }
                }
                curPageMData.onAfterShowCB.fire()
              })

              curPageMData.onShowCB.fire(pageEle, requestData) // onShow
            }, pageContainer.pageReaderTime)
          }
        })
    }
  },
  hide (page, justDestory) {
    let pageEle
    if (justDestory !== true) {
      let lastPage = pagesHistoryLinkStack.last
      let lastPageMData
      let lastEle
      // 返回后底下的页面显示则触发showCB
      if (lastPage && (lastPage = lastPage.value)) {
        if ((lastPageMData = pageManagerData[lastPage.name]) &&
          (lastEle = document.getElementById(lastPageMData.id))) {
          lastEle.classList.remove('d-hide')
          lastPageMData.onShowCB.fire(lastEle, pageRequestData.get(lastPage.name))
        }
      }
    }

    let curPageMData = pageManagerData[page.name]
    if (!(curPageMData.id && (pageEle = document.getElementById(curPageMData.id)))) return

    // 此时页面的状态已不需要更新 触发hide
    curPageMData.onHideCB.fire(pageEle)

    // 等待imi show的页面渲染
    function hidePageAni () {
      utils.addClass(pageEle, ['ani', curPageMData.ani.hide])
    }

    curPageMData.ani.init === 'imi'
      ? hidePageAni()
      : setTimeout(hidePageAni, pageContainer.pageReaderTime)

    function hideAnimationEnd () {
      // pageEle.classList.add('hide')
      // utils.removeClass(pageEle, ['ani', curPageMData.ani.hide])
      // 动画完成销毁页面  spa设计在此后销毁page 即返回则移除
      curPageMData.onDestroyCB.fire(pageEle)
      setTimeout(() => {
        // if(pageEle in pagesContainerEle.childNodes){
        pagesContainerEle.removeChild(pageEle)
        // }
        // callback && callback()
      }, 300)
    }
    justDestory === true
      ? hideAnimationEnd()
      : animationEnd(pageEle, () => {
        animationEnd(pageEle, null, true)
        hideAnimationEnd()
      })
  }
}
