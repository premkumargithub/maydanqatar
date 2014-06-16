module.exports = function(config, app) {
  app.get('/lang/:lang/api/sharers', function(req, res) {
	  res.json(config.sharing);
  });
};
  
  