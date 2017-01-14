(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .constant('backendPathsConstant', {
            top3: '/api/top3',
            auth: '/api/users',
            gallery: '/api/gallery',
            guestcomments: '/api/guestcomments',
            hotels: '/api/hotels'
        });
})();