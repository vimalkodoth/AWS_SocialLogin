/**
 * Created by vimal_m on 11/19/17.
 */
var xssFilters = require('xss-filters');
module.exports = (function(){
    function Validator(){

    }

    Validator.prototype.xssFilterUnquotedTextInput = function(inputVal){
        return xssFilters.inUnQuotedAttr(inputVal);
    };

    return new Validator();
})();