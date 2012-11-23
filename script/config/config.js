/*
 * 
 * 这个应用的配置文件
 * 
 * 
 * 
 * 
 * 
 */

//定义配置信息：客户端窗口大小
wky_define("wky.config", function(){
    var clientSize = {
        width: $(window).width(),
        height: $(window).height()
    };
    return {
        varName: "clientSize",
        varVal: clientSize
    }
});
