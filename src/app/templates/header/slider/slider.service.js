(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.factory('sliderService', sliderService);

	function sliderService() {
		function Slider(sliderImageList) {
			this._imageSrcList = sliderImageList;
			this._currentSlide = 0;
		}

		Slider.prototype.getImageSrcList = function () {
			return this._imageSrcList;
		};

		Slider.prototype.getCurrentSlide = function (getIndex) {
			return getIndex == true ? this._currentSlide : this._imageSrcList[this._currentSlide];
		};

		Slider.prototype.setCurrentSlide = function (slide) {
			this._currentSlide = slide
		};

		Slider.prototype.getNextSlide = function () {
			(this._currentSlide === this._imageSrcList.length - 1) ? this._currentSlide = 0 : this._currentSlide++;

			this.getCurrentSlide();
		};

		Slider.prototype.getPrevSlide = function () {
			(this._currentSlide === 0) ? this._currentSlide = this._imageSrcList.length - 1 : this._currentSlide--;

			this.getCurrentSlide();
		};

		return new Slider([
			'assets/images/slider/slider1.jpg',
			'assets/images/slider/slider2.jpg',
			'assets/images/slider/slider3.jpg'
		])
	}
})();