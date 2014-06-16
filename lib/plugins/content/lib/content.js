'use strict';

var 
  _ = require('lodash'),
  elastical = require('elastical'),
  fs = require('fs'),
  async = require('async');

module.exports = function(mongoose) {
 
var DEFAULT_QUERY_OPTS =  {
	type: 'article',
	from: 0,
	size: 20,
	fields: [
		"id", "title", "summary", "lang", "source", "byline", "published",
		"tags.special", "tags.topic", "tags.source", "media", "video",
		"venue", "schedule" ]
};

/*
 * first param, elastic, should include -
 * {url:"elastic-host",index:"index-name"}
 *
 * second param, filestore, should include -
 * {root:"absolute-path-to-fs-root"}
 */
var Content = function(elastic, filestore) {
	this.elastic = new elastical.Client(elastic.connect.url, elastic.connect);
	this.filestore = filestore;
	this.config = elastic;
	
	console.log("connected to elastic search @ " + elastic.connect.url + ":" + elastic.connect.port);

	this.queryOpts = _.merge({}, DEFAULT_QUERY_OPTS, { index:elastic.connect.index});
};

// static method
Content.mapById = function(articles) {
	if ((!articles) || (articles.length === 0))
			return {};
	var result = {};
	for (var i=0; i<articles.length; i++) {
		result[articles[i].id] = articles[i];
	}
	return result;
};

Content.prototype.newIndex = function(opts, done) {
  var that = this;
  this.elastic.indexExists(opts.name, function(err, exists){
    if (err) {
      done(err);
    } else if (!exists) {
      console.log("preparing elastic-search index: " + opts.name);
      that.elastic.createIndex(opts.name, that.config.create, done);
    } else {
      done();
    }
  });
};

Content.prototype.init = function(callback) {
  this.published = this.config.connect.index;
  this.unpublished = this.config.connect.index + '-unpublished';
	var that = this;

	async.parallel([
    function(done) {
      that.newIndex({ name:that.published }, done);
    },
    function(done){
      that.newIndex({ name:that.unpublished }, done);
    }
	], callback);
};

Content.prototype.empty = function(opts, callback) {
  this.elastic.count({
		index: opts.published ? this.published : this.unpublished,
		type: opts.type ? opts.type : 'article'
	},
	function(err, count){
		if (err) {
			callback(err, null);
		} else {
			callback(null, count===0);
		}
	});
};

/* make sure that the json passed in here matches the mapping
 * of article in config.js! (i'm not saying you must use the
 * format currently in config.js, i'm saying change config.js
 * if you want to change the article format ;) )
 */
Content.prototype.index = function(json, callback) {
	this.elastic.index(
		this.published,
		"article",
		json,
		{	id:json.id },
		callback
	);
};

Content.prototype.unpublish = function(opts, callback) {
  var that = this;
  // first, delete the published document from the 'published' index
  this.elastic.delete(this.published, "article", opts.id, null, function(err, res){
    if (err) {
    	// failed to delete, but probably should go ahead and try to
    	// create the unpublish doc anyway.
      console.log(err);
    }


		// if the published document was deleted, insert a tiny document
		// containing the id of the unpublished doc and its modified timestamp.
		that.elastic.index(
			that.unpublished, 'unpublished', {
				id: opts.id,
				modified: opts.modified,
				filter: opts.source
			},
			{	id: opts.id },
			function(err) {
				if (err) {
					console.log(err);
				}
				callback(err);
			}

		);
  });
};

Content.prototype.search = function(query, callback) {
	var q = _.merge({}, { index:this.queryOpts.index, type:'article' }, query);
	this.elastic.search(q, callback);
};

Content.prototype.facets = function(options, callback) {
  if (!options.query)
    callback(new Error('no query supplied'));
  if (!options.query.facets)
    callback(new Error('not a facet query!'));
  this.elastic.search(
    _.merge({}, this.queryOpts, options.query),
    function(err, results, response){
      if (err) {
        callback(err);
      } else {
        callback(null, response.facets);
      }
    }
  );
};

Content.prototype.articles = function(options, callback) {
  var q = _.merge({}, this.queryOpts, options.query, function choose(a,b){ return b; });
  if (options.range) {
    q.from = options.range.start;
    q.size = options.range.size;
  }
	var that = this;
	this.elastic.search(q,
		function(err, results, response) {
			// todo: better result object, eg. including range
			if (err) callback(err,null);
			else {
				var result = [];
				var hits = response.hits.hits;
				for (var i=0; i<hits.length; i++) {
					var article = hits[i].fields;
					that.ensureMediaTimestamp(article);
					result.push(article);
				}
				if (options.range)
          options.range.total = response.hits.total;
				callback(null, { results:result, range:options.range});
			}
		});
};

// safety check for the case where content was ingested without
// the timestamp.
Content.prototype.ensureMediaTimestamp = function(article){
	if (article.media) {
		for (var j=0; j<article.media.length; j++) {
			var media = article.media[j];
			if (media.modified_time) {
				return;
			} else {
				var date = new Date(Date.parse(media.modified));
				media.modified_time = date.getTime();
			}
		}
	}
};

Content.prototype.article = function(id, callback) {
	var that = this;
	this.elastic.search({
		index:this.config.index,
		type:"article",
		query:{
			term:{
				id:id
			}
		}
	}, function(err, result, response) {
		if (err) {
			callback(err);
		} else {
			if (response.hits.hits.length > 0) {
				var article = response.hits.hits[0]._source;
				that.ensureMediaTimestamp(article);
				callback(null, article);
			} else {
				callback(null, null);
			}
		}
	});
};

/* An enclosure for variants of a piece of media,
 * for example different sized versions of the same
 * image would each be a variant enclosed by the
 * same Media.
 *
 * The media param should be an object like:
 * {
 *   id:"1234",
 *   modified:dateobject,
 *   mime:mimetype
 * }
 */
Content.prototype.media = function(media) {
  return new Media(this.filestore, media);
};

// TODO: need an abstraction for file storage, so we can support other
//       repository implementations, for example cloud storage a la S3,
//       rackspace cloudfiles, etc.
var Media = function(filestore, media) {
	this.id = media.id;
	this.modified = media.modified;
	this.mime = media.mime;
	var root = filestore.root + this.id;

	if (!fs.existsSync(root))
		fs.mkdirSync(root);

	var time = (this.modified instanceof Date) ? this.modified.getTime() : this.modified;
	this.path = filestore.root + this.id + "/" + time + "/";

	if (!fs.existsSync(this.path))
		fs.mkdirSync(this.path);
};

Media.prototype.variant = function(variant) {
	return new Variant(this, variant);
};

var Variant = function(media, variant) {
	this.w = variant.w;
	this.h = variant.h;

	var wbyh = this.w + "x" + this.h;
	this.path = media.path + wbyh;
	this.etag = media.id + wbyh + media.modified;
};

Variant.prototype.exists = function(callback){
	fs.exists(this.path, callback);
};

Variant.prototype.writeStream = function() {
	return fs.createWriteStream(this.path);
};

Variant.prototype.readStream = function() {
	return fs.createReadStream(this.path);
};

return Content;
};
