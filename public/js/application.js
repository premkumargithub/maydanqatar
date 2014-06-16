
/*
 * https://developer.mozilla.org/en/docs/Web/API/CustomEvent
 * Patch for adding CustomEvent constructor when it is not defined for android browser and IE
 */
if (typeof window.CustomEvent !== 'function') {
	(function () {
		  function CustomEvent ( event, params ) {
		    params = params || { bubbles: false, cancelable: false, detail: undefined };
		    var evt = document.createEvent( 'CustomEvent' );
		    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		    return evt;
		   };

		  CustomEvent.prototype = window.Event.prototype;

		  window.CustomEvent = CustomEvent;
		})();
}

if (!kv) {

	// ---------------

	var each = function(callback){
		if (this.forEach) {
			this.forEach(callback);
		} else {
			if (this.length) {
				for (var i=0; i<this.length; i++)
					callback(this[i], i, this);
			} else {
				for (key in this)
					if (this.hasOwnProperty(key) && (!(this[key] instanceof Function)))
						callback(this[key], key, this);
			}
		}
	};

	var map = function(callback){
		var result = (typeof this === 'array') ? [] : {};
		this.each(function(e, key, that){
			result[key] = callback(e, key, that);
		})
		return result;
	};

	var find = function(predicate){
		if (this.length){
			for (var i=0; i<this.length; i++)
				if (predicate(this[i]))
					return this[i];
		} else {
			for (key in this)
				if (this.hasOwnProperty(key) && (!(this[key] instanceof Function)))
					if (predicate(this[key]))
						return this[key];
		}
		return;
	};

	var reduce = function(callback, result){
	  this.each(function(e, key, that){
			result = callback(result, e, key, that);
		});
		return result;
	};

	var any = function(predicate){
		var result = this.find(predicate);
		return ((result !== null) && (result !== undefined));
	};

	var filter = function(predicate){
    var result = [];
    this.each(function(item, key){
    	if (predicate(item, key))
    		result.push(item);
    });
    return result;
	};

	var augment = function(o){
		if (typeof o === 'string') {
			o = document.querySelectorAll(o);
			if (o.length === 1)
				o = o[0];
		}

		if (!o.__el){
			var __el = (o == window) ? window : (o == document) ? document : (o instanceof HTMLElement) ? o : document.body;

			o.on = function(name, callback, capture){
				__el.addEventListener(name, callback, capture);
			};

			o.off = function(name, callback, capture){
				__el.removeEventListener(name, callback, capture);
			};

			o.trigger = function(name, payload){
				var event = new CustomEvent(name, {detail: payload});
				__el.dispatchEvent(event);
			};

			o.hasClass = function(name){
				 return new RegExp(' ' + name + ' ').test(' ' + __el.className + ' ');
			};

			o.addClass = function(name){
				if (!hasClass(__el, name))
					__el.className += ' ' + name;
			};

			o.removeClass = function(name) {
				var after = '';
				augment(__el.className.split(' ')).each(function(nm){
					if (nm !== name)
						after += nm + ' ';
				});
				__el.className = after;
			};

			o.each = each;
			o.map = map;
			o.reduce = reduce;
			o.find = find;
			o.any = any;
			o.filter = filter;
		}
		return o;
	};

	var kv = augment(augment);

	kv.defer = function(fn, delay){
		setTimeout(fn, (delay) ? delay : 0);
	};

	kv.throttle = function(delay, fn, ctx){
		var id = 0;

		var throttled = function() {
			var that = (ctx !== undefined) ? ctx : this;
			var args = arguments;

			var exec = function() {
				fn.apply(that, args);
			};

			var clear = function(){
				id = undefined;
			};

			id && clearTimeout(id);
			id = setTimeout(exec, delay);
		};

		if ($.guid) {
			throttled.guid = fn.guid = fn.guid || $.guid++;
		}

		return throttled;
	};

	kv.parseDate = function(iso){
		return new Date(Date.parse(iso));
	};

	// ---------------

	if (window.top.app) {
		window.app = window.top.app;
	} else {
		window.$ = kv;
		var app = kv({});
		window.top.app = app;
		
		app.config = window.config;

		app.getUnhashedUrl = function(){
			var url = ''+window.location;
			if (url.match(/\/lang\//)){
        return url;
			} else {
			  return url.replace('/#/', '/lang/ar/#/');
			}
 		};

 		app.getImageUrl = function(id, modified, w, h){
 			return app.config.urls.image + '/images/' + id + '/' + modified.getTime() + '/' + w + "/" + h + "/";
 		}
 		
 		app.authenticated = $(document.body).hasClass('loggedin');
		app.language = $(document.body).hasClass('en') ? 'en' : 'ar';
		app.direction = $(document.body).hasClass('ltr') ? 'ltr' : 'rtl';
	}

	$(window).on('load', function(){
		$.trigger('ready');
	});
}