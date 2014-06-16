var _ = require('lodash');

/**
 * The core User object is very sparse. It exists simply to provide the hooks
 * necessary to pull together contributions from plugins that want to store
 * user-specific data.
 * 
 * A plugin that wants to store data in a user's document in Mongo must implement
 * three methods:
 * 
 *  (1) defineUserSchema
 *  --------------------
 *  This method receives the json descriptor of the schema *before* it is
 *  compiled by mongoose, so the plugin can freely add properties at this
 *  stage. Care must be taken not to clash with properties from other plugins!
 * 
 *  Plugins can contribute sub-schema here - for example the social plugin
 *  contributes a "Social" schema, compiles it with mongoose, and sets it as
 *  the "social" property of the userSchema.
 * 
 *  (2) initUserSchema
 *  ------------------
 *  This method receives the compiled mongoose schema, allowing it to add any
 *  extras it wants to, for example mongoose 'methods' and 'virtuals'.
 * 
 *  (3) initUser
 *  ------------
 *  This method receives the User model, created from the userSchema by  
 *  executing "mongoose.model('User', userSchema)" with the fully prepared
 *  and compiled schema. Plugins can contribute methods to the User object
 *  at this stage, for example the social plugin contributes a 
 *  'findOrCreateWithSocialProfile' method.
 */
module.exports = function(eventbus, mongoose) {

  // define a very simple initial schema. Plugins may contribute extra
  // properties to this schema.
	var userSchemaDef = {
		email: String,
		displayName: String,
		avatar: String,
		about: String,
		uploadedAvatar: String
	};

  // notify interested parties that the user schema has been defined,
  // giving them an opportunity to step in and modify that schema before
  // it gets compiled ...
  eventbus.emit('defined-user-schema', mongoose, userSchemaDef);

  // compile the schema, with any changes contributed by listeners
  // registered to the previous event.
  var userSchema = new mongoose.Schema(userSchemaDef);

  userSchema.methods.summarize = function(){
    var result = {
      id: this.id
    };
    if (this.displayName)
      result.displayName = this.displayName;
    if (this.avatar)
      result.avatar = this.avatar;
    return result;
  };

  eventbus.emit('compiled-user-schema', mongoose, userSchema);

  // create the central Users instance with the completed schema
  var User = mongoose.model('User', userSchema);
  eventbus.emit('user-model-ready', User);

  User.loadUserProfile = function(user){
  	var profile = {
  		id: user._id,
  		email: user.email,
  		displayName: user.displayName,
  		avatar: user.avatar,
  		about: user.about,
  		isSocial: !!user.social
  	};

  	return profile;
  };

  User.getUsersMappedById = function(ids, callback){
    if (!ids || ids.length === 0){
      callback(null, {});
    } else {
      User.find({
        _id: { "$in" : ids }
      }, function(err, users){
        if (err){
          callback(err);
        } else {
          var result = {};
          _.each(users, function(user){
            result[user._id] = user;
          });
          callback(err, result);
        }
      });
    }
  }

	return User;
};
