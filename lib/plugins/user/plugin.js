module.exports = function(config) {

  var util = require('util');
  var path = require('path');
  var _ = require('lodash');

	var UserPlugin = function(){
  	this.static_files = {
			root: __dirname,
			files: {
				js: {},
				css: {}
			}
		};
    this.templates = path.join(__dirname, 'views');
  };

  UserPlugin.prototype.init = function(opts) {
		var that = this;

		opts.eventbus.on('initialised-plugins', function(plugins){
			opts.eventbus.emit('preparing-user-accounts');
			opts.service.User = require('./lib/user')(opts.eventbus, opts.mongoose);
			opts.eventbus.emit('prepared-user-accounts', opts.service.User);
		});

		opts.eventbus.on('initialising-app-routes', function(app){
    	app.all('*', function(req, res, next){
    		if (req.user)
    			res.locals.user = opts.service.User.loadUserProfile(req.user);
    		next();
    	});
    });
    
    opts.eventbus.once('initialised-web-server', function(app, service){
    	
    	var avatarDir = config.resources ? config.resources.avatars : null;
    	var systemAvatars = require('./lib/avatar')(avatarDir, service.imageManager);
    	
  		require('./routes/profile')(app, service, config.filesystem.temp, systemAvatars);
  	});
  };

  UserPlugin.prototype.toString = function() {
		return "mq-user";
	};

  return new UserPlugin();
};