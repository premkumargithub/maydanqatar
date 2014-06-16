'use strict';

var
 	_ = require('lodash'),
  config = require('./lib/util/config_loader')(__dirname),
  scheduler = new (require('./lib/core/index')(__dirname, config).Scheduler)();

scheduler.schedule({
  plugins:[
    '../plugins/crowns/plugin',
   	'../plugins/hearts/plugin'
  ],
  schedules:[{
    timeout: 15000,
    job: function(opts, done){
      opts.service.crowns.processQueue(done);
    }
  }]
});
