// Steps to add a new social provider:
//
//  1. Create an API key using the social provider's developer site
//  2. Add the passport-{provider-name} module to package.json
//
// In the client app:
//
//  3. pass social provider info in a json object like this:
//
//   providers:[
//    { name:'twitter',
//			keys:{
//				consumerKey: 'llt9eXqypbZ4kM3kIW4KQ',
//				consumerSecret: 'hREOc4ScTNRt0ikkrZLHmm9660vQqMj3D4ZDGXoq0'
//			}
//		},
//		{ name:'facebook',
//			keys:{
//				clientID: '489401617834223',
//				clientSecret: 'ddcc8283dd1f3e345e7eda08a44e7526'
//			}
//		}]
//
//  4. Add icon + links to the login ui.
//  5. Test.

module.exports = function() {

  var util = require('util');
  var path = require('path');
  var user_contrib = require('./lib/user')();

  var SocialPlugin = function(){
  	this.templates = path.join(__dirname, 'views');
  	this.static_files = {
  		root: __dirname,
  		files: {
				js: {
					main: []
				}
			}
  	};
  };

  SocialPlugin.prototype.init = function(opts) {

		var that = this;

		opts.eventbus.once('defined-user-schema', function(mongoose, userSchemaDef){
			user_contrib.defineUserSchema(mongoose, userSchemaDef);
		});

		opts.eventbus.once('compiled-user-schema', function(mongoose, userSchema){
			user_contrib.initUserSchema(mongoose, userSchema);
		});

		opts.eventbus.once('user-model-ready', function(User){
			that.User = User;
			user_contrib.initUser(User);
		});

  	opts.eventbus.once('initialised-passport', function(passport){
			that.passport = passport;
		});

		opts.eventbus.once('initialised-personalisation', function(my){
			my.navigation.contribute(function(to, language, l10n, user) {
        if (user) {
          to.push({
            group: l10n.profile.my_profile,
            class: 'my',
            entries: [{
              link: util.format('/lang/%s/connect/', language.code),
              label: l10n.profile.social_connections,
              class: 'fancybox',
              attrs: [{
                name: 'data-fancybox-type',
                value: 'iframe'
              }]
            }]
          });
        }
      });
		});

    opts.eventbus.once('initialised-web-server', function(app, service){
			var handleAuthCallback = function(req, accessToken, refreshToken, profile, done) {
				that.User.findOrCreateWithSocialProfile(req.user, profile,
					function(err, user, info){
						if (err) { return done(err); }
						done(null, user, info);
					}
				);
			};

			var providers = opts.config.social;
			var domain = opts.config.urls.www;

			for (var i=0; i<providers.length; i++) {
				var provider = providers[i];
				var Strategy = require('passport-' + provider.name).Strategy;
				provider.keys.callbackURL = domain + '/auth/' + provider.name + '/callback';
				provider.keys.passReqToCallback = true;
				if (provider.fields)
				  provider.keys.profileFields = provider.fields;
				provider.keys.scope = provider.scope;

				that.passport.use(new Strategy(provider.keys, handleAuthCallback));

				console.log(provider.name + ' authentication enabled.');
			}
			// set up this modules routes
			require('./routes/auth')(app, providers, that.passport, that.User);
    });
  };
  
  SocialPlugin.prototype.toString = function() {
    return 'mq-auth-social'; 
  };

  return new SocialPlugin();
};
