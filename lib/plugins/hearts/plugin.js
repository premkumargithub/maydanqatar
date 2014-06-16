module.exports = function(config) {

  var HeartsPlugin = function(){}

  HeartsPlugin.prototype.init = function(opts){
    opts.service.hearts = require('./lib/hearts')(opts);

    opts.eventbus.once('initialised-web-server', function(app, service){
      require('./routes/hearts_api')(config, app, service);
    });
  };

  HeartsPlugin.prototype.toString = function() {
    return "mq-hearts";
  };

  return new HeartsPlugin();
}