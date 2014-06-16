'use strict';

module.exports = function(dir, config){

	var
		util = require('util'),
		events = require('events'),
		async = require('async'),
		_ = require('lodash'),
		path = require('path'),
		http = require('http'),
		kv = require('./local_utils'),
		mongoose = require('mongoose'),
		express = require('express'),
		slashes = require('connect-slashes'),
		dateformat = require('dateformat'),
		SessionStore = require('express-sessions'),
		Core = require('./core')(config);

	var Newspad = function(){
		Core.call(this);
	}

	util.inherits(Newspad, Core);

	Newspad.prototype.init = function(opts){
		var that = this;
		this.__init(opts, function(err){
			if (err) {
      	throw err;
			} else {
				that.createApp();
				that.initI18n(config.l10ns);
				that.initTemplates(that.app);
				that.initThirdPartyJs(that.app);
				that.initApp(that.app);
				that.initPreRoutingMiddleware(that.app, config);
				that.initRouting(that.app);
				that.initPostRoutingMiddleware(that.app, config);
				that.start(that.service);
			}
		});
	};

	Newspad.prototype.createApp = function(){
		this.emit('creating-express', express);
		this.app = express();
		this.emit('created-express', this.app);
	};

	Newspad.prototype.initI18n = function(l10ns){
		this.emit('preparing-app-i18n');
		this.i18n = require('./i18n')();
		// initialise application specific i18n. The application can override plugin
		// i18n values by providing its own with the same property path.
		this.i18n.accept({
			en: kv.mergeMissing(l10ns.en, l10ns.ar),
			ar: kv.mergeMissing(l10ns.ar, l10ns.en)
		});
		this.emit('prepared-app-i18n', this.i18n);
		this.emit('merging-i18n-contributions');
		var that = this;
		this.plugins.each(function(plugin){
			if (plugin.i18n) {
				that.i18n.accept({
					en: kv.mergeMissing(plugin.i18n.en, plugin.i18n.ar),
					ar: kv.mergeMissing(plugin.i18n.ar, plugin.i18n.en)
				});
			}
		});
		this.emit('merged-i18n-contributions')
	};

	Newspad.prototype.initTemplates = function(app){
	  var loader = require('plugins')(app);
		this.plugins.each(function(plugin){
  		if (plugin.templates)
				loader.accept(plugin.templates);
  	});
	};

	Newspad.prototype.initThirdPartyJs = function(app){
		var result = [];
		this.plugins.each(function(plugin){
			if (plugin.external_js) {
				_(plugin.external_js).each(function(entry){
					result.push(entry);
				});
			}
		});
		app.locals.thirdpartyjs = result;
	}

	Newspad.prototype.initApp = function(app){
		this.emit('configuring-express', app);
		app.set('port', config.app.port || process.env.PORT || 3000);
		app.set('views', dir + '/views');
		app.set('view engine', 'hjs');
		app.engine('hjs', require('modular-hogan')(app));
		this.initAppLocals(app);
		this.emit('configured-express', app);
	};

	Newspad.prototype.initAppLocals = function(app){
		app.locals.config = config;
		app.locals.partials = app.partials;

		// make mode accessable to templates
		app.locals.production = config.app.mode === 'production';
		app.locals.debug = config.app.mode === 'debug';
		app.locals.development = config.app.mode === 'development';

		app.locals.dateformat = function(property) {
			return dateformat(this[property], config.app.date_format);
		};

		app.locals.urlencode = function(text) {
			return encodeURIComponent(this[text]);
		};

		app.locals.partial = function(text) {
			return '{{> '+this[text]+'}}';
		};
	};

	Newspad.prototype.initPreRoutingMiddleware = function(app, opts){
		this.emit('initialising-middleware', app);
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.compress());

    // serve static files before cookie-parser gets a look-in and
    // therefore before the mongo session is available
		this.initStaticFiles(app, opts.static_files);

		app.use(express.cookieParser(config.app.secret));
		app.use(express.bodyParser());
		app.use(express.methodOverride());

		// configure mongodb persistent sessions for all requests on the domain.
		app.use(express.session({
			secret:config.app.secret,
			cookie:{
				maxAge: config.app.session_timeout*1000,
				domain: config.domain
			},
			store: new SessionStore({
				storage: 'mongodb',
				instance: mongoose,
				collection: 'sessions',
				expire: config.app.session_timeout
			})
		}));
	};

	// expected opts:
	//  'local': a json object containing:
	//     'path': to a root dir to which the defs are relative, e.g. path: path.join(__dirname, 'public'),
	//     'def': a json object that defines the bundles of static files to export, e.g. def: require('./conf/static_file_defs')
	//  'temp': path to the directory in which the bundles should be generated,
	//  'root': path to the
	Newspad.prototype.initStaticFiles = function(app, opts) {
		// collects static-file contributions from plugins, merges them with static
		// files from this host project, minifies and collects them into compound files
		// that can be served with as few http requests as possible, and sets up a
		// 'middleware' to serve them.
		var that = this;

		require('statics')({
			plugins: that.plugins,
			local: opts.local,
			temp: opts.temp,
			app: app,
			root: opts.root,
			publish: express.static
		});

		// the statics module produces new/temporary files in the public-tmp directory,
		// so we need express to host it for us.
		app.use(express.static(opts.temp));

		// expose directories containing static assets, setting max-age to 7 days
		var params = (config.app.mode === 'production') ? { maxAge:604800000 } : {};

 		app.use(express.static(path.join(dir, '/public'), params));
	};

	Newspad.prototype.initRouting = function(app){
		var that = this;

		this.emit('configuring-router', app);
    app.use(app.router);
		this.emit('configured-router', app);

		app.all('/lang/:language/*', function(req, res, next){
			res.locals.language = that.lang(req.params.language, config.app.defaultLanguage);
			next();
		});

		this.emit('initialising-app-routes', app);

		app.all('*', function(req, res, next){
			if (!res.locals.language)
				res.locals.language = that.lang(config.app.defaultLanguage);

			res.locals.i18n = that.i18n.get(res.locals.language.code);
			
			res.locals.errorMessage = function() {
			    var code = this['code'];
        	    var props = code.split('.');
        	    var message = res.locals.i18n;
                for(var i = 0; i < props.length; i++){
                    message = message[props[i]];
                }
                if( typeof message === 'string')
        	        return message;
        	    return this['message'];
        	};

			that.plugins.each(function(plugin){
				if(plugin.contributeLocals)
					plugin.contributeLocals(res.locals, req.user);
			});

			res.locals.debugCurrentContext = function() {
				console.log(JSON.stringify(this));
			};

			next();
		});

		// only add the channel routing if there are channels defined.
		if ((config.channel_defs) && (config.channel_defs.length > 0)) {
			app.all('/lang/:language/channels/:channel/*', function(req, res, next){
					res.locals.menu_selection = {
							menu: 'channels',
							selection: req.params.channel
					};
					res.locals.isSelectedChannel = function(text) {
					if (this[text] === req.params.channel) {
						return "selected";
					}
					return "";
				};
				next();
			});
		}

		this.emit('initialised-app-routes', app);
	};

	Newspad.prototype.initPostRoutingMiddleware = function(app, opts){
		// redirect paths without trailing slash to paths with
		app.use(slashes());

		// only non-production modes should dump exceptions and show stack
		if ('production' !== config.app.mode) {
			app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
		} else {
			app.use(express.errorHandler());
		}

		this.emit('initialised-middleware');
	};

	Newspad.prototype.start = function(){
		this.emit('starting-service', this.service);
		this.emit('initialising-service', this.service);
		var that = this;
		this.service.init(this, function(err){
			if (err) {
				console.error("Unable to initialise the service", err);
			} else {
				that.emit('initialised-service', that.service);
				that.emit('initialising-web-server', that.app, that.service);

				// we're ready, fire up the web-server
				http.createServer(that.app).listen(that.app.get('port'), function(){
					console.log('Express server listening on port ' + that.app.get('port'));
				});

				that.emit('initialised-web-server', that.app, that.service);
				that.emit('started-service', that.app, that.service);
				that.emit('ready', that);
			}
		});
	};

	return Newspad;
};
