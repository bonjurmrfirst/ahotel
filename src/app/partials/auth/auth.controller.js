(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['$rootScope', '$scope', 'authService', '$state'];

    function AuthController($rootScope, $scope, authService, $state) {
        this.validationStatus = {
            userAlreadyExists: false,
            loginOrPasswordIncorrect: false
        };

        this.createUser = function() {
            authService.createUser(this.newUser)
                .then((response) => {
                    if (response === 'OK') {
                        console.log(response);
                        $state.go('auth', {'type': 'login'})
                    } else {
                        this.validationStatus.userAlreadyExists = true;
                        console.log(response);
                    }
                });
            /*console.log($scope.formJoin);
            console.log(this.newUser);*/
        };

        this.loginUser = function() {
            authService.login(this.user)
                .then((response) => {
                    if (response === 'OK') {
                        console.log(response);
                        var previousState = $rootScope.$state.stateHistory[$rootScope.$state.stateHistory.length - 2] || 'home';
                        console.log(previousState);
                        $state.go(previousState)
                    } else {
                        this.validationStatus.loginOrPasswordIncorrect = true;
                        console.log(response);
                    }
                })
        };
    }
})();