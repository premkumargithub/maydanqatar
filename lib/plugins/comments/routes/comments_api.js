module.exports = function(config, app, service, users) {

  var _ = require('lodash');
  var async = require('async');

  app.get('/lang/:lang/api/forums/:url/', function(req, res) {
    validate(req, res, function(forum) {
      service.forum.findForum(forum.url, function(err, result) {
        if (!result) {
          service.forum.saveForum(forum, function(err, result) {
            serializeAndDeliver(res, err, req.user, result);
          });
        } else {
          serializeAndDeliver(res, err, req.user, result);
        }
      });
    });
  });

  app.post('/lang/:lang/api/forums/:url/comments', function(req, res) {
    validate(req, res, function(forum) {
      var opts = {};
      opts.url = forum.url;
      opts.comment = {
        text : req.body.text,
        user:req.user.summarize()
      };
      service.forum.saveComment(opts, function(err, result) {
        serializeAndDeliver(res, err, req.user, result);
      });
    });
  });

  app.post('/lang/:lang/api/forums/:url/comments/:id/replies', function(req, res) {
    validate(req, res, function(forum) {
      var opts = {};
      opts.url = forum.url;
      opts.id = req.params.id;
      opts.reply = {
        text : req.body.text,
        user:req.user.summarize()
      };
      service.forum.saveReply(opts, function(err, result) {
        serializeAndDeliver(res, err, req.user, result);
      });
    });
  });

  function serializeAndDeliver(res, err, user, forum) {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      serializeForum(user, forum, function(err, result){
        if (err){
          console.log(err);
          res.send(500);
        } else {
          res.statusCode = 200;
          res.json(result);
        }
      });
    }
  }

  var validate = function(req, res, validationSuccessCallback) {
    var forum = {
      url: req.params.url,
      lang: req.params.lang
    };
    var validation = service.forum.validateForum(forum);
    if (validation.validated) {
      validationSuccessCallback(forum);
    } else {
      res.send(500, validation);
    }
  }

  var serializeForum = function(user, forum, callback){
    var uris = [];
    _.each(forum.comments, function(comment){
      uris.push(comment.id);
      _.each(comment.replies, function(reply){
        uris.push(reply.id);
      });
    });

    var collectHeartScores = function(then){
      service.hearts.object_scores({
        language: forum.lang,
        uris: uris
      }, function(err, result){
        if (err){
          console.log(err);
          then(null, {});
        } else {
          then(null, result);
        }
      });
    };

    var collectMyHearts = function(then){
      if (user) {
        service.hearts.mine({
          user: user,
          language: forum.lang,
          uris: uris
        }, function(err, result){
          if (err){
            console.log(err);
            then(null, {});
          } else {
            then(null, result);
          }
        });
      } else {
        then(null, {});
      }
    };

    var collectUsers = function(then){
      service.User.getUsersMappedById(collectUserIds(forum.comments), function(err, result){
        if (err) {
          console.log(err);
          then(null, {});
        } else {
          then(null, result);
        }
      });
    };

    async.parallel([
      collectUsers,
      collectHeartScores,
      collectMyHearts
    ], function(err, result){
      if (err) {
        // note: this data is important but NOT essential, so
        // if something goes wrong we'll log it and continue,
        // returning as much as we can to augment the forum itself
        console.log(err);
      }
      // NOT else, we'll deliberately do this even if we hit an error
      // in one or more of the parallel functions
      var users = result[0];
      var hearts = result[1];
      var myHearts = result[2];

      callback(null, {
        url: forum.url,
        lang: forum.lang,
        commentCount: forum.commentCount,
        comments: serializeComments(forum.comments, users, hearts, myHearts)
      });
    });
  }

  var serializeComments = function(comments, users, hearts, myHearts) {
    return _.map(comments, function(comment){
      return serializeComment(comment, users, hearts, myHearts)
    });
  }

  var serializeComment = function(comment, users, hearts, myHearts) {
    var user = users[comment.user.id];
    if (!user)
      user = comment.user;
    return {
      _id: comment._id,
      user: {
        id: user.id,
        displayName: ((user.displayName && user.displayName != "undefined undefined") ? user.displayName : user.email),
        avatar: user.avatar
      },
      hearted: (!!myHearts[comment._id]),
      hearts: (!!hearts[comment._id]) ? hearts[comment._id] : 0,
      timestamp: (!!comment._doc.timestamp) ? comment._doc.timestamp : comment._doc.dateModified,
      text: comment.text,
      replies: (!!comment.replies) ? serializeComments(comment.replies, users, hearts, myHearts) : []
    };
  };

  var collectUserIds = function(comments){
    if (!comments || comments.length === 0)
      return [];
    var set = {};
    _.each(comments, function(comment){
      set[comment.user.id] = true;
      _.each(comment.replies, function(reply){
        set[reply.user.id] = true;
      });
    });
    var result = [];
    _.each(set, function(val, id){
      result.push(id);
    });
    return result;
  }

};
