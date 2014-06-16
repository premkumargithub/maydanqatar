module.exports = function(app) {

	var fs = require('fs');
	var path = require('path');
	var _ = require('lodash');

	var views = path.join(__dirname, '../../views');

	var collect = function(file, partials) {
		if (fs.existsSync(file)) {
			if (fs.statSync(file).isDirectory()) {
				_.each(fs.readdirSync(file), function(sub) {
					collect(path.join(file, sub), partials);
				});
			} else {
				partials[(path.basename(file, '.hjs'))]=path.relative(views, file);
			}
		} else {
			console.log('partials dir %s does not exist', file);
		}
	};

	app.locals.partials = {};
	collect(path.join(views, 'partials'), app.locals.partials);
}