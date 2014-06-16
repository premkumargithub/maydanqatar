module.exports = function(config, app, service) {

  var _ = require('lodash');

  var akhbari = function(req, res){
    if (req.user){
      personalisedAkhbari(req, res);
    } else {
      defaultAkhbari(req, res);
    }
  }

  // todo: another good candidate for caching - at least the first batch
  //       (when query range is not specified)
	var defaultAkhbari = function(req, res){
    service.loadArticles({
      query: config.queries.akhbari[res.locals.language.code],
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

  // not cacheable
	var personalisedAkhbari = function(req, res){
	  var tags = [];
	  _(req.user.follows).each(function(tag){
	    var term = { term:{} };
	    term.term["tags." + tag.scheme + ".id"] = tag.tagId;
	  	tags.push(term);
	  });

	  if (tags.length > 0) {
	    service.loadArticles({
        query: {
          query: {
            bool: {
              must: [{
                term: {
                  lang: res.locals.language.code
                }
              }],
              should: tags,
              minimum_should_match : 1
            }
          },
          sort: {
            published: {
              order: 'desc'
            }
          }
        },
        range: app.ensureQueryRange(req.params)
      }, function(err, code, result){
        if (err) {
          console.log(err);
          res.send(500);
        } else {
          res.send(200, result);
        }
      });
	  } else {
	    defaultAkhbari(req, res);
	  }
  };

	app.get('/lang/:language/api/akhbari/', function(req, res, next){
    akhbari(req, res);
	});

  app.get('/lang/:language/api/akhbari/:start-:end/', function(req, res, next){
		akhbari(req, res);
	});

}