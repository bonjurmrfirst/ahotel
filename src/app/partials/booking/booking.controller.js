(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('BookingController', BookingController);

    BookingController.$inject = ['$stateParams', 'resortService', '$scope'];

    function BookingController($stateParams, resortService, $scope) {

        this.hotel = null;
        this.loaded = false;

        /* dev only */
        let self = this;
        if ($stateParams.hotel._id) {
            this.hotel = $stateParams.hotel;
            self.loaded = true;
        } else {
            getHotels();
        }

        function getHotels() {
            resortService.getResort().then((response) => {
                self.hotel = response[0];
                self.loaded = true;
            });
        }
        /* dev only */

        //this.hotel = $stateParams.hotel;

        this.getHotelImagesCount = function(count) {
            return new Array(count - 1);
        }
    }
})();