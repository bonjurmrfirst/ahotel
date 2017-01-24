(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .factory('resortService', resortService);

    resortService.$inject = ['$http', 'backendPathsConstant', '$q', '$log', '$rootScope'];

    function resortService($http, backendPathsConstant, $q, $log, $rootScope) {
        let model = null;

        function getResort(filter) {
            //todo errors: no hotels, no filter...
            if (model) {
                return $q.when(applyFilter(model));
            }

            return $http({
                method: 'GET',
                url: backendPathsConstant.hotels
            })
                .then(onResolve, onRejected);

            function onResolve(response) {
                model = response.data;
                return applyFilter(model)
            }

            function onRejected(response) {
                $log.error(`Cant get ${backendPathsConstant.hotels}`);
                $rootScope.$broadcast('displayError', {show: true});

                return null
            }

            function applyFilter() {
                if (!filter) {
                    return model
                }

                if (filter.prop === '_id' && filter.value === 'random') {
                    let discountModel = model.filter((hotel) => hotel['discount']);
                    let rndHotel = Math.floor(Math.random() * (discountModel.length));
                    return [discountModel[rndHotel]]
                }

                let result;

                try {
                    result = model.filter((hotel) => hotel[filter.prop] == filter.value);
                } catch(e) {
                    $log.error('Cant parse response');
                    $rootScope.$broadcast('displayError', {show: true, message: 'Error occurred'});
                    result = null;
                }

                return result
            }
        }

        return {
            getResort: getResort
        };
    }
})();