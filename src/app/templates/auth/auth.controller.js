(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['$scope', 'authService', '$state'];

    function AuthController($scope, authService, $state) {
        this.validationStatus = {
            userAlreadyExists: false
        };

        this.createUser = function() {
            authService.createUser(this.newUser)
                .then((response) => {
                    if (response === 'OK') {
                        console.log(response);
                        $state.go('auth', {'type': 'login'})
                    } else {
                        alert();
                        this.validationStatus.userAlreadyExists = true;
                        console.log(response);
                    }
                });
            /*console.log($scope.formJoin);
            console.log(this.newUser);*/
        };

        this.loginUser = function() {
            console.log(this.user);
        };
    }
})();