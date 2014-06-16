(function($){

        jQuery.fn.ebcaptchaword = function(options){

                var element = this; 
                var submit = $(this).find('input[type=submit]');
                $('<label id="ebcaptchatext"></label>').insertBefore(submit);
                $('<input type="text" class="textbox" id="ebcaptchainput"/><br/><br/>').insertBefore(submit);
                var input = this.find('#ebcaptchainput'); 
                var label = this.find('#ebcaptchatext'); 
                
                $(element).find('input[type=submit]').attr('disabled','disabled'); 
                        
                var i = 0;
                var j = 6;
                var randomNumber = 0;
                var randomMessage = '';
                
                while(i<j)
                {
                        randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
                          if ((randomNumber >=33) && (randomNumber <=47)) { continue; }
                          if ((randomNumber >=58) && (randomNumber <=64)) { continue; }
                          if ((randomNumber >=91) && (randomNumber <=96)) { continue; }
                          if ((randomNumber >=123) && (randomNumber <=126)) { continue; }
                        randomMessage += String.fromCharCode(randomNumber);
                        i++;
                }
                
                var texti = "Write: "+ randomMessage;
                $(label).text(texti);
                
        
                $(input).keyup(function(){

                        var textvalue = $(this).val();
                        if(textvalue==randomMessage)
                        {
                                $(element).find('input[type=submit]').removeAttr('disabled');                                
                        }
                        else{
                                $(element).find('input[type=submit]').attr('disabled','disabled');
                        }
                        
                });

                $(document).keypress(function(e)
                {
                        if(e.which==13)
                        {
                                if((element).find('input[type=submit]').is(':disabled')==true)
                                {
                                        e.preventDefault();
                                        return false;
                                }
                        }

                });

        };

})(jQuery);