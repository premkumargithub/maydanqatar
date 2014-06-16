$.on('ready', function(){

	var JSON_CONTENT_TYPE = /application\/json.*/

	var getData = function(req){
	  var response = (req.response || req.responseText);
		if (typeof response === 'string') {
			var type = req.getResponseHeader('Content-Type');
			if (type && type.match(JSON_CONTENT_TYPE)) {
				return JSON.parse(response);
			} else {
				return response;
			}
  	} else {
  		return response;
  	}
	}

	var ajax = function(opts){
		if (opts.before)
			opts.before();

		// deliberately not supporting IE6!
		var req = new XMLHttpRequest();

		req.open(opts.type || 'GET', opts.url, true);
		req.timeout = opts.timeout;
		if( opts.contentType === 'multipart/form-data' ){
			//Do not set content type
		} else {
		  req.setRequestHeader('Content-Type', opts.contentType || 'application/json');
		}

		req.onreadystatechange = function() {
			if (req.readyState == XMLHttpRequest.DONE) {
				if (opts.statusCode && opts.statusCode[req.status])
					opts.statusCode[req.status](req.response, req.statusText, req);

				var contentType = req.getResponseHeader('Content-Type');
				var data = getData(req);

				if ((req.status >= 200) && (req.status < 300)){
					var ok = opts.success || opts.ok;
					if (ok)
						ok(data, req.statusText, req);
				}

				if ((req.status >= 300)){
					var fail = opts.error || opts.fail;
					if (fail)
						fail(data, req.statusText, req);
				}

				if (opts.after)
					opts.after();
			}
		}

		req.send(opts.data);
	}

	$.ajax = ajax;

});