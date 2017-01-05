'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp', ['ui.router', 'preload', 'ngAnimate']);
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').config(config);

    config.$inject = ['preloadServiceProvider', 'backendPathsConstant'];

    function config(preloadServiceProvider, backendPathsConstant) {
        preloadServiceProvider.config(backendPathsConstant.gallery, 'GET', 'get');
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
		}).state('gallery', {
			url: '/gallery',
			templateUrl: 'app/templates/gallery/gallery.html'
		});
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').run(run);

    run.$inject = ['$rootScope', 'backendPathsConstant', 'preloadService'];

    function run($rootScope, backendPathsConstant, preloadService) {
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

        preloadService.preloadImages('gallery', { url: backendPathsConstant.gallery, method: 'GET', action: 'get' });
    }
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').factory('PreloadImages', PreloadImages);

	function PreloadImages() {
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

		return {
			preLoad: preLoad
		};
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('preload', []);
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
    'use strict';

    angular.module('preload').provider('preloadService', preloadService);

    function preloadService() {
        var config = null;

        this.config = function (url, method, action) {
            config = {
                url: url,
                method: method,
                action: action
            };
        };

        this.$get = ["$http", "$timeout", function ($http, $timeout) {
            var preloadCache = [];

            function preloadImages(preloadName, images) {
                //todo errors
                var imagesSrcList = [];

                if (typeof images === 'array') {
                    imagesSrcList = images;

                    preloadCache.push({
                        name: preloadName,
                        src: imagesSrcList
                    });

                    preload(imagesSrcList);
                } else if ((typeof images === 'undefined' ? 'undefined' : _typeof(images)) === 'object') {
                    $http({
                        images: images.method || config.method,
                        url: images.url || config.url,
                        params: {
                            images: images.action || config.action
                        }
                    }).then(function (response) {
                        imagesSrcList = response.data;

                        preloadCache.push({
                            name: preloadName,
                            src: imagesSrcList
                        });

                        $timeout(preload.bind(null, imagesSrcList));
                    }, function (response) {
                        return 'ERROR'; //todo
                    });
                } else {
                        return; //todo
                    }

                function preload(imagesSrcList) {
                    for (var i = 0; i < imagesSrcList.length; i++) {
                        var image = new Image();
                        image.src = imagesSrcList[i];
                        image.onload = function (e) {
                            //resolve(image);
                            console.log(this.src);
                        };
                        image.onerror = function (e) {
                            console.log(e);
                        };
                    }
                }
            }

            function getPreload(preloadName) {
                console.debug('preloadService:getPreload: ', preloadName);
                if (!preloadName) {
                    return preloadCache;
                }

                for (var i = 0; i < preloadCache.length; i++) {
                    if (preloadCache[i].name === preloadName) {
                        return preloadCache[i].src;
                    }
                }

                console.warn('No preloads found');
            }

            return {
                preloadImages: preloadImages,
                getPreload: getPreload
            };
        }];
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').constant('backendPathsConstant', {
        top3: '/api/top3',
        auth: '/api/users',
        gallery: '/api/gallery'
    });
})();
'use strict';

