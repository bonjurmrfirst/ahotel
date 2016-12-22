angular.module('ahotelApp')

	.directive('ahtlSlider', ['SliderService', function(SliderService) {
		"use strict";

		function ahtlSliderController() {
			let imageList = [
				'assets/images/slider/slider1.jpg',
				'assets/images/slider/slider2.jpg',
				'assets/images/slider/slider3.jpg'
			];

			this.slider = new SliderService(imageList);
		}

		return {
			restrict: 'EA',
			scope: {},
			controller: ahtlSliderController,
			controllerAs: 'slider',
			templateUrl: 'app/templates/header/slider/slider.html'
		}
	}]);