module.exports = function(config) {
  
	var Service = function(){};

	Service.prototype.init = function(newspad, callback) {
		// nothing really to do here any more - this object is just a central
		// location for plugins to place objects and functionality.

		callback();
	};

	return new Service();
};
