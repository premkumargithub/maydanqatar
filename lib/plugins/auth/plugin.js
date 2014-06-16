module.exports = function() {

  var util = require('util');
  var path = require('path');
  var passport = require('passport');

  var AccountsPlugin = function(){
		this.i18n = {
    };
    this.templates = path.join(__dirname, 'views');
  };
  
  AccountsPlugin.prototype.getRegistry = function(){
		return this.registry;
  };

  AccountsPlugin.prototype.init = function(opts) {

    opts.eventbus.once('configuring-router', function(app){
    	app.use(passport.initialize());
      app.use(passport.session());

      opts.eventbus.emit('initialised-passport', passport);
    });

		opts.eventbus.once('initialised-personalisation', function(my){
			my.navigation.contribute(function(to, language, l10n, user) {
        if (user) {
          to.push({
            group: l10n.profile.my_profile,
            class: 'my',
            entries: [{
              link: util.format('/lang/%s/logout/', language.code),
              label: l10n.site.logout,
              fa: 'fa-sign-out',
              class: 'logout',
            }]
          });
        } else {
          to.push({
            group: l10n.profile.my_profile,
            class: 'my',
            entries: [{
              link: util.format('/lang/%s/login/', language.code),
              label: l10n.site.login,
              class: 'fancybox',
              fa: 'fa-sign-in',
              attrs: [{
                name: 'data-fancybox-type',
                value: 'iframe'
              }, {
                name: 'tabindex',
                value: '1'
              }]
            },
            {
              link: util.format('/lang/%s/register/', language.code),
              label: l10n.site.register,
              class: 'fancybox',
              fa: 'fa-pencil-square-o',
              attrs: [{
                name: 'data-fancybox-type',
                value: 'iframe'
              }, {
                name: 'tabindex',
                value: '2'
              }]
            }]
          });
        }
      });
		});

    // Finalise initialisation by setting up routes, etc.
		opts.eventbus.once('initialised-web-server', function(app, service) {

			passport.serializeUser(function(user, done) {
				done(null, user._id);
			});

			passport.deserializeUser(function(obj, done) {
				service.User.findById(obj, done);
			});

			// set up this modules routes
			require('./routes/auth')(app, passport);
		});
	};
  
  AccountsPlugin.prototype.toString = function() {
    return 'mq-auth'; 
  };

  return new AccountsPlugin();
};
