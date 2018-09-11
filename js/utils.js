module.exports = (function($, window){
		
		var geodist = require('geodist'),
			finderService = require('./finder.js');

		function sortFinder(items, type){
			if(items){
				switch(type){

					case 'distance':
						return filterSortedDuplicates(_sortFinderByDistance(items));
						break;

					case 'rating':
						return filterSortedDuplicates(_sortFinderByRating(items));
						break;

					default:
				}
			}
		}


		function _sortFinderByRating(data){
			data.sort(function(a,b){
				return b.rating - a.rating;
			})

			return data;
		}

		function _sortFinderByDistance(data){
			var userLoc = finderService.getFinderLocation();
				for(var i=0;i<data.length;i++){
					data[i]['distance'] = geodist({lat: userLoc.lat, lon: userLoc.lng}, {lat: data[i].geometry.location.lat(), lon: data[i].geometry.location.lng()}, {exact: true, unit: 'km'} )
				}
				data.sort(function(a,b){
					return a.distance - b.distance;
				});
			return data;
		}

		function filterSortedDuplicates(items){
			var filteredList = [];

			for(var i=0;i<items.length-1;i++){
				if(items[i].id !== items[i+1].id){
					filteredList.push(items[i]);
				}
			}
			return filteredList;
		}
		return {
			sortFinderResults : function(items, type){
				return sortFinder(items, type);
			},
			filterSortedDuplicates: function(items){
				return filterSortedDuplicates(items);
			}
		}

})(jQuery,window);