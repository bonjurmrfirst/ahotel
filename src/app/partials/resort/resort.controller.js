(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('ResortController', ResortController);

    ResortController.$inject = ['filtersService', 'resortService', '$scope', 'hotelDetailsConstant'];

    function ResortController(filtersService, resortService, $scope, hotelDetailsConstant) {
        this.loading = true;
        this.hotels = {};

        this.filters = filtersService.getFilters();

        this.onFilterChange = function(filterGroup, filter, value) {
            console.log(filterGroup, filter, value);
            this.hotels = filtersService.applyFilters(filterGroup, filter, value).getModel();
        };

        resortService.getResort().then((response) => {
            this.hotels = filtersService.setModel(response).getModel();
        });

        /*$scope.$watch(() => this.filters,
         (newValue) => {//todo
         this.hotels = filtersService
         .applyFilter(newValue)
         .getModel();

         console.log(this.hotels)
         }, true);*/
    }
})();