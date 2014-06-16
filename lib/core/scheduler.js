module.exports = function(config){

	var
		util = require('util'),
		_ = require('lodash'),
		Core = require('./core')(config);

	var Scheduler = function(){
		Core.call(this);
	};

	util.inherits(Scheduler, Core);
	
	Scheduler.prototype.init = function(opts){
		var that = this;

		this.__init(opts, function(){

			that.emit('starting-service', that.service);
      that.emit('initialising-service', that.service);

			that.service.init(this, function(err){
				if (err) {
					console.error("Unable to initialise the service", err);
				} else {

          that.emit('initialised-service', that.service);
					that.emit('started-service', that.service);
				}
			});
		});
	};

	Scheduler.prototype.schedule = function(opts){
	  this.on('started-service', function(service){
    	var that = this;
      _.each(opts.schedules, function(schedule){
        var done = function(err){
          if (err)
            console.log(err);
          that.emit('job-processed');
        };

        that.on('job-processed', function(){
          setTimeout(schedule.job, schedule.timeout, {
            service: service,
            config: config
          }, done);
        });

        setTimeout(schedule.job, schedule.timeout, {
          service: service,
          config: config
        }, done);
      });
    });

    var plugins = function(config, defs){
      return _(defs).map(function(plugin){
        return require(plugin)(config);
      });
    };
    this.init({ plugins: plugins(config, opts.plugins) });
	}

	return Scheduler;
};					