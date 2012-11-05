
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

    /**
     * @license
     * jQuery Tools 3.2.11 / Flashembed - New wave Flash embedding
     *
     * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
     *
     * http://flowplayer.org/tools/toolbox/flashembed.html
     *
     * Since : March 2008
     * Date  : @DATE
     */
    (function(){
        var IE = document.all, URL = 'http://get.adobe.com/flashplayer', RE = /(\d+)[^\d]+(\d+)[^\d]*(\d*)/, GLOBAL_OPTS = {
            // very common opts
            width: '100%',
            height: '100%',
            id: "_" + ("" + Math.random()).slice(9),
            // flashembed defaults
            allowfullscreen: true,
            allowscriptaccess: 'always',
            quality: 'high',
            // flashembed specific options
            version: [3, 0],
            onFail: null,
            expressInstall: null,
            w3c: false,
            cachebusting: false
        };
        
        // version 9 bugfix: (http://blog.deconcept.com/2006/07/28/swfobject-143-released/)
        if (window.attachEvent) {
            window.attachEvent("onbeforeunload", function(){
                __flash_unloadHandler = function(){
                };
                __flash_savedUnloadHandler = function(){
                };
            });
        }
        
        // simple extend
        var extend = function(to, from){
            if (from) {
                for (var key in from) {
                    if (from.hasOwnProperty(key)) {
                        to[key] = from[key];
                    }
                }
            }
            return to;
        }
        
        // used by asString method
        var map = function(arr, func){
            var newArr = [];
            for (var i in arr) {
                if (arr.hasOwnProperty(i)) {
                    newArr[i] = func(arr[i]);
                }
            }
            return newArr;
        }
        
        
        var f = {
            conf: GLOBAL_OPTS,
            getVersion: function(){
                var fo, ver;
                try {
                    ver = navigator.plugins["Shockwave Flash"].description.slice(16);
                } 
                catch (e) {
                    try {
                        fo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
                        ver = fo && fo.GetVariable("$version");
                    } 
                    catch (err) {
                        try {
                            fo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                            ver = fo && fo.GetVariable("$version");
                        } 
                        catch (err2) {
                        }
                    }
                }
                ver = RE.exec(ver);
                return ver ? [1 * ver[1], 1 * ver[(ver[1] * 1 > 9 ? 2 : 3)] * 1] : [0, 0];
            },
            asString: function(obj){
                if (obj === null || obj === undefined) {
                    return null;
                }
                var type = typeof obj;
                if (type == 'object' && obj.push) {
                    type = 'array';
                }
                switch (type) {
                    case 'string':
                        obj = obj.replace(new RegExp('(["\\\\])', 'g'), '\\$1');
                        // flash does not handle %- characters well. transforms "50%" to "50pct" (a dirty hack, I admit)
                        obj = obj.replace(/^\s?(\d+\.?\d*)%/, "$1pct")
                        return '"' + obj + '"';
                    case 'array':
                        return '[' +
                        map(obj, function(el){
                            return f.asString(el);
                        }).join(',') +
                        ']';
                    case 'function':
                        return '"function()"';
                    case 'object':
                        var str = [];
                        for (var prop in obj) {
                            if (obj.hasOwnProperty(prop)) {
                                str.push('"' + prop + '":' + f.asString(obj[prop]));
                            }
                        }
                        return '{' + str.join(',') + '}';
                }
                // replace ' --> "  and remove spaces
                return String(obj).replace(/\s/g, " ").replace(/\'/g, "\"");
            },
            getHTML: function(VERSION, opts, conf){
                opts = extend({}, opts);
                /******* OBJECT tag and it's attributes *******/
                var html = '<object width="' + opts.width +
                '" height="' +
                opts.height +
                '" id="' +
                opts.id +
                '" name="' +
                opts.id +
                '"';
                if (opts.cachebusting) {
                    opts.src += ((opts.src.indexOf("?") != -1 ? "&" : "?") + Math.random());
                }
                if (opts.w3c || !IE) {
                    html += ' data="' + opts.src + '" type="application/x-shockwave-flash"';
                }
                else {
                    html += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';
                }
                html += '>';
                /******* nested PARAM tags *******/
                if (opts.w3c || IE) {
                    html += '<param name="movie" value="' + opts.src + '" />';
                }
                // not allowed params
                opts.width = opts.height = opts.id = opts.w3c = opts.src = null;
                opts.onFail = opts.version = opts.expressInstall = null;
                for (var key in opts) {
                    if (opts[key]) {
                        html += '<param name="' + key + '" value="' + opts[key] + '" />';
                    }
                }
                /******* FLASHVARS *******/
                var vars = "";
                if (conf) {
                    for (var k in conf) {
                        if (conf[k]) {
                            var val = conf[k];
                            vars += k + '=' + (/function|object/.test(typeof val) ? f.asString(val) : val) + '&';
                        }
                    }
                    vars = vars.slice(0, -1);
                    html += '<param name="flashvars" value=\'' + vars + '\' />';
                }
                html += "</object>";
                return html;
            },
            isSupported: function(VERSION, ver){
                return VERSION[0] > ver[0] || VERSION[0] == ver[0] && VERSION[1] >= ver[1];
            }
        };
        
        var VERSION = f.getVersion();
        function Flash(root, opts, conf){
            // version is ok
            if (f.isSupported(VERSION, opts.version)) {
                root.innerHTML = f.getHTML(VERSION, opts, conf);
                // express install
            }
            else 
                if (opts.expressInstall && f.isSupported(VERSION, [6, 65])) {
                    root.innerHTML = f.getHTML(VERSION, extend(opts, {
                        src: opts.expressInstall
                    }), {
                        //xss fix #357
                        MMredirectURL: encodeURIComponent(location.href),
                        MMplayerType: 'PlugIn',
                        MMdoctitle: document.title
                    });
                }
                else {
                    // fail #2.1 custom content inside container
                    if (!root.innerHTML.replace(/\s/g, '')) {
                        root.innerHTML = "<h2>Flash version " + opts.version + " or greater is required</h2>" +
                        "<h3>" +
                        (VERSION[0] > 0 ? "Your version is " + VERSION : "You have no flash plugin installed") +
                        "</h3>" +
                        (root.tagName == 'A' ? "<p>Click here to download latest version</p>" : "<p>Download latest version from <a href='" + URL + "'>here</a></p>");
                        //#526. allow click through event for flash installation message when using div containers.
                        if (root.tagName == 'A' || root.tagName == "DIV") {
                            root.onclick = function(){
                                location.href = URL;
                            };
                        }
                    }
                    // onFail
                    if (opts.onFail) {
                        var ret = opts.onFail.call(this);
                        if (typeof ret == 'string') {
                            root.innerHTML = ret;
                        }
                    }
                }
            // http://flowplayer.org/forum/8/18186#post-18593 todo not on window
            //if (IE) {
            //	window[opts.id] = document.getElementById(opts.id);
            //}
            // API methods for callback
            extend(this, {
                getRoot: function(){
                    return root;
                },
                getOptions: function(){
                    return opts;
                },
                getConf: function(){
                    return conf;
                },
                getApi: function(){
                    return root.firstChild;
                }
            });
        }
        
        var flashembed = function(root, opts, conf){
            // root must be found / loaded
            if (typeof root == 'string') {
                root = document.getElementById(root.replace("#", ""));
            }
            // not found
            if (!root) {
                return;
            }
            if (typeof opts == 'string') {
                opts = {
                    src: opts
                };
            }
            return new Flash(root, extend(extend({}, GLOBAL_OPTS), opts), conf);
        };
        
        window.flashembed = flashembed;
    })();
    
    //公共方法
    var tempAudio = document.createElement("audio");
    var dom = wky.dom;
    var core = wky.core;
    var format = { // Static Object
        mp3: {
            codec: 'audio/mpeg; codecs="mp3"',
            flashCanPlay: true,
            media: 'audio'
        },
        m4a: { // AAC / MP4
            codec: 'audio/mp4; codecs="mp4a.40.2"',
            flashCanPlay: true,
            media: 'audio'
        },
        oga: { // OGG
            codec: 'audio/ogg; codecs="vorbis"',
            flashCanPlay: false,
            media: 'audio'
        },
        wav: { // PCM
            codec: 'audio/wav; codecs="1"',
            flashCanPlay: false,
            media: 'audio'
        },
        webma: { // WEBM
            codec: 'audio/webm; codecs="vorbis"',
            flashCanPlay: false,
            media: 'audio'
        },
        fla: { // FLV / F4A
            codec: 'audio/x-flv',
            flashCanPlay: true,
            media: 'audio'
        },
        rtmpa: { // RTMP AUDIO
            codec: 'audio/rtmp; codecs="rtmp"',
            flashCanPlay: true,
            media: 'audio'
        },
        m4v: { // H.264 / MP4
            codec: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
            flashCanPlay: true,
            media: 'video'
        },
        ogv: { // OGG
            codec: 'video/ogg; codecs="theora, vorbis"',
            flashCanPlay: false,
            media: 'video'
        },
        webmv: { // WEBM
            codec: 'video/webm; codecs="vorbis, vp8"',
            flashCanPlay: false,
            media: 'video'
        },
        flv: { // FLV / F4V
            codec: 'video/x-flv',
            flashCanPlay: true,
            media: 'video'
        },
        rtmpv: { // RTMP VIDEO
            codec: 'video/rtmp; codecs="rtmp"',
            flashCanPlay: true,
            media: 'video'
        }
    };
    
    var support = ["mp3", "rtmpa", "fla", "m4a", "rtmpv", "flv", "m4v"];
    
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
    
    var getPlayerId = function(){
        var id = 0;
        return function(){
            id++;
            return "_player_" + id;
        }
    }()
    
    var createFlashPlayer = function(id, preload){
        if (!id) {
            return;
        }
        var flashPlayer = flashembed(id, {
            src: "flash/Jplayer.swf"
        });
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
    
    /*
     *
     * 播放器
     * {}
     */
    var Player = function(option){
        this.option = option || {};
        this.element = option.ele;
        this.preload = this.option.preload || "";
        this.loadProgress = this.option.loadProgress ||
        function(){
        };
        this.player = null;
        this.playerIsLoaded = false;
        this.status = {};
        this.playerId = getPlayerId();
        this.init();
    };
    
    Player.prototype = {
        constructor: Player,
        init: function(){
            //create player
            var flashObj = createFlashPlayer(this.element);
            if (flashObj) {
                this.player = flashObj.getApi();
            }
        },
        bindEvent: function(){
            var that = this;
            if (this.player) {
                //绑定process事件 
                if ("onprogress" in this.player) {
                    addEvent(this.player, "progress", function(){
                        //alert("pro"+that.player.duration);
                        var endVal = that.player.seekable && that.player.seekable.length ? that.player.seekable.end(0) : 0;
                        //var persent = (100 / (that.player.duration || 1) * endVal);
                        var args = [].splice.call(arguments, 0);
                        var loaded = that.player.buffered.end(0);
                        var dura = that.player.duration;
                        dura = isFinite(dura) ? dura : endVal;
                        var pencent = loaded / dura;
                        args.push(loaded);
                        args.push(dura);
                        console.log(dura || that.player.mozFragmentEnd);
                        args.push(pencent);
                        that.loadProgress.apply(that, args);
                    })
                }
                else {
                    //settimer
                }
                
            }
        },
        setAudio: function(media){
            var self = this;
            try {
                // Always finds a format due to checks in setMedia()
                core.forEach(support, function(format, i){
                    if (media[format]) {
                        switch (format) {
                            case "m4a":
                            case "fla":
                                self.player.fl_setAudio_m4a(media[format]);
                                break;
                            case "mp3":
                                self.player.fl_setAudio_mp3(media[format]);
                                break;
                            case "rtmpa":
                                self.player.fl_setAudio_rtmp(media[format]);
                                break;
                        }
                    }
                    self.status.src = media[format];
                    self.status.format[format] = true;
                    self.status.formatType = format;
                });
                if (self.preload === 'auto') {
                    self.load();
                    self.status.waitForLoad = false;
                }
            } 
            catch (err) {
                self.flashError(err);
            }
        },
        setVideo: function(media){
            var self = this;
            try {
                // Always finds a format due to checks in setMedia()
                core.forEach(support, function(format, i){
                    if (media[format]) {
                        switch (format) {
                            case "m4v":
                            case "flv":
                                self.player.fl_setVideo_m4v(media[format]);
                                break;
                            case "rtmpv":
                                self.player.fl_setVideo_rtmp(media[format]);
                                break;
                        }
                        self.status.src = media[format];
                        self.status.format[format] = true;
                        self.status.formatType = format;
                        return false;
                    }
                });
                
                if (sefl.preload === 'auto') {
                    self.load();
                    self.status.waitForLoad = false;
                }
            } 
            catch (err) {
                self.flashError(err);
            }
        },
        resetMedia: function(){
            this.pause(NaN);
        },
        clearMedia: function(){
            try {
                this.player.fl_clearMedia();
            } 
            catch (err) {
                this.flashError(err);
            }
        },
        load: function(){
            try {
                this.player.fl_load();
            } 
            catch (err) {
                this.flashError(err);
            }
            this.status.waitForLoad = false;
        },
        play: function(time){
            try {
                this.player.fl_play(time);
            } 
            catch (err) {
                this.flashError(err);
            }
            this.status.waitForLoad = false;
            this.checkWaitForPlay();
        },
        pause: function(time){
            try {
                this.player.fl_pause(time);
            } 
            catch (err) {
                this.flashError(err);
            }
            if (time > 0) { // Avoids a setMedia() followed by stop() or pause(0) hiding the video play button.
                this.status.waitForLoad = false;
                this.checkWaitForPlay();
            }
        },
        playHead: function(p){
            try {
                this.player.fl_play_head(p);
            } 
            catch (err) {
                this.flashError(err);
            }
            if (!this.status.waitForLoad) {
                this.checkWaitForPlay();
            }
        },
        checkWaitForPlay: function(){
            if (this.status.waitForPlay) {
                this.status.waitForPlay = false;
            }
        },
        volume: function(v){
            try {
                this.player.fl_volume(v);
            } 
            catch (err) {
                this.flashError(err);
            }
        },
        mute: function(m){
            try {
                this.player.fl_mute(m);
            } 
            catch (err) {
                this.flashError(err);
            }
        },
        flashError: function(error){
			//把错误send 回日志服务器 
            console.log(error.msg);
        }
    }
    
    /*
     *
     * 播放列表
     *
     */
    var PlayerList = function(){
    
        this.init();
    }
    
    PlayerList.prototype = {
        constructor: PlayerList,
        init: function(){
        
        }
    }
    
    /*
     *
     * 音乐歌词，要写个lrc转换的形式
     *
     */
    var MusicLRC = function(){
    
        this.init();
    }
    
    MusicLRC.prototype = {
        constructor: MusicLRC,
        init: function(){
        
        }
    }
    
    return {
        varName: "Player",
        varVal: Player
    }
})

