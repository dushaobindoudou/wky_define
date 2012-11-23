/*
 * autor:dustin
 *
 * email:dushaobindoudou@gmail.com
 *
 *
 */
var wky_define = (function(win){
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === "[object String]";
    }
    
    var trim = function(str){
        if (!isString(str)) {
            return str;
        }
        return str.replace(/^\s+|\s+$/, "");
    }
    
    var hasProperty = function(obj, property){
        if (!obj || !property) {
            return;
        }
        if (property in obj) {
            if (obj.hasOwnProperty) {
                if (obj.hasOwnProperty(property)) {
                    return true;
                }
            }
            else {
                return obj[property]
            }
        }
        return false;
    }
    
    //检测空间名字的合法性
    var checkValid = function(str){
        var v = /^[a-zA-Z_\$][\da-zA-Z_\$]*$/;
        return str && v.test(str);
    }
    //
    var define = function(namespace){
        var ns = namespace.split(".");
        var tmpNs = win, len = ns.length, i = 0;
        while (i < len) {
            var curNs = trim(ns[i]);
            if (!curNs || !checkValid(curNs)) {
                throw new Error("定义的有不可用的空间名字！");
                break;
            }
            if (hasProperty(tmpNs, curNs)) {
                tmpNs = tmpNs[curNs];
            }
            else {
                tmpNs[curNs] = {};
                tmpNs = tmpNs[curNs];
            }
            i++;
        }
        return tmpNs;
    }
    
    var isArray = function(obj){
        return Object.prototype.toString.call(obj) === "[object Array]";
    }
    
    var addApi = function(addNew, obj){
        if (hasProperty(addNew, "varName") && hasProperty(addNew, "varVal")) {
            if (hasProperty(obj, addNew["varName"])) {
                throw new Error("已经包含了该名字，请仔细查看!");
                return;
            }
            obj[addNew["varName"]] = addNew["varVal"];
        }
    }
    
    return function(namespace, callback){
        if (!isString(namespace)) {
            return;
        }
        var obj = define(namespace);
        var addNew = callback && callback.call(obj, obj);
        var varName, varObj;
        if (!addNew) {
            return;
        }
        if (isArray(addNew)) {
            for (var i = 0, len = addNew.length; i < len; i++) {
                addApi(addNew[i], obj);
            }
        }
        else {
            addApi(addNew, obj);
        }
        return obj;
    }
})(window);

wky_define("wky", function(wky){
    var isObject = function(obj){
        return Object.prototype.toString.call(obj) === "[object Object]";
    }
    var extend = function(to, from){
        if (!isObject(to) || !isObject(from)) {
            return;
        }
        for (var k in from) {
            if (from.hasOwnProperty(k)) {
                to[k] = from[k];
            }
        }
        return to;
    }
    return {
        varName: "extend",
        varVal: extend
    }
});

//字符串操作
wky_define("wky.string", function(){
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === "[object String]";
    }
    
    var isNumber = function(obj){
        return Object.prototype.toString.call(obj) == "[object Number]";
    }
    
    var isZHChar = function(c){
        if (!c) {
            return false;
        }
        return !/^[\x00-\xff]/.test(c);
    }
    
    //获得字符的长度,汉字算两个，英文字符算一个
    var getStrLen = function(str){
        var totalLen = 0;
        if (isString(str)) {
            for (var i = 0, len = str.length; i < len; i++) {
                if (isZHChar(str[i])) {
                    totalLen += 2;
                }
                else {
                    totalLen++;
                }
            }
        }
        else {
            totalLen = -1;
        }
        return totalLen;
    }
    
    //根据总长度获取字符串中的实际长的
    var getStrActualLen = function(str, begin, absLen){
        var totalLen = 0;
        var i = isNumber(begin) ? begin : 0;
        if (isString(str)) {
            for (var len = str.length; i < len; i++) {
                if (isZHChar(str[i])) {
                    totalLen += 2;
                }
                else {
                    totalLen++;
                }
                if (totalLen >= absLen) {
                    i++;
                    break;
                }
            }
            if (str.length <= begin) {
                i = -2;
                begin = 0;
            }
        }
        else {
            i = -2;
        }
        return i - begin;
    }
    
    //截取字符串英文字符算一个，汉字算两个字符 
    var subString = function(str, begin, len){
        if (!isString(str)) {
            return;
        }
        begin = begin || 0;
        len = len || 1;
        
        var totalLen = getStrLen(str);
        var actLen = getStrActualLen(str, begin, len);
        
        if (totalLen <= begin) {
            return "";
        }
        return str.substr(begin, actLen);
    };
    
    //-分割的转换成驼峰的
    var toCamelCase = function(str){
        return String(str).replace(/\-([a-z])/g, function(all, match){
            return match.toUpperCase();
        });
    };
    
    return [{
        varName: "subString",
        varVal: subString
    }, {
        varName: "getStrLen",
        varVal: getStrLen
    }, {
        varName: "toCamelCase",
        varVal: toCamelCase
    }]
});

/*
 * 数组方法实现
 * 没有返回值，兼容没有该方法的浏览器
 *
 *
 */
wky_define("wky", function(){
    function arrayMethods(methods){
        var arrProto = Array.prototype;
        for (var name in methods) 
            arrProto[name] = arrProto[name] || methods[name];
    }
    arrayMethods({
        forEach: function(iter, context){
            for (var i = 0; i < this.length; i++) {
                iter.call(context, this[i], i, this);
            }
        },
        reduce: function(accumlator, initVal){
            var curr = initVal;
            this.forEach(function(item, i, arr){
                curr = accumlator(curr, item, i, arr);
            });
            return curr;
        },
        reduceRight: function(accumlator, initVal){
            var curr = initVal;
            for (var i = this.length - 1; i >= 0; i--) {
                var item = this[i];
                curr = accumlator(curr, item, i, this);
            }
            return curr;
        },
        map: function(func, context){
            var len = this.length, ret = []
            for (var i = 0; i < len; i++) {
                if (i in this) 
                    ret[i] = func.call(context, this[i], i, this)
            }
            return ret
        },
        filter: function(accept, context){
            return this.reduce(function(curr, item, i, arr){
                return accept.call(context, item, i, arr) ? curr.concat(item) : curr;
            }, []);
        },
        every: function(predicate, context){
            return this.reduce(function(curr, item, i, arr){
                return curr && predicate.call(context, item, i, arr);
            }, true);
        },
        some: function(predicate, context){
            return this.reduce(function(curr, item, i, arr){
                return curr || predicate.call(context, item, i, arr);
            }, false);
        },
        indexOf: function(target, startFrom){
            var len = this.length
            for (var i = startFrom || 0; i < len; i++) {
                if (i in this && this[i] === target) 
                    return i;
            }
            return -1;
        },
        lastIndexOf: function(target, startFrom){
            var len = this.length
            for (var i = startFrom || len - 1; i >= 0; i--) 
                if (i in this && this[i] === target) 
                    return i;
            return -1;
        }
    });
});

wky_define("wky.core", function(core){
    var extend = wky.extend;
    
    var isArray = function(obj){
        return Object.prototype.toString.call(obj) === "[object Array]";
    }
    
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === "[object String]";
    }
    
    var isUndefined = function(obj){
        return obj === void 0;
        //return Object.prototype.toString.call(obj) === "[object Undefined]";
    }
    
    var isNumber = function(obj){
        return Object.prototype.toString.call(obj) === "[object Number]";
    }
    
    var isNumberStr = function(obj){
<<<<<<< HEAD
        if (isNumber(obj)) {
            return true;
        }
=======
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
        if (isString(obj)) {
            //todo:包含e，
            return !!obj.match(/^[0-9]*(\.)?\d+$/);
        }
        return false;
    }
    
<<<<<<< HEAD
    var isFunction = function(obj){
=======
    var isFunction = function(){
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
        return Object.prototype.toString.call(obj) === "[object Function]";
    }
    
    //判断是否是一个dom节点
    var isNode = function(o){
        return (typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
    }
    
    //Returns true if it is a DOM element    
    var isElement = function(o){
        return (typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string");
    }
    
    var createClass = function(proto, parent){
        var fn = function(){
            var args = [].slice.call(arguments);
            this.init.apply(this, args)
        }
        fn.prototype = extend({
            constructor: fn,
            init: function(){
            }
        }, proto);
        return fn;
    }
    
    var forEach = function(a, fun){
        if (!isArray(a)) {
            return;
        }
        fun = fun ||
        function(){
        };
        var args = [].slice.call(arguments, 1);
        if (Array.prototype.forEach) {
            Array.prototype.forEach.apply(a, args);
        }
        else {
            var len = a.length >>> 0;
            if (typeof fun != "function") {
                throw new TypeError();
            }
            var thisp = arguments[0];
            for (var i = 0; i < len; i++) {
                if (i in thisp) {
                    fun.call(thisp, thisp[i], i, thisp);
                }
            }
        }
    }
    
    var each = function(ary, fn, context){
        if (!isArray(ary) || !isFunction(fn)) {
            return;
        }
        context = context || window;
        for (var i = 0, len = ary.length; i < len; i++) {
            if (fn.call(context, i, ary[i], ary) === false) {
                return;
            }
        }
    }
    
    
    var forIn = function(obj, fun){
        if (!obj || !fun) {
            return;
        }
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                fun.call(obj, k, obj[k], obj);
            }
        }
    }
    
    //设置指定的 作用域
    var bind = function(fn, context){
        if (!isFunction(fn)) {
            return fn;
        }
        context = context || window;
        var args = [].slice.call(arguments, 2);
        return function(){
            var arg = args.concat([].slice.call(arguments));
            return fn.apply(context, arg);
        }
    }
    
    return [{
        varName: "klass",
        varVal: createClass
    }, {
        varName: "isString",
        varVal: isString
    }, {
        varName: "isArray",
        varVal: isArray
    }, {
        varName: "isNumber",
        varVal: isNumber
    }, {
        varName: "isUndefined",
        varVal: isUndefined
    }, {
        varName: "isNumberStr",
        varVal: isNumberStr
    }, {
        varName: "isFunction",
        varVal: isFunction
    }, {
        varName: "isNode",
        varVal: isNode
    }, {
        varName: "isElement",
        varVal: isElement
    }, {
        varName: "forEach",
        varVal: forEach
    }, {
        varName: "each",
        varVal: each
    }, {
        varName: "forIn",
        varVal: forIn
    }, {
        varName: "bind",
        varVal: bind
    }]
});

