angular.module('ahotelApp')

	.directive('ahtlSlider', ['sliderService', function(sliderService) {
		"use strict";

		function ahtlSliderController($scope) {
			$scope.slider = sliderService;
			$scope.slidingDirection = null;

			$scope.nextSlide = function() {
				$scope.slidingDirection = 'left';
				$scope.slider.getNextSlide();
			};

			$scope.prevSlide = function() {
				$scope.slidingDirection = 'right';
				$scope.slider.getPrevSlide();
			};

			$scope.setSlide = function(index) {
				$scope.slidingDirection = index > $scope.slider.getCurrentSlide(true) ? 'left' : 'right';
				$scope.slider.setCurrentSlide(index);
			};
		}

		function link(scope, elem) {
			let arrows = $(elem).find('.slider__arrow');

			arrows.click(function () {
				// fixing IE8 png-background bug with 2 bg images
				if ($(this).hasClass('slider__arrow-right')) {
					$(this).css('background-image', 'url("../assets/images/slider/arrow_right_opacity.png")');
				} else {
					$(this).css('background-image', 'url("../assets/images/slider/arrow_left_opacity.png")');
				}

				this.disabled = true;

				setTimeout(() => {
					this.disabled = false;
					if ($(this).hasClass('slider__arrow-right')) {
						$(this).css('background-image', 'url("../assets/images/slider/arrow_right.png")');
					} else {
						$(this).css('background-image', 'url("../assets/images/slider/arrow_left.png")');
					}
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
	}]);

