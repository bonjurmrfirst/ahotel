(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .factory('top3Service', top3Service);

    top3Service.$inject = ['$http'];

    function top3Service($http) {
        return {
            getTop3Places: getTop3Places
        };

        function getTop3Places(type) {
            return $http({
                method: 'GET',
                url: '/api/top3',
                params: {
                    action: 'get',
                    type: type
                }
            }).then(onResolve, onReject);
        }

        function onResolve(response) {
            return response;
        }

        function onReject(response) {
            return response;
        }
    }
})();