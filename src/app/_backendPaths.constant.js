(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .constant('backendPathsConstant', {
           top3: '/api/top3',
           auth: '/api/users'
        });
})();