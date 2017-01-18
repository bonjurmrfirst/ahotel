(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('ResortController', ResortController);

    ResortController.$inject = ['filtersService', 'resortService', '$scope', 'hotelDetailsConstant'];

    function ResortController(filtersService, resortService, $scope, hotelDetailsConstant) {
        /*this.obj = false;
        this.loading = true;
        this.hotels = {};

        this.filters = filtersService.initFilters();

        /!*resortService.getResort().then((response) => {
            this.hotels = response
        });*!/

        $scope.$watch(() => this.filters, function(newValue) {//todo
            //for (let key in )
            console.log(newValue)
        }, true);*/

        /*this.filters = {};

        for (let key in hotelDetailsConstant) {
            this.filters[key] = {};
            for (let i = 0; i < hotelDetailsConstant[key].length; i++) {
                this.filters[key][hotelDetailsConstant[key][i]] = true;
            }
        }

        this.filters.price = {
            min: 0,
            max: 1000
        };*/

        this.loading = true;
        this.hotels = {};

        this.filters = filtersService.createFilters();

        /*resortService.getResort().then((response) => {
            this.hotels = filtersService.setModel(response).getModel();
        });*/

        /*$scope.$watch(() => this.filters,
            (newValue) => {//todo
                this.hotels = filtersService
                    .applyFilter(newValue)
                    .getModel();

                console.log(this.hotels)
            }, true);*/

        /*((response) => {
                console.log(response)
                this.loading = false;
        },
            (response) => {
                console.log(response)
            });*/

        this.onFilterChange = function(filterGroup, filter, value) {
            console.log(filterGroup, filter, value);
            this.hotels = filtersService.applyFilter(filterGroup, filter, value).getModel();
        }
    }
})();