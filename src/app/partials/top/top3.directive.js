(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlTop3', ahtlTop3Directive);

    ahtlTop3Directive.$inject = ['resortService', 'hotelDetailsConstant'];

    function ahtlTop3Directive(resortService, hotelDetailsConstant) {
        return {
            restrict: 'E',
            controller: AhtlTop3Controller,
            controllerAs: 'top3',
            templateUrl: 'app/partials/top/top3.template.html'
        };

        function AhtlTop3Controller($scope, $element, $attrs) {
            this.details = hotelDetailsConstant.mustHaves;
            this.resortType = $attrs.ahtlTop3type;
            this.resort = null;

            this.getImgSrc = function(index) {
                return 'assets/images/' + this.resortType + '/' + this.resort[index].img.filename
            };

            this.isResortIncludeDetail = function(item, detail) {
                let detailClassName = 'top3__detail-container--' + detail,
                    isResortIncludeDetailClassName = !item.details[detail] ? ' top3__detail-container--hasnt' : '';

                return detailClassName + isResortIncludeDetailClassName
            };

            resortService.getResort({prop: 'type', value: this.resortType}).then((response) => {
                    if (!response) {
                        return
                    }
                    this.resort = response;

                    if (this.resortType === 'Hotel') {
                        this.resort = this.resort.filter((hotel) => hotel._showInTop === true)
                    }
                }
            );

        }
    }
})();