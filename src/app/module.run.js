(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .run(function($rootScope) {
            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams/*, fromState, fromParams todo*/){
                    $rootScope.$currentStateName = toState.name;
                    $rootScope.$currentStateParams = toParams;
                });
        });
})();