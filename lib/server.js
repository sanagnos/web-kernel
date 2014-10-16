// ============================================================================
// server.js
// ============================================================================
// 
// Http & WebSocket server.
// 
// Copyright (c) 2014, Stelios Anagnostopoulos (stelios@outlook.com)
// All rights reserved.
// ============================================================================

'use strict';

// ============================================================================
// Imports
// ============================================================================

var http            = require('http'),
    path            = require('path'),
    fs              = require('fs'),
    WebSocketServer = require('ws').Server;

// ============================================================================
// Cache
// ============================================================================

var stringify        = JSON.stringify,
    parse            = JSON.parse,
    slice            = Array.prototype.slice,
    join             = path.join,
    sep              = path.sep,
    readdir          = fs.readdirSync,
    lstat            = fs.lstatSync,
    createReadStream = fs.createReadStream,
    readdir          = fs.readdir,
    stat             = fs.stat;

// ============================================================================
// Core
// ============================================================================

var auth = function (usr, pwd, cb) {
    this.usr = usr;
    this.pwd = pwd;
    arguments[arguments.length - 1]()
};

/**
 * Starts service. 
 * 
 * @param  {Number} port
 * @param  {Array}  pub  Public dir(s)
 * @param  {Object} req  Map of route -> req handler
 * @param  {Object} rpc  Map of namespace -> { tasks }
 */
function start(port, pub, req, rpc, cb) {

    if (arguments.length === 1) {
        rpc  = port.rpc;
        req  = port.req;
        pub  = port.pub;
        port = port.port;
    }

    // load req modules
    var xhr = {};
    for (var i = 0, len = req.length, url, mod, key; i < len; i++) {
        url = req[i];

        if (typeof url === 'object') {
            for (key in url)
                xhr[key] = url[key];
            continue;
        }

        if (url.indexOf('.js') === -1)
            url += '.js';

        if (lstat(url).isDirectory()) {
            readdir(url).map(function(name) {
                mod = require( join(url, name) ); 
                for (key in mod)
                    xhr[key] = mod[key];
            });
        } else {
            mod = require(url);
            for (key in mod)
                xhr[key] = mod[key];
        }
    }

    // walk public directories to register files as requests
    walk(pub, function (file) {
        var ctype;
        if (file.lastIndexOf('.js') === file.length - 3)
            ctype = 'script/javascript';
        else if (file.lastIndexOf('.html') === file.length - 5)
            ctype = 'text/html';
        else if (file.lastIndexOf('.json') === file.length - 5)
            ctype = 'application/json';
        else if (file.lastIndexOf('.json') === file.length - 5)
            ctype = 'text';
        else if (file.lastIndexOf('.css') === file.length - 4)
            ctype = 'text/css';
        else 
            ctype = 'text/plain';
        var key  = file,
            plen = pub.length;

        while (plen--)
            key = key.replace(pub[plen], '');
        key = key.replace(/\\/g, '/');
        xhr[key] = function (req, res) {
            res.setHeader('Content-Type', ctype);
            createReadStream(file).pipe(res);
        };
    }, function () {

        // init http server & register requests
        var server = http.createServer(function (req, res) {
            if (xhr[req.url])
                xhr[req.url](req, res);
        }).listen(port || process.env.PORT, cb);

        // load rpc services
        var svc = {};
        for (var i = 0, len = rpc.length, url, mod; i < len; i++) {
            url = rpc[i];

            if (typeof url === 'object') {
                for (key in url)
                    svc[key] = url[key];
                continue;
            }

            if (url.indexOf('.js') === -1)
                url += '.js';

            if (lstat(url).isDirectory()) {
                readdir(url).map(function(name) {
                    mod = require( join(url, '/' + name) ); 
                    svc[mod.namespace] = mod;
                });
            } else {
                mod = require(url);
                svc[mod.namespace] = mod;
            }
        }

        // generate public stub & proxy
        var pubstub  = {},
            pubproxy = {},
            namespace, pkey;
        for (namespace in svc) {
            if (!svc[namespace].perms || !svc[namespace].perms.length)  {
                pubstub[namespace]  = typeof svc[namespace] === 'function' ? svc[namespace]() : svc[namespace];
                pubproxy[namespace] = {};
                for (pkey in pubstub[namespace])
                    if (pkey !== 'perms')
                        pubproxy[namespace][pkey] = 1;
            }
        }

        // setup websocket server
        var wss = new WebSocketServer({ server: server });
        wss.on('connection', function (conn) {

            var stub  = pubstub,
                proxy = pubproxy,
                cache = {};

            conn.on('message', function (msg) {

                // parse data
                var data = parse(msg);
                if (data.length !== 4)
                    return conn.send(0);
                var namespace = data[0],
                    task      = data[1],
                    args      = data[2],
                    time      = data[3];

                // handle close
                if (namespace === 'root') {
                    if (task === 'close')
                        return conn.close();

                    // handle auth
                    else if (task === 'auth')
                        return auth.apply(cache, args.concat(function (perms) {

                            if (!perms) perms = [];

                            var pidx,
                                pkey;
                            for (var namespace in svc) {
                                pidx = perms.length;
                                while (pidx--)
                                    if (svc[namespace].perms && svc[namespace].perms.indexOf(perms[pidx]) >= 0) {
                                        stub[namespace]  = typeof svc[namespace] === 'function' ? svc[namespace]() : svc[namespace];
                                        proxy[namespace] = {};
                                        for (pkey in stub[namespace])
                                            if (pkey !== 'perms')
                                                proxy[namespace][pkey] = 1;
                                    }
                            }

                            conn.send(stringify([[proxy], time]));
                        }));
                }

                // fetch service task from stub
                if (!stub[namespace] || !stub[namespace][task])
                    return conn.send(0);

                var res = {
                    send: function () {
                        conn.send(stringify([
                            slice.call(arguments),
                            time
                        ]));
                    },

                    done: function () {
                        conn.send(stringify([
                            slice.call(arguments),
                            time,
                            1
                        ]));
                    }
                };

                // delegate to task
                stub[namespace][task].apply(cache, args.concat(res));
            });
        });
    });
};

// ============================================================================
// Internal
// ============================================================================

/**
 * Applies async task to items & propagates to cb when done.
 * 
 * @param  {Function} task  
 * @param  {Array}    items (Can be non-array/single item)
 * @param  {Function} cb    Passed array of res for each item applied to task
 */
function each(items, task, cb) { // adapted from https://github.com/caolan/async

    if (!Array.isArray(items))
        items = [items];

    var idx = 0,
        len = items.length,
        res = [];

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
 * Walks one or multiple directories, iterating on each file path synchronously.
 * 
 * @param  {Number}   dir
 * @param  {Function} iter
 * @param  {Function} cb
 */
function walk(dir, iter, cb) {
    if (dir instanceof Array)
        return each(dir, function (dname, done) {
            walk(dname, iter);
            done();
        }, function () {
            cb();
        });

    readdir(dir, function(err, list) {
        if (err) throw err;
        
        var pending = list.length;
        if (!pending) 
            return cb();
        
        list.forEach(function (file) {
            file = join(dir, file);
            
            stat(file, function (err, stat) {
                if (err) throw err;

                if (stat && stat.isDirectory()) {
                    walk(file, iter, function () {
                        if (!--pending)
                            cb();
                    });
                } else {
                    iter(file);
                    if (!--pending)
                        cb();
                }
            });
        });
    });
};

// ============================================================================
// Exports
// ============================================================================

module.exports = {
    start: start,

    get auth()   { return auth },
    set auth(fn) { auth = fn   }
};
