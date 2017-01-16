(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('ResortController', ResortController);

    ResortController.$inject = ['hotelDetailsConstant', 'resortService'];

    function ResortController(hotelDetailsConstant, resortService) {
        this.loading = true;

        this.renderFiltersList = hotelDetailsConstant;

        this.filters = {};
        this.filters.price = {
            min: 0,
            max: 1000
        };

        this.hotels = {};

        resortService.getResort().then((response) => {
            this.hotels = response
        });
        /*((response) => {
                console.log(response)
                this.loading = false;
        },
            (response) => {
                console.log(response)
            });*/
    }
})();