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