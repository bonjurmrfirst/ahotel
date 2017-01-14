'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp', ['ui.router', 'preload', 'ngAnimate']);
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').config(["$provide", function ($provide) {
        $provide.decorator('$log', ["$delegate", "$window", function ($delegate, $window) {
            var logHistory = {
                warn: [],
                err: []
            };

            $delegate.log = function (message) {};

            var _logWarn = $delegate.warn;
            $delegate.warn = function (message) {
                logHistory.warn.push(message);
                _logWarn.apply(null, [message]);
            };

            var _logErr = $delegate.error;
            $delegate.error = function (message) {
                logHistory.err.push({ name: message, stack: new Error().stack });
                _logErr.apply(null, [message]);
            };

            (function sendOnUnload() {
                $window.onbeforeunload = function () {
                    if (!logHistory.err.length && !logHistory.warn.length) {
                        return;
                    }

                    var xhr = new XMLHttpRequest();
                    xhr.open('post', '/api/log', false);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send(JSON.stringify(logHistory));
                };
            })();

            return $delegate;
        }]);
    }]);
})();

/*
        .factory('log', log);

    log.$inject = ['$window', '$log'];

    function log($window, $log) {


        function warn(...args) {
            logHistory.warn.push(args);

            if (browserLog) {
                $log.warn(args);
            }
        }

        function error(e) {
            logHistory.err.push({
                name: e.name,
                message: e.message,
                stack: e.stack
            });
            $log.error(e);
        }

        //todo all errors



        return {
            warn: warn,
            error: error,
            sendOnUnload: sendOnUnload
        }
    }
})();*/
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
			templateUrl: 'app/partials/home/home.html'
		}).state('auth', {
			url: '/auth',
			templateUrl: 'app/partials/auth/auth.html',
			params: { 'type': 'login' } /*,
                               onEnter: function ($rootScope) {
                               $rootScope.$state = "auth";
                               }*/
		}).state('bungalows', {
			url: '/bungalows',
			templateUrl: 'app/partials/top/bungalows.html'
		}).state('hotels', {
			url: '/top',
			templateUrl: 'app/partials/top/hotels.html'
		}).state('villas', {
			url: '/villas',
			templateUrl: 'app/partials/top/villas.html'
		}).state('gallery', {
			url: '/gallery',
			templateUrl: 'app/partials/gallery/gallery.html'
		}).state('guestcomments', {
			url: '/guestcomments',
			templateUrl: 'app/partials/guestcomments/guestcomments.html'
		}).state('destinations', {
			url: '/destinations',
			templateUrl: 'app/partials/destinations/destinations.html'
		}).state('resort', {
			url: '/resort',
			templateUrl: 'app/partials/resort/resort.html'
		});
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').run(run);

    run.$inject = ['$rootScope', 'backendPathsConstant', 'preloadService', '$window'];

    function run($rootScope, backendPathsConstant, preloadService, $window, log) {
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
            //todo onload �������� � ������
            preloadService.preloadImages('gallery', { url: backendPathsConstant.gallery, method: 'GET', action: 'get' }); //todo del method, action by default
        };

        //log.sendOnUnload();
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
        guestcomments: '/api/guestcomments',
        hotels: '/api/hotels'
    });
})();
'use strict';

(function () {
    angular.module('ahotelApp').constant('hotelDetailsConstant', {
        types: ['Hotel', 'Bungalow', 'Villa'],

        settings: ['Coast', 'City', 'Desert'],

        locations: ['Namibia', 'Libya', 'South Africa', 'Tanzania', 'Papua New Guinea', 'Reunion', 'Swaziland', 'Sao Tome', 'Madagascar', 'Mauritius', 'Seychelles', 'Mayotte', 'Ukraine'],

        guests: {
            max: 5
        },

        mustHave: ['restaurant', 'kids', 'pool', 'spa', 'wifi', 'pet', 'disable', 'beach', 'parking', 'conditioning', 'lounge', 'terrace', 'garden', 'gym', 'bicycles'],

        activitys: ['Cooking classes', 'Cycling', 'Fishing', 'Golf', 'Hiking', 'Horse-riding', 'Kayaking', 'Nightlife', 'Sailing', 'Scuba diving', 'Shopping / markets', 'Snorkelling', 'Skiing', 'Surfing', 'Wildlife', 'Windsurfing', 'Wine tasting', 'Yoga']
    });
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
            templateUrl: 'app/partials/gallery/gallery.template.html',
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
			templateUrl: 'app/partials/header/header.html'
		};
	}
})();
'use strict';

