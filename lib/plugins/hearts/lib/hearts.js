// NOTE: there is quite a lot of indirection in the way "hearting"
// is supposed to operate. This becomes clear when you realise that
// when user U1 hearts comment C1 written by user U2 in an article
// tagged with tags T1, T2 and T3, then we must:
//
//   (i) record that U1 has hearted C1 (so that we can show to them
//   that they have/have-not already done so)
//
//   (ii) increment the heart-count for C1 so that we can show that
//   count to everyone
//
//   (iii) increment U2's score for each of T1, T2, and T3
//
module.exports = function(opts) {

  var _ = require('lodash');
  var async = require('async');

  var mongoose = opts.mongoose;
  var eventbus = opts.eventbus;

  // a place to record the fact that actor x hearted object y,
  // e.g. actor:Steve hearted object:comment-with-id("abcd1234")
  var heartSchema = new mongoose.Schema({
    user:{
      id: mongoose.Schema.Types.ObjectId,
      displayName: String,
      avatar: String
    },
    target:{
      type: { type: String },
      uri: String,
      displayName: String,
      language: String
    },
    modified: Date
  });

  heartSchema.index({
    'user.id': 1,
    'target.uri': 1,
    'target.language': 1
  },{
    unique: true
  });

  heartSchema.index({
    'modified': -1,
  });

  // a place to record the fact that object x has received
  // n hearts in total from some number of users (probably n users)
  // e.g. comment-with-id("abcd1234") has 12 hearts/likes
  var objectScoreSchema = new mongoose.Schema({
    target:{
      type: { type: String },
      uri: String,
      displayName: String,
      language: String
    },
    score: Number,
    modified: Date
  });

  objectScoreSchema.index({
    'target.uri': 1,
    'target.language': 1
  }, {
    unique: true
  });

  // a place to record the fact that user x received n hearts
  // for their contribution to object y, e.g. actor:Steve
  // scored 15 points for comments about the object:Sports tag.
  var userScoreSchema = new mongoose.Schema({
    user:{
      id: mongoose.Schema.Types.ObjectId,
      displayName: String,
      avatar: String
    },
    target:{
      type: { type: String },
      uri: String,
      displayName: String,
      language: String
    },
    score: Number,
    following: Boolean,
    modified: Date
  });

  userScoreSchema.index({
    'user.uri': 1,
    'score': -1,
    'modified': 1
  });

  userScoreSchema.index({
    'target.uri': 1,
    'target.language': 1,
    'following': 1,
    'score': -1,
    'modified': 1
  });

  userScoreSchema.index({
    'user.id': 1,
    'target.uri': 1,
    'target.language': 1
  }, {
    unique: true
  });

  var Heart = mongoose.model('heart', heartSchema);
  var UserScore = mongoose.model('user_score', userScoreSchema);
  var ObjectScore = mongoose.model('object_score', objectScoreSchema);

  var modifyObjectScore = function(opts, by, callback){
    ObjectScore.findOneAndUpdate({
      'target.uri': opts.target.uri
    }, {
      target: opts.target,
      $inc: { score: by },
      modified: new Date()
    }, {
      upsert: true
    }, callback);
  };

  var incrementObjectScore = function(opts, callback){
    modifyObjectScore(opts, 1, callback);
  }

  var decrementObjectScore = function(opts, callback){
    modifyObjectScore(opts, -1, callback);
  };

  var heartAndIncrementObjectScore = function(opts, callback){
    new Heart({
      user: opts.user,
      target: opts.target,
      modified: new Date()
    }).save(function(serr, heart){
      if (serr){
        callback(serr);
      } else {
        incrementObjectScore(opts, callback);
      }
    });
  };

  var loadObjectScore = function(opts, callback){
    if (!opts.target) {
      callback(null, null);
    } else {
      ObjectScore.findOne({
        'target.id': opts.target.id
      }, callback);
    }
  };

  var modifyUserScore = function(opts, by, callback){
    if (opts.user){
      var tasks = [];
      _.each(opts.tags, function(tag){
        var update = {
          user: opts.user,
          target: {
            type: 'tag',
            uri: tag.id,
            displayName: tag.label,
            language: opts.language
          },
          $inc: { score: by },
          modified: new Date()
        };
        if ((opts.following !== undefined) && (opts.following !== null))
          update.following = opts.following

        tasks.push(function(then){
          UserScore.findOneAndUpdate({
            'user.id': opts.user.id,
            'target.uri': tag.id,
            'target.language': opts.language
          }, update, {
            upsert: true
          }, function(err, result){
            eventbus.emit('score-change', update.target);
            then(err, result);
          });
        });
      });
      if (tasks.length > 0){
        async.parallelLimit(tasks, 5, callback);
      }
    }
  }

  var incrementUserScore = function(opts, callback){
    setTimeout(modifyUserScore, 0, opts, 1, callback);
  }

  var decrementUserScore = function(opts, callback){
    setTimeout(modifyUserScore, 0, opts, -1, callback);
  }

  var hearts = {

    // for efficiency, recording whether or not the user
    // is following the tag in the user-tag-score doc
    // works nicely ... unfortunately it isn't all that
    // intuitive that this is where the code would live.
    // Probably this is only really an issue that harks
    // back to the fact that we've stuck to the legacy
    // "plugin" model
    follow: function(opts, callback){
      opts.following = true;
      modifyUserScore(opts, 0, callback);
    },

    unfollow: function(opts, callback){
      opts.following = false;
      modifyUserScore(opts, 0, callback);
    },

    followers: function(opts, callback){
      var q = {
        'target.uri': opts.target.uri,
        'target.language': opts.target.language,
        'following': true
      };
      async.parallel([
        function(then){
          UserScore.count(q, then);
        },
        function(then){
          UserScore.find(q,
          'user score', {
            skip: opts.range.start,
            limit: opts.range.end-opts.range.start,
            sort: {
              score: -1
            }
          }, then);
        }
      ],
      function(err, result){
        if (err) {
          callback(err);
        } else {
          var count = result[0];
          var followers = result[1];
          callback(null, {
            results: followers,
            range: {
              start: opts.range.start+1,
              end: (opts.range.end > count) ? count : opts.range.end,
              total: count
            }
          });
        }
      });
    },

    topUsers: function(opts, callback){
      UserScore.find({
        'target.uri': opts.uri,
        'target.language': opts.language,
        'following': true
      }, null, {
        limit: opts.limit
      }, function(err, result){
        callback(err, result);
      });
    },

    followerCount: function(opts, callback){
      UserScore.count({
        'target.uri': opts.target.uri,
        'target.language': opts.target.language,
        'following': true
      }, function(err, result){
        if (err) {
          callback(err);
        } else {
          callback(null, { followers: result });
        }
      });
    },

    add: function(opts, callback){
      Heart.findOne({
        'user.id': opts.user.id,
        'target.uri': opts.target.uri,
        'target.language': opts.target.language
      }, function(err, heart){
        if (err) {
          callback(err);
        } else {
          if (heart) {
            // cheeky monkey already hearted this ...
            // could be a double-click or whatever.
            loadObjectScore(opts, callback);
          } else {
            // not yet hearted ...
            heartAndIncrementObjectScore(opts, function(err, result){
              callback(err, result);
              if (!err){
                incrementUserScore({
                  tags: opts.context,
                  user: opts.recipient,
                  language: opts.target.language
                }, function(err, result){
                  if (err)
                    console.log('error while incrementing user score, %s', err);
                });
              }
            });
          }
        }
      });
    },

    remove: function(opts, callback){
      Heart.findOneAndRemove({
        'user.id': opts.user.id,
        'target.uri': opts.target.uri,
        'target.language': opts.target.language
      }, function(err, heart){
        if (err) {
          callback(err);
        } else {
          if (heart) {
            decrementObjectScore(opts, function(err, result){
              callback(err, result);
              if (!err){
                decrementUserScore({
                  tags: opts.context,
                  user: opts.recipient,
                  language: opts.target.language
                }, function(err, result){
                  if (err)
                    console.log('error while decrementing user score, %s', err);
                });
              }
            });
          } else {
            // user hadn't hearted, so can't decrement
            loadObjectScore(opts, callback);
          }
        }
      });
    },

    object_scores: function(opts, callback){
      if (!opts.uris || opts.uris.length === 0) {
        callback(null, {});
      } else {
        ObjectScore.find({
          'target.language': opts.language,
          'target.uri': { "$in" : opts.uris }
        }, function(err, scores){
          if (err) {
            callback(err);
          } else {
            var result = {};
            _.each(scores, function(score){
              result[score.target.uri] = score.score;
            });
            callback(err, result);
          }
        });
      }
    },

    user_scores: function(id, callback){
      if (!id) {
        callback(null, {});
      } else {
        UserScore.find({
          'user.id': id,
          'following': true
        }, function(err, scores){
          if (err) {
            callback(err);
          } else {
            var result = {};
            _.each(scores, function(score){
              result[score.target.uri] = score.score;
            });
            callback(err, result);
          }
        });
      }
    },

    mine: function(opts, callback){
      if (!opts.uris || opts.uris.length === 0) {
        callback(null, {});
      } else {
        Heart.find({
          'user.id': opts.user.id,
          'target.language': opts.language,
          'target.uri': { $in: opts.uris }
        }, function(err, hearts){
          if (err){
            callback(err);
          } else {
            var result = {};
            _.each(hearts, function(heart){
              result[heart.target.uri] = true;
            });
            callback(err, result);
          }
        });
      }
    }

  };

  opts.eventbus.on('followed', function(details){
    hearts.follow({
      user: details.user.summarize(),
      tags: [{
        scheme: details.tag.scheme,
        id: details.tag.tagId,
        label: details.tag.label
      }],
      language: details.language
    }, function(err, result){
      if (err) {
        console.trace(JSON.stringify(err));
      }
    });
  });

  opts.eventbus.on('unfollowed', function(details){
    hearts.unfollow({
      user: details.user.summarize(),
      tags: [{
        scheme: details.tag.scheme,
        id: details.tag.tagId,
        label: details.tag.label
      }],
      language: details.language
    }, function(err, result){
      if (err) {
        console.trace(JSON.stringify(err));
      }
    });
  });

  return hearts;
};