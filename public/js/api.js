$.on('ready', function(){

	var prefix = '/lang/' + app.language + '/api/';

	var objectifyContent = function(item){
		if (item.published) {
			item.published = $.parseDate(item.published);
		}
		if (item.modified) {
			item.modified = $.parseDate(item.modified);
		}
		if (item.schedule) {
			var s = item.schedule;
			s.start_date = $.parseDate(s.start_date);
			s.end_date = $.parseDate(s.end_date);
		}
		if (item.media){
			$(item.media).each(function(media){
				media.modified = $.parseDate(media.modified);
			});
		}
		return item;
	};
	
	
	var objectifyForum = function(forum) {
		$(forum.comments).each(function(comment){
			objectifyComment(comment);
			$(comment.replies).each(function(reply){
				objectifyComment(reply);
			});
		});
		return forum;
	};
	
	var objectifyComment = function (item) {
		if (item.timestamp) {
			item.timestamp = $.parseDate(item.timestamp);
		}
		return item;
	};

  var Cursor = function(opts){
    // load a batch of data, given a range and a callback
    this.load = opts.load;
    this.rangeSize = (opts.rangeSize ? opts.rangeSize : app.config.paging.size);
  };
  Cursor.prototype = {
    prepareResult: function(data, range){
      var that = this;
      var rows = [];
      $(data).each(function(row, index){
        row.__index = range.start+index;
        rows.push(row);
      });
      return {
        rows: rows,
        hasNext: function(){
          return (that.end) ? (that.end.end < that.end.total) : (that.start.end < that.start.total);
        },
        hasPrevious: function(){
          return that.start.start > 1;
        }
      };
    },
    init: function(range, callback){
      var that = this;
      this.load(range, function(result){
        that.start = result.range;
        callback(that.prepareResult(result.results, result.range));
      });
    },
    next: function(callback){
      var that = this;
      this.start = (this.end ? this.end : this.start);
      this.end = {
        start: that.start.end+1,
        end: Math.min(that.start.end+that.rangeSize, that.start.total),
        size: that.start.size,
        total: that.start.total
      };
      this.load(that.end, function(result){
        callback(that.prepareResult(result.results, result.range));
      });
    },
    prev: function(callback){
      var that = this;
      this.end = this.start;
      this.start = {
        start: Math.max(1, that.end.start-that.rangeSize),
        end: Math.max(that.rangeSize, that.end.start-1),
        size: that.start.size,
        total: that.start.total
      };
      this.load(that.start, function(result){
        callback(that.prepareResult(result.results, result.range));
      });
    }
  };

  app.api = {
    Cursor: Cursor,
	  comments: {
      commentPrefixURL : function(opts) {
        return prefix + 'forums/' + encodeURIComponent(opts.forumURL);
      },
      load : function(opts) {
        opts.url = this.commentPrefixURL(opts) + '/';
        var delegate = opts.success;
        opts.success = function(data) {
          var result = objectifyForum(data);
          delegate(result);
        };
        $.ajax(opts);
      },
      add : function(opts) {
        opts.url = this.commentPrefixURL(opts) + '/comments/';
        opts.data = JSON.stringify(opts.comment);
        opts.type = 'POST';
        var delegate = opts.success;
        opts.success = function(data) {
          var result = objectifyForum(data);
          delegate(result);
        };
        $.ajax(opts);
      },
      reply : function(opts) {
        opts.url = this.commentPrefixURL(opts) + '/comments/' + opts.commentId + '/replies/';
        opts.data = JSON.stringify(opts.reply);
        opts.type = 'POST';
        var delegate = opts.success;
        opts.success = function(data) {
          var result = objectifyForum(data);
          delegate(result);
        };
        $.ajax(opts);
      }
    },

    heart_add: function(opts){
      opts.url = prefix + 'hearts/add/';
      opts.type = 'POST';
      opts.data = JSON.stringify(opts.payload);
      $.ajax(opts);
    },
    heart_remove: function(opts){
      opts.url = prefix + 'hearts/remove/';
      opts.type = 'POST';
      opts.data = JSON.stringify(opts.payload);
      $.ajax(opts);
    },

    share : {
    	load : function (opts) {
    	 	opts.url = prefix + 'sharers/';
    	 	$.ajax(opts);
    	}
    },

  	akhbari: {
  	  load: function(opts){
  	    opts.url = prefix + 'akhbari/';
        if (opts.range)
          opts.url += opts.range.start + '-' + opts.range.end + '/';
        var delegate = opts.ok;
        opts.ok = function(data){
          $(data.results).each(function(item){
            objectifyContent(item);
          });
          delegate(data);
        };
        $.ajax(opts);
      }
  	},

  	search: {
  	  combo: function(q, opts) {
        opts.url = prefix + 'combo-search/' + q + '/';
  	    var delegate = opts.ok;
  	    opts.ok = function(data){
          $(data.articles.results).each(function(item){
            objectifyContent(item);
          });
          $(data.events.results).each(function(item){
            objectifyContent(item);
          });
          delegate(data, opts.ok);
  	    }
  	    $.ajax(opts);
  	  },
  	  simple: function(q, type, opts){
  	    opts.url = prefix + 'search/' + type + '/' + q + '/';
  	    if (opts.range)
  	      opts.url += opts.range.start + '-' + opts.range.end + '/';
  	    var delegate = opts.ok;
  	    opts.ok = function(data){
          $(data.results).each(function(item){
            objectifyContent(item);
          });
          delegate(data, opts.ok);
  	    }
  	    $.ajax(opts);
  	  }
  	},

  	medani: {
  	  load: function(opts, id){
        opts.url = prefix + 'medani/';
        if (id){
          opts.url += id + '/';
        }
        var delegate = opts.ok;
        opts.ok = function(data){
          delegate(data.user);
        };
        $.ajax(opts);
      },
      tags: function(opts){
      	opts.url = prefix + 'medani/';
        if (opts.id){
          opts.url += opts.id + '/';
        }
        opts.url += 'tags/'
        var delegate = opts.ok;
        opts.ok = function(data){
          delegate(data.user);
        };
        $.ajax(opts);
      },
      posts: function(opts){
      	opts.url = prefix + 'akhbari/1-5/';
        var delegate = opts.ok;
        opts.ok = function(data){
          $(data.results).each(function(item){
            objectifyContent(item);
          });
          delegate(data);
        };
        $.ajax(opts);
      }
  	},
  	
  	profile: {
  		displayName: {
  			post: function(opts){
  				doPost(prefix+'profile/display-name/', opts);
  			}
  		},
  		about: {
  		  post: function(opts){
  			  doPost(prefix+'profile/about/', opts);
  		  }
  		},
  		avatar: {
  			upload: function(opts){
  				opts.url = prefix+'profile/avatar/';
					$.ajax({
						type: 'POST',
						contentType: 'multipart/form-data',
						url: opts.url,
						data: opts.form,
						success: function(data){
							opts.ok(data);
						},
						error: opts.fail,
						after: opts.after
					});
  			},
  			system: function(opts){
  				doPost(prefix+'profile/avatar/system/', opts);
  			},
  			get: function(opts){
  				opts.url = prefix + 'profile/avatars/';
      		$.ajax(opts);
  			}
  		}
  	},

    messages: {
      load: function(id, opts){
        var threadId = id;
        opts.url = prefix + 'messages/' + threadId + '/';
        $.ajax(opts);
      },
      loadInbox: function(opts){
        opts.url = prefix + 'messages/me/threads/';
        var delegate = opts.ok;
        opts.ok = function(data){
          delegate(objectifyContent(data));
        };
        $.ajax(opts);
      },
      saveReply: function(id,opts){
        var threadId = id;
        doPost(prefix + 'messages/' + threadId + '/replies', opts);
      },
      shareMessage: function(opts) {
        doPost(prefix + 'messages/', opts);
      },
      searchUser: function(opts) {
        var search = opts.form.userString;
        opts.url = prefix + 'user/search/' + search + '/';
        $.ajax(opts);
      }
    },

  	articles: {
  	  load:function(id, opts){
        opts.url = prefix + 'articles/' + id + "/";
        var delegate = opts.ok;
        opts.ok = function(data){
          delegate(objectifyContent(data));
        };
        $.ajax(opts);
      },
      recommended: function(id, opts){
      	opts.url = prefix + 'recommended-articles/' + id + '/';
      	var delegate = opts.ok;
      	opts.ok = function(data){
      		$(data.results).each(function(item){
      			objectifyContent(item);
      		});
      		delegate(data);
      	};
      	$.ajax(opts);
      }
    },

		events:{
		  load:function(id, opts){
        opts.url = prefix + 'events/' + id + "/";
        var delegate = opts.ok;
        opts.ok = function(data){
          delegate(objectifyContent(data));
        };
        $.ajax(opts);
      }
    },

		tags: {
      to_follow: function(opts){
        opts.url = prefix + 'start/tags-to-follow/';
        $.ajax(opts);
      },
      followed: function(opts){
        opts.url = prefix + 'tags/followed/';
      },
      following: function(tag, opts){
        opts.url = prefix + 'tags/' + (tag.scheme || tag.type) + '/' + encodeURIComponent(tag.id) + '/' + encodeURIComponent(tag.label) + '/following/';
        $.ajax(opts);
      },
      follow: function(tag, opts){
        opts.url = prefix + 'tags/' + (tag.scheme || tag.type) + '/' + encodeURIComponent(tag.id) + '/' + encodeURIComponent(tag.label) + '/follow/';
        opts.contentType = 'text/plain';
        $.ajax(opts);
      },
      unfollow: function(tag, opts){
        opts.url = prefix + 'tags/' + (tag.scheme || tag.type) + '/' + encodeURIComponent(tag.id) + '/' + encodeURIComponent(tag.label) + '/unfollow/';
        opts.contentType = 'text/plain';
        $.ajax(opts);
      },
      followers: function(tag, opts){
        opts.url = prefix + 'tags/' + (tag.scheme || tag.type) + '/' + encodeURIComponent(tag.id) + '/' + encodeURIComponent(tag.label) + '/followers/';
        if (opts.range)
          opts.url += opts.range.start + '-' + opts.range.end + '/';
        var delegate = opts.ok;
        opts.ok = function(data){
          delegate(data, opts.ok);
        }
        $.ajax(opts);
      },
      follower_count: function(tag, opts){
        opts.url = prefix + 'tags/' + (tag.scheme || tag.type) + '/' + encodeURIComponent(tag.id) + '/' + encodeURIComponent(tag.label) + '/followers/count/';
        $.ajax(opts);
      },
      content: function(tag, opts){
        opts.url = prefix + 'tags/' + (tag.scheme || tag.type) + "/" + encodeURIComponent(tag.id) + '/content/';
        if (opts.range)
          opts.url += opts.range.start + '-' + opts.range.end + '/';
        var delegate = opts.ok;
        opts.ok = function(data){
          $(data.results).each(function(item){
            objectifyContent(item);
          });
          delegate(data, opts.ok);
        }
        $.ajax(opts);
      },
		},
		
    auth: {
      register: function(opts){
        doPost(prefix + 'register/', opts);
      },
      login: function(opts){
        doPost(prefix + 'login/', opts);
      },
      logout: function(opts){
        opts.url = '/logout/';
        $.ajax(opts);
      },
      terms: function(opts){
      	opts.url = prefix + 'terms-and-conditions/';
      	$.ajax(opts);
      },
      requestPasswordReset: function(opts) {
        doPost(prefix + 'forgot_password/', opts);
      },
      passwordReset: {
      	get: function(email, time, token, opts){
      		opts.url = prefix + 'reset-password/'+email+'/'+time+'/'+token+'/';
      		$.ajax(opts);
      	},
      	post: function(opts){
      		doPost(prefix + 'reset-password/', opts);
      	}
      },
      confirmRegistration: {
        confirm: function(email, token, opts){
        	opts.url = prefix + 'validate/'+email+'/'+token+'/';
        	$.ajax(opts);
        },
        request: function(email, opts){
        	opts.url = prefix + 'validate/'+email+'/';
        	$.ajax(opts);
        }
      }
    }
    
  };
  
  var doPost = function( url, opts ){
    $.ajax({
        type: 'POST',
  		url: url,
  		data: JSON.stringify(opts.form),
  		success: function(data){
		    opts.ok(data);
  		},
  		error: opts.fail,
  		after: opts.after
  	});
  };

});