
function NotificationHandler() {
	this.registered = false;
	this.appName = "";
	var that = this;
	this.tokenHandler = function (result) {
		that.registerToken(result);
	};

} 	
NotificationHandler.prototype = {	
	registerToken : function(token) {
		$.ajax({
			  url: '/api/notification/register/' + device.platform + '/' + token + '/',
			  success : function (data) {
				console.log("Token saved on server" + token );
			}, error : function (err) {
				console.log("Failed to save token on server" + token );
			}
		});
	},
	
	//android
	successHandler : function (result) {
		console.log("Successfully Registered Notification for android");
	},
	errorHandler : function (error) {
		console.log("Failed to register for notification:" + error);
	},

	onNotificationAPN : function(event) {
		console.log("Received a notification! " + event.alert);
        console.log("event sound " + event.sound);
        console.log("event badge " + event.badge);
        if (event.foreground) {
            if (event.alert) {
            	
            	navigator.notification.alert(event.alert,function() { },this.appName);
            }
            if (event.badge) {
                console.log("Set badge on  " + plugins.pushNotification);
                plugins.pushNotification.setApplicationIconBadgeNumber(this.successHandler, event.badge);
            }
            if (event.sound) {
                var snd = new Media(event.sound);
                snd.play();
            }
    	}
	},
	
	onNotificationGCM : function(e) {
		 switch( e.event )
		 {
		    case 'registered':
		    	if ( e.regid.length > 0 )
		            {
		                // Your GCM push server needs to know the regID before it can push to this device
		                // here is where you might want to send it the regID for later use.
		    			console.log("Successfully Registered Notification for android with token: "+  e.regid);
		    			this.registerToken(e.regid);
		            }
		        break;

		        case 'message':
		          // this is the actual push notification. its format depends on the data model
		          // of the intermediary push server which must also be reflected in GCMIntentService.java
		          if (e.foreground) {
		        	  navigator.notification.alert(e.message,function() { },this.appName);
		          }
		        break;

		        case 'error':
		          console.log('GCM error = '+e.msg);
		        break;

		        default:
		        	console.log('An unknown GCM event has occurred');
		          break;
		 }
	}
};



$.on('ready', function(){

	var notificationHandler = new NotificationHandler();
	
	window.app.platformApi.registerNotificationHandler(notificationHandler, function(pushNotification, handlerPath) { 
		var platform = device.platform.toLowerCase();
		$.ajax({
			  url: "/api/notification/config/" +  platform + "/",
			  success : function(data) {
					try {
						notificationHandler.appName = data.appName;
						if (platform == 'android') {
							data.config.ecb  = handlerPath + ".onNotificationGCM";
					        pushNotification.register(
					        		notificationHandler.successHandler, 
					        		notificationHandler.errorHandler,
					        		data.config);
					    }
					    else if (platform == 'ios') {
					    	data.config.ecb  =  handlerPath + ".onNotificationAPN";
					    	
						    	pushNotification.register(
						    			notificationHandler.tokenHandler,
						    			notificationHandler.errorHandler,  
						    			data.config);
					    	
					    }
					}catch(err) { 
			    		console.log("Err" + err); 
			    	}
			  },
			  error: function(err) {
				  console.log("Failed to retreive config" + token );
			  }	
		});
		
	},function (err) {
		console.log(err);
	});
});
