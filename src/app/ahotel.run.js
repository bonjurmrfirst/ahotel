(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .run(run);

    run.$inject = ['$rootScope' , 'backendPathsConstant', 'preloadService', '$window'];

    function run($rootScope, backendPathsConstant, preloadService, $window, log) {
        $rootScope.$logged = false;

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

        $window.onload = function() { //todo onload пернести в сервис
            preloadService.preloadImages('gallery', {url: backendPathsConstant.gallery, method: 'GET', action: 'get'}); //todo del method, action by default
        };

        //log.sendOnUnload();
    }
})();