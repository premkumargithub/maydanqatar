module.exports = function() {

	var fs = require('fs');
	var path = require('path');
	var _ = require('lodash');

	var i18n = path.join(__dirname, '../../conf/i18n/');
	var defaults = require(path.join(i18n, 'en.js'));
	var public_i18n = path.join(__dirname, '../../public/js/_gen/i18n/')

	_.each(fs.readdirSync(i18n), function(l10n) {
		if (l10n[0] !== '.'){
			var from = path.join(i18n, l10n);
			var json = "// THIS FILE IS GENERATED, DO NOT MODIFY IT DIRECTLY!\r\n";
			json += "var i18n=" + JSON.stringify(_.merge({}, defaults, require(from))) + ";";
			fs.writeFileSync(path.join(public_i18n, l10n), json);
			console.log('exported %s to %s', l10n, public_i18n);
		} else {
			console.log('ignoring %s', l10n);
		}
	});

}