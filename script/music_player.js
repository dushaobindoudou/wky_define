
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
    var tween = wky.tween;
    
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
            if (idx > -1) {
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
            if (!music || !music.mp3) {
                return this;
            }
            music.mdx = getMusicId();
            this.playList.push(music);
            return this;
        },
        findMdx: function(mdx){
            if (!mdx) {
                return -1;
            }
            var pl = this.playList;
            for (var i = 0; i < pl; i++) {
                if (pl[i] && pl[i].mdx == mdx) {
                    return i;
                }
            }
            return -1;
        },
        removeMusic: function(mdx){
            if (!mdx) {
                return this;
            }
            var idx = findMdx(mdx);
            if (idx > -1) {
                this.playList.splice(idx, 1);
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
    
    //创建播放器界面，并绑定相应的事件，这个会与外界的接口
    var PlayListUI = function(option){
		option = option || {};
        this.container = option;
        this.init();
    }
    
    PlayListUI.prototype = {
        constructor: PlayListUI,
        init: function(){
			
			dom.append();
        },
        createUI: function(){
        
        },
        initPlayer: function(){
        
        },
        bindEvent: function(){
        
        }
        
    }
    
    
    /*
     *
     * 音乐歌词，要写个lrc转换的形式
     *
     */
    var MusicLRC = function(options){
        //this
        this.lrc = {
            "2000": "歌曲名称：阴天",
            "4760": "歌手名称：莫文蔚",
            "6220": "词曲：作词：李宗盛",
            "6760": "作曲：李宗盛/周国仪",
            "8920": "编曲：周国仪",
            "10020": "制作：刘建平",
            "14520": "QQ：33975183",
            "19380": "阴天　在不开灯的房间",
            "22400": "当所有思绪都一点一点沉淀",
            "26160": "爱情究竟是精神鸦片",
            "29180": "还是世纪末的无聊消遣",
            "33490": "香烟　氲成一滩光圈",
            "36800": "和他的照片就摆在手边",
            "40290": "傻傻两个人　笑的多甜",
            "43810": "",
            "46680": "开始总是分分钟都妙不可言",
            "51040": "谁都以为热情它永不会减",
            "54260": "除了激情褪去后的那一点点倦",
            "60980": "也许像谁说过的贪得无厌",
            "64990": "活该应了谁说过的不知检点",
            "68630": "总之那几年　感性赢了理性的那一面",
            "72510": "",
            "91520": "阴天　在不开灯的房间",
            "94110": "当所有思绪都一点一点沉淀",
            "97660": "爱恨情欲里的疑点",
            "100360": "盲点　呼之欲出　那么明显",
            "105190": "女孩　通通让到一边",
            "108300": "这歌里的细微末节就算都体验",
            "112120": "若想真明白　真要好几年",
            "116150": "",
            "147670": "回想那一天　喧闹的喜宴",
            "154930": "耳边响起的究竟是序曲或完结篇",
            "162080": "感情不就是你情我愿",
            "165200": "最好爱恨扯平两不相欠",
            "168900": "感情说穿了　一人挣脱的　一人去捡",
            "175480": "男人大可不必百口莫辩",
            "179530": "女人实在无须楚楚可怜",
            "183110": "总之那几年　你们两个没有缘",
            "192990": "阴天　在不开灯的房间",
            "196100": "当所有思绪都一点一点沉淀",
            "199630": "爱情究竟是精神鸦片",
            "202820": "还是世纪末的无聊消遣",
            "207220": "香烟　氲成一滩光圈",
            "210440": "和他的照片就摆在手边",
            "213990": "傻傻两个人　笑的多甜",
            "221230": "傻傻两个人　笑的多甜"
<<<<<<< HEAD
=======
            //"timeList": [2000, 4760, 6220, 6760, 8920, 10020, 14520, 19380, 22400, 26160, 29180, 33490, 36800, 40290, 43810, 46680, 51040, 54260, 60980, 64990, 68630, 72510, 91520, 94110, 97660, 100360, 105190, 108300, 112120, 116150, 147670, 154930, 162080, 165200, 168900, 175480, 179530, 183110, 192990, 196100, 199630, 202820, 207220, 210440, 213990, 221230]
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
        };
        this.lrcTimeList = null;
        this.prevLine = null;
        this.lrcListHeight = 0;
        this.currentLine = 0;
        this.currentTick = 0;
        this.pannel = options.pannel || "";
<<<<<<< HEAD
        this.animEasing = options.easing || "easeOutCubic";
        this.animDuration = options.duration || 250;
        
=======
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
        this.lrcList = null;
        this.init();
    }
    
    MusicLRC.prototype = {
        constructor: MusicLRC,
        init: function(lrc){
            this.setLRC(lrc);
            this.updatePannel(this.pannel);
            this.lrcList = dom.search("ul", this.pannel);
<<<<<<< HEAD
            
            this.lrcListHeight = dom.innerHeight(this.pannel[0]);
=======
			
			this.lrcListHeight = dom.innerHeight(this.pannel[0]);
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
        },
        setLRC: function(lrc){
            var that = this;
            if (!lrc || isString(lrc)) {
                //paseLRC2JSON();
            }
            else {
                this.lrc = lrc;
            }
            if ("timeList" in this.lrc && this.lrc["timeList"].length > 0) {
                //todo:复制一个副本 
                this.lrcTimeList = this.lrc["timeList"];
            }
            else {
                this.genTimeList();
            }
        },
        genTimeList: function(){
            var list = [];
            core.forIn(this.lrc, function(v, k){
                if (!v || !v.match(/^\d+$/)) {
                    return;
                }
                list.push(v);
            });
            this.lrcTimeList = list;
        },
        renderLRC: function(){
            var ht = ['<ul>'];
            core.forIn(this.lrc, function(k, v){
                ht.push('<li tick="' + k + '">' + v + '</li>');
            });
            ht.push('</ul>');
            core.forEach(this.pannel, function(v, i){
                dom.html(v, ht.join(""))
            });
<<<<<<< HEAD
=======
            //dom.html(this.pannel,);
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
            return ht;
        },
        updatePannel: function(hander){
            if (!hander) {
                return;
            }
            this.destoryPannel();
            this.pannel = hander;
            this.renderLRC();
        },
        destoryPannel: function(){
            core.forEach(this.pannel, function(v, i){
                dom.html(v, "");
            });
        },
        showLine: function(tick){
            if (!tick) {
                return "";
            }
            var currentTick = parseInt(this.lrcTimeList[this.currentLine]);
            var that = this;
            if (currentTick - 10 < tick) {
                tick = currentTick;
                this.currentLine++;
            }
            if (!this.lrc[tick]) {
                return "";
            }
            if (this.prevLine) {
                core.forEach(this.prevLine, function(v, i){
                    dom.removeClass(v, "current");
<<<<<<< HEAD
                });
=======
                })
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
            }
            var currentLine = dom.search("li[tick=" + tick + "]", this.lrcList);
            core.forEach(currentLine, function(v, i){
                dom.addClass(v, "current");
            });
            that.prevLine = currentLine;
<<<<<<< HEAD
            
            var liHeight = dom.height(currentLine[0]);
            
            this.animate(liHeight * (this.currentLine - 1), -liHeight);
            
            return this.lrc[tick];
        },
        animate: function(start, change){
            var midHeight = this.lrcListHeight / 2;
            var that = this;
            var ul = that.lrcList[0];
            tween.animate({
                easing: that.animEasing,
                duration: that.animDuration,
                start: midHeight - start,
                change: change,
                step: function(dalte, sv){
                    dom.setStyle(ul, {
                        top: (sv) + "px"
                    });
                }
            });
=======
			
			var liHeight = dom.height(currentLine[0]);
			
			this.animate(liHeight * this.currentLine);
			
            return this.lrc[tick];
        },
        animate: function(relat){
        	var midHeight = this.lrcListHeight /2 ;
			dom.setStyle(this.lrcList[0],{
				top: (midHeight - relat) + "px"
			});
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
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
    }, {
        varName: "MusicLRC",
        varVal: MusicLRC
<<<<<<< HEAD
    }, {
        varName: "PlayListUI",
        varVal: PlayListUI
=======
>>>>>>> d45dc5fc784531ee905c0465470e8a97525743aa
    }]
})

