var path = require("path");
var _ = require("lodash");

module.exports = function(config) {
	var CommentsPlugin = function(){
		this.static_files = {
      root: __dirname,
      files: {
        js: {},
        css: {}
      }
    };
    this.templates = path.join(__dirname, 'views');
  };
  
  CommentsPlugin.prototype.init = function(opts) {

    var forum = null;

    opts.eventbus.once('initialised-service', function(service){
       forum = require("./lib/comments")(opts.mongoose, opts.config);
       service.forum = forum;
    });

    opts.eventbus.on('after_index', function(payload){
      forum.saveForum({
        url: opts.service.predictUrl(payload.item),
        lang: payload.item.lang
      }, function (err, result) {
        if (err) {
          console.log('Failed to create forum for %s with id %s, due to %s', payload.item.venue ? 'event' : 'article', payload.item.id, err);
        }
      });
    });

    opts.eventbus.once('initialised-web-server', function(app, service){
    	service.registerSummaryDecorator(function(data, next) {
    		if (data.target) {
    			var articlesByUrl = {};
    			var urls = [];
    			_.each(data.target, function(article){
    				var url = service.predictUrl(article);
    				articlesByUrl[url] = article;
    				urls.push(url);
  				});
  				forum.commentCounts({urls:urls}, function(error, result){
  					if( error ){
  						console.log('Could not fetch comments counts');
  						next();
  					} else {
  					  _.each(result, function(entry){
    				    articlesByUrl[entry.url].commentCount = entry.commentCount;
  				    });
  				    next();
  				  }
  				});
  			} else {
  				next();
  			}
  		});
  		
  		require('./routes/comments_api')(config, app, service);
  	});

  };
		  
  CommentsPlugin.prototype.toString = function() {
    return "forum";
  };

  return new CommentsPlugin();
};
