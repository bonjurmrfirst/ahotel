(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.service('HeaderTransitionsService', HeaderTransitionsService);

	HeaderTransitionsService.$inject = ['$timeout', '$log'];

	function HeaderTransitionsService($timeout, $log) {
		function UItransitions(container) {
			if (!$(container).length) {
				$log.warn(`Element '${container}' not found`);
				this._container = null;
				return
			}

			this.container = $(container);
		}

		UItransitions.prototype.animateTransition = function (targetElementsQuery,
			{cssEnumerableRule = 'width', from = 0, to = 'auto', delay = 100}) {

			if (this._container === null) {
				return this
			}

			this.container.mouseenter(function () {
				let targetElements = $(this).find(targetElementsQuery),
					targetElementsFinishState;

				if (!targetElements.length) {
					$log.warn(`Element(s) ${targetElementsQuery} not found`);
					return
				}

				targetElements.css(cssEnumerableRule, to);
				targetElementsFinishState = targetElements.css(cssEnumerableRule);
				targetElements.css(cssEnumerableRule, from);

				let animateOptions = {};
				animateOptions[cssEnumerableRule] = targetElementsFinishState;

				targetElements.animate(animateOptions, delay);
				}
			);

			return this;
		};

		UItransitions.prototype.recalculateHeightOnClick = function(elementTriggerQuery, elementOnQuery) {
			if (!$(elementTriggerQuery).length || !$(elementOnQuery).length) {
				$log.warn(`Element(s) ${elementTriggerQuery} ${elementOnQuery} not found`);
				return
			}

			$(elementTriggerQuery).on('click', function() {
				$(elementOnQuery).css('height', 'auto');
			});

			return this;
		};

		function HeaderTransitions(headerQuery, containerQuery) {
			UItransitions.call(this, containerQuery);

			if (!$(headerQuery).length) {
				$log.warn(`Element(s) ${headerQuery} not found`);
				this._header = null;
				return
			}

			this._header = $(headerQuery);
		}

		HeaderTransitions.prototype = Object.create(UItransitions.prototype);
		HeaderTransitions.prototype.constructor = HeaderTransitions;

		HeaderTransitions.prototype.fixHeaderElement = function (elementFixQuery, fixClassName, unfixClassName, options) {
			if (this._header === null) {
				return;
			}

			let self = this;
			let fixElement = $(elementFixQuery);

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

				let width = window.innerWidth || $(window).innerWidth();

				if (width < options.onMaxWindowWidth) {
					fixUnfixMenuOnScroll();
					self._header.addClass(unfixClassName);

					$(window).off('scroll');
					$(window).scroll(function () {
						if (!timer) {
							timer = $timeout(fixUnfixMenuOnScroll, 150);
						}
					});
				} else {
					self._header.removeClass(unfixClassName);
					fixElement.removeClass(fixClassName);
					$(window).off('scroll');
				}
			}

			onWidthChangeHandler();
			$(window).on('resize', onWidthChangeHandler);

			return this
		};

		return HeaderTransitions;
	}
})();