module.exports = function(mongoose, config) {

  var url_lib = require('url');
  var _ = require('lodash');

  var replySchema = new mongoose.Schema({
    text: String,
    timestamp: Date,
    user:{
      id: mongoose.Schema.Types.ObjectId,
      displayName: String,
      avatar: String
    }
  });

  var commentSchema = new mongoose.Schema({
    text: String,
    timestamp: Date,
    user:{
      id: mongoose.Schema.Types.ObjectId,
      displayName: String,
      avatar: String
    },
    replies: [replySchema]
  });

  var forumSchema = new mongoose.Schema({
    topic: String,
    url: String,
    commentCount:Number,
    lang: String,
    comments: [commentSchema]
  });

  forumSchema.index({
    url : 1
  }, {
    unique : true
  });

  var isUrlToADifferentSite = function(url){
    var parsed = url_lib.parse(url);
	  var root = parsed.protocol + "//" + parsed.host;
  	return ((config.urls.www != root) && (config.domain != url.host));
	}

  var forumModel = mongoose.model('forum', forumSchema);

  var ForumContributor = function() {};

  ForumContributor.prototype = {

    saveForum : function(opts, callback) {
      var validation = this.validateForum(opts);
      if (!validation.validated) {
    	  callback(validation, null);
      } else {
        forumModel.findOne({
          url:opts.url
        }, function(err, forum) {
          if (err) {
            callback(err, null);
          } else {
            if (forum) {
              forum.url = opts.url;
              forum.lang = opts.lang;
            } else {
              forum = new forumModel(opts);
            }
            forum.save(callback);
          }
        });
      }
    },

    validateForum: function(forum) {
      return {
        validated: !isUrlToADifferentSite(forum.url),
        forum: forum
      };
    },

    findForum : function(url, callback) {
      forumModel.findOne({
        url: url
      }, function(err, forum) {
        if (err) {
          callback(err);
        } else {
          callback(null, forum);
        }
      });
    },

    saveComment : function(opts, callback) {
      forumModel.findOne({
        url: opts.url
      }, function(err, forum) {
        if (err) {
          callback(err);
        } else {
          var comment = opts.comment;
          comment.timestamp = new Date();
          forum.comments.unshift(comment);
          forumModel.findByIdAndUpdate(
          	forum._id, {
          		$inc: { commentCount: 1 },
          		$set: { comments: forum.comments }
          	}, function(error, result){
          		callback(error, result);
          });
        }
      });
    },

    saveReply : function(opts, callback) {
      forumModel.findOne({
        url: opts.url
      }, function(err, forum) {
        if (err) {
          callback(err);
        } else {
          var comment = forum.comments.id(opts.id);
          opts.reply.timestamp = new Date();
          comment.replies.push(opts.reply);
          forumModel.findByIdAndUpdate(
          	forum._id, {
          		$inc: { commentCount: 1 },
          		$set: { comments: forum.comments }
          	}, function(error, result){
          		callback(error, result);
          });
        }
      });
    },
    
    commentCounts : function(opts, callback) {
    	forumModel.find({
    		url: { $in : opts.urls }
    	}, function(err, result){
    		callback(err, result);
    	});
    }
    
  };

  return new ForumContributor();

};