(function () {
    angular.module('ahotelApp').constant('hotelDetailsConstant', ["restaurant", "kids", "pool", "spa", "wifi", "pet", "disable", "beach", "parking", "conditioning", "lounge", "terrace", "garden", "gym", "bicycles"]);
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

    angular.module('ahotelApp').directive('ahtlGallery', ahtlGalleryDirective);

    ahtlGalleryDirective.$inject = ['$http', '$timeout', 'backendPathsConstant', 'preloadService'];

    function ahtlGalleryDirective($http, $timeout, backendPathsConstant, preloadService) {
        //todo not only load but listSrc too accept
        AhtlGalleryController.$inject = ["$scope"];
        return {
            restrict: 'EA',
            scope: {
                showFirstImgCount: '=ahtlGalleryShowFirst',
                showNextImgCount: '=ahtlGalleryShowNext'
            },
            templateUrl: 'app/templates/gallery/gallery.template.html',
            controller: AhtlGalleryController,
            controllerAs: 'gallery',
            link: ahtlGalleryLink
        };

        function AhtlGalleryController($scope) {
            var _this = this;

            var allImagesSrc = [],
                showFirstImgCount = $scope.showFirstImgCount,
                showNextImgCount = $scope.showNextImgCount;

            this.loadMore = function () {
                showFirstImgCount = Math.min(showFirstImgCount + showNextImgCount, allImagesSrc.length);
                this.showFirst = allImagesSrc.slice(0, showFirstImgCount);
                this.isAllImagesLoaded = this.showFirst >= allImagesSrc.length;

                /*$timeout(_setImageAligment, 0);*/
            };

            this.allImagesLoaded = function () {
                return this.showFirst ? this.showFirst.length === this.imagesCount : true;
            };

            this.alignImages = function () {
                if ($('.gallery img').length < showFirstImgCount) {
                    console.log($('.gallery img').length, showFirstImgCount);
                    $timeout(_this.alignImages, 0);
                } else {
                    $timeout(_setImageAligment);
                    $(window).on('resize', _setImageAligment);
                }
            };

            this.alignImages();

            _getImageSources(function (response) {
                console.log(response);
                allImagesSrc = response;
                _this.showFirst = allImagesSrc.slice(0, showFirstImgCount);
                _this.imagesCount = allImagesSrc.length;
                //$timeout(_setImageAligment);
            });
        }

        function ahtlGalleryLink($scope, elem) {
            elem.on('click', function (event) {
                var imgSrc = event.target.src;

                if (imgSrc) {
                    $scope.$root.$broadcast('modalOpen', {
                        show: 'image',
                        src: imgSrc
                    });
                }
            });

            /* var $images = $('.gallery img');
             var loaded_images_count = 0;*/
            /*$scope.alignImages = function() {
                $images.load(function() {
                    loaded_images_count++;
                      if (loaded_images_count == $images.length) {
                        _setImageAligment();
                    }
                });
                //$timeout(_setImageAligment, 0); // todo
            };*/

            //$scope.alignImages();
        }

        function _getImageSources(cb) {
            cb(preloadService.getPreload('gallery'));
        }

        function _setImageAligment() {
            //todo arguments naming, errors
            var figures = $('.gallery__figure');
            console.log(figures);

            var galleryWidth = parseInt(figures.closest('.gallery').css('width')),
                imageWidth = parseInt(figures.css('width'));

            var columnsCount = Math.round(galleryWidth / imageWidth),
                columnsHeight = new Array(columnsCount + 1).join('0').split('').map(function () {
                return 0;
            }),
                //todo del join-split
            currentColumnsHeight = columnsHeight.slice(0),
                columnPointer = 0;

            $(figures).css('margin-top', '0');

            $.each(figures, function (index) {
                currentColumnsHeight[columnPointer] = parseInt($(this).css('height'));

                if (index > columnsCount - 1) {
                    $(this).css('margin-top', -(Math.max.apply(null, columnsHeight) - columnsHeight[columnPointer]) + 'px');
                }

                //currentColumnsHeight[columnPointer] = parseInt($(this).css('height')) + columnsHeight[columnPointer];

                if (columnPointer === columnsCount - 1) {
                    columnPointer = 0;
                    for (var i = 0; i < columnsHeight.length; i++) {
                        columnsHeight[i] += currentColumnsHeight[i];
                    }
                } else {
                    columnPointer++;
                }
            });
        }
    }
})();
/*        .controller('GalleryController', GalleryController);

    GalleryController.$inject = ['$scope'];

    function GalleryController($scope) {
        var imagesSrc = _getImageSources().then((response) => {
            return response
        })

        console.log(imagesSrc)
    }

    function _getImageSources() {
        return $http({
            method: 'GET',
            url: backendPathsConstant.gallery,
            params: {
                action: 'get'
            }
        })
            .then((response) => {
                console.log(1);
                console.log(response);
                return response.data
            },
            (response) => {
                return 'ERROR'; //todo
            });
    }
})();*/

