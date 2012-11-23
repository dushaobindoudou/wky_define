/*
 *
 * author:dustin
 *
 * email:dushaobindoudou@gmail.com
 *
 *
 *
 */
(function(exports){
    "use strict"
    
    
    var guid = function(){
        var id = 0;
        return function(){
            id += 1;
            return "_slider_" + id;
        }
    }()
    
    var createPannel = function(id, css){
        var pannel = $('<div id="' + id + '"></div>');
        pannel.css(css);
        var slidPannel = $('<div class="slid-pannel"></div>').css({
            position: "absolute",
            top: 0,
            left: 0,
            width: css.width,
            height: css.height
        });
        pannel.append(slidPannel);
        return {
            pannelEle: pannel,
            slidPannelEle: slidPannel
        };
    }
    
    var bind = function(context, fn){
        if (!context || !fn) {
            return;
        }
        return function(){
            var args = [].slice.call(arguments)
            return fn.apply(context, args);
        }
    }
    
    
    /*
     *
     * 生成一个可以滑动的模块
     *
     * @param {opt object}
     * 		opt.id 当前slider的id
     * 		opt.pannel[object] 当前slider所需要的信息
     * 		opt.pannel.css 外部的样式包括宽高
     * 		opt.sliderDirection 滑动的方向  v 表示纵向滑动 h表示横向滑动
     * 		opt.stepDistance 默认是窗口大小(如果是数字表示自定义，如果是pannel表示的是pannel的大小，如果content表示的是根据内容的大小)
     * 		opt.defaultDesIdx 默认显示第一个
     * 		opt.slidInterval 默认是500毫秒
     *
     *
     *
     */
    var Slider = function(opt){
        if (!opt) {
            return;
        }
        this.id = opt.id || guid();
        this.pannelArg = opt.pannel;
        this.pannelCss = opt.pannel.css;
        this.pannelCnt = opt.pannel.cnt;
        this.currentDis = opt.defaultDesIdx || 0;
        this.stepDisArg = opt.stepDistance;
        this.slidDirection = opt.sliderDirection || "h";
        this.stepDistance = 0;
        this.totalStep = 0;
        this.slidInterval = opt.slidInterval || 500;
        this.isAnimating = false;
        
        this.init();
    }
    
    Slider.prototype = {
        constructor: Slider,
        init: function(){
            var that = this;
            if (!that.pannel) {
                that.pannel = createPannel(that.id, that.pannelCss);
            }
            if (that.pannelCnt) {
                that.addContent(that.pannelCnt);
            }
            //取得每一步的长度
            this.stepDistance = this.getStepDistance(this.stepDisArg);
            //得到总长度
            this.getStepLen();
        },
        getStepLen: function(){
            //这个值是不是取的次数太多了，可以先保存一下
            var totalLen = 1;
            if (this.slidDirection == "h") {
                totalLen = this.pannel.slidPannelEle.width();
            }
            else {
                totalLen = this.pannel.slidPannelEle.height()
            }
            this.totalStep = Math.ceil(totalLen / this.stepDistance);
            return;
        },
        switchTo: function(index){
            if (this.isAnimating || index === void 0) {
                return;
            }
            if (index >= this.totalStep) {
				this.currentDis = -1;
			}
			else 
				if (index < 0) {
					this.currentDis = this.totalStep;
				}
				else {
					this.currentDis = index;
				}
            var targetCss = this.getTargetCss();
            this.slideTo(targetCss);
        },
        next: function(){
            if (this.isAnimating) {
                return;
            }
            if (this.currentDis >= this.totalStep - 1) {
                this.currentDis = -1;
            }
            this.currentDis++;
            var targetCss = this.getTargetCss();
            this.slideTo(targetCss);
        },
        prev: function(){
            if (this.isAnimating) {
                return;
            }
            if (this.currentDis <= 0) {
                this.currentDis = this.totalStep;
            }
            this.currentDis--;
            var targetCss = this.getTargetCss();
            this.slideTo(targetCss);
        },
        slideTo: function(css, complete){
            var that = this;
            if (!css) {
                return;
            }
            that.isAnimating = true;
            that.pannel.slidPannelEle.animate(css, {
                duration: this.slidInterval,
                complete: function(){
                    that.isAnimating = false;
                    complete && complete();
                }
            });
        },
        getStepDistance: function(destance){
            if (this.slidDirection == "h") {
                if (destance === void 0 || destance == "pannel") {
                    return this.pannel.pannelEle.width();
                }
                if (destance == "content") {
                    return this.pannel.slidPannelEle.children().eq(this.currentDis).width();
                }
            }
            else {
                if (destance === void 0 || destance == "pannel") {
                    return this.pannel.pannelEle.height();
                }
                if (destance == "content") {
                    return this.pannel.slidPannelEle.children().eq(this.currentDis).height();
                }
            }
            destance = parseInt(destance);
            return isNaN(destance) ? 0 : destance;
        },
        getTargetCss: function(){
            var target = {};
            if (this.slidDirection == "h") {
                target = {
                    left: -this.currentDis * this.stepDistance
                }
            }
            else {
                target = {
                    top: -this.currentDis * this.stepDistance
                }
            }
            return target;
            
        },
        updatePannel: function(){
            var childrenWd = 0;
            var outerSize = 0;
            if (this.slidDirection == "h") {
                $.each(this.pannel.slidPannelEle.children(), function(i, k){
                    childrenWd += parseInt($(k).width());
                });
                outerSize = this.pannel.pannelEle.width();
                if (outerSize > childrenWd) {
                    childrenWd = outerSize;
                }
                this.pannel.slidPannelEle.width(childrenWd);
            }
            else {
                $.each(this.pannel.slidPannelEle.children(), function(i, k){
                    childrenWd += $(k).height();
                });
                outerSize = this.pannel.pannelEle.height();
                if (outerSize > childrenWd) {
                    childrenWd = outerSize;
                }
                this.pannel.slidPannelEle.height(childrenWd);
            }
            this.getStepLen();
            return childrenWd;
        },
        addContent: function(cnt){
            if (!cnt) {
                return;
            }
            this.pannel.slidPannelEle.append(cnt);
            this.updatePannel();
            
            return;
        },
        removeContent: function(){
            this.updatePannel();
        }
    }
    
    var SliderCollection = function(){
        this.collections = {};
        
        this.init();
    }
    
    SliderCollection.prototype = {
        constructor: SliderCollection,
        init: function(){
        
        },
        addSlider: function(opt){
            var coll = this.collections;
            //todo:sd的id可以再这里边生成，如果已经存在就跳过，如果不存在就创建
            var sd = new Slider(opt);
            if (coll[sd.id]) {
                return;
            }
            coll[sd.id] = sd;
            return sd;
        },
        removeSlider: function(id){
            if (!id) {
                return this;
            }
            this.destorySlider(id);
            if (this.collections[id]) {
                delete this.collections[id]
            }
            return this;
        },
        destorySlider: function(id){
            if (!id) {
                return;
            }
            if (this.collections[id]) {
                this.collections[id].pannel.pannelEle.remove();
            }
            return this;
        }
        
    }
    
    exports.slider = function(){
        var sc = new SliderCollection();
        return {
            sliderCollection: sc,
            add: bind(sc, sc.addSlider),
            removeSlider: bind(sc, sc.removeSlider),
            destorySlider: bind(sc, sc.destorySlider)
        }
    }();
    
    
})(window)
