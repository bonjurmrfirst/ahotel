(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .filter('hotelFilter', hotelFilter);

    hotelFilter.$inject = ['$log'];

    function hotelFilter($log) {
        return function(hotels, filters) {
            angular.forEach(hotels, function(hotel) {
                hotel._hide = false;
                isHotelMatchingFilters(hotel, filters);
            });

            function isHotelMatchingFilters(hotel, filters) {

                angular.forEach(filters, function(filtersInGroup, filterGroup) {
                    let matchAtLeaseOneFilter = false;

                    if (filterGroup === 'guests') {
                        filtersInGroup = [filtersInGroup[filtersInGroup.length - 1]];
                    }

                    for (var i = 0; i < filtersInGroup.length; i++) {
                        if (getHotelProp(hotel, filterGroup, filtersInGroup[i])) {
                            matchAtLeaseOneFilter = true;
                            break;
                        }
                    }

                    if (!matchAtLeaseOneFilter) {
                        hotel._hide = true;
                    }

                })
            }

            function getHotelProp(hotel, filterGroup, filter) {
                switch(filterGroup) {
                    case 'locations':
                        return hotel.location.country === filter;
                    case 'types':
                        return hotel.type === filter;
                    case 'settings':
                        return hotel.environment === filter;
                    case 'mustHaves':
                        return hotel.details[filter];
                    case 'activities':
                        return ~hotel.activities.indexOf(filter);
                    case 'price':
                        return hotel.price >= filter.min && hotel.price <= filter.max;
                    case 'guests':
                        return hotel.guests.max >= +filter[0];
                }
            }

            return hotels.filter((hotel) => !hotel._hide);
        }
    }
})();