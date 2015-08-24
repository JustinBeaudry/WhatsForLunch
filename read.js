#!/usr/local/bin/node
'use strict';

var Imap = require('imap');
var config = require('./config.json');
var fs = require('fs');
var imap = new Imap(config);

var exitOnErr = function(err) {
	console.error(err);
  process.exit(1);
};

imap.once('ready', function() {
	console.info('Server Ready! Fetching inbox.');
	imap.openBox('INBOX', true, function(err, box) {
		if (err) exitOnErr(err);

		console.info('You have ' + box.messages.total + ' messages in your INBOX');

		imap.search(['ALL', ['SUBJECT', 'PRODUCTION THIS WEEK']], function(err, results) {
			if (err) exitOnErr(err);

			if (results.length < 1) {
				console.log('No seen or unseen messages from ' + config.email);
				imap.end();
			}

      var f = imap.fetch(results, {
        bodies: 'TEXT'
      });

      f.on('message', function(msg, msgNum) {

        console.log('Message #%d', msgNum);
        var prefix = '(#' + msgNum + ') ';

        msg.on('body', function(stream) {
          console.info(prefix, 'Body');
					stream.pipe(fs.createWriteStream('cache/msg-' + msgNum + '-body.txt'))
        });

        msg.once('end', function() {
          console.log(prefix + 'Finished');
        });

      });

			f.once('error', function(err) {
				console.error('Fetch error: ' + err);
			});

			f.once('end', function() {
				console.log('Done fetching all messages!');
				process.exit(0);
				imap.end();
			});
		});
	});
});

imap.once('error', exitOnErr);

imap.once('end', function() {
	console.log('Connection ended');
});

imap.connect();
