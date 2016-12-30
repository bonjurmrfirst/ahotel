(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlTop3', ahtlTop3Directive);

    ahtlTop3Directive.$inject = ['top3Service'];

    function ahtlTop3Directive(top3Service) {

        return {
            restrict: 'A',
            controller: ahtlTop3Controller,
            controllerAs: 'top3'
        };

        function ahtlTop3Controller($scope, $element, $attrs) {
            this.resortType = $attrs.ahtlTop3;
            this.resort = null;

            this.getImgSrc = function(index) {
                return 'assets/images/' + this.resortType + '/' + this.resort[index].img.filename
            };

            top3Service.getTop3Places(this.resortType)
                .then((response) => {
                    this.resort = response.data;
                    console.log(this.resort);
                });


        }
    }
})();