/*
        .directive('ahtlGallery', ahtlGalleryDirective);

    ahtlGalleryDirective.$inject = ['$http', 'backendPathsConstant'];

    function ahtlGalleryDirective($http, backendPathsConstant) {
        return {
            restrict: 'EA',
            scope: {
                showFirst: "=ahtlGalleryShowFirst",
                showAfter: "=ahtlGalleryShowAfter"
            },
            controller: AhtlGalleryController,
            link: function(){}
        };

        function AhtlGalleryController($scope) {
            $scope.a = 13;
            console.log($scope.a);
            /!*var allImagesSrc;

            $scope.showFirstImagesSrc = ['123'];

            _getImageSources().then((response) => {
                //todo
                allImagesSrc = response;
            })*!/
        }


    }
})();*/
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

    angular.module('ahotelApp').directive('ahtlModal', ahtlModalDirective);

    function ahtlModalDirective() {
        return {
            restrict: 'EA',
            replace: false,
            link: ahtlModalDirectiveLink,
            templateUrl: 'app/templates/modal/modal.html'
        };

        function ahtlModalDirectiveLink($scope, elem) {
            $scope.$on('modalOpen', function (event, data) {
                if (data.show === 'image') {
                    $scope.src = data.src;
                    $scope.$apply();
                }

                elem.css('display', 'block');
            });

            $scope.closeDialog = function () {
                elem.css('display', 'none');
            };
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').directive('ahtlTop3', ahtlTop3Directive);

    ahtlTop3Directive.$inject = ['top3Service', 'hotelDetailsConstant'];

    function ahtlTop3Directive(top3Service, hotelDetailsConstant) {

        AhtlTop3Controller.$inject = ["$scope", "$element", "$attrs"];
        return {
            restrict: 'E',
            controller: AhtlTop3Controller,
            controllerAs: 'top3',
            templateUrl: 'app/templates/resorts/top3.template.html'
        };

        function AhtlTop3Controller($scope, $element, $attrs) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5wcmVsb2FkLmpzIiwiYWhvdGVsLnJvdXRlcy5qcyIsImFob3RlbC5ydW4uanMiLCJfcHJlbG9hZEltZy5zZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFsL2JhY2tlbmRQYXRocy5jb25zdGFudC5qcyIsImdsb2JhbC9ob3RlbERldGFpbHMuY29uc3RhbnQuanMiLCJ0ZW1wbGF0ZXMvYXV0aC9hdXRoLmNvbnRyb2xsZXIuanMiLCJ0ZW1wbGF0ZXMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJ0ZW1wbGF0ZXMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvaGVhZGVyVHJhbnNpdGlvbnMuc2VydmljZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvc3Rpa3lIZWFkZXIuZGlyZWN0aXZlLmpzIiwidGVtcGxhdGVzL21vZGFsL21vZGFsLmRpcmVjdGl2ZS5qcyIsInRlbXBsYXRlcy9yZXNvcnRzL3RvcDMuZGlyZWN0aXZlLmpzIiwidGVtcGxhdGVzL3Jlc29ydHMvdG9wMy5zZXJ2aWNlLmpzIiwidGVtcGxhdGVzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmFuaW1hdGlvbi5qcyIsInRlbXBsYXRlcy9oZWFkZXIvc2xpZGVyL3NsaWRlci5kaXJlY3RpdmUuanMiLCJ0ZW1wbGF0ZXMvaGVhZGVyL3NsaWRlci9zbGlkZXIuc2VydmljZS5qcyIsInRlbXBsYXRlcy9oZWFkZXIvc2xpZGVyL3NsaWRlclBhdGguY29uc3RhbnQuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRpbmplY3QiLCJwcmVsb2FkU2VydmljZVByb3ZpZGVyIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCJnYWxsZXJ5IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCJvdGhlcndpc2UiLCJzdGF0ZSIsInVybCIsInRlbXBsYXRlVXJsIiwicGFyYW1zIiwicnVuIiwiJHJvb3RTY29wZSIsInByZWxvYWRTZXJ2aWNlIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwibmFtZSIsInB1c2giLCJwcmVsb2FkSW1hZ2VzIiwibWV0aG9kIiwiYWN0aW9uIiwiZmFjdG9yeSIsIlByZWxvYWRJbWFnZXMiLCJwcmVMb2FkIiwiaW1hZ2VMaXN0IiwicHJvbWlzZXMiLCJsb2FkSW1hZ2UiLCJzcmMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImltYWdlIiwiSW1hZ2UiLCJvbmxvYWQiLCJvbmVycm9yIiwiZSIsImkiLCJsZW5ndGgiLCJhbGwiLCJ0aGVuIiwicmVzdWx0cyIsInByb3ZpZGVyIiwiJGdldCIsIiRodHRwIiwiJHRpbWVvdXQiLCJwcmVsb2FkQ2FjaGUiLCJwcmVsb2FkTmFtZSIsImltYWdlcyIsImltYWdlc1NyY0xpc3QiLCJwcmVsb2FkIiwicmVzcG9uc2UiLCJkYXRhIiwiYmluZCIsImNvbnNvbGUiLCJsb2ciLCJnZXRQcmVsb2FkIiwiZGVidWciLCJ3YXJuIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsImxvZ2luIiwidXNlciIsInByZXZpb3VzU3RhdGUiLCJVc2VyIiwiYmFja2VuZEFwaSIsIl9iYWNrZW5kQXBpIiwiX2NyZWRlbnRpYWxzIiwiX29uUmVzb2x2ZSIsInN0YXR1cyIsInRva2VuIiwidG9rZW5LZWVwZXIiLCJzYXZlVG9rZW4iLCJfb25SZWplY3RlZCIsIl90b2tlbiIsImdldFRva2VuIiwicHJvdG90eXBlIiwiY3JlZGVudGlhbHMiLCJkaXJlY3RpdmUiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZSIsInJlc3RyaWN0Iiwic2NvcGUiLCJzaG93Rmlyc3RJbWdDb3VudCIsInNob3dOZXh0SW1nQ291bnQiLCJBaHRsR2FsbGVyeUNvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCJsaW5rIiwiYWh0bEdhbGxlcnlMaW5rIiwiYWxsSW1hZ2VzU3JjIiwibG9hZE1vcmUiLCJNYXRoIiwibWluIiwic2hvd0ZpcnN0Iiwic2xpY2UiLCJpc0FsbEltYWdlc0xvYWRlZCIsImFsbEltYWdlc0xvYWRlZCIsImltYWdlc0NvdW50IiwiYWxpZ25JbWFnZXMiLCIkIiwiX3NldEltYWdlQWxpZ21lbnQiLCJ3aW5kb3ciLCJvbiIsIl9nZXRJbWFnZVNvdXJjZXMiLCJlbGVtIiwiaW1nU3JjIiwidGFyZ2V0IiwiJHJvb3QiLCIkYnJvYWRjYXN0Iiwic2hvdyIsImNiIiwiZmlndXJlcyIsImdhbGxlcnlXaWR0aCIsInBhcnNlSW50IiwiY2xvc2VzdCIsImNzcyIsImltYWdlV2lkdGgiLCJjb2x1bW5zQ291bnQiLCJyb3VuZCIsImNvbHVtbnNIZWlnaHQiLCJBcnJheSIsImpvaW4iLCJzcGxpdCIsIm1hcCIsImN1cnJlbnRDb2x1bW5zSGVpZ2h0IiwiY29sdW1uUG9pbnRlciIsImVhY2giLCJpbmRleCIsIm1heCIsImFwcGx5IiwiYWh0bEhlYWRlciIsInNlcnZpY2UiLCJIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UiLCJVSXRyYW5zaXRpb25zIiwiY29udGFpbmVyUXVlcnkiLCJjb250YWluZXIiLCJlbGVtZW50VHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwiZmluZCIsInRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGUiLCJhbmltYXRlT3B0aW9ucyIsImFuaW1hdGUiLCJIZWFkZXJUcmFuc2l0aW9ucyIsImhlYWRlclF1ZXJ5IiwiaGVhZGVyIiwiY2FsbCIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiZml4SGVhZGVyRWxlbWVudCIsIl9maXhFbGVtZW50IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJzY3JvbGxUb3AiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsIm9uTWF4V2luZG93V2lkdGgiLCJvZmYiLCJzY3JvbGwiLCJhaHRsU3Rpa3lIZWFkZXIiLCJ0cmFuc2NsdWRlIiwiYWh0bE1vZGFsRGlyZWN0aXZlIiwicmVwbGFjZSIsImFodGxNb2RhbERpcmVjdGl2ZUxpbmsiLCIkYXBwbHkiLCJjbG9zZURpYWxvZyIsImFodGxUb3AzRGlyZWN0aXZlIiwidG9wM1NlcnZpY2UiLCJob3RlbERldGFpbHNDb25zdGFudCIsIkFodGxUb3AzQ29udHJvbGxlciIsIiRlbGVtZW50IiwiJGF0dHJzIiwiZGV0YWlscyIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJpbWciLCJmaWxlbmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbCIsIml0ZW0iLCJkZXRhaWwiLCJkZXRhaWxDbGFzc05hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUiLCJnZXRUb3AzUGxhY2VzIiwidHlwZSIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0IiwiYW5pbWF0aW9uIiwiYW5pbWF0aW9uRnVuY3Rpb24iLCJiZWZvcmVBZGRDbGFzcyIsImVsZW1lbnQiLCJjbGFzc05hbWUiLCJkb25lIiwic2xpZGluZ0RpcmVjdGlvbiIsImFodGxTbGlkZXIiLCJzbGlkZXJTZXJ2aWNlIiwiYWh0bFNsaWRlckNvbnRyb2xsZXIiLCJzbGlkZXIiLCJuZXh0U2xpZGUiLCJwcmV2U2xpZGUiLCJzZXRTbGlkZSIsInNldE5leHRTbGlkZSIsInNldFByZXZTbGlkZSIsImdldEN1cnJlbnRTbGlkZSIsInNldEN1cnJlbnRTbGlkZSIsImZpeElFOHBuZ0JsYWNrQmciLCJhcnJvd3MiLCJjbGljayIsImRpc2FibGVkIiwic2xpZGVySW1nUGF0aENvbnN0YW50IiwiU2xpZGVyIiwic2xpZGVySW1hZ2VMaXN0IiwiX2ltYWdlU3JjTGlzdCIsIl9jdXJyZW50U2xpZGUiLCJnZXRJbWFnZVNyY0xpc3QiLCJnZXRJbmRleCIsInNsaWRlIiwiaXNOYU4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBQSxRQUNLQyxPQUFPLGFBQWEsQ0FBQyxhQUFhLFdBQVc7S0FKdEQ7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUQsUUFDS0MsT0FBTyxhQUNQQyxPQUFPQTs7SUFFWkEsT0FBT0MsVUFBVSxDQUFDLDBCQUEwQjs7SUFFNUMsU0FBU0QsT0FBT0Usd0JBQXdCQyxzQkFBc0I7UUFDdERELHVCQUF1QkYsT0FBT0cscUJBQXFCQyxTQUFTLE9BQU87O0tBVi9FO0FDQUE7O0FBQUEsQ0FBQyxZQUFXO0NBQ1g7O0NBRUFOLFFBQVFDLE9BQU8sYUFDYkMsT0FBT0E7O0NBRVRBLE9BQU9DLFVBQVUsQ0FBQyxrQkFBa0I7O0NBRXBDLFNBQVNELE9BQU9LLGdCQUFnQkMsb0JBQW9CO0VBQ25EQSxtQkFBbUJDLFVBQVU7O0VBRTdCRixlQUNFRyxNQUFNLFFBQVE7R0FDZEMsS0FBSztHQUNMQyxhQUFhO0tBRWJGLE1BQU0sUUFBUTtHQUNkQyxLQUFLO0dBQ0xDLGFBQWE7R0FDYkMsUUFBUSxFQUFDLFFBQVE7Ozs7S0FLakJILE1BQU0sYUFBYTtHQUNuQkMsS0FBSztHQUNMQyxhQUFhO0tBRWJGLE1BQU0sVUFBVTtHQUNmQyxL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QVMsSUFBSyxLQUFLeU0sZ0JBQWdCLElBQUksS0FBS0E7O0dBRXZGLEtBQUtWOzs7RUFHTk8sT0FBT3BKLFVBQVU0SSxlQUFlLFlBQVk7R0FDMUMsS0FBS1csa0JBQWtCLElBQUssS0FBS0EsZ0JBQWdCLEtBQUtELGNBQWN4TSxTQUFTLElBQUksS0FBS3lNOztHQUV2RixLQUFLVjs7O0VBR04sT0FBTyxJQUFJTyxPQUFPRDs7S0E3Q3BCO0FDQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFuUCxRQUNLQyxPQUFPLGFBQ1BrRSxTQUFTLHlCQUF5QixDQUMvQixvQ0FDQSxvQ0FDQTtLQVJaIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJywgWyd1aS5yb3V0ZXInLCAncHJlbG9hZCcsICduZ0FuaW1hdGUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoY29uZmlnKTtcclxuXHJcbiAgICBjb25maWcuJGluamVjdCA9IFsncHJlbG9hZFNlcnZpY2VQcm92aWRlcicsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbmZpZyhwcmVsb2FkU2VydmljZVByb3ZpZGVyLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICBwcmVsb2FkU2VydmljZVByb3ZpZGVyLmNvbmZpZyhiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCAnR0VUJywgJ2dldCcpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9ob21lL2hvbWUuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdhdXRoJywge1xyXG5cdFx0XHRcdHVybDogJy9hdXRoJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvYXV0aC9hdXRoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeyd0eXBlJzogJ2xvZ2luJ30vKixcclxuXHRcdFx0XHRvbkVudGVyOiBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xyXG5cdFx0XHRcdFx0JHJvb3RTY29wZS4kc3RhdGUgPSBcImF1dGhcIjtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL3Jlc29ydHMvYnVuZ2Fsb3dzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnaG90ZWxzJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL2hvdGVscycsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvcmVzb3J0cy9ob3RlbHMuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3ZpbGxhcycsIHtcclxuXHRcdFx0XHR1cmw6ICcvdmlsbGFzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvcmVzb3J0cy92aWxsYXMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdnYWxsZXJ5Jywge1xyXG5cdFx0XHRcdHVybDogJy9nYWxsZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvZ2FsbGVyeS9nYWxsZXJ5Lmh0bWwnXHJcblx0XHRcdH0pO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLnJ1bihydW4pO1xyXG5cclxuICAgIHJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJyAsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdwcmVsb2FkU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bigkcm9vdFNjb3BlLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgcHJlbG9hZFNlcnZpY2UpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JyxcclxuICAgICAgICAgICAgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLyosIGZyb21TdGF0ZSwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuY3VycmVudFN0YXRlTmFtZSA9IHRvU3RhdGUubmFtZTtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZVBhcmFtcyA9IHRvUGFyYW1zO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHByZWxvYWRTZXJ2aWNlLnByZWxvYWRJbWFnZXMoJ2dhbGxlcnknLCB7dXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCBtZXRob2Q6ICdHRVQnLCBhY3Rpb246ICdnZXQnfSk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdQcmVsb2FkSW1hZ2VzJyxQcmVsb2FkSW1hZ2VzKTtcclxuXHJcblx0ZnVuY3Rpb24gUHJlbG9hZEltYWdlcygpIHtcclxuXHRcdGZ1bmN0aW9uIHByZUxvYWQoaW1hZ2VMaXN0KSB7XHJcblxyXG5cdFx0XHR2YXIgcHJvbWlzZXMgPSBbXTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIGxvYWRJbWFnZShzcmMpIHtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRcdFx0dmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcblx0XHRcdFx0XHRpbWFnZS5zcmMgPSBzcmM7XHJcblx0XHRcdFx0XHRpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUoaW1hZ2UpO1xyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRcdFx0XHRyZWplY3QoZSk7XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlTGlzdC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHByb21pc2VzLnB1c2gobG9hZEltYWdlKGltYWdlTGlzdFtpXSkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0cztcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHByZUxvYWQ6IHByZUxvYWRcclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3ByZWxvYWQnLCBbXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwcmVsb2FkJylcclxuICAgICAgICAucHJvdmlkZXIoJ3ByZWxvYWRTZXJ2aWNlJywgcHJlbG9hZFNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHByZWxvYWRTZXJ2aWNlKCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGZ1bmN0aW9uKHVybCwgbWV0aG9kLCBhY3Rpb24pIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCRodHRwLCAkdGltZW91dCkge1xyXG4gICAgICAgICAgICBsZXQgcHJlbG9hZENhY2hlID0gW107XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkSW1hZ2VzKHByZWxvYWROYW1lLCBpbWFnZXMpIHsgLy90b2RvIGVycm9yc1xyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlc1NyY0xpc3QgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ2FycmF5Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlc1NyY0xpc3QgPSBpbWFnZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRDYWNoZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VzU3JjTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkKGltYWdlc1NyY0xpc3QpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW1hZ2VzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzOiBpbWFnZXMubWV0aG9kIHx8IGNvbmZpZy5tZXRob2QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogaW1hZ2VzLnVybCB8fCBjb25maWcudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLmFjdGlvbiB8fCBjb25maWcuYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlc1NyY0xpc3QgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWRDYWNoZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVsb2FkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHByZWxvYWQuYmluZChudWxsLCBpbWFnZXNTcmNMaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvL3RvZG9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkKGltYWdlc1NyY0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlc1NyY0xpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IGltYWdlc1NyY0xpc3RbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc29sdmUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zcmMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRQcmVsb2FkKHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdwcmVsb2FkU2VydmljZTpnZXRQcmVsb2FkOiAnLCBwcmVsb2FkTmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWxvYWRDYWNoZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkQ2FjaGVbaV0ubmFtZSA9PT0gcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZVtpXS5zcmNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBwcmVsb2FkcyBmb3VuZCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcHJlbG9hZEltYWdlczogcHJlbG9hZEltYWdlcyxcclxuICAgICAgICAgICAgICAgIGdldFByZWxvYWQ6IGdldFByZWxvYWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHRvcDM6ICcvYXBpL3RvcDMnLFxyXG4gICAgICAgICAgICBhdXRoOiAnL2FwaS91c2VycycsXHJcbiAgICAgICAgICAgIGdhbGxlcnk6ICcvYXBpL2dhbGxlcnknXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnaG90ZWxEZXRhaWxzQ29uc3RhbnQnLCBbXHJcbiAgICAgICAgICAgIFwicmVzdGF1cmFudFwiLFxyXG4gICAgICAgICAgICBcImtpZHNcIixcclxuICAgICAgICAgICAgXCJwb29sXCIsXHJcbiAgICAgICAgICAgIFwic3BhXCIsXHJcbiAgICAgICAgICAgIFwid2lmaVwiLFxyXG4gICAgICAgICAgICBcInBldFwiLFxyXG4gICAgICAgICAgICBcImRpc2FibGVcIixcclxuICAgICAgICAgICAgXCJiZWFjaFwiLFxyXG4gICAgICAgICAgICBcInBhcmtpbmdcIixcclxuICAgICAgICAgICAgXCJjb25kaXRpb25pbmdcIixcclxuICAgICAgICAgICAgXCJsb3VuZ2VcIixcclxuICAgICAgICAgICAgXCJ0ZXJyYWNlXCIsXHJcbiAgICAgICAgICAgIFwiZ2FyZGVuXCIsXHJcbiAgICAgICAgICAgIFwiZ3ltXCIsXHJcbiAgICAgICAgICAgIFwiYmljeWNsZXNcIlxyXG4gICAgICAgIF0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBBdXRoQ29udHJvbGxlcik7XHJcblxyXG4gICAgQXV0aENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckc2NvcGUnLCAnYXV0aFNlcnZpY2UnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0aENvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHNjb3BlLCBhdXRoU2VydmljZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzID0ge1xyXG4gICAgICAgICAgICB1c2VyQWxyZWFkeUV4aXN0czogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvZ2luT3JQYXNzd29yZEluY29ycmVjdDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2UuY3JlYXRlVXNlcih0aGlzLm5ld1VzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2F1dGgnLCB7J3R5cGUnOiAnbG9naW4nfSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMudXNlckFscmVhZHlFeGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmZvcm1Kb2luKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdVc2VyKTsqL1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9naW5Vc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmxvZ2luKHRoaXMudXNlcilcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gJ09LJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmV2aW91c1N0YXRlID0gJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5WyRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeS5sZW5ndGggLSAyXSB8fCAnaG9tZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHByZXZpb3VzU3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28ocHJldmlvdXNTdGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMubG9naW5PclBhc3N3b3JkSW5jb3JyZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ2F1dGhTZXJ2aWNlJywgYXV0aFNlcnZpY2UpO1xyXG5cclxuICAgIGF1dGhTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0b2tlbktlZXBlciA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0b2tlbiA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2F2ZVRva2VuKF90b2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gX3Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVUb2tlbjogc2F2ZVRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGdldFRva2VuOiBnZXRUb2tlblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5sb2dpbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICckdGltZW91dCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdwcmVsb2FkU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCAkdGltZW91dCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlKSB7IC8vdG9kbyBub3Qgb25seSBsb2FkIGJ1dCBsaXN0U3JjIHRvbyBhY2NlcHRcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd0ZpcnN0JyxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93TmV4dCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL2dhbGxlcnkvZ2FsbGVyeS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsSW1hZ2VzU3JjID0gW10sXHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9ICRzY29wZS5zaG93Rmlyc3RJbWdDb3VudCxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQgPSAkc2NvcGUuc2hvd05leHRJbWdDb3VudDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gTWF0aC5taW4oc2hvd0ZpcnN0SW1nQ291bnQgKyBzaG93TmV4dEltZ0NvdW50LCBhbGxJbWFnZXNTcmMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBbGxJbWFnZXNMb2FkZWQgPSB0aGlzLnNob3dGaXJzdCA+PSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyovXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsbEltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob3dGaXJzdCkgPyB0aGlzLnNob3dGaXJzdC5sZW5ndGggPT09IHRoaXMuaW1hZ2VzQ291bnQ6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmdhbGxlcnkgaW1nJykubGVuZ3RoIDwgc2hvd0ZpcnN0SW1nQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkKCcuZ2FsbGVyeSBpbWcnKS5sZW5ndGgsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dCh0aGlzLmFsaWduSW1hZ2VzLCAwKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsaWduSW1hZ2VzKCk7XHJcblxyXG4gICAgICAgICAgICBfZ2V0SW1hZ2VTb3VyY2VzKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgYWxsSW1hZ2VzU3JjID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dGaXJzdCA9IGFsbEltYWdlc1NyYy5zbGljZSgwLCBzaG93Rmlyc3RJbWdDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc0NvdW50ID0gYWxsSW1hZ2VzU3JjLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIC8vJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBlbGVtLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltZ1NyYyA9IGV2ZW50LnRhcmdldC5zcmM7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGltZ1NyYykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1nU3JjXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAvKiB2YXIgJGltYWdlcyA9ICQoJy5nYWxsZXJ5IGltZycpO1xyXG4gICAgICAgICAgICB2YXIgbG9hZGVkX2ltYWdlc19jb3VudCA9IDA7Ki9cclxuICAgICAgICAgICAgLyokc2NvcGUuYWxpZ25JbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRpbWFnZXMubG9hZChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRfaW1hZ2VzX2NvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkZWRfaW1hZ2VzX2NvdW50ID09ICRpbWFnZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRJbWFnZUFsaWdtZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50LCAwKTsgLy8gdG9kb1xyXG4gICAgICAgICAgICB9OyovXHJcblxyXG4gICAgICAgICAgICAvLyRzY29wZS5hbGlnbkltYWdlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcyhjYikge1xyXG4gICAgICAgICAgICBjYihwcmVsb2FkU2VydmljZS5nZXRQcmVsb2FkKCdnYWxsZXJ5JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3NldEltYWdlQWxpZ21lbnQoKSB7IC8vdG9kbyBhcmd1bWVudHMgbmFtaW5nLCBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ3VyZXMgPSAkKCcuZ2FsbGVyeV9fZmlndXJlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmaWd1cmVzKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FsbGVyeVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jbG9zZXN0KCcuZ2FsbGVyeScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY3NzKCd3aWR0aCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uc0NvdW50ID0gTWF0aC5yb3VuZChnYWxsZXJ5V2lkdGggLyBpbWFnZVdpZHRoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0ID0gbmV3IEFycmF5KGNvbHVtbnNDb3VudCArIDEpLmpvaW4oJzAnKS5zcGxpdCgnJykubWFwKCgpID0+IHtyZXR1cm4gMH0pLCAvL3RvZG8gZGVsIGpvaW4tc3BsaXRcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodCA9IGNvbHVtbnNIZWlnaHQuc2xpY2UoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgJChmaWd1cmVzKS5jc3MoJ21hcmdpbi10b3AnLCAnMCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChmaWd1cmVzLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnbWFyZ2luLXRvcCcsIC0oTWF0aC5tYXguYXBwbHkobnVsbCwgY29sdW1uc0hlaWdodCkgLSBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSkgKyBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uUG9pbnRlciA9PT0gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zSGVpZ2h0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0W2ldICs9IGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuLyogICAgICAgIC5jb250cm9sbGVyKCdHYWxsZXJ5Q29udHJvbGxlcicsIEdhbGxlcnlDb250cm9sbGVyKTtcclxuXHJcbiAgICBHYWxsZXJ5Q29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICB2YXIgaW1hZ2VzU3JjID0gX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGltYWdlc1NyYylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyovXHJcblxyXG4vKlxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3Q6IFwiPWFodGxHYWxsZXJ5U2hvd0ZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG93QWZ0ZXI6IFwiPWFodGxHYWxsZXJ5U2hvd0FmdGVyXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigpe31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hID0gMTM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5hKTtcclxuICAgICAgICAgICAgLyEqdmFyIGFsbEltYWdlc1NyYztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5zaG93Rmlyc3RJbWFnZXNTcmMgPSBbJzEyMyddO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG9cclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KSohL1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsSGVhZGVyJyxhaHRsSGVhZGVyKVxyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90ZW1wbGF0ZXMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5zZXJ2aWNlKCdIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpO1xyXG5cclxuXHRIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCR0aW1lb3V0KSB7XHJcblx0XHRmdW5jdGlvbiBVSXRyYW5zaXRpb25zKGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdC8vdG9kbyBlcnJvcnNcclxuXHRcdFx0dGhpcy5jb250YWluZXIgPSAkKGNvbnRhaW5lclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5lbGVtZW50VHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50c1F1ZXJ5LFxyXG5cdFx0XHR7Y3NzRW51bWVyYWJsZVJ1bGUgPSAnd2lkdGgnLCBmcm9tID0gMCwgdG8gPSAnYXV0bycsIGRlbGF5ID0gMTAwfSkge1xyXG5cdFx0XHQvL3RvZG8gZXJyb3JzXHJcblx0XHRcdHRoaXMuY29udGFpbmVyLm1vdXNlZW50ZXIoXHJcblx0XHRcdFx0ZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0dmFyIHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSwgdG8pO1xyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSA9IHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSk7XHJcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRcdGxldCBhbmltYXRlT3B0aW9ucyA9IHt9O1xyXG5cdFx0XHRcdFx0YW5pbWF0ZU9wdGlvbnNbY3NzRW51bWVyYWJsZVJ1bGVdID0gdGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9ucyhoZWFkZXJRdWVyeSwgY29udGFpbmVyUXVlcnkpIHtcclxuXHRcdFx0dGhpcy5oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdFx0VUl0cmFuc2l0aW9ucy5jYWxsKHRoaXMsIGNvbnRhaW5lclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKF9maXhFbGVtZW50LCBmaXhDbGFzc05hbWUsIHVuZml4Q2xhc3NOYW1lLCBvcHRpb25zKSB7XHJcblx0XHRcdGxldCBzZWxmID0gdGhpcztcclxuXHRcdFx0bGV0IGZpeEVsZW1lbnQgPSAkKF9maXhFbGVtZW50KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCkge1xyXG5cdFx0XHRcdGxldCB0aW1lcjtcclxuXHJcblx0XHRcdFx0ZnVuY3Rpb24gZml4VW5maXhNZW51T25TY3JvbGwoKSB7XHJcblx0XHRcdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gb3B0aW9ucy5vbk1pblNjcm9sbHRvcCkge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LmFkZENsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKCQod2luZG93KS53aWR0aCgpIDwgb3B0aW9ucy5vbk1heFdpbmRvd1dpZHRoKSB7XHJcblx0XHRcdFx0XHRmaXhVbmZpeE1lbnVPblNjcm9sbCgpO1xyXG5cdFx0XHRcdFx0c2VsZi5oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5oZWFkZXIucmVtb3ZlQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0Zml4RWxlbWVudC5yZW1vdmVDbGFzcyhmaXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLm9mZignc2Nyb2xsJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRvbldpZHRoQ2hhbmdlSGFuZGxlcigpO1xyXG5cdFx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIEhlYWRlclRyYW5zaXRpb25zO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFN0aWt5SGVhZGVyJyxhaHRsU3Rpa3lIZWFkZXIpXHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0ZnVuY3Rpb24gbGluaygpIHtcclxuXHRcdFx0bGV0IGhlYWRlciA9IG5ldyBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJy5sLWhlYWRlcicsICcubmF2X19pdGVtLWNvbnRhaW5lcicpO1xyXG5cclxuXHRcdFx0aGVhZGVyLmVsZW1lbnRUcmFuc2l0aW9uKFxyXG5cdFx0XHRcdCcuc3ViLW5hdicsIHtcclxuXHRcdFx0XHRcdGNzc0VudW1lcmFibGVSdWxlOiAnaGVpZ2h0JyxcclxuXHRcdFx0XHRcdGRlbGF5OiAzMDBcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRoZWFkZXIuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHQnLm5hdicsXHJcblx0XHRcdFx0J2pzX25hdi0tZml4ZWQnLFxyXG5cdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRvbk1pblNjcm9sbHRvcDogODgsXHJcblx0XHRcdFx0XHRvbk1heFdpbmRvd1dpZHRoOiA4NTBcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0dHJhbnNjbHVkZTogZmFsc2UsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxNb2RhbCcsIGFodGxNb2RhbERpcmVjdGl2ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgbGluazogYWh0bE1vZGFsRGlyZWN0aXZlTGluayxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvdGVtcGxhdGVzL21vZGFsL21vZGFsLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignbW9kYWxPcGVuJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdpbWFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3JjID0gZGF0YS5zcmM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlRGlhbG9nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxUb3AzJywgYWh0bFRvcDNEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxUb3AzRGlyZWN0aXZlLiRpbmplY3QgPSBbJ3RvcDNTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFRvcDNEaXJlY3RpdmUodG9wM1NlcnZpY2UsIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxUb3AzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndG9wMycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9yZXNvcnRzL3RvcDMudGVtcGxhdGUuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsVG9wM0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWlscyA9IGhvdGVsRGV0YWlsc0NvbnN0YW50O1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydFR5cGUgPSAkYXR0cnMuYWh0bFRvcDN0eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEltZ1NyYyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9pbWFnZXMvJyArIHRoaXMucmVzb3J0VHlwZSArICcvJyArIHRoaXMucmVzb3J0W2luZGV4XS5pbWcuZmlsZW5hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNSZXNvcnRJbmNsdWRlRGV0YWlsID0gZnVuY3Rpb24oaXRlbSwgZGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0YWlsQ2xhc3NOYW1lID0gJ3RvcDNfX2RldGFpbC1jb250YWluZXItLScgKyBkZXRhaWwsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lID0gIWl0ZW0uZGV0YWlsc1tkZXRhaWxdID8gJyB0b3AzX19kZXRhaWwtY29udGFpbmVyLS1oYXMnIDogJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFpbENsYXNzTmFtZSArIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdG9wM1NlcnZpY2UuZ2V0VG9wM1BsYWNlcyh0aGlzLnJlc29ydFR5cGUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5yZXNvcnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCd0b3AzU2VydmljZScsIHRvcDNTZXJ2aWNlKTtcclxuXHJcbiAgICB0b3AzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvcDNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvcDNQbGFjZXM6IGdldFRvcDNQbGFjZXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUb3AzUGxhY2VzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LnRvcDMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuYW5pbWF0aW9uKCcuc2xpZGVyX19pbWcnLGFuaW1hdGlvbkZ1bmN0aW9uKVxyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7IC8vd2h5IDIwMD8gJClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHRhZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZSkge1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzAnKTtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnbGVmdCcsICcwJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxTbGlkZXInLGFodGxTbGlkZXIpO1xyXG5cclxuXHRhaHRsU2xpZGVyLiRpbmplY3QgPSBbJ3NsaWRlclNlcnZpY2UnLCAnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFNsaWRlcihzbGlkZXJTZXJ2aWNlLCAkdGltZW91dCkge1xyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0dHJhbnNjbHVkZTogZmFsc2UsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0Y29udHJvbGxlcjogYWh0bFNsaWRlckNvbnRyb2xsZXIsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RlbXBsYXRlcy9oZWFkZXIvc2xpZGVyL3NsaWRlci5odG1sJyxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKCFzbGlkZSB8fCBpc05hTihzbGlkZSkgfHwgc2xpZGUgPCAwIHx8IHNsaWRlID4gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IHNsaWRlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldE5leHRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpID8gdGhpcy5fY3VycmVudFNsaWRlID0gMCA6IHRoaXMuX2N1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRQcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IDApID8gdGhpcy5fY3VycmVudFNsaWRlID0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEgOiB0aGlzLl9jdXJyZW50U2xpZGUtLTtcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBuZXcgU2xpZGVyKHNsaWRlckltZ1BhdGhDb25zdGFudCk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3NsaWRlckltZ1BhdGhDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjEuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjIuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjMuanBnJ1xyXG4gICAgICAgIF0pO1xyXG59KSgpOyJdfQ==
