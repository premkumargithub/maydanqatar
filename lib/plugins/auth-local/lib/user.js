var crypto = require('crypto');

module.exports = function(){

    var UserModelContributor = function() {};
    
    //userSchema is not a mongo schema but rather a json object
    UserModelContributor.prototype.defineUserSchema = function(mongoose, userSchema) {
        userSchema.password = String;
        userSchema.firstname = String;
        userSchema.lastname = String;
        userSchema.phone = String;
        userSchema.registered = {type:Date, default: Date.now};
        userSchema.modified = {type:Date, default: Date.now};
        userSchema.verified = Boolean;
    };
    
    UserModelContributor.prototype.initUserSchema = function(mongoose, userSchema) {
        userSchema.methods.generateHash = function(password) {
            return crypto.createHash('sha256').update(password).digest('hex');
        };
        
        userSchema.methods.validPassword = function(password) {
            return this.password === this.generateHash(password);
        };
        
        userSchema.methods.setPassword = function(password) {
            this.modified = new Date();
            this.password = this.generateHash(password);
        };
        
        userSchema.methods.setVerified = function(){
            this.modified = new Date();
            this.verified = true;
        };
        
        userSchema.methods.isVerified = function(){
          return this.verified;
        };
        
        userSchema.methods.isPendingVerification = function(){
        	var now_minus_24 = new Date();
          now_minus_24.setHours(now_minus_24.getHours()-24);
          return !this.verified && now_minus_24.getTime() < this.modified.getTime();
        };
    };

    UserModelContributor.prototype.initUser = function(User) {
        
        User.findByEmailOld = function( email ) {
            User.findOne({'email':email}).exec(function(err, result) {
                    if (err) {
                        console.log(err);
                        return undefined;
                    }
                    else {
                        // already registered
                        if( result ){
                            return result;
                        }
                    }
                    return undefined;
                });
        };
        
        User.findByEmail = function( email, done ) {
            User.findOne({'email':email}).exec(
                function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    done(err,result);
                });
        };
        
        User.createUserFromRegistration = function(profile, done) {
            var user = new User({
                email: profile.email,
                phone: profile.phone,
                firstname: profile.firstname,
                lastname: profile.lastname,
                verified: false
            });
            
            user.displayName = (user.firstname || user.lastname) ? user.firstname + ' ' + user.lastname : null;
            if( !user.displayName ) {
            	var index = user.email.indexOf('@');
            	user.displayName = user.email.substring(0,index);
            }
            user.password = user.generateHash(profile.password);
            
            // insert into mongo
            user.save(function(err) {
                done(err, user);
            });
        };
        
    };

	return new UserModelContributor();
};