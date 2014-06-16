module.exports = function(app){

	var _ = require('lodash');

	// add a lambda that allows us to easily render
	// json objects from the context into our template output
	app.locals.json = function(text){
		var props = text.split('.');
		var ctx = this;
		for (var i=0; i<props.length; i++){
			ctx = ctx[props[i]];
		}
		return JSON.stringify(ctx);
	};

	var css = {};
	_(app.locals.resources.css).each(function(hrefs, name){
		_(hrefs).each(function(href, index){
			var dir = name.split('_')[0];
			var size = name.split('_')[1];
			if (!css[dir])
				css[dir]={};
			if (!css[dir][size])
				css[dir][size]=[];
			css[dir][size].push(href.name);
		});
	});

	app.locals.css = css;

};