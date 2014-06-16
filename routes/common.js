module.exports = function(config, app, service){

	// don't redirect - expensive network round-trip on mobiles!
	app.get('/', function(req, res, next){
	  res.render('templates/index');
	});

	app.get('/lang/:language/', function(req, res, next){
		res.render('templates/index');
	});

	var loadArticle = function(req, res){
		service.loadArticle({
			id: req.params.id
		}, function(err, code, result){
			if (err) {
				console.log(err);
				res.send(500);
			} else {
				res.send(200, result);
			}
		});
	};

	app.get('/lang/:language/api/articles/:id', function(req, res, next){
	  app.doCache(res, 300); // allow caching for 5 mins
		loadArticle(req, res);
	});

	app.get('/lang/:language/api/events/:id', function(req, res, next){
	  app.doCache(res, 300); // allow caching for 5 mins
		loadArticle(req, res);
	});
	
	app.get('/lang/:language/api/recommended-articles/:id/', function(req, res, next){
	  app.doCache(res, 300); // allow caching for 5 mins
		loadRecommendedArticles(req, res);
	});

	app.get('/map/:lat/:lon/:label/', function(req, res, next){
	  res.render('templates/map', {
	    lat: req.params.lat,
	    lon: req.params.lon,
	    label: req.params.label
	  });
	});

	app.get('/video/:url/:img/', function(req, res, next){
    res.render('templates/video', {
      url: req.params.url,
      img: req.params.img
    });
  });

  app.get('/video/:url/:img/:aspectw/:aspecth/', function(req, res, next){
    res.render('templates/video', {
      url: req.params.url,
      img: req.params.img,
      aspectw: req.params.aspectw,
      aspecth: req.params.aspecth,
    });
  });

// TODO: remove non-routing code from routes files!

  app.ensureQueryRange = function(params) {
    var start = (params.start) ? parseInt(params.start, 10)-1 : 0;
    var end = (params.end) ? parseInt(params.end, 10) : (start + config.app.pageSize);
    return {
      start: start,
      end: end,
      size: end-start
    };
  };

	var loadRecommendedArticles = function(req, res){
		service.loadArticle({
			id: req.params.id
		}, function(err, code, article){
			if (err) {
				console.log(err);
				res.send(500);
			} else {
				var related_ids = [];
				if( article.related_news ){
				  for( var i=0; i<article.related_news.length; i++){
					  related_ids.push(article.related_news[i].id);
				  }
				}
				var query = {
					'query': {
					  'terms' : {
						  'id' : related_ids
					  }
					}
				};
				service.loadArticles({query:query}, function(error, errorCode, recommended){
					if( error ) {
						console.log(error);
						res.send(500);
					} else {
						res.send(200,recommended);
					}
				});
			}
		});
	};

}