//require string
//require core
wky_define("wky.dom", function(){
    var str = wky.string;
    var core = wky.core;
    /*
     *  ATTRIBUTE_NODE 	2
     CDATA_SECTION_NODE	 4
     COMMENT_NODE	8
     DOCUMENT_FRAGMENT_NODE	 11
     DOCUMENT_NODE	9
     DOCUMENT_POSITION_CONTAINED_BY	16
     DOCUMENT_POSITION_CONTAINS	8
     DOCUMENT_POSITION_DISCONNECTED	1
     DOCUMENT_POSITION_FOLLOWING	4
     DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC	32
     DOCUMENT_POSITION_PRECEDING	2
     DOCUMENT_TYPE_NODE	10
     ELEMENT_NODE	1
     ENTITY_NODE	6
     ENTITY_REFERENCE_NODE	5
     NOTATION_NODE	12
     PROCESSING_INSTRUCTION_NODE	7
     TEXT_NODE	3
     */
    var DIRECT_ATTRIBUTE_MAP_ = {
        tabindex: "tabIndex",
        readonly: "readOnly",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        cellpadding: "cellPadding",
        rowspan: "rowSpan",
        colspan: "colSpan",
        usemap: "useMap",
        frameborder: "frameBorder",
        contenteditable: "contentEditable"
    };
    
    var propertyFixed = {
        width: true,
        height: true,
        src: true,
        href: true
    }
    
    var setAttr = function(ele, attr, val){
        if (attr == "for") {
            ele.htmlfor = val;
        }
        if (attr == "style") {
            ele.style.cssText = val;
        }
        if (attr == "class") {
            ele.className = val;
        }
        if (attr in DIRECT_ATTRIBUTE_MAP_) {
            ele.setAttribute(DIRECT_ATTRIBUTE_MAP_[attr], val);
        }
        else {
            ele[attr] = val;
        }
    }
    
    var getAttr = function(ele, attr){
        if (attr == "for") {
            return ele.htmlfor;
        }
        if (attr == "style") {
            return ele.style.cssText
        }
        if (attr == "class") {
            return ele.className;
        }
        if (propertyFixed[attr]) {
            return ele.getAttribute(attr, 2)
        }
        if (ele.nodeName == "Button" && attr == "value") {
            return ele.getAttributeNode(attr).node;
        }
        if (attr in DIRECT_ATTRIBUTE_MAP_) {
            return ele.getAttribute(DIRECT_ATTRIBUTE_MAP_[attr]);
        }
        else {
            return ele[attr];
        }
    }
    
    var removeAttr = function(ele, attr){
        //todo:button value的时候用removeAttributeNode
        if (attr == "for") {
            ele.htmlfor = "";
        }
        if (attr == "style") {
            ele.removeAttribute(style)
        }
        if (attr == "class") {
            ele.className = "";
        }
        if (attr in DIRECT_ATTRIBUTE_MAP_) {
            ele.removeAttribute(DIRECT_ATTRIBUTE_MAP_[attr], val);
        }
        else {
            ele[attr] = "";
        }
    }
    
    var setStyle = function(ele, name, val){
        if (!ele || !name) {
            return;
        }
        val = val || "";
        if (core.isString(name)) {
            ele.style[str.toCamelCase(name)] = val;
        }
        else {
            core.forIn(name, function(k, v){
                ele.style[str.toCamelCase(k)] = v;
            })
        }
    }
    
    return [{
        varName: "setAttr",
        varVal: setAttr
    }, {
        varName: "getAttr",
        varVal: getAttr
    }, {
        varName: "removeAttr",
        varVal: removeAttr
    }, {
        varName: "setStyle",
        varVal: setStyle
    }]
    
});

//取得或者设置光标位置
wky_define("wky.dom", function(ele){
    //
    //document.getSelection ie9 and other browser 得到一个selection 对象
    //documeng.selection.createRange
    
    //element.selectionStart 只能为text-orgianed element
    var setCaret = function(){
    
    
    }
    
    var getCaret = function(){
    
    
    }
    
    return [{
        varName: "setCaret",
        varValue: setCaret
    }, {
        varName: "getCaret",
        varVal: getCaret
    }];
});

