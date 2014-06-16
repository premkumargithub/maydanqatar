var reloadable = require('../lib/util/reloadable');
var path = require('path');

module.exports = function(config, app){

	var follow = {
	  ar: reloadable.json(1000*60*15, path.join(__dirname, '../conf/follow/start_following_ar.js')),
	  en: reloadable.json(1000*60*15, path.join(__dirname, '../conf/follow/start_following_en.js'))
	};
	
	var terms_and_conditions = {
		ar: reloadable.text(1000*60*15, path.join(__dirname, '../conf/static/terms_ar.html')),
	  en: reloadable.text(1000*60*15, path.join(__dirname, '../conf/static/terms_en.html'))
	};

	app.get('/lang/:language/api/start/tags-to-follow/', function(req, res, next){
	  // could just use the language we're passed, but then we'd
	  // need some error handling... this way its either english or arabic.
	  if (req.params.language == 'en')
		  res.json(follow.en.get());
		else
		  res.json(follow.ar.get());
	});
	
	app.get('/lang/:language/api/terms-and-conditions/', function(req, res, next){
		if (req.params.language == 'en')
		  res.send(terms_and_conditions.en.get());
		else
		  res.send(terms_and_conditions.ar.get());
	});
	
};