module.exports = function(config) {

  var CrownsPlugin = function(){}

  CrownsPlugin.prototype.init = function(opts){

    opts.service.crowns = require('./lib/crowns')(opts);

    opts.eventbus.on('score-change', function(target){
      opts.service.crowns.enqueue(target, function(err){
        if (err)
          console.log(err);
      });
    });
  };

  CrownsPlugin.prototype.toString = function() {
    return "mq-crowns";
  };

  return new CrownsPlugin();
}