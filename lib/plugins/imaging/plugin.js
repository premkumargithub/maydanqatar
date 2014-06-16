module.exports = function(config) {

  var util = require('util');
  var path = require('path');
  var _ = require('lodash');

	var ImagingPlugin = function(){
  	this.static_files = {
			root: __dirname,
			files: {
				js: {},
				css: {}
			}
		};
    this.templates = path.join(__dirname, 'views');
  };

  ImagingPlugin.prototype.init = function(opts) {
		var that = this;

    opts.eventbus.once('initialising-service', function(service){
    	service.imageManager = require('./lib/imaging')(service);
  	});
  };

  ImagingPlugin.prototype.toString = function() {
		return "mq-imaging";
	};

  return new ImagingPlugin();
};