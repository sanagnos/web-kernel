// ============================================================================
// client.js
// ============================================================================
// 
// Http & WebSocket client.
// 
// Copyright (c) 2014, Stelios Anagnostopoulos (stelios@outlook.com)
// All rights reserved.
// ============================================================================

'use strict';

window.client = (function() {

    // ========================================================================
    // Cache
    // ========================================================================
    
    // connection endpoint
    var url = 'ws://' + document.URL.match(/\/\/(.*)/)[1];

    // function cache
    var slice          = Array.prototype.slice,
        stringify      = JSON.stringify,
        parse          = JSON.parse,
        defineProperty = Object.defineProperty;

    // module declaration
    var modules      = {}, // declared modules
        status       = {}, // cache status
        dependencies = {}; // dependency cache

    // connection service
    var ws,                // ws channel
        callback,          // callback registry as { timestampN: fn }
        connected = false; // connection flag

    // ========================================================================
    // Async helpers
    // ========================================================================

    /**
     * Applies async task to items & propagates to cb when done.
     * 
     * @param  {Function} task  
     * @param  {Array}    items (Can be non-array/single item)
     * @param  {Function} cb    Passed array of res for each item applied to task
     */
    function each(items, task, cb) { // adapted from https://github.com/caolan/async

        if (! (items instanceof Array) )
            items = [items];

        var idx = 0,
            len = items.length,
            res = [];

        if (!len)
            return cb([]);

        var iter = function () {
            task(items[idx++], function (out) {
                res[res.length] = out;
                if (idx >= len)
                    cb(res);
                else
                    iter();
            });
        };
        
        iter();
    };

    /**
     * Applies async task to items for each group & propagates to cb when done.
     * (See each)
     * 
     * @param  {Array}    groups List of [ [items, task], ... ]
     * @param  {Function} cb     Passed array of results for each group
     */
    function eachGroup(groups, cb) {

        if ( !(groups instanceof Array) )
            groups = [].concat(groups);
        
        each(groups, function (group, done) {
            each(group[0], group[1], done);
        }, cb);
    };

    // ========================================================================
    // Modules
    // ========================================================================

    /**
     * Declares module.
     *
     * @param  {String}   path         
     * @param  {Array}    dependencies
     * @param  {Function} fn   
     */
    function declare(path, deps, fn) {
        if (!path.match(/.js$/)) 
            path += '.js';

        if (!path.match(/^.\//)) {
            if (path.match(/^\//))
                path = '.' + path;
            else
                path = './' + path;
        }

        if (deps instanceof Array) {
            var len = deps.length;

            while (len--) {

                if (!deps[len].match(/.js$/)) 
                    deps[len] += '.js';

                if (!deps[len].match(/^.\//)) {
                    if (deps[len].match(/^\//)) 
                        deps[len] = '.' + deps[len];
                    else
                        deps[len] = './' + deps[len];
                }
            }
            modules[path]      = fn;
            dependencies[path] = deps;
        } else {
            modules[path] = deps;
        }

        status[path] = 0;
    };

    /**
     * Invokes module, propagating instances to callback.
     * 
     * @param  {String}    key Module(s) to fetch
     * @param  {Function}  cb  Passed module instances
     */
    function invokeModule(path, cb) {
        if (!path.match(/.js$/)) 
            path += '.js';

        if (status[path] === 0) {
            status[path] = 1;
            if ( typeof modules[path] === 'function' ) {
                if ( dependencies[path] ) {
                    each( dependencies[path], invokeModule, function (res) {
                        delete dependencies[path];
                        var ctx = {};
                        modules[path] = modules[path].apply(ctx, res);
                        if (!modules[path])
                            modules[path] = ctx;
                        cb( modules[path] );
                    });
                } else {
                    var ctx = {};
                    modules[path] = modules[path].call(ctx);
                    if (!modules[path])
                        modules[path] = ctx;
                    cb( modules[path] );
                }
            } else {
                cb( modules[path] );
            }
        } else if ( status[path] === 1 ) {
            cb( modules[path] );
        } else {
            appendJS( path, function() {
                invokeModule( path, cb );
            });
        }
    };

    /**
     * Invokes modules/scripts html, and css.
     *
     * @param  {String/Array} paths 
     * @param  {Function}     cb    Passed module instances (js only)
     */
    function invoke(paths, cb) {
        if ( typeof paths === 'string' ) {

            if (!paths.match(/^.\//)) {
                if (paths.match(/^\//))
                    paths = '.' + paths;
                else
                    paths = './' + paths;
            }

            return invokeModule( paths, cb );
        }

        var len  = paths.length,
            js   = [],
            css  = [],
            html = [],
            postfix;
        while (len--) {
            postfix = paths[len].match(/.*\.(.*)/);
            if (postfix && postfix[postfix.length - 1][0] !== '/') {
                postfix = postfix[postfix.length - 1];
            } else {
                postfix    = 'js';
                paths[len] += '.js';
            }


            if (!paths[len].match(/^.\//)) {
                if (paths[len].match(/^\//))
                    paths[len] = '.' + paths[len];
                else
                    paths[len] = './' + paths[len];
            }

            switch (postfix) {
                case 'js':
                    js[js.length] = paths[len];
                    break;
                case 'css':
                    css[css.length] = paths[len];
                    break;
                case 'html':
                    html[html.length] = paths[len];
                    break;
                default:
                    break;
            }
        }

        eachGroup([
            [ css,  appendCSS  ],
            [ html, appendHTML ]
        ], function () {
            each(js, invokeModule, function (res) { 
                cb.apply(null, res) 
            });
        });
    };

    /**
     * Appends CSS to DOM.
     * 
     * @param  {String}      path 
     * @param  {HTMLElement} parent
     * @param  {Function}    cb    
     */
    function appendCSS(path, parent, cb) { // adapted from http://forums.asp.net/t/1956549.aspx?How+to+asynchronously+load+css+
        cb = arguments[ arguments.length - 1 ];

        if (!path.match(/.css$/)) 
            path += '.css';

        if (typeof cb !== 'function')
            cb = null;
        
        if (!parent || typeof parent === 'function')
            parent = document.body;

        var css = document.createElement('link');

        css.href   = path;
        css.rel    = 'stylesheet';
        css.type   = 'text/css';
        css.onload = function() { if (cb) cb() };

        parent.appendChild(css);
    };

    invoke.appendCSS = appendCSS;

    /**
     * Appends to DOM file contents.
     * 
     * @param  {String}   path 
     * @param  {Function} cb    
     */
    function appendHTML(path, parent, cb) { // adapted from http://www.openjs.com/articles/ajax/ahah_asynchronous_html_over_http/
        cb = arguments[arguments.length - 1];

        if (!path.match(/.html$/)) 
            path += '.html';

        if (typeof cb !== 'function')
            cb = null;
        
        if (!parent || typeof parent === 'function')
            parent = document.body;

        var req = new XMLHttpRequest();

        req.open('GET', path, true);
        req.onload = function() {

            if (req.readyState === 4 && req.status === 200)
                parent.insertAdjacentHTML('beforeend', req.responseText);
            else
                throw new Error('http failed with status: '+ req.status + ', reason: ' + req.statusText);
          
            if (cb) cb();
        };

        req.send();
    };

    invoke.appendHTML = appendHTML;

    /**
     * Loads to DOM script from server.
     * 
     * @param  {String}   path
     * @param  {Function} cb   
     */
    function appendJS(path, parent, cb) {
        cb = arguments[arguments.length - 1];
        if (typeof cb !== 'function')
            cb = null;
        
        if (!parent || typeof parent === 'function')
            parent = document.body;

        if (path.lastIndexOf('.js') === -1)
            path += '.js';

        var script     = document.createElement('script');
        script.type    = 'text\/javascript';
        script.async   = true;
        script.onload  = function() { if (cb) cb() };
        script.onerror = function(err) {
            throw new URIError('the script ' + err.target.src + ' is not accessible.');
        };
        parent.appendChild(script);
        script.src = path;
    };

    invoke.appendJS = appendJS;

    // ========================================================================
    // XHR
    // ========================================================================

    /**
     * Submits GET request.
     * 
     * @param  {String}   route 
     * @param  {String}   data  JSON data (can be Object -- optional)
     * @param  {Function} cb    Passed [res] 
     */
    function get(route, data, cb) {

        if (arguments.length < 3) {
            cb   = data;
            data = '';
        } else {

            // enforce json format
            if (typeof data !== 'string')
                data = stringify(data);

            // encode data
            data = encodeURIComponent(data);
        }

        // init http request
        var http = new XMLHttpRequest();
        http.open('GET', route, true);

        // handle response
        http.onload = function () {

            // on success, propagate
            if (http.readyState === 4 && http.status === 200)
                cb(http.responseText);

            // on error, throw exception
            else if (Math.floor(http.status / 4) === 1)
                throw new Error('Request failed with ' + http.status);
            
        };

        // handle connection error
        http.onerror = function () {
            throw new Error('Request failed with ' + http.status);
        };

        // submit
        http.send();
    };

    /**
     * Submits POST request.
     *   
     * @param  {String}   route  
     * @param  {String}   data  JSON data (can be Object)
     * @param  {Function} cb    Passed [res]
     */
    function post(route, data, cb) {
        
        // init http request
        var http = new XMLHttpRequest();
        http.open('POST', route, true);

        // handle response
        http.onreadystatechange = function() {

            // on success, propagate
            if (http.readyState === 4 && http.status === 200)
                return cb(http.responseText);

            // on error, throw exception
            else if (Math.floor(http.status / 4) === 1)
                throw new Error('Request failed with ' + http.status);
        };

        // attach header data
        http.setRequestHeader('Content-Type', 'application/json');

        // enforce json format
        if (typeof data !== 'string')
            data = stringify(data);

        // attach data & submit
        http.send(data);
    };

    // ========================================================================
    // Channel services
    // ========================================================================

    /**
     * Connects to ws channel.
     * 
     * @param  {Function} cb (Optional)
     */
    function open() {

        if (connected)
            ws.close();

        var args = slice.call(arguments),
            cb   = typeof args[args.length - 1] === 'function' ? args.pop() : null;

        // flush callback registry
        callback = {};

        // init
        ws = new WebSocket(url);

        // on connection open
        ws.onopen = function() {
            connected = true;
            send('root', 'auth', args, function (proxyStencil) {
                createProxy(proxyStencil);
                if (cb) cb();
            });
        };

        // on connection closed
        ws.onclose = function() {
            connected = false;
        };

        // on received message
        ws.onmessage = function(e) {

            if (!e.data.length)
                return;

            // parse data
            var data = parse(e.data),
                resp = data[0],
                time = data[1],
                done = data[2];

            if (callback[time])
                callback[time].apply({
                    done: done === 1
                }, resp);

            if (done) delete callback[time];
        };
    };

    /**
     * Closes channel.
     * 
     * @return {[type]}
     */
    function close() {
        if (connected)
            ws.close();
    };

    /**
     * Sends RPC task call to channel.
     * 
     * @param  {String}   name
     * @param  {String}   task     
     * @param  {Array}    args     
     * @param  {Function} cb        
     */
    function send(namespace, task, args, cb) {

        // attempt to connect
        if (!connected) connect();

        // package data
        var time = performance.now(),
            data = stringify([namespace, task, args, time]);

        // cache callback
        callback[time] = cb;

        // send
        ws.send(data);
    };

    // ========================================================================
    // Proxy generation
    // ========================================================================
    
    /**
     * Generates proxy.
     * 
     * @param  {Object} stubKeys 
     * @return {Object}          
     */
    function createProxy(proxy) {

        // proxy
        var namespace,
            task;

        // for each module definition
        for (namespace in proxy) {
            for (task in proxy[namespace]) {
                proxy[namespace][task] = (function (namespace, task) {
                    return function () {

                        var args = slice.call(arguments),
                            cb   = typeof args[args.length - 1] === 'function' ? args.pop() : null;

                        send(namespace, task, args, cb);
                    };
                })(namespace, task);
            }
        }

        defineProperty(window, 'proxy', {
            value       : proxy,
            configurable: true
        });

        return proxy;
    };

    // ========================================================================
    // Exports
    // ========================================================================

    /**
     * Starts up RPC.
     * 
     * @param  {String}   config       
     * @param  {Function} onload
     * @return {Object}                RPC interface
     */
    return {

        // rpc
        get url()  { return url },
        set url(v) { url = v    },
        open: open,
        close: close,


        // amd
        declare: declare,
        invoke : invoke,

        // xhr
        get get() { return get },
        get post() { return post },
    };
})();
