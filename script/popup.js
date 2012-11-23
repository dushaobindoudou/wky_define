/*
 *
 * 简单的弹出框
 * 从上、下、左、右四个方向推出，从不同的位置推出，推出的距离可以设定，默认为推出框的宽高，或者可以推送到屏幕中央
 *
 * 动画方式:top-bottm:自动从上向下停留到中间，在向下运动
 *			bottom-top:自动从下向上停留到中间，在向上运动
 *			left-right:自动从左向右停留到中间，在向右运动
 *			right-left:自动从右向左停留到中间，在向左运动
 * 			top-height:从上面下来知道全部是显示，停留一会，然后，退回去
 * 			bottom-hight:从下面上去直到全部是显示，停留一会，然后，退回去
 * 			left-width:从左边出来，知道全部宽度出来，停留一会，然后缩回去
 * 			right-width:从右边出来，知道全部宽度出来，停留一会，然后缩回去
 *
 *
 *
 *
 *
 *
 *
 */
(function(exports){
    "use strict"
    var clientSize = {
        width: $(window).width(),
        height: $(window).height()
    }
    
    var createPup = function(css, id, className){
        var rcss = $.extend({
            background: "#000000",
            position: "fixed",
            opacity: "0",
            display: "none"
        }, css, true);
        var dv = $('<div id="' + id + '"></div>').css(rcss || {}).addClass(className || "");
        return {
            dvPannel: dv
        }
    }
    
    var isPopInCollection = function(collection, pop){
        if (!collection || !pop) {
            return false;
        }
        if (pop.id in collection) {
            return true;
        }
        return false;
    }
    
    var getPopupId = function(){
        var id = 0;
        var predo = "__pop__";
        var self = this;
        return function(pop){
            id = id + 1;
            //todo:判断是否存在id
            return predo + id;
        }
    }();
    
    var arrayRemove = function(ary, from, to){
        var len = ary.length;
        var rest = ary.slice((to || from) + 1 || len);
        ary.length = from < 0 ? len + from : from;
        return ary.push.apply(ary, rest);
    }
    
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === "[ojbect String]";
    }
    
    
    var animateFnBase = {
        "top-bottom": function(){
            var self = this;
            //初始化css
            var vCen = (clientSize.height - self.ele.dvPannel.height()) / 2;
            //var hCen = (clientSize.width - self.ele.dvPannel.width()) / 2;
            var height = self.ele.dvPannel.height();
            var startCss = {
                top: "-" + height
            };
            var endCss = {
                top: vCen,
                opacity: "0.7"
            };
            self.comeOn(startCss, endCss, function(){
                var holdCss = {
                    top: clientSize.height,
                    opacity: "0"
                };
                if (self.isKeepOutStatus) {
                    self.keepHold(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                    return;
                }
                this.opt.inComplete && this.opt.inComplete.call(self);
                self.wait(self.opt.waitTime || 2000, function(){
                    this.opt.waitComplete && this.opt.waitComplete.call(self);
                    self.getOut(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                });
            });
        },
        "bottom-top": function(){
            var self = this;
            var vCen = (clientSize.height - self.ele.dvPannel.height()) / 2;
            //var hCen = (clientSize.width - self.ele.dvPannel.width()) / 2;
            var height = self.ele.dvPannel.height();
            var startCss = {
                top: clientSize.height
            };
            var endCss = {
                top: vCen,
                opacity: "0.7"
            };
            self.comeOn(startCss, endCss, function(){
                var holdCss = {
                    top: "-" + height,
                    opacity: "0"
                };
                if (self.isKeepOutStatus) {
                    self.keepHold(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                    return;
                }
                this.opt.inComplete && this.opt.inComplete.call(self);
                self.wait(self.opt.waitTime || 2000, function(){
                    this.opt.waitComplete && this.opt.waitComplete.call(self);
                    self.getOut(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                });
            });
        },
        "left-right": function(){
            var self = this;
            //初始化css
            //var vCen = (clientSize.height - self.ele.dvPannel.height()) / 2;
            var hCen = (clientSize.width - self.ele.dvPannel.width()) / 2;
            var width = self.ele.dvPannel.width();
            var startCss = {
                left: "-" + width
            };
            var endCss = {
                left: hCen,
                opacity: "0.7"
            };
            self.comeOn(startCss, endCss, function(){
                var holdCss = {
                    left: clientSize.width,
                    opacity: "0"
                };
                if (self.isKeepOutStatus) {
                    self.keepHold(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                    return;
                }
                this.opt.inComplete && this.opt.inComplete.call(self);
                self.wait(self.opt.waitTime || 2000, function(){
                    this.opt.waitComplete && this.opt.waitComplete.call(self);
                    self.getOut(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                });
            });
        },
        "right-left": function(){
            var self = this;
            //初始化css
            //var vCen = (clientSize.height - self.ele.dvPannel.height()) / 2;
            var hCen = (clientSize.width - self.ele.dvPannel.width()) / 2;
            var width = self.ele.dvPannel.width();
            var startCss = {
                left: clientSize.width
            };
            var endCss = {
                left: hCen,
                opacity: "0.7"
            };
            self.comeOn(startCss, endCss, function(){
                var holdCss = {
                    left: "-" + width,
                    opacity: "0"
                };
                if (self.isKeepOutStatus) {
                    self.keepHold(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                    return;
                }
                this.opt.inComplete && this.opt.inComplete.call(self);
                self.wait(self.opt.waitTime || 2000, function(){
                    this.opt.waitComplete && this.opt.waitComplete.call(self);
                    self.getOut(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                });
            });
        },
        "top-height": function(){
            var self = this;
            //初始化css
            //var vCen = (clientSize.height - self.ele.dvPannel.height()) / 2;
            //var hCen = (clientSize.width - self.ele.dvPannel.width()) / 2;
            var height = self.ele.dvPannel.height();
            var startCss = {
                top: -height
            };
            var endCss = {
                top: 0,
                opacity: "0.7"
            };
            self.comeOn(startCss, endCss, function(){
                var holdCss = {
                    top: -height,
                    opacity: "0"
                };
                if (self.isKeepOutStatus) {
                    self.keepHold(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                    return;
                }
                this.opt.inComplete && this.opt.inComplete.call(self);
                self.wait(self.opt.waitTime || 2000, function(){
                    this.opt.waitComplete && this.opt.waitComplete.call(self);
                    self.getOut(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                });
            });
        },
        "bottom-height": function(){
            var self = this;
            //初始化css
            //var vCen = (clientSize.height - self.ele.dvPannel.height()) / 2;
            //var hCen = (clientSize.width - self.ele.dvPannel.width()) / 2;
            var height = self.ele.dvPannel.height();
            var startCss = {
                top: clientSize.height
            };
            var endCss = {
                top: clientSize.height - height,
                opacity: "0.7"
            };
            self.comeOn(startCss, endCss, function(){
                var holdCss = {
                    top: clientSize.height,
                    opacity: "0"
                };
                if (self.isKeepOutStatus) {
                    self.keepHold(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                    return;
                }
                this.opt.inComplete && this.opt.inComplete.call(self);
                self.wait(self.opt.waitTime || 2000, function(){
                    this.opt.waitComplete && this.opt.waitComplete.call(self);
                    self.getOut(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                });
            });
        },
        "left-width": function(){
            var self = this;
            //初始化css
            //var vCen = (clientSize.height - self.ele.dvPannel.height()) / 2;
            //var hCen = (clientSize.width - self.ele.dvPannel.width()) / 2;
            var width = self.ele.dvPannel.width();
            var startCss = {
                left: -width
            };
            var endCss = {
                left: 0,
                opacity: "0.7"
            };
            self.comeOn(startCss, endCss, function(){
                var holdCss = {
                    left: -width,
                    opacity: "0"
                };
                if (self.isKeepOutStatus) {
                    self.keepHold(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                    return;
                }
                this.opt.inComplete && this.opt.inComplete.call(self);
                self.wait(self.opt.waitTime || 2000, function(){
                    this.opt.waitComplete && this.opt.waitComplete.call(self);
                    self.getOut(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                });
            });
        },
        "right-width": function(){
            var self = this;
            //初始化css
            //var vCen = (clientSize.height - self.ele.dvPannel.height()) / 2;
            //var hCen = (clientSize.width - self.ele.dvPannel.width()) / 2;
            var width = self.ele.dvPannel.width();
            var startCss = {
                left: clientSize.width
            };
            var endCss = {
                left: clientSize.width - width,
                opacity: "0.7"
            };
            self.comeOn(startCss, endCss, function(){
                var holdCss = {
                    left: clientSize.width,
                    opacity: "0"
                };
                if (self.isKeepOutStatus) {
                    self.keepHold(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                    return;
                }
                this.opt.inComplete && this.opt.inComplete.call(self);
                self.wait(self.opt.waitTime || 2000, function(){
                    this.opt.waitComplete && this.opt.waitComplete.call(self);
                    self.getOut(holdCss, function(){
                        //destory this popup
                        if (self.opt.completeDestory) {
                            popupCollection.destoryPopup(self);
                        }
                        self.opt.complete && self.opt.complete.call(self);
                    });
                });
            });
        }
    };
    /*
     *
     * isKeepHold 是否保证弹出状态
     *
     *
     *
     *
     */
    var Popup = function(options){
        this.opt = $.extend({
            completeDestory: true,
            animateType: "custom-animate"
        }, options, true);
        this.isCommingOn = false;
        this.isGettingOut = false;
        this.isWaitting = false;
        this.id = this.opt.popupId || getPopupId();
        this.isKeepOutStatus = this.opt.isKeepHold;
		this.initEvent = this.opt.initEvent || function(){};
        this.holdArgs = [];
        this.ele = createPup(this.opt.css, this.id, this.opt.className || "",this.initEvent);
        this.init();
    }
    
    Popup.prototype = {
        constructor: Popup,
        init: function(){
            var cnt = this.opt.content;
            var self = this;
            this.ele.dvPannel.html(cnt);
            $("body").append(this.ele.dvPannel);
            if (self.opt.animateType in animateFnBase) {
                animateFnBase[self.opt.animateType].apply(self);
            }
			this.initEvent.apply(this,[])
            return self;
        },
        comeOn: function(startCss, endCss, callback){//显示到屏幕上
            //init position
            var self = this;
            //如果正在当前正在执行其他动作
            if (self.isGettingOut || self.isCommingOn || self.isWaitting) {
                return;
            }
            self.isCommingOn = true;
            self.ele.dvPannel.css(startCss).css("display", "block");
            self.ele.dvPannel.animate(endCss, {
                duration: 700,
                easing: self.opt.inEasing || "easeInOutCubic",
                complete: function(){
                    self.isCommingOn = false;
                    callback && callback.call(self);
                }
            });
            return self;
        },
        getOut: function(endCss, complete, startCss){//从屏幕上退去
            //complete destory popup
            var self = this;
            //如果正在当前正在执行其他动作
            if (self.isGettingOut || self.isCommingOn || self.isWaitting) {
                return;
            }
            if (!endCss) {
                return;
            }
            self.isGettingOut = true;
            self.ele.dvPannel.animate(endCss, {
                duration: 500,
                easing: self.opt.outEasing || "easeInCubic",
                complete: function(){
                    self.isGettingOut = false;
                    complete && complete.call(self)
                }
            });
        },
        keepHold: function(){//保存结束动画所需要的参数
            //save current app context
            var args = arguments;
            this.holdArgs = [].slice.call(arguments);
            return this;
        },
        releaseHold: function(){//释放保持动作
            this.getOut.apply(this, this.holdArgs);
            return this;
        },
        wait: function(timer, callback){
            //on screen stop time
            var that = this;
            timer = timer || 1000;
            var tm = setTimeout(function(){
                if (tm) {
                    clearTimeout(tm);
                    tm = null;
                }
                callback && callback.call(that);
            }, timer);
        },
        remove: function(){
            this.ele.dvPannel.remove();
        }
    }
    
    var popupCollection = {
        showedPupops: {},//根据需求，是否设置为private
        destoryPopup: function(pop){
            if (!pop) {
                return;
            }
            var self = this;
            if (!pop) {
                return;
            }
            //删除对应的pop
            self.remarkRemoved(pop);
            return self;
        },
        addPopup: function(pop){
            var self = this;
            //判断id 是否已经存在，如果存在直接返回，如果不存在添加进去
            if (isPopInCollection(self.showedPupops, pop)) {
                return self;
            }
            self.showedPupops[pop.id] = pop;
            return self;
        },
        getPopup: function(popId){
            if (!popId) {
                return;
            }
            var self = this;
            if (popId in self.showedPupops) {
                return self.showedPupops[popId];
            }
            return;
        },
        remarkRemoved: function(pop){
            if (!pop) {
                return;
            }
            if (pop.id in this.showedPupops) {
                pop.ele.dvPannel.remove();
                delete this.showedPupops[pop.id];
            }
        }
    };
    
    exports.deskPopup = function(){
        return {
            addPopup: function(options){
                var pop = new Popup(options);
                popupCollection.addPopup(pop);
                return pop;
            },
            removePopup: function(pop){
                if (isString(pop)) {
                    pop = popupCollection.getPop(pop);
                }
                popupCollection.destoryPopup(pop);
            },
            getPopup: function(id){
                return popupCollection.getPopup(id);
            }
        }
    }()
    
    
})(window);
