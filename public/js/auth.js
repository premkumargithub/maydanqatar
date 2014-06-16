$.on('ready', function(){
  window.connect = function(provider) {
    var url = '/auth/' + provider + '/';
    var windowName = '_blank';
    var windowSettings = 'location=no,status=no,menubar=no,transitionstyle=fliphorizontal,resizable=yes,width=700,height=800';
    
    var res = window.app.platformApi.openWindow(url,windowName,windowSettings);
    var openerWindow = res.parentWindow;
    var childWindow = res.childWindow;
    
  	childWindow.addEventListener('loadstop', function(event) {
    	if (event.url.match('auth/' + provider + '/success')) {
			   var _index = event.url.indexOf('#');
			   if (_index > -1) {
			   		var username_and_first = event.url.substring(_index);
			   		var arr = username_and_first.split('/');
			   		var username = arr[0];
			   		var isFirst = arr.length > 1 && arr[1] === 'true';
					openerWindow.onAuthSuccess({username:username, isSocial:true, first_visit:isFirst});
					childWindow.close();
			   }
		}
	});
			
	childWindow.addEventListener('exit', function(event) {
		childWindow.removeEventListener('loadstop');
		childWindow.removeEventListener('exit');
	});
	
	openerWindow.onAuthSuccess = function(result) {
		try {
			window.app.trigger('signed_in', result);
		} catch (err) {
		      console.log(err);
		}
	};
  };
});
