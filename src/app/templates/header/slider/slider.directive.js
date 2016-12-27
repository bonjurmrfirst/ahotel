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
				$(this).css('opacity', '0.5');
				$(this).css('-ms-filter', "progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)");
				$(this).css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)');
				$(this).css('zoom', '1');


				this.disabled = true;

				setTimeout(() => {
					this.disabled = false;
					$(this).css('opacity', '1');
					$(this).css('-ms-filter', "progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)");
					$(this).css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)');
					$(this).css('zoom', '1');
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

