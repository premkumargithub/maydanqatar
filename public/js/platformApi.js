/**
 * New node file
 */


var PlatformApi = function() {

};

PlatformApi.prototype = {
		
		/*
		 * return an object that has the main and child window
		 */
		openWindow: function(strUrl, strWindowName, strWindowFeatures) {
			var child = window.open(strUrl, strWindowName, strWindowFeatures);
			return { parentWindow: window, childWindow :child };
		},
		
		/*
		 * @Params: fileInput JQuery File input Element;
		 * @Summary: if you want fileInput to work on multiple platform you should except to use fileInput.data("files")
		 * to retreive files and use FileApi Library to read the file.
		 */
		platformFileInput : function(fileInput) {
			var fi = fileInput;
			fi.data("files", function() {
				return fi.prop("files");
			});
			return fi;
		},
		
		registerNotificationHandler : function(handler, successCallBack, failureCallback) {
			failureCallback("Not supported in a non phonegap application");
		},
		
		
		openFile : function (strUrl, strWindowName, strWindowFeatures) {
			if (strWindowName) {
				this.openWindow(strUrl, strWindowName, strWindowFeatures);
			}
			else {
				window.location = strUrl;
			}
 		},
 		isNative : function (method) {
 			method(false);
		}	
};


window.app.platformApi = new PlatformApi();
