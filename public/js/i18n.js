$.on('ready', function(){

	var format = function(pattern, args){
		return pattern.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[1][number] != 'undefined'
				? args[1][number]
				: match
			;
		});
	}

	var formattable = function(pattern){
		return function(){
			return format(pattern, arguments);
		};
	}

	// haven't attempted to make this work when
	// there's more than one substitution in the format
	var plurals = function(patterns){
		var options = {};
		for (var n in patterns)
			options[n] = formattable(patterns[n])
		return function(i){
			if (options[i])
				return options[i](i,arguments);
			else
				return options.n(i,arguments);
		}
	}

	if (i18n){

		var pluralize = function(o){
		  for (var k in o){
		  	if (k[0] == '$') {
		  		o[k.split('$')[1]] = plurals(o[k]);
		    } else if ((typeof o[k] !== 'string') && (!(o[k] instanceof Array))) {
		    	o[k] = pluralize(o[k]);
		    }
		  }
		  return o;
		}

		i18n = pluralize(i18n);
	}

});