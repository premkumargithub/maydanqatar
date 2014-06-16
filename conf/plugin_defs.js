var _ = require('lodash');

module.exports = function(config){

	var defs = [
		'../lib/plugins/user/plugin',
		'../lib/plugins/comments/plugin',
 		'../lib/plugins/content/plugin',
 		'../lib/plugins/crowns/plugin',
 		'../lib/plugins/follow/plugin',
 		'../lib/plugins/hearts/plugin',
 		'../lib/plugins/auth/plugin',
 		'../lib/plugins/auth-local/plugin',
 		'../lib/plugins/auth-social/plugin',
 		'../lib/plugins/notification/plugin',
 		'../lib/plugins/share/plugin',
 		'../lib/plugins/messaging/plugin',
 		'../lib/plugins/imaging/plugin',
 		'mailing-async'
	];

	return _(defs).map(function(plugin_def){
		return require(plugin_def)(config);
	});
};
