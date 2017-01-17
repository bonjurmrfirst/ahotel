(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('ResortController', ResortController);

    ResortController.$inject = ['filtersService', 'resortService', '$scope'];

    function ResortController(filtersService, resortService, $scope) {
        this.loading = true;
        this.hotels = {};

        this.filters = filtersService.initFilters();

        resortService.getResort().then((response) => {
            this.hotels = response
        });

        $scope.$watch(() => this.filters, function(newValue) {//todo
            //for (let key in )
            console.log(newValue)
        }, true);

        /*((response) => {
                console.log(response)
                this.loading = false;
        },
            (response) => {
                console.log(response)
            });*/
    }
})();