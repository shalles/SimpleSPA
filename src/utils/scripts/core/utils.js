import LocalStore from './store'
import { LinkStack, LinkNode } from './link-stack'

export function classof (o) {
    return Object.prototype.toString.call(o).slice(8,-1)
}

export function getHash (hash) {
    hash = (hash || location.hash).split('?');
    return {
        hash: hash[0],
        search: hash[1]
    };
}

// 循环解码
export function decodeURL (value) {
    let temp
    while ((temp = decodeURIComponent(value)) !== value){
        value = temp
    }
    return temp
}
export function parseURL (url) {
    url = url || window.location.search
    let params = url.slice(url.indexOf('?') + 1)
    let data = {}
    params && params.split('&').forEach((item) => {
        let kv = item.split('=')
        data[kv[0]] = decodeURL(kv[1])
    })
    return data
}

export function queryStringify (data, search) {
    let search = search || ''
    for(let i in data){
        search += (search?'&':'?') + i + '=' + encodeURIComponent(data[i])
    }
    return search
}
/**
 * Callbacks 
 * author: shalles
 * email:shalles@163.com
 * create time: 2015.01.02
 * refer to jquery callbacks
 */

export function isFunction (fn) {
    return typeof fn === 'function'
}

export class Callbacks {

    constructor (unique) {
        this.list = []
        this.unique = !!unique
    }

    // Add a callback or a collection of callbacks to the list
    add (fn) {
        if (isFunction(fn)) {
            if (this.unique && this.has(fn)) {
                this.remove(fn)
            }
            this.list.push(fn)
        } else if (Object.prototype.toString.call(fn) === "[object Array]") {
            for (let i = 0, len = fn.length; i < len; i++) {
                 arguments.callee.call(this, fn[i])   
            }
        }

        return this
    }

    // Remove a callback from the list
    remove (fn) {
        let list = this.list,
            idx
        if (isFunction(fn)) {
            idx = list.indexOf(fn)
            list.splice(idx, 1)
        }
        
        return this
    }

    // Check if a given callback is in the list.
    has (fn) {
        return this.list.indexOf(fn) > -1
    }

    // Remove all callbacks from the list
    empty () {
        if (this.list) {
            this.list = []
        }
        return this
    }

    // Call all callbacks with the given context and arguments
    fireWith (context, args) {
        let list = this.list
        for (let i = 0, len; i < list.length; i++) {
            list[i].apply(context, args.slice ? args.slice() : args)
        }
        
        return this
    }

    // Call all the callbacks with the given arguments
    fire () {
        this.fireWith(this, arguments)
        return this
    }
}

export function onload (source, callback) {
    if (!isFunction(callback)) return
    source.onload = source.onreadystatechange = (e) => { 
        if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
            callback(e)
        }
    }
}
export function loadStyle (href, callback) {
    if (!href) return
    let link = document.createElement('link')
    link.href = href.toString()
    link.rel = 'stylesheet'
    onload(link, callback)
    document.head.appendChild(link)
}

export function loadScript (src, callback) {
    if (!src) return
    let script = document.createElement("script")
    script.type = "text/javascript"
    script.src = src.toString()
    onload(script, callback)
    document.body.appendChild(script)
}

export function upperFirstChar (str) {
    return str[0].toUpperCase() + str.slice(1)
}

export default let utils = {
    ajax: $.ajax,
    extend: $.extend,
    noop () {},
    classof,
    isFunction,
    parseURL,
    decodeURL,
    loadStyle,
    loadScript,
    Callbacks,
    LinkStack,
    LinkNode,
    upperFirstChar,
    queryStringify,
    vendorPrefix (ele, property, val) {
        ['webkit'].forEach((prefix) => {
            ele.style[prefix + upperFirstChar(property)] = val
        })
        ele.style[property] = val
    },
    inArray (ele, array) {
        return array.indexOf(ele) > -1
    },
    on (ele, type, selector, handler) {
        $(ele).on(type, selector, handler)
        return this
    },
    off (ele, type, selector, handler) {
        $(ele).off(type, selector, handler)
        return this
    }
}

// weixin android 一些版本不支持classList.add( cls1, cls2, cls3)
['add', 'remove'].forEach(function(name){
    utils[name+'Class'] = function(ele, classList){
        let type = classof(classList)
        if(type === 'String'){
            ele.classList[name](cls)
        } else if(type === 'Array'){
            classList.forEach(function(cls){
                ele.classList[name](cls)
            })
        }
    }
})
