(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['$scope'];

    function AuthController($scope) {
        this.createUser = function() {
            console.log($scope.formJoin);
            console.log(this.newUser);
        };

        this.loginUser = function() {
            console.log(this.user);
        };
    }
})();