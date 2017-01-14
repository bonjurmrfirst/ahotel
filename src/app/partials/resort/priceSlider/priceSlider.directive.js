(function () {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlPriceSlider', priceSliderDirective);

    priceSliderDirective.$inject = [];

    function priceSliderDirective() {
        return {
            scope: {//todo@=
                min: "=min",
                max: "=max"
            },
            restrict: 'E',
            templateUrl: 'app/partials/resort/priceSlider/priceSlider.html',
            link: priceSliderDirectiveLink
        };

        function priceSliderDirectiveLink($scope, elem, attrs) {
            let rightBtn = $('.slide__pointer--right'),
                leftBtn = $('.slide__pointer--left');

            initDrag(
                rightBtn,
                parseInt(rightBtn.css('left')),
                () => parseInt($('.slide').css('width')),
                () => parseInt(leftBtn.css('left')));

            initDrag(
                leftBtn,
                parseInt(leftBtn.css('left')),
                () => parseInt(rightBtn.css('left')),
                () => 0);

            function initDrag(dragElem, initPosition, maxPosition, minPosition) {
                let shift;

                dragElem.on('mousedown', btnOnMouseDown);

                function btnOnMouseDown(event) {
                    shift = event.pageX;
                    initPosition = parseInt(dragElem.css('left'));

                    $(document).on('mousemove', docOnMouseMove);
                    dragElem.on('mouseup', btnOnMouseUp);
                    $(document).on('mouseup', btnOnMouseUp);
                }

                function docOnMouseMove(event) {
                    if (initPosition + event.pageX - shift >= minPosition() + 20 &&
                        initPosition + event.pageX - shift <= maxPosition() - 20) {
                        dragElem.css('left', initPosition + event.pageX - shift);
                    }
                }

                function btnOnMouseUp() {
                    $(document).off('mousemove', docOnMouseMove);
                    dragElem.off('mouseup', btnOnMouseUp);
                    $(document).off('mouseup', btnOnMouseUp);

                    initPosition = parseInt(dragElem.css('left'));
                }

                dragElem.on('dragstart', () => {
                    return false
                });
            }
        }
    }
})();