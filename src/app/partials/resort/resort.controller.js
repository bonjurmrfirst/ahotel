(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('ResortController', ResortController);

    ResortController.$inject = ['resortService', 'hotelDetailsConstant', '$filter', '$scope'];

    function ResortController(resortService, hotelDetailsConstant, $filter, $scope) {
        this.filters = initFilters();

        let currentFilters = {};
        this.onFilterChange = function(filterGroup, filter, value) {
            //console.log(filterGroup, filter, value);
            if (value) {
                currentFilters[filterGroup] = currentFilters[filterGroup] || [];
                currentFilters[filterGroup].push(filter);
            } else {
                currentFilters[filterGroup].splice(currentFilters[filterGroup].indexOf(filter), 1);
                if (currentFilters[filterGroup].length === 0) {
                    delete currentFilters[filterGroup]
                }
            }

            this.hotels = $filter('hotelFilter')(hotels, currentFilters);
            this.getShowHotelCount = this.hotels.reduce((counter, item) => item._hide ? counter : ++counter, 0);
            $scope.$broadcast('showHotelCountChanged', this.getShowHotelCount);
        };

        let hotels = {};
        resortService.getResort().then((response) => {
            hotels = response;
            this.hotels = hotels;

            $scope.$watch(
                () => this.filters.price,
                (newValue) => {
                    currentFilters.price = [newValue];
                    //console.log(currentFilters);

                    this.hotels = $filter('hotelFilter')(hotels, currentFilters);
                    this.getShowHotelCount = this.hotels.reduce((counter, item) => item._hide ? counter : ++counter, 0);
                    $scope.$broadcast('showHotelCountChanged', this.getShowHotelCount);                }, true);

            this.getShowHotelCount = this.hotels.reduce((counter, item) => item._hide ? counter : ++counter, 0);
            $scope.$broadcast('showHotelCountChanged', this.getShowHotelCount);
        });

        this.openMap = function(hotelName, hotelCoord, hotel) {
            let data = {
                show: 'map',
                name: hotelName,
                coord: hotelCoord
            };
            $scope.$root.$broadcast('modalOpen', data)
        };

        function initFilters() {
            let filters = {};

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
    }
})();