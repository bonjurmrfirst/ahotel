angular.module('ahotelApp')
	.service('SliderService', ['PreloadImages', function(PreloadImages) {
		"use strict";

			function Slider(sliderImageList) {
				PreloadImages.call(this, sliderImageList);
				this._currentSlideSrc = 0;
			}

			Slider.prototype = Object.create(PreloadImages.prototype);
			Slider.prototype.constructor = Slider;

			Slider.prototype.getCurrentSlide = function() {
				return this._imageSrcList[this._currentSlideSrc]
			};

			Slider.prototype.getNextSlide = function() {
				(this._currentSlideSrc === this._imageSrcList.length) ? this._currentSlideSrc = 0 : this._currentSlideSrc++

				this.getCurrentSlide();
			};

			Slider.prototype.getPrevSlide = function() {
				(this._currentSlideSrc === 0) ? this._currentSlideSrc = this._imageSrcList.length - 1 : this._currentSlideSrc--

				this.getCurrentSlide();
			};

			return Slider
	}]);