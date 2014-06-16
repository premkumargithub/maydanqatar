/**
 * New node file
 */

var async = require('async');

module.exports = function(config, deviceTokenContrib) {
	var DEVICE_TYPE = [ "ios" , "android" ];
	
	var Handler = function() { 
	};
	
	Handler.prototype = { 
		
		startiOSFeedbackService : function(interval) {
			this.getHandler("ios").startiOSFeedbackService(interval, 
				function(err) {
					console.log("iOS Feedback Error:" +err);
				},
				function(devices) {
					devices.forEach(function(item) {
						console.log("Device: " + item.device.toString('hex') + " has been unreachable, since: " + item.time);
				    	deviceTokenContrib.removeToken({ token : item.device.toString(), device: "ios"}, function(err,result) {
				    		if (err) {
				    			console.log("err:" + err);
				    		}
				    	});
					});
			});
		},
		
		sendMsg : function(msg,callback) {
			var that = this;
			
			this.startiOSFeedbackService(0);
			
			this.tokensByDevice(function(deviceTokens) {
				var methods = [];
				var finalResult = [];
				
				deviceTokens.forEach(function(deviceToken) {
					if (deviceTokens.length >= 0) {
						methods.push(function (callback) {
							var handler = that.getHandler(deviceToken.device);
							handler.sendMsg(msg,deviceToken.tokens,function (result) {
								finalResult.push({device : deviceToken.device , result : result});
								callback();
							}, function onError(errCode, token) {
								if (errCode == 8) {
									deviceTokenContrib.removeToken({  token:token  },function (err,result) {
										if (err) {
											console.log(err);
										} else {
											console.log("successfully remove invalid token:" + token );
										}
										
									});
								}
							});
						});
					}
				});
				
				async.parallel(methods,function() {
					callback(finalResult);
				});
			});
		},	
		
		tokensByDevice: function(callback) {
			var methods = [];
			var deviceTokens = [];
			DEVICE_TYPE.forEach(function(device){
				methods.push(function (callback) {
					deviceTokenContrib.findByDevice(device, function (err,tokensByDevice){
    					if (err) {
    						console.log(err);
    					}else if (tokensByDevice) {
    						deviceTokens.push({ device : device, tokens : tokensByDevice });
    					}
    					callback();
    					
    				});
				});
			});
		
			async.parallel(methods,function() {
				callback(deviceTokens);
			});
		},
		
		getHandler : function(device) {
			var conf = config[device];
			conf.isDevelopmentMode = config.isDevelopmentMode;
			conf.name = config.name;
			return require('./'+ device + '_handler')(conf);
		}
	};
	return new Handler();
};