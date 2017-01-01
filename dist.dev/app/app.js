'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp', ['ui.router', 'ngAnimate']);
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
		}).state('auth', {
			url: '/auth',
			templateUrl: 'app/templates/auth/auth.html',
			params: { 'type': 'login' } /*,
                               onEnter: function ($rootScope) {
                               $rootScope.$state = "auth";
                               }*/
		}).state('bungalows', {
			url: '/bungalows',
			templateUrl: 'app/templates/resorts/bungalows.html'
		}).state('hotels', {
			url: '/hotels',
			templateUrl: 'app/templates/resorts/hotels.html'
		}).state('villas', {
			url: '/villas',
			templateUrl: 'app/templates/resorts/villas.html'
		});
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').run(["$rootScope", function ($rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams /*, fromState, fromParams todo*/) {
            $rootScope.$currentStateName = toState.name;
            $rootScope.$currentStateParams = toParams;
        });
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').constant('backendPathsConstant', {
        top3: '/api/top3',
        auth: '/api/users'
    });
})();
'use strict';

(function () {
    angular.module('ahotelApp').constant('hotelDetailsConstant', ["restaurant", "kids", "pool", "spa", "wifi", "pet", "disable", "beach", "parking", "conditioning", "lounge", "terrace", "garden", "gym", "bicycles"]);
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

    angular.module('ahotelApp').controller('AuthController', AuthController);

    AuthController.$inject = ['$scope', 'authService', '$state'];

    function AuthController($scope, authService, $state) {
        this.validationStatus = {
            userAlreadyExists: false
        };

        this.createUser = function () {
            var _this = this;

            authService.createUser(this.newUser).then(function (response) {
                if (response === 'OK') {
                    console.log(response);
                    $state.go('auth', { 'type': 'login' });
                } else {
                    alert();
                    _this.validationStatus.userAlreadyExists = true;
                    console.log(response);
                }
            });
            /*console.log($scope.formJoin);
            console.log(this.newUser);*/
        };

        this.loginUser = function () {
            console.log(this.user);
        };
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').factory('authService', authService);

    authService.$inject = ['$http', 'backendPathsConstant', '$state'];

    function authService($http, backendPathsConstant) {
        //todo errors
        function User(backendApi) {
            this._backendApi = backendApi;
        }

        User.prototype.createUser = function (credentials) {
            return $http({
                method: 'POST',
                url: this._backendApi,
                params: {
                    action: 'put'
                },
                data: credentials
            }).then(onResolve, onRejected);

            function onResolve(response) {
                if (response.status === 200) {
                    return 'OK';
                }
            }

            function onRejected(response) {
                return response.data;
            }
        };

        return new User(backendPathsConstant.auth);
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
            restrict: 'E',
            controller: ahtlTop3Controller,
            controllerAs: 'top3',
            templateUrl: 'app/templates/resorts/top3.template.html'
        };

        function ahtlTop3Controller($scope, $element, $attrs) {
            var _this = this;

            this.details = hotelDetailsConstant;
            this.resortType = $attrs.ahtlTop3type;
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

    top3Service.$inject = ['$http', 'backendPathsConstant'];

    function top3Service($http, backendPathsConstant) {
        return {
            getTop3Places: getTop3Places
        };

        function getTop3Places(type) {
            return $http({
                method: 'GET',
                url: backendPathsConstant.top3,
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsIm1vZHVsZS5yb3V0ZXMuanMiLCJtb2R1bGUucnVuLmpzIiwiX2JhY2tlbmRQYXRocy5jb25zdGFudC5qcyIsIl9ob3RlbERldGFpbHMuY29uc3RhbnQuanMiLCJfcHJlbG9hZEltZy5zZXJ2aWNlLmpzIiwidGVtcGxhdGVzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwidGVtcGxhdGVzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9oZWFkZXIuZGlyZWN0aXZlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9zdGlreUhlYWRlci5kaXJlY3RpdmUuanMiLCJ0ZW1wbGF0ZXMvcmVzb3J0cy90b3AzLmRpcmVjdGl2ZS5qcyIsInRlbXBsYXRlcy9yZXNvcnRzL3RvcDMuc2VydmljZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvc2xpZGVyL3NsaWRlci5hbmltYXRpb24uanMiLCJ0ZW1wbGF0ZXMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9zbGlkZXIvc2xpZGVyLnNlcnZpY2UuanMiLCJ0ZW1wbGF0ZXMvaGVhZGVyL3NsaWRlci9zbGlkZXJQYXRoLmNvbnN0YW50LmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkaW5qZWN0IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCJvdGhlcndpc2UiLCJzdGF0ZSIsInVybCIsInRlbXBsYXRlVXJsIiwicGFyYW1zIiwicnVuIiwiJHJvb3RTY29wZSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiJGN1cnJlbnRTdGF0ZU5hbWUiLCJuYW1lIiwiJGN1cnJlbnRTdGF0ZVBhcmFtcyIsImNvbnN0YW50IiwidG9wMyIsImF1dGgiLCJmYWN0b3J5IiwiUHJlbG9hZEltYWdlcyIsIl9pbWFnZVNyY0xpc3QiLCJpbWFnZUxpc3QiLCJwcmVMb2FkIiwicHJvbWlzZXMiLCJsb2FkSW1hZ2UiLCJzcmMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImltYWdlIiwiSW1hZ2UiLCJvbmxvYWQiLCJvbmVycm9yIiwiZSIsImkiLCJsZW5ndGgiLCJwdXNoIiwiYWxsIiwidGhlbiIsInJlc3VsdHMiLCJjb250cm9sbGVyIiwiQXV0aENvbnRyb2xsZXIiLCIkc2NvcGUiLCJhdXRoU2VydmljZSIsIiRzdGF0ZSIsInZhbGlkYXRpb25TdGF0dXMiLCJ1c2VyQWxyZWFkeUV4aXN0cyIsImNyZWF0ZVVzZXIiLCJuZXdVc2VyIiwicmVzcG9uc2UiLCJjb25zb2xlIiwibG9nIiwiZ28iLCJhbGVydCIsImxvZ2luVXNlciIsInVzZXIiLCIkaHR0cCIsImJhY2tlbmRQYXRoc0NvbnN0YW50IiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwibWV0aG9kIiwiYWN0aW9uIiwiZGF0YSIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJzdGF0dXMiLCJkaXJlY3RpdmUiLCJhaHRsSGVhZGVyIiwicmVzdHJpY3QiLCJzZXJ2aWNlIiwiSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlIiwiJHRpbWVvdXQiLCJVSXRyYW5zaXRpb25zIiwiY29udGFpbmVyUXVlcnkiLCJjb250YWluZXIiLCIkIiwiZWxlbWVudFRyYW5zaXRpb24iLCJ0YXJnZXRFbGVtZW50c1F1ZXJ5IiwiY3NzRW51bWVyYWJsZVJ1bGUiLCJmcm9tIiwidG8iLCJkZWxheSIsIm1vdXNlZW50ZXIiLCJ0YXJnZXRFbGVtZW50cyIsImZpbmQiLCJ0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlIiwiY3NzIiwiYW5pbWF0ZU9wdGlvbnMiLCJhbmltYXRlIiwiSGVhZGVyVHJhbnNpdGlvbnMiLCJoZWFkZXJRdWVyeSIsImhlYWRlciIsImNhbGwiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsImZpeEhlYWRlckVsZW1lbnQiLCJfZml4RWxlbWVudCIsImZpeENsYXNzTmFtZSIsInVuZml4Q2xhc3NOYW1lIiwib3B0aW9ucyIsInNlbGYiLCJmaXhFbGVtZW50Iiwib25XaWR0aENoYW5nZUhhbmRsZXIiLCJ0aW1lciIsImZpeFVuZml4TWVudU9uU2Nyb2xsIiwid2luZG93Iiwic2Nyb2xsVG9wIiwib25NaW5TY3JvbGx0b3AiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwid2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwib24iLCJhaHRsU3Rpa3lIZWFkZXIiLCJsaW5rIiwidHJhbnNjbHVkZSIsInNjb3BlIiwiYWh0bFRvcDNEaXJlY3RpdmUiLCJ0b3AzU2VydmljZSIsImhvdGVsRGV0YWlsc0NvbnN0YW50IiwiYWh0bFRvcDNDb250cm9sbGVyIiwiY29udHJvbGxlckFzIiwiJGVsZW1lbnQiLCIkYXR0cnMiLCJkZXRhaWxzIiwicmVzb3J0VHlwZSIsImFodGxUb3AzdHlwZSIsInJlc29ydCIsImdldEltZ1NyYyIsImluZGV4IiwiaW1nIiwiZmlsZW5hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWwiLCJpdGVtIiwiZGV0YWlsIiwiZGV0YWlsQ2xhc3NOYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lIiwiZ2V0VG9wM1BsYWNlcyIsInR5cGUiLCJvblJlamVjdCIsImFuaW1hdGlvbiIsImFuaW1hdGlvbkZ1bmN0aW9uIiwiYmVmb3JlQWRkQ2xhc3MiLCJlbGVtZW50IiwiY2xhc3NOYW1lIiwiZG9uZSIsInNsaWRpbmdEaXJlY3Rpb24iLCJhaHRsU2xpZGVyIiwic2xpZGVyU2VydmljZSIsImFodGxTbGlkZXJDb250cm9sbGVyIiwic2xpZGVyIiwibmV4dFNsaWRlIiwicHJldlNsaWRlIiwic2V0U2xpZGUiLCJzZXROZXh0U2xpZGUiLCJzZXRQcmV2U2xpZGUiLCJnZXRDdXJyZW50U2xpZGUiLCJzZXRDdXJyZW50U2xpZGUiLCJmaXhJRThwbmdCbGFja0JnIiwiZWxlbSIsImFycm93cyIsImNsaWNrIiwiZGlzYWJsZWQiLCJzbGlkZXJJbWdQYXRoQ29uc3RhbnQiLCJTbGlkZXIiLCJzbGlkZXJJbWFnZUxpc3QiLCJfY3VycmVudFNsaWRlIiwiZ2V0SW1hZ2VTcmNMaXN0IiwiZ2V0SW5kZXgiLCJzbGlkZSIsInBhcnNlSW50IiwiaXNOYU4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBQSxRQUNLQyxPQUFPLGFBQWEsQ0FBQyxhQUFhO0tBSjNDO0FDQUE7O0FBQUEsQ0FBQyxZQUFXO0NBQ1g7O0NBRUFELFFBQVFDLE9BQU8sYUFDYkMsT0FBT0E7O0NBRVRBLE9BQU9DLFVBQVUsQ0FBQyxrQkFBa0I7O0NBRXBDLFNBQVNELE9BQU9FLGdCQUFnQkMsb0JBQW9CO0VBQ25EQSxtQkFBbUJDLFVBQVU7O0VBRTdCRixlQUNFRyxNQUFNLFFBQVE7R0FDZEMsS0FBSztHQUNMQyxhQUFhO0tBRWJGLE1BQU0sUUFBUTtHQUNkQyxLQUFLO0dBQ0xDLGFBQWE7R0FDYkMsUUFBUSxFQUFDLFFBQVE7Ozs7S0FLakJILE1BQU0sYUFBYTtHQUNuQkMsS0FBSztHQUNMQyxhQUFhO0tBRWJGLE1BQU0sVUFBVTtHQUNmQyxLQUFLO0dBQ0xDLGFBQWE7S0FFZEYsTUFBTSxVQUFVO0dBQ2hCQyxLQUFLO0dBQ0xDLGFBQWE7OztLQWxDakI7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQVQsUUFDS0MsT0FBTyxhQUNQVSxtQkFBSSxVQUFTQyxZQUFZO1FBQ3RCQSxXQUFXQyxJQUFJLHFCQUNYLFVBQVNDLE9BQU9DLFNBQVNDLDJDQUF5QztZQUM5REosV0FBV0ssb0JBQW9CRixRQUFRRztZQUN2Q04sV0FBV08sc0JBQXNCSDs7O0tBVHJEO0FDQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFoQixRQUNLQyxPQUFPLGFBQ1BtQixTQUFTLHdCQUF3QjtRQUMvQkMsTUFBTTtRQUNOQyxNQUFNOztLQVBqQjtBQ0FBOztBQUFBLENB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TUYsVUFBVUEsUUFBUSxLQUFLQSxRQUFRLEtBQUszSixjQUFjZSxTQUFTLEdBQUc7SUFDakY7OztHQUdELEtBQUt5SSxnQkFBZ0JHOzs7RUFHdEJMLE9BQU83RyxVQUFVbUcsZUFBZSxZQUFZO0dBQzFDLEtBQUtZLGtCQUFrQixLQUFLeEosY0FBY2UsU0FBUyxJQUFLLEtBQUt5SSxnQkFBZ0IsSUFBSSxLQUFLQTs7R0FFdkYsS0FBS1Y7OztFQUdOUSxPQUFPN0csVUFBVW9HLGVBQWUsWUFBWTtHQUMxQyxLQUFLVyxrQkFBa0IsSUFBSyxLQUFLQSxnQkFBZ0IsS0FBS3hKLGNBQWNlLFNBQVMsSUFBSSxLQUFLeUk7O0dBRXZGLEtBQUtWOzs7RUFHTixPQUFPLElBQUlRLE9BQU9EOztLQTdDcEI7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQTlLLFFBQ0tDLE9BQU8sYUFDUG1CLFNBQVMseUJBQXlCLENBQy9CLG9DQUNBLG9DQUNBO0tBUloiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnLCBbJ3VpLnJvdXRlcicsICduZ0FuaW1hdGUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuY29uZmlnKGNvbmZpZyk7XHJcblxyXG5cdGNvbmZpZy4kaW5qZWN0ID0gWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInXTtcclxuXHJcblx0ZnVuY3Rpb24gY29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuXHRcdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcclxuXHJcblx0XHQkc3RhdGVQcm92aWRlclxyXG5cdFx0XHQuc3RhdGUoJ2hvbWUnLCB7XHJcblx0XHRcdFx0dXJsOiAnLycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9hdXRoL2F1dGguaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3R5cGUnOiAnbG9naW4nfS8qLFxyXG5cdFx0XHRcdG9uRW50ZXI6IGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XHJcblx0XHRcdFx0XHQkcm9vdFNjb3BlLiRzdGF0ZSA9IFwiYXV0aFwiO1xyXG5cdFx0XHRcdH0qL1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2J1bmdhbG93cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYnVuZ2Fsb3dzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvcmVzb3J0cy9idW5nYWxvd3MuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdob3RlbHMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvaG90ZWxzJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9yZXNvcnRzL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9yZXNvcnRzL3ZpbGxhcy5odG1sJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLyosIGZyb21TdGF0ZSwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGN1cnJlbnRTdGF0ZU5hbWUgPSB0b1N0YXRlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kY3VycmVudFN0YXRlUGFyYW1zID0gdG9QYXJhbXM7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdiYWNrZW5kUGF0aHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICB0b3AzOiAnL2FwaS90b3AzJyxcclxuICAgICAgICAgICBhdXRoOiAnL2FwaS91c2VycydcclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdob3RlbERldGFpbHNDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgXCJyZXN0YXVyYW50XCIsXHJcbiAgICAgICAgICAgIFwia2lkc1wiLFxyXG4gICAgICAgICAgICBcInBvb2xcIixcclxuICAgICAgICAgICAgXCJzcGFcIixcclxuICAgICAgICAgICAgXCJ3aWZpXCIsXHJcbiAgICAgICAgICAgIFwicGV0XCIsXHJcbiAgICAgICAgICAgIFwiZGlzYWJsZVwiLFxyXG4gICAgICAgICAgICBcImJlYWNoXCIsXHJcbiAgICAgICAgICAgIFwicGFya2luZ1wiLFxyXG4gICAgICAgICAgICBcImNvbmRpdGlvbmluZ1wiLFxyXG4gICAgICAgICAgICBcImxvdW5nZVwiLFxyXG4gICAgICAgICAgICBcInRlcnJhY2VcIixcclxuICAgICAgICAgICAgXCJnYXJkZW5cIixcclxuICAgICAgICAgICAgXCJneW1cIixcclxuICAgICAgICAgICAgXCJiaWN5Y2xlc1wiXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdQcmVsb2FkSW1hZ2VzJyxQcmVsb2FkSW1hZ2VzKTtcclxuXHJcblx0ZnVuY3Rpb24gUHJlbG9hZEltYWdlcygpIHtcclxuXHRcdHRoaXMuX2ltYWdlU3JjTGlzdCA9IGltYWdlTGlzdDtcclxuXHJcblx0XHRmdW5jdGlvbiBwcmVMb2FkKGltYWdlTGlzdCkge1xyXG5cclxuXHRcdFx0dmFyIHByb21pc2VzID0gW107XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBsb2FkSW1hZ2Uoc3JjKSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0XHRcdHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5cdFx0XHRcdFx0aW1hZ2Uuc3JjID0gc3JjO1xyXG5cdFx0XHRcdFx0aW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKGltYWdlKTtcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHRcdFx0cmVqZWN0KGUpO1xyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRwcm9taXNlcy5wdXNoKGxvYWRJbWFnZShpbWFnZUxpc3RbaV0pKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3VsdHM7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByZUxvYWQodGhpcy5faW1hZ2VTcmNMaXN0KTtcclxuXHJcblx0XHRyZXR1cm4gcHJlTG9hZDtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBBdXRoQ29udHJvbGxlcik7XHJcblxyXG4gICAgQXV0aENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnVzZXIpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdhdXRoU2VydmljZScsIGF1dGhTZXJ2aWNlKTtcclxuXHJcbiAgICBhdXRoU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICckc3RhdGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhdXRoU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICAvL3RvZG8gZXJyb3JzXHJcbiAgICAgICAgZnVuY3Rpb24gVXNlcihiYWNrZW5kQXBpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JhY2tlbmRBcGkgPSBiYWNrZW5kQXBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihvblJlc29sdmUsIG9uUmVqZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ09LJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsSGVhZGVyJyxhaHRsSGVhZGVyKVxyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5zZXJ2aWNlKCdIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpO1xyXG5cclxuXHRIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCR0aW1lb3V0KSB7XHJcblx0XHRmdW5jdGlvbiBVSXRyYW5zaXRpb25zKGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdC8vdG9kbyBlcnJvcnNcclxuXHRcdFx0dGhpcy5jb250YWluZXIgPSAkKGNvbnRhaW5lclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5lbGVtZW50VHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50c1F1ZXJ5LFxyXG5cdFx0XHR7Y3NzRW51bWVyYWJsZVJ1bGUgPSAnd2lkdGgnLCBmcm9tID0gMCwgdG8gPSAnYXV0bycsIGRlbGF5ID0gMTAwfSkge1xyXG5cdFx0XHQvL3RvZG8gZXJyb3JzXHJcblx0XHRcdHRoaXMuY29udGFpbmVyLm1vdXNlZW50ZXIoXHJcblx0XHRcdFx0ZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0dmFyIHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSwgdG8pO1xyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSA9IHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSk7XHJcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRcdGxldCBhbmltYXRlT3B0aW9ucyA9IHt9O1xyXG5cdFx0XHRcdFx0YW5pbWF0ZU9wdGlvbnNbY3NzRW51bWVyYWJsZVJ1bGVdID0gdGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9ucyhoZWFkZXJRdWVyeSwgY29udGFpbmVyUXVlcnkpIHtcclxuXHRcdFx0dGhpcy5oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdFx0VUl0cmFuc2l0aW9ucy5jYWxsKHRoaXMsIGNvbnRhaW5lclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKF9maXhFbGVtZW50LCBmaXhDbGFzc05hbWUsIHVuZml4Q2xhc3NOYW1lLCBvcHRpb25zKSB7XHJcblx0XHRcdGxldCBzZWxmID0gdGhpcztcclxuXHRcdFx0bGV0IGZpeEVsZW1lbnQgPSAkKF9maXhFbGVtZW50KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCkge1xyXG5cdFx0XHRcdGxldCB0aW1lcjtcclxuXHJcblx0XHRcdFx0ZnVuY3Rpb24gZml4VW5maXhNZW51T25TY3JvbGwoKSB7XHJcblx0XHRcdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gb3B0aW9ucy5vbk1pblNjcm9sbHRvcCkge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LmFkZENsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKCQod2luZG93KS53aWR0aCgpIDwgb3B0aW9ucy5vbk1heFdpbmRvd1dpZHRoKSB7XHJcblx0XHRcdFx0XHRmaXhVbmZpeE1lbnVPblNjcm9sbCgpO1xyXG5cdFx0XHRcdFx0c2VsZi5oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5oZWFkZXIucmVtb3ZlQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0Zml4RWxlbWVudC5yZW1vdmVDbGFzcyhmaXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLm9mZignc2Nyb2xsJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRvbldpZHRoQ2hhbmdlSGFuZGxlcigpO1xyXG5cdFx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIEhlYWRlclRyYW5zaXRpb25zO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFN0aWt5SGVhZGVyJyxhaHRsU3Rpa3lIZWFkZXIpXHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0ZnVuY3Rpb24gbGluaygpIHtcclxuXHRcdFx0bGV0IGhlYWRlciA9IG5ldyBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJy5sLWhlYWRlcicsICcubmF2X19pdGVtLWNvbnRhaW5lcicpO1xyXG5cclxuXHRcdFx0aGVhZGVyLmVsZW1lbnRUcmFuc2l0aW9uKFxyXG5cdFx0XHRcdCcuc3ViLW5hdicsIHtcclxuXHRcdFx0XHRcdGNzc0VudW1lcmFibGVSdWxlOiAnaGVpZ2h0JyxcclxuXHRcdFx0XHRcdGRlbGF5OiAzMDBcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRoZWFkZXIuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHQnLm5hdicsXHJcblx0XHRcdFx0J2pzX25hdi0tZml4ZWQnLFxyXG5cdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRvbk1pblNjcm9sbHRvcDogODgsXHJcblx0XHRcdFx0XHRvbk1heFdpbmRvd1dpZHRoOiA4NTBcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0dHJhbnNjbHVkZTogZmFsc2UsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxUb3AzJywgYWh0bFRvcDNEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxUb3AzRGlyZWN0aXZlLiRpbmplY3QgPSBbJ3RvcDNTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFRvcDNEaXJlY3RpdmUodG9wM1NlcnZpY2UsIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGFodGxUb3AzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndG9wMycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9yZXNvcnRzL3RvcDMudGVtcGxhdGUuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsVG9wM0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWlscyA9IGhvdGVsRGV0YWlsc0NvbnN0YW50O1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydFR5cGUgPSAkYXR0cnMuYWh0bFRvcDN0eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEltZ1NyYyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9pbWFnZXMvJyArIHRoaXMucmVzb3J0VHlwZSArICcvJyArIHRoaXMucmVzb3J0W2luZGV4XS5pbWcuZmlsZW5hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNSZXNvcnRJbmNsdWRlRGV0YWlsID0gZnVuY3Rpb24oaXRlbSwgZGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0YWlsQ2xhc3NOYW1lID0gJ3RvcDNfX2RldGFpbC1jb250YWluZXItLScgKyBkZXRhaWwsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lID0gIWl0ZW0uZGV0YWlsc1tkZXRhaWxdID8gJyB0b3AzX19kZXRhaWwtY29udGFpbmVyLS1oYXMnIDogJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFpbENsYXNzTmFtZSArIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdG9wM1NlcnZpY2UuZ2V0VG9wM1BsYWNlcyh0aGlzLnJlc29ydFR5cGUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5yZXNvcnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCd0b3AzU2VydmljZScsIHRvcDNTZXJ2aWNlKTtcclxuXHJcbiAgICB0b3AzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvcDNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvcDNQbGFjZXM6IGdldFRvcDNQbGFjZXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUb3AzUGxhY2VzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LnRvcDMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuYW5pbWF0aW9uKCcuc2xpZGVyX19pbWcnLGFuaW1hdGlvbkZ1bmN0aW9uKVxyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7IC8vd2h5IDIwMD8gJClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHRhZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZSkge1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzAnKTtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnbGVmdCcsICcwJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxTbGlkZXInLGFodGxTbGlkZXIpO1xyXG5cclxuXHRhaHRsU2xpZGVyLiRpbmplY3QgPSBbJ3NsaWRlclNlcnZpY2UnLCAnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFNsaWRlcihzbGlkZXJTZXJ2aWNlLCAkdGltZW91dCkge1xyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0dHJhbnNjbHVkZTogZmFsc2UsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0Y29udHJvbGxlcjogYWh0bFNsaWRlckNvbnRyb2xsZXIsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9oZWFkZXIvc2xpZGVyL3NsaWRlci5odG1sJyxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKCFzbGlkZSB8fCBpc05hTihzbGlkZSkgfHwgc2xpZGUgPCAwIHx8IHNsaWRlID4gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IHNsaWRlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldE5leHRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpID8gdGhpcy5fY3VycmVudFNsaWRlID0gMCA6IHRoaXMuX2N1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRQcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IDApID8gdGhpcy5fY3VycmVudFNsaWRlID0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEgOiB0aGlzLl9jdXJyZW50U2xpZGUtLTtcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBuZXcgU2xpZGVyKHNsaWRlckltZ1BhdGhDb25zdGFudCk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3NsaWRlckltZ1BhdGhDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjEuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjIuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjMuanBnJ1xyXG4gICAgICAgIF0pO1xyXG59KSgpOyJdfQ==
