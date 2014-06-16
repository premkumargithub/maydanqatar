var _ = require('lodash');

module.exports = function(opts){

  var UserModelContributor = function() {};
  
  // define the userSchema's properties - this is the first step, and happens
  // before the schema is compiled with mongoose.schema(userSchema);
  UserModelContributor.prototype.defineUserSchema = function(mongoose, userSchema) {
    this.followSchema = new mongoose.Schema({
      scheme: String,
      tagId: String,
      label: String,
      geo: {
        lat: Number,
        lon: Number
      }
    });
  
    mongoose.model('Follow', this.followSchema);
    
    userSchema.follows = [this.followSchema];
  };

  UserModelContributor.prototype.initUserSchema = function(mongoose, userSchema) {
    
    userSchema.methods.getFollowsForScheme = function(scheme) {
      var result = _([]);
      for (var i = 0; i < this.follows.length; i++) {
        var tag = this.follows[i];
        if (tag.scheme === scheme) {
          result.push(tag);
        }
      }
      return result;
    };
    
    userSchema.methods.getFollowsNotForSchemes = function(schemes) {
      var result = _([]);
      for (var i=0; i<this.follows.length; i++) {
        var tag = this.follows[i];
        if (!schemes.contains(tag.scheme))
          result.push(tag);
      }
      return result;
    };
    
    userSchema.methods.follow = function(tag, callback) {
      if (typeof tag.id === 'string')
        tag.tagId = tag.id;
      if (!this.isFollowing(tag)) {
        this.follows.push(tag);
        var that = this;
        this.save(function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null, that);
          }
        });
      } else {
        callback(null, this);
      }
    };
    
    userSchema.methods.unfollow = function(tag, callback) {
      if (typeof tag.id === 'string')
        tag.tagId = tag.id;
      var followedTag = this.followed(tag);
      if (followedTag) {
        followedTag.remove();
        var that = this;
        this.save(function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null, that);
          }
        });
      } else {
        callback(null, this);
      }
    };
    
    userSchema.methods.followed = function(tag) {
      var followed_scheme = null;
      if (!tag.tagId)
        tag.tagId = tag.id;
      switch (tag.scheme) {
        case 'special':
          followed_scheme = this.special();
          break;
        case 'source':
          followed_scheme = this.source();
          break;
        case 'topic':
          followed_scheme = this.topic();
          break;
        case 'venue':
          followed_scheme = this.venue();
          break;
        default:
          break;
      }
      if (followed_scheme){
        return followed_scheme.find(function(ftag, index, tags) {
          return (ftag.tagId === tag.tagId);
        });
      } else {
        return false;
      }
    };
    
    userSchema.methods.isFollowing = function(tag) {
      return this.followed(tag) !== undefined;
    };
    
    userSchema.methods.special = function(){
      if (this.__special_cache === undefined) {
        this.__special_cache = this.getFollowsForScheme('special');
      }
      return this.__special_cache;
    };
    
    userSchema.methods.source = function(){
      if (this.__source_cache === undefined) {
        this.__source_cache = this.getFollowsForScheme('source');
      }
      return this.__source_cache;
    };
    
    userSchema.methods.topic = function(){
        if (this.__topic_cache === undefined) {
          this.__topic_cache = this.getFollowsForScheme('topic');
        }
        return this.__topic_cache;
      };
      
    userSchema.methods.venue = function(){
      if (this.__venue_cache === undefined) {
        this.__venue_cache = this.getFollowsForScheme('venue');
      }
      return this.__venue_cache;
    };
  };
  
  UserModelContributor.prototype.initUser = function(User) {
  };
  
  return new UserModelContributor();
};