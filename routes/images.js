// strictly speaking this isn't a route, but it serves the same purpose
// and is where I suppose everyone will expect to find it, so...

var pattern = /images\/([a-f0-9]*)\/([0-9]*)\/([0-9]*)\/([0-9]*)\//;

module.exports = function(app, service){

	app.use(function(req, res, next){
		var match = req.url.match(pattern);
		if (match) {
			var params = {
				id: match[1],
				modified: match[2],
				w: match[3],
				h: match[4]
			};

			var media = service.content.media(params);
			var variant = media.variant(params);
			variant.exists(function(exists){
				if (exists){
					res.setHeader('Content-Type', 'image/jpg');
					res.setHeader('Cache-Control', 'max-age=31556926'); // one year
					res.setHeader('ETag', variant.etag);
					variant.readStream().pipe(res);
				} else {
					next();
				}
			});
		} else {
			next();
		}
	});

};