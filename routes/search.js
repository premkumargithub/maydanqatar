module.exports = function(config, app, service) {

  app.get('/lang/:language/api/combo-search/:q/', function(req, res, next){
    comboSearch(req, res);
  });

  app.get('/lang/combo-search/:q/', function(req, res, next){
    comboSearch(req, res);
  });

  app.get('/lang/:language/api/search/:type/:q/:start-:end/', function(req, res, next){
    simpleSearch(req, res);
  });

  app.get('/lang/:language/api/search/:type/:q/', function(req, res, next){
    simpleSearch(req, res);
  });

  app.get('/api/search/:type/:q/:start-:end/', function(req, res, next){
    simpleSearch(req, res);
  });

  app.get('/api/search/:type/:q/', function(req, res, next){
    simpleSearch(req, res);
  });

  var _ = require('lodash');
  var async = require('async');

  var scoreComparator = function(a, b){
    return b.score - a.score;
  }

  var incrementScore = function(from, tag){
    if (!from[tag.id]) {
      return {
        tag: tag,
        score: 1
      };
    }
    var result = from[tag.id];
    result.score++;
    return result;
  }

  var collectTags = function(into, from){
    _.each(from, function(doc){
      _.each(doc['tags.special'], function(tag){
        into.special[tag.id] = incrementScore(into.special, tag);
      });
      _.each(doc['tags.source'], function(tag){
        if (tag.id) { // stupid source tag with no id or label!
          into.source[tag.id] = incrementScore(into.source, tag);
        }
      });
      _.each(doc['tags.topic'], function(tag){
        into.topic[tag.id] = incrementScore(into.topic, tag);
      });
    });
    return into;
  }

  var organiseTags = function(tags){
    tags.special = _.map(tags.special, function(tag){
      return tag;
    }).sort(scoreComparator);
    tags.special = _.map(tags.special, function(tag){
      return tag.tag;
    });
    tags.source = _.map(tags.source, function(tag){
      return tag;
    }).sort(scoreComparator);
    tags.source = _.map(tags.source, function(tag){
      return tag.tag;
    });
    tags.topic = _.map(tags.topic, function(tag){
      return tag;
    }).sort(scoreComparator);
    tags.topic = _.map(tags.topic, function(tag){
      return tag.tag;
    });
    return tags;
  }

  var comboSearch = function(req, res){
    async.parallel({
      articles: function(callback){
        search({
          lang: res.locals.language.code,
          query: req.params.q,
          type: 'article',
          range: {
            start:0,
            size:5
          },
          sort: {
            published: {
              order: 'desc'
            }
          }
        }, callback);
      },
      events: function(callback){
        search({
          lang: res.locals.language.code,
          query: req.params.q,
          type: 'event',
          range: {
            start:0,
            size:5
          },
          sort: {
            published: {
              order: 'desc'
            }
          }
        }, callback);
      }
    }, function(err, results){
      if (err) {
        console.log(err);
        res.send(500);
      } else {
        var tags = collectTags({
          special:{},
          source:{},
          topic:{}
        }, results.articles.results);
        tags = collectTags(tags, results.events.results);
        tags = organiseTags(tags);
        res.send(200, {
          tags: tags,
          articles: results.articles,
          events: results.events
        });
      }
    });
  }

  var simpleSearch = function(req, res){
    search({
      lang: res.locals.language.code,
      query: req.params.q,
      type: req.params.type,
      range: app.ensureQueryRange(req.params)
    }, function(err, result){
      if (err) {
        res.send(500);
      } else {
        res.send(200, result);
      }
    });
  }

	var search = function(opts, callback){
	  var q = {
      query:{
        bool:{
          must:[{
            term:{
              lang: opts.lang
            }
          }, {
            query_string:{
              "default_field":"_all",
              "query": opts.query,
              "default_operator":"and"
            }
          }],
          should:[],
          must_not:[]
        }
      },
      sort: {
        published: {
          order: 'desc'
        }
      }
    };
    if (opts.type === 'event') {
      q.query.bool.must.push({
        term:{
          'venue.scheme': 'venue'
        }
      });
    } else {
      q.query.bool.must_not.push({
        term:{
          'venue.scheme': 'venue'
        }
      });
    }
    service.loadArticles({
      query: q,
      range: opts.range
    }, function(err, code, result){
      if (err) {
        callback(err)
      } else {
        callback(null, result);
      }
    });
	};

};