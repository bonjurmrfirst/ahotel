(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('ResortController', ResortController);

    ResortController.$inject = ['resortService', '$filter', '$scope', '$state'];

    function ResortController(resortService, $filter, $scope, $state) {
        let currentFilters = $state.$current.data.currentFilters; // temp

        this.filters = $filter('hotelFilter').initFilters();

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

            this.hotels = $filter('hotelFilter').applyFilters(hotels, currentFilters);
            this.getShowHotelCount = this.hotels.reduce((counter, item) => item._hide ? counter : ++counter, 0);
            $scope.$broadcast('showHotelCountChanged', this.getShowHotelCount);
        };

        let hotels = {};
        resortService.getResort().then((response) => {
            if (!response) {
                this.error = true;
                return
            }

            hotels = response;
            this.hotels = hotels;

            $scope.$watch(
                () => this.filters.price,
                (newValue) => {
                    currentFilters.price = [newValue];
                    //console.log(currentFilters);

                    this.hotels = $filter('hotelFilter').applyFilters(hotels, currentFilters);
                    this.getShowHotelCount = this.hotels.reduce((counter, item) => item._hide ? counter : ++counter, 0);
                    $scope.$broadcast('showHotelCountChanged', this.getShowHotelCount);                }, true);

            this.getShowHotelCount = this.hotels.reduce((counter, item) => item._hide ? counter : ++counter, 0);
            $scope.$broadcast('showHotelCountChanged', this.getShowHotelCount);
        });

        this.openMap = function(hotelName, hotelCoord) {
            let data = {
                show: 'map',
                name: hotelName,
                coord: hotelCoord
            };
            $scope.$root.$broadcast('modalOpen', data)
        };


    }
})();