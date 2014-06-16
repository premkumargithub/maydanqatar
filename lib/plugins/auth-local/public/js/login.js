$(document).ready(function(){
    var app = window.App;
    app.Login = {};
    app.Login.onLoginSuccess = function(result) {
        try {
            app.trigger(_g('signed_in'), result);
        } catch (err) {
            console.log(err);
        }
        window.parent.$.fancybox.close();
    };
    
    app.loader.registerLoader('successful_login', function(el) {
        var result = {};
        result.email = $(el).attr('data-value');
		app.Login.onLoginSuccess(result.email);
    });
});