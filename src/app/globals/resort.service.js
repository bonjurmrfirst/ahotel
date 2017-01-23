(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .factory('resortService', resortService);

    resortService.$inject = ['$http', 'backendPathsConstant', '$q'];

    function resortService($http, backendPathsConstant, $q) {
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
                model = response;
                return applyFilter(model)
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

                return model.filter((hotel) => hotel[filter.prop] == filter.value);
            }
        }

        return {
            getResort: getResort
        };
    }
})();