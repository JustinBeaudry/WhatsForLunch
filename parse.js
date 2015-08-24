'use strict';

var fs = require('fs');
var path = require('path');

// parse from --[]--, look for Content-Type: text/plain to avoid parsing HTML
// throw away everything else

var exitOnErr = function(err) {
	console.error(err);
	process.exit(1);
};

var CACHE = 'cache';

fs.exists(CACHE, function(err, exists) {
	if (err) exitOnErr(err);
	if (!exists) exitOnErr(new Error('run read.js first to populate cache'));

	fs.readdir(CACHE, function(err, files) {
		if (err) exitOnErr(err);
		if (!files || !Array.isArray(files) || files.length < 1) exitOnErr(new Error('No files in cache. run read.js'));


		files.forEach(function(file) {
			var buffer = '';
			fs.createReadStream(path.join(CACHE, file))
				.on('data', function(chunk) {
					buffer += chunk.toString('utf-8');
				});


		});
	});
});
