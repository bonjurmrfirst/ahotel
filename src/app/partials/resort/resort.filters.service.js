(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .factory('filtersService', filtersService);

    filtersService.$inject = ['hotelDetailsConstant', '$log'];

    function filtersService(hotelDetailsConstant, $log) {
        let model,
            filteredModel,
            filters = {};

        function initFilters() {
            filters = {};

            for (let key in hotelDetailsConstant) {
                filters[key] = {};
                for (let i = 0; i < hotelDetailsConstant[key].length; i++) {
                    filters[key][hotelDetailsConstant[key][i]] = false;
                }
            }

            filters.price = {
                min: 0,
                max: 1000
            };

            return filters
        }

        function setModel(newModel) {
            model = currenetModel;
        }

        function applyFilters(newFilters) {


            return resultModel;
        }

        return {
            initFilters: initFilters,
            setModel: setModel,
            applyFilters: applyFilters
        };
    }
})();