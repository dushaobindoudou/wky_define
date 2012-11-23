
/*
 *
 * author:dustin
 * email:dushaobindoudou@gmail.com
 * 
 * 
 * 
 *  狮子座Leo ：艾奥里亚-Aiolia
 *  
 *  
 * 　守护狮子宫黄金圣斗士，懂得多种光速拳，被称为“黄金狮子”，实力强大。
 *  人马座·艾俄洛斯的弟弟，以勇猛刚强著称，极富正义与勇气，并一心想洗去兄长的污名。最初不承认纱织，在艾俄洛斯的射手座黄金圣衣的肯定下向纱织发誓效忠。
 *  黄道十二宫中被双子座撒加用 “幻胧魔皇拳”所操纵，在狮子宫与星矢对战。幸有卡西欧士的牺牲，最后恢复清醒。冥界一战，一人杀六名冥斗士，用光速拳打败地伏星·蚯蚓·拉美。
 *  在冥王篇中最后因冥结界被弱化而败于冥界三巨头之一 天猛星·拉达曼迪斯手下。在冥界为了击穿叹息之墙而逝去，为雅典娜献身。
 * 
 * 
 * 
 *
 * 默认最大帧数是2000
 * 路径要是连续的  根据页面高度
 * 	{
 form:0,//暂时用不到,但是必须要加上
 to:0,//暂时用不到,但是必须要加上
 pAxisBegin:50,//这表示开始进行动作的抽象轴
 transforms:[{
 ele:"",//selector 这个是一个选择器
 fun:["cricel",r,x,y],[line,1,1,1],
 steps:""//针对一个横点上的旋转要求 多少步
 everydalt:steps,
 easing:linear, //默认线性
 autoRun:false,
 stepDistence:3 //todo:步长可以自定义
 }}]
 }
 *
 *
 * todo:完善缓动操作
 * todo:解决某些偶尔不运行bug
 * todo:增加自动完成
 * todo:timer不受控制，独立分出去自己路由，只标记两个点 开始和结束，到达这两个点是就开始运行否则（也可以是两个范围）
 *
 */
