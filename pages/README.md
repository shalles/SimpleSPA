## 项目页面

**suorce map**

1. 解决loadscript循环依赖问题
2. 解决页面资源统一管理
3. 实现SPA灰度流量控制

如果只有一个的话，无论use是多少都会全量匹配

```html
"main.pageA": [{
    "use": 0.6,
    "page": _baseUrl + "main/pageA/index.html",
    "scripts": [_baseUrl + "main/pageA/js/index.bundle.js"],
    "styles": [_baseUrl + "main/pageA/css/index.css"]
},{
    "use": 0.4,
    "page": _baseUrl + "main/pageA_v2/index.html",
    "scripts": [_baseUrl + "main/pageA_v2/js/index.bundle.js"],
    "styles": [_baseUrl + "main/pageA_v2/css/index.css"]
}],
```