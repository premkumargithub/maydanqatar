var Validation = {};
Validation.defaults = {
    emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    specialCharacters: '',
    digits: /([0-9])/,
    letters: /([a-zA-Z])/,
    upperAndLower: /([a-z].*[A-Z])|([A-Z].*[a-z])/,
    codes: {
        email: {
            invalid:'invalid'
        },
        password: {
            short: 'short',
            weak: 'weak',
            good: 'good',
            strong: 'strong'
        },
        captcha : 'wrong'
    },
    acceptedStrength: 3
};

Validation.newValidator = function(){
    var result = new Validator();
    return result;
};

//TODO: may need to allow for special configuration
var Validator = function(){
    this.settings = Validation.defaults;
};

Validator.prototype.validate = function( form ){
    /*validate email, password*/
    var errors;
    var valid = this.isEmailAddress(form.email);
    if( !valid ){
        errors = this.appendError( errors, 'email', this.settings.codes.email.invalid );
    }
    /*make sure password is strong enough*/
    var passwordLength = this.lengthInvalid( form.password );
    if( passwordLength ){
        errors = this.appendError( errors, 'password', this.settings.codes.password.short);
    }
    valid = valid && !passwordLength;
    return { valid: valid, errors: errors };
};

Validator.prototype.appendError = function( errors, property, errorCode ){
    if( !errors ) errors = {};
    if( !errors[property] ) errors[property] = [];
    errors[property].push(errorCode);
    return errors;
};

/*
	checkStrength is function which will do the 
	main password strength checking for us
*/
Validator.prototype.checkStrength = function(password){
	var passwordStrength = 0;
	//if the password length is less than 6, return message.
	if ( this.lengthInvalid(password) ) { 
		return this.getResult('short', this.settings.codes.password.short);
	}
	//now we have calculated strength value, we can return messages
    passwordStrength = this.getStrength(password);
	if (passwordStrength < this.settings.acceptedStrength ){
		return this.getResult('weak', this.settings.codes.password.weak);
	}
	else if (passwordStrength == this.settings.acceptedStrength ){
		return this.getResult('good', this.settings.codes.password.good);		
	}
	else{
		return this.getResult('strong', this.settings.codes.password.strong);
	}
};

Validator.prototype.lengthInvalid = function(password){
    return !password || password.length < 6;
};

Validator.prototype.getStrength = function(password){
    var strength = 1;
    //if length is 8 characters or more, increase strength value
	if (password.length > 7) strength += 1;
	//if password contains both lower and uppercase characters, increase strength value
	if (password.match(this.settings.upperAndLower))  strength += 1;
	//if it has numbers and characters, increase strength value
	if (password.match(this.settings.letters) && password.match(this.settings.digits))  strength += 1;
	//if it has one special character, increase strength value
	if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))  strength += 1;
	//if it has two special characters, increase strength value
	if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
	return strength;
};

Validator.prototype.getResult = function(resultClass, resultMessage){
	return { resultClass: resultClass, resultMessage: resultMessage };
};

Validator.prototype.isEmailAddress = function(email) {
    var validEmail = false;
    if( email ){
        validEmail = this.settings.emailPattern.test(email);
    }
    return validEmail;
};

(function(exports) {
    // Define all your functions on the exports object                                                                                                             
    exports.newValidator = function() {
        return new Validator();
    };
})((typeof process === 'undefined' || !process.versions) ? window.common = window.common || {} : exports);