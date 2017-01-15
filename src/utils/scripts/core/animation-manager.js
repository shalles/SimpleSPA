import { pageManagerData, pageConfig } from './core.js'
import * as utils from './utils.js'

export function onAnimationEnd (ele, callback, off) {
    let bind = off ? 'off' : 'on'
    ('onanimationend' in window) ? utils[bind](ele, 'animationend', callback) :
        utils[bind](ele, 'webkitAnimationEnd', callback)
}

export function parse (page) {
    // 动画可以更具当前go或back指定而改变  //show动画.执行时机.hide动画
    let aniMap = {
        'fir': 'fade-in-right', 
        'for': 'fade-out-right', 
        'fol': 'fade-out-left', 
        'fil': 'fade-in-left', 
        'eid': 'elastic-in-down',
        'imi': 'immed-in',
        'imo': 'immed-out'
    }
    let timeMap = {
        'bl': 'before-load',
        'al': 'after-load',
        'bs': 'before-show',
        'as': 'after-show'
    }
    let special = pageManagerData[page.name].tempSpecial
    let param = (special && special.ani || page.ani || pageConfig.ani).split('.')
    param = [
        aniMap[param[0]] && param[0], 
        timeMap[param[1]] && param[1], 
        aniMap[param[2]] && param[2]
    ]
    param = utils.extend(true, {}, {ani: pageConfig.aniObject}, {ani: param}).ani
    
    return {
        init: 'ani-' + param[0],
        show: aniMap[param[0]],
        time: param[1],
        hide: aniMap[param[2]],
        flag: param.join('.')
    }
}