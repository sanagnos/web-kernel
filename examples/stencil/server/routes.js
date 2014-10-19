// ============================================================================
// server/routes.js
// ============================================================================
// 
// Collection of request routes.
// 
// Copyright (c) 2014, Stelios Anagnostopoulos (stelios@outlook.com)
// All rights reserved.
// ============================================================================

'use strict';

// ============================================================================
// Exports
// ============================================================================

module.exports = {
	'/foo': function (req, res) {
		var data = '';
		req.on('data', function (chunk) {
			data += chunk;
		});
		req.on('end', function () {
			res.end('bar, ' + JSON.parse(data).wat);
		});
	}
};