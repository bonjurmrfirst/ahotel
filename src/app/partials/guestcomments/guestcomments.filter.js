(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .filter('reverse', reverse);

    function reverse() {
        return function(items) {
            //to errors
            return items.slice().reverse();
        }
    }
})();