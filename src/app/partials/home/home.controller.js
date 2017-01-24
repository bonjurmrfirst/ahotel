(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['resortService'];

    function HomeController(resortService) {
        resortService.getResort({prop: '_trend', value: true}).then((response) => {
            this.hotels = response;
        });
    }
})();