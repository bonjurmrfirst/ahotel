(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('HeaderAuthController', HeaderAuthController);

    HeaderAuthController.$inject = ['authService'];

    function HeaderAuthController(authService) {
        this.signOut = function () {
            authService.signOut();
        }
    }
})();