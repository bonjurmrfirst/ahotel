(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlTop3', ahtlTop3Directive);

    ahtlTop3Directive.$inject = ['top3Service', 'hotelDetailsConstant'];

    function ahtlTop3Directive(top3Service, hotelDetailsConstant) {

        return {
            restrict: 'E',
            controller: AhtlTop3Controller,
            controllerAs: 'top3',
            templateUrl: 'app/templates/resorts/top3.template.html'
        };

        function AhtlTop3Controller($scope, $element, $attrs) {
            this.details = hotelDetailsConstant;
            this.resortType = $attrs.ahtlTop3type;
            this.resort = null;

            this.getImgSrc = function(index) {
                return 'assets/images/' + this.resortType + '/' + this.resort[index].img.filename
            };

            this.isResortIncludeDetail = function(item, detail) {
                let detailClassName = 'top3__detail-container--' + detail,
                    isResortIncludeDetailClassName = !item.details[detail] ? ' top3__detail-container--has' : '';

                return detailClassName + isResortIncludeDetailClassName
            };

            top3Service.getTop3Places(this.resortType)
                .then((response) => {
                    this.resort = response.data;
                    console.log(this.resort);
                }
            );

        }
    }
})();