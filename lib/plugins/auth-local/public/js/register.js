var registrationOptions = {
    registrationForm: "#registration",
    emailSelector: '#email',
    emailErrorSelector: '#emailError',
    passwordSelector: '#password',
    passwordErrorSelector: '#passwordError',
    firstnameSelector: '#firstname',
    lastname: '#lastname',
    captchaErrorSelector: '#captchaError'
};

var generateConfirmationLink = function(divId,language,email){
    $('#processing').show();
    var url = '/lang/'+ language + '/validate/' + email + '/';
	$('#'+divId).load(url + ' #'+divId, function(data, textStatus, jqXHR){
	    $('#processing').hide();
        return false;
	});
};

var setPasswordStrengthResult = function(resultClass, resultMessage){
    var passwordError = $(registrationOptions.passwordErrorSelector);
    if( passwordError ){
        passwordError.removeClass();
        passwordError.addClass(resultClass);
        passwordError.html(resultMessage);
    }
};

var validateRegistrationForm = function( errorMessages ){
    $('#processing').show();
    var reg = {
      email: $(registrationOptions.emailSelector).val(),
      password: $(registrationOptions.passwordSelector).val(),
      firstname: $(registrationOptions.firstnameSelector).val(),
      lastname: $(registrationOptions.lastnameSelector).val()
    };
    var result = window.formValidator.validate( reg );
    if( !result.valid ){
        $('#processing').hide();
        if( result.errors ){
            if( result.errors.email ){
                writeErrors( $(registrationOptions.emailErrorSelector), 'email',
                    result.errors.email, errorMessages );
            }
            if( result.errors.password ){
                writeErrors( $(registrationOptions.passwordErrorSelector), 'password',
                    result.errors.password, errorMessages );            
            }
        }
    }
    return result.valid;
};

var writeErrors = function( element, propertyName, errors, errorMessages ){
    if( element ){
        var html = '';
        for( var i=0; i<errors.length; i++ ){
            var err = propertyName + '.' + errors[i];
            if( errorMessages && errorMessages[propertyName] && errorMessages[propertyName][errors[i]]){
                err = errorMessages[propertyName][errors[i]];
            }
            html += err + '<br/>';
        }
        element.html(html);            
    }    
};

$(function(){
    //Captcha Plugin - wrong answer disable submit
    //TODO: add user message
    $('#registration').ebcaptcha({questionText:window.registrationCaptchaQuestion});

    window.formValidator = window.Validation.newValidator();
    $(registrationOptions.registrationForm).find(registrationOptions.passwordSelector).keyup(function()
	{
        var strength = window.formValidator.checkStrength(
            $(registrationOptions.passwordSelector).val()
        );
        setPasswordStrengthResult( strength.resultClass, 
            window.registrationErrorMessages.password[strength.resultMessage]
        );
	});
});

