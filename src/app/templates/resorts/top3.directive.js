(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlTop3', ahtlTop3Directive);

    function ahtlTop3Directive() {
        function AhtlTop3Controller() {

        }

        return {
            restrict: 'A',
            transclude: true,
            scope: {},
            controller: AhtlTop3Controller,
            controllerAs: 'top3'/*,
            templateUrl: 'app/templates/header/slider/slider.html',
            link: link*/
        }
    }
});