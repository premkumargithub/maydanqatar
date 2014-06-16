module.exports = function(app) {

  var util = require('util');
	
  app.get('/lang/:language/logout/', function(req, res, next){
    doLogout(req, res, next);
  });

  app.get('/logout/', function(req, res, next){
    doLogout(req, res, next);
  });

	var doLogout = function(req, res, next) {
    if (req.user) {
      req.logout();
    }
    res.redirect(util.format('/lang/%s/', res.locals.language.code));
	};
};
