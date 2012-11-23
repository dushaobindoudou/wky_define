/*
 * 添加一个圆环
 * author:dustin
 *
 * email:dushaobindoudou@gmail.com
 *
 *
 *
 */
(function(win){
    /*
     *
     * 生成圆的位置路径
     *
     * param options.relativeX 相对页面上某个横行坐标
     * 		 options.relateveX 相对页面上某个竖坐标
     * 		 options.raduis 生成圆的半径
     * 		 options.stepLen 每个位置的间隔距离
     *
     *
     */
    var generateArcListCorrdinate = function(option){
        //更新坐标系(就不根据当前的元素取值了，直接根据窗口计算就好了)
        var moveToX = option.relativeX || 0;
        var moveToY = option.relativeX || 0;
        //选定半径(半径要有适当的间隔)
        var initRadius = option.radius || 100;
        //这个就是步长，每隔多少，算一下
        var vtlLen = option.stepLen || 32;
        var calculateAngel = function(partNum, orginDeg){
            if (typeof partNum === undefined || orginDeg === undefined) {
                return;
            }
            var relDeg = (180 - orginDeg) / 2;
            var res = relDeg - partNum * orginDeg;
            return isNaN(res) ? 0 : res;
        }
        var getCircle = function(stepLen, radius){
            if (!stepLen || !radius) {
                return;
            }
            var vtlLen = stepLen, initRadius = radius, tpOne = [];
            var ag = 2 * (Math.asin(vtlLen / 2 / initRadius));
            var tpag = ag, i = 0;
            while (tpag <= 2 * Math.PI) {
                //todo:可以不用每次都计算计算90度然后后面用坐标变换取得
                var h = Math.sin(Math.PI - tpag) * initRadius;
                var w = Math.cos(Math.PI - tpag) * initRadius;
                tpOne.push({//todo:可以改变旋转的放心
                    y: moveToY - parseInt(h.toFixed(2)),
                    x: moveToX + parseInt(w.toFixed(2)),
                    rotate: calculateAngel(i, (ag) / Math.PI * 180)
                });
                tpag += ag;
                i++;
            }
            return tpOne;
        }
        return getCircle(vtlLen, initRadius);
    }
    
    var initCircle = function(circle){
        if (!circle) {
            return;
        }
        var firstCircle = circle;
        var eles = firstCircle.find(".circle-content span");
        var pos = firstCircle.offset();
        var wd = firstCircle.width();
        var ht = firstCircle.height();
        var list = generateArcListCorrdinate({
            relativeX: ht / 2 - 16,
            relativeY: wd / 2 - 16,
            radius: 118 + 16,
            stepLen: 32
        });
        
        for (var i = 0; i < list.length; i++) {
            var l = list[i];
            eles.eq(i).css({
                left: l.x,
                top: l.y,
                position: "absolute"
            });
        }
    };
    var circleGuid = function(){
        var id = 0;
        return function(){
            id++;
            return "_circle_" + id;
        }
    }()
    
    var Circle = function(opt){
        if (!opt) {
            return;
        }
        this.circlePath = [];
        this.circleEle = {};
        this.id = opt.id || circleGuid();
        this.relativeX = opt.relativeX || 0;
        this.relativeY = opt.relativeY || 0;
		this.circleName = opt.circleName || "";
        this.radius = opt.radius || 10;
        this.stepLen = opt.stepLen || 10;
        this.init();
    }
    Circle.prototype = {
        init: function(){
            this.circlePath = this.generateCirclePath();
            this.createCircle();
        },
        createCircle: function(){
            var ccEle = this.circleEle;
            ccEle.circle = $('<div id="' + this.id + '" class="circle"></div>');
            ccEle.outerCircle = $('<div class="outer-circle"></div>');
            ccEle.innerCircle = $('<div class="inner-circle"></div>');
            ccEle.circleInfo = $('<div class="circle-info"></div>');
            ccEle.circleInfoCnt = $('<div class="circle-info-cnt" >'+this.circleName+'</div>')
            ccEle.circleContent = $('<div class="circle-content"></div>');
            ccEle.circle.append(ccEle.outerCircle).append(ccEle.innerCircle.append(ccEle.circleInfo.append(ccEle.circleInfoCnt))).append(ccEle.circleContent);
            return this;
        },
        generateCirclePath: function(){
            var that = this;
            var list = generateArcListCorrdinate({
                relativeX: that.relativeX,
                relativeY: that.relativeY,
                radius: that.radius,
                stepLen: that.stepLen
            })
            return list;
        },
        updateCircle: function(){
            var that = this;
            var path = that.circlePath;
            var list = that.circleEle.circleContent.children();
            for (var i = 0; i < path.length; i++) {
                var l = path[i];
                list.eq(i).css({
                    left: l.x,
                    top: l.y,
                    position: "absolute"
                });
            }
            return that;
        },
        addSmallCnt: function(circle){
            var that = this;
            if (!circle) {
                return;
            }
            that.circleEle.circleContent.append(circle);
            that.updateCircle();
        },
        removeSmallCnt: function(ele){
            var that = this;
            if (!ele) {
                return;
            }
            ele.remove();
            that.upldateCircle();
        },
        distory: function(){
            this.circleEle.circle.remove();
            return;
        },
		updateName:function(name){
			var ccEle = this.circleEle;
			if(name){
				ccEle.circleInfoCnt.html(name);
			}
		}
    }
    
    
    var CircleCollection = function(){
        this.circles = {};
    }
    CircleCollection.prototype = {
        constructor: CircleCollection,
        addCircle: function(opt){
            if (!opt) {
                return;
            }
            var circle = new Circle(opt);
            if (this.circles[opt.id]) {
                return;
            }
            this.circles[circle.id] = circle;
            return circle;
        },
        destoryCircle: function(id){
            if (!id) {
                return;
            }
            var circle = this.circles[id];
            if (circle) {
                circle.distory();
            }
            delete this.circles[id];
        },
        getCircle: function(id){
            if (!id) {
                return;
            }
            return this.circles[id];
        }
    }
    
    win.circle = function(){
        var cc = new CircleCollection();
        return {
            circles: cc,
            add: cc.addCircle,
            get: cc.getCircle,
            destory: cc.destoryCircle
        }
    }()
    
})(window)
