'use strict';

angular.module('ahotelApp', ['ui.router', 'ngAnimate']);
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

	$stateProvider.state('home', {
		url: '/',
		templateUrl: 'app/templates/home/home.html'
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

angular.module('ahotelApp').directive('ahtlSlider', ['sliderService', function (sliderService) {
	"use strict";

	ahtlSliderController.$inject = ["$scope"];
	function ahtlSliderController($scope) {
		$scope.slider = sliderService;
		$scope.slidingDirection = null;

		$scope.nextSlide = function () {
			$scope.slidingDirection = 'left';
			$scope.slider.getNextSlide();
		};

		$scope.prevSlide = function () {
			$scope.slidingDirection = 'right';
			$scope.slider.getPrevSlide();
		};

		$scope.setSlide = function (index) {
			$scope.slidingDirection = index > $scope.slider.getCurrentSlide(true) ? 'left' : 'right';
			$scope.slider.setCurrentSlide(index);
		};
	}

	function link(scope, elem) {
		var arrows = $(elem).find('.slider__arrow');

		arrows.click(function () {
			var _this = this;

			// fixing IE8 png-background bug with 2 bg images
			$(this).css('opacity', '0.5');
			$(this).css('-ms-filter', "progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)");
			$(this).css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)');
			$(this).css('zoom', '1');

			this.disabled = true;

			setTimeout(function () {
				_this.disabled = false;
				$(_this).css('opacity', '1');
				$(_this).css('-ms-filter', "progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)");
				$(_this).css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)');
				$(_this).css('zoom', '1');
			}, 500);
		});
	}

	return {
		restrict: 'EA',
		scope: {},
		controller: ahtlSliderController,
		templateUrl: 'app/templates/header/slider/slider.html',
		link: link
	};
}]);
'use strict';

angular.module('ahotelApp').animation('.slider__img', function () {
	return {
		beforeAddClass: function beforeAddClass(element, className, done) {
			var slidingDirection = element.scope().slidingDirection;
			$(element).css('z-index', '1');

			if (slidingDirection === 'right') {
				$(element).animate({ 'left': '100%' }, 500, done);
			} else {
				$(element).animate({ 'left': '-200%' }, 500, done); //why 200? $)
			}
		},
		addClass: function addClass(element, className, done) {
			var an = new Promise(function (res) {
				"use strict";

				$(element).css('z-index', '0');
				$(element).css('left', '0');
				res();
			});

			an.then(function () {
				done();
			});
		}
	};
});
'use strict';

angular.module('ahotelApp').factory('sliderService', [function () {
	"use strict";

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
		this._currentSlide = slide;
	};

	Slider.prototype.getNextSlide = function () {
		this._currentSlide === this._imageSrcList.length - 1 ? this._currentSlide = 0 : this._currentSlide++;

		this.getCurrentSlide();
	};

	Slider.prototype.getPrevSlide = function () {
		this._currentSlide === 0 ? this._currentSlide = this._imageSrcList.length - 1 : this._currentSlide--;

		this.getCurrentSlide();
	};

	return new Slider(['assets/images/slider/slider1.jpg', 'assets/images/slider/slider2.jpg', 'assets/images/slider/slider3.jpg']);
}]);