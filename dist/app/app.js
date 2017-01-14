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
        preloadServiceProvider.config(backendPathsConstant.gallery, 'GET', 'get', 100, 'warning');
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
			templateUrl: 'app/templates/top/bungalows.html'
		}).state('hotels', {
			url: '/top',
			templateUrl: 'app/templates/top/hotels.html'
		}).state('villas', {
			url: '/villas',
			templateUrl: 'app/templates/top/villas.html'
		}).state('gallery', {
			url: '/gallery',
			templateUrl: 'app/templates/gallery/gallery.html'
		}).state('guestcomments', {
			url: '/guestcomments',
			templateUrl: 'app/templates/guestcomments/guestcomments.html'
		}).state('destinations', {
			url: '/destinations',
			templateUrl: 'app/templates/destinations/destinations.html'
		}).state('resort', {
			url: '/resort',
			templateUrl: 'app/templates/resort/resort.html'
		});
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').run(run);

    run.$inject = ['$rootScope', 'backendPathsConstant', 'preloadService', '$window'];

    function run($rootScope, backendPathsConstant, preloadService, $window) {
        $rootScope.$logged = false;

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

        $window.onload = function () {
            preloadService.preloadImages('gallery', { url: backendPathsConstant.gallery, method: 'GET', action: 'get' }); //todo del method, action by default
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

        this.config = function () {
            var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/api';
            var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'get';
            var action = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'get';
            var timeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
            var log = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'debug';

            config = {
                url: url,
                method: method,
                action: action,
                timeout: timeout,
                log: log
            };
        };

        this.$get = ["$http", "$timeout", function ($http, $timeout) {
            var preloadCache = [],
                logger = function logger(message) {
                var log = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'debug';

                if (config.log === 'silent') {
                    return;
                }

                if (config.log === 'debug' && log === 'debug') {
                    console.debug(message);
                }

                if (log === 'warning') {
                    console.warn(message);
                }
            };

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

                        if (config.timeout === false) {
                            preload(imagesSrcList);
                        } else {
                            //window.onload = preload;
                            $timeout(preload.bind(null, imagesSrcList), config.timeout);
                        }
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
                            logger(this.src, 'debug');
                        };
                        image.onerror = function (e) {
                            console.log(e);
                        };
                    }
                }
            }

            function getPreload(preloadName) {
                logger('preloadService: get request ' + '"' + preloadName + '"', 'debug');
                if (!preloadName) {
                    return preloadCache;
                }

                for (var i = 0; i < preloadCache.length; i++) {
                    if (preloadCache[i].name === preloadName) {
                        return preloadCache[i].src;
                    }
                }

                logger('No preloads found', 'warning');
            }

            return {
                preloadImages: preloadImages,
                getPreloadCache: getPreload
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
        gallery: '/api/gallery',
        guestcomments: '/api/guestcomments'
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

            authService.signIn(this.user).then(function (response) {
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

    authService.$inject = ['$rootScope', '$http', 'backendPathsConstant'];

    function authService($rootScope, $http, backendPathsConstant) {
        //todo errors
        function User(backendApi) {
            var _this = this;

            this._backendApi = backendApi;
            this._credentials = null;

            this._onResolve = function (response) {
                if (response.status === 200) {
                    console.log(response);
                    if (response.data.token) {
                        _this._tokenKeeper.saveToken(response.data.token);
                    }
                    return 'OK';
                }
            };

            this._onRejected = function (response) {
                return response.data;
            };

            this._tokenKeeper = function () {
                var token = null;

                function saveToken(_token) {
                    $rootScope.$logged = true;
                    token = _token;
                    console.debug(token);
                }

                function getToken() {
                    return token;
                }

                function deleteToken() {
                    token = null;
                }

                return {
                    saveToken: saveToken,
                    getToken: getToken,
                    deleteToken: deleteToken
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

        User.prototype.signIn = function (credentials) {
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

        User.prototype.signOut = function () {
            $rootScope.$logged = false;
            this._tokenKeeper.deleteToken();
        };

        User.prototype.getLogInfo = function () {
            return {
                credentials: this._credentials,
                token: this._tokenKeeper.getToken()
            };
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
                    console.log('oops');
                    $timeout(_this.alignImages, 0);
                } else {
                    $timeout(_setImageAligment);
                    $(window).on('resize', _setImageAligment);
                }
            };

            this.alignImages();

            _getImageSources(function (response) {
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
            cb(preloadService.getPreloadCache('gallery'));
        }

        function _setImageAligment() {
            //todo arguments naming, errors
            var figures = $('.gallery__figure');

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

    angular.module('ahotelApp').controller('GuestcommentsController', GuestcommentsController);

    GuestcommentsController.$inject = ['$rootScope', 'guestcommentsService'];

    function GuestcommentsController($rootScope, guestcommentsService) {
        var _this = this;

        this.comments = [];

        this.openForm = false;
        this.showPleaseLogiMessage = false;

        this.writeComment = function () {
            if ($rootScope.$logged) {
                this.openForm = true;
            } else {
                this.showPleaseLogiMessage = true;
            }
        };

        guestcommentsService.getGuestComments().then(function (response) {
            _this.comments = response.data;
            console.log(response);
        });

        this.addComment = function () {
            var _this2 = this;

            guestcommentsService.sendComment(this.formData).then(function (response) {
                _this2.comments.push({ 'name': _this2.formData.name, 'comment': _this2.formData.comment });
                _this2.openForm = false;
                _this2.formData = null;
            });
        };
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').filter('reverse', reverse);

    function reverse() {
        return function (items) {
            //to errors
            return items.slice().reverse();
        };
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').factory('guestcommentsService', guestcommentsService);

    guestcommentsService.$inject = ['$http', 'backendPathsConstant', 'authService'];

    function guestcommentsService($http, backendPathsConstant, authService) {
        return {
            getGuestComments: getGuestComments,
            sendComment: sendComment
        };

        function getGuestComments(type) {
            return $http({
                method: 'GET',
                url: backendPathsConstant.guestcomments,
                params: {
                    action: 'get'
                }
            }).then(onResolve, onReject);
        }

        function onResolve(response) {
            return response;
        }

        function onReject(response) {
            return response;
        }

        function sendComment(comment) {
            var user = authService.getLogInfo();

            return $http({
                method: 'POST',
                url: backendPathsConstant.guestcomments,
                params: {
                    action: 'put'
                },
                data: {
                    user: user,
                    comment: comment
                }
            }).then(onResolve, onReject);

            function onResolve(response) {
                return response;
            }

            function onReject(response) {
                return response;
            }
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').controller('HeaderController', HeaderController);

    HeaderController.$inject = ['authService'];

    function HeaderController(authService) {
        this.signOut = function () {
            authService.signOut();
        };
    }
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').directive('ahtlHeader', ahtlHeader);

	function ahtlHeader() {
		return {
			restrict: 'EAC',
			templateUrl: 'app/templates/header/header.html',
			link: function link() {
				$('[ahtl-autoheight-emit]').on('click', function () {
					$('[ahtl-autoheight-on]').css('height', 'auto');
				});
			}
		};
	}
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').service('HeaderTransitionsService', HeaderTransitionsService);

	HeaderTransitionsService.$inject = ['$timeout'];

	function HeaderTransitionsService($timeout) {
		function UItransitions(container) {
			if (!$(container).length) {
				$log.warn('');
			}

			this.container = $(container);
		}

		UItransitions.prototype.animateTransition = function (targetElementsQuery, _ref) {
			var _ref$cssEnumerableRul = _ref.cssEnumerableRule,
			    cssEnumerableRule = _ref$cssEnumerableRul === undefined ? 'width' : _ref$cssEnumerableRul,
			    _ref$from = _ref.from,
			    from = _ref$from === undefined ? 0 : _ref$from,
			    _ref$to = _ref.to,
			    to = _ref$to === undefined ? 'auto' : _ref$to,
			    _ref$delay = _ref.delay,
			    delay = _ref$delay === undefined ? 100 : _ref$delay;


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

			header.animateTransition('.sub-nasv', {
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