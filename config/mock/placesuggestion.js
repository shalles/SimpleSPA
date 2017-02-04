function(req, res){
    // req.headers: { 
    //    host: '127.0.0.1:8080',
    //    connection: 'keep-alive',
    //    accept: 'application/json, text/javascript, */*; q=0.01',
    //    'x-requested-with': 'XMLHttpRequest',
    //    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
    //    referer: 'http://127.0.0.1:8080/src/export/pages/app-1.html',
    //    'accept-encoding': 'gzip, deflate, sdch',
    //    'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6,tr;q=0.4,ja;q=0.2',
    //    cookie: '_ga=GA1.1.412069457.1440574551',
    //    'ra-ver': '3.0.7',
    //    'ra-sid': 'D397FW#5-20150603-021623-afsadf-asfew' 
    // }
    // req.method: 'GET',
    // req.wwwurl: { 
    //     protocol: 'http:',
    //     slashes: true,
    //     auth: null,
    //     host: '127.0.0.1:8080',
    //     port: '8080',
    //     hostname: '127.0.0.1',
    //     hash: null,
    //     search: '?city=%E5%8C%97%E4%&query=d',
    //     query: 'city=%E5%8C%97%E4%&query=d',
    //     pathname: '/api/placesuggestion',
    //     path: '/api/placesuggestion?city=%E5%8C%97%E4%&query=d',
    //     href: 'http://127.0.0.1:8080/api/placesuggestion?city=%E5%8C%97%E4%&query=d' 
    //     queryObj:{ 
    //         city: '北京市',
    //         query: 'd' 
    //     }
    // }
    //console.log("req:", req);
    //console.log("res:", res);
    var data = {"errno":0,"result":[{"uid":"476","displayname":"\u5929\u5b89\u95e8\u4e1c","address":"\u5929\u5b89\u95e8\u4e1c","city":"\u5317\u4eac\u5e02","area":1,"lng":116.407938,"lat":39.914136,"cscore":92.527290344238,"expr":555.16375732422,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u4e1c"},{"uid":"453","displayname":"\u5929\u5b89\u95e8\u897f","address":"\u5929\u5b89\u95e8\u897f","city":"\u5317\u4eac\u5e02","area":1,"lng":116.398195,"lat":39.913814,"cscore":79.373748779297,"expr":476.24249267578,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u897f"},{"uid":"2856267","displayname":"\u5929\u5b89\u95e8\u5e7f\u573a","address":"\u666f\u5c71\u524d\u88574\u53f7\u5929\u5b89\u95e8\u5e7f\u573a","city":"\u5317\u4eac\u5e02","area":1,"lng":116.404015,"lat":39.912733,"cscore":7.4069681167603,"expr":44.44181060791,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u5e7f\u573a"},{"uid":"2855154","displayname":"\u5929\u5b89\u95e8","address":"\u5317\u4eac\u5e02\u4e1c\u57ce\u533a\u4e1c\u957f\u5b89\u8857\u5929\u5b89\u95e8","city":"\u5317\u4eac\u5e02","area":1,"lng":116.403875,"lat":39.915168,"cscore":7.2936639785767,"expr":43.761985778809,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8"},{"uid":"1134898","displayname":"\u5929\u5b89\u95e8\u57ce\u697c","address":"\u5317\u4eac\u5e02\u4e1c\u57ce\u533a\u4e1c\u957f\u5b89\u8857\u5929\u5b89\u95e8\u57ce\u697c","city":"\u5317\u4eac\u5e02","area":1,"lng":116.403875,"lat":39.915168,"cscore":3.6719760894775,"expr":22.031856536865,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u57ce\u697c"},{"uid":"3442554","displayname":"\u5929\u5b89\u95e8\u5e7f\u573a\u897f","address":"2\u8def;5\u8def;120\u8def;126\u8def;\u89c2\u51491\u7ebf;\u591c2\u8def;\u4e132\u8def\u5929\u5b89\u95e8\u5e7f\u573a\u897f","city":"\u5317\u4eac\u5e02","area":1,"lng":116.402302,"lat":39.908778,"cscore":2.97727394104,"expr":17.86364364624,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u5e7f\u573a\u897f"},{"uid":"3624082","displayname":"\u5929\u5b89\u95e8\u5e7f\u573a\u4e1c","address":"2\u8def;5\u8def;120\u8def;126\u8def;\u89c2\u51491\u7ebf;\u591c17\u8def;\u591c2\u8def;\u4e132\u8def\u5929\u5b89\u95e8\u5e7f\u573a\u4e1c","city":"\u5317\u4eac\u5e02","area":1,"lng":116.406055,"lat":39.907961,"cscore":2.97727394104,"expr":17.86364364624,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u5e7f\u573a\u4e1c"},{"uid":"750373","displayname":"\u5929\u5b89\u95e8\u4e1c\u5730\u94c1\u7ad9c\u53e3","address":"\u5317\u4eac\u5e02\u4e1c\u57ce\u533a\u5929\u5b89\u95e8\u4e1c\u5730\u94c1\u7ad9c\u53e3","city":"\u5317\u4eac","area":1,"lng":116.408584,"lat":39.913279,"cscore":2.4445610046387,"expr":14.667366027832,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u4e1c\u5730\u94c1\u7ad9c\u53e3"},{"uid":"748647","displayname":"\u5929\u5b89\u95e8\u4e1c\u5730\u94c1\u4e1c\u7ad9D\u897f\u5357\u53e3","address":"\u5317\u4eac\u5e02\u4e1c\u57ce\u533a\u5929\u5b89\u95e8\u4e1c\u5730\u94c1\u4e1c\u7ad9D\u897f\u5357\u53e3","city":"\u5317\u4eac","area":1,"lng":116.406755,"lat":39.91377,"cscore":2.3516130447388,"expr":14.109678268433,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u4e1c\u5730\u94c1\u4e1c\u7ad9D\u897f\u5357\u53e3"},{"uid":"1021249","displayname":"\u5929\u5b89\u95e8\u897f\u7ad9A\u897f\u5317\u53e3","address":"\u5317\u4eac\u5e02\u5730\u94c11\u53f7\u7ebf\u5929\u5b89\u95e8\u897f\u7ad9A\u897f\u5317\u53e3","city":"\u5317\u4eac\u5e02","area":1,"lng":116.397371,"lat":39.914019,"cscore":2.3136339187622,"expr":13.881803512573,"same":0,"srctag":"sph.c","name":"\u5929\u5b89\u95e8\u897f\u7ad9A\u897f\u5317\u53e3"}],"searchid":"sg1441372039100"};
    data.result = data.result.slice(Math.random(1)*8)
    console.log("===============================")
    //console.log(req);
    console.log(req.wwwurl);
    res.end(JSON.stringify(data));
}