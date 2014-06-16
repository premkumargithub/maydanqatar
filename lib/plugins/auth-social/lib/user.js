module.exports = function(){

  var _ = require('lodash');

  var UserModelContributor = function() {};

  // define the userSchema's properties - this is the first step, and happens
  // before the schema is compiled with mongoose.schema(userSchema);
  UserModelContributor.prototype.defineUserSchema = function(mongoose, userSchema) {
    this.socialSchema = new mongoose.Schema({
      provider: String,
      socialId: String,
      username: String,
      displayName: String,
      avatar: String
    });
  
    this.socialSchema.index({
      socialId: 1,
      provider: 1
    });
    
    mongoose.model('Social', this.socialSchema);
    
    userSchema.social = [this.socialSchema];
  };

  UserModelContributor.prototype.initUserSchema = function(mongoose, userSchema) {
    userSchema.methods.getSocial = function(provider) {
      for (var i = 0; i < this.social.length; i++) {
        var social = this.social[i];
        if (social.provider == provider) {
          return social;
        }
      }
      return null;
    };

    userSchema.methods.isConnected = function(provider) {
      return this.getSocial(provider) !== null;
    };

    userSchema.virtual('twitter').get(function() {
      return this.getSocial('twitter');
    });

    userSchema.virtual('facebook').get(function() {
      return this.getSocial('facebook');
    });

    userSchema.virtual('linkedin').get(function() {
      return this.getSocial('linkedin');
    });
  };

  UserModelContributor.prototype.initUser = function(User) {
    
    User.findOrCreateWithSocialProfile = function(user, profile, done) {

      if (user) {
        // we're already logged in, so presumably we're either
        // logging in with a second social network or connecting
        // one we haven't used before
        if (user.getSocial(profile.provider)) {

          // push in (or update) the social provider on each login
          addOrUpdateSocialProvider(user, profile);

          // update the mongo document
          user.save(function(err) {
            done(err, user);
          });
        }
      }
      else {
        // we're not logged in yet, so we're either logging in
        // or registering...
        User.findOne({
          'social.socialId': profile.id
        }).where({
          'social.provider': profile.provider
        }).exec(function(err, user) {
          if (err) {
            console.log(err);
            done(err, user);
          }
          else {
            var msg = (!user) ? { message:'new_user' } : {};
            if (!user) {
              // not registered, so we'll create new user
              // with details extracted from the social
              // profile that they are registering with...
              user = new User({
                email: (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null,
                displayName: profile.displayName,
                avatar: extractAvatarUrl(profile),
                social: []
              });
            } else {
              // the user exists, but we want to make sure
              // we have up-to-date info, so we won't return
              // yet - we'll exit the if and  pull the info
              // from the social provider and update mongo
            }

            // add or update the social provider
            addOrUpdateSocialProvider(user, profile);
            if (!user.avatar)
              user.avatar = extractAvatarUrl(profile);

            // insert into mongo
            user.save(function(err) {
              done(err, user, msg);
            });
          }
        });
      }
    };
    
	};

  var extractAvatarUrl = function(profile){
    if (profile.photos && profile.photos.length > 0){
      return profile.photos[0].value;
    }

    if (profile._json && profile._json.pictureUrl)
      return profile._json.pictureUrl;

    return undefined;
  }

  // todo: make this "add or update" so that we capture changes
  //       each time a user logs in
	var addOrUpdateSocialProvider = function(user, profile){
	  if (user.social) {
	    var existing = _.find(user.social, function(social){
        return social.provider === profile.provider
	    });

	    if (existing) {
	      existing.username = profile.username;
	      existing.displayName = profile.displayName;
	      existing.avatar = extractAvatarUrl(profile);
	    } else {
        user.social.push({
          provider: profile.provider,
          socialId: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          avatar: extractAvatarUrl(profile)
        });
      }
	  }
	};
	
	return new UserModelContributor();
};