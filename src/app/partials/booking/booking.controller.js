(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('BookingController', BookingController);

    BookingController.$inject = ['$stateParams', 'resortService', '$state', '$rootScope'];

    function BookingController($stateParams, resortService, $state, $rootScope) {
        this.hotel = null;
        this.loaded = false;

        console.log($state);

        resortService.getResort({
                prop: '_id',
                value: $stateParams.hotelId})
            .then((response) => {
                if (!response) {
                    this.error = true;
                    return
                }
                this.hotel = response[0];
                this.loaded = true;
            });

        //this.hotel = $stateParams.hotel;

        this.getHotelImagesCount = function(count) {
            return new Array(count - 1);
        };

        this.openImage = function($event) {
            let imgSrc = $event.target.src;

            if (imgSrc) {
                $rootScope.$broadcast('modalOpen', {
                    show: 'image',
                    src: imgSrc
                });
            }
        }
    }
})();