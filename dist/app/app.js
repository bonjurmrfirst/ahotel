'use strict';

angular.module('ahotelApp', ['ui.router']);
'use strict';

angular.module('ahotelApp').factory('PreloadImages', function () {
	"use strict";

	function PreloadImages(imageList) {
		this._imageSrcList = imageList;

		function preLoad(imageList) {

			var promises = [];

			function loadImage(src) {
				return new Promise(function (resolve, reject) {
					var image = new Image();
					image.src = src;
					image.onload = function () {
						console.log("loaded image: " + src);
						resolve(image);
					};
					image.onerror = function (e) {
						reject(e);
					};
				});
			}

			for (var i = 0; i < imageList.length; i++) {
				promises.push(loadImage(imageList[i]));
			}

			return Promise.all(promises).then(function (results) {
				console.log('promises array all resolved');
				console.dir(results);
				return results;
			});
		}

		preLoad(this._imageSrcList);
	}

	return PreloadImages;
});

/*
//hmm... Ang1.3.x+
angular.module('ahotelApp')
	.factory('PreloadImages', ['$q', function() {
		"use strict";

		function PreloadImages(imageList) {
			this._imageSrcList = imageList;

			function preLoad(imageList) {

				var promises = [];

				function loadImage(src) {
					return $q(function (resolve, reject) {
						var image = new Image();
						image.src = src;
						image.onload = function () {
							console.log("loaded image: " + src);
							resolve(image);
						};
						image.onerror = function (e) {
							reject(e);
						};
					})
				}

				for (let i = 0; i < imageList.length; i++) {
					promises.push(loadImage(imageList[i]));
				}

				return $q(promises).then(function (results) {
					console.log('promises array all resolved');
					console.dir(results);
					return results;
				});
			}

			preLoad(this._imageSrcList);
		}

		return PreloadImages
	}]);*/
'use strict';

angular.module('ahotelApp').config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
	'use strict';

	$urlRouterProvider.otherwise('/');

	$stateProvider.state('template', {
		url: '/template',
		templateUrl: 'templates/template.html'
	});
}]);
'use strict';

angular.module('ahotelApp').directive('ahtlHeader', function () {
	"use strict";

	return {
		restrict: "EAC",
		templateUrl: 'app/templates/header/header.html'
	};
});
'use strict';

angular.module('ahotelApp').service('HeaderTransitionsService', ['$timeout', function ($timeout) {
	"use strict";

	function UItransitions(containerQuery) {
		//todo errors
		this.container = $(containerQuery);
	}

	UItransitions.prototype.elementTransition = function (targetElementsQuery, _ref) {
		var _ref$cssEnumerableRul = _ref.cssEnumerableRule,
		    cssEnumerableRule = _ref$cssEnumerableRul === undefined ? 'width' : _ref$cssEnumerableRul,
		    _ref$from = _ref.from,
		    from = _ref$from === undefined ? 0 : _ref$from,
		    _ref$to = _ref.to,
		    to = _ref$to === undefined ? 'auto' : _ref$to,
		    _ref$delay = _ref.delay,
		    delay = _ref$delay === undefined ? 100 : _ref$delay;

		//todo errors
		this.container.mouseenter(function () {
			var targetElements = $(this).find(targetElementsQuery),
			    targetElementsFinishState;

			targetElements.css(cssEnumerableRule, to);
			targetElementsFinishState = targetElements.css(cssEnumerableRule);
			targetElements.css(cssEnumerableRule, from);

			var animateOptions = {};
			animateOptions[cssEnumerableRule] = targetElementsFinishState;

			targetElements.animate(animateOptions, delay);
		});
	};

	function HeaderTransitions(headerQuery, containerQuery) {
		this.header = $(headerQuery);
		UItransitions.call(this, containerQuery);
	}

	HeaderTransitions.prototype = Object.create(UItransitions.prototype);
	HeaderTransitions.prototype.constructor = HeaderTransitions;

	HeaderTransitions.prototype.fixHeaderElement = function (_fixElement, fixClassName, unfixClassName, options) {
		var self = this;
		var fixElement = $(_fixElement);

		function onWidthChangeHandler() {
			var timer = void 0;

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

				$(window).off("scroll");
				$(window).scroll(function () {
					if (!timer) {
						timer = $timeout(fixUnfixMenuOnScroll, 150);
					}
				});
			} else {
				self.header.removeClass(unfixClassName);
				fixElement.removeClass(fixClassName);
				$(window).off("scroll");
			}
		}

		onWidthChangeHandler();
		$(window).on('resize', onWidthChangeHandler);
	};

	return HeaderTransitions;
}]);
'use strict';

angular.module('ahotelApp').directive('ahtlStikyHeader', ['HeaderTransitionsService', function (HeaderTransitionsService) {
	"use strict";

	function link() {
		var header = new HeaderTransitionsService('.l-header', '.nav__item-container');

		header.elementTransition('.sub-nav', {
			cssEnumerableRule: 'height',
			delay: 300
		});

		header.fixHeaderElement('.nav', 'js_nav--fixed', 'js_l-header--relative', {
			onMinScrolltop: 88,
			onMaxWindowWidth: 850
		});
	}

	return {
		restrict: "A",
		scope: {},
		link: link
	};
}]);
'use strict';

angular.module('ahotelApp').directive('ahtlSlider', ['SliderService', function (SliderService) {
	"use strict";

	function ahtlSliderController() {
		var imageList = ['assets/images/slider/slider1.jpg', 'assets/images/slider/slider2.jpg', 'assets/images/slider/slider3.jpg'];

		this.slider = new SliderService(imageList);
	}

	return {
		restrict: 'EA',
		scope: {},
		controller: ahtlSliderController,
		controllerAs: 'slider',
		templateUrl: 'app/templates/header/slider/slider.html'
	};
}]);
'use strict';

angular.module('ahotelApp').service('SliderService', ['PreloadImages', function (PreloadImages) {
			"use strict";

			function Slider(sliderImageList) {
						PreloadImages.call(this, sliderImageList);
						this._currentSlideSrc = 0;
			}

			Slider.prototype = Object.create(PreloadImages.prototype);
			Slider.prototype.constructor = Slider;

			Slider.prototype.getCurrentSlide = function () {
						return this._imageSrcList[this._currentSlideSrc];
			};

			Slider.prototype.getNextSlide = function () {
						this._currentSlideSrc === this._imageSrcList.length ? this._currentSlideSrc = 0 : this._currentSlideSrc++;

						this.getCurrentSlide();
			};

			Slider.prototype.getPrevSlide = function () {
						this._currentSlideSrc === 0 ? this._currentSlideSrc = this._imageSrcList.length - 1 : this._currentSlideSrc--;

						this.getCurrentSlide();
			};

			return Slider;
}]);