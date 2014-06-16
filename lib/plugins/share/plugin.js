
module.exports = function(config) {

  var SharingPlugin = function() {

  };

  SharingPlugin.prototype.init = function(opts) {
    opts.eventbus.once('initialised-web-server', function(app, service) {
      require('./routes/share_api')(config, app);
    });

  };

  SharingPlugin.prototype.toString = function() {
    return "share"
  };

  return new SharingPlugin();
};
