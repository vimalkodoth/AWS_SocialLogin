/**
 * Created by vimal_m on 11/8/17.
 */
module.exports = (function($,window){

    //Mediator.publish('LoggedIn', { status : true });
    //Mediator.subscribe('LoggedIn', function(obj){ });

    function Mediator(){
        this.channels = {};
    }

    Mediator.prototype.publish = function(evt){
        var params;
        if(!this.channels[evt]) {
            return;
        }
        params = Array.prototype.slice.call(arguments,1);

        for(var i=0;i< this.channels[evt].length;i++) {
            this.channels[evt][i].apply(this,params);
        }
    };

    Mediator.prototype.subscribe = function(evt, callback){
        if(!this.channels[evt]){
            this.channels[evt] = [];
        }
        this.channels[evt].push(callback);
    };

    return new Mediator();

})(jQuery, Window);