var _ = require('lodash');

/**
 * Define schema file for the messages
 * Reciever schema will contain the details of the user included in the thread
 * Message schema will contain the message with it's sender detail
 */

module.exports = function(mongoose, User) {
  
  /**
  * Some schema validation on database end
  */
  function isValidMessage(value) {
    if(value.length > 1000) {
      return false;
    } else {
      return true;
    }
  }

  
  var messageSchema = new mongoose.Schema({
    timestamp: {type: Date, required: true},
    messageBody: {type: String, validate:[isValidMessage,'Message limited to 1000 characters.']},
    senderId: {type: mongoose.Schema.Types.ObjectId, required: true},
    readBy: {type: mongoose.Schema.Types.Mixed}
  });


  var reciepientSchema = new mongoose.Schema({
    id: {type: mongoose.Schema.Types.ObjectId, required: true}
  });

  var threadSchema =  new mongoose.Schema({
    ref: {
          type: {type: String},
          uri: {type: String},
          displayName: {type: String},
          language: {type: String, enum: ['en', 'ar']}
         },
    language: {type: String, required: true, enum: ['en', 'ar']},
    contentType: {type: String},
    initiatorId: {type: mongoose.Schema.Types.ObjectId, required: true},
    recipients: [reciepientSchema],
    messages: [messageSchema],
    modifiedAt: {type: Date, default: Date.now()}
  });

  var messageModel = mongoose.model('messages', threadSchema);

  var MessageContributor = function() {
  };

  var setIsSender = function (thread, userId){
      return _.map(thread.messages, function(message) {
              if (message.senderId.equals(userId)){
                message.isSender = true;
              } else {
                message.isSender = false;
              }
      });
    }

   var markAsRead = function (threadId,resultObj, userId, callback){
    async.waterfall([
      function (cb){
        _.map(resultObj.messages,function(message){
            _.map(message.readBy,function(markRead){
              if(_.isEqual(markRead.id, userId) == false){
                readBy = {};
                readBy.id = userId;
                message.readBy.push(readBy);
              }        
            });
        });
        cb(null, resultObj);
      },
      function (resultObj,cb){
        delete resultObj._id;
        var upsertData = resultObj;
        messageModel.findByIdAndUpdate({_id : threadId}, upsertData, function(err,updateResult) {
          cb(err, userId, updateResult);
        });
      },
      function (userId, updateResult, cb){
        var updateResultObj = updateResult.toObject();
        _.map(updateResultObj.messages, function(message) {
          if (message.senderId.equals(userId)){
            message.isSender = true;
          } else {
            message.isSender = false;
          }
        });
        cb(null,updateResultObj);
      }
      ],function (err, updatedThread){
        callback(err,updatedThread);
      }
      );
    };

  MessageContributor.prototype = {
    initiateThread: function(opts, thread, callback) {
        var userId = opts.userId;
        newthread = new messageModel(thread);
        newthread.save(function(err,result) {
          if (err) {
            callback(err);
          } else {
            var resultObj = result.toObject();
            setIsSender(resultObj,userId);
            callback(null,resultObj);
          }
        });
      },
    findThread : function(threadId, callback) {
      messageModel.findOne({
        _id : threadId
      }, function(err, result) {
        callback(err,result);
      });
    },
    executeFindThread : function(threadId, callback, successCallback) {
      this.findThread(threadId, function(err, result) {
        if (result)
          successCallback(result);
        else
          callback("Could not find message thread with id:" + threadId, null);
      });
    },
    saveReply: function(opts,callback) {
      var message = opts.message;
      var userId = opts.userId;
      this.executeFindThread(opts.threadId, callback, function(result) {
        result.modifiedAt = Date.now();
        result.messages.push(message);
        result.save(function(err,thread) {
          if (err) {
            callback(err);
          } else {
            var restultObj = thread.toObject();
            markAsRead(opts.threadId,restultObj,userId,callback);
          }
        });
      });
    },
    getThreadsByUserId : function(opts, callback) {
      var userId = opts.userId;
      
      messageModel.find({ $or:[ {initiatorId: userId}, {'recipients': { $elemMatch: {'id': userId}}}]})
                  .sort({'modifiedAt' : -1})
                  .lean()
                  .exec(function(err, threads) {
                    _.map(threads, function(thread) {
                      setIsSender(thread,userId);
                    });
                    callback(err,threads);
                  });
    },
    getMessages: function(opts, callback) {
      this.executeFindThread(opts.threadId, callback, function(result) {
          var userId = opts.userId;
          var resultObj = result.toObject();
          markAsRead(opts.threadId,resultObj,userId,callback);
      });
   },
  getUsers: function(opts, callback) {
    var search = opts.searchText;
    User.find({"displayName": {"$regex": search}}, "_id displayName", function(err, data) {
      callback(err, data);
    });
  }
  };
  return new MessageContributor();
};