var util = require('util');
var crypto = require('crypto');

module.exports = function(app, service, users, config, passport) {
    
    /*LOGIN*/
    app.post('/lang/:language/api/login/', function (req, res, next){
        passport.authenticate('local', function(err, user, info) {
            if (err) { 
                res.send(500, err); 
            }
            if (!user) {
                res.send(500,info); 
            } else {
                req.login(user, function(err) {
                    if (err) { res.send(500,{code:'login_failed', message: 'Could not log in'}); }
                    else { 
                    	var profile = users.loadUserProfile(user);
                    	res.send(200, profile); 
                    }
                });
            }
        })(req, res, next);
    });
    
    /*RESET PASSWORD*/
    
    //send email for resetting password 
    app.post('/lang/:language/api/forgot_password/', function (req, res, next){
        sendResetPasswordEmail( req.body.email, res.locals.language, function(error, result){
            if( error ){
                console.log(error);
                res.send(500, error);
            } else {   
                res.send(200);
            }
        });
    });
    
    //show forgot password page
	app.get('/lang/:language/api/forgot_password/', function(req, res, next){
		res.render('forgot_password');
	});
	
	//verify the link and show change password page
	//EMAIL LINK
    app.get('/lang/:language/reset_password/:email/:time/:token/', function(req, res, next){
        validateResetPasswordLink(req.params.email, req.params.time, req.params.token, function(error, user){
            if( error ){
               console.log(error);
               res.render('templates/password-reset/reset_password', {error: error, email:req.params.email}); 
            } else {
                res.render('templates/password-reset/reset_password', {email: user.email});
            }        
        });
    });
	
	app.get('/lang/:language/api/reset-password/:email/:time/:token/', function(req, res, next){
      validateResetPasswordLink(req.params.email, req.params.time, req.params.token, function(error, user){
          if( error ){
             console.log(error);
             var resend = false;
             if( user ) resend = true;
             res.send(500,{error:error, resend:resend}); 
          } else {
              res.send(200, {email: user.email});
          }        
      });
  });
  
	app.post('/lang/:language/api/reset-password/', function(req, res, next){
        changeUserPassword(req.body.email, req.body.password, function(error, user){
            if( error ){
              console.log(error);
              res.send(500,error); 
            } else {
                req.login(user, function(err){
                    if( err ){
                        console.log(err);
                    }
                    var profile = users.loadUserProfile(user);
                    res.send(200,profile);
                });
            }
        });
	});
	
    var validateResetPasswordLink = function( email, time, token, callback ){
        users.findByEmail( email, function(error, user){
            if( error ){
                callback(error, user);
            } else {
                if( user ) {
                    if( !acceptResetPasswordTime(time) ) {
                        callback({code:'link_expired',message:'This link has expired'}, user);
                    } else if( !acceptResetPasswordToken(user,time,token) ) {
                        callback({code:'link_invalid',message: 'This link is not valid'}, user);    
                    } else {
                        callback( null, user );
                    }
                } else {
                    callback ( {code:'user_non_existant',message: 'Link invalid: user does not exist', retry: true}, null );
                }
            }
        });
    };
	
	var sendResetPasswordEmail = function( email, language, callback ){
        users.findByEmail( email, function( error, user ){
            if( error) {
                console.log(error);
                callback( error, user );
            } else {
                if( user ) {
                    var options= {
                        template: {
                            language: language,
                            name: 'reset-password',
                            locals: {
                                email: user.email,
                                reset_password_link: generateResetPasswordLink(user, language)
                            }
                        },
                        subject: 'Reset Password',
                        to: user.email,
                        text: 'You have requested to reset your password.'
                    };         
                    service.mailer.sendEmail(options, function(err, result){
                        if(err){
                            console.log('Failed to send email');
                        }
                        callback( err, result);
                    });
                } else {
                    callback ( {code:'user_non_existant',message: 'User does not exist'}, null );
                }
                
            }
        });
	};
	
	var changeUserPassword = function( email, password, callback ){
	    users.findByEmail(email, function(error, user){
            if(error){
               callback(error, user); 
            } else {
                if( user ){
                    user.setPassword(password);
                    user.save(function(err) {
                        if (err) callback(err, null);
                        else callback(null, user);
                    });
                } else {
                    callback({code:'user_non_existant',message:'User does not exist'}, null);
                }
            }
        });
	};
	
    var acceptResetPasswordTime = function( time ){
        var now = new Date();
        var then = new Date(time);
        now.setHours(now.getHours() - 24 );
        if( then.getTime() < now.getTime() )
            return false;
        return true;
    };
    
    var acceptResetPasswordToken = function( user, time, token ){
        return token === resetPasswordToken( user, time );
    };	
	
	var generateResetPasswordLink = function( user, language ) {
        var now = new Date();
        return util.format('%s/lang/%s/#/reset-password/%s/%s/%s/', 
            config.urls.www, language.code, user.email, now.getTime(), resetPasswordToken(user, now.getTime()) );
	};
	
	var resetPasswordToken = function( user, time ){
        var str =  "" + user.email + time + user.password;
        return crypto.createHash('md5').update(str).digest('hex');
	};
	
};
