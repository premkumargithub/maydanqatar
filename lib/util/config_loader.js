module.exports = function(rootDir){

  var
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

  var config = require(path.join(rootDir, 'config'))();
  var personal_config = path.join(rootDir, process.env.USER + '-config.js');
  if (fs.existsSync(personal_config)) {
    console.log('found "%s", overriding default config.', personal_config);
    personal_config = require(personal_config)();
    config = _.merge(config, personal_config);
  } else {
    console.log('no "%s" found, going with default config.', personal_config);
  }
  return config;

};