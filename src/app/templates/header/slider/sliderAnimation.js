angular.module('ahotelApp')

	.animation('.slider__img', function () {
		return {
			beforeAddClass: function (element, className, done) {
				let slidingDirection = element.scope().slidingDirection;
				$(element).css('z-index', '1');

				if(slidingDirection === 'right') {
					$(element).animate({'left': '100%'}, 500, done);
				} else {
					$(element).animate({'left': '-200%'}, 500, done); //why 200? $)
				}
			},
			addClass: function (element, className, done) {
				let an = new Promise(function (res) {
					"use strict";
					$(element).css('z-index', '0');
					$(element).css('left', '0');
					res();
				});

				an.then(function () {
					done();
				});
			}
		}
	});

