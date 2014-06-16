/**
 * See MQ-115
 *
 * Note that these are not quite like "badges" in the sense that
 * these can only be held by one user at a time for any given
 * target uri, so to use the analogy of real crowns ... only one
 * head at a time can wear them ;)
 */
module.exports = function(opts) {

  var _ = require('lodash');

  var mongoose = opts.mongoose;
  var config = opts.config;
  var service = opts.service;
  var eventbus = opts.eventbus;

  var crownQueueSchema = new mongoose.Schema({
    target:{
      type: { type: String },
      uri: String,
      displayName: String,
      language: String
    },
    modified: Date
  });

  crownQueueSchema.index({
    'target.uri': 1,
    'target.language': 1
  },{
    unique: true
  });

  var crownSchema = new mongoose.Schema({
    target:{
      type: { type: String },
      uri: String,
      displayName: String,
      language: String
    },
    crowns:[{
      user:{
        id: mongoose.Schema.Types.ObjectId,
        displayName: String,
        avatar: String
      },
      crown: String,
      modified: Date,
      score: Number
    }]
  });

  crownSchema.index({
    'target.uri': 1,
    'target.language': 1
  },{
    unique: true
  });

  crownSchema.index({
    'crowns.user.id': 1,
  });

  var Queue = mongoose.model('crowning_queue', crownQueueSchema);
  var Crowns = mongoose.model('crown', crownSchema);

  var chooseCrown = function(index){
    switch(index){
      case 0:
        return 'gold';
        break;
      case 1:
        return 'silver';
        break;
      case 2:
        return 'bronze';
        break;
    }
    return 'heart';
  }

  var shouldReassign = function(current, latest){
    if (current.crowns.length != latest.length){
      return true;
    }
    if (_.any(latest, function(userscore, index){
      var curr = current.crowns[index];
      if (
        (userscore.score != curr.score) ||
        (userscore.id != curr.user.id)
      ) {
        return true;
      }
    })) {
      return true;
    };
    return false;
  }

  var rank = function(crown){
    switch (crown){
      case 'gold':
        return 3;
      case 'silver':
        return 2;
      case 'bronze':
        return 1;
    }
    return 0;
  };

  // return the set of crowns where the user or crown colour
  // has changed.
  var changes = function(a, b){
    var result = {
      rising:[],
      falling:[],
      enthroned:[],
      dethroned:[]
    };
    _.each(a, function(ac){
      var before = ac;
      var after = _.find(b, function(bc){
        return (ac.user.id.toString() === bc.user.id.toString());
      });
      if (before) {
        if (after) {
          var rb = rank(before.crown);
          var ra = rank(after.crown);
          if (ra > rb){
            result.rising.push(after);
          } else if (ra === rb) {
            // no change
          } else {
            result.falling.push(after);
          }
        } else {
          result.dethroned.push(before);
        }
      } else {
        if (after) {
          result.enthroned.push(after);
        } else {
          // not before and not after - should never reach here!
        }
      }
    });
    return result;
  }

  var reassignIfNecessary = function(current, latest, callback){
    if (shouldReassign(current, latest)){
      assign(current.target, latest, function(err, result){
        if (result){
          opts.eventbus.emit('power-shift', changes(current.crowns, result));
        }
        callback(err, result);
      });
    } else {
      callback(null, current);
    }
  }

  var assign = function(target, users, callback){
    if (users && users.length > 0){
      var crowns = [];
      _.each(users, function(top, index){
        crowns.push({
          user: {
            id: top.user.id,
            displayName: top.user.displayName,
            avatar: top.user.avatar
          },
          crown: chooseCrown(index),
          modified: top.modified,
          score: top.score
        });
      });
      Crowns.findOneAndUpdate({
        'target.uri': target.uri,
        'target.language': target.language
      }, {
        target: {
          type: target.type,
          uri: target.uri,
          displayName: target.displayName,
          language: target.language
        },
        crowns: crowns
      }, {
        upsert:true
      },
      function(err){
        callback(err, crowns);
      });
    } else {
      callback();
    }
  }

  var reassign = function(target, callback){
    service.hearts.topUsers({
      uri: target.uri,
      language: target.language,
      limit: 3
    }, function(err, top3){
      if (err){
        callback(err);
      } else {
        if (top3) {
          Crowns.findOne({
            'target.uri': target.uri,
            'target.language': target.language
          }, function(err, current){
            if (err) {
              callback(err);
            } else {
              if (current) {
                reassignIfNecessary(current, top3, callback);
              } else {
                assign(target, top3, callback);
              }
            }
          });
        } else {
          console.log('no top users');
          callback();
        }
      }
    });
  }

  return {

    user: function(id, callback){
      Crowns.find({
        'crowns': {
          $elemMatch: {
            'user.id': id
          }
        }
      }, {
        'target':1,
        'crowns':{
          $elemMatch:{
            'user.id': id
          }
        }
      }, {
      },
      function(err, result){
        if (err) {
          callback(err);
        } else {
          callback(err, _.map(result, function(crown){
            var c = crown.crowns[0];
            return {
              crown: {
                crown: c.crown,
                modified: c.modified,
                score: c.score
              },
              target: crown.target
            };
          }));
        }
      });
    },

    enqueue: function(target, callback){
      Queue.findOneAndUpdate({
        'target.uri': target.uri,
        'target.language': target.language
      }, {
        target: target,
        modified: new Date()
      }, {
        upsert:true
      }, callback);
    },

    processQueue: function(callback){
      var stream = Queue.find({}).stream();
      stream
        .on('error', function(err){
          callback(err);
        })
        .on('data', function(entry){
          stream.pause();
          reassign(entry.target, function(err, crowns){
            if (err) {
              console.log(err);
            }
            // remove if unchanged since we started
            // otherwise leave it in the queue for
            // processing on the next invocation of processQueue
            // NOTE: currently we are removing regardless
            //       if there was an error.
            Queue.findOneAndRemove({
              _id: entry._id,
              __version: entry.__version
            }, function(err){
              if (err)
                console.log(err);
              stream.resume();
            });
          });
        })
        .on('close', function(){
          callback();
        });
    }

  };

};