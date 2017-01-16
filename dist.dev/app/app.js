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

        mustHaves: ['restaurant', 'kids', 'pool', 'spa', 'wifi', 'pet', 'disable', 'beach', 'parking', 'conditioning', 'lounge', 'terrace', 'garden', 'gym', 'bicycles'],

        activities: ['Cooking classes', 'Cycling', 'Fishing', 'Golf', 'Hiking', 'Horse-riding', 'Kayaking', 'Nightlife', 'Sailing', 'Scuba diving', 'Shopping / markets', 'Snorkelling', 'Skiing', 'Surfing', 'Wildlife', 'Windsurfing', 'Wine tasting', 'Yoga'],

        price: {
            min: 0,
            max: 1000
        }
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

    angular.module('ahotelApp').filter('activitiesfilter', activitiesFilter);

    activitiesFilter.$inject = ['$log'];

    function activitiesFilter($log) {
        return function (arg, _stringLength) {
            var stringLength = parseInt(_stringLength);

            if (isNaN(stringLength)) {
                $log.warn('Can\'t parse argument: ' + _stringLength);
                return;
            }

            var result = arg.join(', ').slice(0, stringLength);

            return result.slice(0, result.lastIndexOf(',')) + '...';
        };
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

        this.hotels = {};

        resortService.getResort().then(function (response) {
            _this.hotels = response;
        });
        /*((response) => {
                console.log(response)
                this.loading = false;
        },
            (response) => {
                console.log(response)
            });*/
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
                console.log(response.data);
                return response.data;
            }

            function onRejected(response) {
                return response;
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

    priceSliderDirective.$inject = ['HeaderTransitionsService'];

    function priceSliderDirective() {
        return {
            scope: {
                min: "@",
                max: "@",
                leftSlider: '=',
                rightSlider: '='
            },
            restrict: 'E',
            templateUrl: 'app/partials/resort/priceSlider/priceSlider.html',
            link: priceSliderDirectiveLink
        };

        function priceSliderDirectiveLink($scope, HeaderTransitionsService) {
            var rightBtn = $('.slide__pointer--right'),
                leftBtn = $('.slide__pointer--left'),
                slideAreaWidth = parseInt($('.slide').css('width')),
                valuePerStep = $scope.max / (slideAreaWidth - 20);

            $scope.min = parseInt($scope.min);
            $scope.max = parseInt($scope.max);

            $('.priceSlider__input--min').val($scope.min);
            $('.priceSlider__input--max').val($scope.max);

            initDrag(rightBtn, parseInt(rightBtn.css('left')), function () {
                return slideAreaWidth;
            }, function () {
                return parseInt(leftBtn.css('left'));
            });

            initDrag(leftBtn, parseInt(leftBtn.css('left')), function () {
                return parseInt(rightBtn.css('left')) + 20;
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
                    var positionLessThanMax = initPosition + event.pageX - shift <= maxPosition() - 20,
                        positionGraterThanMin = initPosition + event.pageX - shift >= minPosition();

                    if (positionLessThanMax && positionGraterThanMin) {
                        dragElem.css('left', initPosition + event.pageX - shift);

                        if (dragElem.attr('class').indexOf('left') !== -1) {
                            $('.slide__line--green').css('left', initPosition + event.pageX - shift);
                        } else {
                            $('.slide__line--green').css('right', slideAreaWidth - initPosition - event.pageX + shift);
                        }

                        setPrices();
                    }
                }

                function btnOnMouseUp() {
                    $(document).off('mousemove', docOnMouseMove);
                    dragElem.off('mouseup', btnOnMouseUp);
                    $(document).off('mouseup', btnOnMouseUp);

                    setPrices();
                    emit();
                }

                dragElem.on('dragstart', function () {
                    return false;
                });

                function setPrices() {
                    var newMin = ~~(parseInt(leftBtn.css('left')) * valuePerStep),
                        newMax = ~~(parseInt(rightBtn.css('left')) * valuePerStep);

                    $('.priceSlider__input--min').val(newMin);
                    $('.priceSlider__input--max').val(newMax);

                    /*$scope.$broadcast('priceSliderPositionChanged', {
                        left: leftBtn.css('left'),
                        right: rightBtn.css('left')
                    })*/
                }

                function setSliders(btn, newValue) {
                    var newPostion = newValue / valuePerStep;
                    btn.css('left', newPostion);

                    if (btn.attr('class').indexOf('left') !== -1) {
                        $('.slide__line--green').css('left', newPostion);
                    } else {
                        $('.slide__line--green').css('right', slideAreaWidth - newPostion);
                    }

                    emit();
                }

                $('.priceSlider__input--min').on('change keyup paste input', function () {
                    var newValue = $(this).val();

                    if (+newValue < 0) {
                        $(this).addClass('priceSlider__input--invalid');
                        return;
                    }

                    if (+newValue / valuePerStep > parseInt(rightBtn.css('left')) - 20) {
                        $(this).addClass('priceSlider__input--invalid');
                        console.log('fa;l');
                        return;
                    }

                    $(this).removeClass('priceSlider__input--invalid');
                    setSliders(leftBtn, newValue);
                });

                $('.priceSlider__input--max').on('change keyup paste input', function () {
                    var newValue = $(this).val();

                    if (+newValue > $scope.max) {
                        $(this).addClass('priceSlider__input--invalid');
                        console.log(newValue, $scope.max);
                        return;
                    }

                    if (+newValue / valuePerStep < parseInt(leftBtn.css('left')) + 20) {
                        $(this).addClass('priceSlider__input--invalid');
                        console.log('fa;l');
                        return;
                    }

                    $(this).removeClass('priceSlider__input--invalid');
                    setSliders(rightBtn, newValue);
                });

                function emit() {
                    $scope.leftSlider = $('.priceSlider__input--min').val();
                    $scope.rightSlider = $('.priceSlider__input--max').val();
                    $scope.$apply();

                    /*$scope.$broadcast('priceSliderPositionChanged', {
                        min: $('.priceSlider__input--min').val(),
                        max: $('.priceSlider__input--max').val()
                    });
                    console.log(13);*/
                }

                //todo ie8 bug fix
                if ($('html').hasClass('ie8')) {
                    $('.priceSlider__input--max').trigger('change');
                }

                /*$scope.$watch(function() {
                        return $(elem).find('.slide__pointer--left').css('left');
                    },
                    function(newValue) {
                        $('.slide__line--green').css('left', newValue);
                    });
                  $scope.$watch(function() {
                        return $(elem).find('.slide__pointer--right').css('left');
                    },
                    function(newValue) {
                        console.log(+slideAreaWidth - +newValue);
                        $('.slide__line--green').css('right', +slideAreaWidth - parseInt(newValue));
                    });*/
            }
        }
    }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuZmlsdGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9ob21lL2hvbWUuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS50cmVuZEhvdGVsc0ltZ1BhdGhzLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL21vZGFsL21vZGFsLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuYWN0aXZpdGllcy5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuYW5pbWF0aW9uLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyUGF0aC5jb25zdGFudC5qcyIsInBhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5kaXJlY3RpdmUuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRwcm92aWRlIiwiZGVjb3JhdG9yIiwiJGRlbGVnYXRlIiwiJHdpbmRvdyIsImxvZ0hpc3RvcnkiLCJ3YXJuIiwiZXJyIiwibG9nIiwibWVzc2FnZSIsIl9sb2dXYXJuIiwicHVzaCIsImFwcGx5IiwiX2xvZ0VyciIsImVycm9yIiwibmFtZSIsInN0YWNrIiwiRXJyb3IiLCJzZW5kT25VbmxvYWQiLCJvbmJlZm9yZXVubG9hZCIsImxlbmd0aCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIiRpbmplY3QiLCJwcmVsb2FkU2VydmljZVByb3ZpZGVyIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCJnYWxsZXJ5IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCJvdGhlcndpc2UiLCJzdGF0ZSIsInVybCIsInRlbXBsYXRlVXJsIiwicGFyYW1zIiwicnVuIiwiJHJvb3RTY29wZSIsInByZWxvYWRTZXJ2aWNlIiwiJGxvZ2dlZCIsIiRzdGF0ZSIsImN1cnJlbnRTdGF0ZU5hbWUiLCJjdXJyZW50U3RhdGVQYXJhbXMiLCJzdGF0ZUhpc3RvcnkiLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsIm9ubG9hZCIsInByZWxvYWRJbWFnZXMiLCJtZXRob2QiLCJhY3Rpb24iLCJwcm92aWRlciIsInRpbWVvdXQiLCIkZ2V0IiwiJGh0dHAiLCIkdGltZW91dCIsInByZWxvYWRDYWNoZSIsImxvZ2dlciIsImNvbnNvbGUiLCJkZWJ1ZyIsInByZWxvYWROYW1lIiwiaW1hZ2VzIiwiaW1hZ2VzU3JjTGlzdCIsInNyYyIsInByZWxvYWQiLCJ0aGVuIiwicmVzcG9uc2UiLCJkYXRhIiwiYmluZCIsImkiLCJpbWFnZSIsIkltYWdlIiwiZSIsIm9uZXJyb3IiLCJnZXRQcmVsb2FkIiwiZ2V0UHJlbG9hZENhY2hlIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImd1ZXN0Y29tbWVudHMiLCJob3RlbHMiLCJ0eXBlcyIsInNldHRpbmdzIiwibG9jYXRpb25zIiwiZ3Vlc3RzIiwibWF4IiwibXVzdEhhdmVzIiwiYWN0aXZpdGllcyIsInByaWNlIiwibWluIiwiY29udHJvbGxlciIsIkF1dGhDb250cm9sbGVyIiwiJHNjb3BlIiwiYXV0aFNlcnZpY2UiLCJ2YWxpZGF0aW9uU3RhdHVzIiwidXNlckFscmVhZHlFeGlzdHMiLCJsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QiLCJjcmVhdGVVc2VyIiwibmV3VXNlciIsImdvIiwibG9naW5Vc2VyIiwic2lnbkluIiwidXNlciIsInByZXZpb3VzU3RhdGUiLCJmYWN0b3J5IiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsIl9jcmVkZW50aWFscyIsIl9vblJlc29sdmUiLCJzdGF0dXMiLCJ0b2tlbiIsIl90b2tlbktlZXBlciIsInNhdmVUb2tlbiIsIl9vblJlamVjdGVkIiwiX3Rva2VuIiwiZ2V0VG9rZW4iLCJkZWxldGVUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwic2lnbk91dCIsImdldExvZ0luZm8iLCJkaXJlY3RpdmUiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZSIsInJlc3RyaWN0Iiwic2NvcGUiLCJzaG93Rmlyc3RJbWdDb3VudCIsInNob3dOZXh0SW1nQ291bnQiLCJBaHRsR2FsbGVyeUNvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCJsaW5rIiwiYWh0bEdhbGxlcnlMaW5rIiwiYWxsSW1hZ2VzU3JjIiwibG9hZE1vcmUiLCJNYXRoIiwic2hvd0ZpcnN0Iiwic2xpY2UiLCJpc0FsbEltYWdlc0xvYWRlZCIsImFsbEltYWdlc0xvYWRlZCIsImltYWdlc0NvdW50IiwiYWxpZ25JbWFnZXMiLCIkIiwiX3NldEltYWdlQWxpZ21lbnQiLCJ3aW5kb3ciLCJvbiIsIl9nZXRJbWFnZVNvdXJjZXMiLCJlbGVtIiwiaW1nU3JjIiwidGFyZ2V0IiwiJHJvb3QiLCIkYnJvYWRjYXN0Iiwic2hvdyIsImNiIiwiZmlndXJlcyIsImdhbGxlcnlXaWR0aCIsInBhcnNlSW50IiwiY2xvc2VzdCIsImNzcyIsImltYWdlV2lkdGgiLCJjb2x1bW5zQ291bnQiLCJyb3VuZCIsImNvbHVtbnNIZWlnaHQiLCJBcnJheSIsImpvaW4iLCJzcGxpdCIsIm1hcCIsImN1cnJlbnRDb2x1bW5zSGVpZ2h0IiwiY29sdW1uUG9pbnRlciIsImVhY2giLCJpbmRleCIsIkd1ZXN0Y29tbWVudHNDb250cm9sbGVyIiwiZ3Vlc3Rjb21tZW50c1NlcnZpY2UiLCJjb21tZW50cyIsIm9wZW5Gb3JtIiwic2hvd1BsZWFzZUxvZ2lNZXNzYWdlIiwid3JpdGVDb21tZW50IiwiZ2V0R3Vlc3RDb21tZW50cyIsImFkZENvbW1lbnQiLCJzZW5kQ29tbWVudCIsImZvcm1EYXRhIiwiY29tbWVudCIsImZpbHRlciIsInJldmVyc2UiLCJpdGVtcyIsInR5cGUiLCJvblJlc29sdmUiLCJvblJlamVjdCIsIkhvbWVDb250cm9sbGVyIiwidHJlbmRIb3RlbHNJbWdQYXRocyIsIkhlYWRlckNvbnRyb2xsZXIiLCJhaHRsSGVhZGVyIiwic2VydmljZSIsIkhlYWRlclRyYW5zaXRpb25zU2VydmljZSIsIiRsb2ciLCJVSXRyYW5zaXRpb25zIiwiY29udGFpbmVyIiwiX2NvbnRhaW5lciIsImFuaW1hdGVUcmFuc2l0aW9uIiwidGFyZ2V0RWxlbWVudHNRdWVyeSIsImNzc0VudW1lcmFibGVSdWxlIiwiZnJvbSIsInRvIiwiZGVsYXkiLCJtb3VzZWVudGVyIiwidGFyZ2V0RWxlbWVudHMiLCJmaW5kIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJzY3JvbGxUb3AiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwiYWh0bFN0aWt5SGVhZGVyIiwiaGVhZGVyIiwiYWh0bE1vZGFsRGlyZWN0aXZlIiwicmVwbGFjZSIsImFodGxNb2RhbERpcmVjdGl2ZUxpbmsiLCIkYXBwbHkiLCJjbG9zZURpYWxvZyIsImFjdGl2aXRpZXNGaWx0ZXIiLCJhcmciLCJfc3RyaW5nTGVuZ3RoIiwic3RyaW5nTGVuZ3RoIiwiaXNOYU4iLCJyZXN1bHQiLCJsYXN0SW5kZXhPZiIsIlJlc29ydENvbnRyb2xsZXIiLCJob3RlbERldGFpbHNDb25zdGFudCIsInJlc29ydFNlcnZpY2UiLCJsb2FkaW5nIiwicmVuZGVyRmlsdGVyc0xpc3QiLCJmaWx0ZXJzIiwiZ2V0UmVzb3J0Iiwib25SZWplY3RlZCIsImFodGxUb3AzRGlyZWN0aXZlIiwidG9wM1NlcnZpY2UiLCJBaHRsVG9wM0NvbnRyb2xsZXIiLCIkZWxlbWVudCIsIiRhdHRycyIsImRldGFpbHMiLCJtdXN0SGF2ZSIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJpbWciLCJmaWxlbmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbCIsIml0ZW0iLCJkZXRhaWwiLCJkZXRhaWxDbGFzc05hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUiLCJnZXRUb3AzUGxhY2VzIiwiYW5pbWF0aW9uIiwiYW5pbWF0aW9uRnVuY3Rpb24iLCJiZWZvcmVBZGRDbGFzcyIsImVsZW1lbnQiLCJjbGFzc05hbWUiLCJkb25lIiwic2xpZGluZ0RpcmVjdGlvbiIsImFodGxTbGlkZXIiLCJzbGlkZXJTZXJ2aWNlIiwiYWh0bFNsaWRlckNvbnRyb2xsZXIiLCJzbGlkZXIiLCJuZXh0U2xpZGUiLCJwcmV2U2xpZGUiLCJzZXRTbGlkZSIsInNldE5leHRTbGlkZSIsInNldFByZXZTbGlkZSIsImdldEN1cnJlbnRTbGlkZSIsInNldEN1cnJlbnRTbGlkZSIsImZpeElFOHBuZ0JsYWNrQmciLCJhcnJvd3MiLCJjbGljayIsImRpc2FibGVkIiwic2xpZGVySW1nUGF0aENvbnN0YW50IiwiU2xpZGVyIiwic2xpZGVySW1hZ2VMaXN0IiwiX2ltYWdlU3JjTGlzdCIsIl9jdXJyZW50U2xpZGUiLCJnZXRJbWFnZVNyY0xpc3QiLCJnZXRJbmRleCIsInNsaWRlIiwicHJpY2VTbGlkZXJEaXJlY3RpdmUiLCJsZWZ0U2xpZGVyIiwicmlnaHRTbGlkZXIiLCJwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsiLCJyaWdodEJ0biIsImxlZnRCdG4iLCJzbGlkZUFyZWFXaWR0aCIsInZhbHVlUGVyU3RlcCIsInZhbCIsImluaXREcmFnIiwiZHJhZ0VsZW0iLCJpbml0UG9zaXRpb24iLCJtYXhQb3NpdGlvbiIsIm1pblBvc2l0aW9uIiwic2hpZnQiLCJidG5Pbk1vdXNlRG93biIsInBhZ2VYIiwiZG9jdW1lbnQiLCJkb2NPbk1vdXNlTW92ZSIsImJ0bk9uTW91c2VVcCIsInBvc2l0aW9uTGVzc1RoYW5NYXgiLCJwb3NpdGlvbkdyYXRlclRoYW5NaW4iLCJhdHRyIiwiaW5kZXhPZiIsInNldFByaWNlcyIsImVtaXQiLCJuZXdNaW4iLCJuZXdNYXgiLCJzZXRTbGlkZXJzIiwiYnRuIiwibmV3VmFsdWUiLCJuZXdQb3N0aW9uIiwiaGFzQ2xhc3MiLCJ0cmlnZ2VyIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUEsUUFDS0MsT0FBTyxhQUFhLENBQUMsYUFBYSxXQUFXO0tBSnREO0FDQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFELFFBQ0tDLE9BQU8sYUFDUEMsb0JBQU8sVUFBVUMsVUFBVTtRQUN4QkEsU0FBU0MsVUFBVSxpQ0FBUSxVQUFVQyxXQUFXQyxTQUFTO1lBQ3JELElBQUlDLGFBQWE7Z0JBQ1RDLE1BQU07Z0JBQ05DLEtBQUs7OztZQUdiSixVQUFVSyxNQUFNLFVBQVVDLFNBQVM7O1lBR25DLElBQUlDLFdBQVdQLFVBQVVHO1lBQ3pCSCxVQUFVRyxPQUFPLFVBQVVHLFNBQVM7Z0JBQ2hDSixXQUFXQyxLQUFLSyxLQUFLRjtnQkFDckJDLFNBQVNFLE1BQU0sTUFBTSxDQUFDSDs7O1lBRzFCLElBQUlJLFVBQVVWLFVBQVVXO1lBQ3hCWCxVQUFVVyxRQUFRLFVBQVVMLFNBQVM7Z0JBQ2pDSixXQUFXRSxJQUFJSSxLQUFLLEVBQUNJLE1BQU1OLFNBQVNPLE9BQU8sSUFBSUMsUUFBUUQ7Z0JBQ3ZESCxRQUFRRCxNQUFNLE1BQU0sQ0FBQ0g7OztZQUd6QixDQUFDLFNBQVNTLGVBQWU7Z0JBQ3JCZCxRQUFRZSxpQkFBaUIsWUFBWTtvQkFDakMsSUFBSSxDQUFDZCxXQUFXRSxJQUFJYSxVQUFVLENBQUNmLFdBQVdDLEtBQUtjLFFBQVE7d0JBQ25EOzs7b0JBR0os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cEJ5RyxXQUFXeEIsVUFBVTBCOzs7Z0JBR3pCLFNBQVNMLE9BQU87b0JBQ1puUCxPQUFPMk4sYUFBYTFLLEVBQUUsNEJBQTRCaUw7b0JBQ2xEbE8sT0FBTzROLGNBQWMzSyxFQUFFLDRCQUE0QmlMO29CQUNuRGxPLE9BQU93Sjs7Ozs7Ozs7OztnQkFVWCxJQUFJdkcsRUFBRSxRQUFReU0sU0FBUyxRQUFRO29CQUMzQnpNLEVBQUUsNEJBQTRCME0sUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXZLMUQiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnLCBbJ3VpLnJvdXRlcicsICdwcmVsb2FkJywgJ25nQW5pbWF0ZSddKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhmdW5jdGlvbiAoJHByb3ZpZGUpIHtcclxuICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCckbG9nJywgZnVuY3Rpb24gKCRkZWxlZ2F0ZSwgJHdpbmRvdykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvZ0hpc3RvcnkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhcm46IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnI6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUubG9nID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IF9sb2dXYXJuID0gJGRlbGVnYXRlLndhcm47XHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUud2FybiA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ1dhcm4uYXBwbHkobnVsbCwgW21lc3NhZ2VdKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IF9sb2dFcnIgPSAkZGVsZWdhdGUuZXJyb3I7XHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUuZXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe25hbWU6IG1lc3NhZ2UsIHN0YWNrOiBuZXcgRXJyb3IoKS5zdGFja30pO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dFcnIuYXBwbHkobnVsbCwgW21lc3NhZ2VdKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIHNlbmRPblVubG9hZCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxvZ0hpc3RvcnkuZXJyLmxlbmd0aCAmJiAhbG9nSGlzdG9yeS53YXJuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCAnL2FwaS9sb2cnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShsb2dIaXN0b3J5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRkZWxlZ2F0ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbn0pKCk7XHJcblxyXG4vKlxyXG4gICAgICAgIC5mYWN0b3J5KCdsb2cnLCBsb2cpO1xyXG5cclxuICAgIGxvZy4kaW5qZWN0ID0gWyckd2luZG93JywgJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBsb2coJHdpbmRvdywgJGxvZykge1xyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gd2FybiguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKGFyZ3MpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJyb3dzZXJMb2cpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybihhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZXJyb3IoZSkge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IGUubmFtZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGUubWVzc2FnZSxcclxuICAgICAgICAgICAgICAgIHN0YWNrOiBlLnN0YWNrXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkbG9nLmVycm9yKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy90b2RvIGFsbCBlcnJvcnNcclxuXHJcblxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB3YXJuOiB3YXJuLFxyXG4gICAgICAgICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICAgICAgICAgIHNlbmRPblVubG9hZDogc2VuZE9uVW5sb2FkXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uZmlnKGNvbmZpZyk7XHJcblxyXG4gICAgY29uZmlnLiRpbmplY3QgPSBbJ3ByZWxvYWRTZXJ2aWNlUHJvdmlkZXInLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb25maWcocHJlbG9hZFNlcnZpY2VQcm92aWRlciwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICAgICAgcHJlbG9hZFNlcnZpY2VQcm92aWRlci5jb25maWcoYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSwgJ0dFVCcsICdnZXQnLCAxMDAsICd3YXJuaW5nJyk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuY29uZmlnKGNvbmZpZyk7XHJcblxyXG5cdGNvbmZpZy4kaW5qZWN0ID0gWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInXTtcclxuXHJcblx0ZnVuY3Rpb24gY29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuXHRcdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcclxuXHJcblx0XHQkc3RhdGVQcm92aWRlclxyXG5cdFx0XHQuc3RhdGUoJ2hvbWUnLCB7XHJcblx0XHRcdFx0dXJsOiAnLycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaG9tZS9ob21lLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYXV0aCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvYXV0aCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvYXV0aC9hdXRoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeyd0eXBlJzogJ2xvZ2luJ30vKixcclxuXHRcdFx0XHRvbkVudGVyOiBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xyXG5cdFx0XHRcdFx0JHJvb3RTY29wZS4kc3RhdGUgPSBcImF1dGhcIjtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2J1bmdhbG93cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2hvdGVscycsIHtcclxuXHRcdFx0XHRcdHVybDogJy90b3AnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC92aWxsYXMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdnYWxsZXJ5Jywge1xyXG5cdFx0XHRcdHVybDogJy9nYWxsZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdndWVzdGNvbW1lbnRzJywge1xyXG5cdFx0XHRcdHVybDogJy9ndWVzdGNvbW1lbnRzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdkZXN0aW5hdGlvbnMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvZGVzdGluYXRpb25zJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Rlc3RpbmF0aW9ucy9kZXN0aW5hdGlvbnMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdyZXNvcnQnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3Jlc29ydCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3Jlc29ydC5odG1sJ1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5ydW4ocnVuKTtcclxuXHJcbiAgICBydW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScgLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAncHJlbG9hZFNlcnZpY2UnLCAnJHdpbmRvdyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bigkcm9vdFNjb3BlLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgcHJlbG9hZFNlcnZpY2UsICR3aW5kb3csIGxvZykge1xyXG4gICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JyxcclxuICAgICAgICAgICAgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLyosIGZyb21TdGF0ZSwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuY3VycmVudFN0YXRlTmFtZSA9IHRvU3RhdGUubmFtZTtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZVBhcmFtcyA9IHRvUGFyYW1zO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICR3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7IC8vdG9kbyBvbmxvYWQg77+977+977+977+977+977+977+977+9IO+/vSDvv73vv73vv73vv73vv73vv71cclxuICAgICAgICAgICAgcHJlbG9hZFNlcnZpY2UucHJlbG9hZEltYWdlcygnZ2FsbGVyeScsIHt1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksIG1ldGhvZDogJ0dFVCcsIGFjdGlvbjogJ2dldCd9KTsgLy90b2RvIGRlbCBtZXRob2QsIGFjdGlvbiBieSBkZWZhdWx0XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy9sb2cuc2VuZE9uVW5sb2FkKCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwcmVsb2FkJywgW10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncHJlbG9hZCcpXHJcbiAgICAgICAgLnByb3ZpZGVyKCdwcmVsb2FkU2VydmljZScsIHByZWxvYWRTZXJ2aWNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmVsb2FkU2VydmljZSgpIHtcclxuICAgICAgICBsZXQgY29uZmlnID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBmdW5jdGlvbih1cmwgPSAnL2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2QgPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nID0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxyXG4gICAgICAgICAgICAgICAgbG9nOiBsb2dcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLiRnZXQgPSBmdW5jdGlvbiAoJGh0dHAsICR0aW1lb3V0KSB7XHJcbiAgICAgICAgICAgIGxldCBwcmVsb2FkQ2FjaGUgPSBbXSxcclxuICAgICAgICAgICAgICAgIGxvZ2dlciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmxvZyA9PT0gJ3NpbGVudCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdkZWJ1ZycgJiYgbG9nID09PSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9nID09PSAnd2FybmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkSW1hZ2VzKHByZWxvYWROYW1lLCBpbWFnZXMpIHsgLy90b2RvIGVycm9yc1xyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlc1NyY0xpc3QgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ2FycmF5Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlc1NyY0xpc3QgPSBpbWFnZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRDYWNoZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VzU3JjTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkKGltYWdlc1NyY0xpc3QpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW1hZ2VzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzOiBpbWFnZXMubWV0aG9kIHx8IGNvbmZpZy5tZXRob2QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogaW1hZ2VzLnVybCB8fCBjb25maWcudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLmFjdGlvbiB8fCBjb25maWcuYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlc1NyY0xpc3QgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWRDYWNoZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVsb2FkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcudGltZW91dCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkKGltYWdlc1NyY0xpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5vbmxvYWQgPSBwcmVsb2FkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHByZWxvYWQuYmluZChudWxsLCBpbWFnZXNTcmNMaXN0KSwgY29uZmlnLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnRVJST1InOyAvL3RvZG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZChpbWFnZXNTcmNMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbWFnZXNTcmNMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSBpbWFnZXNTcmNMaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXNvbHZlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcih0aGlzLnNyYywgJ2RlYnVnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFByZWxvYWQocHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcigncHJlbG9hZFNlcnZpY2U6IGdldCByZXF1ZXN0ICcgKyAnXCInICsgcHJlbG9hZE5hbWUgKyAnXCInLCAnZGVidWcnKTtcclxuICAgICAgICAgICAgICAgIGlmICghcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlbG9hZENhY2hlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlbG9hZENhY2hlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZWxvYWRDYWNoZVtpXS5uYW1lID09PSBwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlbG9hZENhY2hlW2ldLnNyY1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ05vIHByZWxvYWRzIGZvdW5kJywgJ3dhcm5pbmcnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHByZWxvYWRJbWFnZXM6IHByZWxvYWRJbWFnZXMsXHJcbiAgICAgICAgICAgICAgICBnZXRQcmVsb2FkQ2FjaGU6IGdldFByZWxvYWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHRvcDM6ICcvYXBpL3RvcDMnLFxyXG4gICAgICAgICAgICBhdXRoOiAnL2FwaS91c2VycycsXHJcbiAgICAgICAgICAgIGdhbGxlcnk6ICcvYXBpL2dhbGxlcnknLFxyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzOiAnL2FwaS9ndWVzdGNvbW1lbnRzJyxcclxuICAgICAgICAgICAgaG90ZWxzOiAnL2FwaS9ob3RlbHMnXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnaG90ZWxEZXRhaWxzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHR5cGVzOiBbXHJcbiAgICAgICAgICAgICAgICAnSG90ZWwnLFxyXG4gICAgICAgICAgICAgICAgJ0J1bmdhbG93JyxcclxuICAgICAgICAgICAgICAgICdWaWxsYSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29hc3QnLFxyXG4gICAgICAgICAgICAgICAgJ0NpdHknLFxyXG4gICAgICAgICAgICAgICAgJ0Rlc2VydCdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGxvY2F0aW9uczogW1xyXG4gICAgICAgICAgICAgICAgJ05hbWliaWEnLFxyXG4gICAgICAgICAgICAgICAgJ0xpYnlhJyxcclxuICAgICAgICAgICAgICAgICdTb3V0aCBBZnJpY2EnLFxyXG4gICAgICAgICAgICAgICAgJ1RhbnphbmlhJyxcclxuICAgICAgICAgICAgICAgICdQYXB1YSBOZXcgR3VpbmVhJyxcclxuICAgICAgICAgICAgICAgICdSZXVuaW9uJyxcclxuICAgICAgICAgICAgICAgICdTd2F6aWxhbmQnLFxyXG4gICAgICAgICAgICAgICAgJ1NhbyBUb21lJyxcclxuICAgICAgICAgICAgICAgICdNYWRhZ2FzY2FyJyxcclxuICAgICAgICAgICAgICAgICdNYXVyaXRpdXMnLFxyXG4gICAgICAgICAgICAgICAgJ1NleWNoZWxsZXMnLFxyXG4gICAgICAgICAgICAgICAgJ01heW90dGUnLFxyXG4gICAgICAgICAgICAgICAgJ1VrcmFpbmUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBndWVzdHM6IHtcclxuICAgICAgICAgICAgICAgIG1heDogNVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbXVzdEhhdmVzOiBbXHJcbiAgICAgICAgICAgICAgICAncmVzdGF1cmFudCcsXHJcbiAgICAgICAgICAgICAgICAna2lkcycsXHJcbiAgICAgICAgICAgICAgICAncG9vbCcsXHJcbiAgICAgICAgICAgICAgICAnc3BhJyxcclxuICAgICAgICAgICAgICAgICd3aWZpJyxcclxuICAgICAgICAgICAgICAgICdwZXQnLFxyXG4gICAgICAgICAgICAgICAgJ2Rpc2FibGUnLFxyXG4gICAgICAgICAgICAgICAgJ2JlYWNoJyxcclxuICAgICAgICAgICAgICAgICdwYXJraW5nJyxcclxuICAgICAgICAgICAgICAgICdjb25kaXRpb25pbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2xvdW5nZScsXHJcbiAgICAgICAgICAgICAgICAndGVycmFjZScsXHJcbiAgICAgICAgICAgICAgICAnZ2FyZGVuJyxcclxuICAgICAgICAgICAgICAgICdneW0nLFxyXG4gICAgICAgICAgICAgICAgJ2JpY3ljbGVzJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgYWN0aXZpdGllczogW1xyXG4gICAgICAgICAgICAgICAgJ0Nvb2tpbmcgY2xhc3NlcycsXHJcbiAgICAgICAgICAgICAgICAnQ3ljbGluZycsXHJcbiAgICAgICAgICAgICAgICAnRmlzaGluZycsXHJcbiAgICAgICAgICAgICAgICAnR29sZicsXHJcbiAgICAgICAgICAgICAgICAnSGlraW5nJyxcclxuICAgICAgICAgICAgICAgICdIb3JzZS1yaWRpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0theWFraW5nJyxcclxuICAgICAgICAgICAgICAgICdOaWdodGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1NhaWxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NjdWJhIGRpdmluZycsXHJcbiAgICAgICAgICAgICAgICAnU2hvcHBpbmcgLyBtYXJrZXRzJyxcclxuICAgICAgICAgICAgICAgICdTbm9ya2VsbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2tpaW5nJyxcclxuICAgICAgICAgICAgICAgICdTdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaWxkbGlmZScsXHJcbiAgICAgICAgICAgICAgICAnV2luZHN1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmUgdGFzdGluZycsXHJcbiAgICAgICAgICAgICAgICAnWW9nYScgXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBwcmljZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAxMDAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRyb290U2NvcGUsICRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3Q6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduSW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRyb290U2NvcGUsICRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWxldGVUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlVG9rZW46IHNhdmVUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnZXRUb2tlbjogZ2V0VG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlVG9rZW46IGRlbGV0ZVRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuZGVsZXRlVG9rZW4oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5nZXRMb2dJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogdGhpcy5fY3JlZGVudGlhbHMsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5fdG9rZW5LZWVwZXIuZ2V0VG9rZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJyR0aW1lb3V0JywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCAkdGltZW91dCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlKSB7IC8vdG9kbyBub3Qgb25seSBsb2FkIGJ1dCBsaXN0U3JjIHRvbyBhY2NlcHRcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dGaXJzdCcsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd05leHQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsSW1hZ2VzU3JjID0gW10sXHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9ICRzY29wZS5zaG93Rmlyc3RJbWdDb3VudCxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQgPSAkc2NvcGUuc2hvd05leHRJbWdDb3VudDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gTWF0aC5taW4oc2hvd0ZpcnN0SW1nQ291bnQgKyBzaG93TmV4dEltZ0NvdW50LCBhbGxJbWFnZXNTcmMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBbGxJbWFnZXNMb2FkZWQgPSB0aGlzLnNob3dGaXJzdCA+PSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyovXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsbEltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob3dGaXJzdCkgPyB0aGlzLnNob3dGaXJzdC5sZW5ndGggPT09IHRoaXMuaW1hZ2VzQ291bnQ6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmdhbGxlcnkgaW1nJykubGVuZ3RoIDwgc2hvd0ZpcnN0SW1nQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb29wcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHRoaXMuYWxpZ25JbWFnZXMsIDApXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMoKTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzQ291bnQgPSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGVsZW0ub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nU3JjID0gZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgIC8qIHZhciAkaW1hZ2VzID0gJCgnLmdhbGxlcnkgaW1nJyk7XHJcbiAgICAgICAgICAgIHZhciBsb2FkZWRfaW1hZ2VzX2NvdW50ID0gMDsqL1xyXG4gICAgICAgICAgICAvKiRzY29wZS5hbGlnbkltYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJGltYWdlcy5sb2FkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZF9pbWFnZXNfY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZF9pbWFnZXNfY291bnQgPT0gJGltYWdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3NldEltYWdlQWxpZ21lbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyAvLyB0b2RvXHJcbiAgICAgICAgICAgIH07Ki9cclxuXHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmFsaWduSW1hZ2VzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKGNiKSB7XHJcbiAgICAgICAgICAgIGNiKHByZWxvYWRTZXJ2aWNlLmdldFByZWxvYWRDYWNoZSgnZ2FsbGVyeScpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9zZXRJbWFnZUFsaWdtZW50KCkgeyAvL3RvZG8gYXJndW1lbnRzIG5hbWluZywgZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWd1cmVzID0gJCgnLmdhbGxlcnlfX2ZpZ3VyZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdhbGxlcnlXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY2xvc2VzdCgnLmdhbGxlcnknKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlV2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNzcygnd2lkdGgnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbHVtbnNDb3VudCA9IE1hdGgucm91bmQoZ2FsbGVyeVdpZHRoIC8gaW1hZ2VXaWR0aCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodCA9IG5ldyBBcnJheShjb2x1bW5zQ291bnQgKyAxKS5qb2luKCcwJykuc3BsaXQoJycpLm1hcCgoKSA9PiB7cmV0dXJuIDB9KSwgLy90b2RvIGRlbCBqb2luLXNwbGl0XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHQgPSBjb2x1bW5zSGVpZ2h0LnNsaWNlKDApLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICQoZmlndXJlcykuY3NzKCdtYXJnaW4tdG9wJywgJzAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZmlndXJlcywgZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ21hcmdpbi10b3AnLCAtKE1hdGgubWF4LmFwcGx5KG51bGwsIGNvbHVtbnNIZWlnaHQpIC0gY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSkgKyAncHgnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpICsgY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbHVtblBvaW50ZXIgPT09IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uc0hlaWdodC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodFtpXSArPSBjdXJyZW50Q29sdW1uc0hlaWdodFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcbi8qICAgICAgICAuY29udHJvbGxlcignR2FsbGVyeUNvbnRyb2xsZXInLCBHYWxsZXJ5Q29udHJvbGxlcik7XHJcblxyXG4gICAgR2FsbGVyeUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGltYWdlc1NyYyA9IF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhpbWFnZXNTcmMpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsqL1xyXG5cclxuLypcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0OiBcIj1haHRsR2FsbGVyeVNob3dGaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgc2hvd0FmdGVyOiBcIj1haHRsR2FsbGVyeVNob3dBZnRlclwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oKXt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYSA9IDEzO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuYSk7XHJcbiAgICAgICAgICAgIC8hKnZhciBhbGxJbWFnZXNTcmM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd0ZpcnN0SW1hZ2VzU3JjID0gWycxMjMnXTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy90b2RvXHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgfSkqIS9cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0d1ZXN0Y29tbWVudHNDb250cm9sbGVyJywgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcigkcm9vdFNjb3BlLCBndWVzdGNvbW1lbnRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMud3JpdGVDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiRsb2dnZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5nZXRHdWVzdENvbW1lbnRzKCkudGhlbihcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5zZW5kQ29tbWVudCh0aGlzLmZvcm1EYXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cy5wdXNoKHsnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZSwgJ2NvbW1lbnQnOiB0aGlzLmZvcm1EYXRhLmNvbW1lbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGF0YSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3JldmVyc2UnLCByZXZlcnNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXZlcnNlKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgICAgICAgICAvL3RvIGVycm9yc1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbXMuc2xpY2UoKS5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnLCBndWVzdGNvbW1lbnRzU2VydmljZSk7XHJcblxyXG4gICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBndWVzdGNvbW1lbnRzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0R3Vlc3RDb21tZW50czogZ2V0R3Vlc3RDb21tZW50cyxcclxuICAgICAgICAgICAgc2VuZENvbW1lbnQ6IHNlbmRDb21tZW50XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0R3Vlc3RDb21tZW50cyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb21tZW50KGNvbW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXIgPSBhdXRoU2VydmljZS5nZXRMb2dJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IHVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIEhvbWVDb250cm9sbGVyKTtcclxuXHJcbiAgICBIb21lQ29udHJvbGxlci4kaW5qZWN0ID0gWyd0cmVuZEhvdGVsc0ltZ1BhdGhzJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIodHJlbmRIb3RlbHNJbWdQYXRocykge1xyXG4gICAgICAgIHRoaXMuaG90ZWxzID0gdHJlbmRIb3RlbHNJbWdQYXRocztcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCd0cmVuZEhvdGVsc0ltZ1BhdGhzJywgW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWwxJyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWwyJyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWwzJyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWw0JyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9LHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdIb3RlbDUnLFxyXG4gICAgICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2ltYWdlcy9ob21lL3RyZW5kNi5qcGcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdIb3RlbDYnLFxyXG4gICAgICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2ltYWdlcy9ob21lL3RyZW5kNi5qcGcnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTtcclxuXHJcbiAgICBIZWFkZXJDb250cm9sbGVyLiRpbmplY3QgPSBbJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcihhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2lnbk91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbk91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsIGFodGxIZWFkZXIpO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9nJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgkdGltZW91dCwgJGxvZykge1xyXG5cdFx0ZnVuY3Rpb24gVUl0cmFuc2l0aW9ucyhjb250YWluZXIpIHtcclxuXHRcdFx0aWYgKCEkKGNvbnRhaW5lcikubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50ICcke2NvbnRhaW5lcn0nIG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmFuaW1hdGVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fY29udGFpbmVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bGV0IHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRFbGVtZW50cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke3RhcmdldEVsZW1lbnRzUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIHRvKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRsZXQgYW5pbWF0ZU9wdGlvbnMgPSB7fTtcclxuXHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayA9IGZ1bmN0aW9uKGVsZW1lbnRUcmlnZ2VyUXVlcnksIGVsZW1lbnRPblF1ZXJ5KSB7XHJcblx0XHRcdGlmICghJChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5sZW5ndGggfHwgISQoZWxlbWVudE9uUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2VsZW1lbnRUcmlnZ2VyUXVlcnl9ICR7ZWxlbWVudE9uUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWxlbWVudE9uUXVlcnkpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnMoaGVhZGVyUXVlcnksIGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdFVJdHJhbnNpdGlvbnMuY2FsbCh0aGlzLCBjb250YWluZXJRdWVyeSk7XHJcblxyXG5cdFx0XHRpZiAoISQoaGVhZGVyUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2hlYWRlclF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnRGaXhRdWVyeSwgZml4Q2xhc3NOYW1lLCB1bmZpeENsYXNzTmFtZSwgb3B0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5faGVhZGVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBmaXhFbGVtZW50ID0gJChlbGVtZW50Rml4UXVlcnkpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykuaW5uZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLnJlbW92ZUNsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b25XaWR0aENoYW5nZUhhbmRsZXIoKTtcclxuXHRcdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBvbldpZHRoQ2hhbmdlSGFuZGxlcik7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcik7XHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoKSB7XHJcblx0XHRcdGxldCBoZWFkZXIgPSBuZXcgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCcubC1oZWFkZXInLCAnLm5hdl9faXRlbS1jb250YWluZXInKTtcclxuXHJcblx0XHRcdGhlYWRlci5hbmltYXRlVHJhbnNpdGlvbihcclxuXHRcdFx0XHQnLnN1Yi1uYXYnLCB7XHJcblx0XHRcdFx0XHRjc3NFbnVtZXJhYmxlUnVsZTogJ2hlaWdodCcsXHJcblx0XHRcdFx0XHRkZWxheTogMzAwfSlcclxuXHRcdFx0XHQucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrKFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtdHJpZ2dlcl0nLFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtb25dJylcclxuXHRcdFx0XHQuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHRcdCdqc19uYXYtLWZpeGVkJyxcclxuXHRcdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdFx0b25NYXhXaW5kb3dXaWR0aDogODUwfSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTW9kYWwnLCBhaHRsTW9kYWxEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgcmVwbGFjZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxNb2RhbERpcmVjdGl2ZUxpbmssXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL21vZGFsL21vZGFsLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignbW9kYWxPcGVuJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdpbWFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3JjID0gZGF0YS5zcmM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlRGlhbG9nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2FjdGl2aXRpZXNmaWx0ZXInLCBhY3Rpdml0aWVzRmlsdGVyKTtcclxuXHJcbiAgICBhY3Rpdml0aWVzRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhY3Rpdml0aWVzRmlsdGVyKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyZywgX3N0cmluZ0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc3RyaW5nTGVuZ3RoID0gcGFyc2VJbnQoX3N0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4oc3RyaW5nTGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBDYW4ndCBwYXJzZSBhcmd1bWVudDogJHtfc3RyaW5nTGVuZ3RofWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBhcmcuam9pbignLCAnKS5zbGljZSgwLCBzdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5zbGljZSgwLCByZXN1bHQubGFzdEluZGV4T2YoJywnKSkgKyAnLi4uJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUmVzb3J0Q29udHJvbGxlcicsIFJlc29ydENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFJlc29ydENvbnRyb2xsZXIuJGluamVjdCA9IFsnaG90ZWxEZXRhaWxzQ29uc3RhbnQnLCAncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJlc29ydENvbnRyb2xsZXIoaG90ZWxEZXRhaWxzQ29uc3RhbnQsIHJlc29ydFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlckZpbHRlcnNMaXN0ID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMuZmlsdGVycy5wcmljZSA9IHtcclxuICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICBtYXg6IDEwMDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmhvdGVscyA9IHt9O1xyXG5cclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gcmVzcG9uc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICAvKigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSlcclxuICAgICAgICAgICAgfSk7Ki9cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ3Jlc29ydFNlcnZpY2UnLCByZXNvcnRTZXJ2aWNlKTtcclxuXHJcbiAgICByZXNvcnRTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzb3J0U2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRSZXNvcnQ6IGdldFJlc29ydFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlc29ydCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmhvdGVsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSlcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsVG9wMycsIGFodGxUb3AzRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsVG9wM0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyd0b3AzU2VydmljZScsICdob3RlbERldGFpbHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxUb3AzRGlyZWN0aXZlKHRvcDNTZXJ2aWNlLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxUb3AzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndG9wMycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC90b3AzLnRlbXBsYXRlLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bFRvcDNDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICB0aGlzLmRldGFpbHMgPSBob3RlbERldGFpbHNDb25zdGFudC5tdXN0SGF2ZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnRUeXBlID0gJGF0dHJzLmFodGxUb3AzdHlwZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRJbWdTcmMgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvaW1hZ2VzLycgKyB0aGlzLnJlc29ydFR5cGUgKyAnLycgKyB0aGlzLnJlc29ydFtpbmRleF0uaW1nLmZpbGVuYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzUmVzb3J0SW5jbHVkZURldGFpbCA9IGZ1bmN0aW9uKGl0ZW0sIGRldGFpbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGFpbENsYXNzTmFtZSA9ICd0b3AzX19kZXRhaWwtY29udGFpbmVyLS0nICsgZGV0YWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSA9ICFpdGVtLmRldGFpbHNbZGV0YWlsXSA/ICcgdG9wM19fZGV0YWlsLWNvbnRhaW5lci0taGFzbnQnIDogJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFpbENsYXNzTmFtZSArIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdG9wM1NlcnZpY2UuZ2V0VG9wM1BsYWNlcyh0aGlzLnJlc29ydFR5cGUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5yZXNvcnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCd0b3AzU2VydmljZScsIHRvcDNTZXJ2aWNlKTtcclxuXHJcbiAgICB0b3AzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvcDNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvcDNQbGFjZXM6IGdldFRvcDNQbGFjZXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUb3AzUGxhY2VzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LnRvcDMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuYW5pbWF0aW9uKCcuc2xpZGVyX19pbWcnLCBhbmltYXRpb25GdW5jdGlvbik7XHJcblxyXG5cdGZ1bmN0aW9uIGFuaW1hdGlvbkZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0YmVmb3JlQWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHRsZXQgc2xpZGluZ0RpcmVjdGlvbiA9IGVsZW1lbnQuc2NvcGUoKS5zbGlkaW5nRGlyZWN0aW9uO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzEnKTtcclxuXHJcblx0XHRcdFx0aWYoc2xpZGluZ0RpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICcxMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnLTIwMCUnfSwgNTAwLCBkb25lKTsgLy8yMDA/ICQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJywgYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsUHJpY2VTbGlkZXInLCBwcmljZVNsaWRlckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgcHJpY2VTbGlkZXJEaXJlY3RpdmUuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIG1pbjogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBtYXg6IFwiQFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdFNsaWRlcjogJz0nLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRTbGlkZXI6ICc9J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IHByaWNlU2xpZGVyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlTGluaygkc2NvcGUsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG4gICAgICAgICAgICBsZXQgcmlnaHRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JyksXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1sZWZ0JyksXHJcbiAgICAgICAgICAgICAgICBzbGlkZUFyZWFXaWR0aCA9IHBhcnNlSW50KCQoJy5zbGlkZScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZVBlclN0ZXAgPSAkc2NvcGUubWF4IC8gKHNsaWRlQXJlYVdpZHRoIC0gMjApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm1pbiA9IHBhcnNlSW50KCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkc2NvcGUubWF4ID0gcGFyc2VJbnQoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoJHNjb3BlLm1pbik7XHJcbiAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgkc2NvcGUubWF4KTtcclxuXHJcbiAgICAgICAgICAgIGluaXREcmFnKFxyXG4gICAgICAgICAgICAgICAgcmlnaHRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBzbGlkZUFyZWFXaWR0aCxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpKTtcclxuXHJcbiAgICAgICAgICAgIGluaXREcmFnKFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0bixcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICsgMjAsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiAwKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXREcmFnKGRyYWdFbGVtLCBpbml0UG9zaXRpb24sIG1heFBvc2l0aW9uLCBtaW5Qb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNoaWZ0O1xyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZWRvd24nLCBidG5Pbk1vdXNlRG93bik7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZURvd24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzaGlmdCA9IGV2ZW50LnBhZ2VYO1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRQb3NpdGlvbiA9IHBhcnNlSW50KGRyYWdFbGVtLmNzcygnbGVmdCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRvY09uTW91c2VNb3ZlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uTGVzc1RoYW5NYXggPSBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0IDw9IG1heFBvc2l0aW9uKCkgLSAyMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25HcmF0ZXJUaGFuTWluID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA+PSBtaW5Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zaXRpb25MZXNzVGhhbk1heCAmJiBwb3NpdGlvbkdyYXRlclRoYW5NaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0uY3NzKCdsZWZ0JywgaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0VsZW0uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gaW5pdFBvc2l0aW9uIC0gZXZlbnQucGFnZVggKyBzaGlmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFByaWNlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlVXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ2RyYWdzdGFydCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFByaWNlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TWluID0gfn4ocGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkgKiB2YWx1ZVBlclN0ZXApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdNYXggPSB+fihwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgKiB2YWx1ZVBlclN0ZXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwobmV3TWluKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwobmV3TWF4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyokc2NvcGUuJGJyb2FkY2FzdCgncHJpY2VTbGlkZXJQb3NpdGlvbkNoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRCdG4uY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodEJ0bi5jc3MoJ2xlZnQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKi9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRTbGlkZXJzKGJ0biwgbmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3UG9zdGlvbiA9IG5ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ0bi5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1Bvc3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0Jywgc2xpZGVBcmVhV2lkdGggLSBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGVtaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS5vbignY2hhbmdlIGtleXVwIHBhc3RlIGlucHV0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ZhbHVlID0gJCh0aGlzKS52YWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgLSAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhO2wnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2xpZGVycyhsZWZ0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS5vbignY2hhbmdlIGtleXVwIHBhc3RlIGlucHV0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ZhbHVlID0gJCh0aGlzKS52YWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSA+ICRzY29wZS5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld1ZhbHVlLCRzY29wZS5tYXggKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcCA8IHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICsgMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMocmlnaHRCdG4sIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGVtaXQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxlZnRTbGlkZXIgPSAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIgPSAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW46ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXg6ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coMTMpOyovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy90b2RvIGllOCBidWcgZml4XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdpZTgnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuZmluZCgnLnNsaWRlX19wb2ludGVyLS1sZWZ0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKS5jc3MoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCtzbGlkZUFyZWFXaWR0aCAtICtuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0JywgK3NsaWRlQXJlYVdpZHRoIC0gcGFyc2VJbnQobmV3VmFsdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTsqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyJdfQ==
