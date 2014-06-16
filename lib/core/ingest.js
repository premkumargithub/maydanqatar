'use strict';

var _ = require('lodash');
var async = require('async');
var util = require('util');

module.exports = function(eventbus, service, config, rb) {

  var poll_interval = config.app.ingest_interval ? config.app.ingest_interval : 15000

  var info = function() {
    console.log.apply(console, arguments);
  };

  var dbg = function() {
    if (config.mode !== 'production')
      console.log.apply(console, arguments);
  };

  var Ingest = function() {
    this.imgvars = [];

    info("unique image variants:");
    for (var usage in config.media.images) {
      var variants = config.media.images[usage];
      for (var vname in variants) {
        var variant = variants[vname];
        if (!contains(this.imgvars, variant)) {
          this.imgvars.push(variant);
          info("  " + JSON.stringify(variant));
        }
      }
    }
  };

  function contains(array, json) {
    var str = JSON.stringify(json);
    for (var i = 0; i < array.length; i++)
    if (str == JSON.stringify(array[i])) return true;
    return false;
  }

  /*
   * opts: {
   * 	shouldPublish: function(filter){},
   * 	shouldUnpublish: function(filter){},
   * 	mediaSource: { // optional
   * 		related:true | false,
   * 		referenced: true | false
   * 	}
   * }
   * 
   */
  Ingest.prototype.init = function(opts, err, onready) {
    this.shouldPublish = opts.shouldPublish;
    this.publishing = _([]);
    this.shouldUnpublish = opts.shouldUnpublish;
    this.unpublishing = _([]);
    this.mediaSource = opts.mediaSource;
    var that = this;
    
    eventbus.on('source', function(source){
      if (that.shouldPublish(source)) {
        that.publishing.push(source.guid);
        that.ingestModifiedItems(source);
      } else if (that.shouldUnpublish(source)) {
        that.unpublishing.push(source.guid);
        that.ingestUnpublishedItems(source);
      }
    });
    
    eventbus.on('up-to-date', function(source){
      dbg('%s is up to date.', source.guid);      
      that.publishing = that.publishing.reject(function(entry){
        return entry === source.guid;
      });
      that.unpublishing = that.unpublishing.reject(function(entry){
        return entry === source.guid;
      });
      if ((that.publishing.size() === 0) && (that.unpublishing.size() === 0)) {
        eventbus.emit('collect-complete');
      }
    });
    
    /**
     * Note that this particular handler is tuned to the Maydan Qatar content, and
     * may not be appropriate to typical mobile apps...
     */
    eventbus.on('collected', function(payload) {
    	var item = payload.item;
    	if(item.editorial){
    		// Reading out video data for MQ
    		// MQ Main.Url is video url so overriding the original video from the EP item type

    		if (item.editorial.main && item.editorial.main.url){
    			item.video = {
    				url: item.editorial.main.url["1"]
    			};
    		}

    		if(item.editorial.main) {
    			var editorial = item.editorial.main;
    			if(editorial["related news"]) {
    				item.related_news = [];
    					_.each(editorial["related news"], function(link, index){
    						/* link["related news"] has the following format:
    							{
    								"type": "item",
    								"id": "1392820832644529200",
    								"title": "Press Release: New AT&T Toggle Features Enhance BYOD Experience For Employees With Two Lines On One Device",
    								"summary": "",
    								"mime": "text/plain",
    								"modified": "2014-02-19T14:40:32.000Z"
    							}
    						*/
    						item.related_news.push(link["related news"]);
    					});
    			}

    			if (editorial["article source"]) {
    				item.article_source = null;
    				_.each(editorial["article source"], function(source, index) {
    					item.article_source = source;
    				});
    			}

    			if (editorial["comments url"]) {
    				item.comments_url = null;
    				_.each(editorial["comments url"], function(url, index) {
    					item.comments_url = url;
    				});
    			}
    		}
    	}
    });

		if ((config.channel_defs) && (_.keys(config.channel_defs).length > 0)){
			eventbus.on('collected', function(payload){
				var item = payload.item;
                var channel = (service.allChannels) ? service.allChannels.map(item) : null;
				if (!channel) {
					info('article %s not mapped to a channel!', item.id);
				} else {
					item.channel = channel.id;
					payload.channel = channel;
				}
			});
		} else {
			console.log('no channels defined, content will not be mapped to channels.');
		}
    
    eventbus.on('collected', function(payload){
      var item = payload.item;
      var editorial = item.editorial.main;
      if (editorial) {
        item.related_links = [];
        _.each(editorial["related links"], function(link, index){
          item.related_links.push({
            title: link.title,
            url: link.url
          });
        });
      }
    });
        
    /*
     * Massaging the location properties so that we index the location as a geo_point
     * field, allowing us to use spatial queries to find content nearby. An example
     * spatial query:
     *
      GET _search
      { "query": {
          "filtered" : {
              "query" : {
                  "match_all" : {}
              },
              "filter" : {
                  "geo_distance" : {
                      "distance" : "20km",
                      "geo" : {
                          "lon" : 51.4,
                          "lat" : 25.3
                      }
                  }
              }
          }
        }
      }
     */
    eventbus.on('collected', function(payload){
    	var item = payload.item;
      var editorial = item.editorial.main;
      if (editorial) {
        _.each(editorial.locations, function(location, index){
          var tag = {
            scheme: "places",
            id: location.id,
            label: location.label,
          };
          if (location.definition) {
            var parts = location.definition.split(',');
            tag.geo = {
              lon: parts[1],
              lat: parts[0]
            };
            tag.location = location.label + "|LAT:" + parts[0] + "|LON:" + parts[1]; 
          } else {
            info("bad-data: contains a location without geo-codes: %s, %s", location.label, location.id);
          }
          item.tags.push(tag);
        });
          
        _.each(editorial.topics, function(topic, index){
          item.tags.push({
            scheme: "topics",
            id: topic.id,
            label: topic.label
          });
        });
        
        // todo: people
      }
    });

    eventbus.on('collected', function(payload){
        // Reading out video data from items (assuming one video per item)
        // Extended.YoutubeVideo.Video Title is title and Extended.YoutubeVideo.Embed Code is url
        // OR
        // Meta.Url is url and use one media item as image (this will be assumed for all videos)
        
        var item = payload.item;
        var editorial = item.editorial;
        if( editorial ){
            if( editorial.extended && editorial.extended.youtubevideo ){
                var videoData = editorial.extended.youtubevideo["1"];
                item.video = {
                    title: videoData["video title"],
                    url: videoData["embed code"]
                };
            }
            else if( editorial.meta && editorial.meta.link ){
                item.video = {
                    url: editorial.meta.link["1"]
                };
            }
        }
    });

    eventbus.on('before_index', function(payload){
			var media = payload.item.media;
			if (media) {
				for (var i=0; i<media.length; i++) {
					var _media = media[i];
					var date = new Date(Date.parse(_media.modified));
					_media.modified_time = date.getTime();
				}
			}
		});

    // finally, remove the editorial data before indexing
    eventbus.on('before_index', function(payload){
      payload.item.editorial = null;
    });

    console.log('preparing...');
    service.init(eventbus, function(err) {
      if (err) {
        info(err);
      } else {
        info('newspad ready.');
        that.db = service.content;
        eventbus.emit('before-ingest-ready');
        onready();
      }
    });
  };

  Ingest.prototype.collectContinuously = function() {
    var that = this;
    eventbus.once('collect-complete', function(err){
      if (err){
        dbg('Catastrophe: %s', err);
        dbg('Waiting for a bit to see if the world has ended.');
      } else {
        dbg('All up to date.');
      }
      setTimeout(that.collectContinuously.bind(that), poll_interval);
    });
    this.emitSources();
  };

  Ingest.prototype.emitSources = function() {
    var that = this;
    rb.filters({}, function(err, result) {
      if (err) {
        eventbus.emit('collect-complete', err);
      } else {
        for (var i = 0; i < result.filters.length; i++) {
          eventbus.emit('source', {
            title: result.filters[i].title, 
            guid: result.filters[i].guid,
            publish:that.shouldPublish(result.filters[i])  
          });
        }
      }
    });
  };
  
  Ingest.prototype.ingestModifiedItems = function(source) {
    var that = this;
    this.withMostRecentModificationDate({ source:source, published:true }, function(err, since) {
      if (err) {
        info(err);
      } else {
        that.items(source, { since:since }, function(item, done) {
          that.collectItem(item, source, done);
        }, function(err) {
          if (err) {
            info(err);
          } else {
            eventbus.emit('up-to-date', source);
          }
        });
      }
    });
  };
  
  Ingest.prototype.ingestUnpublishedItems = function(source) {
    var that = this;
    this.withMostRecentModificationDate({ source:source, published:false }, function(err, since) {
      if (err) {
        info(err);
      } else {
        that.items(source, { since:since }, function(item, done) {
          that.unpublishItem(item, source, done);
        }, function(err) {
          if (err) {
            info(err);
          } else {
            eventbus.emit('up-to-date', source);
          }
        });
      }
    });
  };

  Ingest.prototype.items = function(source, options, each, oncomplete) {
    var that = this;
    options = _.merge({}, {
      start: 1,
      size: 10
    }, options);
    options.filter = source.guid;

    rb.items(options, function(err, result) {
      if (err) {
        oncomplete(err);
      } else {
        if (result.items.length === 0) {
          oncomplete();
        } else {
          dbg("fetching %d-%d most recently-modified from %s", options.start, options.start + options.size - 1, source.guid);
          var curried = _.curry(each);
          var tasks = result.items.reduce(function(result, item, index) {
            result.push(curried(item));
            return result;
          }, []);
          async.series(tasks, function(){
            if (result.range.hasNext()) {
              var next = result.range.next();
              next = _.merge({}, options, next);
              // defer to avoid stack overflow when collecting very large filters
              _.defer(_.bind(that.items, that, source, next, each, oncomplete));
            } else {
              oncomplete();
            }
          });
        }
      }
    });
  };

  Ingest.prototype.collectItem = function(summary, source, done) {
    var that = this;
    rb.item({
    	id:summary.id,
    	mediaSource:this.mediaSource
    },function(err, item) {
      if (err) {
        info(err);
        done(); // deliberately don't pass the error out or the rest of the 
                // batch will not be processed ... probably this should be
                // done by passing a callback that ignores the error, not
                // unilaterally making the decision here
      } else {
        item.filter = source.guid; // keep the source for future ref
        that.collectMedia(item, function() {
        	var payload = { item: item };
          eventbus.emit('collected', payload);
          eventbus.emit('before_index', payload);
          that.db.index(item, function(err, res) {
            if (err) {
              info(err);
              done(); // as above, not propagating the error
            } else {
              eventbus.emit('after_index', payload);
              done();
            }
          });
        });
      }
    });
  };
  
  Ingest.prototype.unpublishItem = function(summary, source, done) {
    var that = this;
    eventbus.emit('before_unpublish', summary);
    that.db.unpublish({ 
      id: summary.id,
      modified: summary.modified,
      source: source.guid
    }, function(err) {
      if (err) {
        info(err);
        done(); // don't propagate the error so that we don't skip the rest
                // of the unpublishing batch
      } else {
      	info('unpublished item ' + summary.id);
        eventbus.emit('after_unpublish', summary);
        done();
      }
    });
  };
  
  Ingest.prototype.collectMedia = function(item, oncomplete) {
    var tasks = [];
    for (var i = 0; i < item.media.length; i++) {
      var media = item.media[i];
      if (media.mime.indexOf('image') === 0) {
        for (var j = 0; j < this.imgvars.length; j++) {
          tasks.push(_.bind(this.collectImage, this, media, this.imgvars[j]));
        }
      }
    }
    async.series(tasks, oncomplete);
  };

  Ingest.prototype.collectImage = function(img, conf, oncomplete) {
    var media = this.db.media({
      id: img.id,
      modified: img.modified,
      mime: img.mime
    });
    var variant = media.variant(conf);
    var out = variant.writeStream();
    rb.media({
        id: img.id,
        w: conf.w,
        h: conf.h
      },
      out, 
      function(err) {
        if (err) {
          info("error in " + img.id);
          info(err);
        }
        oncomplete();
      }
    );
  };

  Ingest.prototype.withMostRecentModificationDate = function(opts, callback) {
    var that = this;
    this.db.empty(opts, function(empty) {
      if (empty) {
        callback(null, new Date(0));
      } else {
        that.db.search({
        	index: opts.published ? that.db.published : that.db.unpublished,
          type: opts.published ? 'article' : 'unpublished',
          query: {
            term: {
              filter:opts.source.guid
            }
          },
          sort: {
            modified: {
              order: "desc"
            }
          },
          fields: ["modified"],
          from: 0,
          size: 1
        },
        function(err, res) {
          if (err) {
            callback(err);
          }
          if (res && res.hits && res.hits.length > 0) {
            var lastModified = new Date(Date.parse(res.hits[0].fields.modified));
            var modifiedSince = new Date(lastModified.getTime()+1001);

            callback(null, modifiedSince);
          }
          else {
            dbg("collecting all changes to %s", opts.source.guid);
            callback(null, new Date(0));
          }
        });
      }
    });
  };

  return new Ingest();
};