(function(win){
    //主要动画形象 线性移动 ，旋转，放大，缩小 （这个挺麻烦的，要把这些映射到高度上）
    //var pathData = [];
    //自动执行的对象
    //var autoRunQueue = [];
    
    //可执行的路径
    var currExecPath = {};
    
    //每一个p点变化的单位 todo:要可以自定义
    var everyPChangeSize = 12;
    
    //透明度变化
    var erveryOpacityChange = 0.02;
    
    //记住做后排除的是哪一个下次从这里开始
    var theLastMark = 0;
    //虚拟p轴
    //var road = 0;
    //var roadStatus = {};
    
    //最大运行的帧数
    var maxFrame = 2000;
    
    var doc = win.document;
    var dom = $(doc);
    
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
    }
    
    var generateArcListCorrdinate = function(option){
        if (isUndefined(option)) {
            return [];
        }
        //更新坐标系(就不根据当前的元素取值了，直接根据窗口计算就好了)
        var moveToX = option.relativeX || 0;
        var moveToY = option.relativeY || 0;
        //选定半径(半径要有适当的间隔)
        var initRadius = option.radius || 100;
        //这个就是步长，每隔多少，算一下
        var vtlLen = option.stepLen || 32;
        var disP = option.p || 0;
        var easingFn = tween[option.easing] || tween["linear"];
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
                return [];
            }
            var vtlLen = stepLen, initRadius = radius, tpOne = [];
            var ag = 2 * (Math.asin(vtlLen / 2 / initRadius));
            var totalSteps = Math.ceil(2 * Math.PI / ag);
            var tpag = ag, i = 0;
            while (tpag <= 2 * Math.PI) {
                var delta = easingFn(i / totalSteps);
                var h = Math.sin(-2 * Math.PI * delta) * initRadius;
                var w = Math.cos(-2 * Math.PI * delta) * initRadius;
                disP += 1;
                tpOne.push({
                    y: moveToY - parseInt(h.toFixed(2)),
                    x: moveToX + parseInt(w.toFixed(2)),
                    rotate: calculateAngel(i, (ag) / Math.PI * 180),
                    p: disP
                });
                tpag += ag;
                i++;
            }
            disP++;
            tpOne.push({
                y: moveToY -  parseInt((Math.sin(-2 * Math.PI) * initRadius).toFixed(2)),
                x: moveToX + parseInt((Math.cos(-2 * Math.PI) * initRadius).toFixed(2)),
                rotate: calculateAngel(i + 1, (ag) / Math.PI * 180),
                p: disP
            });
            return tpOne;
        }
        return getCircle(vtlLen, initRadius);
    }
    
    var funList = {
        circle: function(r, pos, pAxis, easing, totoalSteps, stepDistance){//把园分成一百段，取其坐标
            if (isUndefined(r) || isUndefined(pos)) {
                return [];
            }
            var disP = isUndefined(pAxis) ? 0 : pAxis;
            var option = {
                relativeX: pos.x,
                relativeY: pos.y,
                radius: r,
                p: disP,
                easing: easing
            }
            var res = generateArcListCorrdinate(option);
            return [res];
        },
        line: function(slope, beginPos, endPos, axis, pAxis, easing, totoalSteps, stepDistance){//以x轴为基准去100个值
            if (isUndefined(slope) || isUndefined(beginPos) || isUndefined(endPos) || isUndefined(axis)) {
                //严格要求数据完整
                return;
            }
            stepDistance = isUndefined(stepDistance) ? everyPChangeSize : stepDistance;
            pAxis = isUndefined(pAxis) ? 0 : pAxis;
            var res = resX = resY = [];
            var b = beginPos.y - slope * beginPos.x;
            var disX = endPos.x - beginPos.x;
            var disY = endPos.y - beginPos.y;
            var disP = pAxis;
            var xIncrace = 1;
            var yIncrace = 1;
            if (disX < 0) {
                xIncrace = xIncrace * -1;
            }
            if (disY < 0) {
                yIncrace = yIncrace * -1;
            }
            disX = Math.abs(disX);
            disY = Math.abs(disY);
            var xStep = disX / stepDistance;
            var yStep = disY / stepDistance;
            var easingFn = tween[easing] || tween["linear"];
            var delta = 0;
            var tmpx = 0;
            var tmpy = 0;
            switch (axis.toLowerCase()) {
                case "x":
                    for (var i = 0; i <= parseInt(xStep); i++) {
                        disP += 1;
                        delta = easingFn(i / parseInt(xStep));
                        tmpx = beginPos.x + delta * disX * xIncrace;
                        res.push({
                            x: tmpx,
                            y: slope * tmpx + b,
                            p: disP
                        });
                    }
                    disP += 1;
                    res.push({
                        x: endPos.x,
                        y: endPos.y,
                        p: disP
                    });
                    break;
                case "y":
                    for (var i = 0; i <= parseInt(yStep); i++) {
                        delta = easingFn(i / parseInt(yStep));
                        tmpy = beginPos.y + delta * disY * yIncrace;
                        disP += 1;
                        res.push({
                            x: (tmpy - b) / slope,
                            y: tmpy,
                            p: disP
                        });
                    }
                    disP += 1;
                    res.push({
                        x: endPos.x,
                        y: endPos.y,
                        p: disP
                    });
                    
                    break;
                default:
                    break;
            }
            //y = s*x + b;
            //一定经过开始的点 求出b的值
            return [res];
        },
        rotate: function(beginAngel, endAngel, pAxis, easing, totoalSteps, stepDistance){
            if (isUndefined(beginAngel) || isUndefined(endAngel)) {
                return;
            }
            //分割角度
            beginAngel = isNumber(beginAngel) ? beginAngel : 0;
            endAngel = isNumber(endAngel) ? endAngel : 0;
            var rIncrace = 1;
            var rEveryChange = isUndefined(stepDistance) ? 4 : stepDistance;
            var disP = isUndefined(pAxis) ? 0 : pAxis;
            var disRot = endAngel - beginAngel;
            var res = [];
            if (disRot < 0) {
                rIncrace = rIncrace * -1;
            }
            disRot = Math.abs(disRot);
            var rIsLast = parseInt(rStep) < rStep ? true : false;
            
            var rStep = disRot / rEveryChange;
            var easingFn = tween[easing] || tween["linear"];
            
            var delta = 0;
            //添加
            for (var i = 0; i <= parseInt(rStep); i++) {
                delta = easingFn(i / parseInt(rStep));
                tmpRote = beginAngel + delta * disRot * rIncrace;
                var mtx = getAngelMatrix(tmpRote);
                disP += 1;
                res.push({
                    transName: mtx.styleName,
                    mtxs: mtx.angel,
                    p: disP
                });
            }
            disP += 1;
            var mtx = getAngelMatrix(endAngel);
            res.push({
                transName: mtx.styleName,
                mtxs: mtx.angel,
                p: disP
            });
            return [res];
        },
        zoom: function(beginSize, endSize, pAxis, easing, totoalSteps, stepDistance){
            if (isUndefined(beginSize) || isUndefined(endSize)) {
                return [];
            }
            //宽高要按照一定的步骤变化完成，算出相应的比例
            beginSize.width = isNumber(beginSize.width) ? beginSize.width : 0;
            
            beginSize.height = isNumber(beginSize.height) ? beginSize.height : 0;
            
            endSize.width = isNumber(endSize.width) ? endSize.width : 0;
            
            endSize.height = isNumber(endSize.width) ? endSize.height : 0;
            
            var everyChange = isUndefined(stepDistance) ? 10 : stepDistance;
            
            var wIncrace = 1;
            var hIncrace = 1;
            var disP = isUndefined(pAxis) ? 0 : pAxis;
            var res = [];
            
            var disWidth = endSize.width - beginSize.width;
            var disHeight = endSize.height - beginSize.height;
            
            var tmpWidth = 0;
            var tmpHeight = 0;
            
            if (disWidth < 0) {
                wIncrace = wIncrace * -1;
            }
            if (disHeight < 0) {
                hIncrace = hIncrace * -1;
            }
            
            disWidth = Math.abs(disWidth);
            disHeight = Math.abs(disHeight);
            
            var easingFn = tween[easing] || tween["linear"];
            var delta = 0;
            
            //todo:修改合并重复代码
            if (disWidth > disHeight) {
                var wStep = disWidth / everyChange;
                var wIsLast = parseInt(wStep) < wStep ? true : false;
                
                for (var i = 0; i < parseInt(wStep); i++) {
                    delta = easingFn(i / parseInt(wStep));
                    tmpWidth = beginSize.width + delta * disWidth * wIncrace;
                    tmpHeight = beginSize.height + delta * disHeight / disWidth * disHeight * hIncrace;
                    
                    disP += 1;
                    res.push({
                        width: tmpWidth,
                        height: tmpHeight,
                        p: disP
                    });
                }
                disP += 1;
                res.push({
                    width: endSize.width,
                    height: endSize.height,
                    p: disP
                });
                
            }
            else {
                var hStep = disHeight / everyChange;
                var hIsLast = parseInt(hStep) < hStep ? true : false;
                for (var i = 0; i < parseInt(hStep); i++) {
                    delta = easingFn(i / parseInt(wStep));
                    tmpHeight = beginSize.height + delta * disHeight * hIncrace;
                    tmpWidth = beginSize.height + delta * disWidth / disHeight * wIncrace;
                    disP += 1;
                    res.push({
                        width: tmpWidth,
                        height: tmpHeight,
                        p: disP
                    });
                }
                disP += 1;
                res.push({
                    width: endSize.width,
                    height: endSize.height,
                    p: disP
                });
            }
            return [res];
        },
        fade: function(beginOpacity, endOpacity, pAxis, easing, totoalSteps, stepDistance){
            if (isUndefined(beginOpacity) || isUndefined(endOpacity)) {
                return [];
            }
            //只有一个值要么从0变化到1，要么从1变化到0
            var disOpacity = endOpacity - beginOpacity;
            var oIncrace = 1;
            var res = [];
            var oStep = 0;
            var tmpOpactiy = 0;
            var disP = isUndefined(pAxis) ? 0 : pAxis;
            if (disOpacity < 0) {
                oIncrace = oIncrace * -1;
            }
            erveryOpacityChange = isUndefined(stepDistance) ? erveryOpacityChange : stepDistance;
            disOpacity = Math.abs(disOpacity);
            var oStep = disOpacity / erveryOpacityChange;
            var easingFn = tween[easing] || tween["linear"];
            var delta = 0;
            for (var i = 0; i <= parseInt(oStep); i++) {
                disP += 1;
                delta = easingFn(i / parseInt(oStep));
                tmpOpactiy = beginOpacity + delta * disOpacity * oIncrace;
                res.push({
                    opacity: tmpOpactiy,
                    p: disP
                });
            }
            disP += 1;
            res.push({
                opacity: endOpacity,
                p: disP
            });
            return [res];
        },
        customPath: function(pAxis, easing, totoalSteps, stepDistance){
            var res = [];
            var disP = isUndefined(pAxis) ? 0 : pAxis;
            var easingFn = tween[easing] || tween["linear"];// 默认线性
            totalSteps = totalSteps || 100;
            var delta = 0;
            for (var i = 0; i <= totalSteps; i++) {
                var delta = easingFn(i / totalSteps);
                disP += 1;
                res.push({
                    delta: delta,
                    p: disP
                });
            }
            return [res];
        },
        pathPoint: function(change, callback, pAxis, easing, totoalSteps, stepDistance){
            if (isUndefined(change)) {
                return [];
            }
            var disP = isUndefined(pAxis) ? 0 : pAxis;
            var easingFn = tween[easing] || tween["linear"];// 默认线性
            totoalSteps = totoalSteps || 0;
            var tmpV = 0;
            var res = [];
            if (!$.isFunction(callback)) {
                callback = function(){
                };
            }
            for (var i = 0; i <= totoalSteps; i++) {
                disP += 1;
                var delta = easingFn(i / totoalSteps);
                tmpV = delta * change;
                res.push({
                    pv: tmpV,
                    p: disP,
                    callback: callback
                });
            }
            return [res];
        }
    };
    
    var cssFun = {
        line: function(loc){
            if (isUndefined(loc)) {
                return {};
            }
            var css = {
                left: loc.x,
                top: loc.y
            };
            return css;
        },
        zoom: function(loc){
            var css = {
                width: loc.width,
                height: loc.height
            }
            return css;
        },
        fade: function(loc){
            var css = {
                opacity: loc.opacity
            }
            return css;
        },
        rotate: function(loc){
            var css = {};
            css[loc.transName] = loc.mtxs;
            return css;
        },
        circle: function(loc){
            if (isUndefined(loc)) {
                return {};
            }
            var css = {
                left: loc.x,
                top: loc.y
            };
            return css;
        },
        pathPoint: function(loc){
            var css = {
                pv: loc.pv,
                callback: function(ele, cc){
                    loc.callback($(ele), cc);
                }
            }
            return css;
        }
    }
    
    var isNumber = function(obj){
        return Object.prototype.toString.call(obj) === "[object Number]";
    }
    
    var isUndefined = function(obj){
        return Object.prototype.toString.call(obj) === "[object Undefined]";
    }
    
    var getAngelMatrix = function(){
        //检测当前 客户端支持的变换方式
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
            cssTf: ["transform", "MozTransform", "WebkitTransform", "OTransform", "msTransform"],
            tmpCssTf: ["transform", "-moz-transform", '-webkit-transform', '-o-transform', '-ms-transform']
        }
        
        var detectSupport = function(){
            var dv = doc.createElement("div"), dvStyle = dv.style, i = 0, len = config.cssTf.length, css3Trs = null, tmpCss3Trs = null;
            for (; i < len; i++) {
                if (config.cssTf[i] in dvStyle) {
                    css3Trs = config.cssTf[i];
                    tmpCss3Trs = config.tmpCssTf[i];
                }
            }
            return {
                css3Transform: css3Trs,
                styleTransform: tmpCss3Trs
            }
        }
        
        var stfName = detectSupport();
        
        return function(angel, x, y){
            if (isUndefined(angel)) {
                return {};
            }
            x = x || 1;
            y = y || 1;
            var matrix = getMatrix(angel, x, y);
            var mats = "matrix(" + matrix.M11.toFixed(16) + "," + matrix.M21.toFixed(16) + "," + matrix.M12.toFixed(16) + "," + matrix.M22.toFixed(16) + ", 0, 0)";
            return {
                matrix: mats,
                angel: "rotate(" + angel + "deg)",
                css3Trans: stfName.css3Transform,
                styleName: stfName.styleTransform
            }
        }
    }()
    
    var autoRunTimer = function(){
        var Timer = function(interval){
            this.uniqTimer = null;
            this.execQueue = [];
            this.interval = interval || 100;
            this.isStop = false;
            this._isRuning = false;
        }
        Timer.prototype = {
            constructor: Timer,
            addLoop: function(tran, dir){
                var that = this;
                if (tran) {
                    that.execQueue.push({
                        tran: tran,
                        dir: dir
                    });
                }
                if (!that._isRuning) {
                    that.start();
                }
            },
            removeLoop: function(){
                var that = this;
                that.execQueue = [];
            },
            clear: function(){
                var that = this;
                if (that.uniqTimer) {
                    clearTimeout(that.uniqTimer);
                    that.uniqTimer = null;
                }
                that.isStop = false;
                that._isRuning = false;
            },
            start: function(){
                var that = this;
                that._isRuning = true;
                that.reflash();
            },
            execLoop: function(){
                var that = this;
                var queue = that.execQueue;
                if (!queue || !queue.length) {
                    return;
                }
                var tranAnim = null, tran = null, dir = 0, theOne = null;
                for (var i = 0, len = queue.length; i < len; i++) {
                    //从第一个开始弹出
                    tranAnim = queue[i];
                    if (!tranAnim || !tranAnim.tran) {
                        continue;
                    }
                    tran = tranAnim.tran;
                    dir = tranAnim.dir || 1;
                    if (!tran.fnPath[0] || tran.fnPath[0].length < 1) {
                        queue.splice(i, 1);
                        continue;
                    }
                    switch (dir) {
                        case 2:
                            theOne = tran.fnPath[0].pop();
                            break;
                        default:
                            theOne = tran.fnPath[0].shift();
                            break;
                    };
                    if (theOne) {
                        var css = cssFun[tran.fun](theOne) || {};
                        if (!$.isFunction(css.callback)) {
                            exeAimate(tran.ele, css);
                        }
                        else {
                            css.callback(tran.ele, css);
                        }
                    }
                }
            },
            reflash: function(){
                var that = this;
                this.uniqTimer = setTimeout(function(){
                    if (that.isStop) {
                        that.clear();
                        return;
                    }
                    that.execLoop();
                    that.reflash();
                    if (that.execQueue.length < 1) {
                        that.isStop = true;
                    }
                }, that.interval);
            }
        };
        
        var tm = new Timer(100);
        return tm;
    }()
    
    var util = (function(){
        // the re-usable constructor function used by clone().
        function Clone(){
        }
        // clone objects, skip other types.
        function clone(target){
            if (typeof target == 'object') {
                Clone.prototype = target;
                return new Clone();
            }
            else {
                return target;
            }
        }
        // Shallow Copy 
        function copy(target){
            if (typeof target !== 'object') {
                return target; // non-object have value sematics, so target is already a copy.
            }
            else {
                var value = target.valueOf();
                if (target != value) {
                    // the object is a standard object wrapper for a native type, say String.
                    // we can make a copy by instantiating a new object around the value.
                    return new target.constructor(value);
                }
                else {
                    // ok, we have a normal object. If possible, we'll clone the original's prototype 
                    // (not the original) to get an empty object with the same prototype chain as
                    // the original.  If just copy the instance properties.  Otherwise, we have to 
                    // copy the whole thing, property-by-property.
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
        
        // Deep Copy
        var deepCopiers = [];
        
        function DeepCopier(config){
            for (var key in config) {
                this[key] = config[key];
            }
        }
        DeepCopier.prototype = {
            constructor: DeepCopier,
            
            // determines if this DeepCopier can handle the given object.
            canCopy: function(source){
                return false;
            },
            
            // starts the deep copying process by creating the copy object.  You
            // can initialize any properties you want, but you can't call recursively
            // into the DeeopCopyAlgorithm.
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
            // copiedObjects keeps track of objects already copied by this
            // deepCopy operation, so we can correctly handle cyclic references.
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
            
            // add an object to the cache.  No attempt is made to filter duplicates;
            // we always check getCachedResult() before calling it.
            cacheResult: function(source, result){
                this.copiedObjects.push([source, result]);
            },
            
            // Returns the cached copy of a given object, or undefined if it's an
            // object we haven't seen before.
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
                if (source === null) 
                    return null;
                
                // All non-objects use value semantics and don't need explict copying.
                if (typeof source !== 'object') 
                    return source;
                
                var cachedResult = this.getCachedResult(source);
                
                // we've already seen this object during this deep copy operation
                // so can immediately return the result.  This preserves the cyclic
                // reference structure and protects us from infinite recursion.
                if (cachedResult) 
                    return cachedResult;
                
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
        function deepCopy(source, maxDepth){
            var deepCopyAlgorithm = new DeepCopyAlgorithm();
            if (maxDepth) 
                deepCopyAlgorithm.maxDepth = maxDepth;
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
        function isNode(source){
            if (window.Node) {
                return source instanceof Node;
            }
            else {
                // the document is a special Node and doesn't have many of
                // the common properties so we use an identity check instead.
                if (source === document) 
                    return true;
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
                if (source === document) 
                    return document;
                
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
        
        return {
            DeepCopyAlgorithm: DeepCopyAlgorithm,
            copy: copy,
            clone: clone,
            deepCopy: deepCopy
        };
    })();
    
    
    var getAniPathId = function(){
        var id = 0;
        return function(){
            id++;
            return "_a_" + id;
        }
    }()
    
    //这个是找的最近的一个点排序todo:必须是顺序排列的
    var getClosestPos = function(ary, val){
        if (!$.isArray(ary) || !isNumber(val)) {
            return;
        }
        var aryTolLen = ary.length;
        var len = aryTolLen;
        if (!len) {
            return 0;
        }
        var pos = Math.ceil(len / 2) - 1;
        var prvPos = pos - 1;//是否小于0
        var nxtPos = pos + 1;//是否大于数组长度
        var prvVal = 0;
        var nxtVal = 0;
        var temp = 0;
        var prvDVal = 0;
        var nxtDVal = 0;
        var curDVal = 0;
        var dirVal = 0;
        var theRes = -2;
        var pnd = 0;
        while (1) {
            tmp = ary[pos] ? ary[pos].pAxisBegin : 0;
            len = parseInt(len / 2);
            
            prvVal = ary[prvPos] ? ary[prvPos].pAxisBegin : -2;
            nxtVal = ary[nxtPos] ? ary[nxtPos].pAxisBegin : -1;
            if (tmp == val) {
                //左右无所谓啦
                return pos;
            }
            prvDVal = Math.abs(prvVal - val);
            nxtDVal = Math.abs(nxtVal - val);
            curDVal = Math.abs(tmp - val);
            pnd = prvDVal - nxtDVal;
            
            if (pnd < 0) {
                //向后移动
                pos = pos - Math.ceil(len / 2);
                pos = pos < 0 ? 0 : pos;
                prvPos = pos - 1 < 0 ? -1 : pos - 1;
                nxtPos = pos + 1;
                dirVal = prvDVal;
            }
            else 
                if (pnd > 0) {
                    //向前
                    pos = pos + Math.ceil(len / 2);
                    prvPos = pos - 1;
                    nxtPos = (pos + 1 > aryTolLen - 1) ? -1 : pos + 1;
                    dirVal = nxtDVal;
                }
                else {
                    //比较当前是左边还是右边
                    return tmp >= val ? pos - 1 : pos;
                }
            
            if (len <= 0) {
                if (prvDVal >= nxtDVal) {
                    if (curDVal >= nxtDVal) {
                        theRes = nxtPos;
                    }
                    else {
                        theRes = pos;
                    }
                }
                else {
                    if (curDVal >= prvDVal) {
                        theRes = prvPos;
                    }
                    else {
                        theRes = pos;
                    }
                }
                return ary[theRes].pAxisBegin >= val ? theRes : theRes + 1;
            }
        }
    }
    //优化查找
    var binarySearch = function(ary, val){
        if (isUndefined(ary) || isUndefined(val)) {
            return;
        }
        var al = ary.length;
        var len = al;
        if (len < 1) {
            return 0;
        }
        var pos = parseInt(len / 2);
        var tmp = 0;
        while (1) {
            tmp = !isUndefined(ary[pos]) ? ary[pos].pAxisBegin : 0;
            len = parseInt(len / 2);
            if (tmp > val) {
                //left
                if (len != 1) {
                    pos = pos - parseInt(len / 2);
                }
                else {
                    pos = pos - 1;
                }
                if (pos <= 0) {
                    //没找到
                    pos = 0;
                    break;
                }
            }
            else 
                if (tmp < val) {
                    //right
                    if (len != 1) {
                        pos = pos + parseInt(len / 2);
                    }
                    else {
                        pos = pos + 1;
                    }
                    if (pos >= al) {
                        pos = al - 1;
                        break;
                    }
                }
                else {
                    //找到了值
                    return pos;
                }
            
            if (len <= 0) {
                //没有找到值
                //return pos;
                break;
            }
        }
        //如果没有找到，看看四周
        var current = ary[pos].pAxisBegin;
        if (current < val) {
            pos = pos + 1;
        }
        return pos;
    }
    
    var getPathByFn = function(fnName, args){
        //args 做一个规定吧，如果线性的话 一个参数表示斜率，第二个表示需要几步从来到结束，第三个表示起始位置 ，第四个表示结束位置，
        var fn = funList[fnName];
        //for()
        return fn && fn.apply(this, args);
    }
    
    //装入要执行的数据
    var genExecData = function(pathData, autoRunQueue, pathNode){
        //从上向下啊排序
        if (!pathNode) {
            return;
        }
        var beginAxis = pathNode.pAxisBegin;
        var len = pathData.length;
        var thePos = 0;
        var theFinnelEnd = 0;
        var tmpEnd = 0;
        //分割数据
        var trans = pathNode.transfroms;
        var manualCtl = [];
        while (trans.length) {
            var tran = trans.shift();
            if (tran) {
                var fn = tran.fun;
                var args = tran.args;
                var begin = pathNode.pAxisBegin;
                var easing = tran.easing || "linear";
                var stepDistance = tran.stepDistance;
                var totalSteps = tran.totalSteps || 0;
                if (!$.isArray(args)) {
                    args = [];
                }
                args.push(begin);
                args.push(easing);
                args.push(totalSteps);
                args.push(stepDistance);
                if (!fn || !args) {
                    tran.fnPath = [];
                }
                else {
                    tran.fnPath = getPathByFn(fn, args);
                }
                var lastAxis = tran.fnPath[0] ? tran.fnPath[0][tran.fnPath[0].length - 1] : [];
                //pathNode.nodeId = getAniPathId();
                tmpEnd = isUndefined(lastAxis) ? begin : (isUndefined(lastAxis.p) ? begin : lastAxis.p);
                if (tmpEnd > theFinnelEnd) {
                    theFinnelEnd = tmpEnd;
                }
                //把需要自动运行的摘要出来
                if (tran.autoRun) {
                    tran.pAxisBegin = begin;
                    tran.pAxisEnd = tmpEnd;
                    //防止重复添加
                    autoRunQueue.push(tran);
                }
                else {
                    manualCtl.push(tran);
                }
            }
        };
        pathNode.transfroms = manualCtl;
        pathNode.nodeId = getAniPathId();
        pathNode.pAxisEnd = theFinnelEnd;
        //找准form 还是to 数据要准确插入
        var pos = binarySearch(pathData, beginAxis);
        //找到相应的位置 插入数据
        if (pos == -1) {
            pathData.splice(0, 0, pathNode);
        }
        else {
            pathData.splice(pos, 0, pathNode);
        }
    }
    
    var exeAimate = function(ele, css, duation){
        if (isUndefined(ele) || isUndefined(css)) {
            return;
        }
        dua = duation || 6;
        if (dua < 5) {
            ele.css(css);
        }
        $(ele).css(css);
        return;
    }
    
    var execPathTransAnimate = function(currentPos, trans, begin){
        //减少
        for (var i = 0, len = trans.length; i < len; i++) {
            var tran = trans[i];
            //判断是否自动运行如果是自动运行的话，交出去控制权，由timer控制
            if (tran && tran.ele && tran.fnPath.length) {
                if (begin) {
                    var loc = tran.fnPath[0][currentPos - begin];
                    //这里过滤了不少bug
                    if (loc) {
                        var css = cssFun[tran.fun](loc) || {};
                        if (!$.isFunction(css.callback)) {
                            exeAimate(tran.ele, css);
                        }
                        else {
                            //continue;
                            css.callback(tran.ele, css, currentPos);
                        }
                    }
                }
                else {
                    //当前的road 跳出
                }
            }
        }
    }
    
    var execQueueAnimate = function(roadStatus, autoRunQueue){
        for (var k in currExecPath) {
            if (currExecPath.hasOwnProperty(k)) {
                var v = currExecPath[k];
                var trans = v.transfroms;
                //分组自动运行，手动控制运行
                if (trans.length) {
                    //手动控制
                    execPathTransAnimate(roadStatus.road, trans, v.pAxisBegin);
                }
            }
        }
        //执行过滤自动运行
        filterAutoAnim(roadStatus, autoRunQueue);
    }
    
    var deleteAnimateElement = function(pathNode, currentPos){
        //删除已经过期的元素
        if (isUndefined(pathNode) || isUndefined(currentPos)) {
            return;
        }
        var trans = pathNode.transfroms;
        var begin = pathNode.pAxisBegin;
        var end = pathNode.pAxisEnd;
        if (currentPos <= end && currentPos >= begin) {
            return false;
        }
        else {
            return true;
        }
    }
    
    var filterAutoAnim = function(roadStatus, autoRunQueue){
        var tran = null;
        for (var i = 0, len = autoRunQueue.length; i < len; i++) {
            tran = autoRunQueue[i];
            if (tran) {
                if (tran.pAxisBegin == roadStatus.road && roadStatus.increase) {
                    var cpyTran = util.deepCopy(tran);
                    if (cpyTran) {
                        autoRunTimer.addLoop(cpyTran, 1);
                    }
                }
                if (tran.pAxisEnd == roadStatus.road && !roadStatus.increase) {
                    var cpyTran = util.deepCopy(tran);
                    if (cpyTran) {
                        autoRunTimer.addLoop(cpyTran, 2);
                    }
                }
            }
        }
    }
    
    var filterAvliableData = function(roadStatus, pathData, autoRunQueue){
        //如果碰到了可以做动画运动的 对象 要交出控制权，等动画结束后，重新获取控制权
        //检查是否有数据要呗移除来，如果有则删除
        //todo:判断里面有多少个动画元素，如果有多个的要一次当前元素而不是移除整个节点，如果当前元素已经没有了，才移除节点
        //todo:重新设计节点被移除的标准
        for (var k in currExecPath) {
            if (currExecPath.hasOwnProperty(k)) {
                var v = currExecPath[k];
                if (deleteAnimateElement(v, roadStatus.road)) {
                    delete currExecPath[k];
                }
            }
        }
        //检查是否有带执行的数据，如果有则加入 禁止遍历所有的元素
        //todo:寻找更快的方法，如果向下滑动就从当前的向下走，因为开始队列是有序的
        for (var i = 0, len = pathData.length; i < len; i++) {
            //todo：bug就在这里,end应该是最大的end而不是最后一个end
            if (pathData[i].pAxisBegin <= roadStatus.road && pathData[i].pAxisEnd >= roadStatus.road) {
                //pathData[i].isAddedToExecQueue = true;
                //拷贝一份
                var pv = pathData.slice(i, i + 1);
                if (pv.length) {
                    var pNode = pv[0];
                    var nodeId = pNode.nodeId;
                    if (nodeId in currExecPath) {
                        continue;
                    }
                    else {
                        var tmp = util.deepCopy(pNode);
                        currExecPath[nodeId] = tmp;
                    }
                }
            }
            //同理回来的时候也是这样如果已经可以提高效率
        }
        //end
        execQueueAnimate(roadStatus, autoRunQueue);
    }
    
    var Stage = function(paths){
        this._processData = paths || [];
        this._defaultSteps = 100;
        this._pathData = [];
        this._roadStatus = {
            road: 0
        };
        this._autoRunQueue = [];
        this.init();
    }
    
    Stage.prototype = {
        constructor: Stage,
        init: function(){
            this.checkPathQueue();
        },
        next: function(){
            this._roadStatus.road += 1;
            this._roadStatus.increase = true;
            if (this._roadStatus.road > maxFrame) {
                this._roadStatus.road = maxFrame;
            }
            console.log(this._roadStatus.road);
            filterAvliableData(this._roadStatus, this._pathData, this._autoRunQueue);
        },
        prev: function(){
            this._roadStatus.road -= 1;
            this._roadStatus.increase = false;
            if (this._roadStatus.road <= 0) {
                this._roadStatus.road = 0;
            }
            filterAvliableData(this._roadStatus, this._pathData, this._autoRunQueue);
        },
        checkPathQueue: function(){
            var that = this;
            if (!that._processData || !$.isArray(that._processData)) {
                that._processData = [];
            }
            for (var i = 0, len = that._processData.length; i < len; i++) {
                var k = that._processData[i];
                if (k) {
                    if (!isNumber(k.from) || !isNumber(k.to) || !isNumber(k.pAxisBegin)) {
                        return;
                    }
                    genExecData(that._pathData, that._autoRunQueue, k);
                }
            }
            return that._pathData;
        }
    };
    
    var stages = (function(){
        var getStageId = function(){
            var id = 0;
            return function(){
                id++;
                return "stage-" + id;
            }
        }()
        
        var StageCollection = function(){
            this.stages = {};
        }
        StageCollection.prototype = {
            constructor: StageCollection,
            addStage: function(paths, id){
                //需要一个舞台id，这个是必须的,可以更容易管理
                var sg = new Stage(paths);
                sg.sId = id || getStageId();
                if (sg.sId in stages) {
                    return stages[sg.sId];
                }
                else {
                    stages[sg.sId] = sg;
                    return sg;
                }
            },
            removeStage: function(id){
                if (id) {
                    if (id in stages) {
                        delete stages[id];
                    }
                }
            }
        }
        var stgs = new StageCollection();
        return stgs;
    })()
    
    win.aiolia = stages;
})(window);
