function(req, res, require){
    var query = req.wwwurl.queryObj;

    var command = query.command;
    var fs = require('fs');
    var path = require('path');
    var exec = require('child_process').exec;
    var cwd = process.cwd()
    var basepath = path.join(cwd, 'config/builder');
    var configpath = path.join(basepath, '/data/page.config.js')
    var config = require(configpath);
    
    var resData = {};
    switch(command){
        case 'loadpage':
            resData = config;
            break;
        case 'createpage':
            var page = {
                name: query.name,
                url: query.url
            };
            resData = require(path.join(basepath, 'command/createpage'))(page, cwd);
            if(resData.errno == 0){
                config.pages.push(resData.page);
                fs.writeFileSync(configpath, 'module.exports=' + JSON.stringify(config));
            }
            break;
        case 'deletepage':
            var page = {
                name: query.name,
                url: query.url
            };
            resData = require(path.join(basepath, 'command/deletepage'))(page, cwd);
            if(resData.errno == 0){
                var idx = config.pages.indexOf(resData.page)
                idx !== -1 && config.pages.splice(idx, 1);
                fs.writeFileSync(configpath, 'module.exports=' + JSON.stringify(config));
            }
            break;
        default:
            break;
    }
    // if (['deletepage', 'createpage'].indexOf(command) !== -1) {
    //     exec('gulp', function() {
    //         res.end(JSON.stringify(resData));
    //     })
    // } else {
        res.end(JSON.stringify(resData));
    // }
}