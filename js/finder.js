module.exports = (function($, window){
    
    const loadGoogleMapsAPI = require('load-google-maps-api'),
          apiKey = 'AIzaSyCAZMvW0UNqb-iAGFI9C8WT1ogZj__LY0Q';
    
    let PlacesService = null, defaultLoc = {lat: 25.0342600, lng: 55.2453530}, 
        PlacesAPITypes = ['bank','car_wash','car_repair','car_rental'],
        PlacesAPIKeywords = {
            bank : 'bank',
            insurance: 'insurance',
            tyre_battery :'car_tyre,car_battery',
            detailing_shop: 'car_polish,car_clean,car_detailing',
            car_accessories:'car_accessories',
            driving_institute:'driving',
            car_wash: 'car_wash'
        };

    let location = JSON.parse(JSON.stringify(defaultLoc));

    (function loadGoogleMapsApi(key){
        loadGoogleMapsAPI({
            key: apiKey,
            timeout: 5000,
            libraries : ['places']
        }).then(function(googleMaps){
            _init();
        }).catch((err) => {
            console.error(err)
        })
    })(apiKey);
    
    function _init(){
        map = new google.maps.Map('', {
            center: location,
            zoom: 15
          });
        PlacesService = PlacesService || new google.maps.places.PlacesService(map);
    }

    function _getPlacesAPIType(type){
        return PlacesAPITypes.indexOf(type) !== -1 ? [].concat(type) : [];
    }

    function _getPlacesAPIKeywords(type){
        return PlacesAPIKeywords[type] || '';
    }

    function getPlacesByTypeAndKeywords(type, callback){
        var req = {
            location: location,
            radius: 20000
        };
        if(_getPlacesAPIType(type).length){
            req.type = type;
        }
        if(_getPlacesAPIKeywords(type)){
            req.keyword = _getPlacesAPIKeywords(type);
        }
        if(PlacesService){
            console.log('using Location '+ JSON.stringify(location));
            PlacesService.nearbySearch(req, callback);
        }
    }

    function getPlacesByType(type, callback){
        if(PlacesService){
            PlacesService.nearbySearch({
                location: location,
                radius: 20000,
                type: type || ['car_wash']
            }, callback);
        }
    }

    function getPlaceDetailsById(placeId, callback){
        var request = {
          placeId: placeId || ''
        };
        if(PlacesService){
            PlacesService.getDetails(request, callback);
        }
    }

    function setFinderLocation(loc){
        location = loc || defaultLoc;
        console.log('set Location to '+ JSON.stringify(location));
    }

    function getFinderLocation(){
        return defaultLoc;
    }

    return {
        getPlacesByType : function(type, callback){
            return getPlacesByType(type, callback);
        },
        getPlacesByTypeAndKeywords : function(type, callback){
            return getPlacesByTypeAndKeywords(type, callback);
        },
        getPlaceDetailsById: function(placeId, callback){
            return getPlaceDetailsById(placeId, callback);
        },
        setFinderLocation : function(loc){
            setFinderLocation(loc);
        },
        getFinderLocation : function(){
            return getFinderLocation();
        }
    };
})(jQuery, window);