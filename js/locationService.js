module.exports = (function($, window){

	function getUserLocation(){
		var dfd = $.Deferred();
 		if (navigator.geolocation) {
 			navigator.geolocation.getCurrentPosition(function(position){
	 			let pos = {
	              lat: position.coords.latitude,
	              lng: position.coords.longitude
	            };
	 			dfd.resolve(pos);
 			}, function(){
 				dfd.resolve(null);
 			})	
 		}
 		return dfd.promise();
	}

	return {
		getUserLocation : function(){
			return getUserLocation();
		}
	}


})(jQuery,window);