(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['authService'];

    function HeaderController(authService) {
        this.signOut = function () {
            authService.signOut();
        }
    }
})();