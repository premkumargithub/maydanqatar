async = require('async');

var Decorators = function(){
    this.decorators = [];
  };
  
  Decorators.prototype.add = function(decorator) {
    this.decorators.push(decorator);
  };
  
  Decorators.prototype.decorate = function(opts, callback) {
    if (this.decorators.length > 0) {
      async.applyEach(this.decorators, opts, callback);
    } else {
      callback(null, 200, opts);
    }
  };

module.exports = Decorators;
