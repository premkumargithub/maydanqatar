module.exports = function(config) {

	var fs = require('fs');
	var path = require('path');
	var _ = require('lodash');

	var app = path.join(__dirname, '../../');

	var public_config = path.join(__dirname, '../../public/js/_gen/');

	var appConfig = {};
	appConfig.paging = {
	  size: (config.app.pageSize) ? config.app.pageSize : 25,
	  limit: (config.app.scrollLimit) ? config.app.scrollLimit : 200
	};
	appConfig.urls = config.urls;
	appConfig.media = config.media;
	appConfig.feedback = config.mailing.feedback;
	appConfig.tour_video_url = config.tour_video_url;
	
	appConfig.social = {};
	appConfig.social.providers = _.map(config.social, function(social){
		return {name:social.name};
	});
	
	var json = "// THIS FILE IS GENERATED, DO NOT MODIFY IT DIRECTLY!\r\n";
	json += "var config=" + JSON.stringify(appConfig) + ";";
	fs.writeFileSync(path.join(public_config, 'config.js'), json);
	
	console.log('exported config');
};