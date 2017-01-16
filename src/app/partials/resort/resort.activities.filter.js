(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .filter('activitiesfilter', activitiesFilter);

    activitiesFilter.$inject = ['$log'];

    function activitiesFilter($log) {
        return function (arg, _stringLength) {
            let stringLength = parseInt(_stringLength);

            if (isNaN(stringLength)) {
                $log.warn(`Can't parse argument: ${_stringLength}`);
                return
            }

            let result = arg.join(', ').slice(0, stringLength);

            return result.slice(0, result.lastIndexOf(',')) + '...'
        };
    }
})();
