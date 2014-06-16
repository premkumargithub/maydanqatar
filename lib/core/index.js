// dir is the root directory relative to which the application should find its assets,
// so typically you will pass __dirname here.
module.exports = function(dir, config){

	return {
		Core: require('./core')(config),
		Newspad: require('./newspad')(dir, config),
		Ingest: require('./intake')(config),
		Scheduler: require('./scheduler')(config)
	};

};