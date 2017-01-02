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
        $rootScope.$state = {
            currentStateName: null,
            currentStateParams: null,
            stateHistory: []
        };

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams /*, fromState, fromParams todo*/) {
            $rootScope.$state.currentStateName = toState.name;
            $rootScope.$state.currentStateParams = toParams;
            $rootScope.$state.stateHistory.push(toState.name);
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

    AuthController.$inject = ['$rootScope', '$scope', 'authService', '$state'];

    function AuthController($rootScope, $scope, authService, $state) {
        this.validationStatus = {
            userAlreadyExists: false,
            loginOrPasswordIncorrect: false
        };

        this.createUser = function () {
            var _this = this;

            authService.createUser(this.newUser).then(function (response) {
                if (response === 'OK') {
                    console.log(response);
                    $state.go('auth', { 'type': 'login' });
                } else {
                    _this.validationStatus.userAlreadyExists = true;
                    console.log(response);
                }
            });
            /*console.log($scope.formJoin);
            console.log(this.newUser);*/
        };

        this.loginUser = function () {
            var _this2 = this;

            authService.login(this.user).then(function (response) {
                if (response === 'OK') {
                    console.log(response);
                    var previousState = $rootScope.$state.stateHistory[$rootScope.$state.stateHistory.length - 2] || 'home';
                    console.log(previousState);
                    $state.go(previousState);
                } else {
                    _this2.validationStatus.loginOrPasswordIncorrect = true;
                    console.log(response);
                }
            });
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
            this._credentials = null;

            this._onResolve = function (response) {
                if (response.status === 200) {
                    console.log(response);
                    if (response.data.token) {
                        tokenKeeper.saveToken(response.data.token);
                    }
                    return 'OK';
                }
            };

            this._onRejected = function (response) {
                return response.data;
            };

            var tokenKeeper = function () {
                var token = null;

                function saveToken(_token) {
                    token = _token;
                    console.log(token);
                }

                function getToken() {
                    return token;
                }

                return {
                    saveToken: saveToken,
                    getToken: getToken
                };
            }();
        }

        User.prototype.createUser = function (credentials) {
            return $http({
                method: 'POST',
                url: this._backendApi,
                params: {
                    action: 'put'
                },
                data: credentials
            }).then(this._onResolve, this._onRejected);
        };

        User.prototype.login = function (credentials) {
            this._credentials = credentials;

            return $http({
                method: 'POST',
                url: this._backendApi,
                params: {
                    action: 'get'
                },
                data: this._credentials
            }).then(this._onResolve, this._onRejected);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsIm1vZHVsZS5yb3V0ZXMuanMiLCJtb2R1bGUucnVuLmpzIiwiX2JhY2tlbmRQYXRocy5jb25zdGFudC5qcyIsIl9ob3RlbERldGFpbHMuY29uc3RhbnQuanMiLCJfcHJlbG9hZEltZy5zZXJ2aWNlLmpzIiwidGVtcGxhdGVzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwidGVtcGxhdGVzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9oZWFkZXIuZGlyZWN0aXZlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9zdGlreUhlYWRlci5kaXJlY3RpdmUuanMiLCJ0ZW1wbGF0ZXMvcmVzb3J0cy90b3AzLmRpcmVjdGl2ZS5qcyIsInRlbXBsYXRlcy9yZXNvcnRzL3RvcDMuc2VydmljZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvc2xpZGVyL3NsaWRlci5hbmltYXRpb24uanMiLCJ0ZW1wbGF0ZXMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9zbGlkZXIvc2xpZGVyLnNlcnZpY2UuanMiLCJ0ZW1wbGF0ZXMvaGVhZGVyL3NsaWRlci9zbGlkZXJQYXRoLmNvbnN0YW50LmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkaW5qZWN0IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCJvdGhlcndpc2UiLCJzdGF0ZSIsInVybCIsInRlbXBsYXRlVXJsIiwicGFyYW1zIiwicnVuIiwiJHJvb3RTY29wZSIsIiRzdGF0ZSIsImN1cnJlbnRTdGF0ZU5hbWUiLCJjdXJyZW50U3RhdGVQYXJhbXMiLCJzdGF0ZUhpc3RvcnkiLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsIm5hbWUiLCJwdXNoIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImZhY3RvcnkiLCJQcmVsb2FkSW1hZ2VzIiwiX2ltYWdlU3JjTGlzdCIsImltYWdlTGlzdCIsInByZUxvYWQiLCJwcm9taXNlcyIsImxvYWRJbWFnZSIsInNyYyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiaW1hZ2UiLCJJbWFnZSIsIm9ubG9hZCIsIm9uZXJyb3IiLCJlIiwiaSIsImxlbmd0aCIsImFsbCIsInRoZW4iLCJyZXN1bHRzIiwiY29udHJvbGxlciIsIkF1dGhDb250cm9sbGVyIiwiJHNjb3BlIiwiYXV0aFNlcnZpY2UiLCJ2YWxpZGF0aW9uU3RhdHVzIiwidXNlckFscmVhZHlFeGlzdHMiLCJsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QiLCJjcmVhdGVVc2VyIiwibmV3VXNlciIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsImdvIiwibG9naW5Vc2VyIiwibG9naW4iLCJ1c2VyIiwicHJldmlvdXNTdGF0ZSIsIiRodHRwIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCJVc2VyIiwiYmFja2VuZEFwaSIsIl9iYWNrZW5kQXBpIiwiX2NyZWRlbnRpYWxzIiwiX29uUmVzb2x2ZSIsInN0YXR1cyIsImRhdGEiLCJ0b2tlbiIsInRva2VuS2VlcGVyIiwic2F2ZVRva2VuIiwiX29uUmVqZWN0ZWQiLCJfdG9rZW4iLCJnZXRUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwibWV0aG9kIiwiYWN0aW9uIiwiZGlyZWN0aXZlIiwiYWh0bEhlYWRlciIsInJlc3RyaWN0Iiwic2VydmljZSIsIkhlYWRlclRyYW5zaXRpb25zU2VydmljZSIsIiR0aW1lb3V0IiwiVUl0cmFuc2l0aW9ucyIsImNvbnRhaW5lclF1ZXJ5IiwiY29udGFpbmVyIiwiJCIsImVsZW1lbnRUcmFuc2l0aW9uIiwidGFyZ2V0RWxlbWVudHNRdWVyeSIsImNzc0VudW1lcmFibGVSdWxlIiwiZnJvbSIsInRvIiwiZGVsYXkiLCJtb3VzZWVudGVyIiwidGFyZ2V0RWxlbWVudHMiLCJmaW5kIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImNzcyIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJoZWFkZXIiLCJjYWxsIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiX2ZpeEVsZW1lbnQiLCJmaXhDbGFzc05hbWUiLCJ1bmZpeENsYXNzTmFtZSIsIm9wdGlvbnMiLCJzZWxmIiwiZml4RWxlbWVudCIsIm9uV2lkdGhDaGFuZ2VIYW5kbGVyIiwidGltZXIiLCJmaXhVbmZpeE1lbnVPblNjcm9sbCIsIndpbmRvdyIsInNjcm9sbFRvcCIsIm9uTWluU2Nyb2xsdG9wIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsIndpZHRoIiwib25NYXhXaW5kb3dXaWR0aCIsIm9mZiIsInNjcm9sbCIsIm9uIiwiYWh0bFN0aWt5SGVhZGVyIiwibGluayIsInRyYW5zY2x1ZGUiLCJzY29wZSIsImFodGxUb3AzRGlyZWN0aXZlIiwidG9wM1NlcnZpY2UiLCJob3RlbERldGFpbHNDb25zdGFudCIsImFodGxUb3AzQ29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsIiRlbGVtZW50IiwiJGF0dHJzIiwiZGV0YWlscyIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJpbmRleCIsImltZyIsImZpbGVuYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsIiwiaXRlbSIsImRldGFpbCIsImRldGFpbENsYXNzTmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSIsImdldFRvcDNQbGFjZXMiLCJ0eXBlIiwib25SZXNvbHZlIiwib25SZWplY3QiLCJhbmltYXRpb24iLCJhbmltYXRpb25GdW5jdGlvbiIsImJlZm9yZUFkZENsYXNzIiwiZWxlbWVudCIsImNsYXNzTmFtZSIsImRvbmUiLCJzbGlkaW5nRGlyZWN0aW9uIiwiYWh0bFNsaWRlciIsInNsaWRlclNlcnZpY2UiLCJhaHRsU2xpZGVyQ29udHJvbGxlciIsInNsaWRlciIsIm5leHRTbGlkZSIsInByZXZTbGlkZSIsInNldFNsaWRlIiwic2V0TmV4dFNsaWRlIiwic2V0UHJldlNsaWRlIiwiZ2V0Q3VycmVudFNsaWRlIiwic2V0Q3VycmVudFNsaWRlIiwiZml4SUU4cG5nQmxhY2tCZyIsImVsZW0iLCJhcnJvd3MiLCJjbGljayIsImRpc2FibGVkIiwic2xpZGVySW1nUGF0aENvbnN0YW50IiwiU2xpZGVyIiwic2xpZGVySW1hZ2VMaXN0IiwiX2N1cnJlbnRTbGlkZSIsImdldEltYWdlU3JjTGlzdCIsImdldEluZGV4Iiwic2xpZGUiLCJwYXJzZUludCIsImlzTmFOIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUEsUUFDS0MsT0FBTyxhQUFhLENBQUMsYUFBYTtLQUozQztBQ0FBOztBQUFBLENBQUMsWUFBVztDQUNYOztDQUVBRCxRQUFRQyxPQUFPLGFBQ2JDLE9BQU9BOztDQUVUQSxPQUFPQyxVQUFVLENBQUMsa0JBQWtCOztDQUVwQyxTQUFTRCxPQUFPRSxnQkFBZ0JDLG9CQUFvQjtFQUNuREEsbUJBQW1CQyxVQUFVOztFQUU3QkYsZUFDRUcsTUFBTSxRQUFRO0dBQ2RDLEtBQUs7R0FDTEMsYUFBYTtLQUViRixNQUFNLFFBQVE7R0FDZEMsS0FBSztHQUNMQyxhQUFhO0dBQ2JDLFFBQVEsRUFBQyxRQUFROzs7O0tBS2pCSCxNQUFNLGFBQWE7R0FDbkJDLEtBQUs7R0FDTEMsYUFBYTtLQUViRixNQUFNLFVBQVU7R0FDZkMsS0FBSztHQUNMQyxhQUFhO0tBRWRGLE1BQU0sVUFBVTtHQUNoQkMsS0FBSztHQUNMQyxhQUFhOzs7S0FsQ2pCO0FDQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFULFFBQ0tDLE9BQU8sYUFDUFUsbUJBQUksVUFBU0MsWUFBWTtRQUN0QkEsV0FBV0MsU0FBUztZQUNoQkMsa0JBQWtCO1lBQ2xCQyxvQkFBb0I7WUFDcEJDLGNBQWM7OztRQUdsQkosV0FBV0ss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Y0FBYyxLQUFLK0o7OztFQUd4RUYsT0FBTzFHLFVBQVVtRyxrQkFBa0IsVUFBVVksT0FBTztHQUNuREEsUUFBUUMsU0FBU0Q7O0dBRWpCLElBQUksQ0FBQ0EsU0FBU0UsTUFBTUYsVUFBVUEsUUFBUSxLQUFLQSxRQUFRLEtBQUtsSyxjQUFjZSxTQUFTLEdBQUc7SUFDakY7OztHQUdELEtBQUtnSixnQkFBZ0JHOzs7RUFHdEJMLE9BQU8xRyxVQUFVZ0csZUFBZSxZQUFZO0dBQzFDLEtBQUtZLGtCQUFrQixLQUFLL0osY0FBY2UsU0FBUyxJQUFLLEtBQUtnSixnQkFBZ0IsSUFBSSxLQUFLQTs7R0FFdkYsS0FBS1Y7OztFQUdOUSxPQUFPMUcsVUFBVWlHLGVBQWUsWUFBWTtHQUMxQyxLQUFLVyxrQkFBa0IsSUFBSyxLQUFLQSxnQkFBZ0IsS0FBSy9KLGNBQWNlLFNBQVMsSUFBSSxLQUFLZ0o7O0dBRXZGLEtBQUtWOzs7RUFHTixPQUFPLElBQUlRLE9BQU9EOztLQTdDcEI7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQXhMLFFBQ0tDLE9BQU8sYUFDUHNCLFNBQVMseUJBQXlCLENBQy9CLG9DQUNBLG9DQUNBO0tBUloiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnLCBbJ3VpLnJvdXRlcicsICduZ0FuaW1hdGUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuY29uZmlnKGNvbmZpZyk7XHJcblxyXG5cdGNvbmZpZy4kaW5qZWN0ID0gWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInXTtcclxuXHJcblx0ZnVuY3Rpb24gY29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuXHRcdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcclxuXHJcblx0XHQkc3RhdGVQcm92aWRlclxyXG5cdFx0XHQuc3RhdGUoJ2hvbWUnLCB7XHJcblx0XHRcdFx0dXJsOiAnLycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9hdXRoL2F1dGguaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3R5cGUnOiAnbG9naW4nfS8qLFxyXG5cdFx0XHRcdG9uRW50ZXI6IGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XHJcblx0XHRcdFx0XHQkcm9vdFNjb3BlLiRzdGF0ZSA9IFwiYXV0aFwiO1xyXG5cdFx0XHRcdH0qL1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2J1bmdhbG93cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYnVuZ2Fsb3dzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvcmVzb3J0cy9idW5nYWxvd3MuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdob3RlbHMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvaG90ZWxzJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9yZXNvcnRzL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9yZXNvcnRzL3ZpbGxhcy5odG1sJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZU5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGVQYXJhbXM6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLyosIGZyb21TdGF0ZSwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZU5hbWUgPSB0b1N0YXRlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuY3VycmVudFN0YXRlUGFyYW1zID0gdG9QYXJhbXM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2JhY2tlbmRQYXRoc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgIHRvcDM6ICcvYXBpL3RvcDMnLFxyXG4gICAgICAgICAgIGF1dGg6ICcvYXBpL3VzZXJzJ1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2hvdGVsRGV0YWlsc0NvbnN0YW50JywgW1xyXG4gICAgICAgICAgICBcInJlc3RhdXJhbnRcIixcclxuICAgICAgICAgICAgXCJraWRzXCIsXHJcbiAgICAgICAgICAgIFwicG9vbFwiLFxyXG4gICAgICAgICAgICBcInNwYVwiLFxyXG4gICAgICAgICAgICBcIndpZmlcIixcclxuICAgICAgICAgICAgXCJwZXRcIixcclxuICAgICAgICAgICAgXCJkaXNhYmxlXCIsXHJcbiAgICAgICAgICAgIFwiYmVhY2hcIixcclxuICAgICAgICAgICAgXCJwYXJraW5nXCIsXHJcbiAgICAgICAgICAgIFwiY29uZGl0aW9uaW5nXCIsXHJcbiAgICAgICAgICAgIFwibG91bmdlXCIsXHJcbiAgICAgICAgICAgIFwidGVycmFjZVwiLFxyXG4gICAgICAgICAgICBcImdhcmRlblwiLFxyXG4gICAgICAgICAgICBcImd5bVwiLFxyXG4gICAgICAgICAgICBcImJpY3ljbGVzXCJcclxuICAgICAgICBdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ1ByZWxvYWRJbWFnZXMnLFByZWxvYWRJbWFnZXMpO1xyXG5cclxuXHRmdW5jdGlvbiBQcmVsb2FkSW1hZ2VzKCkge1xyXG5cdFx0dGhpcy5faW1hZ2VTcmNMaXN0ID0gaW1hZ2VMaXN0O1xyXG5cclxuXHRcdGZ1bmN0aW9uIHByZUxvYWQoaW1hZ2VMaXN0KSB7XHJcblxyXG5cdFx0XHR2YXIgcHJvbWlzZXMgPSBbXTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIGxvYWRJbWFnZShzcmMpIHtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRcdFx0dmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcblx0XHRcdFx0XHRpbWFnZS5zcmMgPSBzcmM7XHJcblx0XHRcdFx0XHRpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUoaW1hZ2UpO1xyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRcdFx0XHRyZWplY3QoZSk7XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlTGlzdC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHByb21pc2VzLnB1c2gobG9hZEltYWdlKGltYWdlTGlzdFtpXSkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0cztcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJlTG9hZCh0aGlzLl9pbWFnZVNyY0xpc3QpO1xyXG5cclxuXHRcdHJldHVybiBwcmVMb2FkO1xyXG5cdH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIEF1dGhDb250cm9sbGVyKTtcclxuXHJcbiAgICBBdXRoQ29udHJvbGxlci4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRzY29wZScsICdhdXRoU2VydmljZScsICckc3RhdGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBBdXRoQ29udHJvbGxlcigkcm9vdFNjb3BlLCAkc2NvcGUsIGF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMgPSB7XHJcbiAgICAgICAgICAgIHVzZXJBbHJlYWR5RXhpc3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgbG9naW5PclBhc3N3b3JkSW5jb3JyZWN0OiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5jcmVhdGVVc2VyKHRoaXMubmV3VXNlcilcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gJ09LJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXV0aCcsIHsndHlwZSc6ICdsb2dpbid9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy51c2VyQWxyZWFkeUV4aXN0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygkc2NvcGUuZm9ybUpvaW4pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5ld1VzZXIpOyovXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dpblVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2UubG9naW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gYXV0aFNlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgLy90b2RvIGVycm9yc1xyXG4gICAgICAgIGZ1bmN0aW9uIFVzZXIoYmFja2VuZEFwaSkge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZW5kQXBpID0gYmFja2VuZEFwaTtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZXNvbHZlID0gKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEudG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5LZWVwZXIuc2F2ZVRva2VuKHJlc3BvbnNlLmRhdGEudG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ09LJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZWplY3RlZCA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIHRva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSBfdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codG9rZW4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0VG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZVRva2VuOiBzYXZlVG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0VG9rZW46IGdldFRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmxvZ2luID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBjcmVkZW50aWFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLl9jcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFVzZXIoYmFja2VuZFBhdGhzQ29uc3RhbnQuYXV0aCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxIZWFkZXInLGFodGxIZWFkZXIpXHJcblxyXG5cdGZ1bmN0aW9uIGFodGxIZWFkZXIoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBQycsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJHRpbWVvdXQpIHtcclxuXHRcdGZ1bmN0aW9uIFVJdHJhbnNpdGlvbnMoY29udGFpbmVyUXVlcnkpIHtcclxuXHRcdFx0Ly90b2RvIGVycm9yc1xyXG5cdFx0XHR0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyUXVlcnkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmVsZW1lbnRUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblx0XHRcdC8vdG9kbyBlcnJvcnNcclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihcclxuXHRcdFx0XHRmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHR2YXIgdGFyZ2V0RWxlbWVudHMgPSAkKHRoaXMpLmZpbmQodGFyZ2V0RWxlbWVudHNRdWVyeSksXHJcblx0XHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCB0byk7XHJcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSwgZnJvbSk7XHJcblxyXG5cdFx0XHRcdFx0bGV0IGFuaW1hdGVPcHRpb25zID0ge307XHJcblx0XHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzLmFuaW1hdGUoYW5pbWF0ZU9wdGlvbnMsIGRlbGF5KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zKGhlYWRlclF1ZXJ5LCBjb250YWluZXJRdWVyeSkge1xyXG5cdFx0XHR0aGlzLmhlYWRlciA9ICQoaGVhZGVyUXVlcnkpO1xyXG5cdFx0XHRVSXRyYW5zaXRpb25zLmNhbGwodGhpcywgY29udGFpbmVyUXVlcnkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVUl0cmFuc2l0aW9ucy5wcm90b3R5cGUpO1xyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpeEhlYWRlckVsZW1lbnQgPSBmdW5jdGlvbiAoX2ZpeEVsZW1lbnQsIGZpeENsYXNzTmFtZSwgdW5maXhDbGFzc05hbWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgZml4RWxlbWVudCA9ICQoX2ZpeEVsZW1lbnQpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLmhlYWRlci5hZGRDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblxyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLm9mZignc2Nyb2xsJyk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCF0aW1lcikge1xyXG5cdFx0XHRcdFx0XHRcdHRpbWVyID0gJHRpbWVvdXQoZml4VW5maXhNZW51T25TY3JvbGwsIDE1MCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRzZWxmLmhlYWRlci5yZW1vdmVDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCk7XHJcblx0XHRcdCQod2luZG93KS5vbigncmVzaXplJywgb25XaWR0aENoYW5nZUhhbmRsZXIpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcilcclxuXHJcblx0YWh0bFN0aWt5SGVhZGVyLiRpbmplY3QgPSBbJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZSddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU3Rpa3lIZWFkZXIoSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcblx0XHRmdW5jdGlvbiBsaW5rKCkge1xyXG5cdFx0XHRsZXQgaGVhZGVyID0gbmV3IEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgnLmwtaGVhZGVyJywgJy5uYXZfX2l0ZW0tY29udGFpbmVyJyk7XHJcblxyXG5cdFx0XHRoZWFkZXIuZWxlbWVudFRyYW5zaXRpb24oXHJcblx0XHRcdFx0Jy5zdWItbmF2Jywge1xyXG5cdFx0XHRcdFx0Y3NzRW51bWVyYWJsZVJ1bGU6ICdoZWlnaHQnLFxyXG5cdFx0XHRcdFx0ZGVsYXk6IDMwMFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdGhlYWRlci5maXhIZWFkZXJFbGVtZW50KFxyXG5cdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHQnanNfbmF2LS1maXhlZCcsXHJcblx0XHRcdFx0J2pzX2wtaGVhZGVyLS1yZWxhdGl2ZScsIHtcclxuXHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdG9uTWF4V2luZG93V2lkdGg6IDg1MFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0EnLFxyXG5cdFx0XHR0cmFuc2NsdWRlOiBmYWxzZSxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFRvcDMnLCBhaHRsVG9wM0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFRvcDNEaXJlY3RpdmUuJGluamVjdCA9IFsndG9wM1NlcnZpY2UnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsVG9wM0RpcmVjdGl2ZSh0b3AzU2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogYWh0bFRvcDNDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd0b3AzJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL3Jlc29ydHMvdG9wMy50ZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQ7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0VHlwZSA9ICRhdHRycy5haHRsVG9wM3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1nU3JjID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL2ltYWdlcy8nICsgdGhpcy5yZXNvcnRUeXBlICsgJy8nICsgdGhpcy5yZXNvcnRbaW5kZXhdLmltZy5maWxlbmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc1Jlc29ydEluY2x1ZGVEZXRhaWwgPSBmdW5jdGlvbihpdGVtLCBkZXRhaWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZXRhaWxDbGFzc05hbWUgPSAndG9wM19fZGV0YWlsLWNvbnRhaW5lci0tJyArIGRldGFpbCxcclxuICAgICAgICAgICAgICAgICAgICBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUgPSAhaXRlbS5kZXRhaWxzW2RldGFpbF0gPyAnIHRvcDNfX2RldGFpbC1jb250YWluZXItLWhhcycgOiAnJztcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0YWlsQ2xhc3NOYW1lICsgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0b3AzU2VydmljZS5nZXRUb3AzUGxhY2VzKHRoaXMucmVzb3J0VHlwZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnJlc29ydCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ3RvcDNTZXJ2aWNlJywgdG9wM1NlcnZpY2UpO1xyXG5cclxuICAgIHRvcDNTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gdG9wM1NlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0VG9wM1BsYWNlczogZ2V0VG9wM1BsYWNlc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRvcDNQbGFjZXModHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQudG9wMyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5hbmltYXRpb24oJy5zbGlkZXJfX2ltZycsYW5pbWF0aW9uRnVuY3Rpb24pXHJcblxyXG5cdGZ1bmN0aW9uIGFuaW1hdGlvbkZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0YmVmb3JlQWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHRsZXQgc2xpZGluZ0RpcmVjdGlvbiA9IGVsZW1lbnQuc2NvcGUoKS5zbGlkaW5nRGlyZWN0aW9uO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzEnKTtcclxuXHJcblx0XHRcdFx0aWYoc2xpZGluZ0RpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICcxMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnLTIwMCUnfSwgNTAwLCBkb25lKTsgLy93aHkgMjAwPyAkKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMCcpO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCdsZWZ0JywgJzAnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFNsaWRlcicsYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRmdW5jdGlvbiBhaHRsU2xpZGVyQ29udHJvbGxlcigkc2NvcGUpIHtcclxuXHRcdFx0JHNjb3BlLnNsaWRlciA9IHNsaWRlclNlcnZpY2U7XHJcblx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gbnVsbDtcclxuXHJcblx0XHRcdCRzY29wZS5uZXh0U2xpZGUgPSBuZXh0U2xpZGU7XHJcblx0XHRcdCRzY29wZS5wcmV2U2xpZGUgPSBwcmV2U2xpZGU7XHJcblx0XHRcdCRzY29wZS5zZXRTbGlkZSA9IHNldFNsaWRlO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gbmV4dFNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ2xlZnQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0TmV4dFNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHByZXZTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRQcmV2U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gc2V0U2xpZGUoaW5kZXgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IGluZGV4ID4gJHNjb3BlLnNsaWRlci5nZXRDdXJyZW50U2xpZGUodHJ1ZSkgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0Q3VycmVudFNsaWRlKGluZGV4KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGZpeElFOHBuZ0JsYWNrQmcoZWxlbWVudCkge1xyXG5cdFx0XHQkKGVsZW1lbnQpXHJcblx0XHRcdFx0LmNzcygnLW1zLWZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCd6b29tJywgJzEnKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtKSB7XHJcblx0XHRcdGxldCBhcnJvd3MgPSAkKGVsZW0pLmZpbmQoJy5zbGlkZXJfX2Fycm93Jyk7XHJcblxyXG5cdFx0XHRhcnJvd3MuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzAuNScpO1xyXG5cdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcodGhpcyk7XHJcblxyXG5cdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHQkdGltZW91dCgoKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcxJyk7XHJcblx0XHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKCQodGhpcykpO1xyXG5cdFx0XHRcdH0sIDUwMCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHR0cmFuc2NsdWRlOiBmYWxzZSxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmh0bWwnLFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTtcclxuXHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZmFjdG9yeSgnc2xpZGVyU2VydmljZScsc2xpZGVyU2VydmljZSk7XHJcblxyXG5cdHNsaWRlclNlcnZpY2UuJGluamVjdCA9IFsnc2xpZGVySW1nUGF0aENvbnN0YW50J107XHJcblxyXG5cdGZ1bmN0aW9uIHNsaWRlclNlcnZpY2Uoc2xpZGVySW1nUGF0aENvbnN0YW50KSB7XHJcblx0XHRmdW5jdGlvbiBTbGlkZXIoc2xpZGVySW1hZ2VMaXN0KSB7XHJcblx0XHRcdHRoaXMuX2ltYWdlU3JjTGlzdCA9IHNsaWRlckltYWdlTGlzdDtcclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEltYWdlU3JjTGlzdCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2ltYWdlU3JjTGlzdDtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRDdXJyZW50U2xpZGUgPSBmdW5jdGlvbiAoZ2V0SW5kZXgpIHtcclxuXHRcdFx0cmV0dXJuIGdldEluZGV4ID09IHRydWUgPyB0aGlzLl9jdXJyZW50U2xpZGUgOiB0aGlzLl9pbWFnZVNyY0xpc3RbdGhpcy5fY3VycmVudFNsaWRlXTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRDdXJyZW50U2xpZGUgPSBmdW5jdGlvbiAoc2xpZGUpIHtcclxuXHRcdFx0c2xpZGUgPSBwYXJzZUludChzbGlkZSk7XHJcblxyXG5cdFx0XHRpZiAoIXNsaWRlIHx8IGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7Il19
