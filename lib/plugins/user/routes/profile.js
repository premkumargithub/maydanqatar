var fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

module.exports = function(app, service, tempConf, systemAvatars) {
	
	var tempDir = path.join(tempConf, 'avatars');
	if (!fs.existsSync(tempDir))
		fs.mkdirSync(tempDir);
	
	app.post('/lang/:language/api/profile/about/', function(req, res, next){
		if( req.user ){
			editAbout( req.user, req.body.about, function(error, user){
				if( error ){
					res.send(500, {error:error});
				} else {
					res.send(200, {about:user.about});
				}
			});
		} else {
			res.send(500,{error:{code:'login', message:'you are not logged in'}});
		}
	});
	
	app.post('/lang/:language/api/profile/display-name/', function(req, res, next){
		if( req.user ){
			editDisplayName( req.user, req.body.displayName, function(error, user){
				if( error ){
					res.send(500, {error:error});
				} else {
					res.send(200, {displayName:user.displayName});
				}
			});
		} else {
			res.send(500,{error:{code:'login', message:'you are not logged in'}});
		}
	});
	
	app.post('/lang/:language/api/profile/avatar/', function(req, res, next){
		if( req.user ){
			var avatar = req.files.avatarUpload;
			editAvatar( req.user, avatar, function(error, user){
				if( error ){
					res.send(500, {error:error});
				} else {
					res.send(200, {avatar:user.avatar});
				}
			});
		} else {
			res.send(500,{error:{code:'login', message:'you are not logged in'}});
		}
	});
	
	app.post('/lang/:language/api/profile/avatar/system/', function(req, res, next){
		if( req.user ){
			var avatar = req.body.avatar;
			setUserAvatar( req.user, avatar, function(error, user){
				if( error ){
					res.send(500, {error:error});
				} else {
					res.send(200, {avatar:user.avatar});
				}
			});
		} else {
			res.send(500,{error:{code:'login', message:'you are not logged in'}});
		}
	});
	
	app.get('/lang/:language/api/profile/avatars/', function(req, res, next){
		if( req.user ){
			var avatars = [];
			pushUserAvatars(req.user,avatars);
			pushSystemAvatars(avatars);
			res.send(200,{avatars:avatars});
		} else {
			res.send(500,{error:{code:'login', message:'you are not logged in'}});
		}
	});
	
  var editAbout = function( user, about, callback ){
    user.about = about;
    user.save( function(err, result){
      if( err ){
        console.log('Could not save about ' + err);
        callback(err);
      } else {
        callback(null, result); 
      }
    });
  };
  
  var editDisplayName = function( user, displayName, callback ){
    user.displayName = displayName;
    user.save( function(err, result){
      if( err ){
        console.log('Could not save display name ' + err);
        callback(err);
      } else {
        callback(null, result); 
      }
    });
  };
  
  var editAvatar = function( user, avatar, callback ){
		var now = new Date();
		var id = user.id + '-avatar-' + now.getTime();
		
		var src = path.join(tempDir, id);
		var dst = path.join(tempDir, id+'-scaled');
		
		writeTempAvatarFile( avatar, src, function(error){
			if( error ){
				callback(error);
			} else {
				var media = {
					id: id,
					modified: '0'
				};
				var variant = {
					w: 200,
					h: 200
				};
				service.imageManager.scaleProfileImage(src, dst, function(err){
					if( err ){
						callback(err);
					} else {
						fs.unlink(src, function (err) {
							if (err){
								console.log('Failed to delete temporary avatar image file: ' + src );
							} 
						});
						service.imageManager.uploadImage(media, variant, dst, function( uploadErr, url){
							if( uploadErr ){
								callback(uploadErr);
							} else {
								fs.unlink(dst, function (err) {
									if (err){
										console.log('Failed to delete temporary avatar image file: ' + dst );
									} 
								});
								user.uploadedAvatar = url;
								setUserAvatar( user, url, callback);
							}
						});
					}
				});
			}
		});
	};
	
	var setUserAvatar = function( user, avatar, callback ){
		user.avatar = avatar;
		user.save( function(err, result){
			if( err ){
				console.log('Could not save user with avatar ' + err);
				callback(err);
			} else {
				callback(null, result); 
			}
		});
	};
	
	var pushUserAvatars = function( user, avatars ){
		if( user.uploadedAvatar ){
			avatars.push(user.uploadedAvatar);
		}
		if( user.social ){
			_(user.social).each(function(profile){
				if( profile.avatar ){
					avatars.push(profile.avatar);
				}
			});
		}
	};
	
	var pushSystemAvatars = function( avatars ){
		_(systemAvatars).each( function(systemAvatar){
			avatars.push(systemAvatar);
		});
	};
	
	var writeTempAvatarFile = function( file, dst, callback ){
		var tmp = fs.createReadStream(file.path);
		var avatar = fs.createWriteStream(dst);
		
		tmp.on("error", function(err) {
		  callback(err);
		});
		avatar.on("error", function(err) {
		  callback(err);
		});
		tmp.on("close", function() {
		  callback();
		});
		tmp.pipe(avatar);
	};

};