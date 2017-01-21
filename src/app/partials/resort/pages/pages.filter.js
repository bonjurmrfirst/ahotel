(function () {
    'use strict';

    angular
        .module('ahotelApp')
        .filter('showFrom', showFrom);

    function showFrom() {
        return function(model, startPosition) {
            if (!model) {
                return {};
            }

            return model.slice(startPosition);
        }
    }
})();