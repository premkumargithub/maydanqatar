/**
 * New node file
 */


var mainWindow = Utils.mainWindow(window);

var PhonegapLoader = function() {
	this.loaded = false;
};

PhonegapLoader.CORDOVA_SRC = "myapp://cordova.js";
PhonegapLoader.CORDOVA_READY_EVENT = "mycordovaready";


PhonegapLoader.prototype = {
		
		isSupported : function() {
			return (/PhoneGap/i.test(navigator.userAgent) );
		},
		
		isLoaded : function() {
			return this.loaded;
		},
		
		loadPhonegapScript : function() {
			var that = this;
			
			if (!this.isSupported() || this.isLoaded()) {
				return;
			}
			
			var element = document.createElement("script");
			element.type = "text/javascript";
			element.src = PhonegapLoader.CORDOVA_SRC;
			element.onerror = function(err) { 
				alert('error loading Cordova script'); 
			};
			document.head.appendChild(element);
			document.addEventListener('deviceready', function() {
				that.loaded = true;
				window.app.trigger(PhonegapLoader.CORDOVA_READY_EVENT);
				window.navigator.splashscreen.hide();
			}, false);
		}
};
