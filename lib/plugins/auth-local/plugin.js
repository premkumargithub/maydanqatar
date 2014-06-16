module.exports = function(config) {

  var path = require('path');
  var user_contrib = require('./lib/user')();
  
  var LocalAccountsPlugin = function(){
  	this.i18n = {
		};
		this.templates = path.join(__dirname, 'views');
		this.static_files = {
			root: __dirname,
			files:	{
				js: {
						main: [
								'public/js/jquery.ebcaptcha.js',
								'public/js/validator.js',
								'public/js/register.js',
								'public/js/forgot_password.js',
								'public/js/login.js'
							]
				},
				css: {
				}
			}
		};
  };

  LocalAccountsPlugin.prototype.init = function(opts){
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

  	    opts.eventbus.once('initialised-web-server', function(app, service){
			var LocalStrategy = require('passport-local').Strategy;

			that.passport.use(new LocalStrategy({usernameField:'email', passwordField:'password'},
				function(email, password, done) {
					service.User.findOne({ email: email }, function(err, user) {
						if (err) { return done(err); }
						if (!user) {
							return done(null, false, {code:'user_non_existant',message:'Incorrect email.'});
						}
						// if( !user.verified && !user.isPendingVerification() ) {
						//     return done(null, false, {code:'user_inactive',message:'This user has not been verified yet.'})
						// }
						if (!user.validPassword(password)) {
							return done(null, false, {code:'user_wrong_password',message:'Incorrect password.'});
						}
						return done(null, user);
					});
				}
			));

			require('./routes/local_account_api')(app, service, that.User, config, that.passport);
			require('./routes/registration_api')(app, service, that.User, config);
  	});
  };
  
  LocalAccountsPlugin.prototype.toString = function() {
    return 'mq-auth-local';
  };

  return new LocalAccountsPlugin();
};
