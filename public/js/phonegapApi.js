/**
 * New node file
 */


var PhonegapApi = function() {
	this.phonegapLoader = new PhonegapLoader();
	this.phonegapLoader.loadPhonegapScript();
	PhonegapApi.__super__.constructor.call(this);

};

Utils.extend(PhonegapApi,PlatformApi);

PhonegapApi.prototype.openWindow = function(strUrl, strWindowName, strWindowFeatures) {
	return PhonegapApi.__super__.openWindow.call(this,strUrl, strWindowName, strWindowFeatures);
};

PhonegapApi.prototype.platformFileInput =  function(fileInput) {
	var fi = PhonegapApi.__super__.platformFileInput.call(this,fileInput);
	
	try {
	var errorCallBack = function (err) {
		console.log(err);
	};
	

	this.execute(function () {
		if (window.device.platform.toLowerCase() == "ios") {
			return;
		}
		
		fi.data("customfiles",new Array());
		fi.data("files", function() {
			return fi.data("customfiles");
		});
		
		fi.on("click", function(e) {
			var that = this;
			window.navigator.camera.getPicture(
					function(URL) {
						URL = decodeURIComponent(URL);
						window.resolveLocalFileSystemURL(URL, function(result) {
							result.file(function(file) {
								/*
								 * Sometime the type of the file is missing specially on iOS. Here we are not handling iOS. 
								 * We should be carefull when supporting other than android and iOS. Probably get the file type f
								 * from file extension.
								 */
								var files = [ file ];
								$(that).data("customfiles" , files);
								$(that).trigger("change");
								
							},errorCallBack);
						},errorCallBack);
					},
					errorCallBack,
					{   quality: 50,  
						destinationType: navigator.camera.DestinationType.FILE_URI, 
						sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY 
					}); 
			});
		});

	}catch(err) {
		alert(err);
	}
	return fi;		
};

PhonegapApi.prototype.registerNotificationHandler = function(handler, successCallBack, failureCallback) {
	var that = this;
	
	this.execute(function() {
		if (that.notificationHanlder) {
			failureCallback("Already initialized");
		} else {
			that.notificationHanlder = handler;
			
			successCallBack(window.plugins.pushNotification,"window.app.platformApi.notificationHanlder");
		}
	});
};

PhonegapApi.prototype.openFile = function (strUrl, strWindowName, strWindowFeatures) {
	this.execute(function() {
		function errorCallBack(err) {
				console.log(JSON.stringify("Error:" + err));
		}
			
		function onGetDirectory(result) {
			var filename = strUrl.substring(strUrl.lastIndexOf('/')+1);
			var fileTransfer = new FileTransfer();
			var filePath = result.nativeURL + filename;
            
			if (!this.currentlyDownloading) {
				this.currentlyDownloading = new Object();
			}
			
			if (this.currentlyDownloading[filePath]) {
				console.log("currently downloading");
				return;
			}
			else {
				this.currentlyDownloading[filePath] = true;
				fileTransfer.download(strUrl, filePath, 
					function(entry) {
						onDownloadtFile(entry);
						this.currentlyDownloading[filePath]  = false;
					}, function(err) {
						errorCallBack(err);
						this.currentlyDownloading[filePath]  = false;
					});		
			}
		}
		
		function onDownloadtFile(entry) {
			var newPath = entry.nativeURL.replace("file://","");
        	cordova.plugins.fileOpener.open(newPath,"application/pdf",
        		{
        			success : function(s) { },
        			error : errorCallBack
        		}); 
		}
			
		requestFileSystem(LocalFileSystem.TEMPORARY, 0, 
			 function(result) {
		  		result.root.getDirectory("App_files", {create: true, exclusive: false}, onGetDirectory, errorCallBack);
			 },
			 errorCallBack);

	});
};

PhonegapApi.prototype.isNative = function (method) {
	if (this.phonegapLoader.isSupported()) {
		return this.execute(function() {
			method(true);
		});
	}
	else 
		PhonegapApi.__super__.isNative.call(this,method);
};
	
PhonegapApi.prototype.execute = function (method) {
	if (this.phonegapLoader.isLoaded()) {
		method();
	}
	else {
		window.app.on(PhonegapLoader.CORDOVA_READY_EVENT, function() {
			method();
		});
	}
};




var mainWindow = Utils.mainWindow(window);
var mainApp = mainWindow.app;
var currentApp = window.app;

PhonegapApi.singleton = function() {
	if (!mainApp.phonegapApi) {
		/*
		 * make sure to call mainWindow.PhonegapApi, so it is called in the main window context. Whenever window is referenced 
		 * from PhonegapApi singleton instance the mainWindow is called.
		 */
		var phonegapApi =  new mainWindow.PhonegapApi();
		mainApp.phonegapApi = phonegapApi;
	}
	return mainApp.phonegapApi;
};


//Pass phonegap native api's to frame window if needed
currentApp.on(PhonegapLoader.CORDOVA_READY_EVENT, function() {
	window.device = mainWindow.device;
	window.plugins = mainWindow.plugins;
	window.navigator = mainWindow.navigator;
});

//pass to all window app the singleton phonegap
currentApp.platformApi = PhonegapApi.singleton();







