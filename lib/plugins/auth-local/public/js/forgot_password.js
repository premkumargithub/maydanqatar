var submitForgotPasswordForm = function(divId, formId){
	var form = $('#'+formId);
	var data = {
        email: $('#email',form).val()
    };
    var url = $(form).attr('action');
    $('#processing').show();
	$('#'+divId).load(url + ' #'+divId, data, function(data, textStatus, jqXHR){
	    $('#processing').hide();
        return false;
	});
};

var goToRegister = function(){
    $('#main').load('/lang/'+ window.App.getLanguage() + '/register/ #main', function(data, textStatus, jqXHR){
        return false;
	});
};
