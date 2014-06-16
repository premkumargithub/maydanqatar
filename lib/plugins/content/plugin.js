module.exports = function(config) {

  var util = require('util');
  var path = require('path');
  var _ = require('lodash');
  var Decorators = require('./lib/decorators');

	var ContentPlugin = function(){
		this.static_files = {
			root: __dirname,
			files: {
				js: {},
				css: {}
			}
		};
	};

	ContentPlugin.prototype.initAsync = function(opts, done){

		var that = this;

		opts.service.Content = require('./lib/content')(opts.mongoose);
		opts.service.content = new opts.service.Content(opts.config.elastic, opts.config.filesystem);
   	opts.service.content.init(done);
   	
   	opts.eventbus.on('starting-service', function(service){
			enableArticleDecoration(service, opts.eventbus);
			enableSummaryDecoration(service, opts.eventbus);
			initialiseArticleRetrieval(service);
		});
		
		opts.service.predictUrl = function(item){
		  if (item.venue) {
		    return config.urls.www + '/lang/' + item.lang + '/#/events/' + item.id +'/';
		  } else {
		    return config.urls.www + '/lang/' + item.lang + '/#/articles/' + item.id +'/';
		  }
		};
		
		opts.service.predictMediaUrl = function( media, variant ){
			return config.urls.www + '/images/' + media.id + '/' + media.modified + '/' + variant.w + '/' + variant.h + '/';
		};
	};
	
	/**
	 * plugins can contribute one or more callback methods which are invoked
	 * on loaded full-articles to decorate them with additional info, or in some
	 * way modify the article object.
	 *
	 * the callback method should have the signature:
	 *
	 *   function(opts, err, next)
	 *
	 * where opts will be a json object like:
	 *
	 *   { user:user, target:article }
	 *
	 * the callback MUST invoke err or next, or the application will hang.
	 */
	var enableArticleDecoration = function(service, eventbus) {
		service.articleDecorators = new Decorators();
		service.registerArticleDecorator = function(decorator){
			this.articleDecorators.add(decorator);
		};
		eventbus.emit('accepting-article-decorators', service.registerArticleDecorator.bind(service));
	};

	/**
	 * plugins can contribute one or more callback methods which are invoked
	 * on loaded article summaries to decorate the summary with additional
	 * information, or in some way modify the article summaries.
	 *
	 * the callback method should have the signature:
	 *
	 *   function(opts, err, next)
	 *
	 * where opts will be a json object like:
	 *
	 *   { user:user, target:articles }
	 *
	 * the callback MUST invoke err or next, or the application will hang.
	 */
	var enableSummaryDecoration = function(service, eventbus){
		service.summaryDecorators = new Decorators();
		service.registerSummaryDecorator = function(decorator){
			this.summaryDecorators.add(decorator);
		};
		eventbus.emit('accepting-summary-decorators', service.registerSummaryDecorator.bind(service));
	};

	var initialiseArticleRetrieval = function(service){
		/**
		 * Loads an Article from elastic-search
		 * Callback should be of the form:
		 *
		 *   function(err, article){ ... }
		 */
		service.loadArticle = function(options, callback) {
			var that = this;
			this.content.article(options.id, function(err, article){
				if (err) {
					callback(err, 500);
				} else {
					// TODO: consider what to do when there is no article
					//       for whatever reason ... currently this simply
					//       refuses to invoke the decorators, but that may
					//       not be what we actually want it to do...
					if (article) {
						that.articleDecorators.decorate({
							user:options.user,
							target:article
						},
						function(err) {
							if (err) {
								callback(err, 500);
							} else {
								callback(null, 200, article);
							}
						});
					} else {
						callback(null, 404);
					}
				}
			});
		};

		/**
		 */
		service.loadArticleSummaries = function(ids, user, callback){
			var q = {
				query: {
					terms: {
						_id:ids
					}
				}
			};
			this.loadArticles({ query:q, user:user}, callback);
		};

		service.loadArticles = function(options, callback) {
			var that = this;
			this.content.articles({
				query: options.query,
				range: options.range
			}, function(err, result){
				if (err) {
					callback(err);
				} else {
					that.summaryDecorators.decorate({
						user:options.user,
						target:result.results
					},
					function(err){
						if (err !== null) {
							callback(err, 500);
						} else {
							callback(null, 200, result);
						}
					});
				}
			});
		};
	};

	ContentPlugin.prototype.toString = function() {
		return "mq-content";
	};

	return new ContentPlugin();
};
