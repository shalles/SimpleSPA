/**
 * canvas辅助函数
 *
 * 很常见的一种理解是把 getContext(''); 得到的是绘制上下文，即将画布作为主角去操控canvas绘制，我们移动的是画布
 * 还有一种理解就是把 getContext(''); 返回的对象当做一支笔，然后我们拿着这只笔在canvas画布上绘制，我们移动的是笔
 *
 * 
 */

module.exports = {
    //绘画文字
    writeText: function(pen, x, y, txt, color, fontStyle) {
        pen.save();
        pen.beginPath();
        pen.lineWidth = 1;
        pen.fillStyle = color;
        pen.font = fontStyle;
        pen.textAlign = "center";
        pen.fillText(txt, x, y);
        pen.restore();
    },
    drawDashline: function(pen, x1, y1, x2, y2, dashWidth, color){
        pen.save()
        pen.beginPath();
        pen.strokeStyle = color || '#fff';

        var dx = x2 - x1;
        var dy = y2 - y1;
        var d = Math.sqrt(dx * dx + dy * dy);
        var n = (d / (dashWidth || 4)) || 1;
        dx /= n; 
        dy /= n;
        for(var i = 0; i < n; i++){
            pen[i % 2 ? 'moveTo' : 'lineTo'](x1 + i * dx, y1 + i * dy);
        }
        pen.stroke();
        pen.restore();
    }
}