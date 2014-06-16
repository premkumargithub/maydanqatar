var fs = require('fs');
var gm = require('gm');
var crypto = require('crypto');

var imageMagick = gm.subClass({ imageMagick: true });

module.exports = function(service){
	
	var ImageManager = function(){
	};
	
	/**
	Callback will have signature (id) 
	*/
	ImageManager.prototype.fileContentAddressableId = function( path, callback ){
    var fd = fs.createReadStream(path);
    var hash = crypto.createHash('md5');
    hash.setEncoding('hex');
    fd.on('close', function() {
      hash.end();
      callback(hash.read());
    });
    fd.pipe(hash);
	};
	
	/**
	Callback will have signature (err) 
	*/
	ImageManager.prototype.scaleProfileImage= function(srcPath, dstPath, callback){
		imageMagick(srcPath).size( function(err, size) {
			if (err){
		  	console.log('Error fetching image size ' + err );
			} else {
				
				var scaled = function( error, file ){
					if (error){
						console.log('Resize image failed: '+error);
					} else {
						imageMagick(file).size( function(sError, newSize){
							var x = newSize.width/2 - 100;
							this.crop(200,200,x,0).stream( function(err, stdout, stderr) {
								if( err ){
									callback(err);
								} else {
									var writeStream = fs.createWriteStream(dstPath);
									stdout.on('end', function(){
										callback(null);
									});
									stdout.on('close', function(){
										fs.unlink(file, function (err) {
											if (err){
												console.log('Failed to delete temporary profile image file: ' + file );
											} 
										});
									});
									stdout.pipe(writeStream);
								}
							});
						});
					} 
				};
				
				var scaled_file_name = srcPath + '.resized';
				if ( size.height > size.width ){
					this.resize(200).write(scaled_file_name, function(error){
						scaled( error, scaled_file_name);
					});
				} else {
					this.resize(null,200).write(scaled_file_name, function(error){
						scaled( error, scaled_file_name);
					});
				}
			}
		});
	};
	
	/*callback will have err and image url?*/
	ImageManager.prototype.uploadImage = function (media, variant, srcPath, callback){
		
		this.fileContentAddressableId( srcPath, function(id){
			media.id = id;
			var imageMedia = service.content.media(media);
			var imageVariant = imageMedia.variant(variant);
			imageVariant.exists( function(exists){
				if( exists ){
					var url = service.predictMediaUrl(media, variant);
					callback(null, url);
				} else {
					var out = imageVariant.writeStream();
					var stream = fs.createReadStream(srcPath);
					
					stream.on('end', function(){
						if( callback ) callback( null, service.predictMediaUrl(media, variant) );
					});
					stream.on('error', function(error){
						if( callback ) callback(error, null); 
					});
					out.on('error', function(error){
						if( callback ) callback(error, null); 
					});
					
					stream.pipe(out);
				}
			});
		});
		
	};
	
	return new ImageManager();
};