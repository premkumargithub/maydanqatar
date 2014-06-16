
var path = require('path');
var fs = require('fs');

module.exports = function(config) {

  var NotificationPlugin = function(){
  };

	var createConfig = function(config){
		
		var _config = config.notification.production;
		var isDevelopmentMode = config.app.mode && config.app.mode == "development";
		if (isDevelopmentMode) {
			_config = config.notification.development;
		}
		_config.name = config.notification.name;
		_config.isDevelopmentMode = isDevelopmentMode;
		_config.notification_defs = config.notification_defs;
		
		var originalPfx = _config.ios.server.pfx;
		_config.ios.server.pfx = path.join(config.notification_defs.configFolder(),originalPfx);
		var pfx = _config.ios.server.pfx;
		fs.exists(pfx , function (exists) {
			if (!exists) {
				console.log("iOS certificate does not exist at:" + pfx);
			}
		});
		
		return _config;
	};

  NotificationPlugin.prototype.init = function(opts) {

    var config = createConfig(opts.config);

		opts.service.deviceToken = require('./lib/notification')(opts.mongoose);
		var handler = require('./lib/handler')(config, opts.service.deviceToken);

		opts.eventbus.on('after_index', function(payload){
			if (config.notification_defs.isNotificationItem(payload.item))  {
				handler.sendMsg(payload.item.title, function(result) {
					console.log(result);
				});
			}
		});

		opts.eventbus.once('initialised-web-server', function(app, service){
			require('./routes/notification_api')(config, app, service, handler);
		});
  };
  
  NotificationPlugin.prototype.toString = function() {
	   return "notification"; 
  };

  return new NotificationPlugin();
};
