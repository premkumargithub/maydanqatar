module.exports = function(config, app,service,notification_handler) {


   app.get('/api/notification/register/:device/:token/', function(req, res){
	   var dt = { token: req.params.token, device : req.params.device };
	   registerForNotification(dt, res);
    });
   
   
   app.get('/api/notification/find/:device/', function(req, res){
	   findTokensByDevice(req.params.device, res);
    });
   
   app.get('/api/notification/config/:device/', function(req, res){
	   var err = null;
	   var device = req.params.device;
	   if (!config[device]) {
		   	err = "configuration missing with device :" + device;
	   }
	   executeCallBack(res,err,function() {
				res.statusCode = 200;
	    		res.json({ appName: config.name, config : config[req.params.device].client });
    	});
    });
   
     app.get('/api/notification/remove/:token/', function(req, res){
		   service.deviceToken.removeToken({ token : req.params.token},function(err,result){
		       	executeCallBack(res,err,function(){
		       		res.statusCode = 200;
		       		res.json(result);
		       	});
		     });	   
	    });
	    
	   
	   app.get('/api/notification/message/', function(req, res){
		    notification_handler.sendMsg(req.query.msg,function(result) {
		    		res.statusCode = 200;
		       		res.json(result);
			});
	   });
   
   function findTokensByDevice(device, res) {
	   if (device && device.toLowerCase() == "all") {
		   device = null;
	   }
	   
	   service.deviceToken.findByDevice(device,function(err,result){
	       	executeCallBack(res,err,function(){
	       		res.statusCode = 200;
	       		res.json(result);
	       	});
       });
   }
  
   function registerForNotification(dt, res) {
        service.deviceToken.addToken(dt,function(err,result){
        	executeCallBack(res,err,function(){
        		res.statusCode = 200;
        		res.json(result);
        	});
        });
	};
	
	function executeCallBack(res, err,successCallBack) {
		if (err) {
			console.log(err);
	        res.send(500);
		}
		else {
			successCallBack();
		}
	}
};
