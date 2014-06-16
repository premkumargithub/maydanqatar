$.on('ready', function(){

	app.routes = $({
		arabic:{
			url: '/lang/ar/'
		},
		english:{
			url: '/lang/en/'
		},

		akhbari:{
			url: '#/akhbari/',
			label: i18n.nav.akhbari,
			icon: 'ic icon-home',
			groups:['main'],
			auth:'maybe'
		},
		medani:{
			url: '#/medani/',
			label: i18n.nav.medani,
			icon: 'ic icon-user-thin',
			groups:['main'],
			auth:'yes'
		},
		profile:{
		  url: '#/medani/:id/',
      label: i18n.nav.medani,
      icon: 'ic icon-user-thin',
      groups: []
		},
		noauth_medani:{
      url:'#/auth/register/medani/',
      label: i18n.nav.medani,
      icon: 'ic icon-user-thin',
      groups:['auth','main'],
      auth:'no'
    },
    search:{
      url:'#/search/',
      label: i18n.nav.search,
      icon: 'ic icon-search',
      groups:[],
      auth:'maybe',
      level:0
    },
    combo_search:{
      url:'#/search/:q/',
      label: i18n.nav.search,
      icon: 'ic icon-search',
      groups:[],
      auth:'maybe',
      level:0
    },
    article_search:{
      url:'#/article-search/:q/',
      label: i18n.nav.search,
      icon: 'ic icon-search',
      groups:[],
      auth:'maybe',
      level:1
    },
    event_search:{
      url:'#/event-search/:q/',
      label: i18n.nav.search,
      icon: 'ic icon-search',
      groups:[],
      auth:'maybe',
      level:1
    },

		messages:{
			url:'#/messages/',
			label: i18n.nav.messages,
			icon: 'ic icon-envelope-thin',
			groups:['main'],
			auth:'yes'
		},
//		bookmarks:{
//			url:'#/bookmarks/',
//			label: i18n.nav.bookmarks,
//			icon: 'fa fa-bookmark',
//			groups:['main'],
//			auth:'yes'
//		},
//		calendar:{
//			url:'#/calendar/',
//			label: i18n.nav.calendar,
//			icon: 'fa fa-calendar',
//			groups:['main'],
//			auth:'yes'
//		},
//		post:{
//			url:'#/post/',
//			label: i18n.nav.post_article,
//			icon: 'fa fa-plus',
//			groups:['main'],
//			auth:'yes'
//		},

    tour_video:{
      url: '#/tour_video',
      label: i18n.nav.tour_video,
      icon: 'ic icon-video',
      groups: ['settings'],
      auth: 'maybe'
    },
    feedback:{
			href:'mailto:' + app.config.feedback,
			label: i18n.nav.feedback,
			icon: 'ic icon-envelope-thin',
			groups:['settings'],
			auth:'maybe'
		},
		settings:{
			url:'#/settings/',
			label: i18n.nav.settings,
			icon: 'ic icon-settings',
			groups:['settings'],
			auth:'maybe'
		},
		logout:{
      url:'#/auth/logout/',
      label: i18n.nav.logout,
      icon: 'ic icon-power',
      groups:['settings'],
      auth:'yes'
    },

		login:{
		  url:'#/auth/login/',
      label: i18n.nav.login,
      icon: 'fa fa-sign-in',
      groups:['auth'],
      auth:'no'
		},
		register:{
      url:'#/auth/register/',
      label: i18n.nav.register,
      icon: 'ic icon-user-thin',
      groups:['auth'],
      auth:'no'
    },
    forgot_password:{
      url:'#/auth/forgot-password/',
      label: i18n.nav.forgot_password,
      icon: 'fa fa-key',
      groups:['auth'],
      auth:'no'
    },
    terms:{
      url:'#/auth/terms/',
      label: i18n.nav.terms,
      icon: 'fa fa-check-square',
      groups:['auth'],
      auth:'no'
    },
    confirm:{
    	url:'#/validate/:email/:token/',
    	groups: ['']
    },
    reset_password:{
    	url:'#/reset-password/:email/:time/:token/',
    	groups: ['']
    },
    start:{
      url:'#/start/',
      label: i18n.nav.start,
      icon: 'fa fa-play-circle-o',
      groups:[],
      auth:'yes'
    },
    tag_content: {
			url:'#/tags/content/:type/:id/:label/',
			label: i18n.nav.tag,
			icon: 'ic icon-tag',
			groups: []
		},
		tag_discuss: {
      url:'#/tags/discuss/:type/:id/:label/',
      label: i18n.nav.tag,
      icon: 'ic icon-comment',
      groups: []
    },
    tag_followers: {
      url:'#/tags/followers/:type/:id/:label/',
      label: i18n.nav.tag,
      icon: 'ic icon-comment',
      groups: []
    },
		article: {
			url:'#/articles/:id/',
			label: i18n.nav.article,
			icon: 'fa fa-file-text',
			groups: [],
			level:2
		},
		event: {
			url:'#/events/:id/',
			label: i18n.nav.event,
			icon: 'ic icon-calendar',
			groups: [],
			level:2
		},
    share_to_user: {
      url: '#/maydanuser/:id/share/',
      label:i18n.share.to_maydan_user,
      icon: 'ic icon-tag',
      groups: [],
      auth:'yes'
    },
    share_message:{
      url:'#/messages/:id/share/',
      label: i18n.nav.messages,
      icon: 'ic icon-tag',
      groups:[],
      auth:'yes'
    },
     compose_message:{
      url:'#/composemessage/',
      label: i18n.nav.messages,
      icon: 'ic icon-tag',
      groups:[],
      auth:'yes'
    },
    show_conversation:{
      url:'#/messages/:id/',
      groups:[],
      auth:'yes'
    }

	});

	var compileUrlPattern = function(path, keys, sensitive, strict) {
		if (Object.prototype.toString.call(path) == '[object RegExp]') return path;
		if (path instanceof Array) path = '(' + path.join('|') + ')';
		path = path
			.concat(strict ? '' : '/?')
			.replace(/\/\(/g, '(?:/')
			.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
				keys.push({ name: key, optional: !! optional });
				slash = slash || '';
				return ''
					+ (optional ? '' : slash)
					+ '(?:'
					+ (optional ? slash : '')
					+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
					+ (optional || '')
					+ (star ? '(/*)?' : '');
			})
			.replace(/([\/.])/g, '\\$1')
			.replace(/\*/g, '(.*)');
		return new RegExp('^' + path + '$', sensitive ? '' : 'i');
	};

	var decode = function(str) {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return str;
    }
  };

	app.routes.each(function(route, key){
		route.id = key;
		route.toString = function(params){
		  if (params) {
		    var href = this.url ? this.url : this.href;
        $(params).each(function(param){
          href = href.replace(':' + param.name, encodeURIComponent(param.value));
        });
        return href;
      }
      return this.url ? this.url : this.href;
		};
		route.go = function(params){
		  if (this.url){
        window.location.hash = this.toString(params);
      } else {
        if (this.href) {
          window.location = this.href;
        }
      }
		};
		if (route.groups)
		  route.groups = $(route.groups);

		route.keys = [];
    if (route.url)
		  route.url_pattern = compileUrlPattern(route.url, route.keys);
	});

  var getFragment = function(url){
    var split = url.split("#/");
    return (split.length > 1) ? '#/' + split[1] : undefined;
  };

	var updateCurrentRoute = function(url){
		var hash = url ? getFragment(url) : window.location.hash;
		var previous = app.currentRoute;
		if (previous)
			previous.active = false;

		// if we match a route, make sure we extract the parameters
		// and hand them along with the result (into the 'currentRoute')
		var current = app.routes.reduce(function(result, route){
		  if (route.url_pattern) {
        var m = hash.match(route.url_pattern);

        // return any existing result so that a route that already
        // matched ahead of us will get propagated
        if (result) return result;
        if (!m) return result;

        var params = [];
        for (var i=1, len=m.length; i<len; ++i) {
          var key = route.keys[i-1];
          var val = 'string' == typeof m[i]
            ? decode(m[i])
            : m[i];
          if (key) {
            params[key.name] = val;
          } else {
            params.push(val);
          }
        }
        return {
          route: route,
          params: params
        }
      } else {
        return result;
      }
		});

		// only update current if we can identify this hash fragment as a route
		if (current) {
			if (previous != null)
				previous.route.active = false;
			current.route.active = true;
			app.currentRoute = current;
			// trigger navigation events when
			// we move between routes
			app.trigger('pre-route', {from:previous, to:current});
			app.trigger('route', {from:previous, to:current});
			app.trigger('post-route', {from:previous, to:current});

		} else {
			console.log("'%s' is not a route, heading over to akhbari instead.", hash);
			app.routes.akhbari.go();
		}
	};

	$(window).on('hashchange', function(ev){
		// todo: do we need to do anything about managing the history?
		updateCurrentRoute(ev.newURL);
	});

	updateCurrentRoute();

});