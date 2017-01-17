(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .factory('resortService', resortService);

    resortService.$inject = ['$http', 'backendPathsConstant'];

    function resortService($http, backendPathsConstant) {
        return {
            getResort: getResort
        };

        function getResort() {
            return $http({
                method: 'GET',
                url: backendPathsConstant.hotels
            })
                .then(onResolve, onRejected);

            function onResolve(response) {
                //console.log(response.data)
                return response.data
            }

            function onRejected(response) {
                return response
            }
        }
    }
})();