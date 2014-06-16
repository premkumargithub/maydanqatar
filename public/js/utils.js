var Utils = {};

Utils.scrollToElement = function( elOrId ){
  if (elOrId) {
    if (typeof elOrId === 'string') {
      var el = document.getElementById(elOrId);
      if (el) {
        el.scrollIntoView(true);
        document.body.scrollTop -= 20;
      }
    } else {
      if (elOrId.scrollIntoView) {
        elOrId.scrollIntoView(true);
        document.body.scrollTop -=20;
      }
    }
  }
};


Utils.extend = (function() {
    // proxy used to establish prototype chain
    var F = function() {};
    // extend Child from Parent
    return function(Child, Parent) {
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
    };
}());

Utils.iFrame = function(win) {
    try {
        return win.self !== win.top;
    } catch (e) {
        return true;
    }
};

Utils.mainWindow = function(win) {
	if (Utils.iFrame(win)) {
		return Utils.mainWindow(win.top);
	}
	else 
		return win;
};

String.prototype.endWith = function (searchString, position) {
    position = position || this.length;
    position = position - searchString.length;
    var lastIndex = this.lastIndexOf(searchString);
    return lastIndex !== -1 && lastIndex === position;
};


Utils.mimetype = function (url) {
	  if (url.endWith(".doc") || url.endWith(".docx")) {
		  return "application/msword";
      } else if(url.contains(".pdf")) {
          // PDF file
    	  return "application/pdf";
      } else if(url.endWith(".ppt") || url.endWith(".pptx")) {
    	  return "application/vnd.ms-powerpoint";
      } else if(url.endWith(".xls") || url.endWith(".xlsx")) {
    	  return "application/vnd.ms-excel";
      } else if(url.endWith(".rtf")) {
    	  return "application/rtf";
      } else if(url.endWith(".wav")) {
    	  return "audio/x-wav";
      } else if(url.endWith(".gif")) {
    	  return "image/gif";
      } else if(url.endWith(".jpg") || url.endWith(".jpeg")) {
    	  return "image/jpeg";
      } else if(url.contains(".txt")) {
    	  return "text/plain";
      } else if(url.endWith(".mpg") || url.endWith(".mpeg") || url.endWith(".mpe") || url.endWith(".mp4") || url.endWith(".avi")) {
    	  return "video/*";
      } else {
    	  return "*/*";
      }        
};