/*
 *
 * 简单的canvas方法
 *
 */
(function(win){
    "use strict"
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === "[object String]";
    }
    
    var Stage = function(ele){
        this.ele = isString(ele) ? $("#" + ele)[0] : ele;
        this.ctx = this.getContext(this.ele);
    }
    Stage.prototype = {
        constructor: Stage,
        getContext: function(ele){
            if (!ele) {
                return;
            }
            if (!ele.getContext) {
                return;
            }
            return ele.getContext("2d");
        }
    }
    
    var Pointer = function(x, y){
        this.x = x || 0;
        this.y = y || 0;
    }
    
    var Pen = function(stage, penStyle){
        if (!stage || !stage.ctx) {
            return;
        }
        this.stage = stage;
        this.color = penStyle.color || "#000000";//支持rgba
        this.width = penStyle.width || "1px";
        this.lineCap = penStyle.lineCap || "butt"; //['butt','round','square'];
        this.lineJoin = penStyle.lineJoin || "miter"; //['round','bevel','miter']; 
        this.miterLimit = penStyle.miterLimit || 10; //不能小于1
        this.initStyle();
    }
    
    Pen.prototype = {
        constructor: Pen,
        initStyle: function(){
            this.stage.ctx.strokeStyle = this.color;
            this.stage.ctx.lineWidth = this.width;
            this.stage.ctx.lineCap = this.lineCap;
            this.stage.ctx.lineJoin = this.lineJoin;
            if (this.lineJoin == "miter") {
                this.stage.ctx.miterLimit = this.miterLimit;
            }
        },
        beginDraw: function(){
			if(!this.stage || !this.stage.ctx){
				return;
			}
            this.stage.ctx.beginPath();
        },
        moveNewPointer: function(pointer){
			if(!this.stage || !this.stage.ctx){
				return;
			}
            this.stage.ctx.moveTo(pointer.x, pointer.y);
        },
        fillOuterLine: function(){
			if(!this.stage || !this.stage.ctx){
				return;
			}
            this.stage.ctx.stroke();
        },
        draw: function(fromPointer, toPointer){
			if(!this.stage || !this.stage.ctx){
				return;
			}
            if (!fromPointer || !toPointer) {
                return;
            }
            this.stage.ctx.lineTo(toPointer.x, toPointer.y);
        },
        fillDrawedArea: function(fillStyle){
			if(!this.stage || !this.stage.ctx){
				return;
			}
            this.stage.ctx.fillStyle = fillStyle.color || "#000000";
            this.stage.ctx.fill();
        },
        endDraw: function(){
			if(!this.stage || !this.stage.ctx){
				return;
			}
            this.stage.ctx.closePath();
        }
    }
    
    var Tree = function(stage){
		if(!stage){
			return;
		}
        var LEAVE_TYPE = {
            MAX_BRANCH_WIDTH: 20,
            SMALL_LEAVES: 10,
            MEDIUM_LEAVES: 200,
            BIG_LEAVES: 500,
            THIN_LEAVES: 900
        };
        this.drawLeaves = true;
        this.leaveColor = "";
        this.leaveType = LEAVE_TYPE.MEDIUM_LEAVES;
        this.spread = 0.6;
        this.stage = stage;
    };
    
    Tree.prototype = {
        constructor: Tree,
        draw: function(spread, leaves, leaveType, h, w){
            // Set how much the tree branches are spread
            if (spread >= 0.3 && spread <= 1) {
                this.spread = spread;
            }
            else {
                this.spread = 0.6;
            }            
            if (leaves === true || leaves === false) {
                this.drawLeaves = leaves;
            }
            else {
                this.leaves = true;
            }
            if (leaveType == this.SMALL_LEAVES ||
            leaveType == this.MEDIUM_LEAVES ||
            leaveType == this.BIG_LEAVES ||
            leaveType == this.THIN_LEAVES) {
                this.leaveType = leaveType;
            }
            else {
                this.leaveType = this.MEDIUM_LEAVES;
            }
            
            this.ctx = this.stage.ctx;
            this.height = h || this.stage.ele.height;
            this.width = w || this.stage.ele.width;
			
            this.ctx.clearRect(0, 0, this.width, this.height);
            // Center the tree in the window 
            this.ctx.translate(this.width / 2, this.height);
            // Set the leaves to a random color
            this.leavesColor = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
            // Set branch thickness
            this.ctx.lineWidth = 1 + (Math.random() * this.MAX_BRANCH_WIDTH);
            this.ctx.lineJoin = 'round';
			            
            this.branch(0);
        },
        branch: function(depth){
            if (depth < 12) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, -(this.height) / 10);                
                this.ctx.stroke();
                this.ctx.translate(0, -this.height / 10);
                // Random integer from -0.1 to 0.1
                var randomN = -(Math.random() * 0.1) + 0.1;
                this.ctx.rotate(randomN);
                if ((Math.random() * 1) < this.spread) {
                    // Draw the left branches
                    this.ctx.rotate(-0.35);
                    this.ctx.scale(0.7, 0.7);
                    this.ctx.save();
                    this.branch(depth + 1);
                    // Draw the right branches
                    this.ctx.restore();
                    this.ctx.rotate(0.6);
                    this.ctx.save();
                    this.branch(depth + 1);
                    this.ctx.restore();
                }
                else {
                    this.branch(depth);
                }                
            }
            else {
                // Now that we have done drawing branches, draw the leaves
                if (this.drawLeaves) {
                    var lengthFactor = 200;
                    if (this.leaveType === this.THIN_LEAVES) {
                        lengthFactor = 10;
                    }
                    this.ctx.fillStyle = this.leavesColor;
                    this.ctx.fillRect(0, 0, this.leaveType, lengthFactor);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    
    
    
    
    
    
    
    
    var cjp = {
        Stage: Stage,
        Pointer: Pointer,
        Pen: Pen,
		Tree:Tree
    };
    
    win.cjp = cjp;
    
})(window);
