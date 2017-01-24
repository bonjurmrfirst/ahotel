(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .run(run);

    run.$inject = ['$rootScope' , '$timeout'];

    function run($rootScope, $timeout) {
        $rootScope.$logged = false;

        $rootScope.$state = {
            currentStateName: null,
            currentStateParams: null,
            stateHistory: []
        };

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            $rootScope.$state.currentStateName = toState.name;
            $rootScope.$state.currentStateParams = toParams;
            $rootScope.$state.stateHistory.push(toState.name);
        });

        $rootScope.$on('$stateChangeSuccess', function() {
            $timeout(() => $(window).scrollTop(0));
        });
    }
})();