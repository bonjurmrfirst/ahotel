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

        guests: ['1', '2', '3', '4', '5'],

        mustHaves: ['restaurant', 'kids', 'pool', 'spa', 'wifi', 'pet', 'disable', 'beach', 'parking', 'conditioning', 'lounge', 'terrace', 'garden', 'gym', 'bicycles'],

        activities: ['Cooking classes', 'Cycling', 'Fishing', 'Golf', 'Hiking', 'Horse-riding', 'Kayaking', 'Nightlife', 'Sailing', 'Scuba diving', 'Shopping / markets', 'Snorkelling', 'Skiing', 'Surfing', 'Wildlife', 'Windsurfing', 'Wine tasting', 'Yoga'],

        price: ["min", "max"]
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

    angular.module('ahotelApp').directive('ahtlMap', ahtlMapDirective);

    function ahtlMapDirective() {
        return {
            restrict: 'E',
            template: '<div class="destinations__map"></div>',
            link: ahtlMapDirectiveLink
        };

        function ahtlMapDirectiveLink($scope, elem, attr) {
            if (window.google && 'maps' in window.google) {
                initMap();
                return;
            }

            var mapScript = document.createElement('script');
            mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxCK2-uVyl69wn7K61NPAQDf7yH-jf3w';
            mapScript.onload = function () {
                initMap();
            };
            document.body.appendChild(mapScript);

            function initMap() {
                var locations = [["Otjozondjupa Region, Kalahari Desert, Namibia", -20.330869, 17.346563], ["Sirte District, Sahara Desert, Libya", 31.195005, 16.500483], ["Limpopo, South Africa", -23.789900, 30.175637], ["Bububu, Zanzibar Town Tanzania", -6.101247, 39.215758], ["Madang Province, Papua New Guinea", -5.510379, 145.980497], ["Saint Andre, Reunion", -20.919410, 55.642483], ["Lubombo Region, Swaziland", -26.784930, 31.734820], ["Cantagalo S?o Tom? and Pr?ncipe", 0.237637, 6.738835], ["Ampanihy Madagascar", -25.023296, 44.063869], ["Plaine Corail-La Fouche Corail Mauritius", -19.740817, 63.363294], ["South Agalega Islands Mauritius", -10.455412, 56.685301], ["North Agalega Islands Mauritius", -10.433995, 56.647268], ["Coetivy Seychelles", -7.140338, 56.270384], ["Dembeni Mayotte", -12.839928, 45.190855], ["Babyntsi Kyivs'ka oblast, Ukraine", 50.638800, 30.022539], ["Pechykhvosty, Volyns'ka oblast, Ukraine", 50.502495, 24.614732], ["Bilhorod-Dnistrovs'kyi district, Odessa Oblast, Ukraine", 46.061116, 30.412401], ["Petrushky, Kyivs'ka oblast, Ukraine", 50.420998, 30.161548], ["Velyka Doch, Chernihivs'ka oblast, Ukraine", 51.307518, 32.574232]];

                var myLatLng = { lat: -25.363, lng: 131.044 };

                // Create a map object and specify the DOM element for display.
                var map = new google.maps.Map(document.getElementsByClassName('destinations__map')[0], {
                    scrollwheel: false
                });

                var icons = {
                    ahotel: {
                        icon: 'assets/images/icon_map.png'
                    }
                };

                for (i = 0; i < locations.length; i++) {
                    var marker = new google.maps.Marker({
                        title: locations[i][0],
                        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
                        map: map,
                        icon: icons["ahotel"].icon
                    });
                }

                /*centering*/
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < locations.length; i++) {
                    var LatLang = new google.maps.LatLng(locations[i][1], locations[i][2]);
                    bounds.extend(LatLang);
                }
                map.fitBounds(bounds);
            };
        }
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
            $scope.show = {};

            $scope.$on('modalOpen', function (event, data) {
                if (data.show === 'image') {
                    $scope.src = data.src;
                    $scope.show.img = true;
                    $scope.$apply(); //todo apply?
                    elem.css('display', 'block');
                }

                if (data.show === 'map') {
                    $scope.show.map = true;

                    window.google = undefined;

                    if (window.google && 'maps' in window.google) {
                        initMap();
                    } else {

                        var mapScript = document.createElement('script');
                        mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxCK2-uVyl69wn7K61NPAQDf7yH-jf3w';
                        mapScript.onload = function () {
                            initMap();
                            elem.css('display', 'block');
                        };
                        document.body.appendChild(mapScript);
                    }
                }

                function initMap() {
                    var myLatlng = { lat: data.coord.lat, lng: data.coord.lng };

                    var map = new google.maps.Map(document.getElementsByClassName('modal__map')[0], {
                        zoom: 4,
                        center: myLatlng
                    });

                    var marker = new google.maps.Marker({
                        position: myLatlng,
                        map: map,
                        title: data.name
                    });
                }
            });

            $scope.closeDialog = function () {
                elem.css('display', 'none');
                $scope.show = {};
            };

            function initMap(name, coord) {
                var locations = [[name, coord.lat, coord.lng]];

                // Create a map object and specify the DOM element for display.
                var modalMap = new google.maps.Map(document.getElementsByClassName('modal__map')[0], {
                    center: { lat: coord.lat, lng: coord.lng },
                    scrollwheel: false,
                    zoom: 9
                });

                var icons = {
                    ahotel: {
                        icon: 'assets/images/icon_map.png'
                    }
                };

                new google.maps.Marker({
                    title: name,
                    position: new google.maps.LatLng(coord.lat, coord.lng),
                    map: modalMap,
                    icon: icons["ahotel"].icon
                });

                /*
                                for (i = 0; i < locations.length; i++) {
                                    var marker = new google.maps.Marker({
                                        title: name,
                                        position: new google.maps.LatLng(coord.lat, coord.lng),
                                        map: modalMap,
                                        icon: icons["ahotel"].icon
                                    });
                                }
                
                                /!*centering*!/
                                var bounds = new google.maps.LatLngBounds ();
                                for (var i = 0; i < locations.length; i++) {
                                    var LatLang = new google.maps.LatLng (locations[i][1], locations[i][2]);
                                    bounds.extend(LatLang);
                                }
                                modalMap.fitBounds(bounds);*/
            }
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').filter('activitiesFilter', activitiesFilter);

    activitiesFilter.$inject = ['$log'];

    function activitiesFilter($log, filtersService) {
        return function (arg, _stringLength) {
            var stringLength = parseInt(_stringLength);

            if (isNaN(stringLength)) {
                $log.warn('Can\'t parse argument: ' + _stringLength);
                return arg;
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

    ResortController.$inject = ['resortService', 'hotelDetailsConstant', '$filter', '$scope'];

    function ResortController(resortService, hotelDetailsConstant, $filter, $scope) {
        var _this = this;

        this.filters = initFilters();

        var currentFilters = {};
        this.onFilterChange = function (filterGroup, filter, value) {
            //console.log(filterGroup, filter, value);
            if (value) {
                currentFilters[filterGroup] = currentFilters[filterGroup] || [];
                currentFilters[filterGroup].push(filter);
            } else {
                currentFilters[filterGroup].splice(currentFilters[filterGroup].indexOf(filter), 1);
                if (currentFilters[filterGroup].length === 0) {
                    delete currentFilters[filterGroup];
                }
            }

            this.hotels = $filter('hotelFilter')(hotels, currentFilters);
            this.getShowHotelCount = this.hotels.reduce(function (counter, item) {
                return item._hide ? counter : ++counter;
            }, 0);
            $scope.$broadcast('showHotelCountChanged', this.getShowHotelCount);
        };

        var hotels = {};
        resortService.getResort().then(function (response) {
            hotels = response;
            _this.hotels = hotels;

            $scope.$watch(function () {
                return _this.filters.price;
            }, function (newValue) {
                currentFilters.price = [newValue];
                //console.log(currentFilters);

                _this.hotels = $filter('hotelFilter')(hotels, currentFilters);
                _this.getShowHotelCount = _this.hotels.reduce(function (counter, item) {
                    return item._hide ? counter : ++counter;
                }, 0);
                $scope.$broadcast('showHotelCountChanged', _this.getShowHotelCount);
            }, true);

            _this.getShowHotelCount = _this.hotels.reduce(function (counter, item) {
                return item._hide ? counter : ++counter;
            }, 0);
            $scope.$broadcast('showHotelCountChanged', _this.getShowHotelCount);
        });

        this.openMap = function (hotelName, hotelCoord, hotel) {
            var data = {
                show: 'map',
                name: hotelName,
                coord: hotelCoord
            };
            $scope.$root.$broadcast('modalOpen', data);
        };

        function initFilters() {
            var filters = {};

            for (var key in hotelDetailsConstant) {
                filters[key] = {};
                for (var i = 0; i < hotelDetailsConstant[key].length; i++) {
                    filters[key][hotelDetailsConstant[key][i]] = false;
                }
            }

            filters.price = {
                min: 0,
                max: 1000
            };

            return filters;
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').filter('hotelFilter', hotelFilter);

    hotelFilter.$inject = ['$log'];

    function hotelFilter($log) {
        return function (hotels, filters) {
            angular.forEach(hotels, function (hotel) {
                hotel._hide = false;
                isHotelMatchingFilters(hotel, filters);
            });

            function isHotelMatchingFilters(hotel, filters) {

                angular.forEach(filters, function (filtersInGroup, filterGroup) {
                    var matchAtLeaseOneFilter = false;

                    if (filterGroup === 'guests') {
                        filtersInGroup = [filtersInGroup[filtersInGroup.length - 1]];
                    }

                    for (var i = 0; i < filtersInGroup.length; i++) {
                        if (getHotelProp(hotel, filterGroup, filtersInGroup[i])) {
                            matchAtLeaseOneFilter = true;
                            break;
                        }
                    }

                    if (!matchAtLeaseOneFilter) {
                        hotel._hide = true;
                    }
                });
            }

            function getHotelProp(hotel, filterGroup, filter) {
                switch (filterGroup) {
                    case 'locations':
                        return hotel.location.country === filter;
                    case 'types':
                        return hotel.type === filter;
                    case 'settings':
                        return hotel.environment === filter;
                    case 'mustHaves':
                        return hotel.details[filter];
                    case 'activities':
                        return ~hotel.activities.indexOf(filter);
                    case 'price':
                        return hotel.price >= filter.min && hotel.price <= filter.max;
                    case 'guests':
                        return hotel.guests.max >= +filter[0];
                }
            }

            return hotels.filter(function (hotel) {
                return !hotel._hide;
            });
        };
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').directive('scrollToTop', scrollToTopDirective);

    scrollToTopDirective.$inject = ['$window', '$log'];

    function scrollToTopDirective($log) {
        return {
            restrict: 'A',
            link: scrollToTopDirectiveLink
        };

        function scrollToTopDirectiveLink($scope, elem, attr) {
            var selector = void 0,
                height = void 0;

            if (1) {
                try {
                    selector = $.trim(attr.scrollToTopConfig.slice(0, attr.scrollToTopConfig.indexOf(',')));
                    height = parseInt(attr.scrollToTopConfig.slice(attr.scrollToTopConfig.indexOf(',') + 1));
                } catch (e) {
                    $log.warn('scroll-to-top-config is not defined');
                } finally {
                    selector = selector || 'html, body';
                    height = height || 0;
                }
            }

            angular.element(elem).on(attr.scrollToTop, function () {
                $(selector).animate({ scrollTop: height }, "slow");
            });
        }
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
                //console.log(response.data)
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

    angular.module('ahotelApp').controller('Pages', Pages);

    Pages.$inject = ['$scope'];

    function Pages($scope) {
        var _this = this;

        var hotelsPerPage = 5;

        this.currentPage = 1;
        this.pagesTotal = [];

        this.showFrom = function () {
            return (this.currentPage - 1) * hotelsPerPage;
        };

        this.showNext = function () {
            return ++this.currentPage;
        };

        this.showPrev = function () {
            return --this.currentPage;
        };

        this.setPage = function (page) {
            this.currentPage = page + 1;
        };

        this.isLastPage = function () {
            return this.pagesTotal.length === this.currentPage;
        };

        this.isFirstPage = function () {
            return this.currentPage === 1;
        };

        $scope.$on('showHotelCountChanged', function (event, showHotelCount) {
            _this.pagesTotal = new Array(Math.ceil(showHotelCount / hotelsPerPage));
            _this.currentPage = 1;
        });
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').filter('showFrom', showFrom);

    function showFrom() {
        return function (model, startPosition) {
            if (!model) {
                return {};
            }

            return model.slice(startPosition);
        };
    }
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
            /*console.log($scope.leftSlider);
            console.log($scope.rightSlider);
            $scope.rightSlider.max = 15;*/
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
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').directive('ahtlSlideOnClick', ahtlSlideOnClickDirective);

    ahtlSlideOnClickDirective.$inject = ['$log'];

    function ahtlSlideOnClickDirective($log) {
        return {
            restrict: 'EA',
            link: ahtlSlideOnClickDirectiveLink
        };

        function ahtlSlideOnClickDirectiveLink($scope, elem) {
            var slideEmitElements = $(elem).find('[slide-emit]');

            if (!slideEmitElements.length) {
                $log.warn('slide-emit not found');

                return;
            }

            slideEmitElements.on('click', slideEmitOnClick);

            function slideEmitOnClick() {
                var slideOnElement = $(elem).find('[slide-on]');

                if (!slideEmitElements.length) {
                    $log.warn('slide-emit not found');

                    return;
                }

                if (slideOnElement.attr('slide-on') !== '' && slideOnElement.attr('slide-on') !== 'closed') {
                    $log.warn('Wrong init value for \'slide-on\' attribute, should be \'\' or \'closed\'.');

                    return;
                }

                if (slideOnElement.attr('slide-on') === '') {
                    slideOnElement.slideUp('slow', onSlideAnimationComplete);
                    slideOnElement.attr('slide-on', 'closed');
                } else {
                    onSlideAnimationComplete();
                    slideOnElement.slideDown('slow');
                    slideOnElement.attr('slide-on', '');
                }

                function onSlideAnimationComplete() {
                    var slideToggleElements = $(elem).find('[slide-on-toggle]');

                    $.each(slideToggleElements, function () {
                        $(this).toggleClass($(this).attr('slide-on-toggle'));
                    });
                }
            }
        }
    }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9kZXN0aW5hdGlvbnMvbWFwLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5maWx0ZXIuanMiLCJwYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXIuYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyVHJhbnNpdGlvbnMuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zdGlreUhlYWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9ob21lL2hvbWUuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS50cmVuZEhvdGVsc0ltZ1BhdGhzLmpzIiwicGFydGlhbHMvbW9kYWwvbW9kYWwuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5hY3Rpdml0aWVzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaG90ZWwuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5zY3JvbGx0b1RvcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuYW5pbWF0aW9uLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyUGF0aC5jb25zdGFudC5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvc2xpZGVPbkNsaWNrL3NsaWRlT25DbGljay5kaXJlY3RpdmUuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRwcm92aWRlIiwiZGVjb3JhdG9yIiwiJGRlbGVnYXRlIiwiJHdpbmRvdyIsImxvZ0hpc3RvcnkiLCJ3YXJuIiwiZXJyIiwibG9nIiwibWVzc2FnZSIsIl9sb2dXYXJuIiwicHVzaCIsImFwcGx5IiwiX2xvZ0VyciIsImVycm9yIiwibmFtZSIsInN0YWNrIiwiRXJyb3IiLCJzZW5kT25VbmxvYWQiLCJvbmJlZm9yZXVubG9hZCIsImxlbmd0aCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIiRpbmplY3QiLCJwcmVsb2FkU2VydmljZVByb3ZpZGVyIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCJnYWxsZXJ5IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCJvdGhlcndpc2UiLCJzdGF0ZSIsInVybCIsInRlbXBsYXRlVXJsIiwicGFyYW1zIiwicnVuIiwiJHJvb3RTY29wZSIsInByZWxvYWRTZXJ2aWNlIiwiJGxvZ2dlZCIsIiRzdGF0ZSIsImN1cnJlbnRTdGF0ZU5hbWUiLCJjdXJyZW50U3RhdGVQYXJhbXMiLCJzdGF0ZUhpc3RvcnkiLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsIm9ubG9hZCIsInByZWxvYWRJbWFnZXMiLCJtZXRob2QiLCJhY3Rpb24iLCJwcm92aWRlciIsInRpbWVvdXQiLCIkZ2V0IiwiJGh0dHAiLCIkdGltZW91dCIsInByZWxvYWRDYWNoZSIsImxvZ2dlciIsImNvbnNvbGUiLCJkZWJ1ZyIsInByZWxvYWROYW1lIiwiaW1hZ2VzIiwiaW1hZ2VzU3JjTGlzdCIsInNyYyIsInByZWxvYWQiLCJ0aGVuIiwicmVzcG9uc2UiLCJkYXRhIiwiYmluZCIsImkiLCJpbWFnZSIsIkltYWdlIiwiZSIsIm9uZXJyb3IiLCJnZXRQcmVsb2FkIiwiZ2V0UHJlbG9hZENhY2hlIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImd1ZXN0Y29tbWVudHMiLCJob3RlbHMiLCJ0eXBlcyIsInNldHRpbmdzIiwibG9jYXRpb25zIiwiZ3Vlc3RzIiwibXVzdEhhdmVzIiwiYWN0aXZpdGllcyIsInByaWNlIiwiY29udHJvbGxlciIsIkF1dGhDb250cm9sbGVyIiwiJHNjb3BlIiwiYXV0aFNlcnZpY2UiLCJ2YWxpZGF0aW9uU3RhdHVzIiwidXNlckFscmVhZHlFeGlzdHMiLCJsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QiLCJjcmVhdGVVc2VyIiwibmV3VXNlciIsImdvIiwibG9naW5Vc2VyIiwic2lnbkluIiwidXNlciIsInByZXZpb3VzU3RhdGUiLCJmYWN0b3J5IiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsIl9jcmVkZW50aWFscyIsIl9vblJlc29sdmUiLCJzdGF0dXMiLCJ0b2tlbiIsIl90b2tlbktlZXBlciIsInNhdmVUb2tlbiIsIl9vblJlamVjdGVkIiwiX3Rva2VuIiwiZ2V0VG9rZW4iLCJkZWxldGVUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwic2lnbk91dCIsImdldExvZ0luZm8iLCJkaXJlY3RpdmUiLCJhaHRsTWFwRGlyZWN0aXZlIiwicmVzdHJpY3QiLCJ0ZW1wbGF0ZSIsImxpbmsiLCJhaHRsTWFwRGlyZWN0aXZlTGluayIsImVsZW0iLCJhdHRyIiwid2luZG93IiwiZ29vZ2xlIiwiaW5pdE1hcCIsIm1hcFNjcmlwdCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsIm15TGF0TG5nIiwibGF0IiwibG5nIiwibWFwIiwibWFwcyIsIk1hcCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJzY3JvbGx3aGVlbCIsImljb25zIiwiYWhvdGVsIiwiaWNvbiIsIm1hcmtlciIsIk1hcmtlciIsInRpdGxlIiwicG9zaXRpb24iLCJMYXRMbmciLCJib3VuZHMiLCJMYXRMbmdCb3VuZHMiLCJMYXRMYW5nIiwiZXh0ZW5kIiwiZml0Qm91bmRzIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmUiLCJzY29wZSIsInNob3dGaXJzdEltZ0NvdW50Iiwic2hvd05leHRJbWdDb3VudCIsIkFodGxHYWxsZXJ5Q29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsImFodGxHYWxsZXJ5TGluayIsImFsbEltYWdlc1NyYyIsImxvYWRNb3JlIiwiTWF0aCIsIm1pbiIsInNob3dGaXJzdCIsInNsaWNlIiwiaXNBbGxJbWFnZXNMb2FkZWQiLCJhbGxJbWFnZXNMb2FkZWQiLCJpbWFnZXNDb3VudCIsImFsaWduSW1hZ2VzIiwiJCIsIl9zZXRJbWFnZUFsaWdtZW50Iiwib24iLCJfZ2V0SW1hZ2VTb3VyY2VzIiwiaW1nU3JjIiwidGFyZ2V0IiwiJHJvb3QiLCIkYnJvYWRjYXN0Iiwic2hvdyIsImNiIiwiZmlndXJlcyIsImdhbGxlcnlXaWR0aCIsInBhcnNlSW50IiwiY2xvc2VzdCIsImNzcyIsImltYWdlV2lkdGgiLCJjb2x1bW5zQ291bnQiLCJyb3VuZCIsImNvbHVtbnNIZWlnaHQiLCJBcnJheSIsImpvaW4iLCJzcGxpdCIsImN1cnJlbnRDb2x1bW5zSGVpZ2h0IiwiY29sdW1uUG9pbnRlciIsImVhY2giLCJpbmRleCIsIm1heCIsIkd1ZXN0Y29tbWVudHNDb250cm9sbGVyIiwiZ3Vlc3Rjb21tZW50c1NlcnZpY2UiLCJjb21tZW50cyIsIm9wZW5Gb3JtIiwic2hvd1BsZWFzZUxvZ2lNZXNzYWdlIiwid3JpdGVDb21tZW50IiwiZ2V0R3Vlc3RDb21tZW50cyIsImFkZENvbW1lbnQiLCJzZW5kQ29tbWVudCIsImZvcm1EYXRhIiwiY29tbWVudCIsImZpbHRlciIsInJldmVyc2UiLCJpdGVtcyIsInR5cGUiLCJvblJlc29sdmUiLCJvblJlamVjdCIsIkhlYWRlckNvbnRyb2xsZXIiLCJhaHRsSGVhZGVyIiwic2VydmljZSIsIkhlYWRlclRyYW5zaXRpb25zU2VydmljZSIsIiRsb2ciLCJVSXRyYW5zaXRpb25zIiwiY29udGFpbmVyIiwiX2NvbnRhaW5lciIsImFuaW1hdGVUcmFuc2l0aW9uIiwidGFyZ2V0RWxlbWVudHNRdWVyeSIsImNzc0VudW1lcmFibGVSdWxlIiwiZnJvbSIsInRvIiwiZGVsYXkiLCJtb3VzZWVudGVyIiwidGFyZ2V0RWxlbWVudHMiLCJmaW5kIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJzY3JvbGxUb3AiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwiYWh0bFN0aWt5SGVhZGVyIiwiaGVhZGVyIiwiSG9tZUNvbnRyb2xsZXIiLCJ0cmVuZEhvdGVsc0ltZ1BhdGhzIiwiYWh0bE1vZGFsRGlyZWN0aXZlIiwicmVwbGFjZSIsImFodGxNb2RhbERpcmVjdGl2ZUxpbmsiLCJpbWciLCIkYXBwbHkiLCJ1bmRlZmluZWQiLCJteUxhdGxuZyIsImNvb3JkIiwiem9vbSIsImNlbnRlciIsImNsb3NlRGlhbG9nIiwibW9kYWxNYXAiLCJhY3Rpdml0aWVzRmlsdGVyIiwiZmlsdGVyc1NlcnZpY2UiLCJhcmciLCJfc3RyaW5nTGVuZ3RoIiwic3RyaW5nTGVuZ3RoIiwiaXNOYU4iLCJyZXN1bHQiLCJsYXN0SW5kZXhPZiIsIlJlc29ydENvbnRyb2xsZXIiLCJyZXNvcnRTZXJ2aWNlIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCIkZmlsdGVyIiwiZmlsdGVycyIsImluaXRGaWx0ZXJzIiwiY3VycmVudEZpbHRlcnMiLCJvbkZpbHRlckNoYW5nZSIsImZpbHRlckdyb3VwIiwidmFsdWUiLCJzcGxpY2UiLCJpbmRleE9mIiwiZ2V0U2hvd0hvdGVsQ291bnQiLCJyZWR1Y2UiLCJjb3VudGVyIiwiaXRlbSIsIl9oaWRlIiwiZ2V0UmVzb3J0IiwiJHdhdGNoIiwibmV3VmFsdWUiLCJvcGVuTWFwIiwiaG90ZWxOYW1lIiwiaG90ZWxDb29yZCIsImhvdGVsIiwia2V5IiwiaG90ZWxGaWx0ZXIiLCJmb3JFYWNoIiwiaXNIb3RlbE1hdGNoaW5nRmlsdGVycyIsImZpbHRlcnNJbkdyb3VwIiwibWF0Y2hBdExlYXNlT25lRmlsdGVyIiwiZ2V0SG90ZWxQcm9wIiwibG9jYXRpb24iLCJjb3VudHJ5IiwiZW52aXJvbm1lbnQiLCJkZXRhaWxzIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmUiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsiLCJzZWxlY3RvciIsImhlaWdodCIsInRyaW0iLCJzY3JvbGxUb1RvcENvbmZpZyIsImVsZW1lbnQiLCJzY3JvbGxUb1RvcCIsIm9uUmVqZWN0ZWQiLCJhaHRsVG9wM0RpcmVjdGl2ZSIsInRvcDNTZXJ2aWNlIiwiQWh0bFRvcDNDb250cm9sbGVyIiwiJGVsZW1lbnQiLCIkYXR0cnMiLCJtdXN0SGF2ZSIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJmaWxlbmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbCIsImRldGFpbCIsImRldGFpbENsYXNzTmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSIsImdldFRvcDNQbGFjZXMiLCJhbmltYXRpb24iLCJhbmltYXRpb25GdW5jdGlvbiIsImJlZm9yZUFkZENsYXNzIiwiY2xhc3NOYW1lIiwiZG9uZSIsInNsaWRpbmdEaXJlY3Rpb24iLCJhaHRsU2xpZGVyIiwic2xpZGVyU2VydmljZSIsImFodGxTbGlkZXJDb250cm9sbGVyIiwic2xpZGVyIiwibmV4dFNsaWRlIiwicHJldlNsaWRlIiwic2V0U2xpZGUiLCJzZXROZXh0U2xpZGUiLCJzZXRQcmV2U2xpZGUiLCJnZXRDdXJyZW50U2xpZGUiLCJzZXRDdXJyZW50U2xpZGUiLCJmaXhJRThwbmdCbGFja0JnIiwiYXJyb3dzIiwiY2xpY2siLCJkaXNhYmxlZCIsInNsaWRlckltZ1BhdGhDb25zdGFudCIsIlNsaWRlciIsInNsaWRlckltYWdlTGlzdCIsIl9pbWFnZVNyY0xpc3QiLCJfY3VycmVudFNsaWRlIiwiZ2V0SW1hZ2VTcmNMaXN0IiwiZ2V0SW5kZXgiLCJzbGlkZSIsIlBhZ2VzIiwiaG90ZWxzUGVyUGFnZSIsImN1cnJlbnRQYWdlIiwicGFnZXNUb3RhbCIsInNob3dGcm9tIiwic2hvd05leHQiLCJzaG93UHJldiIsInNldFBhZ2UiLCJwYWdlIiwiaXNMYXN0UGFnZSIsImlzRmlyc3RQYWdlIiwic2hvd0hvdGVsQ291bnQiLCJjZWlsIiwibW9kZWwiLCJzdGFydFBvc2l0aW9uIiwicHJpY2VTbGlkZXJEaXJlY3RpdmUiLCJsZWZ0U2xpZGVyIiwicmlnaHRTbGlkZXIiLCJwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsiLCJyaWdodEJ0biIsImxlZnRCdG4iLCJzbGlkZUFyZWFXaWR0aCIsInZhbHVlUGVyU3RlcCIsInZhbCIsImluaXREcmFnIiwiZHJhZ0VsZW0iLCJpbml0UG9zaXRpb24iLCJtYXhQb3NpdGlvbiIsIm1pblBvc2l0aW9uIiwic2hpZnQiLCJidG5Pbk1vdXNlRG93biIsInBhZ2VYIiwiZG9jT25Nb3VzZU1vdmUiLCJidG5Pbk1vdXNlVXAiLCJwb3NpdGlvbkxlc3NUaGFuTWF4IiwicG9zaXRpb25HcmF0ZXJUaGFuTWluIiwic2V0UHJpY2VzIiwiZW1pdCIsIm5ld01pbiIsIm5ld01heCIsInNldFNsaWRlcnMiLCJidG4iLCJuZXdQb3N0aW9uIiwiaGFzQ2xhc3MiLCJ0cmlnZ2VyIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rIiwic2xpZGVFbWl0RWxlbWVudHMiLCJzbGlkZUVtaXRPbkNsaWNrIiwic2xpZGVPbkVsZW1lbnQiLCJzbGlkZVVwIiwib25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlIiwic2xpZGVEb3duIiwic2xpZGVUb2dnbGVFbGVtZW50cyIsInRvZ2dsZUNsYXNzIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUEsUUFDS0MsT0FBTyxhQUFhLENBQUMsYUFBYSxXQUFXO0tB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akQsSUFBSThTLG9CQUFvQjlQLEVBQUVoRCxNQUFNNEcsS0FBSzs7WUFFckMsSUFBSSxDQUFDa00sa0JBQWtCNVosUUFBUTtnQkFDM0I4TSxLQUFLNU4sS0FBTDs7Z0JBRUE7OztZQUdKMGEsa0JBQWtCNVAsR0FBRyxTQUFTNlA7O1lBRTlCLFNBQVNBLG1CQUFtQjtnQkFDeEIsSUFBSUMsaUJBQWlCaFEsRUFBRWhELE1BQU00RyxLQUFLOztnQkFFbEMsSUFBSSxDQUFDa00sa0JBQWtCNVosUUFBUTtvQkFDM0I4TSxLQUFLNU4sS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJNGEsZUFBZS9TLEtBQUssZ0JBQWdCLE1BQU0rUyxlQUFlL1MsS0FBSyxnQkFBZ0IsVUFBVTtvQkFDeEYrRixLQUFLNU4sS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJNGEsZUFBZS9TLEtBQUssZ0JBQWdCLElBQUk7b0JBQ3hDK1MsZUFBZUMsUUFBUSxRQUFRQztvQkFDL0JGLGVBQWUvUyxLQUFLLFlBQVk7dUJBQzdCO29CQUNIaVQ7b0JBQ0FGLGVBQWVHLFVBQVU7b0JBQ3pCSCxlQUFlL1MsS0FBSyxZQUFZOzs7Z0JBR3BDLFNBQVNpVCwyQkFBMkI7b0JBQ2hDLElBQUlFLHNCQUFzQnBRLEVBQUVoRCxNQUFNNEcsS0FBSzs7b0JBRXZDNUQsRUFBRXdCLEtBQUs0TyxxQkFBcUIsWUFBVzt3QkFDbkNwUSxFQUFFLE1BQU1xUSxZQUFZclEsRUFBRSxNQUFNL0MsS0FBSzs7Ozs7O0tBdER6RCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcsIFsndWkucm91dGVyJywgJ3ByZWxvYWQnLCAnbmdBbmltYXRlJ10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uZmlnKGZ1bmN0aW9uICgkcHJvdmlkZSkge1xyXG4gICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJyRsb2cnLCBmdW5jdGlvbiAoJGRlbGVnYXRlLCAkd2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9nSGlzdG9yeSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2FybjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycjogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5sb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ1dhcm4gPSAkZGVsZWdhdGUud2FybjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS53YXJuID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nV2Fybi5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ0VyciA9ICRkZWxlZ2F0ZS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5lcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7bmFtZTogbWVzc2FnZSwgc3RhY2s6IG5ldyBFcnJvcigpLnN0YWNrfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ0Vyci5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gc2VuZE9uVW5sb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbG9nSGlzdG9yeS5lcnIubGVuZ3RoICYmICFsb2dIaXN0b3J5Lndhcm4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbigncG9zdCcsICcvYXBpL2xvZycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGxvZ0hpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGRlbGVnYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxufSkoKTtcclxuXHJcbi8qXHJcbiAgICAgICAgLmZhY3RvcnkoJ2xvZycsIGxvZyk7XHJcblxyXG4gICAgbG9nLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxvZygkd2luZG93LCAkbG9nKSB7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2goYXJncyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYnJvd3NlckxvZykge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBlcnJvcihlKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgc3RhY2s6IGUuc3RhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRsb2cuZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RvZG8gYWxsIGVycm9yc1xyXG5cclxuXHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHdhcm46IHdhcm4sXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICAgICAgc2VuZE9uVW5sb2FkOiBzZW5kT25VbmxvYWRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoY29uZmlnKTtcclxuXHJcbiAgICBjb25maWcuJGluamVjdCA9IFsncHJlbG9hZFNlcnZpY2VQcm92aWRlcicsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbmZpZyhwcmVsb2FkU2VydmljZVByb3ZpZGVyLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICBwcmVsb2FkU2VydmljZVByb3ZpZGVyLmNvbmZpZyhiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCAnR0VUJywgJ2dldCcsIDEwMCwgJ3dhcm5pbmcnKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5jb25maWcoY29uZmlnKTtcclxuXHJcblx0Y29uZmlnLiRpbmplY3QgPSBbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlciddO1xyXG5cclxuXHRmdW5jdGlvbiBjb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG5cdFx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG5cclxuXHRcdCRzdGF0ZVByb3ZpZGVyXHJcblx0XHRcdC5zdGF0ZSgnaG9tZScsIHtcclxuXHRcdFx0XHR1cmw6ICcvJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ob21lL2hvbWUuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdhdXRoJywge1xyXG5cdFx0XHRcdHVybDogJy9hdXRoJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9hdXRoL2F1dGguaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3R5cGUnOiAnbG9naW4nfS8qLFxyXG5cdFx0XHRcdG9uRW50ZXI6IGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XHJcblx0XHRcdFx0XHQkcm9vdFNjb3BlLiRzdGF0ZSA9IFwiYXV0aFwiO1xyXG5cdFx0XHRcdH0qL1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2J1bmdhbG93cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYnVuZ2Fsb3dzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvYnVuZ2Fsb3dzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnaG90ZWxzJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL3RvcCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvaG90ZWxzLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCd2aWxsYXMnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3ZpbGxhcycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL3ZpbGxhcy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2dhbGxlcnknLCB7XHJcblx0XHRcdFx0dXJsOiAnL2dhbGxlcnknLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2d1ZXN0Y29tbWVudHMnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2d1ZXN0Y29tbWVudHMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Rlc3RpbmF0aW9ucycsIHtcclxuXHRcdFx0XHRcdHVybDogJy9kZXN0aW5hdGlvbnMnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZGVzdGluYXRpb25zL2Rlc3RpbmF0aW9ucy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3Jlc29ydCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvcmVzb3J0JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcmVzb3J0Lmh0bWwnXHJcblx0XHRcdH0pO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLnJ1bihydW4pO1xyXG5cclxuICAgIHJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJyAsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdwcmVsb2FkU2VydmljZScsICckd2luZG93J107XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuKCRyb290U2NvcGUsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCBwcmVsb2FkU2VydmljZSwgJHdpbmRvdywgbG9nKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJHN0YXRlID0ge1xyXG4gICAgICAgICAgICBjdXJyZW50U3RhdGVOYW1lOiBudWxsLFxyXG4gICAgICAgICAgICBjdXJyZW50U3RhdGVQYXJhbXM6IG51bGwsXHJcbiAgICAgICAgICAgIHN0YXRlSGlzdG9yeTogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLFxyXG4gICAgICAgICAgICBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMvKiwgZnJvbVN0YXRlLCBmcm9tUGFyYW1zIHRvZG8qLyl7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVOYW1lID0gdG9TdGF0ZS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuY3VycmVudFN0YXRlUGFyYW1zID0gdG9QYXJhbXM7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkucHVzaCh0b1N0YXRlLm5hbWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHsgLy90b2RvIG9ubG9hZCDvv73vv73vv73vv73vv73vv73vv73vv70g77+9IO+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgICAgICAgICBwcmVsb2FkU2VydmljZS5wcmVsb2FkSW1hZ2VzKCdnYWxsZXJ5Jywge3VybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSwgbWV0aG9kOiAnR0VUJywgYWN0aW9uOiAnZ2V0J30pOyAvL3RvZG8gZGVsIG1ldGhvZCwgYWN0aW9uIGJ5IGRlZmF1bHRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL2xvZy5zZW5kT25VbmxvYWQoKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3ByZWxvYWQnLCBbXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwcmVsb2FkJylcclxuICAgICAgICAucHJvdmlkZXIoJ3ByZWxvYWRTZXJ2aWNlJywgcHJlbG9hZFNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHByZWxvYWRTZXJ2aWNlKCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGZ1bmN0aW9uKHVybCA9ICcvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZCA9ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0ID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICBsb2c6IGxvZ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuJGdldCA9IGZ1bmN0aW9uICgkaHR0cCwgJHRpbWVvdXQpIHtcclxuICAgICAgICAgICAgbGV0IHByZWxvYWRDYWNoZSA9IFtdLFxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyID0gZnVuY3Rpb24obWVzc2FnZSwgbG9nID0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnc2lsZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmxvZyA9PT0gJ2RlYnVnJyAmJiBsb2cgPT09ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2cgPT09ICd3YXJuaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWRJbWFnZXMocHJlbG9hZE5hbWUsIGltYWdlcykgeyAvL3RvZG8gZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VzU3JjTGlzdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW1hZ2VzID09PSAnYXJyYXknKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzU3JjTGlzdCA9IGltYWdlcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZENhY2hlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVsb2FkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5tZXRob2QgfHwgY29uZmlnLm1ldGhvZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBpbWFnZXMudXJsIHx8IGNvbmZpZy51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzOiBpbWFnZXMuYWN0aW9uIHx8IGNvbmZpZy5hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzU3JjTGlzdCA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZENhY2hlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VzU3JjTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy50aW1lb3V0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93Lm9ubG9hZCA9IHByZWxvYWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQocHJlbG9hZC5iaW5kKG51bGwsIGltYWdlc1NyY0xpc3QpLCBjb25maWcudGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvL3RvZG9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkKGltYWdlc1NyY0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlc1NyY0xpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IGltYWdlc1NyY0xpc3RbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc29sdmUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyKHRoaXMuc3JjLCAnZGVidWcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UHJlbG9hZChwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdwcmVsb2FkU2VydmljZTogZ2V0IHJlcXVlc3QgJyArICdcIicgKyBwcmVsb2FkTmFtZSArICdcIicsICdkZWJ1ZycpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVsb2FkQ2FjaGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVsb2FkQ2FjaGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJlbG9hZENhY2hlW2ldLm5hbWUgPT09IHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVsb2FkQ2FjaGVbaV0uc3JjXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxvZ2dlcignTm8gcHJlbG9hZHMgZm91bmQnLCAnd2FybmluZycpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcHJlbG9hZEltYWdlczogcHJlbG9hZEltYWdlcyxcclxuICAgICAgICAgICAgICAgIGdldFByZWxvYWRDYWNoZTogZ2V0UHJlbG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdiYWNrZW5kUGF0aHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdG9wMzogJy9hcGkvdG9wMycsXHJcbiAgICAgICAgICAgIGF1dGg6ICcvYXBpL3VzZXJzJyxcclxuICAgICAgICAgICAgZ2FsbGVyeTogJy9hcGkvZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHM6ICcvYXBpL2d1ZXN0Y29tbWVudHMnLFxyXG4gICAgICAgICAgICBob3RlbHM6ICcvYXBpL2hvdGVscydcclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdob3RlbERldGFpbHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdHlwZXM6IFtcclxuICAgICAgICAgICAgICAgICdIb3RlbCcsXHJcbiAgICAgICAgICAgICAgICAnQnVuZ2Fsb3cnLFxyXG4gICAgICAgICAgICAgICAgJ1ZpbGxhJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3M6IFtcclxuICAgICAgICAgICAgICAgICdDb2FzdCcsXHJcbiAgICAgICAgICAgICAgICAnQ2l0eScsXHJcbiAgICAgICAgICAgICAgICAnRGVzZXJ0J1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgbG9jYXRpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnTmFtaWJpYScsXHJcbiAgICAgICAgICAgICAgICAnTGlieWEnLFxyXG4gICAgICAgICAgICAgICAgJ1NvdXRoIEFmcmljYScsXHJcbiAgICAgICAgICAgICAgICAnVGFuemFuaWEnLFxyXG4gICAgICAgICAgICAgICAgJ1BhcHVhIE5ldyBHdWluZWEnLFxyXG4gICAgICAgICAgICAgICAgJ1JldW5pb24nLFxyXG4gICAgICAgICAgICAgICAgJ1N3YXppbGFuZCcsXHJcbiAgICAgICAgICAgICAgICAnU2FvIFRvbWUnLFxyXG4gICAgICAgICAgICAgICAgJ01hZGFnYXNjYXInLFxyXG4gICAgICAgICAgICAgICAgJ01hdXJpdGl1cycsXHJcbiAgICAgICAgICAgICAgICAnU2V5Y2hlbGxlcycsXHJcbiAgICAgICAgICAgICAgICAnTWF5b3R0ZScsXHJcbiAgICAgICAgICAgICAgICAnVWtyYWluZSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGd1ZXN0czogW1xyXG4gICAgICAgICAgICAgICAgJzEnLFxyXG4gICAgICAgICAgICAgICAgJzInLFxyXG4gICAgICAgICAgICAgICAgJzMnLFxyXG4gICAgICAgICAgICAgICAgJzQnLFxyXG4gICAgICAgICAgICAgICAgJzUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBtdXN0SGF2ZXM6IFtcclxuICAgICAgICAgICAgICAgICdyZXN0YXVyYW50JyxcclxuICAgICAgICAgICAgICAgICdraWRzJyxcclxuICAgICAgICAgICAgICAgICdwb29sJyxcclxuICAgICAgICAgICAgICAgICdzcGEnLFxyXG4gICAgICAgICAgICAgICAgJ3dpZmknLFxyXG4gICAgICAgICAgICAgICAgJ3BldCcsXHJcbiAgICAgICAgICAgICAgICAnZGlzYWJsZScsXHJcbiAgICAgICAgICAgICAgICAnYmVhY2gnLFxyXG4gICAgICAgICAgICAgICAgJ3BhcmtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2NvbmRpdGlvbmluZycsXHJcbiAgICAgICAgICAgICAgICAnbG91bmdlJyxcclxuICAgICAgICAgICAgICAgICd0ZXJyYWNlJyxcclxuICAgICAgICAgICAgICAgICdnYXJkZW4nLFxyXG4gICAgICAgICAgICAgICAgJ2d5bScsXHJcbiAgICAgICAgICAgICAgICAnYmljeWNsZXMnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBhY3Rpdml0aWVzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29va2luZyBjbGFzc2VzJyxcclxuICAgICAgICAgICAgICAgICdDeWNsaW5nJyxcclxuICAgICAgICAgICAgICAgICdGaXNoaW5nJyxcclxuICAgICAgICAgICAgICAgICdHb2xmJyxcclxuICAgICAgICAgICAgICAgICdIaWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0hvcnNlLXJpZGluZycsXHJcbiAgICAgICAgICAgICAgICAnS2F5YWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ05pZ2h0bGlmZScsXHJcbiAgICAgICAgICAgICAgICAnU2FpbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2N1YmEgZGl2aW5nJyxcclxuICAgICAgICAgICAgICAgICdTaG9wcGluZyAvIG1hcmtldHMnLFxyXG4gICAgICAgICAgICAgICAgJ1Nub3JrZWxsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTa2lpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1N1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbGRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdXaW5kc3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2luZSB0YXN0aW5nJyxcclxuICAgICAgICAgICAgICAgICdZb2dhJyBcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHByaWNlOiBbXHJcbiAgICAgICAgICAgICAgICBcIm1pblwiLFxyXG4gICAgICAgICAgICAgICAgXCJtYXhcIlxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIEF1dGhDb250cm9sbGVyKTtcclxuXHJcbiAgICBBdXRoQ29udHJvbGxlci4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRzY29wZScsICdhdXRoU2VydmljZScsICckc3RhdGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBBdXRoQ29udHJvbGxlcigkcm9vdFNjb3BlLCAkc2NvcGUsIGF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMgPSB7XHJcbiAgICAgICAgICAgIHVzZXJBbHJlYWR5RXhpc3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgbG9naW5PclBhc3N3b3JkSW5jb3JyZWN0OiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5jcmVhdGVVc2VyKHRoaXMubmV3VXNlcilcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gJ09LJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXV0aCcsIHsndHlwZSc6ICdsb2dpbid9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy51c2VyQWxyZWFkeUV4aXN0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygkc2NvcGUuZm9ybUpvaW4pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5ld1VzZXIpOyovXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dpblVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbkluKHRoaXMudXNlcilcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gJ09LJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmV2aW91c1N0YXRlID0gJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5WyRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeS5sZW5ndGggLSAyXSB8fCAnaG9tZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHByZXZpb3VzU3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28ocHJldmlvdXNTdGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMubG9naW5PclBhc3N3b3JkSW5jb3JyZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ2F1dGhTZXJ2aWNlJywgYXV0aFNlcnZpY2UpO1xyXG5cclxuICAgIGF1dGhTZXJ2aWNlLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhdXRoU2VydmljZSgkcm9vdFNjb3BlLCAkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICAvL3RvZG8gZXJyb3JzXHJcbiAgICAgICAgZnVuY3Rpb24gVXNlcihiYWNrZW5kQXBpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JhY2tlbmRBcGkgPSBiYWNrZW5kQXBpO1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVkZW50aWFscyA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9vblJlc29sdmUgPSAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS50b2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlci5zYXZlVG9rZW4ocmVzcG9uc2UuZGF0YS50b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnT0snXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9vblJlamVjdGVkID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlciA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0b2tlbiA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2F2ZVRva2VuKF90b2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSBfdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zyh0b2tlbilcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZXRUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZGVsZXRlVG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZVRva2VuOiBzYXZlVG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0VG9rZW46IGdldFRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZVRva2VuOiBkZWxldGVUb2tlblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5zaWduSW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVkZW50aWFscyA9IGNyZWRlbnRpYWxzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuX2NyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25PdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLmRlbGV0ZVRva2VuKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuZ2V0TG9nSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6IHRoaXMuX2NyZWRlbnRpYWxzLFxyXG4gICAgICAgICAgICAgICAgdG9rZW46IHRoaXMuX3Rva2VuS2VlcGVyLmdldFRva2VuKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgVXNlcihiYWNrZW5kUGF0aHNDb25zdGFudC5hdXRoKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTWFwJywgYWh0bE1hcERpcmVjdGl2ZSk7XG5cbiAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImRlc3RpbmF0aW9uc19fbWFwXCI+PC9kaXY+JyxcbiAgICAgICAgICAgIGxpbms6IGFodGxNYXBEaXJlY3RpdmVMaW5rXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XG4gICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xuICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG1hcFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XG4gICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwU2NyaXB0KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gW1xuICAgICAgICAgICAgICAgICAgICBbXCJPdGpvem9uZGp1cGEgUmVnaW9uLCBLYWxhaGFyaSBEZXNlcnQsIE5hbWliaWFcIiwgLTIwLjMzMDg2OSwgMTcuMzQ2NTYzXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiU2lydGUgRGlzdHJpY3QsIFNhaGFyYSBEZXNlcnQsIExpYnlhXCIsIDMxLjE5NTAwNSwgMTYuNTAwNDgzXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiTGltcG9wbywgU291dGggQWZyaWNhXCIsIC0yMy43ODk5MDAsIDMwLjE3NTYzN10sXG4gICAgICAgICAgICAgICAgICAgIFtcIkJ1YnVidSwgWmFuemliYXIgVG93biBUYW56YW5pYVwiLCAtNi4xMDEyNDcsIDM5LjIxNTc1OF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIk1hZGFuZyBQcm92aW5jZSwgUGFwdWEgTmV3IEd1aW5lYVwiLCAtNS41MTAzNzksIDE0NS45ODA0OTddLFxuICAgICAgICAgICAgICAgICAgICBbXCJTYWludCBBbmRyZSwgUmV1bmlvblwiLCAtMjAuOTE5NDEwLCA1NS42NDI0ODNdLFxuICAgICAgICAgICAgICAgICAgICBbXCJMdWJvbWJvIFJlZ2lvbiwgU3dhemlsYW5kXCIsIC0yNi43ODQ5MzAsIDMxLjczNDgyMF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIkNhbnRhZ2FsbyBTP28gVG9tPyBhbmQgUHI/bmNpcGVcIiwgMC4yMzc2MzcsIDYuNzM4ODM1XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQW1wYW5paHkgTWFkYWdhc2NhclwiLCAtMjUuMDIzMjk2LCA0NC4wNjM4NjldLFxuICAgICAgICAgICAgICAgICAgICBbXCJQbGFpbmUgQ29yYWlsLUxhIEZvdWNoZSBDb3JhaWwgTWF1cml0aXVzXCIsIC0xOS43NDA4MTcsIDYzLjM2MzI5NF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIlNvdXRoIEFnYWxlZ2EgSXNsYW5kcyBNYXVyaXRpdXNcIiwgLTEwLjQ1NTQxMiwgNTYuNjg1MzAxXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiTm9ydGggQWdhbGVnYSBJc2xhbmRzIE1hdXJpdGl1c1wiLCAtMTAuNDMzOTk1LCA1Ni42NDcyNjhdLFxuICAgICAgICAgICAgICAgICAgICBbXCJDb2V0aXZ5IFNleWNoZWxsZXNcIiwgLTcuMTQwMzM4LCA1Ni4yNzAzODRdLFxuICAgICAgICAgICAgICAgICAgICBbXCJEZW1iZW5pIE1heW90dGVcIiwgLTEyLjgzOTkyOCwgNDUuMTkwODU1XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQmFieW50c2kgS3lpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjYzODgwMCwgMzAuMDIyNTM5XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiUGVjaHlraHZvc3R5LCBWb2x5bnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjUwMjQ5NSwgMjQuNjE0NzMyXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQmlsaG9yb2QtRG5pc3Ryb3ZzJ2t5aSBkaXN0cmljdCwgT2Rlc3NhIE9ibGFzdCwgVWtyYWluZVwiLCA0Ni4wNjExMTYsIDMwLjQxMjQwMV0sXG4gICAgICAgICAgICAgICAgICAgIFtcIlBldHJ1c2hreSwgS3lpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjQyMDk5OCwgMzAuMTYxNTQ4XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiVmVseWthIERvY2gsIENoZXJuaWhpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUxLjMwNzUxOCwgMzIuNTc0MjMyXVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICB2YXIgbXlMYXRMbmcgPSB7bGF0OiAtMjUuMzYzLCBsbmc6IDEzMS4wNDR9O1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXG4gICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZGVzdGluYXRpb25zX19tYXAnKVswXSwge1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnYXNzZXRzL2ltYWdlcy9pY29uX21hcC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbG9jYXRpb25zW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qY2VudGVyaW5nKi9cbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcyAoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICAgICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnJHRpbWVvdXQnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAncHJlbG9hZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsICR0aW1lb3V0LCBiYWNrZW5kUGF0aHNDb25zdGFudCwgcHJlbG9hZFNlcnZpY2UpIHsgLy90b2RvIG5vdCBvbmx5IGxvYWQgYnV0IGxpc3RTcmMgdG9vIGFjY2VwdFxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd0ZpcnN0JyxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93TmV4dCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LnRlbXBsYXRlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIGxldCBhbGxJbWFnZXNTcmMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gJHNjb3BlLnNob3dGaXJzdEltZ0NvdW50LFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudCA9ICRzY29wZS5zaG93TmV4dEltZ0NvdW50O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSBNYXRoLm1pbihzaG93Rmlyc3RJbWdDb3VudCArIHNob3dOZXh0SW1nQ291bnQsIGFsbEltYWdlc1NyYy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0FsbEltYWdlc0xvYWRlZCA9IHRoaXMuc2hvd0ZpcnN0ID49IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgLyokdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7Ki9cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsSW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvd0ZpcnN0KSA/IHRoaXMuc2hvd0ZpcnN0Lmxlbmd0aCA9PT0gdGhpcy5pbWFnZXNDb3VudDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuZ2FsbGVyeSBpbWcnKS5sZW5ndGggPCBzaG93Rmlyc3RJbWdDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvb3BzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQodGhpcy5hbGlnbkltYWdlcywgMClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcygpO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNDb3VudCA9IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5TGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbS5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdTcmMgPSBldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgLyogdmFyICRpbWFnZXMgPSAkKCcuZ2FsbGVyeSBpbWcnKTtcclxuICAgICAgICAgICAgdmFyIGxvYWRlZF9pbWFnZXNfY291bnQgPSAwOyovXHJcbiAgICAgICAgICAgIC8qJHNjb3BlLmFsaWduSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkX2ltYWdlc19jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkX2ltYWdlc19jb3VudCA9PSAkaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0SW1hZ2VBbGlnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7IC8vIHRvZG9cclxuICAgICAgICAgICAgfTsqL1xyXG5cclxuICAgICAgICAgICAgLy8kc2NvcGUuYWxpZ25JbWFnZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoY2IpIHtcclxuICAgICAgICAgICAgY2IocHJlbG9hZFNlcnZpY2UuZ2V0UHJlbG9hZENhY2hlKCdnYWxsZXJ5JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3NldEltYWdlQWxpZ21lbnQoKSB7IC8vdG9kbyBhcmd1bWVudHMgbmFtaW5nLCBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ3VyZXMgPSAkKCcuZ2FsbGVyeV9fZmlndXJlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FsbGVyeVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jbG9zZXN0KCcuZ2FsbGVyeScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY3NzKCd3aWR0aCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uc0NvdW50ID0gTWF0aC5yb3VuZChnYWxsZXJ5V2lkdGggLyBpbWFnZVdpZHRoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0ID0gbmV3IEFycmF5KGNvbHVtbnNDb3VudCArIDEpLmpvaW4oJzAnKS5zcGxpdCgnJykubWFwKCgpID0+IHtyZXR1cm4gMH0pLCAvL3RvZG8gZGVsIGpvaW4tc3BsaXRcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodCA9IGNvbHVtbnNIZWlnaHQuc2xpY2UoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgJChmaWd1cmVzKS5jc3MoJ21hcmdpbi10b3AnLCAnMCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChmaWd1cmVzLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnbWFyZ2luLXRvcCcsIC0oTWF0aC5tYXguYXBwbHkobnVsbCwgY29sdW1uc0hlaWdodCkgLSBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSkgKyBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uUG9pbnRlciA9PT0gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zSGVpZ2h0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0W2ldICs9IGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuLyogICAgICAgIC5jb250cm9sbGVyKCdHYWxsZXJ5Q29udHJvbGxlcicsIEdhbGxlcnlDb250cm9sbGVyKTtcclxuXHJcbiAgICBHYWxsZXJ5Q29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICB2YXIgaW1hZ2VzU3JjID0gX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGltYWdlc1NyYylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyovXHJcblxyXG4vKlxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3Q6IFwiPWFodGxHYWxsZXJ5U2hvd0ZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG93QWZ0ZXI6IFwiPWFodGxHYWxsZXJ5U2hvd0FmdGVyXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigpe31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hID0gMTM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5hKTtcclxuICAgICAgICAgICAgLyEqdmFyIGFsbEltYWdlc1NyYztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5zaG93Rmlyc3RJbWFnZXNTcmMgPSBbJzEyMyddO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG9cclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KSohL1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXInLCBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcik7XHJcblxyXG4gICAgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICdndWVzdGNvbW1lbnRzU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKCRyb290U2NvcGUsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy53cml0ZUNvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJGxvZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLmdldEd1ZXN0Q29tbWVudHMoKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLnNlbmRDb21tZW50KHRoaXMuZm9ybURhdGEpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2goeyduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lLCAnY29tbWVudCc6IHRoaXMuZm9ybURhdGEuY29tbWVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1EYXRhID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcigncmV2ZXJzZScsIHJldmVyc2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJldmVyc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIC8vdG8gZXJyb3JzXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtcy5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdndWVzdGNvbW1lbnRzU2VydmljZScsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKTtcclxuXHJcbiAgICBndWVzdGNvbW1lbnRzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRHdWVzdENvbW1lbnRzOiBnZXRHdWVzdENvbW1lbnRzLFxyXG4gICAgICAgICAgICBzZW5kQ29tbWVudDogc2VuZENvbW1lbnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRHdWVzdENvbW1lbnRzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbW1lbnQoY29tbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF1dGhTZXJ2aWNlLmdldExvZ0luZm8oKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlcixcclxuICAgICAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTtcclxuXHJcbiAgICBIZWFkZXJDb250cm9sbGVyLiRpbmplY3QgPSBbJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcihhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2lnbk91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbk91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsIGFodGxIZWFkZXIpO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9nJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgkdGltZW91dCwgJGxvZykge1xyXG5cdFx0ZnVuY3Rpb24gVUl0cmFuc2l0aW9ucyhjb250YWluZXIpIHtcclxuXHRcdFx0aWYgKCEkKGNvbnRhaW5lcikubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50ICcke2NvbnRhaW5lcn0nIG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmFuaW1hdGVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fY29udGFpbmVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bGV0IHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRFbGVtZW50cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke3RhcmdldEVsZW1lbnRzUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIHRvKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRsZXQgYW5pbWF0ZU9wdGlvbnMgPSB7fTtcclxuXHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayA9IGZ1bmN0aW9uKGVsZW1lbnRUcmlnZ2VyUXVlcnksIGVsZW1lbnRPblF1ZXJ5KSB7XHJcblx0XHRcdGlmICghJChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5sZW5ndGggfHwgISQoZWxlbWVudE9uUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2VsZW1lbnRUcmlnZ2VyUXVlcnl9ICR7ZWxlbWVudE9uUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWxlbWVudE9uUXVlcnkpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnMoaGVhZGVyUXVlcnksIGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdFVJdHJhbnNpdGlvbnMuY2FsbCh0aGlzLCBjb250YWluZXJRdWVyeSk7XHJcblxyXG5cdFx0XHRpZiAoISQoaGVhZGVyUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2hlYWRlclF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnRGaXhRdWVyeSwgZml4Q2xhc3NOYW1lLCB1bmZpeENsYXNzTmFtZSwgb3B0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5faGVhZGVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBmaXhFbGVtZW50ID0gJChlbGVtZW50Rml4UXVlcnkpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykuaW5uZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLnJlbW92ZUNsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b25XaWR0aENoYW5nZUhhbmRsZXIoKTtcclxuXHRcdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBvbldpZHRoQ2hhbmdlSGFuZGxlcik7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcik7XHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoKSB7XHJcblx0XHRcdGxldCBoZWFkZXIgPSBuZXcgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCcubC1oZWFkZXInLCAnLm5hdl9faXRlbS1jb250YWluZXInKTtcclxuXHJcblx0XHRcdGhlYWRlci5hbmltYXRlVHJhbnNpdGlvbihcclxuXHRcdFx0XHQnLnN1Yi1uYXYnLCB7XHJcblx0XHRcdFx0XHRjc3NFbnVtZXJhYmxlUnVsZTogJ2hlaWdodCcsXHJcblx0XHRcdFx0XHRkZWxheTogMzAwfSlcclxuXHRcdFx0XHQucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrKFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtdHJpZ2dlcl0nLFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtb25dJylcclxuXHRcdFx0XHQuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHRcdCdqc19uYXYtLWZpeGVkJyxcclxuXHRcdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdFx0b25NYXhXaW5kb3dXaWR0aDogODUwfSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcik7XHJcblxyXG4gICAgSG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsndHJlbmRIb3RlbHNJbWdQYXRocyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKHRyZW5kSG90ZWxzSW1nUGF0aHMpIHtcclxuICAgICAgICB0aGlzLmhvdGVscyA9IHRyZW5kSG90ZWxzSW1nUGF0aHM7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgndHJlbmRIb3RlbHNJbWdQYXRocycsIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMScsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMicsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMycsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsNCcsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSx7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWw1JyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWw2JyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxNb2RhbCcsIGFodGxNb2RhbERpcmVjdGl2ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgbGluazogYWh0bE1vZGFsRGlyZWN0aXZlTGluayxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvbW9kYWwvbW9kYWwuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbignbW9kYWxPcGVuJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdpbWFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3JjID0gZGF0YS5zcmM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3cuaW1nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7Ly90b2RvIGFwcGx5P1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ21hcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5tYXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ29vZ2xlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBteUxhdGxuZyA9IHtsYXQ6IGRhdGEuY29vcmQubGF0LCBsbmc6IGRhdGEuY29vcmQubG5nfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbXlMYXRsbmdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbXlMYXRsbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlRGlhbG9nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcChuYW1lLCBjb29yZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBbbmFtZSwgY29vcmQubGF0LCBjb29yZC5sbmddXHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxyXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsTWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbF9fbWFwJylbMF0sIHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtsYXQ6IGNvb3JkLmxhdCwgbG5nOiBjb29yZC5sbmd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiA5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaWNvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3JkLmxhdCwgY29vcmQubG5nKSxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbi8qXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyEqY2VudGVyaW5nKiEvXHJcbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcyAoKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIExhdExhbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nIChsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGFsTWFwLmZpdEJvdW5kcyhib3VuZHMpOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2FjdGl2aXRpZXNGaWx0ZXInLCBhY3Rpdml0aWVzRmlsdGVyKTtcclxuXHJcbiAgICBhY3Rpdml0aWVzRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhY3Rpdml0aWVzRmlsdGVyKCRsb2csIGZpbHRlcnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhcmcsIF9zdHJpbmdMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHN0cmluZ0xlbmd0aCA9IHBhcnNlSW50KF9zdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHN0cmluZ0xlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybihgQ2FuJ3QgcGFyc2UgYXJndW1lbnQ6ICR7X3N0cmluZ0xlbmd0aH1gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcmdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGFyZy5qb2luKCcsICcpLnNsaWNlKDAsIHN0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnNsaWNlKDAsIHJlc3VsdC5sYXN0SW5kZXhPZignLCcpKSArICcuLi4nXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdSZXNvcnRDb250cm9sbGVyJywgUmVzb3J0Q29udHJvbGxlcik7XHJcblxyXG4gICAgUmVzb3J0Q29udHJvbGxlci4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50JywgJyRmaWx0ZXInLCAnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUmVzb3J0Q29udHJvbGxlcihyZXNvcnRTZXJ2aWNlLCBob3RlbERldGFpbHNDb25zdGFudCwgJGZpbHRlciwgJHNjb3BlKSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJzID0gaW5pdEZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRGaWx0ZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZSA9IGZ1bmN0aW9uKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSA9IGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5wdXNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uc3BsaWNlKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlciksIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKShob3RlbHMsIGN1cnJlbnRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGhvdGVscyA9IHt9O1xyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gaG90ZWxzO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMuZmlsdGVycy5wcmljZSxcclxuICAgICAgICAgICAgICAgIChuZXdWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzLnByaWNlID0gW25ld1ZhbHVlXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGN1cnJlbnRGaWx0ZXJzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpKGhvdGVscywgY3VycmVudEZpbHRlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7ICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub3Blbk1hcCA9IGZ1bmN0aW9uKGhvdGVsTmFtZSwgaG90ZWxDb29yZCwgaG90ZWwpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBzaG93OiAnbWFwJyxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGhvdGVsTmFtZSxcclxuICAgICAgICAgICAgICAgIGNvb3JkOiBob3RlbENvb3JkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCBkYXRhKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRGaWx0ZXJzKCkge1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVycyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaWx0ZXJzLnByaWNlID0ge1xyXG4gICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAxMDAwXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyc1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignaG90ZWxGaWx0ZXInLCBob3RlbEZpbHRlcik7XHJcblxyXG4gICAgaG90ZWxGaWx0ZXIuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGhvdGVsRmlsdGVyKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaG90ZWxzLCBmaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChob3RlbHMsIGZ1bmN0aW9uKGhvdGVsKSB7XHJcbiAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzLCBmdW5jdGlvbihmaWx0ZXJzSW5Hcm91cCwgZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJHcm91cCA9PT0gJ2d1ZXN0cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc0luR3JvdXAgPSBbZmlsdGVyc0luR3JvdXBbZmlsdGVyc0luR3JvdXAubGVuZ3RoIC0gMV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWx0ZXJzSW5Hcm91cC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hBdExlYXNlT25lRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb2NhdGlvbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwubG9jYXRpb24uY291bnRyeSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3R5cGVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnR5cGUgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXR0aW5ncyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5lbnZpcm9ubWVudCA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ211c3RIYXZlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5kZXRhaWxzW2ZpbHRlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWN0aXZpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB+aG90ZWwuYWN0aXZpdGllcy5pbmRleE9mKGZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwucHJpY2UgPj0gZmlsdGVyLm1pbiAmJiBob3RlbC5wcmljZSA8PSBmaWx0ZXIubWF4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2d1ZXN0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5ndWVzdHMubWF4ID49ICtmaWx0ZXJbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBob3RlbHMuZmlsdGVyKChob3RlbCkgPT4gIWhvdGVsLl9oaWRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3Njcm9sbFRvVG9wJywgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUpO1xyXG5cclxuICAgIHNjcm9sbFRvVG9wRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciwgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgaWYgKDEpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAkLnRyaW0oYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZSgwLCBhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzY3JvbGwtdG8tdG9wLWNvbmZpZyBpcyBub3QgZGVmaW5lZGApO1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yIHx8ICdodG1sLCBib2R5JztcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW0pLm9uKGF0dHIuc2Nyb2xsVG9Ub3AsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogaGVpZ2h0IH0sIFwic2xvd1wiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdyZXNvcnRTZXJ2aWNlJywgcmVzb3J0U2VydmljZSk7XHJcblxyXG4gICAgcmVzb3J0U2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlc29ydFNlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0UmVzb3J0OiBnZXRSZXNvcnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSZXNvcnQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSlcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsVG9wMycsIGFodGxUb3AzRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsVG9wM0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyd0b3AzU2VydmljZScsICdob3RlbERldGFpbHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxUb3AzRGlyZWN0aXZlKHRvcDNTZXJ2aWNlLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxUb3AzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndG9wMycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC90b3AzLnRlbXBsYXRlLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bFRvcDNDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICB0aGlzLmRldGFpbHMgPSBob3RlbERldGFpbHNDb25zdGFudC5tdXN0SGF2ZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnRUeXBlID0gJGF0dHJzLmFodGxUb3AzdHlwZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRJbWdTcmMgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvaW1hZ2VzLycgKyB0aGlzLnJlc29ydFR5cGUgKyAnLycgKyB0aGlzLnJlc29ydFtpbmRleF0uaW1nLmZpbGVuYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzUmVzb3J0SW5jbHVkZURldGFpbCA9IGZ1bmN0aW9uKGl0ZW0sIGRldGFpbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGFpbENsYXNzTmFtZSA9ICd0b3AzX19kZXRhaWwtY29udGFpbmVyLS0nICsgZGV0YWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSA9ICFpdGVtLmRldGFpbHNbZGV0YWlsXSA/ICcgdG9wM19fZGV0YWlsLWNvbnRhaW5lci0taGFzbnQnIDogJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFpbENsYXNzTmFtZSArIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdG9wM1NlcnZpY2UuZ2V0VG9wM1BsYWNlcyh0aGlzLnJlc29ydFR5cGUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5yZXNvcnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCd0b3AzU2VydmljZScsIHRvcDNTZXJ2aWNlKTtcclxuXHJcbiAgICB0b3AzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvcDNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvcDNQbGFjZXM6IGdldFRvcDNQbGFjZXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUb3AzUGxhY2VzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LnRvcDMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuYW5pbWF0aW9uKCcuc2xpZGVyX19pbWcnLCBhbmltYXRpb25GdW5jdGlvbik7XHJcblxyXG5cdGZ1bmN0aW9uIGFuaW1hdGlvbkZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0YmVmb3JlQWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHRsZXQgc2xpZGluZ0RpcmVjdGlvbiA9IGVsZW1lbnQuc2NvcGUoKS5zbGlkaW5nRGlyZWN0aW9uO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzEnKTtcclxuXHJcblx0XHRcdFx0aWYoc2xpZGluZ0RpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICcxMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnLTIwMCUnfSwgNTAwLCBkb25lKTsgLy8yMDA/ICQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJywgYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUGFnZXMnLCBQYWdlcyk7XHJcblxyXG4gICAgUGFnZXMuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUGFnZXMoJHNjb3BlKSB7XHJcbiAgICAgICAgY29uc3QgaG90ZWxzUGVyUGFnZSA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dGcm9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5jdXJyZW50UGFnZSAtIDEpICogaG90ZWxzUGVyUGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiArK3RoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93UHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLS10aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2UgKyAxO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWdlc1RvdGFsLmxlbmd0aCA9PT0gdGhpcy5jdXJyZW50UGFnZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNGaXJzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2UgPT09IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCAoZXZlbnQsIHNob3dIb3RlbENvdW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IG5ldyBBcnJheShNYXRoLmNlaWwoc2hvd0hvdGVsQ291bnQgLyBob3RlbHNQZXJQYWdlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignc2hvd0Zyb20nLCBzaG93RnJvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0Zyb20oKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBzdGFydFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnNsaWNlKHN0YXJ0UG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxQcmljZVNsaWRlcicsIHByaWNlU2xpZGVyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBwcmljZVNsaWRlckRpcmVjdGl2ZS4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiBcIkBcIixcclxuICAgICAgICAgICAgICAgIG1heDogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0U2xpZGVyOiAnPScsXHJcbiAgICAgICAgICAgICAgICByaWdodFNsaWRlcjogJz0nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5odG1sJyxcclxuICAgICAgICAgICAgbGluazogcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rKCRzY29wZSwgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmxlZnRTbGlkZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmlnaHRTbGlkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIubWF4ID0gMTU7Ki9cclxuICAgICAgICAgICAgbGV0IHJpZ2h0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVBcmVhV2lkdGggPSBwYXJzZUludCgkKCcuc2xpZGUnKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVQZXJTdGVwID0gJHNjb3BlLm1heCAvIChzbGlkZUFyZWFXaWR0aCAtIDIwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5taW4gPSBwYXJzZUludCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJHNjb3BlLm1heCA9IHBhcnNlSW50KCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIHJpZ2h0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gc2xpZGVBcmVhV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSArIDIwLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gMCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0RHJhZyhkcmFnRWxlbSwgaW5pdFBvc2l0aW9uLCBtYXhQb3NpdGlvbiwgbWluUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzaGlmdDtcclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2Vkb3duJywgYnRuT25Nb3VzZURvd24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSBldmVudC5wYWdlWDtcclxuICAgICAgICAgICAgICAgICAgICBpbml0UG9zaXRpb24gPSBwYXJzZUludChkcmFnRWxlbS5jc3MoJ2xlZnQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkb2NPbk1vdXNlTW92ZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbkxlc3NUaGFuTWF4ID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA8PSBtYXhQb3NpdGlvbigpIC0gMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uR3JhdGVyVGhhbk1pbiA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPj0gbWluUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uTGVzc1RoYW5NYXggJiYgcG9zaXRpb25HcmF0ZXJUaGFuTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdFbGVtLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIGluaXRQb3NpdGlvbiAtIGV2ZW50LnBhZ2VYICsgc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdkcmFnc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQcmljZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld01pbiA9IH5+KHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF4ID0gfn4ocGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKG5ld01pbik7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKG5ld01heCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0QnRuLmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRCdG4uY3NzKCdsZWZ0JylcclxuICAgICAgICAgICAgICAgICAgICB9KSovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0U2xpZGVycyhidG4sIG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1Bvc3Rpb24gPSBuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcDtcclxuICAgICAgICAgICAgICAgICAgICBidG4uY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidG4uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwID4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpIC0gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMobGVmdEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4Jykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPiAkc2NvcGUubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdWYWx1ZSwkc2NvcGUubWF4ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPCBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSArIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKHJpZ2h0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlbWl0KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZWZ0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEzKTsqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdG9kbyBpZTggYnVnIGZpeFxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnaWU4JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygrc2xpZGVBcmVhV2lkdGggLSArbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsICtzbGlkZUFyZWFXaWR0aCAtIHBhcnNlSW50KG5ld1ZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFNsaWRlT25DbGljaycsIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBsZXQgc2xpZGVFbWl0RWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1lbWl0XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNsaWRlRW1pdEVsZW1lbnRzLm9uKCdjbGljaycsIHNsaWRlRW1pdE9uQ2xpY2spO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2xpZGVFbWl0T25DbGljaygpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzbGlkZU9uRWxlbWVudCA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICcnICYmIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBXcm9uZyBpbml0IHZhbHVlIGZvciAnc2xpZGUtb24nIGF0dHJpYnV0ZSwgc2hvdWxkIGJlICcnIG9yICdjbG9zZWQnLmApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVVcCgnc2xvdycsIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnY2xvc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlRG93bignc2xvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2xpZGVUb2dnbGVFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uLXRvZ2dsZV0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHNsaWRlVG9nZ2xlRWxlbWVudHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCQodGhpcykuYXR0cignc2xpZGUtb24tdG9nZ2xlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iXX0=
