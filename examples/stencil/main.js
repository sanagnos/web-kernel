// ============================================================================
// main.js
// ============================================================================
// 
// Starts example server.
// 
// Copyright (c) 2014, Stelios Anagnostopoulos (stelios@outlook.com)
// All rights reserved.
// ============================================================================

'use strict';

// ============================================================================
// Imports
// ============================================================================

var initKernel = require('../../init'),
	join       = require('path').join;

// ============================================================================
// Main
// ============================================================================

initKernel({

	// http connection port
	port: 80,

	// http request registration
	requests: [
		
		// routing module with a collection of xhr routes
		absPath('./server/routes'),

		// direct definitions
		{
			// redirect '/' to '/index.html'
		    '/' : function (req, res) {
		        res.writeHead(301, {
		            'location': '/index.html'
		        });
		        res.end();
		    }
		}
	],

	// rpc module registration
	services: [
		absPath('./server/calc-basic'),
		absPath('./server/calc-pro')
	],

	// authentication task
	authServices: function (usr, pwd, cb) {
	    cb = arguments[arguments.length - 1];
	    if (usr === 'dogge')
	        cb(['subscriber']);
	    else
	        cb([]);
	},

	// client build settings
	clientPath  : absPath('./client'),
	publicPath  : absPath('./public'),
	minifyClient: true

}, function () {
	console.log('server running');
});

// ============================================================================
// Internal
// ============================================================================

function absPath (path) { return join(__dirname, path) };
