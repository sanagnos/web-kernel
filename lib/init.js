// ============================================================================
// init.js
// ============================================================================
// 
// Service initializer.
// 
// Copyright (c) 2014, Stelios Anagnostopoulos (stelios@outlook.com)
// All rights reserved.
// ============================================================================

'use strict';

// ============================================================================
// Imports
// ============================================================================

var server  = require('./server'),
	path    = require('path'),
    fs      = require('fs'),
	uglify  = require('uglify-js');

// ============================================================================
// Cache
// ============================================================================

var join    = path.join,
    sep     = path.sep,
    dirname = path.dirname,
    exists  = fs.existsSync,
    link    = fs.linkSync,
    unlink  = fs.unlinkSync,
    mkdir   = fs.mkdirSync,
    readdir = fs.readdir,
    write   = fs.writeFileSync,
    stat    = fs.stat,
	minify  = uglify.minify;

// ============================================================================
// Cache
// ============================================================================

var configKeys = [
	'port', 
	'requests', 
	'services', 
	'authServices', 
	'clientPath', 
	'publicPath', 
	'minifyClient'
];

// ============================================================================
// Initialization
// ============================================================================

function start (config, cb) {
	for (var key in config)
			if (configKeys.indexOf(key) === -1)
				throw new Error('missing required config value for: ' + key);

	buildClient(
		config.clientPath, 
		config.publicPath, 
		config.minifyClient,
		function () {
			server.auth = config.authServices;
			server.start(
				config.port, 
				config.publicPath, 
				config.requests, 
				config.services, 
				cb
			);
		}
	);
};

// ============================================================================
// Cache
// ============================================================================

function buildClient (source, target, min, cb) {
    if (!exists( join(source, 'client.js' )))
        link(
            join(__dirname, 'client.js'), 
            join(source, 'client.js')
        );

    if (!exists(target))
        mkdir(target);

    walk(target, function (file, done) {
        unlink(file);
        done();
    }, function () {
        walk(source, function (file, done) {
            var sfile, tfile;
            sfile = file;
            tfile = join(target, file.replace(source, ''));
            var dirs = dirname(tfile).split(sep),
                dir  = '.';
            while (dirs.length) {
                dir = join(dir, dirs.shift());
                if (!exists(dir))
                    mkdir(dir);
            }

            if (exists(tfile))
                unlink(tfile);
            if (min && tfile.lastIndexOf('.js') === tfile.length - 3)
                write(tfile, minify(file).code, 'utf8');
            else
                link(sfile, tfile);
            done();
        }, function () {
            cb();
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
 * Walks one or multiple directories, iterating on each file path.
 * 
 * @param  {Number}   dir
 * @param  {Function} iter
 * @param  {Function} cb
 */
function walk(dir, iter, cb) {
    if (dir instanceof Array)
        return each(dir, function (dname, done) {
            walk(dname, iter, done);
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
                    iter(file, function () {
                        if (!--pending)
                            cb();
                    });
                }
            });
        });
    });
};

// ============================================================================
// Exports
// ============================================================================

module.exports = start;