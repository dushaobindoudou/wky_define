(function(exports){
    "use strict"
    var ua = navigator && navigator.userAgent;
    var userAgent = {
        GECKO: ua.match(/Gecko\/([^\s]*)/),
        WEBKIT: ua.match(/AppleWebKit\/([^\s]*)/),
        IE: ua.match(/MSIE\s([^;]*)/),
        OPERA: ua.match(/Opera[\s\/]([^\s]*)/)
    };
    
    var unselectableStyle_ = userAgent.GECKO ? 'MozUserSelect' : userAgent.WEBKIT ? 'WebkitUserSelect' : null;
    /**
     * Returns true if the element is set to be unselectable, false otherwise.
     * Note that on some platforms (e.g. Mozilla), even if an element isn't set
     * to be unselectable, it will behave as such if any of its ancestors is
     * unselectable.
     * @param {Element} el  Element to check.
     * @return {boolean}  Whether the element is set to be unselectable.
     */
    var isUnselectable = function(el){
        if (unselectableStyle_) {
            return el.style[unselectableStyle_].toLowerCase() == 'none';
        }
        else 
            if (userAgent.IE || userAgent.OPERA) {
                return el.getAttribute('unselectable') == 'on';
            }
        return false;
    };
    
    /**
     * Makes the element and its descendants selectable or unselectable.  Note
     * that on some platforms (e.g. Mozilla), even if an element isn't set to
     * be unselectable, it will behave as such if any of its ancestors is
     * unselectable.
     * @param {Element} el  The element to alter.
     * @param {boolean} unselectable  Whether the element and its descendants
     *     should be made unselectable.
     * @param {boolean} opt_noRecurse  Whether to only alter the element's own
     *     selectable state, and leave its descendants alone; defaults to false.
     */
    var setUnselectable = function(el, unselectable, opt_noRecurse){
        // TODO: Do we need all of TR_DomUtil.makeUnselectable() in Closure?
        var name = unselectableStyle_;
        var descendants = !opt_noRecurse ? el.getElementsByTagName('*') : null;
        if (name) {
            // Add/remove the appropriate CSS style to/from the element and its
            // descendants.
            var value = unselectable ? 'none' : '';
            el.style[name] = value;
        }
        else 
            if (userAgent.IE || userAgent.OPERA) {
                // Toggle the 'unselectable' attribute on the element and its descendants.
                var value = unselectable ? 'on' : '';
                el.setAttribute('unselectable', value);
                
            }
    };
    var bind = function(fn, context){
        if (!fn || !context) {
            return;
        }
        return function(){
            var args = [].slice.call(arguments);
            fn.apply(context, args)
        }
    }
    
    /**
     *
     * 可拖动元素类，可以让某个元素随鼠标移动
     * @param {options}
     * 		options.ele 要拖动的元素如果为空则停止执行
     * 		options.beforeDrag 拖动发生之前，鼠标按下之后开始
     * 		options.dragging 正在拖动
     * 		options.dragEnd 拖动结束
     *		options.slideTime 如果不是拖到指定区域回到原来位置所用的时间 默认500毫秒
     *		options.complete 完全执行完之后的回调函数
     *
     *
     */
    var orginPos = null;
    var relayPos = null;
    
    var Dragable = function(options){
        if (!options.ele) {
            return;
        }
        this.ele = options.ele;
        this.eleClone = null;
        this.dragStatus = false;
        this.slideTime = options.slideTime || 500;
        this.beforeDragCallback = options.beforeDrag ||
        function(){
        };
        this.draggingCallback = options.dragging ||
        function(){
        };
        this.dragEndCallback = options.dragEnd ||
        function(){
        };
        this.complete = options.complete ||
        function(){
        };
        this.init();
    }
    
    Dragable.prototype = {
        constructor: Dragable,
        init: function(){
            var that = this;
            var proxyMethod = bind(that.draging, that);
            this.ele.mousedown(function(evt){
                that.dragStatus = true;
                that.beginDrag.call(that, evt);
                
                $(document).unbind("mousemove", proxyMethod).bind("mousemove", proxyMethod);
            });
            //
            $(document).mouseup(function(evt){
                if (!that.dragStatus) {
                    return;
                }
                that.dragStatus = false;
                that.endDrag.call(that);
                $(document).unbind("mousemove", proxyMethod);
                evt.stopPropagation();
                return false;
            });
        },
        cloneOrgin: function(ele, evt){
            this.eleClone = ele.clone();
            console.log(this.eleClone);
            
            orginPos = ele.offset();
            relayPos = {
                x: evt.clientX - orginPos.left,
                y: evt.clientY - orginPos.top
            }
            this.eleClone.css({
                "position": "absolute",
                "zIndex": "999"
            }).css(orginPos);
            ele.css({
                "display": "none"
            });
            setUnselectable($("body")[0], true);
            $("body").append(this.eleClone);
        },
        beginDrag: function(evt){
            var that = this;
            setUnselectable($("body")[0], true, false);
            that.cloneOrgin.call(that, that.ele, evt);
            that.beforeDragCallback.call(that);
        },
        draging: function(evt){
            var that = this;
            that.eleClone.css({
                top: evt.clientY - relayPos.y,
                left: evt.clientX - relayPos.x
            });
        },
        endDrag: function(){
            var that = this;
            setUnselectable($("body")[0], false);
            that.slidBack(that.eleClone, function(){
            });
            
            that.dragEndCallback.call(that);
        },
        slidBack: function(ele, callback){
            var that = this;
            ele.animate(orginPos, {
                duration: that.slideTime,
                easing: "easeInOutCubic",
                complete: function(){
                    that.ele.css({
                        "display": "block"
                    });
                    that.eleClone.remove();
                    orginPos = null;
                    callback && callback();
                }
            })
        }
    }
    
    
    exports.dragable = function(opt){
        return new Dragable(opt);
    };
    
})(window)


