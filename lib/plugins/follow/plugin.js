var util = require('util');
var _ = require('lodash');
var path = require('path');

module.exports = function() {

	var FollowPlugin = function(){
		this.templates = path.join(__dirname, 'views');
		this.static_files = {
			root: __dirname,
			files: {
				js: {},
				css: {}
			}
		};
	};

  FollowPlugin.prototype.init = function(opts) {

    var user_contrib = require('./lib/user')(opts);

		// web application
		// ---------------

  	opts.eventbus.once('defined-user-schema', function(mongoose, userSchemaDef){
			user_contrib.defineUserSchema(mongoose, userSchemaDef);
		});

		opts.eventbus.once('compiled-user-schema', function(mongoose, userSchema){
			user_contrib.initUserSchema(mongoose, userSchema);
		});

		opts.eventbus.once('user-model-ready', function(User){
			user_contrib.initUser(User);
		});

		var config = opts.config;
		opts.eventbus.once('initialised-personalisation', function(my){
			my.navigation.contribute(function(to, language, l10n, user) {
        if (user) {
          var attrs = [{
            name: 'data-partial',
            value: 'main'
          }];
          to.push({
            group: l10n.following.menu_title,
            class: 'my',
            entries: [{
              link: util.format('%s/lang/%s/my/followed/manage/', config.urls.www, language.code),
              label: l10n.following.manage,
              class: 'manage',
              id: 'manage',
              attrs: attrs
            }, {
              link: util.format('%s/lang/%s/my/followed/s/people/1-%s/', config.urls.www, language.code, config.app.pageSize),
              label: l10n.following.my_people,
              class: 'people',
              id: 'people',
              attrs: attrs
            }, {
              link: util.format('%s/lang/%s/my/followed/s/places/1-%s/', config.urls.www, language.code, config.app.pageSize),
              label: l10n.following.my_places,
              class: 'places',
              id: 'places',
              attrs: attrs
            }, {
              link: util.format('%s/lang/%s/my/followed/s/topics/1-%s/', config.urls.www, language.code, config.app.pageSize),
              label: l10n.following.my_topics,
              class: 'topics',
              id: 'topics',
              attrs: attrs
            }]
          });
        }
      });
		});

  	opts.eventbus.once('initialised-web-server', function(app, service){

  		service.registerArticleDecorator(function(opts, next) {
			 	if ((opts.user) && (opts.target)) {
				 	_.each(opts.target.tags, function(tag){
					 	if (opts.user.isFollowing(tag)) {
						 	tag.followed = true;
					 	}
				 	});
			 	}
			 	next();
			});

  		require('./routes/follow_api')({
  		  app: app,
  		  service: service,
  		  eventbus: opts.eventbus
  		});
  	});

  };
  
  FollowPlugin.prototype.toString = function() {
    return "follow-tags";
  };
  
  return new FollowPlugin();
};
