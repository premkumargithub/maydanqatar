/**
 * New node file
 */
var _ = require('lodash');

module.exports = function(){
	
	var expressions = [
	           		{ opts : {  cfn:{scheme:'IPTC', id:'16001000'} } }
	           	];
	 
	var NotificationDef = function () {
		
	};
	
	NotificationDef.prototype.isNotificationItem = function(item) {
		return _(expressions).some(function(exp) {
			return _(item.cfns).some(function(c) {
				return (c.id === exp.opts.cfn.id) && (c.scheme === exp.opts.cfn.scheme);
			});
		});
	};
	
	NotificationDef.prototype.configFolder = function() {
		return __dirname;
	};
	
	return new NotificationDef();
};

