(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .filter('activitiesFilter', activitiesFilter);

    activitiesFilter.$inject = ['$log'];

    function activitiesFilter($log, filtersService) {
        return function (arg, _stringLength) {
            let stringLength = parseInt(_stringLength);

            if (isNaN(stringLength)) {
                $log.warn(`Can't parse argument: ${_stringLength}`);
                return arg
            }

            let result = arg.join(', ').slice(0, stringLength);

            return result.slice(0, result.lastIndexOf(',')) + '...'
        };
    }
})();
