(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.directive('ahtlSlider', ahtlSlider);

	ahtlSlider.$inject = ['sliderService'];

	function ahtlSlider(sliderService) {
		function ahtlSliderController($scope) {
			$scope.slider = sliderService;
			$scope.slidingDirection = null;

			$scope.nextSlide = function () {
				$scope.slidingDirection = 'left';
				$scope.slider.getNextSlide();
			};

			$scope.prevSlide = function () {
				$scope.slidingDirection = 'right';
				$scope.slider.getPrevSlide();
			};

			$scope.setSlide = function (index) {
				$scope.slidingDirection = index > $scope.slider.getCurrentSlide(true) ? 'left' : 'right';
				$scope.slider.setCurrentSlide(index);
			};
		}

		function fixIE8pngBlackBg(element) {
			$(element)
				.css('-ms-filter', "progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)")
				.css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)')
				.css('zoom', '1');
		}

		function link(scope, elem) {
			let arrows = $(elem).find('.slider__arrow');

			arrows.click(function () {
				$(this).css('opacity', '0.5');
				fixIE8pngBlackBg(this);

				this.disabled = true;

				setTimeout(() => {
					this.disabled = false;
					$(this).css('opacity', '1');
					fixIE8pngBlackBg($(this));
				}, 500)
			});
		}

		return {
			restrict: 'EA',
			scope: {},
			controller: ahtlSliderController,
			templateUrl: 'app/templates/header/slider/slider.html',
			link: link
		}
	}
})();

