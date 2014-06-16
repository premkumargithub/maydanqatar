/**
 * Base-class for applications that use newspad plugins to get work done.
 */

'use strict';

module.exports = function(config){

	var LANGUAGES = {
		'en': {
			name:'english',
			code:'en',
			dir:'ltr',
			ltr:true,
			rtl:false,
			en:true,
			ar:false
		},
		'ar': {
			name:'arabic',
			code:'ar',
			dir:'rtl',
			ltr:false,
			rtl:true,
			en:false,
			ar:true
		}
	};

	var
		util = require('util'),
		events = require('events'),
		async = require('async'),
		_ = require('lodash'),
		path = require('path'),
		mongoose = require('mongoose');

	// set the environment from the configuration, but before loading any
	// more of the modules, so that if they need to depend on the env during
	// setup they can do so ...
	process.env.NODE_ENV = config.app.mode;

	// The Core object _is_ an 'eventbus', and will emit lifecycle events for this
	// application for interested parties to react to.
	var Core = function(){

		events.EventEmitter.call(this);
    this.setMaxListeners(50);

		// monkey-patching the eventlistener functionality to allow listening to
		// events using a regular expression. Note that this is not going to
		// perform nearly as well as a direct string lookup, so use strings
		// where possible and regex only when necessary.
		var _add = this.addListener;
		var add = function(type, listener){
			if (arguments[0] instanceof RegExp) {
				if (!this.regexListeners)
					this.regexListeners = _([]);
				this.regexListeners.push({ type:type, listener:listener });
			} else {
				_add.apply(this, arguments);
			}
		};
		this.addListener = add;
		this.on = add;

		var _emit = this.emit;
		this.emit = function(){
			if (this.regexListeners) {
				var s = arguments[0].toString();
				var args = Array.prototype.slice.call(arguments);
				this.regexListeners.each(function(l){
					if (s.match(l.type))
						l.listener.apply(l.listener, args);
				});
			}
			_emit.apply(this, arguments);
		}
	}

	util.inherits(Core, events.EventEmitter);

	Core.prototype.__init = function(opts, callback){
		config = _.merge(config, opts);

		this.plugins = opts.plugins;
		this.prepareCore(config);		
		var that = this;

		this.initPlugins(config, this.service, function(){
			callback();
		});
	};

	Core.prototype.lang = function(twoLetterLanguageCode, defaultLanguageCode){
		if(!defaultLanguageCode) defaultLanguageCode = "ar";
		var result = LANGUAGES[twoLetterLanguageCode];
		return (result) ? result : LANGUAGES[defaultLanguageCode];
	};

	Core.prototype.prepareCore = function(config){
		this.connectMongoose();
  	this.createService();
	};

	Core.prototype.connectMongoose = function(){
		this.emit('connecting-mongoose');
		mongoose.connect(config.mongo);
		this.emit('connected-mongoose');
	};

	Core.prototype.createService = function(){
		this.emit('creating-service');
		this.service = require('./service')();
		this.emit('created-service', this.service);
	};

	Core.prototype.initPlugins = function(config, service, callback){
		var that = this;
		this.emit('initialising-plugins', this.plugins);
		var tasks = [];
		this.plugins.each(function(plugin){
			that.emit('initialising-plugin', plugin);
			tasks.push(function(done){
				var opts = {
					config: config,
					eventbus: that,
					service: service,
					mongoose: mongoose
				};
				var complete = function(err){
					console.log('initialised plugin: ' + plugin);
					that.emit('initialised-plugin', plugin);
					done(err);
				};
				if (plugin.initAsync) {
					// plugins that perform asynchronous tasks as part of their
					// initialisation and want the application startup to wait
					// for that initialisation to be completed should expose
					// an initAsync method instead of just init.
					plugin.initAsync(opts, complete);
				} else {
					plugin.init(opts);
					complete();
				}
			});
		});
		async.parallel(tasks, function(err){
			that.emit('initialised-plugins', that.plugins);
			callback(err);
		});
	};

	return Core;
};
