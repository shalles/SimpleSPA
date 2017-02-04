module.exports = {
    define_wx_share: function(a) {
        a.call("showOptionMenu");
        a.call("hideToolbar");
        a.on("menu:share:appmessage", function(b) {
            a.invoke("sendAppMessage", {
                appid: "wx1111111",
                img_url: "http://shalles.org/static/share.png",
                link: "http://shalles.org/le920411",
                title: "hhh",
                desc: "hhh"
            }, function(a) {})
        });
        a.on("menu:share:timeline", function(b) {
            a.invoke("shareTimeline", {
                img_url: "http://shalles.org/static/share.png",
                link: "http://shalles.org/le920411",
                desc: "hhh",
                title: "hhh"
            }, function(a) {})
        });
        a.on("menu:share:weibo", function(b) {
            a.invoke("shareWeibo", {
                content: "hhh",
                url: "http://shalles.org/le920411"
            }, function(a) {})
        })
    }
}