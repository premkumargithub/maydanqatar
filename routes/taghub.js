module.exports = function(config, app, service) {

	var load = function(req, res){
	  var query = {
      query: {
        bool: {
          must: [{
            term: {
              lang: res.locals.language.code
            }
          }]
        }
      },
      sort: {
        published: {
          order: 'desc'
        }
      }
    };

    var tag_term = {
      term: {}
    };
    if (req.params.scheme === 'venue'){
      tag_term.term["venue.id"] = req.params.tag;
    } else {
      tag_term.term["tags." + req.params.scheme + ".id"] = req.params.tag;
    }
    query.query.bool.must.push(tag_term);

		service.loadArticles({
		  query: query,
			range: app.ensureQueryRange(req.params)
		}, function(err, code, result){
			if (err) {
				console.log(err);
				res.send(500);
			} else {
				res.send(200, result);
			}
		});
	};

	app.get('/lang/:language/api/tags/:scheme/:tag/content/', function(req, res, next){
		load(req, res);
	});

  app.get('/lang/:language/api/tags/:scheme/:tag/content/:start-:end/', function(req, res, next){
		load(req, res);
	});

}