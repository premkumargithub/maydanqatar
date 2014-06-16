module.exports = function(config){

	var
		util = require('util'),
		events = require('events'),
		_ = require('lodash'),
		mongoose = require('mongoose'),
		Core = require('./core')(config);

	var Ingest = function(){
		Core.call(this);
	}

	util.inherits(Ingest, Core);

	Ingest.prototype.init = function(opts){
		var that = this;
		this.once('before-ingest-ready', function(){
    	that.plugins.each(function(plugin){
    		if (plugin.initIngest) {
    			plugin.initIngest(that);
    		}
    	});
    });

		var that = this;
		this.__init(opts, function(){

			that.emit('starting-service', that.service);
      that.emit('initialising-service', that.service);

			that.service.init(this, function(err){
				if (err) {
					console.error("Unable to initialise the service for ingest", err);
				} else {

          that.emit('initialised-service', that.service);
					that.emit('started-service', that.service);

					var rb = require('rb')(config.rb);
					var actual = require('./ingest')(that, that.service, config, rb);

					// here we get to control which RB filters are consumed by supplying functions that
					// select which filters to use for what purpose.
					actual.init({
						shouldPublish: opts.shouldPublish,
						shouldUnpublish: opts.shouldUnpublish,
						mediaSource:opts.mediaSource
					}, console.error, function() {
						console.log('starting ingest...');
						actual.collectContinuously();
					});
				}
			});
		});
	};

	return Ingest;
};