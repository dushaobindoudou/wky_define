
/*
 *
 * author:dustin
 * email:dushaobindoudou@gmail.com
 *
 * 基于jquery 一个音乐播放器，支持列表，歌词，常用操作,内置三款皮肤
 *
 * 用jplayer flash
 *
 */
//require difine
//requrie dom;
wky_define("wky.plugins", function(plugin){

    var flashSource = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="$1" width="1" height="1" name="$1" style="position: absolute; left: -1px;"> \
        <param name="movie" value="$2?playerInstance=$4&datetime=$3">' +
    '<param name="allowscriptaccess" value="always">' +
    '<embed name="$1" src="$2?playerInstance=$4&datetime=$3" width="1" height="1" allowscriptaccess="always"> \
      </object>';
    
    //公共方法
    var dom = wky.dom;
    var core = wky.core;
    
    var addEvent = function(ele, evt, handler){
        if (!ele || !evt || !handler) {
            return;
        }
        if (ele.addEventListener) {
            ele.addEventListener(evt, handler, false)
        }
        else {
            ele.attachEvent("on" + evt, handler);
        }
    }
    
    var removeEvent = function(ele, evt, handler){
        if (!ele || !evt || !handler) {
            return;
        }
        if (ele.removeEventListener) {
            ele.removeEventListener(evt, handler, false)
        }
        else {
            ele.detachEvent("on" + evt, handler);
        }
    }
    
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === "[object String]";
    }
    
    var getSwf = function(name){
        var swf = document[name] || window[name];
        
        return swf.length > 1 ? swf[swf.length - 1] : swf;
    }
    
    var getPlayerId = function(){
        var id = 0;
        return function(){
            id++;
            return "_player_" + id;
        }
    }()
	
	var getMusicId = function(){
        var id = 0;
        return function(){
            id++;
            return "_music_" + id;
        }
    }()
	
    
    var createFlashPlayer = function(ele, id, src, instance, preload){
        if (!id) {
            return;
        }
        var fc = flashSource.replace(/\$1/g, id);
        fc = fc.replace(/\$2/g, src);
        fc = fc.replace(/\$3/g, (+new Date + Math.random()));
        fc = fc.replace(/\$4/g, instance);
        // Inject the player markup using a more verbose `innerHTML` insertion technique that works with IE.
        ele.innerHTML = fc;
        var flashPlayer = getSwf(id);
        return flashPlayer;
    }
    
    var createSource = function(src){
        var html = "";
        if (core.isArray(src)) {
            core.forEach(src, function(v, i){
                html += '<source src="' + v + '">';
            })
        }
        else {
            html += '<source src="' + src + '">';
        }
        return html;
    }
    
    function removeSWF(id){
        var obj = getElementById(id);
        if (obj && obj.nodeName == "OBJECT") {
            if (ua.ie && ua.win) {
                obj.style.display = "none";
                (function(){
                    if (obj.readyState == 4) {
                        removeObjectInIE(id);
                    }
                    else {
                        setTimeout(arguments.callee, 10);
                    }
                })();
            }
            else {
                obj.parentNode.removeChild(obj);
            }
        }
    }
    
    function removeObjectInIE(id){
        var obj = getElementById(id);
        if (obj) {
            for (var i in obj) {
                if (typeof obj[i] == "function") {
                    obj[i] = null;
                }
            }
            obj.parentNode.removeChild(obj);
        }
    }
    
    /*
     *
     * 播放器
     * {}
     */
    var Player = function(option){
        this.option = option || {};
        this.element = option.ele;
        this.preload = this.option.preload || true;
        this.autoPlay = this.option.autoPlay || false;
        this.playEndCallback = this.option.playEnd ||
        function(){
        };
        this.playheadCallback = this.option.uploadPlayhead ||
        function(){
        };
        this.loadProgressCallback = this.option.loadProgress ||
        function(){
        };
        this.player = null;
        this.duration = 0;
        this.playerIsLoaded = false;
        this.isReay = false;
        this.playerId = getPlayerId();
        this.init();
    };
    
    Player.prototype = {
        constructor: Player,
        init: function(){
            //create player
            var self = this;
            var flashObj = createFlashPlayer(this.element, this.playerId, "flash/audio.swf", "wky.plugins.playerCollection.get('" + this.playerId + "')");
            this.player = flashObj;
            window.onbeforeunload = function(){
                console.log("is cleared !!");
                var player = document.getElementById(self.playerId);
                if (player && player.nodeName == "OBJECT") {
                    player.parentNode.removeChild(player);
                }
            }
        },
        updatePlayhead: function(played){
            this.playheadCallback.apply(this, arguments);
        },
        loadProgress: function(percent, dur){
            this.duration = dur;
            this.loadProgressCallback.apply(this, arguments);
        },
        loadStarted: function(){
            //表示一切就绪可以播放聊
            this.isReady = true;
            if (this.preload) {
                this.player.init(audio.mp3);
            }
            if (this.autoplay) {
                this.play();
            }
        },
        loadError: function(){
            //todo:  io error send back to server
        },
        trackEnded: function(){
            this.playEndCallback.call(this);
        },
        setAudio: function(src){
            var self = this;
            try {
                if (self.preload) {
                    self.player.load(src);
                    self.isReady = false;
                }
            } 
            catch (err) {
                self.flashError(err);
            }
            return self;
        },
        skipTo: function(percent){
            var self = this;
            try {
                if (percent > 1) {
                    percent = 1
                }
                if (percent < 0) {
                    percent = 0;
                }
                self.player.skipTo(percent);
            } 
            catch (e) {
                self.flashError(err);
            }
            return self;
        },
        load: function(src){
            try {
                this.player.init(src);
            } 
            catch (err) {
                this.flashError(err);
            }
            this.isReay = false;
            return this;
        },
        play: function(){
            try {
                this.player.pplay();
            } 
            catch (err) {
                this.flashError(err);
            }
        },
        pause: function(){
            try {
                this.player.ppause();
            } 
            catch (err) {
                this.flashError(err);
            }
        },
        playPause: function(){
            try {
                this.player.playerPause();
            } 
            catch (err) {
                this.flashError(err);
            }
            return this;
        },
        volume: function(v){
            try {
                this.player.setVolume(v);
            } 
            catch (err) {
                this.flashError(err);
            }
            return this;
        },
        maxVolume: function(){
            this.volume(1);
            return this;
        },
        mute: function(){
            this.volume(0);
            return this;
        },
        flashError: function(error){
            //把错误send 回日志服务器 
            //console.log(error.msg);
            return this;
        },
        destory: function(){
            if (this.element) {
                this.element.innerHTML = "";
            }
        }
    }
    
    /*
     *
     * 播放列表
     *
     * playMode:[listCircle,list,random,singelCricle]
     * 			列表循环，列表播放，随机播放，单曲循环
     *
     *
     * [{mp3:"",lrc:"",mdx:""}]
     *
     */
    var playListModes = {
        "listCircle": {
            next: function(curr, total){
                if (curr < total - 1) {
                    return curr + 1;
                }
                if (curr >= total - 1) {
                    return 0
                }
            },
            prev: function(curr, total){
                if (curr > 0) {
                    return curr - 1;
                }
                if (curr <= 0) {
                    return total - 1;
                }
            }
        },
        "list": {
            next: function(curr){
                if (curr < total - 1) {
                    return curr + 1;
                }
                if (curr >= total - 1) {
                    return -1;
                }
            },
            prev: function(){
                if (curr > 0) {
                    return curr - 1;
                }
                if (curr <= 0) {
                    return -1;
                }
            }
        },
        "random": {
            next: function(curr, total){
                var ran = Math.random() * total
                return parseInt(ran);
            },
            prev: function(curr, total){
                var ran = Math.random() * total
                return parseInt(ran);
            }
        },
        "singelCricle": {
            next: function(curr){
                return curr;
            },
            prev: function(curr){
                return curr;
            }
        }
    };
    
    var PlayerList = function(option){
        option = option || {};
        this.defaultMode = "listCircle";
        this.playMode = option.playMode in playListModes ? option.playMode : this.defaultMode;
        this.playList = [];
        this.currentPlay = "";
        this.currentPlayIdx = 0;
        this.usePlayer = option.player;
    }
    
    PlayerList.prototype = {
        constructor: PlayerList,
        init: function(list){
            var self = this;
            if (!this.usePlayer) {
                throw new Error("你还没有播放器，请先实例化一个player");
            }
            this.usePlayer.playEndCallback = function(){
                self.musicEnded();
            }
            if (core.isArray(list)) {
                core.forEach(list, function(k, i){
                    if (!k || !k.mp3) {
                        return;
                    }
                    k.mdx = getMusicId();
                    self.playList.push(k);
                });
            }
            else {
                if (!list || !list.mp3) {
                    return;
                }
                list.mdx = getMusicId();
                self.playList(list);
            }
        },
        musicEnded: function(){
            this.next();
        },
        updatePlaying: function(mdx){
        	var idx = findMdx(mdx);
			if(idx > -1){
				this.currentPlay = idx;
				this.playMusic();
			}
            return this;
        },
        next: function(){
            var curr = getNextPlayIdx();
            this.currentPlayIdx = curr;
            this.playMusic();
            return this;
        },
        prev: function(){
            var curr = getNextPlayIdx();
            this.currentPlayIdx = curr;
            this.playMusic();
            return this;
        },
        setPlayMode: function(mode){
            if (!mode) {
                return this;
            }
            if (mode in playListModes) {
                this.playMode = mode;
            }
			return this;
        },
        addMusic: function(music){
			//todo:应该clone 一下
        	if(!music || !music.mp3){
				return this;
			}
			music.mdx = getMusicId();
			this.playList.push(music);
			return this;
        },
		findMdx:function(mdx){
			if(!mdx){
				return -1;
			}
			var pl = this.playList;
			for(var i=0; i<pl;i++){
				if(pl[i] && pl[i].mdx == mdx){
					return i;
				}
			}
			return -1;
		},
        removeMusic: function(mdx){
        	if(!mdx){
				return this;
			}
			var idx = findMdx(mdx);
			if(idx > -1){
				this.playList.splice(idx,1);
			}
			return this;
        },
        getNextPlayIdx: function(){
            var self = this;
            var mode = this.playMode;
            if (mode in playListModes) {
                return playListModes[mode].next(this.currentPlayIdx, this.playList.length);
            }
            else {
                return playListModes[this.defaultMode].next(this.currentPlayIdx, this.playList.length);
            }
        },
        getPrevPlayIdx: function(){
            var self = this;
            var mode = this.playMode;
            if (mode in playListModes) {
                return playListModes[mode].prev(this.currentPlayIdx, this.playList.length);
            }
            else {
                return playListModes[this.defaultMode].prev(this.currentPlayIdx, this.playList.length);
            }
        },
        playMusic: function(){
            var music = this.playList[this.currentPlayIdx];
            if (music) {
                this.usePlayer.setAudio().play();
            }
            return this;
        }
    }
    
    /*
     *
     * 音乐歌词，要写个lrc转换的形式
     *
     */
    var MusicLRC = function(){
    	//this
		this.lrc = "";
		
		
        this.init();
    }
    
    MusicLRC.prototype = {
        constructor: MusicLRC,
        init: function(){
        	
        }
    }
    
    var playerIn = function(colls, id){
        if (!colls || !id) {
            return;
        }
        if (id in colls) {
            return true;
        }
        return false;
    }
    
    var playerCollection = {
        colls: {},
        get: function(id){
            if (!id) {
                return;
            }
            if (playerIn(this.colls, id)) {
                return this.colls[id];
            }
        },
        add: function(opt){
            var player = new Player(opt);
            if (player.playerId) {
                this.colls[player.playerId] = player;
            }
            return player;
        }
    }
    
    return [{
        varName: "Player",
        varVal: Player
    }, {
        varName: "playerCollection",
        varVal: playerCollection
    }]
})

