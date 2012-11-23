/*
 * 
 * author:dustin
 * 
 * email:dushaobindoudou@gmail.com
 *
 * 旋转图片
 *
 * 支持css3，2d旋转的用css3方法，不支持css3的用滤镜，其他的不考虑
 *
 *
 */
(function(win){
    var doc = win.document;
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === "[object String]";
    }
    //获取变换参数函数
    var getMatrix = function(radian, x, y){
        var Cos = Math.cos(radian), Sin = Math.sin(radian);
        return {
            M11: Cos * x,
            M12: -Sin * y,
            M21: Sin * x,
            M22: Cos * y
        };
    }
    var config = {
        cssTf: ["transform", "MozTransform", "webkitTransform", "OTransform", "msTransform"]
    }
    
    var detectSupport = function(){
        var dv = doc.createElement("div"), dvStyle = dv.style, i = 0, len = config.cssTf.length, css3Trs = null;
        for (; i < len; i++) {
            if (config.cssTf[i] in dvStyle) {
                css3Trs = config.cssTf[i];
            }
        }
        return {
            css3Transform: css3Trs,
            filter: ("filters" in dv)
        }
    }
    
    var angleToRadian = function(angle){
        if (!angle || typeof angle !== "number") {
            return;
        }
        return angle * Math.PI / 180;
    }
    var extend = function(source, target){
        for (k in source) {
            if (source.hasOwnProperty(k)) {
                target[k] = source[k];
            }
        }
        
    }
    
    var Rotate = function(ele){
        this.ele = isString(ele) ? doc.getElementById(ele) : ele;
        this.x = 1;
        this.y = 1;
		this.clientHeight = ele.clientHeight;
		this.clientWidth = ele.clientWidth;
        this.setAngel = function(){
        };
        this.init();
    }
    
    Rotate.prototype = {
        constructor: Rotate,
        init: function(){//初始化ele
            var that = this;
			var setAngleFun = that.despatcher();
            this.setAngel = function(){
				var arg = [].slice.call(arguments);
				arg.splice(0,0,that.ele)
                setAngleFun.apply(that,arg);
            }
        },
        despatcher: function(){
            var support = detectSupport();
            if (support.css3Transform) {
                return function(ele, angle){
                    var radian = angleToRadian(angle);
                    var matrix = getMatrix(radian || 0, this.y, this.x);
                    //设置变形样式
                    ele.style[support.css3Transform] = "matrix(" + matrix.M11.toFixed(16) +
                    "," +
                    matrix.M21.toFixed(16) +
                    "," +
                    matrix.M12.toFixed(16) +
                    "," +
                    matrix.M22.toFixed(16) +
                    ", 0, 0)";
                }
            }
            if (support.filter) {
                this.ele.style.filter = "progid:DXImageTransform.Microsoft.Matrix(SizingMethod='auto expand')";
                return function(ele, angle){
					try {
						var radian = angleToRadian(angle);
						var matrix = getMatrix(radian || 0, this.y, this.x);
						var ftMatx = ele.filters.item("DXImageTransform.Microsoft.Matrix");
						extend(matrix, ftMatx);
						//修正居中
						ele.style.top = (this.clientHeight - ele.offsetHeight) / 2 + "px";
						ele.style.left = (this.clientWidth - ele.offsetWidth) / 2 + "px";
					}catch(e){
						console.log(e);
					}
                }
            }
            return function(){
            
            }
        }
    }
    
	win.Rotate = Rotate;
})(window)
