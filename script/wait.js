/*
 *
 *
 * author:dusin
 *
 * email:dushaobindoudou@gmail.com
 *
 *
 */
//dependence wky.core.klass

//等待函数，这个函数是等待到某个设定的属性值更新后，然后出发continue函数，继续执行，否则一直等待下去
define("wky.plugin", function(plugin){
    "use strict"
    var klass = wky.core.klass;
    var waitQueue = [];
    var waitTimer = null;
    var intervalTime = 100;
    var stopTimer = false;
    
    
    var proxy = function(context, fn){
        if (!context || !fn) {
            return;
        }
        return function(){
            return fn.apply(context, [].slice.call(arguments))
        }
    }
	
	var getWaitId = function(){
		var id = 0;
		return function(){
			id++;
			return "wait_"+id;
		}
		
	}();
    
    var aryRemove = function(ary, idx){
        ary.splice(idx, 1);
    }
    
    var everyIntFun = function(){
        //check queue
        for (var i = 0, len = waitQueue.length; i < len; i++) {
            var k = waitQueue[i];
            if (k) {
                if (k.couldBeExec) {
					//todo:setTimeout 0 然后在执行
                    k.fn.call(fn.contxt, fn.args);
                    arrRemove(waitQueue,i);
                }
            }
        }
		if(!waitQueue.length){
			stopTimer = true;	
		}
    };
    
	var getWaitObj = function(fn,context,args){
		return {
			fn:fn,
			context:context,
			args : args,
			id:getWaitId()
		}
	}
    
    //todo:计算代码的执行时间动态调整间隔值
    var statTimer = function(){
        waitTimer = setTimeout(function(){
            if (stopTimer) {
                clearTimeout(waitTimer);
                return;
            }
            everyIntFun && everyIntFun();
            statTimer();
        }, intervalTime);
    }
    var Wait = function(){
        this.init();
    }
    Wait.prototype = {
        constructor: Wait,
        init: function(){
            var that = this;
            everyIntFun = proxy(that, that.checkQueue)
            this.checkQueue();
        },
        addWaitFun: function(fn,args,cxt){
			if(!fn){
				return;
			}
			args = args || [];
            var wo = getWaitObj(fn,cxt,args);
            //todo:关联标志怎么设置
            waitQueue.push(wo);
            return this;
        }
    }
    
	var nw = new Wait();
    
    return {
        varName: "Wait",
        varVal: nw
    }
});
