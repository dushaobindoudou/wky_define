/*
 * 首页模板
 *
 *
 *
 */
//dependence jquery.js
//dependence slider.js
//dependence circle.js
//dependence popup.js

wky_define("wky.template.homePage", function(homePage){
    var templateData = {};
    var pannel = $("<div></div>");
    var searchPannel = $('<div class="search-pannel"></div>').append('<div class="search"><input class="keyword" type="text" title="输入搜索" /><input class="submit" type="button" title="搜索" /></div>');
    var navPannel = $('<div class="nav-pannel"></div>');
    var notifyPannel = $('<div class="notify-pannel"></div>');
    var clientSize = wky.config.clientSize;
    
    pannel.css({
        height: clientSize.height,
        width: clientSize.width,
        overflow: "hidden"
    });
    //调整到中间位置
    var animatToCenter = function(ele, css, callback, time){
        if (!ele || !css) {
            return;
        }
        ele.animate(css, {
            duration: time || 1500,
            complete: function(){
                callback && callback.apply(this, [].slice.call(arguments));
            }
        });
    }
    
    //如果当前屏幕高度仅仅只够显示一个项目高度，则其他项目自动隐藏
    var autoAdapt = function(nav, notity){
        nav = nav ||
        function(){
        };
        notity = notity ||
        function(){
        };
        //search 300
        if (clientSize.height > 200 && clientSize.height < 500) {
            //调整搜索框位置
            var css = {
                marginTop: (clientSize.height - 200) / 2
            };
            navPannel.hide();
            notifyPannel.hide();
            animatToCenter(searchPannel, css, function(){
                //console.log("i am over!!s");
            });
            navPannel.hide();
            notifyPannel.hide();
        }
        else 
            if (clientSize.height < 800) {
                //导航框自动居中,搜索框不变
                notifyPannel.hide();
                nav();
            }
            else {
                nav();
                notity();
            }
        //快速导航 300
    }
    
    var getABlockCircle = function(){
        var cl = circle.add({
            radius: 131 - 16,
            stepLen: 32,
            relativeX: 262 / 2 - 16,
            relativeY: 262 / 2 - 16,
        });
        return cl;
    }
    
    var NavIdx = function(ele, count, settingWidth){
        this.count = count || 0;
        this.ele = ele;
        this.idxPannel;
        this.idxSlider;
        this.innerWaper;
        this.maxCount = 0;
        //this.settingWidth = settingWidth || this.ele;
        this.init();
    }
    
    NavIdx.prototype = {
        constructor: NavIdx,
        init: function(){
            this.createPannel();
            this.updateCount();
        },
        createPannel: function(){
            //生成索引头
            this.idxPannel = $('<div class=""></div>');
            this.idxSlider = $('<div></div>').css({
                height: 32,
                width: 436,
                overflow: "hidden",
                position: "relative",
                marginLeft: 32
            });
            this.innerWaper = $("<div></div>").css({
                height: 32,
                width: this.count * 22,
                margin: "0 auto 0 auto"
            });
            this.idxPannel.css({
                width: 500,
                height: 32,
                "position": "relative",
                "overflow": "hidden"
            });
            this.maxCount = parseInt(436 / 22);
            this.idxPannel.append(this.innerWaper);
            this.ele.append(this.idxPannel);
        },
        getCountWidth: function(){
            var firstEle = this.innerWaper.children().eq(0);
            if (!firstEle.length) {
                return this.innerWaper.height();
            }
            return firstEle.width();
        },
        setCount: function(count){
            if (count > this.maxCount) {
                this.count = this.maxCount;
            }
            else {
                this.count = count;
            }
            this.updateCount();
        },
        updateCount: function(){
            //home-page-temp-circle
            var html = "";
            //计算现有的内容所占的面积
            for (var i = 0; i < this.count; i++) {
                html += '<div my-turn="' + i + '" style="width:22px; height:32px; position:relative; float:left;"><div class="home-page-temp-circle"></div></div>';
            }
            this.innerWaper.css({
                width: this.count * 22
            });
            this.innerWaper.html(html);
            this.adjustPos(this.idxPannel, {
                marginLeft: (clientSize.width - this.idxPannel.width()) / 2,
                opacity: "1"
            });
            
        },
        addCount: function(){
            if (this.count < this.maxCount) {
                this.count = this.count + 1;
            }
            else {
                this.count = this.maxCount;
            }
            this.updateCount();
        },
        adjustPos: function(ele, css, callback, time){
            if (!ele || !css) {
                return;
            }
            ele.animate(css, {
                duration: time || 1500,
                complete: function(){
                    callback && callback.apply(this, [].slice.call(arguments));
                }
            });
        },
        minusCount: function(){
            this.count = this.count - 1;
            if (this.count < 0) {
                this.count = 0;
            }
            this.updateCount();
        }
    }
    
    
    //创建一个导航滑块
    var setNav = function(){
        //生成测试数据
        var blk = $('<div></div>'), idx = "";
        for (var i = 0; i < 5; i++) {
            var bc = getABlockCircle();
            blk.append(bc.circleEle.circle);
            //blk += '<div my-turn="' + i + '" style="width:400px; height:300px; position:relative; float:left; background:rgb(' + (10 + i * 10) + ',' + (10 + i * 15) + ',' + (10 + i * 4) + ');"></div>'
        }
        var bkNum = 5;
        var sliderWidth = 300;//每个滑块的宽度
        var everyPageNum = parseInt(clientSize.width / 400);//每页可容纳多少滑块
        var pageNum = Math.ceil(bkNum / everyPageNum);
        for (var i = 0; i < pageNum; i++) {
            idx += '<div my-turn="' + i + '" style="width:22px; height:32px; position:relative; float:left;"><div class="home-page-temp-circle"></div></div>';
        }
        //生成滑块
        var navSlider = slider.add({
            pannel: {
                css: {
                    width: parseInt(clientSize.width / 400) * 400,
                    height: 268,
                    overflow: "hidden",
                    position: "relative"
                },
                cnt: blk.html(),
            },
            sliderDirection: "h",
            stepDistance: "pannel"
        });
        var cd = new ClickDespatcher([{
            f: function(){
                var coo1 = deskPopup.addPopup({
                    css: {
                        width: "500px",
                        height: "260px",
                        color: "#ffffff",
                        left: (clientSize.width - 400) / 2
                    },
                    isKeepHold: true,
                    animateType: "right-left",
                    content: "没用啊",
                });
            },
            args: []
        }, {
            f: function(){
                var that = arguments[0];
                var coo1 = deskPopup.addPopup({
                    css: {
                        width: "500px",
                        height: "260px",
                        color: "#ffffff",
                        left: (clientSize.width - 400) / 2
                    },
                    isKeepHold: true,
                    animateType: "top-bottom",
                    content: "添加图标列表",
                });
                
            },
            args: []
        }]);
        //绑定添加导航事件 todo:这里不一定是circle 先这样写就好了
        navSlider.pannel.slidPannelEle.delegate("div.circle", "click", function(){
            var that = $(this);
            cd.addCount(that);
        })
        
        
        //生成索引导航
        var idxNav = new NavIdx(navPannel, 1);
        navPannel.append(navSlider.pannel.pannelEle);
        animatToCenter(navSlider.pannel.pannelEle, {
            marginLeft: (clientSize.width - navSlider.pannel.pannelEle.width()) / 2,
            opacity: "1"
        });
        //点击右边向右，点击左边想左
        navPannel.delegate("div[my-turn]", "click", function(evt){
            var turnNum = $(this).attr("my-turn");
            navSlider.switchTo(turnNum);
        });
        //添加元素
        templateData.navSlider = navSlider;
        templateData.idxNav = idxNav;
    }
    
    
    
    var setNotify = function(){
    
    
    }
    
    pannel.append(searchPannel).append(navPannel).append(notifyPannel);
    //自动配置相应的组建,根据需要配置页面
    autoAdapt(function(){
        //设置导航
        setNav();
    }, function(){
        setNotify();
    });
    templateData.pannel = pannel
    
    return {
        varName: "searchTemp",
        varVal: templateData
    }
})
