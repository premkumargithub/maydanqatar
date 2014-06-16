// NOTE: This file is used both to run ingest during development AND as the source
// for generating the main ingest file for custom applications. This means that you
// need to be quite careful what you add to this file!

'use strict';

var
 	_ = require('lodash'),
 	fs = require('fs'),
 	dateFormat = require('dateformat');

var loadConfig = function(){
  var config = require('./config')();
  var personal_config = process.env.USER + '-config.js';
  if (fs.existsSync(process.env.USER + '-config.js')) {
    console.log('found "%s", overriding default config.', personal_config);
    personal_config = require('./' + personal_config)();
    config = _.merge(config, personal_config);
  } else {
    console.log('no "%s" found, going with default config.', personal_config);
  }
  return config;
}

var config = loadConfig();

dateFormat.masks.date_only = "yyyy-MM-dd";
dateFormat.masks.time_only = "HH:mm:ss";

var intake = new (require('./lib/core/index')(__dirname, config).Ingest)();

// register event-handlers here to do client-specific ingest work, for example
// to modify the article document before it is indexed you can register for
// the 'before-index' event and modify the received payload like this:
//
//   intake.on('before-index', function(payload){
//     payload.item.title = 'haha, i changed it!';
//   });
//

var justDate = function(iso){
	return dateFormat(new Date(Date.parse(iso)), 'date_only');
};

var justTime = function(iso){
	return dateFormat(new Date(Date.parse(iso)), 'time_only');
};

var extractVenue = function(editorial){
	//TODO: should it be main.locations ??
  if ((editorial.main) && (editorial.main.location) && (editorial.main.location['1'])) {
  	var location = editorial.main.location['1'];
  	var tag = {
      scheme: "venue",
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
      return tag;
    }
  }
  return undefined;
};

var extractVideo = function(editorial){
	if(editorial.main && editorial.main['video url'] && editorial.main['video url']['1']){
		var video = {
			url: editorial.main['video url']['1']
			/*later look for caption and thumbnail*/
		};
		return video;
	}
	return undefined;
};

var removeBodyIfStartsWithHttp = function(item){
  if (item.body && item.body.length == 1) {
    var p1 = item.body[0]
    if ((p1.length > 7) && ((p1.substr(0, 7).toLowerCase()) === 'http://')){
      item.body = [];
    }
  }
};

var tags_en = require('./conf/follow/classification_promotion_en.js');
var tags_ar = require('./conf/follow/classification_promotion_ar.js');

var makeTagsFromClassifications = function(item){
  var mappings = (item.lang === 'ar') ? tags_ar : tags_en;
  _(item.cfns).each(function(cfn){
    var mapped = mappings[cfn.scheme + ":" + cfn.id];
    if (mapped) {
      item.tags.push(mapped);
    }
  });
};

var tagReducer = function(schemes){
	return function(result, tag, key){
		if (schemes.find(function(s){ return tag.scheme === s; })) {
			result.push(tag);
		}
		return result;
	};
};

var topicReducer = tagReducer(_(['topic', 'topics', 'places', 'people']));
var sourceReducer = tagReducer(_(['source']));
var specialReducer = tagReducer(_(['special']));

var segregateTags = function(item){
  var seen = {};
	var tags = _(item.tags).filter(function(tag){
		var result = seen[tag.id + tag.scheme];
		if (result === undefined) {
			seen[tag.id + tag.scheme]=true;
			return true;
		} else {
			return false;
		}
	});

  var topics = tags.reduce(topicReducer, []);
  _(topics).each(function(tag){
    tag.scheme = 'topic';
  });
  var sources = tags.reduce(sourceReducer, []);
  _(sources).each(function(tag){
    tag.scheme = 'source';
  });
  var specials = tags.reduce(specialReducer, []);
  _(specials).each(function(tag){
    tag.scheme = 'special';
  });
  item.tags = {
    special: specials,
    topic: topics,
    source: sources
  };
}

var maybeAddVenueAndSchedule = function(item){
  var venue = extractVenue(item.editorial);
	if (venue) {
		// its an event!
		item.venue = venue;
		item.schedule = {
			start_date: item.editorial.main['from date']['1'],
			end_date: item.editorial.main['to date']['1'],
		};
	}
}

var maybeAddVideo = function(item){
  var video = extractVideo(item.editorial);
	if (video){
		item.video = video;
	}
}

intake.on('collected', function(payload){
  var item = payload.item;
  if (item.editorial) {

    if (item.editorial.main){
      var main = item.editorial.main;
      _.each(main.author, function(author, index){
        var tag = {
          scheme: 'source',
          id: author.id,
          label: author.label,
        };
        item.tags.push(tag);
      });
    }

    if (item.editorial.meta){
      var meta = item.editorial.meta;
      _.each(meta['publisher source'], function(publisher, index){
        var tag = {
          scheme: 'source',
          id: publisher.id,
          label: publisher.label,
        };
        item.tags.push(tag);
      });
    }
  }
});

intake.on('before_index', function(payload){
  removeBodyIfStartsWithHttp(payload.item);
  makeTagsFromClassifications(payload.item);
	segregateTags(payload.item);
  maybeAddVenueAndSchedule(payload.item);
	maybeAddVideo(payload.item);
});

intake.init({
	channel_defs: require('./conf/channel_defs')(),
	plugins: require('./conf/plugin_defs')(config),
	notification_defs: require('./conf/notification_defs')(),
	shouldPublish: function(filter) {
		return filter.title.indexOf('MQ Published') === 0;
	},
  shouldUnpublish: function(filter){
		return filter.title.indexOf('Unpublished') === 0;
	}
});