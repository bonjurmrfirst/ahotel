'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp', ['ui.router', 'ngAnimate']);
})();
'use strict';

(function () {
    angular.module('ahotelApp').constant('hotelDetailsConstant', ["restourant", "kids", "pool", "spa", "wifi", "pet", "disable", "beach", "parking", "conditioning", "lounge", "terrace", "garden", "gym", "bicycles"]);
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').factory('PreloadImages', PreloadImages);

	function PreloadImages() {
		this._imageSrcList = imageList;

		function preLoad(imageList) {

			var promises = [];

			function loadImage(src) {
				return new Promise(function (resolve, reject) {
					var image = new Image();
					image.src = src;
					image.onload = function () {
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
				return results;
			});
		}

		preLoad(this._imageSrcList);

		return preLoad;
	}
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').config(config);

	config.$inject = ['$stateProvider', '$urlRouterProvider'];

	function config($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');

		$stateProvider.state('home', {
			url: '/',
			templateUrl: 'app/templates/home/home.html'
		}).state('bungalows', {
			url: '/bungalows',
			templateUrl: 'app/templates/resorts/bungalows.html'
		});
	}
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').directive('ahtlHeader', ahtlHeader);

	function ahtlHeader() {
		return {
			restrict: 'EAC',
			templateUrl: 'app/templates/header/header.html'
		};
	}
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').service('HeaderTransitionsService', HeaderTransitionsService);

	HeaderTransitionsService.$inject = ['$timeout'];

	function HeaderTransitionsService($timeout) {
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
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').directive('ahtlStikyHeader', ahtlStikyHeader);

	ahtlStikyHeader.$inject = ['HeaderTransitionsService'];

	function ahtlStikyHeader(HeaderTransitionsService) {
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
			restrict: 'A',
			transclude: false,
			scope: {},
			link: link
		};
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').directive('ahtlTop3', ahtlTop3Directive);

    ahtlTop3Directive.$inject = ['top3Service', 'hotelDetailsConstant'];

    function ahtlTop3Directive(top3Service, hotelDetailsConstant) {

        ahtlTop3Controller.$inject = ["$scope", "$element", "$attrs"];
        return {
            restrict: 'A',
            controller: ahtlTop3Controller,
            controllerAs: 'top3'
        };

        function ahtlTop3Controller($scope, $element, $attrs) {
            var _this = this;

            this.details = hotelDetailsConstant;
            this.resortType = $attrs.ahtlTop3;
            this.resort = null;

            this.getImgSrc = function (index) {
                return 'assets/images/' + this.resortType + '/' + this.resort[index].img.filename;
            };

            this.isResortIncludeDetail = function (item, detail) {
                var detailClassName = 'top3__detail-container--' + detail,
                    isResortIncludeDetailClassName = !item.details[detail] ? ' top3__detail-container--has' : '';

                return detailClassName + isResortIncludeDetailClassName;
            };

            top3Service.getTop3Places(this.resortType).then(function (response) {
                _this.resort = response.data;
                console.log(_this.resort);
            });
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').factory('top3Service', top3Service);

    top3Service.$inject = ['$http'];

    function top3Service($http) {
        return {
            getTop3Places: getTop3Places
        };

        function getTop3Places(type) {
            return $http({
                method: 'GET',
                url: '/api/top3',
                params: {
                    action: 'get',
                    type: type
                }
            }).then(onResolve, onReject);
        }

        function onResolve(response) {
            return response;
        }

        function onReject(response) {
            return response;
        }
    }
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').animation('.slider__img', animationFunction);

	function animationFunction() {
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
				$(element).css('z-index', '0');
				$(element).css('left', '0');
				done();
			}
		};
	}
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').directive('ahtlSlider', ahtlSlider);

	ahtlSlider.$inject = ['sliderService', '$timeout'];

	function ahtlSlider(sliderService, $timeout) {
		ahtlSliderController.$inject = ["$scope"];
		function ahtlSliderController($scope) {
			$scope.slider = sliderService;
			$scope.slidingDirection = null;

			$scope.nextSlide = nextSlide;
			$scope.prevSlide = prevSlide;
			$scope.setSlide = setSlide;

			function nextSlide() {
				$scope.slidingDirection = 'left';
				$scope.slider.setNextSlide();
			}

			function prevSlide() {
				$scope.slidingDirection = 'right';
				$scope.slider.setPrevSlide();
			}

			function setSlide(index) {
				$scope.slidingDirection = index > $scope.slider.getCurrentSlide(true) ? 'left' : 'right';
				$scope.slider.setCurrentSlide(index);
			}
		}

		function fixIE8pngBlackBg(element) {
			$(element).css('-ms-filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)').css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)').css('zoom', '1');
		}

		function link(scope, elem) {
			var arrows = $(elem).find('.slider__arrow');

			arrows.click(function () {
				var _this = this;

				$(this).css('opacity', '0.5');
				fixIE8pngBlackBg(this);

				this.disabled = true;

				$timeout(function () {
					_this.disabled = false;
					$(_this).css('opacity', '1');
					fixIE8pngBlackBg($(_this));
				}, 500);
			});
		}

		return {
			restrict: 'EA',
			transclude: false,
			scope: {},
			controller: ahtlSliderController,
			templateUrl: 'app/templates/header/slider/slider.html',
			link: link
		};
	}
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').factory('sliderService', sliderService);

	sliderService.$inject = ['sliderImgPathConstant'];

	function sliderService(sliderImgPathConstant) {
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
			slide = parseInt(slide);

			if (!slide || isNaN(slide) || slide < 0 || slide > this._imageSrcList.length - 1) {
				return;
			}

			this._currentSlide = slide;
		};

		Slider.prototype.setNextSlide = function () {
			this._currentSlide === this._imageSrcList.length - 1 ? this._currentSlide = 0 : this._currentSlide++;

			this.getCurrentSlide();
		};

		Slider.prototype.setPrevSlide = function () {
			this._currentSlide === 0 ? this._currentSlide = this._imageSrcList.length - 1 : this._currentSlide--;

			this.getCurrentSlide();
		};

		return new Slider(sliderImgPathConstant);
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').constant('sliderImgPathConstant', ['assets/images/slider/slider1.jpg', 'assets/images/slider/slider2.jpg', 'assets/images/slider/slider3.jpg']);
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImhvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsInByZWxvYWRJbWcuc2VydmljZS5qcyIsInJvdXRlcy5qcyIsInRlbXBsYXRlcy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvaGVhZGVyVHJhbnNpdGlvbnMuc2VydmljZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvc3Rpa3lIZWFkZXIuZGlyZWN0aXZlLmpzIiwidGVtcGxhdGVzL3Jlc29ydHMvdG9wMy5kaXJlY3RpdmUuanMiLCJ0ZW1wbGF0ZXMvcmVzb3J0cy90b3AzLnNlcnZpY2UuanMiLCJ0ZW1wbGF0ZXMvaGVhZGVyL3NsaWRlci9zbGlkZXIuYW5pbWF0aW9uLmpzIiwidGVtcGxhdGVzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmRpcmVjdGl2ZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvc2xpZGVyL3NsaWRlci5zZXJ2aWNlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9zbGlkZXIvc2xpZGVyUGF0aC5jb25zdGFudC5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uc3RhbnQiLCJmYWN0b3J5IiwiUHJlbG9hZEltYWdlcyIsIl9pbWFnZVNyY0xpc3QiLCJpbWFnZUxpc3QiLCJwcmVMb2FkIiwicHJvbWlzZXMiLCJsb2FkSW1hZ2UiLCJzcmMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImltYWdlIiwiSW1hZ2UiLCJvbmxvYWQiLCJvbmVycm9yIiwiZSIsImkiLCJsZW5ndGgiLCJwdXNoIiwiYWxsIiwidGhlbiIsInJlc3VsdHMiLCJjb25maWciLCIkaW5qZWN0IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCJvdGhlcndpc2UiLCJzdGF0ZSIsInVybCIsInRlbXBsYXRlVXJsIiwiZGlyZWN0aXZlIiwiYWh0bEhlYWRlciIsInJlc3RyaWN0Iiwic2VydmljZSIsIkhlYWRlclRyYW5zaXRpb25zU2VydmljZSIsIiR0aW1lb3V0IiwiVUl0cmFuc2l0aW9ucyIsImNvbnRhaW5lclF1ZXJ5IiwiY29udGFpbmVyIiwiJCIsInByb3RvdHlwZSIsImVsZW1lbnRUcmFuc2l0aW9uIiwidGFyZ2V0RWxlbWVudHNRdWVyeSIsImNzc0VudW1lcmFibGVSdWxlIiwiZnJvbSIsInRvIiwiZGVsYXkiLCJtb3VzZWVudGVyIiwidGFyZ2V0RWxlbWVudHMiLCJmaW5kIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImNzcyIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJoZWFkZXIiLCJjYWxsIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiX2ZpeEVsZW1lbnQiLCJmaXhDbGFzc05hbWUiLCJ1bmZpeENsYXNzTmFtZSIsIm9wdGlvbnMiLCJzZWxmIiwiZml4RWxlbWVudCIsIm9uV2lkdGhDaGFuZ2VIYW5kbGVyIiwidGltZXIiLCJmaXhVbmZpeE1lbnVPblNjcm9sbCIsIndpbmRvdyIsInNjcm9sbFRvcCIsIm9uTWluU2Nyb2xsdG9wIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsIndpZHRoIiwib25NYXhXaW5kb3dXaWR0aCIsIm9mZiIsInNjcm9sbCIsIm9uIiwiYWh0bFN0aWt5SGVhZGVyIiwibGluayIsInRyYW5zY2x1ZGUiLCJzY29wZSIsImFodGxUb3AzRGlyZWN0aXZlIiwidG9wM1NlcnZpY2UiLCJob3RlbERldGFpbHNDb25zdGFudCIsImNvbnRyb2xsZXIiLCJhaHRsVG9wM0NvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCIkc2NvcGUiLCIkZWxlbWVudCIsIiRhdHRycyIsImRldGFpbHMiLCJyZXNvcnRUeXBlIiwiYWh0bFRvcDMiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJpbmRleCIsImltZyIsImZpbGVuYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsIiwiaXRlbSIsImRldGFpbCIsImRldGFpbENsYXNzTmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSIsImdldFRvcDNQbGFjZXMiLCJyZXNwb25zZSIsImRhdGEiLCJjb25zb2xlIiwibG9nIiwiJGh0dHAiLCJ0eXBlIiwibWV0aG9kIiwicGFyYW1zIiwiYWN0aW9uIiwib25SZXNvbHZlIiwib25SZWplY3QiLCJhbmltYXRpb24iLCJhbmltYXRpb25GdW5jdGlvbiIsImJlZm9yZUFkZENsYXNzIiwiZWxlbWVudCIsImNsYXNzTmFtZSIsImRvbmUiLCJzbGlkaW5nRGlyZWN0aW9uIiwiYWh0bFNsaWRlciIsInNsaWRlclNlcnZpY2UiLCJhaHRsU2xpZGVyQ29udHJvbGxlciIsInNsaWRlciIsIm5leHRTbGlkZSIsInByZXZTbGlkZSIsInNldFNsaWRlIiwic2V0TmV4dFNsaWRlIiwic2V0UHJldlNsaWRlIiwiZ2V0Q3VycmVudFNsaWRlIiwic2V0Q3VycmVudFNsaWRlIiwiZml4SUU4cG5nQmxhY2tCZyIsImVsZW0iLCJhcnJvd3MiLCJjbGljayIsImRpc2FibGVkIiwic2xpZGVySW1nUGF0aENvbnN0YW50IiwiU2xpZGVyIiwic2xpZGVySW1hZ2VMaXN0IiwiX2N1cnJlbnRTbGlkZSIsImdldEltYWdlU3JjTGlzdCIsImdldEluZGV4Iiwic2xpZGUiLCJwYXJzZUludCIsImlzTmFOIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUEsUUFDS0MsT0FBTyxhQUFhLENBQUMsYUFBYTtLQUozQztBQ0FBOztBQUFBLENBQUMsWUFBWTtJQUNURCxRQUNLQyxPQUFPLGFBQ1BDLFNBQVMsd0JBQXdCLENBQzlCLGNBQ0EsUUFDQSxRQUNBLE9BQ0EsUUFDQSxPQUNBLFdBQ0EsU0FDQSxXQUNBLGdCQUNBLFVBQ0EsV0FDQSxVQUNBLE9BQ0E7S0FsQlo7QUNBQTs7QUFBQSxDQUFDLFlBQVc7Q0FDWDs7Q0FFQUYsUUFDRUMsT0FBTyxhQUNQRSxRQUFRLGlCQUFnQkM7O0NBRTFCLFNBQVNBLGdCQUFnQjtF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Ozs7RUFHdEJMLE9BQU92RyxVQUFVNkYsZUFBZSxZQUFZO0dBQzFDLEtBQUtZLGtCQUFrQixLQUFLL0ksY0FBY2UsU0FBUyxJQUFLLEtBQUtnSSxnQkFBZ0IsSUFBSSxLQUFLQTs7R0FFdkYsS0FBS1Y7OztFQUdOUSxPQUFPdkcsVUFBVThGLGVBQWUsWUFBWTtHQUMxQyxLQUFLVyxrQkFBa0IsSUFBSyxLQUFLQSxnQkFBZ0IsS0FBSy9JLGNBQWNlLFNBQVMsSUFBSSxLQUFLZ0k7O0dBRXZGLEtBQUtWOzs7RUFHTixPQUFPLElBQUlRLE9BQU9EOztLQTdDcEI7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQWpKLFFBQ0tDLE9BQU8sYUFDUEMsU0FBUyx5QkFBeUIsQ0FDL0Isb0NBQ0Esb0NBQ0E7S0FSWiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcsIFsndWkucm91dGVyJywgJ25nQW5pbWF0ZSddKTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdob3RlbERldGFpbHNDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgXCJyZXN0b3VyYW50XCIsXHJcbiAgICAgICAgICAgIFwia2lkc1wiLFxyXG4gICAgICAgICAgICBcInBvb2xcIixcclxuICAgICAgICAgICAgXCJzcGFcIixcclxuICAgICAgICAgICAgXCJ3aWZpXCIsXHJcbiAgICAgICAgICAgIFwicGV0XCIsXHJcbiAgICAgICAgICAgIFwiZGlzYWJsZVwiLFxyXG4gICAgICAgICAgICBcImJlYWNoXCIsXHJcbiAgICAgICAgICAgIFwicGFya2luZ1wiLFxyXG4gICAgICAgICAgICBcImNvbmRpdGlvbmluZ1wiLFxyXG4gICAgICAgICAgICBcImxvdW5nZVwiLFxyXG4gICAgICAgICAgICBcInRlcnJhY2VcIixcclxuICAgICAgICAgICAgXCJnYXJkZW5cIixcclxuICAgICAgICAgICAgXCJneW1cIixcclxuICAgICAgICAgICAgXCJiaWN5Y2xlc1wiXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdQcmVsb2FkSW1hZ2VzJyxQcmVsb2FkSW1hZ2VzKTtcclxuXHJcblx0ZnVuY3Rpb24gUHJlbG9hZEltYWdlcygpIHtcclxuXHRcdHRoaXMuX2ltYWdlU3JjTGlzdCA9IGltYWdlTGlzdDtcclxuXHJcblx0XHRmdW5jdGlvbiBwcmVMb2FkKGltYWdlTGlzdCkge1xyXG5cclxuXHRcdFx0dmFyIHByb21pc2VzID0gW107XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBsb2FkSW1hZ2Uoc3JjKSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0XHRcdHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5cdFx0XHRcdFx0aW1hZ2Uuc3JjID0gc3JjO1xyXG5cdFx0XHRcdFx0aW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKGltYWdlKTtcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHRcdFx0cmVqZWN0KGUpO1xyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRwcm9taXNlcy5wdXNoKGxvYWRJbWFnZShpbWFnZUxpc3RbaV0pKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3VsdHM7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByZUxvYWQodGhpcy5faW1hZ2VTcmNMaXN0KTtcclxuXHJcblx0XHRyZXR1cm4gcHJlTG9hZDtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9ob21lL2hvbWUuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL3Jlc29ydHMvYnVuZ2Fsb3dzLmh0bWwnXHJcblx0XHRcdH0pO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsYWh0bEhlYWRlcilcclxuXHJcblx0ZnVuY3Rpb24gYWh0bEhlYWRlcigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUFDJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL2hlYWRlci9oZWFkZXIuaHRtbCdcclxuXHRcdH07XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuc2VydmljZSgnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJyxIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpXHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJHRpbWVvdXQpIHtcclxuXHRcdGZ1bmN0aW9uIFVJdHJhbnNpdGlvbnMoY29udGFpbmVyUXVlcnkpIHtcclxuXHRcdFx0Ly90b2RvIGVycm9yc1xyXG5cdFx0XHR0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyUXVlcnkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmVsZW1lbnRUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblx0XHRcdC8vdG9kbyBlcnJvcnNcclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihcclxuXHRcdFx0XHRmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHR2YXIgdGFyZ2V0RWxlbWVudHMgPSAkKHRoaXMpLmZpbmQodGFyZ2V0RWxlbWVudHNRdWVyeSksXHJcblx0XHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCB0byk7XHJcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSwgZnJvbSk7XHJcblxyXG5cdFx0XHRcdFx0bGV0IGFuaW1hdGVPcHRpb25zID0ge307XHJcblx0XHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzLmFuaW1hdGUoYW5pbWF0ZU9wdGlvbnMsIGRlbGF5KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zKGhlYWRlclF1ZXJ5LCBjb250YWluZXJRdWVyeSkge1xyXG5cdFx0XHR0aGlzLmhlYWRlciA9ICQoaGVhZGVyUXVlcnkpO1xyXG5cdFx0XHRVSXRyYW5zaXRpb25zLmNhbGwodGhpcywgY29udGFpbmVyUXVlcnkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVUl0cmFuc2l0aW9ucy5wcm90b3R5cGUpO1xyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpeEhlYWRlckVsZW1lbnQgPSBmdW5jdGlvbiAoX2ZpeEVsZW1lbnQsIGZpeENsYXNzTmFtZSwgdW5maXhDbGFzc05hbWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgZml4RWxlbWVudCA9ICQoX2ZpeEVsZW1lbnQpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLmhlYWRlci5hZGRDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblxyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLm9mZignc2Nyb2xsJyk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCF0aW1lcikge1xyXG5cdFx0XHRcdFx0XHRcdHRpbWVyID0gJHRpbWVvdXQoZml4VW5maXhNZW51T25TY3JvbGwsIDE1MCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRzZWxmLmhlYWRlci5yZW1vdmVDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCk7XHJcblx0XHRcdCQod2luZG93KS5vbigncmVzaXplJywgb25XaWR0aENoYW5nZUhhbmRsZXIpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcilcclxuXHJcblx0YWh0bFN0aWt5SGVhZGVyLiRpbmplY3QgPSBbJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZSddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU3Rpa3lIZWFkZXIoSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcblx0XHRmdW5jdGlvbiBsaW5rKCkge1xyXG5cdFx0XHRsZXQgaGVhZGVyID0gbmV3IEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgnLmwtaGVhZGVyJywgJy5uYXZfX2l0ZW0tY29udGFpbmVyJyk7XHJcblxyXG5cdFx0XHRoZWFkZXIuZWxlbWVudFRyYW5zaXRpb24oXHJcblx0XHRcdFx0Jy5zdWItbmF2Jywge1xyXG5cdFx0XHRcdFx0Y3NzRW51bWVyYWJsZVJ1bGU6ICdoZWlnaHQnLFxyXG5cdFx0XHRcdFx0ZGVsYXk6IDMwMFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdGhlYWRlci5maXhIZWFkZXJFbGVtZW50KFxyXG5cdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHQnanNfbmF2LS1maXhlZCcsXHJcblx0XHRcdFx0J2pzX2wtaGVhZGVyLS1yZWxhdGl2ZScsIHtcclxuXHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdG9uTWF4V2luZG93V2lkdGg6IDg1MFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0EnLFxyXG5cdFx0XHR0cmFuc2NsdWRlOiBmYWxzZSxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFRvcDMnLCBhaHRsVG9wM0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFRvcDNEaXJlY3RpdmUuJGluamVjdCA9IFsndG9wM1NlcnZpY2UnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsVG9wM0RpcmVjdGl2ZSh0b3AzU2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogYWh0bFRvcDNDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd0b3AzJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQ7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0VHlwZSA9ICRhdHRycy5haHRsVG9wMztcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRJbWdTcmMgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvaW1hZ2VzLycgKyB0aGlzLnJlc29ydFR5cGUgKyAnLycgKyB0aGlzLnJlc29ydFtpbmRleF0uaW1nLmZpbGVuYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzUmVzb3J0SW5jbHVkZURldGFpbCA9IGZ1bmN0aW9uKGl0ZW0sIGRldGFpbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGFpbENsYXNzTmFtZSA9ICd0b3AzX19kZXRhaWwtY29udGFpbmVyLS0nICsgZGV0YWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSA9ICFpdGVtLmRldGFpbHNbZGV0YWlsXSA/ICcgdG9wM19fZGV0YWlsLWNvbnRhaW5lci0taGFzJyA6ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXRhaWxDbGFzc05hbWUgKyBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRvcDNTZXJ2aWNlLmdldFRvcDNQbGFjZXModGhpcy5yZXNvcnRUeXBlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucmVzb3J0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgndG9wM1NlcnZpY2UnLCB0b3AzU2VydmljZSk7XHJcblxyXG4gICAgdG9wM1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnXTtcclxuXHJcbiAgICBmdW5jdGlvbiB0b3AzU2VydmljZSgkaHR0cCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvcDNQbGFjZXM6IGdldFRvcDNQbGFjZXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUb3AzUGxhY2VzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL3RvcDMnLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmFuaW1hdGlvbignLnNsaWRlcl9faW1nJyxhbmltYXRpb25GdW5jdGlvbilcclxuXHJcblx0ZnVuY3Rpb24gYW5pbWF0aW9uRnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRiZWZvcmVBZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZSkge1xyXG5cdFx0XHRcdGxldCBzbGlkaW5nRGlyZWN0aW9uID0gZWxlbWVudC5zY29wZSgpLnNsaWRpbmdEaXJlY3Rpb247XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMScpO1xyXG5cclxuXHRcdFx0XHRpZihzbGlkaW5nRGlyZWN0aW9uID09PSAncmlnaHQnKSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJzEwMCUnfSwgNTAwLCBkb25lKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICctMjAwJSd9LCA1MDAsIGRvbmUpOyAvL3doeSAyMDA/ICQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJyxhaHRsU2xpZGVyKTtcclxuXHJcblx0YWh0bFNsaWRlci4kaW5qZWN0ID0gWydzbGlkZXJTZXJ2aWNlJywgJyR0aW1lb3V0J107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTbGlkZXIoc2xpZGVyU2VydmljZSwgJHRpbWVvdXQpIHtcclxuXHRcdGZ1bmN0aW9uIGFodGxTbGlkZXJDb250cm9sbGVyKCRzY29wZSkge1xyXG5cdFx0XHQkc2NvcGUuc2xpZGVyID0gc2xpZGVyU2VydmljZTtcclxuXHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHRcdFx0JHNjb3BlLm5leHRTbGlkZSA9IG5leHRTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnByZXZTbGlkZSA9IHByZXZTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnNldFNsaWRlID0gc2V0U2xpZGU7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBuZXh0U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAnbGVmdCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXROZXh0U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcHJldlNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldFByZXZTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzZXRTbGlkZShpbmRleCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gaW5kZXggPiAkc2NvcGUuc2xpZGVyLmdldEN1cnJlbnRTbGlkZSh0cnVlKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRDdXJyZW50U2xpZGUoaW5kZXgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZml4SUU4cG5nQmxhY2tCZyhlbGVtZW50KSB7XHJcblx0XHRcdCQoZWxlbWVudClcclxuXHRcdFx0XHQuY3NzKCctbXMtZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCdmaWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ3pvb20nLCAnMScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0pIHtcclxuXHRcdFx0bGV0IGFycm93cyA9ICQoZWxlbSkuZmluZCgnLnNsaWRlcl9fYXJyb3cnKTtcclxuXHJcblx0XHRcdGFycm93cy5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMC41Jyk7XHJcblx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZyh0aGlzKTtcclxuXHJcblx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdCR0aW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzEnKTtcclxuXHRcdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcoJCh0aGlzKSk7XHJcblx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHRyYW5zY2x1ZGU6IGZhbHNlLFxyXG5cdFx0XHRzY29wZToge30sXHJcblx0XHRcdGNvbnRyb2xsZXI6IGFodGxTbGlkZXJDb250cm9sbGVyLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdzbGlkZXJTZXJ2aWNlJyxzbGlkZXJTZXJ2aWNlKTtcclxuXHJcblx0c2xpZGVyU2VydmljZS4kaW5qZWN0ID0gWydzbGlkZXJJbWdQYXRoQ29uc3RhbnQnXTtcclxuXHJcblx0ZnVuY3Rpb24gc2xpZGVyU2VydmljZShzbGlkZXJJbWdQYXRoQ29uc3RhbnQpIHtcclxuXHRcdGZ1bmN0aW9uIFNsaWRlcihzbGlkZXJJbWFnZUxpc3QpIHtcclxuXHRcdFx0dGhpcy5faW1hZ2VTcmNMaXN0ID0gc2xpZGVySW1hZ2VMaXN0O1xyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0SW1hZ2VTcmNMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW1hZ2VTcmNMaXN0O1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChnZXRJbmRleCkge1xyXG5cdFx0XHRyZXR1cm4gZ2V0SW5kZXggPT0gdHJ1ZSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA6IHRoaXMuX2ltYWdlU3JjTGlzdFt0aGlzLl9jdXJyZW50U2xpZGVdO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xyXG5cdFx0XHRzbGlkZSA9IHBhcnNlSW50KHNsaWRlKTtcclxuXHJcblx0XHRcdGlmICghc2xpZGUgfHwgaXNOYU4oc2xpZGUpIHx8IHNsaWRlIDwgMCB8fCBzbGlkZSA+IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSBzbGlkZTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXROZXh0U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxKSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA9IDAgOiB0aGlzLl9jdXJyZW50U2xpZGUrKztcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0UHJldlNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSAwKSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA9IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxIDogdGhpcy5fY3VycmVudFNsaWRlLS07XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IFNsaWRlcihzbGlkZXJJbWdQYXRoQ29uc3RhbnQpO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdzbGlkZXJJbWdQYXRoQ29uc3RhbnQnLCBbXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIxLmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIyLmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIzLmpwZydcclxuICAgICAgICBdKTtcclxufSkoKTsiXX0=
