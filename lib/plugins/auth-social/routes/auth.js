module.exports = function(app, providers, passport, users) {

  var util = require('util');

	var registerProviderCallbacks = function(p) {
		for (var i=0; i<p.length; i++) {
			registerOneProvider(p[i].name, p[i].scope);
		}
	};

	var registerOneProvider = function(provider, scope) {
		app.get('/auth/' + provider, passport.authenticate(provider));
		app.get('/auth/' + provider + '/callback',
			passport.authenticate(provider, {
				successRedirect:'/auth/' + provider + '/success/',
				failureRedirect:'/lang/en/#/auth/login/',
				successMessage: true,
				scope: scope
			})
		);
	};

	registerProviderCallbacks(providers);

	app.get('/auth/:provider/success/', function(req, res, next){
		var firstVisit = false;
		if( req.session.messages && req.session.messages[0] === 'new_user' ){
			req.session.messages = [];
			firstVisit = true;
		}
		var profile = users.loadUserProfile(req.user);
		res.render('social_auth_success', {
			user: profile,
			provider: req.params.provider,
			firstVisit: firstVisit
		});
	});

	// todo: should probably trigger a logout if currently logged-in
	app.get('/lang/:language/login/', function(req, res, next){
		var connections = getConnections(providers, req.user, res.locals.i18n);
		if (!req.user) {
			res.render('login', {
				user: null,
				connections:connections
			});
		} else {
			res.send(403); // maybe should logout instead?
		}
	});
	
  app.get('/connect/', function(req, res, next) {
    doConnect(req, res, next);
  });

	app.get('/lang/:language/connect/', function(req, res, next){
		doConnect(req, res, next);
	});
	
	var doConnect = function(req, res, next) {
        var connections = getConnections(providers, req.user, res.locals.i18n);
		if (req.user) {
			res.render('connect', {
				user: req.user,
				connections:connections
			});
		} else {
			res.send(403); // maybe show login?
		}
	};

	var getConnections = function(social, user, l10n) {
		var connections = [];
		for (var i=0; i<social.length; i++) {
			var provider = social[i];
			connections[i] = {
				provider: provider.name,
				label: l10n.profile[provider.name],
				connected: user ? user.isConnected(provider.name) : false
			};
		}
		return connections;
	};

};
