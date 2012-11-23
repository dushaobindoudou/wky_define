$(document).mousemove(function(e){

});
/* 鼠标坐标 */
if (document.addEventListener) {
    document.addEventListener("mousemove", function(e){
        //$("div.head").html("left:" + e.clientX + "; top:" + e.clientY);
    });
}
if (document.attachEvent) {
    document.attachEvent("onmousemove", function(e){
        //$("div.head").html("left:" + e.clientX + "; top:" + e.clientY);
    });
}
/* client area */
function GetZoomFactor(){
    var factor = 1;
    if (document.body.getBoundingClientRect) {
        // rect is only in physical pixel size in IE before version 8 
        var rect = document.body.getBoundingClientRect();
        var physicalW = rect.right - rect.left;
        var logicalW = document.body.offsetWidth;
        // the zoom level is always an integer percent value
        factor = Math.round((physicalW / logicalW) * 100) / 100;
    }
    //console.log(factor);
    return factor;
}

(function GetWindowSize(){
    var zoomFactor = GetZoomFactor();
    var w = Math.round(document.documentElement.clientWidth / zoomFactor);
    var h = Math.round(document.documentElement.clientHeight / zoomFactor);
    $("div.head").html(w + "px * " + h + "px");
})()
