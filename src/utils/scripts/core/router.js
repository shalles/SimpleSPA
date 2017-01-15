import { pageStateStore } from './core.js'
import * as utils from './utils.js'

export let stateManager = {
    set (state, url, href) {
        url = url || utils.getHash().hash
        if(!pageStateStore){
            var _state = window.history.state || {}
            // 解决一些老版本手机浏览器在用hash改变url后histroy.replaseState时共用一个histroy.state
            _state[url] = state
            window.history.replaceState && window.history.replaceState(_state, '', href || location.href)
        } else {
            pageStateStore.setItem(url, state)
        }
    },
    get (url) {
        var url = url || utils.getHash().hash
        if(!pageStateStore){
            var state = window.history.state || {}
            // 解决一些老版本手机浏览器在用hash改变url后histroy.replaseState时共用一个histroy.state
            if(!state[url]) state[url] = {}
            return state[url]
        } else {
            return pageStateStore.getItem(url)
        }
    },
    remove (url) {
        pageStateStore.removeItem(url)
    }
}

export let dataManager = {
    get (name) {
        var data = pageManagerData[name].tempSpecial
        if(!data){
            data = {}
            try{
                data.get = utils.extend(utils.parseURL(location.search), utils.parseURL(getHash().search))
                data.post = JSON.parse(window.sessionStorage.getItem(pageManagerData[name].id) || '{}')
            } catch(e){}
            pageManagerData[name].tempSpecial = data
        }
        // post 大还是 get 大还有待商议
        return utils.extend({}, data.get, data.post)
    },
    set (name, data, hash) {
        if(data.post){
            try{
                var id = pageManagerData[name].id
                window.sessionStorage.setItem(id, JSON.stringify(data.post))
            } catch(e){}
        }
        if(data.get){
            var hashObj = utils.getHash(hash || '#')
            var search = hashObj.search
            var hashData = search && utils.parseURL(search) || {}
            // hashData._timestamp = Date.now()
            utils.extend(true, hashData, data.get)
            hash = hashObj.hash
            search = utils.queryStringify(hashData)
        }
        return search
    }
}