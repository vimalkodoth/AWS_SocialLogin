require('./sass/style.scss');
var finderService = require('./js/finder.js');
var locationService = require('./js/locationService.js');
var Mediator = require('./js/common/mediator.js');
require('file-loader?name=[name].[ext]!./index.html');
var utils = require('./js/utils.js')
var async = require('async');
var Handlebars = require('handlebars');
var handlebarsHelpers = require('./js/handlebarHelpers.js');
var items = [];

handlebarsHelpers.register(items);


function getPlacesResponse(results, status){
  var requests = [];
  if (status === google.maps.places.PlacesServiceStatus.OK) {
  	console.log('OK');
  	Mediator.publish('FINDER_COUNT', results.length || 0);
  	(function(){
  		var i;
	    for (i = 0; i < results.length; i++) {
		    requests.push(function(index, callback){
		        finderService.getPlaceDetailsById(results[index]['place_id'], function(place, status){
		        	console.log(status);
		        	// console.log(place);
		        	// console.log(index);
					results[index]['details'] = place;
					items.push(results[index]);
					setTimeout(function(){
						callback(null,index);
					},2000);
		        })
		    }.bind(null,i));
	    }
	    async.parallelLimit(requests,5,function(err, resp){
	    	console.log(results);
			Mediator.publish('FINDER_RESULTS', results);
		})
	})()
  } else {
  	Mediator.publish('FINDER_RESULTS', status);
  }
}

function getUserLocationResponse(searchTerm, pos){
	if(pos){
		finderService.setFinderLocation(pos);
		finderService.getPlacesByTypeAndKeywords(searchTerm, getPlacesResponse);
	}
}

$('.page-finder-items').on('click', 'li', function(evt){
	items.length = 0;
	Mediator.publish('DISPLAY_LOADING', true);
	Mediator.publish('FINDER_FILTER_DISPLAY', false);
	Mediator.publish('FINDER_RESULTS_DISPLAY', false);
	var searchTerm = $(evt.currentTarget).attr('data-id').toString();
	$.when(locationService.getUserLocation()).then(getUserLocationResponse.bind(null,searchTerm));
});

(function finderCountView(ele){

	Mediator.subscribe('FINDER_COUNT', function(length){
		console.log(length);
		render(length);
	});

	function render(length){
		ele.find('.count').text(length);
	}
})($('.page-finder-count'));

(function finderFilterView(ele){

	Mediator.subscribe('FINDER_FILTER_DISPLAY', function(show){
		show ? ele.show() : ele.hide();
	});

})($('.filter-wrapper'));

var finderResultsView = (function finderResultsView(ele){
		var listView =  document.getElementById('finder-item-template').innerHTML,
			listError = document.getElementById('finder-item-error-template').innerHTML;

	    var template = Handlebars.compile(listView),
	    	errorTemplate = Handlebars.compile(listError),
	    boundClearAndRender,
	    htmlTemplate,
	    boundClearAndRenderError;
		
		Mediator.subscribe('FINDER_RESULTS', function(data){

			if(Object.prototype.toString.call(data) === '[object Array]' || Object.prototype.toString.call(data) === '[object Object]'){
				utils.sortFinderResults(data, 'distance');
				boundClearAndRender(data);
			} else {
				boundClearAndRenderError(data);
			}
			Mediator.publish('DISPLAY_LOADING', false);
			Mediator.publish('FINDER_RESULTS_DISPLAY', true);
		});

		function render(listView, ele){
			ele.append(listView)
		}
		function empty(ele){
			ele.empty();
		}
		Mediator.subscribe('FINDER_RESULTS_DISPLAY', function(show){
			show ? ele.show() : ele.hide();
		});
		boundClearAndRender = (function(ele){
			return function (data){
				empty(ele);
				for(var i = 0 ; i < data.length;i++){
					console.log(data[i]);
					htmlTemplate = template(data[i]);
					render(htmlTemplate,ele);
				}
				Mediator.publish('FINDER_FILTER_DISPLAY', true);
			}
		})(ele);

		boundClearAndRenderError = (function(ele){
			return function (data){
				empty(ele);
				htmlTemplate = errorTemplate({ errorText : data });
				render(htmlTemplate,ele);
			}
		})(ele);
		return {
			clearAndRender: boundClearAndRender,
			clearAndRenderError : boundClearAndRenderError
		}
})($('.page-finder-results ul'));

(function handleLoaderIcon(iconEle){
	Mediator.subscribe('DISPLAY_LOADING', function(display){
		if(display){
			iconEle.show();
		} else {
			iconEle.hide();
		}
	});
})($('.pag-finder-overlay'));


(function dropDown(ele){
	ele.change(function(evt){
		utils.sortFinderResults(items, this.options[evt.target.selectedIndex].text.toLowerCase());
		finderResultsView.clearAndRender(items);
	})

})($('#finder-sort-dropdown'));



