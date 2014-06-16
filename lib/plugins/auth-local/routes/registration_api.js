var validation = require('../public/js/validator.js');
var util = require('util');
var crypto = require('crypto');

module.exports = function(app, service, users, config ) {
    
  var validator = validation.newValidator();

	/*REGISTRATION*/
	app.post('/lang/:language/api/register/', function(req, res, next){
    handleRegistrationPost(req, res, next);
	});
	
	app.post('/api/register/', function(req, res, next){
    handleRegistrationPost(req, res, next);
	});
	
	
	/*CONFIRMATION*/
	app.get('/lang/:language/api/validate/:email/:token/', function(req,res,next){
    if (req.user && req.user.isVerified()){
      res.send(500, { error:{code:'already_done', message: 'This user has already been verified'}});
    } else {
      confirmRegistration(req.params.email, req.params.token, function( error, user, canRegenerate, canRegister ){
        if( error ){
          res.send(500, {error:error, register:canRegister, regenerate:canRegenerate, email:req.params.email});
        } else {
          req.login(user, function( err){
            if( err ){
              console.log(err);
            }
            var profile = users.loadUserProfile(user);
            res.send(200,profile);
          });
        }
      });
    }
	});
	
  app.get('/lang/:language/api/validate/:email/', function(req, res, next){
    if (req.user && req.user.isVerified()){
      res.send(500, {error:{code:'already_done', message: 'This user has already been verified'}, logged_in:true});
    } else {
      users.findByEmail( req.params.email, function( error, user ){
        if (error) {
          res.send(500, {error:{code:'find',message:'Could not fetch user'}});
        } else {
        	if( user ){
        		if( user.isVerified()){
        			res.send(500, {error:{code:'already_done', message: 'This user has already been verified'}});
        		} else {
              generateNewConfirmationEmail( user, res.locals.language, function(err, usr){
                if (err) {
                  console.log('Failed to send confirmation email');
                  res.send(500,{error:err });
                } else {
                  res.send(200, {email:usr.email});
                }
            });
        		}
        	} else {
        		res.send(500, {error:{code:'nonexistant', message:'We have no record of this email'}})
        	}
        }
      });
    }
  });
    
  var confirmRegistration = function( email, token, callback ){
    users.findByEmail( email, function( error, user ){
      if (error) {
        console.log(error);
        callback( error, user );
      } else {
        if (user) {
          if (user.isVerified()) {
            callback( {code:'already_done', message: 'This user has already been verified'}, user, false, false );
          } else {
            var now = new Date();
            now.setHours(now.getHours()-24);
            if (token === validationHash(user)) {
              if (now.getTime() < user.modified.getTime()) {
                user.setVerified();
                user.save(function(err,usr) {
                  if (err) callback(err, null);
                  else callback(null, usr);
                });
              } else {
                callback( {code:'expired', message: 'Confirmation Link Expired'}, user, true, false );
              }
            } else {
              callback( {code:'invalid', message: 'Invalid Confirmation Link'}, user, true, false );
            }
          }
        } else {
          callback ( {code:'nonexistant',message: 'User does not exist'}, null, false, true );
        }
      }
    });
	};
	
	var generateNewConfirmationEmail = function( user, language, callback){
    user.modified = new Date();
    user.save(function(err,usr) {
      if (err){
        callback({code:'save', message:'Could not save user'}, usr);
      } else {
        var options= {
          template: {
            language: language,
            name: 'confirmation',
            locals: {
              name: user.name,
              email: user.email,
              link: generateConfirmationLink(user, language)
            }
          },
          subject: 'Confirmation',
          to: user.email,
          text: 'You have requested a confirmation link.'
        };
        service.mailer.sendEmail(options, function(error, result){
        	if( error ){
        		console.log('Confirmation send failed: ' + error);
        		callback({code:'send', message:'Could not send email'}, usr);
        	} else{
        		//DO NOTHING
        		callback(null, usr);
        	}
        });
      }
    });
	};
	
  var handleRegistrationPost = function(req, res, next){
	  var form = {
		  email: req.body.email,
		  password: req.body.password,
		  phone: req.body.phone,
		  firstname: req.body.firstname,
		  lastname: req.body.lastname,
		  verified: false
    };
    var language = res.locals.language;
    validateRegistration(form, function(error, result){
      if (result.valid){
        users.createUserFromRegistration(form, function(error, user){
          if( error ){
            console.log( 'Could not register: ' + user.email);
            res.send(500, {general:['register']});
          } else {
            req.login(user, function(error){
              if (error){
                res.send(500, {general:['login']});
              } else {
              	var profile = users.loadUserProfile(user)
                res.send(200,profile);
              }
            });
            var options= {
              template: {
                language: language,
                name: 'registration',
                locals: {
                  name: user.name,
                  email: user.email,
                  link: generateConfirmationLink(user, language)
                }
              },
              subject: 'Registration Confirmation',
              to: user.email,
              text: 'You have successfully registered.'
            };
            service.mailer.sendEmail(options, function(error, result){
              if(error){
                console.log('Failed to send email to ' + user.email);
                console.log('Registration Confirmation Mail Error: ' + error);
              } else {
              	//DO nothing for now
                //console.log('Registration Confirmation Email Sent');
              }
            });
          }
        });
      } else {
        res.send(500, result.errors);
      }
    });
  };
	
	var validateRegistration = function( form, callback){
    var result = validator.validate( form );
    users.findByEmail( form.email, function(err, user){
      if (err) {
        console.log(err);
      } else if (user) {
        result.valid = false;
        result.errors = validator.appendError(result.errors, 'email','existing');
      }
      callback( err, result );
    });
	};
	
	var generateConfirmationLink = function( user, language ) {
    var lCode = config.app.defaultLanguage;
    if (language) lCode = language.code;
    return util.format('%s/lang/%s/#/validate/%s/%s/', config.urls.www, lCode, user.email, validationHash(user) );
  };
	
  var validationHash = function( user ){
    var str =  "" + user.email + user.modified.getTime();
    return crypto.createHash('md5').update(str).digest('hex');
  };
	
};
