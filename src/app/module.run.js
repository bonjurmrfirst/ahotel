(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .run(function($rootScope) {
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
        });
})();