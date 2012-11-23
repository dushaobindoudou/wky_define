/*
 * 
 * 
 * 
 * 
 */
(function(win){
	var ClickDespatcher = function(fns,invterval){
		this.clickCount = 0;
		this._timer = null;
		this.interval = invterval || 180;
		this.fns = fns || [];
		this.addArgs = null;
		this.init();
	}
	
	ClickDespatcher.prototype = {
		constructor:ClickDespatcher,
		init : function(){
			
			
		},
		addCount:function(){
			this.clickCount++;
			this.addArgs = arguments;
			this.clearTimer();
			this.startTimer();
		},
		startTimer : function(){
			var that = this;
			that._timer = setTimeout(function(){
				//that._timer = 0;
				var fn = that.fns[that.clickCount - 1];
				that.clickCount = 0;
				if(!fn){					
					return;
				}
				if(that.addArgs){
					fn.args = fn.args.concat([].slice.call(that.addArgs));
				}
				fn && fn.f.apply(that,fn.args);
			},this.interval);
		},
		clearTimer : function(){
			var that = this;
			if (this._timer) {
				clearTimeout(this._timer);
				this._timer = null;
			}
		}
	}
	
	var cdColls = [];
	var getId = function(){
		var id = 0;
		return function(){
			id++;
			return "_cdp_" + id;
		}		
	}()
	
	var ClickCollection = function(){
		this.init();
	}
	
	ClickCollection.prototype = {
		constructor:ClickCollection,
		init:function(){
			
		},
		add:function(){
			
		}
	}
	
	
	win.ClickDespatcher = ClickDespatcher;
	
})(window);