//window size
wky_define("wky.dom", function(){

    /**
     * 包括滚动条 border padding
     * @method winSize
     */
    var winSize = function(win){
        var winH = 0, winW = 0;
        var doc = win ? win.document : document;
        //ie 向后兼容
        if (doc.body && doc.body.offsetWidth) {
            winW = document.body.offsetWidth;
            winH = document.body.offsetHeight;
        }
        //ie 标准模式
        if (doc.compatMode == 'CSS1Compat' && doc.documentElement && doc.documentElement.offsetWidth) {
            winW = doc.documentElement.offsetWidth;
            winH = doc.documentElement.offsetHeight;
        }
        //标准浏览器
        if (window.innerWidth && window.innerHeight) {
            winW = window.innerWidth;
            winH = window.innerHeight;
        }
        return {
            "width": winW,
            "height": winH
        }
    }
    
    /**
     * 不包括滚动条 innerSize
     * @method screenSize
     */
    var screenSize = function(win){
<<<<<<< HEAD
        var doc = win ? win.document : document;
		var de = doc.documentElement;
		var db = doc.body;
		var root = doc.compatMode == "CSS1Compat" ? de : db;
        return {
            height: root.clientHeight || win.innerHeight,
            width: root.clientWidth || win.innerWidth
=======
        var doc = win ? win.document : document, de = doc.documentElement, db = doc.body;
        return {
            height: de.clientHeight || $.win.innerHeight || db.clientHeight,
            width: de.clientWidth || $.win.innerWidth || db.clientWidth
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
        };
    };
    
    return [{
        varName: "winSize",
        varVal: winSize
    }, {
        varName: "screenSize",
        varVal: screenSize
    }]
<<<<<<< HEAD
=======
    
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
});

//获取元素的宽高
wky_define("wky.dom", function(dom){
    var core = wky.core;
    
    //是否是element节点 
    var isUseableElement = function(node){
        if (!core.isNode(node) || node.nodeType !== 1) {
            return false;
        }
        return true;
    }
    
    //获取或者设置节点宽度
    var width = function(node, width){
        //必须是元素节点才行
        if (!isUseableElement(node)) {
            return;
        }
        if (!core.isUndefined(width)) {
            if (core.isNumber(width) && width < 0) {
                width = 0;
            }
            width = core.isNumberStr(width) ? width + "px" : width;
            return dom.setStyle(node, "width", width);
        }
        return node.offsetWidth;
    };
    
    //获取或者设置节点高度
    var height = function(node, height){
        if (!isUseableElement(node)) {
            return;
        }
        if (!core.isUndefined(height)) {
            if (core.isNumber(height) && height < 0) {
                height = 0;
            }
            height = core.isNumberStr(height) ? height + "px" : height;
            return dom.setStyle(node, "height", height);
        }
        return node.offsetHeight;
    }
    
    //获取内部宽度 ，不包括滚动条，不包括border
    var innerWidth = function(node){
        if (!isUseableElement(node)) {
            return;
        }
        return node.clientWidth;
    }
    
    //获取内部高度 ，不包括滚动条，不包括border
    var innerHeight = function(node){
        if (!isUseableElement(node)) {
            return;
        }
        return node.clientHeight;
    }
    
    var html = function(node, val){
        if (!isUseableElement(node)) {
            return;
        }
        if (core.isUndefined(val)) {
            return node.innerHTML;
        }
        return node.innerHTML = val;
    }
    
    var offset = function(node){
        if (!isUseableElement(node)) {
            return;
        }
<<<<<<< HEAD
        var off = {
=======
        var offset = {
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
            left: 0,
            top: 0,
            width: node.offsetWidth,
            height: node.offsetHeight
        };
        var doc = node.ownerDocument;
<<<<<<< HEAD
		var win = window;
		var de = doc.documentElement;
		var body = document.body;
=======
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
        try {
            if (node.getBoundingClientRect) {
                var box = node.getBoundingClientRect();
                var body = doc.body;
                var de = doc.documentElement;
<<<<<<< HEAD
                off.left = box.left + (win.pageXOffset || de.scrollLeft) - (de.clientLeft || body.clientLeft || 0);
                off.top = box.top + (win.pageYOffset || de.scrollTop) - (de.clientTop || body.clientTop || 0);
=======
                offset.left = box.left + (win.pageXOffset || de.scrollLeft) - (de.clientLeft || body.clientLeft || 0);
                offset.top = box.top + (win.pageYOffset || de.scrollTop) - (de.clientTop || body.clientTop || 0);
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
            }
        } 
        catch (e) {
        }
<<<<<<< HEAD
        return off;
=======
        return offset;
        
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
    };
    
    return [{
        varName: "width",
        varVal: width
    }, {
        varName: "height",
        varVal: height
    }, {
        varName: "innerHeight",
        varVal: innerHeight
    }, {
        varName: "innerWidth",
        varVal: innerWidth
    }, {
        varName: "html",
        varVal: html
    }, {
        varName: "offset",
        varVal: offset
    }]
});

//当前页面的高度
wky_define("wky.dom", function(){

    /*var getDocSize = function(){
     var D = document;
     var height = Math.max(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
     var width = Math.max(Math.max(D.body.scrollWidth, D.documentElement.scrollWidth), Math.max(D.body.offsetWidth, D.documentElement.offsetWidth), Math.max(D.body.clientWidth, D.documentElement.clientWidth));
     return [widht, height]
     }*/
    var pageSize = function(win){
        var doc = win ? win.document : document;
        var compatMode = doc.compatMode != "CSS1Compat";
        var innerWidth = win.innerWidth;
        var innerHeight = win.innerHeight;
        var root = compatMode ? doc.body : doc.documentElement;
        if (doc.compatMode) {
            innerWidth = root.clientWidth;
            innerHeight = root.clientHeight;
        }
        return {
            width: Math.max(root.scrollWidth, innerWidth),
            height: Math.max(root.scrollHeight, innerHeight)
        };
    }
    
    return {
        varName: "pageSize",
        varVal: pageSize
    }
});

//class
wky_define("wky.dom", function(){
    var hasClass = function(ele, cls){
        if (!ele) {
            return;
        }
        if (ele.classList) {
            return ele.classList.contains(cls);
        }
        return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }
    
    var addClass = function(ele, cls){
        if (!ele || !cls) {
            return;
        }
        if (!hasClass(ele, cls)) {
            if (ele.classList) {
                ele.classList.add(cls);
            }
            else {
                ele.className += " " + cls;
            }
        }
    }
    
    var removeClass = function(ele, cls){
        if (!ele || !cls) {
            return;
        }
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        if (hasClass(ele, cls)) {
            if (ele.classList) {
                ele.classList.remove(cls);
            }
            else {
                ele.className = ele.className.replace(reg, ' ');
            }
        }
    }
    
    var replaceClass = function(ele, oldClass, newClass){
        if (hasClass(ele, oldClass)) {
            removeClass(ele, oldClass);
            addClass(ele, newClass);
        }
        return;
    }
    
    return [{
        varName: "hasClass",
        varVal: hasClass
    }, {
        varName: "addClass",
        varVal: addClass
    }, {
        varName: "removeClass",
        varVal: removeClass
    }];
    
});
wky_define("wky.dom", function(dom){
    /**
     * Credits
     *
     * Sly's code and pattern are inspired by several open source developers.
     *
     * Valerio Proietti & MooTools contributors
     *  - Idea of modular combinator and pseudo filters
     *  - Code for several pseudo filters
     *  - Slickspeed benchmark framework
     * Steven Levithan
     *  - Improved Sly.parse expression
     * Diego Perini
     *  - Research on querySelectorAll and browser quirks
     *  - Patches for Sly.parse expression
     *  - Combined tests from jQuery and Prototype
     * Thomas Aylott & Slick contributors
     *   - Idea of using regular expressions in attribute filter.
     * John Resig & jQuery/Sizzle contributors
     *  - Browser feature/quirks detection
     *  - Additional pseudo filters
     *  - Extensive Unit Tests, (c) 2008 John Resig, Jörn Zaefferer, MIT/GPL dual license
     * Sam Stephenson & Prototype contributors
     *  - Extensive Unit Tests, (c) 2005-2008 Sam Stephenson, MIT-style license
     * Alan Kang & JSSpec contributors
     *  - JSSpec BDD framework
     *
     * Kudos to every single one of them for supporting the open web.
     *
     * 暂时用一下 thanks kudos
     */
    var Sly = (function(){
        var cache = {};
        /**
         * Sly::constructor
         *
         * Acts also as shortcut for Sly::search if context argument is given.
         */
        var Sly = function(text, context, results, options){
            // normalise
            text = (typeof(text) == 'string') ? text.replace(/^\s+|\s+$/, '') : '';
            
            var cls = cache[text] || (cache[text] = new Sly.initialize(text));
            return (context == null) ? cls : cls.search(context, results, options);
        };
        
        Sly.initialize = function(text){
            this.text = text;
        };
        
        var proto = Sly.initialize.prototype = Sly.prototype;
        
        
        /**
         * Sly.implement
         */
        Sly.implement = function(key, properties){
            for (var prop in properties) {
                Sly[key][prop] = properties[prop];
            }
        };
        
        
        /**
         * Sly.support
         *
         * Filled with experiment results.
         */
        var support = Sly.support = {};
        
        // Checks similar to NWMatcher, Sizzle
        (function(){
        
            // Our guinea pig
            var testee = document.createElement('div'), id = (new Date()).getTime();
            testee.innerHTML = '<a name="' + id + '" class="€ b"></a>';
            testee.appendChild(document.createComment(''));
            
            // IE returns comment nodes for getElementsByTagName('*')
            support.byTagAddsComments = (testee.getElementsByTagName('*').length > 1);
            
            // Safari can't handle uppercase or unicode characters when in quirks mode.
            support.hasQsa = !!(testee.querySelectorAll && testee.querySelectorAll('.€').length);
            
            support.hasByClass = (function(){
                if (!testee.getElementsByClassName || !testee.getElementsByClassName('b').length) 
                    return false;
                testee.firstChild.className = 'c';
                return (testee.getElementsByClassName('c').length == 1);
            })();
            
            var root = document.documentElement;
            root.insertBefore(testee, root.firstChild);
            
            // IE returns named nodes for getElementById(name)
            support.byIdAddsName = !!(document.getElementById(id));
            
            root.removeChild(testee);
            
        })();
        
        
        var locateFast = function(){
            return true;
        };
        
        /**
         * Sly::search
         */
        proto.search = function(context, results, options){
            options = options || {};
            
            var iterate, i, item;
            
            if (!context) {
                context = document;
            }
            else 
                if (context.nodeType != 1 && context.nodeType != 9) {
                    if (typeof(context) == 'string') {
                        context = Sly.search(context);
                        iterate = true;
                    }
                    else 
                        if (Object.prototype.toString.call(context) == '[object Array]' || (typeof(context.length) == 'number' && context.item)) { // simple isArray
                            var filtered = [];
                            for (i = 0; (item = context[i]); i++) {
                                if (item.nodeType == 1 || item.nodeType == 9) {
                                    filtered.push(item);
                                }
                            }
                            iterate = (filtered.length > 1);
                            context = (iterate) ? filtered : (filtered[0] || document);
                        }
                }
            
            var mixed, // results need to be sorted, comma
 combined, // found nodes from one iteration process
 nodes, // context nodes from one iteration process
 all = {}, // unique ids for overall result
 state = {}; // matchers temporary state
            var current = all; // unique ids for one iteration process
            // unifiers
            var getUid = Sly.getUid;
            var locateCurrent = function(node){
                var uid = getUid(node);
                return (current[uid]) ? null : (current[uid] = true);
            };
            
            if (results && results.length) { // fills unique ids, does not alter the given results
                for (i = 0; (item = results[i]); i++) {
                    locateCurrent(item);
                }
            }
            
            if (support.hasQsa && !iterate && context.nodeType == 9 && !(/\[/).test(this.text)) {
                try {
                    var query = context.querySelectorAll(this.text);
                } 
                catch (e) {
                }
                if (query) {
                    if (!results) {
                        return Sly.toArray(query);
                    }
                    for (i = 0; (item = query[i]); i++) {
                        if (locateCurrent(item)) {
                            results.push(item);
                        }
                    }
                    if (!options.unordered) {
                        results.sort(Sly.compare);
                    }
                    return results;
                }
            }
            
            var parsed = this.parse();
            if (!parsed.length) {
                return [];
            }
            for (var i = 0, selector; (selector = parsed[i]); i++) {
                var locate = locateCurrent;
                if (selector.first) {
                    if (!results) {
                        locate = locateFast;
                    }
                    else {
                        mixed = true;
                    }
                    if (iterate) 
                        nodes = context;
                    else 
                        if (selector.combinator) 
                            nodes = [context]; // allows combinators before selectors
                }
                
                if (selector.last && results) {
                    current = all;
                    combined = results;
                }
                else {
                    // default stack
                    current = {};
                    combined = [];
                }
                
                if (!selector.combinator && !iterate) {
                    // without prepended combinator
                    combined = selector.combine(combined, context, selector, state, locate, !(combined.length));
                }
                else {
                    // with prepended combinators
                    for (var k = 0, l = nodes.length; k < l; k++) {
                        combined = selector.combine(combined, nodes[k], selector, state, locate);
                    }
                }
                
                if (selector.last) {
                    if (combined.length) 
                        results = combined;
                }
                else {
                    nodes = combined;
                }
            }
            
            if (!options.unordered && mixed && results) 
                results.sort(Sly.compare);
            
            return results || [];
        };
        
        /**
         * Sly::find
         */
        proto.find = function(context, results, options){
            return this.search(context, results, options)[0];
        };
        
        
        /**
         * Sly::match
         */
        proto.match = function(node, parent){
            var parsed = this.parse();
            if (parsed.length == 1) 
                return !!(this.parse()[0].match(node, {}));
            if (!parent) {
                parent = node;
                while (parent.parentNode) 
                    parent = parent.parentNode
            }
            var found = this.search(parent), i = found.length;
            if (!i--) 
                return false;
            while (i--) {
                if (found[i] == node) 
                    return true;
            }
            return false;
        };
        
        
        /**
         * Sly::filter
         */
        proto.filter = function(nodes){
            var results = [], match = this.parse()[0].match;
            for (var i = 0, node; (node = nodes[i]); i++) {
                if (match(node)) 
                    results.push(node);
            }
            return results;
        };
        
        
        /**
         * Sly.recompile()
         */
        var pattern;
        
        Sly.recompile = function(){
        
            var key, combList = [','], operList = ['!'];
            
            for (key in combinators) {
                if (key != ' ') {
                    combList[(key.length > 1) ? 'unshift' : 'push'](Sly.escapeRegExp(key));
                }
            }
            for (key in operators) 
                operList.push(key);
            
            /**
             The regexp is a group of every possible selector part including combinators.
             "|" separates the possible selectors.
             Capturing parentheses:
             1 - Combinator (only requires to allow multiple-character combinators)
             2 - Attribute name
             3 - Attribute operator
             4, 5, 6 - The value
             7 - Pseudo name
             8, 9, 10 - The value
             */
            pattern = new RegExp( // A tagname
'[\\w\\u00a1-\\uFFFF][\\w\\u00a1-\\uFFFF-]*|' +
            
            // An id or the classname
            '[#.](?:[\\w\\u00a1-\\uFFFF-]|\\\\:|\\\\.)+|' +
            
            // Whitespace (descendant combinator)
            '[ \\t\\r\\n\\f](?=[\\w\\u00a1-\\uFFFF*#.[:])|' +
            
            // Other combinators and the comma
            '[ \\t\\r\\n\\f]*(' +
            combList.join('|') +
            ')[ \\t\\r\\n\\f]*|' +
            
            // An attribute, with the various and optional value formats ([name], [name=value], [name="value"], [name='value']
            '\\[([\\w\\u00a1-\\uFFFF-]+)[ \\t\\r\\n\\f]*(?:([' +
            operList.join('') +
            ']?=)[ \\t\\r\\n\\f]*(?:"([^"]*)"|\'([^\']*)\'|([^\\]]*)))?]|' +
            
            // A pseudo-class, with various formats
            ':([-\\w\\u00a1-\\uFFFF]+)(?:\\((?:"([^"]*)"|\'([^\']*)\'|([^)]*))\\))?|' +
            
            // The universial selector, not process
            '\\*|(.+)', 'g');
        };
        
        
        // I prefer it outside, not sure if this is faster
        var create = function(combinator){
            return {
                ident: [],
                classes: [],
                attributes: [],
                pseudos: [],
                combinator: combinator
            };
        };
        
        var blank = function($0){
            return $0;
        };
        
        /**
         * Sly::parse
         *
         * Returns an array with one object for every selector:
         *
         * {
         *   tag: (String) Tagname (defaults to null for universal *)
         *   id: (String) Id
         *   classes: (Array) Classnames
         *   attributes: (Array) Attribute objects with "name", "operator" and "value"
         *   pseudos: (Array) Pseudo objects with "name" and "value"
         *   operator: (Char) The prepended operator (not comma)
         *   first: (Boolean) true if it is the first selector or the first after a comma
         *   last: (Boolean) true if it is the last selector or the last before a comma
         *   ident: (Array) All parsed matches, can be used as cache identifier.
         * }
         */
        proto.parse = function(plain){
            var save = (plain) ? 'plain' : 'parsed';
            if (this[save]) {
                return this[save];
            }
            var text = this.text;
            var compute = (plain) ? blank : this.compute;
            
            var parsed = [], current = create(null);
            current.first = true;
            
            var refresh = function(combinator){
                parsed.push(compute(current));
                current = create(combinator);
            };
            
            pattern.lastIndex = 0; // to fix some weird behavior
            var match, $0;
            
            while ((match = pattern.exec(text))) {
                if (match[11]) {
                    if (Sly.verbose) 
                        throw SyntaxError('Syntax error, "' + $0 + '" unexpected at #' + pattern.lastIndex + ' in "' + text + '"');
                    return (this[save] = []);
                }
                
                $0 = match[0];
                
                switch ($0.charAt(0)) {
                    case '.':
                        current.classes.push($0.slice(1).replace(/\\/g, ''));
                        break;
                    case '#':
                        current.id = $0.slice(1).replace(/\\/g, '');
                        break;
                    case '[':
                        current.attributes.push({
                            name: match[2],
                            operator: match[3] || null,
                            value: match[4] || match[5] || match[6] || null
                        });
                        break;
                    case ':':
                        current.pseudos.push({
                            name: match[7],
                            value: match[8] || match[9] || match[10] || null
                        });
                        break;
                    case ' ':
                    case '\t':
                    case '\r':
                    case '\n':
                    case '\f':
                        match[1] = match[1] || ' ';
                    default:
                        var combinator = match[1];
                        if (combinator) {
                            if (combinator == ',') {
                                current.last = true;
                                refresh(null);
                                current.first = true;
                                continue;
                            }
                            if (current.first && !current.ident.length) 
                                current.combinator = combinator;
                            else 
                                refresh(combinator);
                        }
                        else {
                            if ($0 != '*') 
                                current.tag = $0;
                        }
                }
                current.ident.push($0);
            }
            
            current.last = true;
            parsed.push(compute(current));
            
            return (this[save] = parsed);
        };
        
        
        // chains two given functions
        
        function chain(prepend, append, aux, unshift){
            return (prepend) ? ((unshift) ? function(node, state){
                return append(node, aux, state) && prepend(node, state);
            }
 : function(node, state){
                return prepend(node, state) && append(node, aux, state);
            }) : function(node, state){
                return append(node, aux, state);
            };
            // fn.$slyIndex = (prepend) ? (prepend.$slyIndex + 1) : 0;
        };
        
        
        // prepared match comperators, probably needs namespacing
        var empty = function(){
            return true;
        };
        
        var matchId = function(node, id){
            return (node.id == id);
        };
        
        var matchTag = function(node, tag){
            return (node.nodeName.toUpperCase() == tag);
        };
        
        var prepareClass = function(name){
            return (new RegExp('(?:^|[ \\t\\r\\n\\f])' + name + '(?:$|[ \\t\\r\\n\\f])'));
        };
        
        var matchClass = function(node, expr){
            return node.className && expr.test(node.className);
        };
        
        var prepareAttribute = function(attr){
            attr.getter = Sly.lookupAttribute(attr.name) || Sly.getAttribute;
            if (!attr.operator || !attr.value) 
                return attr;
            var parser = operators[attr.operator];
            if (parser) { // @todo: Allow functions, not only regex
                attr.escaped = Sly.escapeRegExp(attr.value);
                attr.pattern = new RegExp(parser(attr.value, attr.escaped, attr));
            }
            return attr;
        };
        
        var matchAttribute = function(node, attr){
            var read = attr.getter(node, attr.name);
            switch (attr.operator) {
                case null:
                    return read;
                case '=':
                    return (read == attr.value);
                case '!=':
                    return (read != attr.value);
            }
            if (!read && attr.value) 
                return false;
            return attr.pattern.test(read);
        };
        
        
        /**
         * Sly::compute
         *
         * Attaches the following methods to the selector object:
         *
         * {
         *   search: Uses the most convinient properties (id, tag and/or class) of the selector as search.
         *   matchAux: If search does not contain all selector properties, this method matches an element against the rest.
         *   match: Matches an element against all properties.
         *   simple: Set when matchAux is not needed.
         *   combine: The callback for the combinator
         * }
         */
        proto.compute = function(selector){
        
            var i, item, match, search, matchSearch, tagged, tag = selector.tag, id = selector.id, classes = selector.classes;
            
            var nodeName = (tag) ? tag.toUpperCase() : null;
            
            if (id) {
                tagged = true;
                
                matchSearch = chain(null, matchId, id);
                
                search = function(context){
                    if (context.getElementById) {
                        var el = context.getElementById(id);
                        return (el &&
                        (!nodeName || el.nodeName.toUpperCase() == nodeName) &&
                        (!support.getIdAdds || el.id == id)) ? [el] : [];
                    }
                    
                    var query = context.getElementsByTagName(tag || '*');
                    for (var j = 0, node; (node = query[j]); j++) {
                        if (node.id == id) {
                            return [node];
                        }
                    }
                    return [];
                };
            }
            
            if (classes.length > 0) {
                if (!search && support.hasByClass) {
                    for (i = 0; (item = classes[i]); i++) {
                        matchSearch = chain(matchSearch, matchClass, prepareClass(item));
                    }
                    var joined = classes.join(' ');
                    search = function(context){
                        return context.getElementsByClassName(joined);
                    };
                    
                }
                else 
                    if (!search && classes.length == 1) { // optimised for typical .one-class-only
                        tagged = true;
                        
                        var expr = prepareClass(classes[0]);
                        matchSearch = chain(matchSearch, matchClass, expr);
                        
                        search = function(context){
                            var query = context.getElementsByTagName(tag || '*');
                            var found = [];
                            for (var i = 0, node; (node = query[i]); i++) {
                                if (node.className && expr.test(node.className)) {
                                    found.push(node);
                                }
                            }
                            return found;
                        };
                        
                    }
                    else {
                        for (i = 0; (item = classes[i]); i++) {
                            match = chain(match, matchClass, prepareClass(item));
                        }
                    }
            }
            
            if (tag) {
                if (!search) {
                    matchSearch = chain(matchSearch, matchTag, nodeName);
                    search = function(context){
                        return context.getElementsByTagName(tag);
                    };
                }
                else 
                    if (!tagged) { // search does not filter by tag yet
                        match = chain(match, matchTag, nodeName);
                    }
                
            }
            else 
                if (!search) { // default engine
                    search = function(context){
                        var query = context.getElementsByTagName('*');
                        if (!support.byTagAddsComments) 
                            return query;
                        var found = [];
                        for (var i = 0, node; (node = query[i]); i++) {
                            if (node.nodeType === 1) 
                                found.push(node);
                        }
                        return found;
                    };
                    
                }
            
            for (i = 0; (item = selector.pseudos[i]); i++) {
                if (item.name == 'not') { // optimised :not(), fast as possible
                    var not = Sly(item.value);
                    match = chain(match, function(node, not){
                        return !not.match(node);
                    }, (not.parse().length == 1) ? not.parsed[0] : not);
                }
                else {
                    var parser = pseudos[item.name];
                    if (parser) 
                        match = chain(match, parser, item.value);
                }
                
            }
            
            for (i = 0; (item = selector.attributes[i]); i++) {
                match = chain(match, matchAttribute, prepareAttribute(item));
            }
            
            if ((selector.simple = !(match))) {
                selector.matchAux = empty;
            }
            else {
                selector.matchAux = match;
                matchSearch = chain(matchSearch, match);
            }
            
            selector.match = matchSearch || empty;
            
            selector.combine = Sly.combinators[selector.combinator || ' '];
            
            selector.search = search;
            
            return selector;
        };
        
        // Combinators/Pseudos partly from MooTools 1.2-pre, (c) 2006-2009 Valerio Proietti, MIT License
        
        /**
         * Combinators
         */
        var combinators = Sly.combinators = {
            ' ': function(combined, context, selector, state, locate, fast){
                var nodes = selector.search(context);
                if (fast && selector.simple) 
                    return Sly.toArray(nodes);
                for (var i = 0, node, aux = selector.matchAux; (node = nodes[i]); i++) {
                    if (locate(node) && aux(node, state)) 
                        combined.push(node);
                }
                return combined;
            },
            
            '>': function(combined, context, selector, state, locate){
                var nodes = selector.search(context);
                for (var i = 0, node; (node = nodes[i]); i++) {
                    if (node.parentNode == context && locate(node) && selector.matchAux(node, state)) 
                        combined.push(node);
                }
                return combined;
            },
            
            '+': function(combined, context, selector, state, locate){
                while ((context = context.nextSibling)) {
                    if (context.nodeType == 1) {
                        if (locate(context) && selector.match(context, state)) 
                            combined.push(context);
                        break;
                    }
                    
                }
                return combined;
            },
            
            '~': function(combined, context, selector, state, locate){
                while ((context = context.nextSibling)) {
                    if (context.nodeType == 1) {
                        if (!locate(context)) 
                            break;
                        if (selector.match(context, state)) 
                            combined.push(context);
                    }
                }
                return combined;
            }
            
        };
        
        
        /**
         * Pseudo-Classes
         */
        var pseudos = Sly.pseudos = {
        
            // w3c pseudo classes
            
            'first-child': function(node){
                return pseudos.index(node, 0);
            },
            
            'last-child': function(node){
                while ((node = node.nextSibling)) {
                    if (node.nodeType === 1) 
                        return false;
                }
                return true;
            },
            
            'only-child': function(node){
                var prev = node;
                while ((prev = prev.previousSibling)) {
                    if (prev.nodeType === 1) 
                        return false;
                }
                var next = node;
                while ((next = next.nextSibling)) {
                    if (next.nodeType === 1) 
                        return false;
                }
                return true;
            },
            
            'nth-child': function(node, value, state){
                var parsed = Sly.parseNth(value || 'n');
                if (parsed.special != 'n') 
                    return pseudos[parsed.special](node, parsed.a, state);
                state = state || {}; // just to be sure
                state.positions = state.positions || {};
                var uid = Sly.getUid(node);
                if (!state.positions[uid]) {
                    var count = 0;
                    while ((node = node.previousSibling)) {
                        if (node.nodeType != 1) 
                            continue;
                        count++;
                        var position = state.positions[Sly.getUid(node)];
                        if (position != undefined) {
                            count = position + count;
                            break;
                        }
                    }
                    state.positions[uid] = count;
                }
                return (state.positions[uid] % parsed.a == parsed.b);
            },
            
            'empty': function(node){
                return !(node.innerText || node.textContent || '').length;
            },
            
            'contains': function(node, text){
                return (node.innerText || node.textContent || '').indexOf(text) != -1;
            },
            
            'index': function(node, index){
                var count = 1;
                while ((node = node.previousSibling)) {
                    if (node.nodeType == 1 && ++count > index) 
                        return false;
                }
                return (count == index);
            },
            
            'even': function(node, value, state){
                return pseudos['nth-child'](node, '2n+1', state);
            },
            
            'odd': function(node, value, state){
                return pseudos['nth-child'](node, '2n', state);
            }
            
        };
        
        pseudos.first = pseudos['first-child'];
        pseudos.last = pseudos['last-child'];
        pseudos.nth = pseudos['nth-child'];
        pseudos.eq = pseudos.index;
        
        
        /**
         * Attribute operators
         */
        var operators = Sly.operators = {
        
            '*=': function(value, escaped){
                return escaped;
            },
            
            '^=': function(value, escaped){
                return '^' + escaped;
            },
            
            '$=': function(value, escaped){
                return value + '$';
            },
            
            '~=': function(value, escaped){
                return '(?:^|[ \\t\\r\\n\\f])' + escaped + '(?:$|[ \\t\\r\\n\\f])';
            },
            
            '|=': function(value, escaped){
                return '(?:^|\\|)' + escaped + '(?:$|\\|)';
            }
            
        };
        
        
        // public, overridable
        
        /**
         * Sly.getAttribute & Sly.lookupAttribute
         *
         * @todo add more translations
         */
        var translate = {
            'class': 'className'
        }
        
        Sly.lookupAttribute = function(name){
            var prop = translate[name];
            if (prop) {
                return function(node){
                    return node[prop];
                }
            }
            var flag = /^(?:src|href|action)$/.test(name) ? 2 : 0;
            return function(node){
                return node.getAttribute(name, flag);
            }
        };
        
        Sly.getAttribute = function(node, name){
            return node.getAttribute(name);
        };
        
        /**
         * Sly.toArray
         */
        var toArray = Array.slice ||
        function(nodes){
            return Array.prototype.slice.call(nodes);
        };
        
        try {
            toArray(document.documentElement.childNodes);
        } 
        catch (e) {
            toArray = function(nodes){
                if (nodes instanceof Array) 
                    return nodes;
                var i = nodes.length, results = new Array(i);
                while (i--) 
                    results[i] = nodes[i];
                return results;
            };
        }
        
        Sly.toArray = toArray;
        
        Sly.compare = (document.compareDocumentPosition) ? function(a, b){
            return (3 - (a.compareDocumentPosition(b) & 6));
        }
 : function(a, b){
            return (a.sourceIndex - b.sourceIndex);
        };
        
        /**
         * Sly.getUid
         */
        var nextUid = 1;
        
        Sly.getUid = (window.ActiveXObject) ? function(node){
            return (node.$slyUid ||
            (node.$slyUid = {
                id: nextUid++
            })).id;
        }
 : function(node){
            return node.$slyUid || (node.$slyUid = nextUid++);
        };
        
        
        var nthCache = {};
        
        Sly.parseNth = function(value){
            if (nthCache[value]) 
                return nthCache[value];
            
            var parsed = value.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
            if (!parsed) 
                return false;
            
            var a = parseInt(parsed[1], 10), b = (parseInt(parsed[3], 10) || 0) - 1;
            
            if ((a = (isNaN(a)) ? 1 : a)) {
                while (b < 1) 
                    b += a;
                while (b >= a) 
                    b -= a;
            }
            switch (parsed[2]) {
                case 'n':
                    parsed = {
                        a: a,
                        b: b,
                        special: 'n'
                    };
                    break;
                case 'odd':
                    parsed = {
                        a: 2,
                        b: 0,
                        special: 'n'
                    };
                    break;
                case 'even':
                    parsed = {
                        a: 2,
                        b: 1,
                        special: 'n'
                    };
                    break;
                case 'first':
                    parsed = {
                        a: 0,
                        special: 'index'
                    };
                    break;
                case 'last':
                    parsed = {
                        special: 'last-child'
                    };
                    break;
                case 'only':
                    parsed = {
                        special: 'only-child'
                    };
                    break;
                default:
                    parsed = {
                        a: (a) ? (a - 1) : b,
                        special: 'index'
                    };
            }
            
            return (nthCache[value] = parsed);
        };
        Sly.escapeRegExp = function(text){
            return text.replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
        };
        // generic accessors
        
        Sly.generise = function(name){
            Sly[name] = function(text){
                var cls = Sly(text);
                return cls[name].apply(cls, Array.prototype.slice.call(arguments, 1));
            }
        };
        
        var generics = ['parse', 'search', 'find', 'match', 'filter'];
        for (var i = 0; generics[i]; i++) 
            Sly.generise(generics[i]);
        
        
        // compile pattern for the first time
        
        Sly.recompile();
        
        // FIN
        return Sly;
        
    })();
    return {
        varName: "search",
        varVal: Sly.search
    };
});



/*
 *
 * 包含一些简单的共方法
 *
 *
 *
 */
wky_define("wky.common", function(){
    var Clone = function(){
    }
    //做一个副本
    var clone = function(target){
        if (typeof target == 'object') {
            Clone.prototype = target;
            return new Clone();
        }
        else {
            return target;
        }
    }
    //简单的复制 
    var copy = function(target){
        if (typeof target !== 'object') {
            return target;//不是一个对象直接返回
        }
        else {
            var value = target.valueOf();
            if (target != value) {
                //这个对象是一个native对象，如 new String(); 我们就copy一份
                return new target.constructor(value);
            }
            else {
                //如果是一个自定义的类对象，就new一个该类的新对象，然后把原始property 拷贝过来
                //如果是一个纯粹的Object对象复制一下所有的属性就ok了
                if (target instanceof target.constructor && target.constructor !== Object) {
                    var c = clone(target.constructor.prototype);
                    // give the copy all the instance properties of target.  It has the same
                    // prototype as target, so inherited properties are already there.
                    for (var property in target) {
                        if (target.hasOwnProperty(property)) {
                            c[property] = target[property];
                        }
                    }
                }
                else {
                    var c = {};
                    for (var property in target) 
                        c[property] = target[property];
                }
                return c;
            }
        }
    }
    
    // 深度复制
    var deepCopiers = [];
    var DeepCopier = function(config){
        for (var key in config) {
            this[key] = config[key];
        }
    }
    DeepCopier.prototype = {
        constructor: DeepCopier,
        //判断是给定的对象是否可以复制
        canCopy: function(source){
            return false;
        },
        //创建一个要copy的对象，你可以指定任何属性，出来递归调用算法
        create: function(source){
        },
        // Completes the deep copy of the source object by populating any properties
        // that need to be recursively deep copied.  You can do this by using the
        // provided deepCopyAlgorithm instance's deepCopy() method.  This will handle
        // cyclic references for objects already deepCopied, including the source object
        // itself.  The "result" passed in is the object returned from create().
        populate: function(deepCopyAlgorithm, source, result){
        }
    };
    
    function DeepCopyAlgorithm(){
        this.copiedObjects = [];
        thisPass = this;
        this.recursiveDeepCopy = function(source){
            return thisPass.deepCopy(source);
        }
        this.depth = 0;
    }
    DeepCopyAlgorithm.prototype = {
        constructor: DeepCopyAlgorithm,
        maxDepth: 256,
        //添加对象到缓存中，执行前先检查缓存
        cacheResult: function(source, result){
            this.copiedObjects.push([source, result]);
        },
        //检测对象是否已经执行过了
        getCachedResult: function(source){
            var copiedObjects = this.copiedObjects;
            var length = copiedObjects.length;
            for (var i = 0; i < length; i++) {
                if (copiedObjects[i][0] === source) {
                    return copiedObjects[i][1];
                }
            }
            return undefined;
        },
        // deepCopy handles the simple cases itself: non-objects and object's we've seen before.
        // For complex cases, it first identifies an appropriate DeepCopier, then calls
        // applyDeepCopier() to delegate the details of copying the object to that DeepCopier.
        deepCopy: function(source){
            // null is a special case: it's the only value of type 'object' without properties.
            if (source === null) {
                return null;
            }
            if (typeof source !== 'object') {
                return source;
            }
            var cachedResult = this.getCachedResult(source);
            
            // we've already seen this object during this deep copy operation
            // so can immediately return the result.  This preserves the cyclic
            // reference structure and protects us from infinite recursion.
            if (cachedResult) {
                return cachedResult;
            }
            // objects may need special handling depending on their class.  There is
            // a class of handlers call "DeepCopiers"  that know how to copy certain
            // objects.  There is also a final, generic deep copier that can handle any object.
            for (var i = 0; i < deepCopiers.length; i++) {
                var deepCopier = deepCopiers[i];
                if (deepCopier.canCopy(source)) {
                    return this.applyDeepCopier(deepCopier, source);
                }
            }
            // the generic copier can handle anything, so we should never reach this line.
            throw new Error("no DeepCopier is able to copy " + source);
        },
        
        // once we've identified which DeepCopier to use, we need to call it in a very
        // particular order: create, cache, populate.  This is the key to detecting cycles.
        // We also keep track of recursion depth when calling the potentially recursive
        // populate(): this is a fail-fast to prevent an infinite loop from consuming all
        // available memory and crashing or slowing down the browser.
        applyDeepCopier: function(deepCopier, source){
            // Start by creating a stub object that represents the copy.
            var result = deepCopier.create(source);
            // we now know the deep copy of source should always be result, so if we encounter
            // source again during this deep copy we can immediately use result instead of
            // descending into it recursively.  
            this.cacheResult(source, result);
            // only DeepCopier::populate() can recursively deep copy.  So, to keep track
            // of recursion depth, we increment this shared counter before calling it,
            // and decrement it afterwards.
            this.depth++;
            if (this.depth > this.maxDepth) {
                throw new Error("Exceeded max recursion depth in deep copy.");
            }
            // It's now safe to let the deepCopier recursively deep copy its properties.
            deepCopier.populate(this.recursiveDeepCopy, source, result);
            this.depth--;
            
            return result;
        }
    };
    
    // entry point for deep copy.
    //   source is the object to be deep copied.
    //   maxDepth is an optional recursion limit. Defaults to 256.
    var deepCopy = function(source, maxDepth){
        var deepCopyAlgorithm = new DeepCopyAlgorithm();
        if (maxDepth) {
            deepCopyAlgorithm.maxDepth = maxDepth;
        }
        return deepCopyAlgorithm.deepCopy(source);
    }
    
    // publicly expose the DeepCopier class.
    deepCopy.DeepCopier = DeepCopier;
    
    // publicly expose the list of deepCopiers.
    deepCopy.deepCopiers = deepCopiers;
    
    // make deepCopy() extensible by allowing others to 
    // register their own custom DeepCopiers.
    deepCopy.register = function(deepCopier){
        if (!(deepCopier instanceof DeepCopier)) {
            deepCopier = new DeepCopier(deepCopier);
        }
        deepCopiers.unshift(deepCopier);
    }
    
    // Generic Object copier
    // the ultimate fallback DeepCopier, which tries to handle the generic case.  This
    // should work for base Objects and many user-defined classes.
    deepCopy.register({
        canCopy: function(source){
            return true;
        },
        
        create: function(source){
            if (source instanceof source.constructor) {
                return clone(source.constructor.prototype);
            }
            else {
                return {};
            }
        },
        
        populate: function(deepCopy, source, result){
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    result[key] = deepCopy(source[key]);
                }
            }
            return result;
        }
    });
    
    // Array copier
    deepCopy.register({
        canCopy: function(source){
            return (source instanceof Array);
        },
        
        create: function(source){
            return new source.constructor();
        },
        
        populate: function(deepCopy, source, result){
            for (var i = 0; i < source.length; i++) {
                result.push(deepCopy(source[i]));
            }
            return result;
        }
    });
    
    // Date copier
    deepCopy.register({
        canCopy: function(source){
            return (source instanceof Date);
        },
        create: function(source){
            return new Date(source);
        }
    });
    
    // HTML DOM Node
    
    // utility function to detect Nodes.  In particular, we're looking
    // for the cloneNode method.  The global document is also defined to
    // be a Node, but is a special case in many ways.
    var isNode = function(source){
        if (window.Node) {
            return source instanceof Node;
        }
        else {
            // the document is a special Node and doesn't have many of
            // the common properties so we use an identity check instead.
            if (source === document) {
                return true;
            }
            return (typeof source.nodeType === 'number' &&
            source.attributes &&
            source.childNodes &&
            source.cloneNode);
        }
    }
    
    // Node copier
    deepCopy.register({
        canCopy: function(source){
            return isNode(source);
        },
        create: function(source){
            // there can only be one (document).
            if (source === document) {
                return document;
            }
            // start with a shallow copy.  We'll handle the deep copy of
            // its children ourselves.
            return source.cloneNode(false);
        },
        populate: function(deepCopy, source, result){
            // we're not copying the global document, so don't have to populate it either.
            if (source === document) {
                return document;
            }
            
            // if this Node has children, deep copy them one-by-one.
            if (source.childNodes && source.childNodes.length) {
                for (var i = 0; i < source.childNodes.length; i++) {
                    var childCopy = deepCopy(source.childNodes[i]);
                    result.appendChild(childCopy);
                }
            }
        }
    });
    
    return [{
        varName: "DeepCopyAlgorithm",
        varVal: DeepCopyAlgorithm
    }, {
        varName: "copy",
        varVal: copy
    }, {
        varName: "clone",
        varVal: clone
    }, {
        varName: "deepCopy",
        varVal: deepCopy
    }]
});

/*
 * 定义事件
 *
 */
wky_define("wky", function(){
    //整个页面一个事件系统
    var doc = document;
    var isDomReady = false;
    var domReady = function(callback){
        if (!callback) {
            return;
        }
        var ready = function(){
            isDomReady = true;
            callback();
        }
        var domLoaded = function(){
            if (doc.addEventListener) {
                doc.removeEventListener("DOMContentLoaded", domLoaded, false);
                ready();
            }
            else {
                if (doc.readyState === "complete") {
                    doc.detachEvent("onreadystatechange", domLoaded);
                    ready();
                }
            }
        }
        if (doc.addEventListener) {
            doc.addEventListener("DOMContentLoaded", domLoaded, false);
            window.addEventListener("load", ready);
        }
        else {
            doc.attachEvent("onreadystatechange", domLoaded);
            window.attachEvnet("load", ready);
            var top = false;
            try {
                top = window.frameElement == null && document.documentElement;
            } 
            catch (e) {
            }
            if (top && top.doScroll) {
                (function doScrollCheck(){
                    if (!isDomReady) {
                        try {
                            top.doScroll("left");
                        } 
                        catch (e) {
                            return setTimeout(doScrollCheck, 50);
                        }
                        ready();
                    }
                })();
            }
        }
    }
    return [{
        varName: "domReady",
        varVal: domReady
    }];
});

//wky 的事件对象
wky_define("wky.event", function(){
    var core = wky.core;
    var win = window;
    var doc = document;
    //是否是element节点 
    var isUseableElement = function(node){
<<<<<<< HEAD
        if (!core.isNode(node) || (node.nodeType !== 1 && node.nodeType !== 9)) {
=======
        if (!core.isNode(node) || node.nodeType !== 1 || node.nodeType !== 9) {
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
            return false;
        }
        return true;
    }
    //event object 
    //{ele:"",click:[],mousover:""}
    var eventList = [];
    
<<<<<<< HEAD
    //根据节点找到事件节点
=======
	//根据节点找到事件节点
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
    var getBindedEvt = function(node){
        var evt = null;
        //todo:是时的终止循环
        core.each(eventList, function(i, v){
            if (!v) {
                return;
            }
            if (v.ele === node) {
                evt = v;
                return false;
            }
        });
        return evt;
    }
<<<<<<< HEAD
	//停止冒泡
	var stopPropagation = function(evt){
		if(!evt){
			return;
		}
		if ("stopPropagation" in evt) {
			evt.stopPropagation();
		}
		if("cancelBubble" in evt){
			evt.cancelBubble = true;	
		}
	}
	//阻止默认
	var preventDefault = function(evt){
		if("preventDefault" in evt){
			evt.preventDefault();
		}
		if("returnValue" in evt){
			evt.returnValue = false;
		}
	}
    
    //删除掉响应的函数
    var findFnIndex = function(evtList, fn){
        var idx = -1;
        if (!core.isArray(evtList) || !core.isFunction(fn)) {
            return idx;
        }
        //todo:用indexOf 方法
        core.each(evtList, function(i, k){
            if (k === fn) {
                idx = i;
                return false;
            }
        });
        return idx;
    }
=======
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
    
    //绑定事件
    var addEvent = function(node, type, fn){
        if (doc.addEventListener) {
            node.addEventListener(type, fn, false);
        }
        else {
            node.attachEvent("on" + type, fn);
        }
    }
    
    //移除事件
<<<<<<< HEAD
    var removeEvent = function(node, type, fn){
        if (doc.removeEventListener) {
            node.removeEventListener(type, fn, false);
        }
        else {
            node.detachEvent("on" + type, fn);
        }
    }
    
    //添加到列表
    var addToList = function(node, type, fn, execed){
=======
    var removeEvent = function(){
    
    }
    //添加到列表
    var addToList = function(node, type, fn){
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
        if (!isUseableElement(node) || !type) {
            return;
        }
        //todo:应该切入进去，统一组织event对象
        var evtObj = getBindedEvt(node);
        if (!evtObj) {
            evtObj = {
                ele: node,
<<<<<<< HEAD
                baseFn: null
            }
            evtObj[type] = [fn];
            eventList.push(evtObj);
            //绑定事件
            //addEvent(node, type, evtObj.baseFn);
        }
        else {
            if (type in evtObj) {
                evtObj[type].push(fn);
                //已经绑定了
                return;
=======
                type: [fn],
                baseFn: baseFn
            }
            var baseFn = core.bind(function(evLs, nd){
				var args = [].slice.call(arguments,2);
                core.forEach(evLs,function(v, i){
                	if(isFunction(v)){
						v.apply(nd,args);
					}
                });
            }, evtObj[type], node);
            eventList.push(evtObj);
            //绑定事件
            addEvent(node, type, baseFn);
        }
        else {
            if (type in evtObj) {
                evtObj.type.push(fn);
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
            }
            else {
                evtObj[type] = [fn];
            }
<<<<<<< HEAD
            //绑定事件
            //addEvent(node, type, evtObj.baseFn);
        }
        evtObj.baseFn = core.bind(function(){
            var evLs = evtObj[type] || [];
            var args = [].slice.call(arguments, 0);
            var that = this;
			var isStopPropagation = false;
            core.each(evLs, function(i,v){
                if (core.isFunction(v)) {
                    if(v.apply(that, args) === false){
						isStopPropagation = true;
					};
				}
            });
            if (core.isFunction(execed)) {
                execed.call();
            }
			if(isStopPropagation){
				stopPropagation.apply(that,args);
				preventDefault.apply(that,args);
				return false;
			}
        }, node);
        //绑定事件
        addEvent(node, type, evtObj.baseFn);
    }
=======
        }
    }
	
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
    //从列表中移除
    var removeFromList = function(node, type, fn){
        if (!isUseableElement(node) || !type) {
            return;
        }
        //todo:应该切入进去，统一组织event对象
        var evtObj = getBindedEvt(node);
        if (!evtObj) {
            return;
        }
        else {
            if (type in evtObj) {
<<<<<<< HEAD
                if (!core.isFunction(fn)) {
                    evtObj[type] = [];
                    removeEvent(node, type, evtObj.baseFn);
                    return;
                }
                var idx = findFnIndex(evtObj[type], fn);
                if (~ idx) {
                    evtObj[type].splice(idx, 1);
                }
                if (!evtObj[type].length) {
                    //移除对象
                    removeEvent(node, type, evtObj.baseFn);
                }
            }
            else {
                //evtObj[type] = [fn];
            }
        }
    }
    //todo:process
    var add = function(node, type, fn){
        addToList(node, type, fn);
    }
    //todo:移除事件
    var remove = function(node, type, fn){
        removeFromList(node, type, fn);
    }
    //只添加一次
    var addOnce = function(node, type, fn){
        var execdCallback = function(){
            remove(node, type, fn);
        }
        addToList(node, type, fn, execdCallback);
    }
    //移除当前对象上所有的事件
    var removeAll = function(node){
        var evtObj = getBindedEvt(node);
        core.forIn(evtObj, function(evtType, evtList){
            if (evtType == "ele") {
                return;
            }
            remove(node, evtType);
        });
    }
    return [{
        varName: "add",
        varVal: add
    }, {
        varName: "remove",
        varVal: remove
    }, {
        varName: "addOnce",
        varVal: addOnce
    }, {
        varName: "removeAll",
        varVal: removeAll
    }];
});

/*
 *
 * wky 缓动处理
 *
 *
 *
 */
wky_define("wky.tween", function(){

    var tween = {
        easeInQuad: function(pos){
            return Math.pow(pos, 2);
        },
        easeOutQuad: function(pos){
            return -(Math.pow((pos - 1), 2) - 1);
        },
        easeInOutQuad: function(pos){
            if ((pos /= 0.5) < 1) 
                return 0.5 * Math.pow(pos, 2);
            return -0.5 * ((pos -= 2) * pos - 2);
        },
        easeInCubic: function(pos){
            return Math.pow(pos, 3);
        },
        easeOutCubic: function(pos){
            return (Math.pow((pos - 1), 3) + 1);
        },
        easeInOutCubic: function(pos){
            if ((pos /= 0.5) < 1) 
                return 0.5 * Math.pow(pos, 3);
            return 0.5 * (Math.pow((pos - 2), 3) + 2);
        },
        easeInQuart: function(pos){
            return Math.pow(pos, 4);
        },
        easeOutQuart: function(pos){
            return -(Math.pow((pos - 1), 4) - 1)
        },
        easeInOutQuart: function(pos){
            if ((pos /= 0.5) < 1) 
                return 0.5 * Math.pow(pos, 4);
            return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
        },
        easeInQuint: function(pos){
            return Math.pow(pos, 5);
        },
        easeOutQuint: function(pos){
            return (Math.pow((pos - 1), 5) + 1);
        },
        easeInOutQuint: function(pos){
            if ((pos /= 0.5) < 1) 
                return 0.5 * Math.pow(pos, 5);
            return 0.5 * (Math.pow((pos - 2), 5) + 2);
        },
        easeInSine: function(pos){
            return -Math.cos(pos * (Math.PI / 2)) + 1;
        },
        easeOutSine: function(pos){
            return Math.sin(pos * (Math.PI / 2));
        },
        easeInOutSine: function(pos){
            return (-.5 * (Math.cos(Math.PI * pos) - 1));
        },
        easeInExpo: function(pos){
            return (pos == 0) ? 0 : Math.pow(2, 10 * (pos - 1));
        },
        easeOutExpo: function(pos){
            return (pos == 1) ? 1 : -Math.pow(2, -10 * pos) + 1;
        },
        easeInOutExpo: function(pos){
            if (pos == 0) 
                return 0;
            if (pos == 1) 
                return 1;
            if ((pos /= 0.5) < 1) 
                return 0.5 * Math.pow(2, 10 * (pos - 1));
            return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
        },
        easeInCirc: function(pos){
            return -(Math.sqrt(1 - (pos * pos)) - 1);
        },
        easeOutCirc: function(pos){
            return Math.sqrt(1 - Math.pow((pos - 1), 2))
        },
        easeInOutCirc: function(pos){
            if ((pos /= 0.5) < 1) 
                return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
            return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
        },
        easeOutBounce: function(pos){
            if ((pos) < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            }
            else 
                if (pos < (2 / 2.75)) {
                    return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
                }
                else 
                    if (pos < (2.5 / 2.75)) {
                        return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
                    }
                    else {
                        return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
                    }
        },
        easeInBack: function(pos){
            var s = 1.70158;
            return (pos) * pos * ((s + 1) * pos - s);
        },
        easeOutBack: function(pos){
            var s = 1.70158;
            return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
        },
        easeInOutBack: function(pos){
            var s = 1.70158;
            if ((pos /= 0.5) < 1) 
                return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
            return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
        },
        elastic: function(pos){
            return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
        },
        swingFromTo: function(pos){
            var s = 1.70158;
            return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) : 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
        },
        swingFrom: function(pos){
            var s = 1.70158;
            return pos * pos * ((s + 1) * pos - s);
        },
        swingTo: function(pos){
            var s = 1.70158;
            return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
        },
        bounce: function(pos){
            if (pos < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            }
            else 
                if (pos < (2 / 2.75)) {
                    return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
                }
                else 
                    if (pos < (2.5 / 2.75)) {
                        return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
                    }
                    else {
                        return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
                    }
        },
        bouncePast: function(pos){
            if (pos < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            }
            else 
                if (pos < (2 / 2.75)) {
                    return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
                }
                else 
                    if (pos < (2.5 / 2.75)) {
                        return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
                    }
                    else {
                        return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
                    }
        },
        easeFromTo: function(pos){
            if ((pos /= 0.5) < 1) 
                return 0.5 * Math.pow(pos, 4);
            return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
        },
        easeFrom: function(pos){
            return Math.pow(pos, 4);
        },
        easeTo: function(pos){
            return Math.pow(pos, 0.25);
        },
        linear: function(pos){
            return pos
        },
        sinusoidal: function(pos){
            return (-Math.cos(pos * Math.PI) / 2) + 0.5;
        },
        reverse: function(pos){
            return 1 - pos;
        },
        mirror: function(pos, transition){
            transition = transition || tween.sinusoidal;
            if (pos < 0.5) 
                return transition(pos * 2);
            else 
                return transition(1 - (pos - 0.5) * 2);
        },
        flicker: function(pos){
            var pos = pos + (Math.random() - 0.5) / 5;
            return tween.sinusoidal(pos < 0 ? 0 : pos > 1 ? 1 : pos);
        },
        wobble: function(pos){
            return (-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
        },
        pulse: function(pos, pulses){
            return (-Math.cos((pos * ((pulses || 5) - .5) * 2) * Math.PI) / 2) + .5;
        },
        blink: function(pos, blinks){
            return Math.round(pos * (blinks || 5)) % 2;
        },
        spring: function(pos){
            return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
        },
        none: function(pos){
            return 0
        },
        full: function(pos){
            return 1
        }
    };
    
    var core = wky.core;
    var animatFnList = [];
    var timer = null;
    
    var circleLoop = function(interval){
        interval = interval || 200;
        if (!animatFnList.length) {
            endTimer();
            return;
        }
        if (animatFnList.length) {
            core.each(animatFnList, function(i, k){
                if (core.isFunction(k)) {
                    k();
                }
            });
        }
        //fn();
        timer = setTimeout(function(){
            circleLoop(interval);
        }, interval);
    }
    
    var timerInterval = function(fn, interval){
        animatFnList.push(fn);
        circleLoop(interval);
    }
    //找到函数对应的位置
    var findFnIndex = function(anFnList,fn){
        var idx = -1;
        if (!core.isArray(anFnList) || !core.isFunction(fn)) {
            return idx;
        }
        //todo:用indexOf 方法
        core.each(anFnList, function(i, k){
            if (k === fn) {
                idx = i;
                return false;
            }
        });
        return idx;
    }
    
    var stopIntervalTimer = function(anFn){
        if (!core.isFunction(anFn)) {
            return;
        }
        var idx = findFnIndex(animatFnList,anFn);
		if(idx > -1){
			animatFnList.splice(idx,1);
		}
    }
    
    //结束
    var endTimer = function(){
        if (timer) {
            clearTimeout(timer);
        }
        timer = null;
    }
    
    
    var animate = function(option){
        option = option || {};
        var duration = option.duration || 1000;
        var change = option.change;
        var end = option.end;
        var start = option.start;
        var easing = option.easing || "linear";
        var step = option.step ||
        function(){
        };
        var complete = option.complete ||
        function(){
        };
        var init = 0;
        //如果没有起始点的话就结束掉，如果没有结束点的话，或者改变量的话就结束掉
        if (core.isUndefined(start) || (core.isUndefined(change) && core.isUndefined(end))) {
            return;
        }
        if (core.isUndefined(change)) {
            change = end - start;
        }
        var anFn = function(){
            var delta = tween[easing](init / duration);
            var clVal = start + (delta * change);
            //console.log(delta + ":" + clVal);
            step(delta, clVal, change, change);
            if (init >= duration) {
                stopIntervalTimer(anFn);
                complete();
                return;
            }
            init += 5;
        }
        timerInterval(anFn, 10);
    }
    return {
        varName: "animate",
        varVal: animate
    }
=======
            	//find fn
				
				
                evtObj.type.push(fn);
                
            }
            else {
                evtObj[type] = [fn];
            }
        }
        //绑定事件
        addEvent(node, type, fn);
    }
    
    
    //todo:process
    var add = function(){
    
    }
    
    var remove = function(){
    
    }
    
    var addOnce = function(){
    
    }
    
    var removeAll = function(){
    
    }
    
    return [{}];
    
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
});



wky_define("wky.cookie", function(){


});

