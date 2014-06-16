/**
 * New node file
 */
module.exports = function(mongoose) {
	var deviceTokenSchema = new mongoose.Schema({
		token: String,
		device: String
	});
	
	deviceTokenSchema.index({ token:1 });
	
	var DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);
	
	var DeviceTokenContributer = function() {};
	
	DeviceTokenContributer.prototype = {
			
			addToken : function(opts, callback) {
				var deviceToken = { token:opts.token, device:opts.device.toLowerCase() };
				DeviceToken.findOneAndUpdate(deviceToken, deviceToken, { upsert:true}, callback);
			},
			
			removeToken: function(opts, callback) {
				var deviceToken = { token:opts.token };
				DeviceToken.findOneAndRemove(deviceToken, callback);
			},
			
			findAll: function(callback) {
				DeviceToken.find().exec(callback);
			},
			
			
			findByDevice: function(device,callback) {
				if (!device) {
					this.findAll(callback);
				}else {
					DeviceToken.find({device: device.toLowerCase() },callback);
				}
			}
	};
		
	return new DeviceTokenContributer();
};