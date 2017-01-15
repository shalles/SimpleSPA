export function LocalStore(prefix, notStr, isSession) {
  var storage = isSession ? window.sessionStorage : window.localStorage;
  prefix = prefix ? prefix + '_' : '';
  //注意动态改变local name值后要用getItem(name)或setItem(name,value)回置
  this.setItem = notStr
    ? (name, value) => { //value能为空 name不能为空
        try {
          storage.setItem(prefix + name, JSON.stringify(value || {}));
        } catch (e) {
          console.log(e);
        }
      }
    : (name, value) => {
        storage.setItem(prefix + name, value);
      }
  this.getItem = notStr
    ? (name) => {
        var val = storage.getItem(prefix + name) || '{}';
        try {
          return JSON.parse(val);
        } catch (e) {
          console.log(e);
        }
        return val;
      }
    : (name) => {
        return storage.getItem(prefix + name);
      }
  this.removeItem = function(name) {
    return storage.removeItem(prefix + name);
  }
}
