

var apn = require('apn');	
var path = require('path');

module.exports = function(config,deviceTokenContrib) {
	var iOSHandler = function () { };
	
	
	function createOptions() {
		
		var options = {};
		options.pfx  =  config.server.pfx;
	    options.passphrase = config.server.passphrase;                 
	    if (config.isDevelopmentMode) {
			options.gateway = 'gateway.sandbox.push.apple.com';
		}
	   return options;
	}
	
	function createConnection(options, onError) {

		options.errorCallback = function(errCode, notification) {
			console.log("Notification Error:" + errCode);
		};
		
		var service = new apn.connection(options);

		service.on('connected', function() {
		    console.log("Connected");
		});

		service.on('transmitted', function(notification, device) {
		    console.log("Notification transmitted to:" + device.token.toString('hex'));
		});

		service.on('transmissionError', function(errCode, notification, device) {
		    console.error("Notification caused error: " + errCode + " for device ", device, notification);
		    onError(errCode,device.toString('hex'));
		});

		service.on('timeout', function () {
		    console.log("Connection Timeout");
		});
		

		service.on('socketError', function(err) {
			//There is a bug here in the module. if you are not connected, this event keeps getting called endless until a conenction is back.
			//console.log("socketError" + err);
			
		});
		return service;
	}
	
	iOSHandler.prototype = {
			startiOSFeedbackService : function(interval, err,success) {
			
				var options = {};
				options.interval = interval;
				options.pfx  = config.server.pfx;           
			    options.passphrase = config.server.passphrase;                 
			    
				if (config.isDevelopmentMode) {
					options.address = 'feedback.sandbox.push.apple.com';
				}
				
			    
				var feedback = new apn.feedback(options);
				feedback.on('feedbackError', function(error){
					err(error);
				});
				feedback.on("feedback", function(devices) {
					success(devices);
		    	});
			},
			
			sendMsg : function(msg, deviceTokens, callback, onError) {
				
				if (!deviceTokens || deviceTokens.length <= 0) {
					var result = { msg : "iOSHandler: empty tokens" };
					callback(result);
					return; 
				}
				
				var tokens = [];
				deviceTokens.forEach(function(deviceToken){
					tokens.push(deviceToken.token);
				});
				
				var note = new apn.Notification();
				    note.badge = 1;
				    note.setAlertText(msg);
				    note.trim();
				
			
				 var options = createOptions();
				 var service = createConnection(options, onError);
				
				service.pushNotification(note,tokens);
				
				callback(null);	
			}
	};
	return new iOSHandler();
};