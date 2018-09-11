/**
 * Created by vimal_m on 11/7/17.
 */
module.exports = (function($,window){
    var AWS = require('aws-sdk');
    function AWSService(){
        this.config = AWS.config;
    }
    AWSService.prototype.setIdentityCredentials = function(credentials){
        this.config.credentials = new AWS.WebIdentityCredentials({
            RoleArn: credentials.type === 'facebook' ? 'arn:aws:iam::xxxxxxx:role/rekognitionrole' : 'arn:aws:iam::xxxxxxxx:role/rekognitionrolegooglessodev',
            ProviderId: credentials.type === 'facebook' ? 'graph.facebook.com' : null,
            WebIdentityToken: credentials.webIdentityToken, // token from identity service
            //ProviderId: 'graph.facebook.com|www.amazon.com',
            RoleSessionName: credentials.roleSessionName || 'web' // optional name, defaults to web-identity
        }, {
            // optionally provide configuration to apply to the underlying AWS.STS service client
            // if configuration is not provided, then configuration will be pulled from AWS.config

            // specify timeout options
            httpOptions: {
                timeout: 1000
            }
        });
        AWS.config.credentials.params.WebIdentityToken = credentials.webIdentityToken;
        AWS.config.update({
            credentials : this.config.credentials,
            region : 'eu-west-1'
        });
    };
    AWSService.prototype.getAWSRequestConfig = function(){
        return this.config;
    };
    AWSService.prototype.getRekognitionService = function(){
        return require('./rekognitionService.js');
    };
    return new AWSService();
})(jQuery, window);