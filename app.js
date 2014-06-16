// NOTE: This file is used both to run apps during development AND as the source
// for generating the main app.js file for custom applications. This means that you
// need to be quite careful what you add to this file!

'use strict';

var
 	path = require('path'),
 	fs = require('fs'),
	cluster = require('cluster'),
	dateformat = require('dateformat'),
	_ = require('lodash'),
	config = require('./lib/util/config_loader')(__dirname);

if (cluster.isMaster){
 
	cluster.on('fork', function(worker){
		console.log('worker #%d with pid %d is starting', worker.id, worker.process.pid);
	});

	// restart workers that exit with a non-zero exit code
	cluster.on('exit', function(worker, code, signal){
		console.log('worker #%d with pid %d has died (%s), restarting... ',
			worker.id, worker.process.pid, signal || code);
		if ((code) && (code !== 0))
			cluster.fork();
	});

	cluster.on('disconnect', function(worker, code, signal){
		console.log('worker #%d with pid %d has disconnected', worker.id, worker.process.pid)
	});

	// always start at least one worker process, so that the master can restart
	// the worker if there is a crash due to unhandled exceptions
	var workers = (config.app.workers) ? config.app.workers : 1;
	for (var i=0; i<workers; i++) {
		cluster.fork();
	}

} else {
	var newspad = new (require('./lib/core/index')(__dirname, config).Newspad)();

	require('./lib/code_gen/auto_client_i18n.js')();
  require('./lib/code_gen/auto_client_config.js')(config);

	newspad.on('initialising-middleware', function(app){
		// add these routes early to trigger _before_ the session
		// is retrieved from MongoDB.
		require('./routes/images.js')(app, newspad.service);

		// generate a static json file containing i18n for each language
		// so that we can load it into the client browser for use from the
		// client side.
	});

	newspad.on('creating-express', function(express){
		express.static.mime.define({'text/javascript': ['jsx']});
	});

  newspad.on('initialising-middleware', function(app){
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header('Access-Control-Allow-Methods', 'GET, POST');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  });

  newspad.on('initialising-app-routes', function(app){
    app.noCache = function(res){
      res.setHeader('Last-Modified', dateformat(new Date(), "ddd, dd mmm yyyy HH:MM:ss Z"));
      res.setHeader('Cache-Control', 'max-age=0, no-cache, must-revalidate, proxy-revalidate');
    };

    app.doCache = function(res, age){
      res.setHeader('Last-Modified', dateformat(new Date(), "ddd, dd mmm yyyy HH:MM:ss Z"));
      res.setHeader('Cache-Control', 'max-age=' + age);
    }

    // prevent caching of api requests
    app.get('*/api/*', function(req, res, next){
      app.noCache(res);
      next();
    });
  });

	newspad.on('initialised-app-routes', function(app){
	  require('./lib/code_gen/auto_partials.js')(app);
	  require('./routes/common.js')(config, app, newspad.service);
	  require('./routes/register.js')(config, app);
		require('./routes/akhbari.js')(config, app, newspad.service);
		require('./routes/medani.js')(config, app, newspad.service);
		require('./routes/taghub.js')(config, app, newspad.service);
		require('./routes/search.js')(config, app, newspad.service);

		// do a one-time pre-processing job on the resources
		// to make it easier to deal with them on the client
		// (this is to test an alternative to css media queries
		// which suck @$$).
		require('./lib/code_gen/auto_client_resources.js')(app);
	});

	// in production mode we host 'glommed' files from the public-tmp directory
	// the definition of which files to glom together comes from ./conf/static_file_defs.js
	var static_files = {
		temp: path.join(__dirname, 'public-tmp'),
		root: __dirname
	}

	// in these modes we need to expose the generated (and then hand-modified)
	// css files in the public/css folder. This requires that we define the
	// set of files and how to bundle them using ./conf/static_file_defs.js
	if (config.app.mode === 'debug' || config.app.mode === 'production') {
		static_files.local = {
			root: __dirname,
		  files: require('./conf/static_file_defs.js')
		};
	}

	newspad.init({
		channel_defs: require('./conf/channel_defs')(),
		plugins: require('./conf/plugin_defs')(config),
		notification_defs: require('./conf/notification_defs')(),
		l10ns: {
			en: require('./conf/i18n/en'),
			ar: require('./conf/i18n/ar')
		},
		static_files: static_files
	});
}
