/**
 * Created by vimal_m on 11/7/17.
 */
module.exports = (function($,window){
    var AWSService = require('./../aws/awsService.js');
    var socialMediaController = require('./socialMediaController.js');
    var Mediator = require('./../common/mediator.js');
    function attachSignIn(element){
        Mediator.subscribe('Google_Auth2_Loaded', function(response) {
            response.auth2.attachClickHandler(element[0], {},
                function (googleUser) {
                    console.log('Google User');
                    console.log(googleUser);
                    Mediator.publish('EVT_LOGIN', {status : true, googleUser: googleUser, type:'google', token: googleUser.Zi.id_token});
                    AWSService.setIdentityCredentials({type: 'google', webIdentityToken: googleUser.Zi.id_token, roleSessionName:googleUser.El });
                }, function (error) {
                    //alert(JSON.stringify(error, undefined, 2));
                });
        });
    }
    function updateStatus(element){
        Mediator.subscribe('EVT_LOGIN', function(resp){
            socialMediaController.setLastLoginType(resp.type);
            if(resp.status){
                lastUserLogin = resp.type;
                switch(resp.type){
                    case 'google': (function(){
                                        element[0].innerText = "Signed in " +resp.type+' as '+
                                        resp.googleUser.getBasicProfile().getName();
                                    })();
                                    break;
                    case 'facebook': (function(){
                                            var name;
                                            console.log('facebook');
                                            socialMediaController.getFBUserName(resp.userId).then(function(name){
                                                console.log('testing ...');
                                                element[0].innerText = "Signed in " +resp.type+' as '+name;
                                            });
                                        })();
                }
            }
        });

    }
    function socialMediaUI(){
        this.facebookElement =  $('#social_fb_login');
        this.gmailElement = $('#social_google_login');
        this.socialStatusElement = $('#social_login_status');
        this.onClick('facebook');
        attachSignIn(this.gmailElement);
        updateStatus(this.socialStatusElement);
    }

    socialMediaUI.prototype.onClick = function(type){
        var that = this;
        switch(type) {
            case 'facebook' : (function(){
                                    console.log(that.facebookElement);
                                    that.facebookElement.off('click').on('click', function (e) {
                                        console.log('clicked');
                                        socialMediaController.loginToFacebook();
                                    })
                                })();
                                break;
        }
    };
    //socialMediaUI.prototype.onGoogleSignIn = function(googleUser){
    //    console.log('test signedin');
    //    console.log(googleUser);
    //    socialMediaController.onGoogleSignIn(googleUser)
    //};
   /* $.when(socialMedia.login({type:'Facebook'})).then(function(status){
        console.log(status);
    }, function(status){
        console.log(status);
    });
    setTimeout(function(){
        $.when(socialMedia.login({type:'Facebook'})).then(function(status){
            console.log(status);
        }, function(status){
            console.log(status);
        });
    },2000);*/

    return new socialMediaUI();

})(jQuery, Window);

