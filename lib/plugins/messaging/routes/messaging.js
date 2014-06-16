var _ = require('lodash');

module.exports = function(app,service) {
  
  function validate(req, res, validationSuccessCallback) {
      //TODO: function to validate the JSON coming from request
    }

  app.post('/lang/:language/api/messages/', function(req, res, next) {
    // TODO: Some validation required spl for ids
    if(req.user == undefined){
      execute(res,{error:{code:'login', message:'you are not logged in'}}, {});
    }else{
      var thread=handleThreadPost(req);
      var opts = {};
      opts.userId = req.user._id;
      service.message.initiateThread(opts, thread, function(err, result) {
          execute(res, err, result);
      });
    }
  });

	app.post('/lang/:language/api/messages/:threadId/replies', function(req, res, next) {
    // TODO: Some validation required important for ids
    if(req.user == undefined){
      execute(res,{error:{code:'login', message:'you are not logged in'}}, {});
    }else{
      var opts = {};
      opts.threadId = req.params.threadId;
      opts.userId = req.user._id;
      var requiredParam = ['messageBody'];
      var validRequest = validateRequestParam(requiredParam, req.body.message);
      if(!validRequest) { 
        opts.message = {
          messageBody: req.body.message.messageBody,
          senderId: req.user._id,
          timestamp: Date.now(),
          readBy:[{id:req.user._id}] 
        }; 
        service.message.saveReply(opts, function(err, result) {
          execute(res, err, result);
        });
      }else {
        var err = '';
        execute(res, err, validRequest);
      }
    }
  });
        
  app.get('/lang/:language/api/messages/:threadId', function(req, res, next) {
    if(req.user == undefined){
      execute(res,{error:{code:'login', message:'you are not logged in'}}, {});
    }else{
      var opts  = {};
      opts.userId = req.user._id;
      opts.threadId = req.params.threadId;
      service.message.getMessages(opts, function(err, result) { 
         execute(res, err, result);
      });
    }
  });


  app.get('/lang/:language/api/user/search/:userText', function(req, res, next) {
    var opts = {};
    opts.searchText = req.params.userText.trim();
    service.message.getUsers(opts, function(err, result) { 
      prepareResponse(res, err, result);
    });
  });
     
  app.get('/lang/:language/api/messages/me/threads/', function(req, res, next) {
    if(req.user == undefined){
      execute(res,{error:{code:'login', message:'you are not logged in'}}, {});
    }else{
      var opts  = {};
      opts.userId = req.user._id;
      service.message.getThreadsByUserId(opts, function(err, threads) {  
        //TODO: decorating threads is in process
        async.map(threads, decorateThread, function (err, results) {
          if(!err) {
            res.statusCode = 200;
            res.json(results);
          } else {
            execute(res, err, null);
          }

        });
      });
    }
  }); 
  
  function execute(res, err, result) {
      if (err) {
        res.statusCode = 500;
        res.json(err);
      } else {
        decorateThread(result, function(err, result) {
            res.statusCode = 200;
            res.json(result);
        });
      }
    }

  function prepareResponse(res, err, result) {
    if (err) {
      res.statusCode = 500;
      res.json(err);
    } else {
      res.statusCode = 200;
      res.json(result);
    }
  }

  function handleThreadPost(req,callback) {
    var thread = {
      recipients: req.body.recipients,
      initiatorId: req.body.initiatorId,
      language: req.body.language
    };
    
    if(typeof req.body.ref != 'undefined'){
      thread.ref = {
        uri: req.body.ref.uri,
        language: req.body.ref.language,
        type: req.body.ref.type,
        displayName: req.body.ref.displayName
      }
    }
    thread.messages = new Array;
    thread.messages.push({
      messageBody: req.body.message.messageBody,
      senderId: req.user._id,
      timestamp: Date.now(),
      readBy:[{id:req.user._id}]
    });
    return thread;
  }

  function validateRequestParam(requiredParam, targetObject) {
    var invalidObject = [];
    var len = requiredParam.length;
    for (var i=0; i < len; i++){
      var invalidKey = {};
      if(!targetObject.hasOwnProperty(requiredParam[i]) || targetObject[requiredParam[i]].trim().length == 0) {
        var key = requiredParam[i];
        invalidKey[key] = "Key is required and can't be empty";
        invalidObject.push(invalidKey);
      }
    }
    if(invalidObject.length != 0 )
    return invalidObject;

    return null;
  }

  var decorateThread = function(thread,callback) {
    var decoratedThread={};
    var unreadcount = 0;
    async.waterfall([
        function (cb) {
          var set = {};
          var userIds = [];

          if (!thread.messages || thread.messages.length === 0)
            return [];
          _.each(thread.messages, function(message){
              set[message.senderId] = true;
          });
                
          set[thread.initiatorId] = true;
          
          _.each(thread.recipients, function(recipient){
            set[recipient.id] = true;
          });
          
          _.each(set, function(val, id){
            userIds.push(id);
          });
        
        cb(null,userIds);
        
        }, function(userIds, cb){
              service.User.getUsersMappedById(userIds, function(err, usersObj){
                  if (err) {
                    cb(err, null);
                  } else {
                    cb(null, usersObj);
                  }
              });
               
        }, function(usersObj, cb) {
              decoratedThread.modifiedAt = thread.modifiedAt;
              decoratedThread._id = thread._id;

              if(typeof thread.ref != 'undefined'){
                decoratedThread.ref = {
                  uri: thread.ref.uri,
                  language: thread.ref.language,
                  type: thread.ref.type,
                  displayName: thread.ref.displayName
                };
              };
              
              //decorating intiator object
              var initUser = usersObj[thread.initiatorId];
              if(!initUser){
                decoratedThread.initiator = {
                    id: thread.initiatorId
                };
              }else{
                decoratedThread.initiator = {
                    id: initUser ? initUser._id : thread.initiatorId,
                    displayName : initUser ? initUser.displayName : initUser.email,
                    avatar : initUser ? initUser.avatar : undefined
                    };
                }
              
              //decorating message object from messages array
              decoratedThread.messages = [];
              _.each(thread.messages, function(msg){
                var user = usersObj[msg.senderId];
                var tempMsg = {};
                tempMsg = {
                    timestamp : msg.timestamp,
                    messageBody : msg.messageBody,
                    isSender : msg.isSender
                };
                if(!user){
                  tempMsg.sender= {
                    id: user ? user._id : msg.senderId,
                  };
                }else{
                  tempMsg.sender= {
                    id: user ? user._id : msg.senderId,
                    displayName : user ? user.displayName : user.email,
                    avatar : user ? user.avatar : undefined
                  };
                }

                //set the message is read by user or not
                tempMsg.isRead = false;
                _.find(msg.readBy, function (msgread){
                  if(_.isEqual(msgread.id, user._id) == true){
                    tempMsg.isRead = true;
                  }else{
                    unreadcount = unreadcount + 1;
                  }
                });

                decoratedThread.messages.push(tempMsg);
              });

              // sorting message array by latest first
              _.map(_.sortBy(decoratedThread.messages, 'timestamp'), _.values);
              decoratedThread.messages.reverse();
              
              //add unread message count
              decoratedThread.unreadcount = unreadcount;

              //decorating reciepient object 
              decoratedThread.recipients = [];
              _.each(thread.recipients, function(recipient){
                var recp = usersObj[recipient.id];
                if(!recp){
                  var tempRecp = {
                    id: recp ? recp._id : recipient.id
                  };
                  decoratedThread.recipients.push(tempRecp);
                }else{
                  var tempRecp = {
                    id: recp ? recp._id : recipient.id,
                    displayName : recp ? recp.displayName : recp.email,
                    avatar : recp ? recp.avatar : undefined
                  };
                  decoratedThread.recipients.push(tempRecp);
                }
              });

         cb(null, decoratedThread);
        }
      ], function(err, decoratedThread){
        if (err) {
         callback(err);
        }else {
          callback(null,decoratedThread);
        }
          
      }
    );
  };
};