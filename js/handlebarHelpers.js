module.exports = (function($, window){

	var Handlebars = require('handlebars');

		var ratingValues = [0,10,20,30,40,50,60,70,80,90,100];

		function closest (num, arr){
		    var curr = arr[0]
		    for(var i=0 ;i<arr.length;i++){
		        if( Math.abs(num - arr[i]) < Math.abs(num - curr)){
		            curr = arr[i];
		        }
		    }
		    return curr
		}
		function _register(items){
			Handlebars.registerHelper("percentage", function(rating) {
				var rounded;
			   if(rating) {
			      return closest((rating/5)*100,ratingValues);
			   } else {
			      return 0;
			   }
			});
			Handlebars.registerHelper("finderGetImageUrl", function(id) {

				var item = items.find(function(element){
					return (element['id'] === id);
				});

				return item && item['details'] && item['details']['photos'] && item['details']['photos'][0].getUrl({'maxWidth': 270, 'maxHeight': 164}) || "/themes/fmd/images/no-image-available.jpg" || (item && item['icon']) || '';
			});

			Handlebars.registerHelper("finderGetPhoneNumber", function(id){
				var item = items.find(function(element){
					return (element['id'] === id);
				});
				return item && (item['details'] && (item['details']['formatted_phone_number'] || item['details']['international_phone_number'])) || '';
			});

			Handlebars.registerHelper("round", function(value){
				return !isNaN(value) && value.toFixed(2);
			});
		}

		return {
			register : function(items){
				_register(items);
			}
		}

})(jQuery,window);