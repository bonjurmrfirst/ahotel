(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .filter('reverse', reverse);

    function reverse() {
        return function(items) {
            return items.slice().reverse();
        }
    }
})();