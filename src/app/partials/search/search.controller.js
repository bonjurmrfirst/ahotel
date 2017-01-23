(function () {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$state', 'resortService'];

    function SearchController($state, resortService) {
        this.query = $state.params.query;
        console.log(this.query);
        this.hotels = null;

        resortService.getResort()
            .then((response) => {
                this.hotels = response;
                search.call(this);
            });


        function search() {
            let parsedQuery = $.trim(this.query).replace(/\s+/g, ' ').split(' ');
            let result = [];

            angular.forEach(this.hotels, (hotel) => {
                //console.log(hotel);
                let hotelContent = hotel.name + hotel.location.country +
                    hotel.location.region + hotel.desc + hotel.descLocation;
                //console.log(hotelContent)
                //for ()
                let matchesCounter = 0;
                for (let i = 0; i < parsedQuery.length; i++) {
                    let qRegExp = new RegExp(parsedQuery[i], 'gi');
                    matchesCounter += (hotelContent.match(qRegExp) || []).length;
                }

                if (matchesCounter > 0) {
                    result[hotel._id] = {};
                    result[hotel._id].matchesCounter = matchesCounter;
                }
            });

            this.searchResults = this.hotels
                .filter((hotel) => result[hotel._id])
                .map((hotel) => {
                    hotel._matches = result[hotel._id].matchesCounter;
                    return hotel;
                })

            console.log(this.searchResults);
        }
    }
})();