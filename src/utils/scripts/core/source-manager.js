import utils from './utils.js'
import { staticSourceCacheStarage } from './core.js'

export function loadStyle (name, href) {
    let curPageMData = pageManagerData[name]
    let cb = () => {
        curPageMData.onStyleLoadCB.fire()
        return (curPageMData.styleLoaded = true)
    }
    if(curPageMData.styleLoaded || !href) return cb()

    utils.loadStyle(href, (e) => {
        // console.log(e)
        setTimeout(cb, 200)
    })
}

export function loadScript (name, src) {
    let curPageMData = pageManagerData[name]
    let cb = () => (curPageMData.scriptsLoaded = true)

    if(curPageMData.scriptsLoaded || !src) return cb()
    
    utils.loadScript(src, cb)
}

// 加载页面模板
export function loadTemplate(url, callback, type){
    utils.ajax({
        url: url,
        data: type ? { timestamp: Date.now } : {},
        dataType: type || 'text', // or text
        success: callback,
        error () {
            pageConfig.loadErrorTpl && callback(require(pageConfig.loadErrorTpl));
            console.warn('template load error!!')
        }
    });
}

export function load (name, src, callback) {
    let curPageMData = pageManagerData[name]
    src.styles = src.styles || curPageMData.page.styles
    src.scripts = src.scripts || curPageMData.page.scripts
    loadStyle(name, src.styles)
    loadScript(name, src.scripts)

    let tpl = curPageMData.page.tpl || window.SPA.pageHtmlList[name]
    let storeName = name + '.html'

    let htmlShowArterStyleLoadedPromise = function () {
        if(!curPageMData.page.tpl){
            curPageMData.page.tpl = window.SPA.pageHtmlList[name]
            pageConfig.sourceCache && staticSourceCacheStarage.setItem(storeName, {
                path: src.page,
                content: curPageMData.page.tpl
            })
            window.SPA.pageHtmlList[name] = ''
        }

        curPageMData.styleLoaded ? callback() :
            curPageMData.onStyleLoadCB.remove(callback).add(function(){
                curPageMData.styleLoaded ? curPageMData.onStyleLoadCB.remove(callback) : callback()
            })
    }

    if(tpl){        
        htmlShowArterStyleLoadedPromise()
    } else {
        if(pageConfig.sourceCache){
            let cacheHTML = staticSourceCacheStarage.getItem(storeName) || {}
            if(cacheHTML.path === src.page){
                curPageMData.page.tpl = cacheHTML.content
                htmlShowArterStyleLoadedPromise()
            } else {
                cacheHTML.path && staticSourceCacheStarage.removeItem(storeName)
                utils.loadScript(src.page, htmlShowArterStyleLoadedPromise)
            }
        } else {
            utils.loadScript(src.page, htmlShowArterStyleLoadedPromise)
        }
    }
}

export function parse (name, callback) {
    let sourceList = pageContainer.srcMap[name]
    let srcLen
    if(!sourceList || (srcLen = sourceList.length) === 0){
        load(name, {}, callback)
    } else if(srcLen === 1){
        load(name, sourceList[0], callback)
    } else {
        let use = 0
        let random = Math.random() // 0-1之间 超过的忽略

        for(let i = 0; i < srcLen; i++){
            let min = use, src = sourceList[0]
            use += src.use
            if(srcLen - i === 1) use = 1 // 最后一个灰度总值不足1补齐
            if(min < random && random <= use){
                sourceList = [src] // 不刷新单页之间跳转不走灰度判断
                load(name, src, callback)
                break
            }
        }
    }
}

export default {
    load, loadScript, loadStyle, parse
}
