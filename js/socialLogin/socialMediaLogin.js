/**
 * Created by vimal_m on 11/6/17.
 */
module.exports = (function($,window){
    var $script = require('scriptjs');
    var AWSService = require('./../aws/awsService.js');
    var Mediator = require('./../common/mediator.js');
    var _fbSdkIsLoaded = false;
    var _googleClientApiIsLoaded = false;
    var _isLoggedIn, auth2;
    function __loadModules() {
        var that = this;
        (function loadFbLoginApi(){
            _fbSdkIsLoaded = false;
            window.fbAsyncInit = function() {
                FB.init({
                    appId      : 1329338003843198,
                    cookie     : true,  // enable cookies to allow the server to access
                    // the session
                    xfbml      : true,  // parse social plugins on this page
                    version    : 'v2.5' // use version 2.1
                });
                _fbSdkIsLoaded = true;
                that.isLoggedIn();
            };

            console.log("Loading fb api");
            // Load the SDK asynchronously
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        })();
        (function loadGoogleClientApi(){
            $script('https://apis.google.com/js/api:client.js', function(){
                _googleClientApiIsLoaded = true;
                __initGapi();
            });
        })();
    }

    function __initGapi(){
        gapi.load('auth2', function() {
            // Retrieve the singleton for the GoogleAuth library and set up the client.
            auth2 = gapi.auth2.init({
                client_id: '703105099754-jmp7kjet7efsc3b3ofpll17qs566ls4r.apps.googleusercontent.com',
                cookiepolicy: 'single_host_origin',
                // Request scopes in addition to 'profile' and 'email'
                //scope: 'additional_scope'
            });
            Mediator.publish('Google_Auth2_Loaded', {auth2: auth2});

        });
    }
    function __handleFBLogin(){
        var dfd_login = $.Deferred();
        var that = this;
        if(!_fbSdkIsLoaded){
            //console.log('Facebook SDK isn\'t loaded yet!');
            setTimeout(function(){
                dfd_login.reject(false);
            },1000);
            //dfd_login.reject(false);
        } else {
            //$.when(this.isLoggedIn()).then(function(){
            //    dfd_login.resolve(true);
            //}, function(){
                FB.login(function (response) {
                        console.log(response);
                        if (response.status !== 'connected') {
                            that.config.accessToken = "";
                            Mediator.publish('EVT_LOGIN', {status : false, type:'facebook'});
                            dfd_login.reject(false);
                        } else {
                            that.config.accessToken = response.authResponse.accessToken;
                            Mediator.publish('EVT_LOGIN', {status : true, type:'facebook', userId: response.authResponse.userID, token: response.authResponse.accessToken});
                            AWSService.setIdentityCredentials({type:'facebook', webIdentityToken: response.authResponse.accessToken, roleSessionName:response.authResponse.userID });
                            dfd_login.resolve(true);
                        }
                    }, {scope: 'public_profile,email'});
        //    });
        }
        return dfd_login.promise();
    }
    function __setTokenOnLogin(){
        var that = this;
        Mediator.subscribe('EVT_LOGIN', function(resp){
            if(resp.type === 'google'){
                that.config.googleUser = resp.googleUser || that.config.googleUser || '';
            }
            if(resp.status){
                that.setUserToken(resp.token || "")
            } else {
                that.setUserToken("");
            }
        });
    }
    function SocialMediaLogin(){
        console.log('socialMedia object');
        this.config =  {};
        __loadModules.call(this);
        __setTokenOnLogin.call(this);
    }
    SocialMediaLogin.prototype.login = function(config){
            this.config = config;
            switch(config.type){
                case 'facebook' :
                            return __handleFBLogin.call(this);
                            break;
            }
    };

    SocialMediaLogin.prototype.isLoggedIn = function(){
        var dfd_login = $.Deferred();
        var that = this;
        if(!_fbSdkIsLoaded || !FB){
            if(!gapi || !auth2) {
                Mediator.publish('EVT_LOGIN', {status: false, type: 'facebook'});
                dfd_login.reject(false);
            }
        } else {
            FB.getLoginStatus(function (response) {
                var gUser;
                //AWSService.setIdentityCredentials({webIdentityToken: response.authResponse.accessToken, roleSessionName:response.authResponse.userID });
                //console.log('loginstatus response');
                if (response.status === 'connected') {
                    console.log('publish');
                    Mediator.publish('EVT_LOGIN', {
                        status: true,
                        type: 'facebook',
                        userId: response.authResponse.userID,
                        token: response.authResponse.accessToken
                    });
                    that.config.accessToken = response.authResponse.accessToken;
                    if(that.getLastLoginType() === 'facebook') {
                        AWSService.setIdentityCredentials({
                            type: 'facebook',
                            webIdentityToken: response.authResponse.accessToken,
                            roleSessionName: response.authResponse.userID
                        });
                    }
                    dfd_login.resolve(true);
                }
                else {
                    //console.log('Not Logged in');
                    Mediator.publish('EVT_LOGIN', {status: false, type: 'facebook', userId: ""});
                    if(!gapi.auth2.getAuthInstance().isSignedIn.get()) {
                        console.log('publish');
                        that.config.accessToken = "";
                        Mediator.publish('EVT_LOGIN', {status: false, type: 'google', userId: ""});
                        dfd_login.reject(false);
                    } else {
                        gUser = auth2.currentUser.get();
                        Mediator.publish('EVT_LOGIN', {status: true, type: 'google', googleUser: gUser, token: gUser.Zi && gUser.Zi.id_token});
                        that.config.accessToken = gUser.Zi && gUser.Zi.id_token;
                        if(that.getLastLoginType() === 'google') {
                            AWSService.setIdentityCredentials({
                                type: 'google',
                                webIdentityToken: that.config.accessToken,
                                roleSessionName: gUser.El
                            });
                        }
                        dfd_login.resolve(true);
                    }
                }
            });
        }
        return dfd_login.promise();
    };

    SocialMediaLogin.prototype.getFacebookUserName = function(userId){
        var dfd_promise = $.Deferred();
        if (!this.config.accessToken && typeof(Storage) !== "undefined") {
            this.config.accessToken = this.getUserToken();
        }
        FB.api('/'+userId+'?access_token='+this.config.accessToken, function(data){
            console.log(data);
            dfd_promise.resolve(data.name);
        });
        return dfd_promise.promise();
    };
    SocialMediaLogin.prototype.setUserToken = function(token){
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem('userToken', token);
        }
    };
    SocialMediaLogin.prototype.getUserToken = function(){
        if (typeof(Storage) !== "undefined") {
            return localStorage.getItem('userToken');
        }
    };
    SocialMediaLogin.prototype.getLastLoginType = function(){
        return this.config.lastUserLogin;
    };
    SocialMediaLogin.prototype.setLastLoginType = function(type){
        this.config.lastUserLogin = type;
    };
    return new SocialMediaLogin();

})(jQuery, window);