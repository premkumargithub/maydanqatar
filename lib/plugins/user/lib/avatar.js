var fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

module.exports = function(dir, imageManager){
	var list = [];
	
	if( dir ){
		fs.readdir( dir, function( error, filenames ){
			if( error ){
				console.log('Failed to read avatar directory: ' + dir);
			} else {
				_(filenames).each(function(filename, index){
					var actualName = 'avatar' + (index+1) + '.png';
					var file = path.join(dir, actualName);
					fs.stat( file, function(err, stats){
						if( err ){
							console.log('Failed to get stats on file: ' + file);
						} else {
							if( !stats.isDirectory() ){
								var media = {id:file, modified:0};
								var variant = {w:200, h:200};
								imageManager.uploadImage( media, variant, file, function(uploadErr, url){
									if(uploadErr){
										console.log('Failed to upload avatar image: ' + file );
										console.log( uploadErr );
									} else {
										list.push(url);
									}
								});
							}	
						}
					});			
				});
			}
		});
	}
	return list;
};