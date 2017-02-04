function(req, res){
    res.statusCode = 302;
    res.setHeader("Location", req.wwwurl.pathname);
    console.log(req.wwwurl.pathname);
    res.end();
}