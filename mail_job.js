'use strict';

var
 	_ = require('lodash'),
  config = require('./lib/util/config_loader')(__dirname),
  scheduler = new (require('./lib/core/index')(__dirname, config).Scheduler)();

scheduler.schedule({
  plugins:[
    'mailing-async'
  ],
  schedules:[{
    timeout: 60000,
    job: function(opts, done){
      opts.service.mailer.sendBatch(done);
    }
  }]
});

