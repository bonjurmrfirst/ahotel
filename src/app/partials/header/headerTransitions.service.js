(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.service('HeaderTransitionsService', HeaderTransitionsService);

	HeaderTransitionsService.$inject = ['$timeout'];

	function HeaderTransitionsService($timeout) {
		function UItransitions(containerQuery) {
			//todo errors
			this.container = $(containerQuery);
		}

		UItransitions.prototype.elementTransition = function (targetElementsQuery,
			{cssEnumerableRule = 'width', from = 0, to = 'auto', delay = 100}) {
			//todo errors
			this.container.mouseenter(
				function () {
					var targetElements = $(this).find(targetElementsQuery),
						targetElementsFinishState;

					targetElements.css(cssEnumerableRule, to);
					targetElementsFinishState = targetElements.css(cssEnumerableRule);
					targetElements.css(cssEnumerableRule, from);

					let animateOptions = {};
					animateOptions[cssEnumerableRule] = targetElementsFinishState;

					targetElements.animate(animateOptions, delay);
				}
			);
		};

		function HeaderTransitions(headerQuery, containerQuery) {
			this.header = $(headerQuery);
			UItransitions.call(this, containerQuery);
		}

		HeaderTransitions.prototype = Object.create(UItransitions.prototype);
		HeaderTransitions.prototype.constructor = HeaderTransitions;

		HeaderTransitions.prototype.fixHeaderElement = function (_fixElement, fixClassName, unfixClassName, options) {
			let self = this;
			let fixElement = $(_fixElement);

			function onWidthChangeHandler() {
				let timer;

				function fixUnfixMenuOnScroll() {
					if ($(window).scrollTop() > options.onMinScrolltop) {
						fixElement.addClass(fixClassName);
					} else {
						fixElement.removeClass(fixClassName);
					}

					timer = null;
				}

				if ($(window).width() < options.onMaxWindowWidth) {
					fixUnfixMenuOnScroll();
					self.header.addClass(unfixClassName);

					$(window).off('scroll');
					$(window).scroll(function () {
						if (!timer) {
							timer = $timeout(fixUnfixMenuOnScroll, 150);
						}
					});
				} else {
					self.header.removeClass(unfixClassName);
					fixElement.removeClass(fixClassName);
					$(window).off('scroll');
				}
			}

			onWidthChangeHandler();
			$(window).on('resize', onWidthChangeHandler);
		};

		return HeaderTransitions;
	}
})();