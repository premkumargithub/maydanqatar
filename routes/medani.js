module.exports = function(config, app, service) {

  var _ = require('lodash');
	var async = require('async');

	app.get('/lang/:language/api/medani/', function(req, res, next){
		if (req.user){
			loadUserInfo(req.user.id, function(err, result){
        if (err) {
          console.log(err);
          res.send(500);
        } else {
        	result.user.isCurrent = true;
          res.send(result);
        }
      });
		} else {
			res.send(500, {code:'login'});
		}
	});
	
	app.get('/lang/:language/api/medani/:user/', function(req, res, next){
		if (req.params.user){
      loadUserInfo(req.params.user, function(err, result){
        if (err) {
          console.log(err);
          res.send(500);
        } else {
        	result.user.isCurrent = req.user && (req.user.id === result.id);
          res.send(result);
        }
      });
		} else {
			res.send(500, {code:'login'});
		}	
	});

  // we should move towards a rich domain model to
  // give us a better place to put this kind of operation
	var loadUserInfo = function(id, callback){
	  async.parallel([
      function(then){
        service.User.findById(id, function(err, result){
          if (err){
            then(err);
          } else {
            then(null, result);
          }
        });
      },
      function(then){
        service.hearts.user_scores(id, then);
      },
      function(then){
        service.crowns.user(id, then)
      }
    ], function(err, result){
      if (err) {
        callback(err);
      } else {
        var profile = result[0];
        var scores = result[1];
        var crowns = {};
        _.each(result[2], function(crown){
          crowns[crown.target.uri] = crown.crown.crown; // we like crowns
        });
        var tags = _.map(profile.follows, function(tag){
          return {
            type: tag.scheme,
            id: tag.tagId,
            label: tag.label,
            score: (scores[tag.tagId]) ? scores[tag.tagId] : 0,
            crown: (crowns[tag.tagId]) ? crowns[tag.tagId] : 'heart'
          };
        });
        callback(null, {
          user: {
            id: profile.id,
            email: profile.email,
            about: profile.about,
            displayName: profile.displayName,
            avatar: profile.avatar,
            follows: tags
          }
        });
      }
    });
	};

};