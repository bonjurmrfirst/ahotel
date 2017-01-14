(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.animation('.slider__img', animationFunction);

	function animationFunction() {
		return {
			beforeAddClass: function (element, className, done) {
				let slidingDirection = element.scope().slidingDirection;
				$(element).css('z-index', '1');

				if(slidingDirection === 'right') {
					$(element).animate({'left': '100%'}, 500, done);
				} else {
					$(element).animate({'left': '-200%'}, 500, done); //200? $)
				}
			},

			addClass: function (element, className, done) {
				$(element).css('z-index', '0');
				$(element).css('left', '0');
				done();
			}
		};
	}
})();
