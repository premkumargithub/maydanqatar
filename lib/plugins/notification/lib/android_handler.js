/**
 * New node file
 */

var gcm = require('node-gcm');

module.exports = function(config,deviceTokenContrib) {
	var AnrdoidHandler = function () { };
	
	AnrdoidHandler.prototype = {
			sendMsg : function(msg, deviceTokens,callback) {
				
				if (!deviceTokens || deviceTokens.length <= 0) {
					var result = { msg : "AnrdoidHandler: empty tokens" };
					callback(result);
					return; 
					
				}
					
				var message = new gcm.Message();
				 
				//API Server Key
				var sender = new gcm.Sender(config.server.apiKey);
				var registrationIds = [];
				 
				// Value the payload data to send...
				message.addData('message',msg);
				message.addData('title',config.name);
				message.addData('msgcnt','3'); // Shows up in the notification in the status bar
				//message.addData('soundname','beep.wav'); //Sound to play upon notification receipt - put in the www folder in app
				//message.collapseKey = 'demo';
				//message.delayWhileIdle = true; //Default is false
				message.timeToLive = 3000;// Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.
				 
				// At least one reg id required
				deviceTokens.forEach(function(deviceToken) {
					registrationIds.push(deviceToken.token);
				});
				 
				/**
				 * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
				 */
				sender.send(message, registrationIds, 4, function (err, result) {
					callback({ err:err, result:result });
				});
			}
	};
	
	return new AnrdoidHandler();
};