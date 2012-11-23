(function(exports){
    // 兼容不同浏览器的 Adapter 适配层
    if (typeof window.XMLHttpRequest === "undefined") {
        window.XMLHttpRequest = function(){
            return new window.ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
        };
    }
    
    /**
     * 这是Ajax对象名字空间的一个方法
     *
     * @memberOf http
     * @method	ajax
     *
     * @param {Object} options 一个配置对象
     * @return {Object} ajax 返回一个ajax对象
     */
    var ajax = function(uri, options){
        var httpRequest, httpSuccess, timeout, isTimeout = false, isComplete = false;
        
        options = {
            method: options.method || "GET",
            data: options.data || null,
            arguments: options.arguments || null,
            
            onSuccess: options.onSuccess ||
            function(){
            },
            onError: options.onError ||
            function(){
            },
            onComplete: options.onComplete ||
            function(){
            },
            //尚未测试
            onTimeout: options.onTimeout ||
            function(){
            },
            
            isAsync: options.isAsync || true,
            timeout: options.timeout ? options.timeout : 10000,
            contentType: options.contentType ? options.contentType : "utf-8",
            type: options.type || "xml"
        };
        uri = uri || "";
        timeout = options.timeout;
        
        
        httpRequest = new window.XMLHttpRequest();
        httpRequest.open(options.method, uri, options.isAsync);
        //设置编码集
        //httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        httpRequest.setRequestHeader("Content-Type", options.contentType);
        
        /**
         * @ignore
         */
        httpSuccess = function(r){
            try {
                return (!r.status && location.protocol == "file:") ||
                (r.status >= 200 && r.status < 300) ||
                (r.status == 304) ||
                (navigator.userAgent.indexOf("Safari") > -1 && typeof r.status == "undefined");
            } 
            catch (e) {
                //J.out("错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 2);
            }
            return false;
        }
        
        
        httpRequest.onreadystatechange = function(){
            if (httpRequest.readyState == 4) {
                if (!isTimeout) {
                    var o = {};
                    o.responseText = httpRequest.responseText;
                    o.responseXML = httpRequest.responseXML;
                    o.uri = uri;
                    o.arguments = options.arguments;
                    
                    if (httpSuccess(httpRequest)) {
                        if (options.type === "script") {
                            eval.call(window, data);
                        }
                        options.onSuccess(o);
                        
                    }
                    else {
                        options.onError(o);
                    }
                    options.onComplete(o);
                }
                isComplete = true;
                //删除对象,防止内存溢出
                httpRequest = null;
            }
        };
        
        httpRequest.send(options.data);
        
        window.setTimeout(function(){
            var o;
            if (!isComplete) {
                isTimeout = true;
                o = {};
                o.uri = uri;
                o.arguments = options.arguments;
                options.onTimeout(o);
                options.onComplete(o);
            }
        }, timeout);        
        return httpRequest;
    };
	exports.ajax = ajax;
})(window);
