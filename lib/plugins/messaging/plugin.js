module.exports = function(config) {

  var util = require('util');
  var path = require('path');
  var _ = require('lodash');

var MessagePlugin = function() {
  };
	
  MessagePlugin.prototype.init = function(opts) {
		
    opts.eventbus.once('initialised-service', function(service) {
       message = require("./lib/messaging")(opts.mongoose, service.User);
       service.message = message;
    });

	   opts.eventbus.once('initialised-web-server', function(app, service) {
  	 	require('./routes/messaging')(app, service);
  	 });
  };

  MessagePlugin.prototype.toString = function() {
		return "mq-user-message";
	};

  return new MessagePlugin();
};