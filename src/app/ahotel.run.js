(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .run(run);

    run.$inject = ['$rootScope' , 'backendPathsConstant', 'preloadService'];

    function run($rootScope, backendPathsConstant, preloadService) {
        $rootScope.$state = {
            currentStateName: null,
            currentStateParams: null,
            stateHistory: []
        };

        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams/*, fromState, fromParams todo*/){
                $rootScope.$state.currentStateName = toState.name;
                $rootScope.$state.currentStateParams = toParams;
                $rootScope.$state.stateHistory.push(toState.name);
            });

        preloadService.preloadImages('gallery', {url: backendPathsConstant.gallery, method: 'GET', action: 'get'});
    }
})();