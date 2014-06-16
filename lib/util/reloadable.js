var fs = require('fs');

var reloadable = function(millis, load){
	var lastLoaded = 0;
	var result = undefined;
	var needsRefresh = function(){
		return (new Date().getTime()-lastLoaded) > millis;
	};
	return {
		get: function(){
			if (needsRefresh()) {
				result = load();
				lastLoaded = new Date().getTime();
			} else {
				// returning from cache
			}
			return result;
		}
	};
};

module.exports = {

	text: function(millis, path){
		return reloadable(millis, function(){
			return fs.readFileSync(path);
		});
	},

	json: function(millis, path){
		return reloadable(millis, function(){
			var json = fs.readFileSync(path).toString();
			return JSON.parse(json);
		});
	}

}