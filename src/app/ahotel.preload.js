/*
(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .config(config);

    config.$inject = ['preloadServiceProvider', 'backendPathsConstant'];

    function config(preloadServiceProvider, backendPathsConstant) {
            preloadServiceProvider.config(backendPathsConstant.gallery, 'GET', 'get', 100, 'warning');
    }
})();*/