(function () {
	'use strict';

	angular.module('ahotelApp').service('HeaderTransitionsService', HeaderTransitionsService);

	HeaderTransitionsService.$inject = ['$timeout', '$log'];

	function HeaderTransitionsService($timeout, $log) {
		function UItransitions(container) {
			if (!$(container).length) {
				$log.warn('Element \'' + container + '\' not found');
				this._container = null;
				return;
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


			if (this._container === null) {
				return this;
			}

			this.container.mouseenter(function () {
				var targetElements = $(this).find(targetElementsQuery),
				    targetElementsFinishState = void 0;

				if (!targetElements.length) {
					$log.warn('Element(s) ' + targetElementsQuery + ' not found');
					return;
				}

				targetElements.css(cssEnumerableRule, to);
				targetElementsFinishState = targetElements.css(cssEnumerableRule);
				targetElements.css(cssEnumerableRule, from);

				var animateOptions = {};
				animateOptions[cssEnumerableRule] = targetElementsFinishState;

				targetElements.animate(animateOptions, delay);
			});

			return this;
		};

		UItransitions.prototype.recalculateHeightOnClick = function (elementTriggerQuery, elementOnQuery) {
			if (!$(elementTriggerQuery).length || !$(elementOnQuery).length) {
				$log.warn('Element(s) ' + elementTriggerQuery + ' ' + elementOnQuery + ' not found');
				return;
			}

			$(elementTriggerQuery).on('click', function () {
				$(elementOnQuery).css('height', 'auto');
			});

			return this;
		};

		function HeaderTransitions(headerQuery, containerQuery) {
			UItransitions.call(this, containerQuery);

			if (!$(headerQuery).length) {
				$log.warn('Element(s) ' + headerQuery + ' not found');
				this._header = null;
				return;
			}

			this._header = $(headerQuery);
		}

		HeaderTransitions.prototype = Object.create(UItransitions.prototype);
		HeaderTransitions.prototype.constructor = HeaderTransitions;

		HeaderTransitions.prototype.fixHeaderElement = function (elementFixQuery, fixClassName, unfixClassName, options) {
			if (this._header === null) {
				return;
			}

			var self = this;
			var fixElement = $(elementFixQuery);

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

				var width = window.innerWidth || $(window).innerWidth();

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

			return this;
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
		return {
			restrict: 'A',
			scope: {},
			link: link
		};

		function link() {
			var header = new HeaderTransitionsService('.l-header', '.nav__item-container');

			header.animateTransition('.sub-nav', {
				cssEnumerableRule: 'height',
				delay: 300 }).recalculateHeightOnClick('[data-autoheight-trigger]', '[data-autoheight-on]').fixHeaderElement('.nav', 'js_nav--fixed', 'js_l-header--relative', {
				onMinScrolltop: 88,
				onMaxWindowWidth: 850 });
		}
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').controller('HomeController', HomeController);

    HomeController.$inject = ['trendHotelsImgPaths'];

    function HomeController(trendHotelsImgPaths) {
        this.hotels = trendHotelsImgPaths;
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').constant('trendHotelsImgPaths', [{
        name: 'Hotel1',
        src: 'assets/images/home/trend6.jpg'
    }, {
        name: 'Hotel2',
        src: 'assets/images/home/trend6.jpg'
    }, {
        name: 'Hotel3',
        src: 'assets/images/home/trend6.jpg'
    }, {
        name: 'Hotel4',
        src: 'assets/images/home/trend6.jpg'
    }, {
        name: 'Hotel5',
        src: 'assets/images/home/trend6.jpg'
    }, {
        name: 'Hotel6',
        src: 'assets/images/home/trend6.jpg'
    }]);
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
            templateUrl: 'app/partials/modal/modal.html'
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

    angular.module('ahotelApp').controller('ResortController', ResortController);

    ResortController.$inject = ['hotelDetailsConstant', 'resortService'];

    function ResortController(hotelDetailsConstant, resortService) {
        var _this = this;

        this.loading = true;

        this.renderFiltersList = hotelDetailsConstant;

        this.filters = {};
        this.filters.price = {
            min: 0,
            max: 1000
        };

        resortService.getResort(function (response) {
            _this.loading = false;
        });
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').factory('resortService', resortService);

    resortService.$inject = ['$http', 'backendPathsConstant'];

    function resortService($http, backendPathsConstant) {
        return {
            getResort: getResort
        };

        function getResort() {
            return $http({
                method: 'GET',
                url: backendPathsConstant.hotels
            }).then(onResolve, onRejected);

            function onResolve(response) {
                console.log(response);
            }

            function onRejected(response) {
                console.log(response);
            }
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
            templateUrl: 'app/partials/top/top3.template.html'
        };

        function AhtlTop3Controller($scope, $element, $attrs) {
            var _this = this;

            this.details = hotelDetailsConstant.mustHave;
            this.resortType = $attrs.ahtlTop3type;
            this.resort = null;

            this.getImgSrc = function (index) {
                return 'assets/images/' + this.resortType + '/' + this.resort[index].img.filename;
            };

            this.isResortIncludeDetail = function (item, detail) {
                var detailClassName = 'top3__detail-container--' + detail,
                    isResortIncludeDetailClassName = !item.details[detail] ? ' top3__detail-container--hasnt' : '';

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
					$(element).animate({ 'left': '-200%' }, 500, done); //200? $)
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
		return {
			restrict: 'EA',
			scope: {},
			controller: ahtlSliderController,
			templateUrl: 'app/partials/header/slider/slider.html',
			link: link
		};

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

			if (isNaN(slide) || slide < 0 || slide > this._imageSrcList.length - 1) {
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
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').directive('ahtlPriceSlider', priceSliderDirective);

    priceSliderDirective.$inject = [];

    function priceSliderDirective() {
        return {
            scope: { //todo@=
                min: "=min",
                max: "=max"
            },
            restrict: 'E',
            templateUrl: 'app/partials/resort/priceSlider/priceSlider.html',
            link: priceSliderDirectiveLink
        };

        function priceSliderDirectiveLink($scope, elem, attrs) {
            var rightBtn = $('.slide__pointer--right'),
                leftBtn = $('.slide__pointer--left');

            initDrag(rightBtn, parseInt(rightBtn.css('left')), function () {
                return parseInt($('.slide').css('width'));
            }, function () {
                return parseInt(leftBtn.css('left'));
            });

            initDrag(leftBtn, parseInt(leftBtn.css('left')), function () {
                return parseInt(rightBtn.css('left'));
            }, function () {
                return 0;
            });

            function initDrag(dragElem, initPosition, maxPosition, minPosition) {
                var shift = void 0;

                dragElem.on('mousedown', btnOnMouseDown);

                function btnOnMouseDown(event) {
                    shift = event.pageX;
                    initPosition = parseInt(dragElem.css('left'));

                    $(document).on('mousemove', docOnMouseMove);
                    dragElem.on('mouseup', btnOnMouseUp);
                    $(document).on('mouseup', btnOnMouseUp);
                }

                function docOnMouseMove(event) {
                    if (initPosition + event.pageX - shift >= minPosition() + 20 && initPosition + event.pageX - shift <= maxPosition() - 20) {
                        dragElem.css('left', initPosition + event.pageX - shift);
                    }
                }

                function btnOnMouseUp() {
                    $(document).off('mousemove', docOnMouseMove);
                    dragElem.off('mouseup', btnOnMouseUp);
                    $(document).off('mouseup', btnOnMouseUp);

                    initPosition = parseInt(dragElem.css('left'));
                }

                dragElem.on('dragstart', function () {
                    return false;
                });
            }
        }
    }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuZmlsdGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmF1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlclRyYW5zaXRpb25zLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc3Rpa3lIZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaG9tZS9ob21lLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ob21lL2hvbWUudHJlbmRIb3RlbHNJbWdQYXRocy5qcyIsInBhcnRpYWxzL21vZGFsL21vZGFsLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuc2VydmljZS5qcyIsInBhcnRpYWxzL3RvcC90b3AzLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3RvcC90b3AzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5hbmltYXRpb24uanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXJQYXRoLmNvbnN0YW50LmpzIiwicGFydGlhbHMvcmVzb3J0L3ByaWNlU2xpZGVyL3ByaWNlU2xpZGVyLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJHByb3ZpZGUiLCJkZWNvcmF0b3IiLCIkZGVsZWdhdGUiLCIkd2luZG93IiwibG9nSGlzdG9yeSIsIndhcm4iLCJlcnIiLCJsb2ciLCJtZXNzYWdlIiwiX2xvZ1dhcm4iLCJwdXNoIiwiYXBwbHkiLCJfbG9nRXJyIiwiZXJyb3IiLCJuYW1lIiwic3RhY2siLCJFcnJvciIsInNlbmRPblVubG9hZCIsIm9uYmVmb3JldW5sb2FkIiwibGVuZ3RoIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5IiwiJGluamVjdCIsInByZWxvYWRTZXJ2aWNlUHJvdmlkZXIiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsImdhbGxlcnkiLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJydW4iLCIkcm9vdFNjb3BlIiwicHJlbG9hZFNlcnZpY2UiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwib25sb2FkIiwicHJlbG9hZEltYWdlcyIsIm1ldGhvZCIsImFjdGlvbiIsInByb3ZpZGVyIiwidGltZW91dCIsIiRnZXQiLCIkaHR0cCIsIiR0aW1lb3V0IiwicHJlbG9hZENhY2hlIiwibG9nZ2VyIiwiY29uc29sZSIsImRlYnVnIiwicHJlbG9hZE5hbWUiLCJpbWFnZXMiLCJpbWFnZXNTcmNMaXN0Iiwic3JjIiwicHJlbG9hZCIsInRoZW4iLCJyZXNwb25zZSIsImRhdGEiLCJiaW5kIiwiaSIsImltYWdlIiwiSW1hZ2UiLCJlIiwib25lcnJvciIsImdldFByZWxvYWQiLCJnZXRQcmVsb2FkQ2FjaGUiLCJjb25zdGFudCIsInRvcDMiLCJhdXRoIiwiZ3Vlc3Rjb21tZW50cyIsImhvdGVscyIsInR5cGVzIiwic2V0dGluZ3MiLCJsb2NhdGlvbnMiLCJndWVzdHMiLCJtYXgiLCJtdXN0SGF2ZSIsImFjdGl2aXR5cyIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsInNpZ25JbiIsInVzZXIiLCJwcmV2aW91c1N0YXRlIiwiZmFjdG9yeSIsIlVzZXIiLCJiYWNrZW5kQXBpIiwiX2JhY2tlbmRBcGkiLCJfY3JlZGVudGlhbHMiLCJfb25SZXNvbHZlIiwic3RhdHVzIiwidG9rZW4iLCJfdG9rZW5LZWVwZXIiLCJzYXZlVG9rZW4iLCJfb25SZWplY3RlZCIsIl90b2tlbiIsImdldFRva2VuIiwiZGVsZXRlVG9rZW4iLCJwcm90b3R5cGUiLCJjcmVkZW50aWFscyIsInNpZ25PdXQiLCJnZXRMb2dJbmZvIiwiZGlyZWN0aXZlIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmUiLCJyZXN0cmljdCIsInNjb3BlIiwic2hvd0ZpcnN0SW1nQ291bnQiLCJzaG93TmV4dEltZ0NvdW50IiwiQWh0bEdhbGxlcnlDb250cm9sbGVyIiwiY29udHJvbGxlckFzIiwibGluayIsImFodGxHYWxsZXJ5TGluayIsImFsbEltYWdlc1NyYyIsImxvYWRNb3JlIiwiTWF0aCIsIm1pbiIsInNob3dGaXJzdCIsInNsaWNlIiwiaXNBbGxJbWFnZXNMb2FkZWQiLCJhbGxJbWFnZXNMb2FkZWQiLCJpbWFnZXNDb3VudCIsImFsaWduSW1hZ2VzIiwiJCIsIl9zZXRJbWFnZUFsaWdtZW50Iiwid2luZG93Iiwib24iLCJfZ2V0SW1hZ2VTb3VyY2VzIiwiZWxlbSIsImltZ1NyYyIsInRhcmdldCIsIiRyb290IiwiJGJyb2FkY2FzdCIsInNob3ciLCJjYiIsImZpZ3VyZXMiLCJnYWxsZXJ5V2lkdGgiLCJwYXJzZUludCIsImNsb3Nlc3QiLCJjc3MiLCJpbWFnZVdpZHRoIiwiY29sdW1uc0NvdW50Iiwicm91bmQiLCJjb2x1bW5zSGVpZ2h0IiwiQXJyYXkiLCJqb2luIiwic3BsaXQiLCJtYXAiLCJjdXJyZW50Q29sdW1uc0hlaWdodCIsImNvbHVtblBvaW50ZXIiLCJlYWNoIiwiaW5kZXgiLCJHdWVzdGNvbW1lbnRzQ29udHJvbGxlciIsImd1ZXN0Y29tbWVudHNTZXJ2aWNlIiwiY29tbWVudHMiLCJvcGVuRm9ybSIsInNob3dQbGVhc2VMb2dpTWVzc2FnZSIsIndyaXRlQ29tbWVudCIsImdldEd1ZXN0Q29tbWVudHMiLCJhZGRDb21tZW50Iiwic2VuZENvbW1lbnQiLCJmb3JtRGF0YSIsImNvbW1lbnQiLCJmaWx0ZXIiLCJyZXZlcnNlIiwiaXRlbXMiLCJ0eXBlIiwib25SZXNvbHZlIiwib25SZWplY3QiLCJIZWFkZXJDb250cm9sbGVyIiwiYWh0bEhlYWRlciIsInNlcnZpY2UiLCJIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UiLCIkbG9nIiwiVUl0cmFuc2l0aW9ucyIsImNvbnRhaW5lciIsIl9jb250YWluZXIiLCJhbmltYXRlVHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwiZmluZCIsInRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGUiLCJhbmltYXRlT3B0aW9ucyIsImFuaW1hdGUiLCJyZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2siLCJlbGVtZW50VHJpZ2dlclF1ZXJ5IiwiZWxlbWVudE9uUXVlcnkiLCJIZWFkZXJUcmFuc2l0aW9ucyIsImhlYWRlclF1ZXJ5IiwiY29udGFpbmVyUXVlcnkiLCJjYWxsIiwiX2hlYWRlciIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiZml4SGVhZGVyRWxlbWVudCIsImVsZW1lbnRGaXhRdWVyeSIsImZpeENsYXNzTmFtZSIsInVuZml4Q2xhc3NOYW1lIiwib3B0aW9ucyIsInNlbGYiLCJmaXhFbGVtZW50Iiwib25XaWR0aENoYW5nZUhhbmRsZXIiLCJ0aW1lciIsImZpeFVuZml4TWVudU9uU2Nyb2xsIiwic2Nyb2xsVG9wIiwib25NaW5TY3JvbGx0b3AiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwid2lkdGgiLCJpbm5lcldpZHRoIiwib25NYXhXaW5kb3dXaWR0aCIsIm9mZiIsInNjcm9sbCIsImFodGxTdGlreUhlYWRlciIsImhlYWRlciIsIkhvbWVDb250cm9sbGVyIiwidHJlbmRIb3RlbHNJbWdQYXRocyIsImFodGxNb2RhbERpcmVjdGl2ZSIsInJlcGxhY2UiLCJhaHRsTW9kYWxEaXJlY3RpdmVMaW5rIiwiJGFwcGx5IiwiY2xvc2VEaWFsb2ciLCJSZXNvcnRDb250cm9sbGVyIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCJyZXNvcnRTZXJ2aWNlIiwibG9hZGluZyIsInJlbmRlckZpbHRlcnNMaXN0IiwiZmlsdGVycyIsInByaWNlIiwiZ2V0UmVzb3J0Iiwib25SZWplY3RlZCIsImFodGxUb3AzRGlyZWN0aXZlIiwidG9wM1NlcnZpY2UiLCJBaHRsVG9wM0NvbnRyb2xsZXIiLCIkZWxlbWVudCIsIiRhdHRycyIsImRldGFpbHMiLCJyZXNvcnRUeXBlIiwiYWh0bFRvcDN0eXBlIiwicmVzb3J0IiwiZ2V0SW1nU3JjIiwiaW1nIiwiZmlsZW5hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWwiLCJpdGVtIiwiZGV0YWlsIiwiZGV0YWlsQ2xhc3NOYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lIiwiZ2V0VG9wM1BsYWNlcyIsImFuaW1hdGlvbiIsImFuaW1hdGlvbkZ1bmN0aW9uIiwiYmVmb3JlQWRkQ2xhc3MiLCJlbGVtZW50IiwiY2xhc3NOYW1lIiwiZG9uZSIsInNsaWRpbmdEaXJlY3Rpb24iLCJhaHRsU2xpZGVyIiwic2xpZGVyU2VydmljZSIsImFodGxTbGlkZXJDb250cm9sbGVyIiwic2xpZGVyIiwibmV4dFNsaWRlIiwicHJldlNsaWRlIiwic2V0U2xpZGUiLCJzZXROZXh0U2xpZGUiLCJzZXRQcmV2U2xpZGUiLCJnZXRDdXJyZW50U2xpZGUiLCJzZXRDdXJyZW50U2xpZGUiLCJmaXhJRThwbmdCbGFja0JnIiwiYXJyb3dzIiwiY2xpY2siLCJkaXNhYmxlZCIsInNsaWRlckltZ1BhdGhDb25zdGFudCIsIlNsaWRlciIsInNsaWRlckltYWdlTGlzdCIsIl9pbWFnZVNyY0xpc3QiLCJfY3VycmVudFNsaWRlIiwiZ2V0SW1hZ2VTcmNMaXN0IiwiZ2V0SW5kZXgiLCJzbGlkZSIsImlzTmFOIiwicHJpY2VTbGlkZXJEaXJlY3RpdmUiLCJwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsiLCJhdHRycyIsInJpZ2h0QnRuIiwibGVmdEJ0biIsImluaXREcmFnIiwiZHJhZ0VsZW0iLCJpbml0UG9zaXRpb24iLCJtYXhQb3NpdGlvbiIsIm1pblBvc2l0aW9uIiwic2hpZnQiLCJidG5Pbk1vdXNlRG93biIsInBhZ2VYIiwiZG9jdW1lbnQiLCJkb2NPbk1vdXNlTW92ZSIsImJ0bk9uTW91c2VVcCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFBLFFBQ0tDLE9BQU8sYUFBYSxDQUFDLGFBQWEsV0FBVztLQUp0RDtBQ0FBOztBQUFBLENBQUMs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QUFHLGFBQWE4SztvQkFDNUJSLFNBQVN0SyxHQUFHLFdBQVcrSztvQkFDdkJsTCxFQUFFZ0wsVUFBVTdLLEdBQUcsV0FBVytLOzs7Z0JBRzlCLFNBQVNELGVBQWVqUixPQUFPO29CQUMzQixJQUFJMFEsZUFBZTFRLE1BQU0rUSxRQUFRRixTQUFTRCxnQkFBZ0IsTUFDdERGLGVBQWUxUSxNQUFNK1EsUUFBUUYsU0FBU0YsZ0JBQWdCLElBQUk7d0JBQzFERixTQUFTekosSUFBSSxRQUFRMEosZUFBZTFRLE1BQU0rUSxRQUFRRjs7OztnQkFJMUQsU0FBU0ssZUFBZTtvQkFDcEJsTCxFQUFFZ0wsVUFBVWxGLElBQUksYUFBYW1GO29CQUM3QlIsU0FBUzNFLElBQUksV0FBV29GO29CQUN4QmxMLEVBQUVnTCxVQUFVbEYsSUFBSSxXQUFXb0Y7O29CQUUzQlIsZUFBZTVKLFNBQVMySixTQUFTekosSUFBSTs7O2dCQUd6Q3lKLFNBQVN0SyxHQUFHLGFBQWEsWUFBTTtvQkFDM0IsT0FBTzs7Ozs7S0FsRTNCIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJywgWyd1aS5yb3V0ZXInLCAncHJlbG9hZCcsICduZ0FuaW1hdGUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24gKCRwcm92aWRlKSB7XHJcbiAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcignJGxvZycsIGZ1bmN0aW9uICgkZGVsZWdhdGUsICR3aW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsb2dIaXN0b3J5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmxvZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nV2FybiA9ICRkZWxlZ2F0ZS53YXJuO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLndhcm4gPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dXYXJuLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nRXJyID0gJGRlbGVnYXRlLmVycm9yO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmVycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtuYW1lOiBtZXNzYWdlLCBzdGFjazogbmV3IEVycm9yKCkuc3RhY2t9KTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nRXJyLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiBzZW5kT25VbmxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2dIaXN0b3J5LmVyci5sZW5ndGggJiYgIWxvZ0hpc3Rvcnkud2Fybi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKCdwb3N0JywgJy9hcGkvbG9nJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkobG9nSGlzdG9yeSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkZGVsZWdhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpO1xyXG5cclxuLypcclxuICAgICAgICAuZmFjdG9yeSgnbG9nJywgbG9nKTtcclxuXHJcbiAgICBsb2cuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbG9nKCR3aW5kb3csICRsb2cpIHtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHdhcm4oLi4uYXJncykge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChhcmdzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChicm93c2VyTG9nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKGUpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICBzdGFjazogZS5zdGFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJGxvZy5lcnJvcihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdG9kbyBhbGwgZXJyb3JzXHJcblxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2Fybjogd2FybixcclxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgICAgICAgICBzZW5kT25VbmxvYWQ6IHNlbmRPblVubG9hZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhjb25maWcpO1xyXG5cclxuICAgIGNvbmZpZy4kaW5qZWN0ID0gWydwcmVsb2FkU2VydmljZVByb3ZpZGVyJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gY29uZmlnKHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIuY29uZmlnKGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksICdHRVQnLCAnZ2V0JywgMTAwLCAnd2FybmluZycpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2F1dGgvYXV0aC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsndHlwZSc6ICdsb2dpbid9LyosXHJcblx0XHRcdFx0b25FbnRlcjogZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcclxuXHRcdFx0XHRcdCRyb290U2NvcGUuJHN0YXRlID0gXCJhdXRoXCI7XHJcblx0XHRcdFx0fSovXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYnVuZ2Fsb3dzJywge1xyXG5cdFx0XHRcdHVybDogJy9idW5nYWxvd3MnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9idW5nYWxvd3MuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdob3RlbHMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvdG9wJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9ob3RlbHMuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3ZpbGxhcycsIHtcclxuXHRcdFx0XHR1cmw6ICcvdmlsbGFzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdmlsbGFzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ2FsbGVyeScsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ2FsbGVyeScsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5Lmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ3Vlc3Rjb21tZW50cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ3Vlc3Rjb21tZW50cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZGVzdGluYXRpb25zJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL2Rlc3RpbmF0aW9ucycsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9kZXN0aW5hdGlvbnMvZGVzdGluYXRpb25zLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgncmVzb3J0Jywge1xyXG5cdFx0XHRcdHVybDogJy9yZXNvcnQnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaHRtbCdcclxuXHRcdFx0fSk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAucnVuKHJ1bik7XHJcblxyXG4gICAgcnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnICwgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJywgJyR3aW5kb3cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlLCAkd2luZG93LCBsb2cpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZU5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZVBhcmFtczogbnVsbCxcclxuICAgICAgICAgICAgc3RhdGVIaXN0b3J5OiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcy8qLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMgdG9kbyovKXtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZU5hbWUgPSB0b1N0YXRlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeS5wdXNoKHRvU3RhdGUubmFtZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvL3RvZG8gb25sb2FkIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vSDvv70g77+977+977+977+977+977+9XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlLnByZWxvYWRJbWFnZXMoJ2dhbGxlcnknLCB7dXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCBtZXRob2Q6ICdHRVQnLCBhY3Rpb246ICdnZXQnfSk7IC8vdG9kbyBkZWwgbWV0aG9kLCBhY3Rpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vbG9nLnNlbmRPblVubG9hZCgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncHJlbG9hZCcsIFtdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3ByZWxvYWQnKVxyXG4gICAgICAgIC5wcm92aWRlcigncHJlbG9hZFNlcnZpY2UnLCBwcmVsb2FkU2VydmljZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcHJlbG9hZFNlcnZpY2UoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gZnVuY3Rpb24odXJsID0gJy9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcclxuICAgICAgICAgICAgICAgIGxvZzogbG9nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCRodHRwLCAkdGltZW91dCkge1xyXG4gICAgICAgICAgICBsZXQgcHJlbG9hZENhY2hlID0gW10sXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIgPSBmdW5jdGlvbihtZXNzYWdlLCBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdzaWxlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnZGVidWcnICYmIGxvZyA9PT0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvZyA9PT0gJ3dhcm5pbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZEltYWdlcyhwcmVsb2FkTmFtZSwgaW1hZ2VzKSB7IC8vdG9kbyBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZXNTcmNMaXN0ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdhcnJheScpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gaW1hZ2VzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLm1ldGhvZCB8fCBjb25maWcubWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGltYWdlcy51cmwgfHwgY29uZmlnLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5hY3Rpb24gfHwgY29uZmlnLmFjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnRpbWVvdXQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cub25sb2FkID0gcHJlbG9hZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChwcmVsb2FkLmJpbmQobnVsbCwgaW1hZ2VzU3JjTGlzdCksIGNvbmZpZy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzU3JjTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2VzU3JjTGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzb2x2ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIodGhpcy5zcmMsICdkZWJ1ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRQcmVsb2FkKHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ3ByZWxvYWRTZXJ2aWNlOiBnZXQgcmVxdWVzdCAnICsgJ1wiJyArIHByZWxvYWROYW1lICsgJ1wiJywgJ2RlYnVnJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWxvYWRDYWNoZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkQ2FjaGVbaV0ubmFtZSA9PT0gcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZVtpXS5zcmNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdObyBwcmVsb2FkcyBmb3VuZCcsICd3YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwcmVsb2FkSW1hZ2VzOiBwcmVsb2FkSW1hZ2VzLFxyXG4gICAgICAgICAgICAgICAgZ2V0UHJlbG9hZENhY2hlOiBnZXRQcmVsb2FkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2JhY2tlbmRQYXRoc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0b3AzOiAnL2FwaS90b3AzJyxcclxuICAgICAgICAgICAgYXV0aDogJy9hcGkvdXNlcnMnLFxyXG4gICAgICAgICAgICBnYWxsZXJ5OiAnL2FwaS9nYWxsZXJ5JyxcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50czogJy9hcGkvZ3Vlc3Rjb21tZW50cycsXHJcbiAgICAgICAgICAgIGhvdGVsczogJy9hcGkvaG90ZWxzJ1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2hvdGVsRGV0YWlsc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0eXBlczogW1xyXG4gICAgICAgICAgICAgICAgJ0hvdGVsJyxcclxuICAgICAgICAgICAgICAgICdCdW5nYWxvdycsXHJcbiAgICAgICAgICAgICAgICAnVmlsbGEnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nczogW1xyXG4gICAgICAgICAgICAgICAgJ0NvYXN0JyxcclxuICAgICAgICAgICAgICAgICdDaXR5JyxcclxuICAgICAgICAgICAgICAgICdEZXNlcnQnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICdOYW1pYmlhJyxcclxuICAgICAgICAgICAgICAgICdMaWJ5YScsXHJcbiAgICAgICAgICAgICAgICAnU291dGggQWZyaWNhJyxcclxuICAgICAgICAgICAgICAgICdUYW56YW5pYScsXHJcbiAgICAgICAgICAgICAgICAnUGFwdWEgTmV3IEd1aW5lYScsXHJcbiAgICAgICAgICAgICAgICAnUmV1bmlvbicsXHJcbiAgICAgICAgICAgICAgICAnU3dhemlsYW5kJyxcclxuICAgICAgICAgICAgICAgICdTYW8gVG9tZScsXHJcbiAgICAgICAgICAgICAgICAnTWFkYWdhc2NhcicsXHJcbiAgICAgICAgICAgICAgICAnTWF1cml0aXVzJyxcclxuICAgICAgICAgICAgICAgICdTZXljaGVsbGVzJyxcclxuICAgICAgICAgICAgICAgICdNYXlvdHRlJyxcclxuICAgICAgICAgICAgICAgICdVa3JhaW5lJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgZ3Vlc3RzOiB7XHJcbiAgICAgICAgICAgICAgICBtYXg6IDVcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG11c3RIYXZlOiBbXHJcbiAgICAgICAgICAgICAgICAncmVzdGF1cmFudCcsXHJcbiAgICAgICAgICAgICAgICAna2lkcycsXHJcbiAgICAgICAgICAgICAgICAncG9vbCcsXHJcbiAgICAgICAgICAgICAgICAnc3BhJyxcclxuICAgICAgICAgICAgICAgICd3aWZpJyxcclxuICAgICAgICAgICAgICAgICdwZXQnLFxyXG4gICAgICAgICAgICAgICAgJ2Rpc2FibGUnLFxyXG4gICAgICAgICAgICAgICAgJ2JlYWNoJyxcclxuICAgICAgICAgICAgICAgICdwYXJraW5nJyxcclxuICAgICAgICAgICAgICAgICdjb25kaXRpb25pbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2xvdW5nZScsXHJcbiAgICAgICAgICAgICAgICAndGVycmFjZScsXHJcbiAgICAgICAgICAgICAgICAnZ2FyZGVuJyxcclxuICAgICAgICAgICAgICAgICdneW0nLFxyXG4gICAgICAgICAgICAgICAgJ2JpY3ljbGVzJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgYWN0aXZpdHlzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29va2luZyBjbGFzc2VzJyxcclxuICAgICAgICAgICAgICAgICdDeWNsaW5nJyxcclxuICAgICAgICAgICAgICAgICdGaXNoaW5nJyxcclxuICAgICAgICAgICAgICAgICdHb2xmJyxcclxuICAgICAgICAgICAgICAgICdIaWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0hvcnNlLXJpZGluZycsXHJcbiAgICAgICAgICAgICAgICAnS2F5YWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ05pZ2h0bGlmZScsXHJcbiAgICAgICAgICAgICAgICAnU2FpbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2N1YmEgZGl2aW5nJyxcclxuICAgICAgICAgICAgICAgICdTaG9wcGluZyAvIG1hcmtldHMnLFxyXG4gICAgICAgICAgICAgICAgJ1Nub3JrZWxsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTa2lpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1N1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbGRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdXaW5kc3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2luZSB0YXN0aW5nJyxcclxuICAgICAgICAgICAgICAgICdZb2dhJyBcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBBdXRoQ29udHJvbGxlcik7XHJcblxyXG4gICAgQXV0aENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckc2NvcGUnLCAnYXV0aFNlcnZpY2UnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0aENvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHNjb3BlLCBhdXRoU2VydmljZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzID0ge1xyXG4gICAgICAgICAgICB1c2VyQWxyZWFkeUV4aXN0czogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvZ2luT3JQYXNzd29yZEluY29ycmVjdDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2UuY3JlYXRlVXNlcih0aGlzLm5ld1VzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2F1dGgnLCB7J3R5cGUnOiAnbG9naW4nfSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMudXNlckFscmVhZHlFeGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmZvcm1Kb2luKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdVc2VyKTsqL1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9naW5Vc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25Jbih0aGlzLnVzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJldmlvdXNTdGF0ZSA9ICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeVskcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkubGVuZ3RoIC0gMl0gfHwgJ2hvbWUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwcmV2aW91c1N0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKHByZXZpb3VzU3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLmxvZ2luT3JQYXNzd29yZEluY29ycmVjdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdhdXRoU2VydmljZScsIGF1dGhTZXJ2aWNlKTtcclxuXHJcbiAgICBhdXRoU2VydmljZS4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYXV0aFNlcnZpY2UoJHJvb3RTY29wZSwgJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgLy90b2RvIGVycm9yc1xyXG4gICAgICAgIGZ1bmN0aW9uIFVzZXIoYmFja2VuZEFwaSkge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZW5kQXBpID0gYmFja2VuZEFwaTtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZXNvbHZlID0gKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEudG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuc2F2ZVRva2VuKHJlc3BvbnNlLmRhdGEudG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ09LJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZWplY3RlZCA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9rZW4gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNhdmVUb2tlbihfdG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gX3Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcodG9rZW4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0VG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRlbGV0ZVRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVUb2tlbjogc2F2ZVRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGdldFRva2VuOiBnZXRUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVUb2tlbjogZGVsZXRlVG9rZW5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbkluID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBjcmVkZW50aWFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLl9jcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5zaWduT3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlci5kZWxldGVUb2tlbigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmdldExvZ0luZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB0aGlzLl9jcmVkZW50aWFscyxcclxuICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLl90b2tlbktlZXBlci5nZXRUb2tlbigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFVzZXIoYmFja2VuZFBhdGhzQ29uc3RhbnQuYXV0aCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICAgICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnJHRpbWVvdXQnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAncHJlbG9hZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsICR0aW1lb3V0LCBiYWNrZW5kUGF0aHNDb25zdGFudCwgcHJlbG9hZFNlcnZpY2UpIHsgLy90b2RvIG5vdCBvbmx5IGxvYWQgYnV0IGxpc3RTcmMgdG9vIGFjY2VwdFxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd0ZpcnN0JyxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93TmV4dCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LnRlbXBsYXRlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIGxldCBhbGxJbWFnZXNTcmMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gJHNjb3BlLnNob3dGaXJzdEltZ0NvdW50LFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudCA9ICRzY29wZS5zaG93TmV4dEltZ0NvdW50O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSBNYXRoLm1pbihzaG93Rmlyc3RJbWdDb3VudCArIHNob3dOZXh0SW1nQ291bnQsIGFsbEltYWdlc1NyYy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0FsbEltYWdlc0xvYWRlZCA9IHRoaXMuc2hvd0ZpcnN0ID49IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgLyokdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7Ki9cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsSW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvd0ZpcnN0KSA/IHRoaXMuc2hvd0ZpcnN0Lmxlbmd0aCA9PT0gdGhpcy5pbWFnZXNDb3VudDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuZ2FsbGVyeSBpbWcnKS5sZW5ndGggPCBzaG93Rmlyc3RJbWdDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvb3BzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQodGhpcy5hbGlnbkltYWdlcywgMClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcygpO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNDb3VudCA9IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5TGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbS5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdTcmMgPSBldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgLyogdmFyICRpbWFnZXMgPSAkKCcuZ2FsbGVyeSBpbWcnKTtcclxuICAgICAgICAgICAgdmFyIGxvYWRlZF9pbWFnZXNfY291bnQgPSAwOyovXHJcbiAgICAgICAgICAgIC8qJHNjb3BlLmFsaWduSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkX2ltYWdlc19jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkX2ltYWdlc19jb3VudCA9PSAkaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0SW1hZ2VBbGlnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7IC8vIHRvZG9cclxuICAgICAgICAgICAgfTsqL1xyXG5cclxuICAgICAgICAgICAgLy8kc2NvcGUuYWxpZ25JbWFnZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoY2IpIHtcclxuICAgICAgICAgICAgY2IocHJlbG9hZFNlcnZpY2UuZ2V0UHJlbG9hZENhY2hlKCdnYWxsZXJ5JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3NldEltYWdlQWxpZ21lbnQoKSB7IC8vdG9kbyBhcmd1bWVudHMgbmFtaW5nLCBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ3VyZXMgPSAkKCcuZ2FsbGVyeV9fZmlndXJlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FsbGVyeVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jbG9zZXN0KCcuZ2FsbGVyeScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY3NzKCd3aWR0aCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uc0NvdW50ID0gTWF0aC5yb3VuZChnYWxsZXJ5V2lkdGggLyBpbWFnZVdpZHRoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0ID0gbmV3IEFycmF5KGNvbHVtbnNDb3VudCArIDEpLmpvaW4oJzAnKS5zcGxpdCgnJykubWFwKCgpID0+IHtyZXR1cm4gMH0pLCAvL3RvZG8gZGVsIGpvaW4tc3BsaXRcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodCA9IGNvbHVtbnNIZWlnaHQuc2xpY2UoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgJChmaWd1cmVzKS5jc3MoJ21hcmdpbi10b3AnLCAnMCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChmaWd1cmVzLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnbWFyZ2luLXRvcCcsIC0oTWF0aC5tYXguYXBwbHkobnVsbCwgY29sdW1uc0hlaWdodCkgLSBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSkgKyBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uUG9pbnRlciA9PT0gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zSGVpZ2h0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0W2ldICs9IGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuLyogICAgICAgIC5jb250cm9sbGVyKCdHYWxsZXJ5Q29udHJvbGxlcicsIEdhbGxlcnlDb250cm9sbGVyKTtcclxuXHJcbiAgICBHYWxsZXJ5Q29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICB2YXIgaW1hZ2VzU3JjID0gX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGltYWdlc1NyYylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyovXHJcblxyXG4vKlxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3Q6IFwiPWFodGxHYWxsZXJ5U2hvd0ZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG93QWZ0ZXI6IFwiPWFodGxHYWxsZXJ5U2hvd0FmdGVyXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigpe31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hID0gMTM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5hKTtcclxuICAgICAgICAgICAgLyEqdmFyIGFsbEltYWdlc1NyYztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5zaG93Rmlyc3RJbWFnZXNTcmMgPSBbJzEyMyddO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG9cclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KSohL1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXInLCBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcik7XHJcblxyXG4gICAgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICdndWVzdGNvbW1lbnRzU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKCRyb290U2NvcGUsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy53cml0ZUNvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJGxvZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLmdldEd1ZXN0Q29tbWVudHMoKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLnNlbmRDb21tZW50KHRoaXMuZm9ybURhdGEpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2goeyduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lLCAnY29tbWVudCc6IHRoaXMuZm9ybURhdGEuY29tbWVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1EYXRhID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcigncmV2ZXJzZScsIHJldmVyc2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJldmVyc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIC8vdG8gZXJyb3JzXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtcy5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdndWVzdGNvbW1lbnRzU2VydmljZScsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKTtcclxuXHJcbiAgICBndWVzdGNvbW1lbnRzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRHdWVzdENvbW1lbnRzOiBnZXRHdWVzdENvbW1lbnRzLFxyXG4gICAgICAgICAgICBzZW5kQ29tbWVudDogc2VuZENvbW1lbnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRHdWVzdENvbW1lbnRzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbW1lbnQoY29tbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF1dGhTZXJ2aWNlLmdldExvZ0luZm8oKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlcixcclxuICAgICAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTtcclxuXHJcbiAgICBIZWFkZXJDb250cm9sbGVyLiRpbmplY3QgPSBbJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcihhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2lnbk91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbk91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsIGFodGxIZWFkZXIpO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9nJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgkdGltZW91dCwgJGxvZykge1xyXG5cdFx0ZnVuY3Rpb24gVUl0cmFuc2l0aW9ucyhjb250YWluZXIpIHtcclxuXHRcdFx0aWYgKCEkKGNvbnRhaW5lcikubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50ICcke2NvbnRhaW5lcn0nIG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmFuaW1hdGVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fY29udGFpbmVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bGV0IHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRFbGVtZW50cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke3RhcmdldEVsZW1lbnRzUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIHRvKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRsZXQgYW5pbWF0ZU9wdGlvbnMgPSB7fTtcclxuXHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayA9IGZ1bmN0aW9uKGVsZW1lbnRUcmlnZ2VyUXVlcnksIGVsZW1lbnRPblF1ZXJ5KSB7XHJcblx0XHRcdGlmICghJChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5sZW5ndGggfHwgISQoZWxlbWVudE9uUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2VsZW1lbnRUcmlnZ2VyUXVlcnl9ICR7ZWxlbWVudE9uUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWxlbWVudE9uUXVlcnkpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnMoaGVhZGVyUXVlcnksIGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdFVJdHJhbnNpdGlvbnMuY2FsbCh0aGlzLCBjb250YWluZXJRdWVyeSk7XHJcblxyXG5cdFx0XHRpZiAoISQoaGVhZGVyUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2hlYWRlclF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnRGaXhRdWVyeSwgZml4Q2xhc3NOYW1lLCB1bmZpeENsYXNzTmFtZSwgb3B0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5faGVhZGVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBmaXhFbGVtZW50ID0gJChlbGVtZW50Rml4UXVlcnkpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykuaW5uZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLnJlbW92ZUNsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b25XaWR0aENoYW5nZUhhbmRsZXIoKTtcclxuXHRcdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBvbldpZHRoQ2hhbmdlSGFuZGxlcik7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcik7XHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoKSB7XHJcblx0XHRcdGxldCBoZWFkZXIgPSBuZXcgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCcubC1oZWFkZXInLCAnLm5hdl9faXRlbS1jb250YWluZXInKTtcclxuXHJcblx0XHRcdGhlYWRlci5hbmltYXRlVHJhbnNpdGlvbihcclxuXHRcdFx0XHQnLnN1Yi1uYXYnLCB7XHJcblx0XHRcdFx0XHRjc3NFbnVtZXJhYmxlUnVsZTogJ2hlaWdodCcsXHJcblx0XHRcdFx0XHRkZWxheTogMzAwfSlcclxuXHRcdFx0XHQucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrKFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtdHJpZ2dlcl0nLFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtb25dJylcclxuXHRcdFx0XHQuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHRcdCdqc19uYXYtLWZpeGVkJyxcclxuXHRcdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdFx0b25NYXhXaW5kb3dXaWR0aDogODUwfSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcik7XHJcblxyXG4gICAgSG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsndHJlbmRIb3RlbHNJbWdQYXRocyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKHRyZW5kSG90ZWxzSW1nUGF0aHMpIHtcclxuICAgICAgICB0aGlzLmhvdGVscyA9IHRyZW5kSG90ZWxzSW1nUGF0aHM7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgndHJlbmRIb3RlbHNJbWdQYXRocycsIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMScsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMicsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMycsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsNCcsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSx7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWw1JyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWw2JyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxNb2RhbCcsIGFodGxNb2RhbERpcmVjdGl2ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgbGluazogYWh0bE1vZGFsRGlyZWN0aXZlTGluayxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvbW9kYWwvbW9kYWwuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdtb2RhbE9wZW4nLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ2ltYWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zcmMgPSBkYXRhLnNyYztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2VEaWFsb2cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jlc29ydENvbnRyb2xsZXInLCBSZXNvcnRDb250cm9sbGVyKTtcclxuXHJcbiAgICBSZXNvcnRDb250cm9sbGVyLiRpbmplY3QgPSBbJ2hvdGVsRGV0YWlsc0NvbnN0YW50JywgJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSZXNvcnRDb250cm9sbGVyKGhvdGVsRGV0YWlsc0NvbnN0YW50LCByZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJGaWx0ZXJzTGlzdCA9IGhvdGVsRGV0YWlsc0NvbnN0YW50O1xyXG5cclxuICAgICAgICB0aGlzLmZpbHRlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLmZpbHRlcnMucHJpY2UgPSB7XHJcbiAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgbWF4OiAxMDAwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgncmVzb3J0U2VydmljZScsIHJlc29ydFNlcnZpY2UpO1xyXG5cclxuICAgIHJlc29ydFNlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXNvcnRTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFJlc29ydDogZ2V0UmVzb3J0XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmVzb3J0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihvblJlc29sdmUsIG9uUmVqZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFRvcDMnLCBhaHRsVG9wM0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFRvcDNEaXJlY3RpdmUuJGluamVjdCA9IFsndG9wM1NlcnZpY2UnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsVG9wM0RpcmVjdGl2ZSh0b3AzU2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsVG9wM0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3RvcDMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdG9wMy50ZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQubXVzdEhhdmU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0VHlwZSA9ICRhdHRycy5haHRsVG9wM3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1nU3JjID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL2ltYWdlcy8nICsgdGhpcy5yZXNvcnRUeXBlICsgJy8nICsgdGhpcy5yZXNvcnRbaW5kZXhdLmltZy5maWxlbmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc1Jlc29ydEluY2x1ZGVEZXRhaWwgPSBmdW5jdGlvbihpdGVtLCBkZXRhaWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZXRhaWxDbGFzc05hbWUgPSAndG9wM19fZGV0YWlsLWNvbnRhaW5lci0tJyArIGRldGFpbCxcclxuICAgICAgICAgICAgICAgICAgICBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUgPSAhaXRlbS5kZXRhaWxzW2RldGFpbF0gPyAnIHRvcDNfX2RldGFpbC1jb250YWluZXItLWhhc250JyA6ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXRhaWxDbGFzc05hbWUgKyBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRvcDNTZXJ2aWNlLmdldFRvcDNQbGFjZXModGhpcy5yZXNvcnRUeXBlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucmVzb3J0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgndG9wM1NlcnZpY2UnLCB0b3AzU2VydmljZSk7XHJcblxyXG4gICAgdG9wM1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiB0b3AzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRUb3AzUGxhY2VzOiBnZXRUb3AzUGxhY2VzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VG9wM1BsYWNlcyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC50b3AzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmFuaW1hdGlvbignLnNsaWRlcl9faW1nJywgYW5pbWF0aW9uRnVuY3Rpb24pO1xyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7IC8vMjAwPyAkKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMCcpO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCdsZWZ0JywgJzAnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFNsaWRlcicsIGFodGxTbGlkZXIpO1xyXG5cclxuXHRhaHRsU2xpZGVyLiRpbmplY3QgPSBbJ3NsaWRlclNlcnZpY2UnLCAnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFNsaWRlcihzbGlkZXJTZXJ2aWNlLCAkdGltZW91dCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0Y29udHJvbGxlcjogYWh0bFNsaWRlckNvbnRyb2xsZXIsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmh0bWwnLFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGFodGxTbGlkZXJDb250cm9sbGVyKCRzY29wZSkge1xyXG5cdFx0XHQkc2NvcGUuc2xpZGVyID0gc2xpZGVyU2VydmljZTtcclxuXHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHRcdFx0JHNjb3BlLm5leHRTbGlkZSA9IG5leHRTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnByZXZTbGlkZSA9IHByZXZTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnNldFNsaWRlID0gc2V0U2xpZGU7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBuZXh0U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAnbGVmdCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXROZXh0U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcHJldlNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldFByZXZTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzZXRTbGlkZShpbmRleCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gaW5kZXggPiAkc2NvcGUuc2xpZGVyLmdldEN1cnJlbnRTbGlkZSh0cnVlKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRDdXJyZW50U2xpZGUoaW5kZXgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZml4SUU4cG5nQmxhY2tCZyhlbGVtZW50KSB7XHJcblx0XHRcdCQoZWxlbWVudClcclxuXHRcdFx0XHQuY3NzKCctbXMtZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCdmaWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ3pvb20nLCAnMScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0pIHtcclxuXHRcdFx0bGV0IGFycm93cyA9ICQoZWxlbSkuZmluZCgnLnNsaWRlcl9fYXJyb3cnKTtcclxuXHJcblx0XHRcdGFycm93cy5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMC41Jyk7XHJcblx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZyh0aGlzKTtcclxuXHJcblx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdCR0aW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzEnKTtcclxuXHRcdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcoJCh0aGlzKSk7XHJcblx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdzbGlkZXJTZXJ2aWNlJyxzbGlkZXJTZXJ2aWNlKTtcclxuXHJcblx0c2xpZGVyU2VydmljZS4kaW5qZWN0ID0gWydzbGlkZXJJbWdQYXRoQ29uc3RhbnQnXTtcclxuXHJcblx0ZnVuY3Rpb24gc2xpZGVyU2VydmljZShzbGlkZXJJbWdQYXRoQ29uc3RhbnQpIHtcclxuXHRcdGZ1bmN0aW9uIFNsaWRlcihzbGlkZXJJbWFnZUxpc3QpIHtcclxuXHRcdFx0dGhpcy5faW1hZ2VTcmNMaXN0ID0gc2xpZGVySW1hZ2VMaXN0O1xyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0SW1hZ2VTcmNMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW1hZ2VTcmNMaXN0O1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChnZXRJbmRleCkge1xyXG5cdFx0XHRyZXR1cm4gZ2V0SW5kZXggPT0gdHJ1ZSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA6IHRoaXMuX2ltYWdlU3JjTGlzdFt0aGlzLl9jdXJyZW50U2xpZGVdO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xyXG5cdFx0XHRzbGlkZSA9IHBhcnNlSW50KHNsaWRlKTtcclxuXHJcblx0XHRcdGlmIChpc05hTihzbGlkZSkgfHwgc2xpZGUgPCAwIHx8IHNsaWRlID4gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IHNsaWRlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldE5leHRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpID8gdGhpcy5fY3VycmVudFNsaWRlID0gMCA6IHRoaXMuX2N1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRQcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IDApID8gdGhpcy5fY3VycmVudFNsaWRlID0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEgOiB0aGlzLl9jdXJyZW50U2xpZGUtLTtcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBuZXcgU2xpZGVyKHNsaWRlckltZ1BhdGhDb25zdGFudCk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3NsaWRlckltZ1BhdGhDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjEuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjIuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjMuanBnJ1xyXG4gICAgICAgIF0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFByaWNlU2xpZGVyJywgcHJpY2VTbGlkZXJEaXJlY3RpdmUpO1xyXG5cclxuICAgIHByaWNlU2xpZGVyRGlyZWN0aXZlLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY29wZTogey8vdG9kb0A9XHJcbiAgICAgICAgICAgICAgICBtaW46IFwiPW1pblwiLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBcIj1tYXhcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IHByaWNlU2xpZGVyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIGxldCByaWdodEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKSxcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKTtcclxuXHJcbiAgICAgICAgICAgIGluaXREcmFnKFxyXG4gICAgICAgICAgICAgICAgcmlnaHRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludCgkKCcuc2xpZGUnKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiAwKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXREcmFnKGRyYWdFbGVtLCBpbml0UG9zaXRpb24sIG1heFBvc2l0aW9uLCBtaW5Qb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNoaWZ0O1xyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZWRvd24nLCBidG5Pbk1vdXNlRG93bik7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZURvd24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzaGlmdCA9IGV2ZW50LnBhZ2VYO1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRQb3NpdGlvbiA9IHBhcnNlSW50KGRyYWdFbGVtLmNzcygnbGVmdCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRvY09uTW91c2VNb3ZlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPj0gbWluUG9zaXRpb24oKSArIDIwICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPD0gbWF4UG9zaXRpb24oKSAtIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlVXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbml0UG9zaXRpb24gPSBwYXJzZUludChkcmFnRWxlbS5jc3MoJ2xlZnQnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ2RyYWdzdGFydCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyJdfQ==
