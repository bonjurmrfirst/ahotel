(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('BookingController', BookingController);

    BookingController.$inject = ['$stateParams'];

    function BookingController($stateParams) {
        console.log($stateParams);
    }
})();