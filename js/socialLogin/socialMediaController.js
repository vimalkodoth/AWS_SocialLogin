/**
 * Created by vimal_m on 11/7/17.
 */
module.exports = (function($,window) {
    var socialMedia = require('./socialMediaLogin.js');
        function SocialMediaController(){

        }

        SocialMediaController.prototype.loginToFacebook = function(){
            $.when(socialMedia.login({type: 'facebook'})).then(function (status) {
                console.log(status);
                //alert('logged in');
            }, function (status) {
                console.log(status);
                //alert('not logged in');
            });
        };
        SocialMediaController.prototype.onGoogleSignIn = function(googleUser){
            var profile = googleUser.getBasicProfile();
            console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
            console.log('Name: ' + profile.getName());
            console.log('Image URL: ' + profile.getImageUrl());
            console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
        };
        SocialMediaController.prototype.getFBUserName = function(userId){
            return socialMedia.getFacebookUserName(userId);
        };
        SocialMediaController.prototype.setLastLoginType = function(type){
            socialMedia.setLastLoginType(type);
        };

    return new SocialMediaController();
})(jQuery, Window);