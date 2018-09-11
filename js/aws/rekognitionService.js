module.exports = (function($,window){
    var AWS = require('aws-sdk');
    var AWSService = require('./awsService.js');
    var socialMediaService = require('./../socialLogin/socialMediaLogin.js');
    var that, config, globalConfig;
    function RekognitionService(params){
        that = this;
        globalConfig = AWSService.getAWSRequestConfig();
        config = params || {};
        this.rekognition = new AWS.Rekognition({credentials: globalConfig.credentials, region:'eu-west-1', correctClockSkew: true });
        //this.rekognition.config.credentials = globalConfig.credentials;
        //this.rekognition.config.region = 'eu-west-1';
    }
    RekognitionService.prototype.detectModerationLabels = function(imageFile){
        var dfd_reko = $.Deferred();
        console.log('configuration');
        console.log(globalConfig);
         $.when(socialMediaService.isLoggedIn()).then(function() {
             console.log(imageFile);
             var params = {
                 Image: {
                     Bytes: imageFile
                 },
                 MinConfidence: 0.0
             };
             that.rekognition.detectModerationLabels(params, function (err, data) {
                 if (err || data.ModerationLabels.length) {
                     err && console.log(err, err.stack);
                     data && console.log(data);
                     dfd_reko.reject(err || data);
                 } else {
                     console.log(data);
                     dfd_reko.resolve(data);
                 }
             });
         });
        return dfd_reko.promise();
    };
    RekognitionService.prototype.detectLabels = function(imageFile){
        var dfd_reko = $.Deferred();
        $.when(socialMediaService.isLoggedIn()).then(function() {
            console.log(imageFile);
            var params = {
                Image: {
                    Bytes: imageFile
                },
                MinConfidence: 75,
                MaxLabels: 10
            };
            that.rekognition.detectLabels(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    dfd_reko.reject(err);
                } else if(!config.allowedLabels.some(function(label){ return data.Labels.some(function(obj) { return obj.Name.toLowerCase() === label})})){
                    console.log(data.Labels);
                    console.log('Response does not contain allowedLabels');
                    dfd_reko.reject(false);
                } else {
                    console.log(data.Labels);
                    console.log('Response does satisfy allowedLabels');
                    dfd_reko.resolve(data.Labels);
                }
            });
        });
        return dfd_reko.promise();

    };
    return new RekognitionService({allowedLabels : ['car','truck','suv']});
})(jQuery, window);