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
		}).state('booking', {
			url: '/resort',
			templateUrl: 'app/partials/booking/booking.html',
			params: { id: '1' }
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

    angular.module('ahotelApp').controller('BookingController', BookingController);

    BookingController.$inject = ['$stateParams'];

    function BookingController($stateParams) {
        console.log($stateParams);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvaG9tZS9ob21lLnRyZW5kSG90ZWxzSW1nUGF0aHMuanMiLCJwYXJ0aWFscy9tb2RhbC9tb2RhbC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LmFjdGl2aXRpZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5ob3RlbC5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LnNjcm9sbHRvVG9wLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuc2VydmljZS5qcyIsInBhcnRpYWxzL3RvcC90b3AzLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3RvcC90b3AzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5hbmltYXRpb24uanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXJQYXRoLmNvbnN0YW50LmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcGFnZXMvcGFnZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3ByaWNlU2xpZGVyL3ByaWNlU2xpZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9zbGlkZU9uQ2xpY2svc2xpZGVPbkNsaWNrLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJHByb3ZpZGUiLCJkZWNvcmF0b3IiLCIkZGVsZWdhdGUiLCIkd2luZG93IiwibG9nSGlzdG9yeSIsIndhcm4iLCJlcnIiLCJsb2ciLCJtZXNzYWdlIiwiX2xvZ1dhcm4iLCJwdXNoIiwiYXBwbHkiLCJfbG9nRXJyIiwiZXJyb3IiLCJuYW1lIiwic3RhY2siLCJFcnJvciIsInNlbmRPblVubG9hZCIsIm9uYmVmb3JldW5sb2FkIiwibGVuZ3RoIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5IiwiJGluamVjdCIsInByZWxvYWRTZXJ2aWNlUHJvdmlkZXIiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsImdhbGxlcnkiLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJpZCIsInJ1biIsIiRyb290U2NvcGUiLCJwcmVsb2FkU2VydmljZSIsIiRsb2dnZWQiLCIkc3RhdGUiLCJjdXJyZW50U3RhdGVOYW1lIiwiY3VycmVudFN0YXRlUGFyYW1zIiwic3RhdGVIaXN0b3J5IiwiJG9uIiwiZXZlbnQiLCJ0b1N0YXRlIiwidG9QYXJhbXMiLCJvbmxvYWQiLCJwcmVsb2FkSW1hZ2VzIiwibWV0aG9kIiwiYWN0aW9uIiwicHJvdmlkZXIiLCJ0aW1lb3V0IiwiJGdldCIsIiRodHRwIiwiJHRpbWVvdXQiLCJwcmVsb2FkQ2FjaGUiLCJsb2dnZXIiLCJjb25zb2xlIiwiZGVidWciLCJwcmVsb2FkTmFtZSIsImltYWdlcyIsImltYWdlc1NyY0xpc3QiLCJzcmMiLCJwcmVsb2FkIiwidGhlbiIsInJlc3BvbnNlIiwiZGF0YSIsImJpbmQiLCJpIiwiaW1hZ2UiLCJJbWFnZSIsImUiLCJvbmVycm9yIiwiZ2V0UHJlbG9hZCIsImdldFByZWxvYWRDYWNoZSIsImNvbnN0YW50IiwidG9wMyIsImF1dGgiLCJndWVzdGNvbW1lbnRzIiwiaG90ZWxzIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsInNpZ25JbiIsInVzZXIiLCJwcmV2aW91c1N0YXRlIiwiZmFjdG9yeSIsIlVzZXIiLCJiYWNrZW5kQXBpIiwiX2JhY2tlbmRBcGkiLCJfY3JlZGVudGlhbHMiLCJfb25SZXNvbHZlIiwic3RhdHVzIiwidG9rZW4iLCJfdG9rZW5LZWVwZXIiLCJzYXZlVG9rZW4iLCJfb25SZWplY3RlZCIsIl90b2tlbiIsImdldFRva2VuIiwiZGVsZXRlVG9rZW4iLCJwcm90b3R5cGUiLCJjcmVkZW50aWFscyIsInNpZ25PdXQiLCJnZXRMb2dJbmZvIiwiQm9va2luZ0NvbnRyb2xsZXIiLCIkc3RhdGVQYXJhbXMiLCJkaXJlY3RpdmUiLCJhaHRsTWFwRGlyZWN0aXZlIiwicmVzdHJpY3QiLCJ0ZW1wbGF0ZSIsImxpbmsiLCJhaHRsTWFwRGlyZWN0aXZlTGluayIsImVsZW0iLCJhdHRyIiwid2luZG93IiwiZ29vZ2xlIiwiaW5pdE1hcCIsIm1hcFNjcmlwdCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsIm15TGF0TG5nIiwibGF0IiwibG5nIiwibWFwIiwibWFwcyIsIk1hcCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJzY3JvbGx3aGVlbCIsImljb25zIiwiYWhvdGVsIiwiaWNvbiIsIm1hcmtlciIsIk1hcmtlciIsInRpdGxlIiwicG9zaXRpb24iLCJMYXRMbmciLCJib3VuZHMiLCJMYXRMbmdCb3VuZHMiLCJMYXRMYW5nIiwiZXh0ZW5kIiwiZml0Qm91bmRzIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmUiLCJzY29wZSIsInNob3dGaXJzdEltZ0NvdW50Iiwic2hvd05leHRJbWdDb3VudCIsIkFodGxHYWxsZXJ5Q29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsImFodGxHYWxsZXJ5TGluayIsImFsbEltYWdlc1NyYyIsImxvYWRNb3JlIiwiTWF0aCIsIm1pbiIsInNob3dGaXJzdCIsInNsaWNlIiwiaXNBbGxJbWFnZXNMb2FkZWQiLCJhbGxJbWFnZXNMb2FkZWQiLCJpbWFnZXNDb3VudCIsImFsaWduSW1hZ2VzIiwiJCIsIl9zZXRJbWFnZUFsaWdtZW50Iiwib24iLCJfZ2V0SW1hZ2VTb3VyY2VzIiwiaW1nU3JjIiwidGFyZ2V0IiwiJHJvb3QiLCIkYnJvYWRjYXN0Iiwic2hvdyIsImNiIiwiZmlndXJlcyIsImdhbGxlcnlXaWR0aCIsInBhcnNlSW50IiwiY2xvc2VzdCIsImNzcyIsImltYWdlV2lkdGgiLCJjb2x1bW5zQ291bnQiLCJyb3VuZCIsImNvbHVtbnNIZWlnaHQiLCJBcnJheSIsImpvaW4iLCJzcGxpdCIsImN1cnJlbnRDb2x1bW5zSGVpZ2h0IiwiY29sdW1uUG9pbnRlciIsImVhY2giLCJpbmRleCIsIm1heCIsIkd1ZXN0Y29tbWVudHNDb250cm9sbGVyIiwiZ3Vlc3Rjb21tZW50c1NlcnZpY2UiLCJjb21tZW50cyIsIm9wZW5Gb3JtIiwic2hvd1BsZWFzZUxvZ2lNZXNzYWdlIiwid3JpdGVDb21tZW50IiwiZ2V0R3Vlc3RDb21tZW50cyIsImFkZENvbW1lbnQiLCJzZW5kQ29tbWVudCIsImZvcm1EYXRhIiwiY29tbWVudCIsImZpbHRlciIsInJldmVyc2UiLCJpdGVtcyIsInR5cGUiLCJvblJlc29sdmUiLCJvblJlamVjdCIsIkhlYWRlckNvbnRyb2xsZXIiLCJhaHRsSGVhZGVyIiwic2VydmljZSIsIkhlYWRlclRyYW5zaXRpb25zU2VydmljZSIsIiRsb2ciLCJVSXRyYW5zaXRpb25zIiwiY29udGFpbmVyIiwiX2NvbnRhaW5lciIsImFuaW1hdGVUcmFuc2l0aW9uIiwidGFyZ2V0RWxlbWVudHNRdWVyeSIsImNzc0VudW1lcmFibGVSdWxlIiwiZnJvbSIsInRvIiwiZGVsYXkiLCJtb3VzZWVudGVyIiwidGFyZ2V0RWxlbWVudHMiLCJmaW5kIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJzY3JvbGxUb3AiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwiYWh0bFN0aWt5SGVhZGVyIiwiaGVhZGVyIiwiSG9tZUNvbnRyb2xsZXIiLCJ0cmVuZEhvdGVsc0ltZ1BhdGhzIiwiYWh0bE1vZGFsRGlyZWN0aXZlIiwicmVwbGFjZSIsImFodGxNb2RhbERpcmVjdGl2ZUxpbmsiLCJpbWciLCIkYXBwbHkiLCJ1bmRlZmluZWQiLCJteUxhdGxuZyIsImNvb3JkIiwiem9vbSIsImNlbnRlciIsImNsb3NlRGlhbG9nIiwibW9kYWxNYXAiLCJhY3Rpdml0aWVzRmlsdGVyIiwiZmlsdGVyc1NlcnZpY2UiLCJhcmciLCJfc3RyaW5nTGVuZ3RoIiwic3RyaW5nTGVuZ3RoIiwiaXNOYU4iLCJyZXN1bHQiLCJsYXN0SW5kZXhPZiIsIlJlc29ydENvbnRyb2xsZXIiLCJyZXNvcnRTZXJ2aWNlIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCIkZmlsdGVyIiwiZmlsdGVycyIsImluaXRGaWx0ZXJzIiwiY3VycmVudEZpbHRlcnMiLCJvbkZpbHRlckNoYW5nZSIsImZpbHRlckdyb3VwIiwidmFsdWUiLCJzcGxpY2UiLCJpbmRleE9mIiwiZ2V0U2hvd0hvdGVsQ291bnQiLCJyZWR1Y2UiLCJjb3VudGVyIiwiaXRlbSIsIl9oaWRlIiwiZ2V0UmVzb3J0IiwiJHdhdGNoIiwibmV3VmFsdWUiLCJvcGVuTWFwIiwiaG90ZWxOYW1lIiwiaG90ZWxDb29yZCIsImhvdGVsIiwia2V5IiwiaG90ZWxGaWx0ZXIiLCJmb3JFYWNoIiwiaXNIb3RlbE1hdGNoaW5nRmlsdGVycyIsImZpbHRlcnNJbkdyb3VwIiwibWF0Y2hBdExlYXNlT25lRmlsdGVyIiwiZ2V0SG90ZWxQcm9wIiwibG9jYXRpb24iLCJjb3VudHJ5IiwiZW52aXJvbm1lbnQiLCJkZXRhaWxzIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmUiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsiLCJzZWxlY3RvciIsImhlaWdodCIsInRyaW0iLCJzY3JvbGxUb1RvcENvbmZpZyIsImVsZW1lbnQiLCJzY3JvbGxUb1RvcCIsIm9uUmVqZWN0ZWQiLCJhaHRsVG9wM0RpcmVjdGl2ZSIsInRvcDNTZXJ2aWNlIiwiQWh0bFRvcDNDb250cm9sbGVyIiwiJGVsZW1lbnQiLCIkYXR0cnMiLCJtdXN0SGF2ZSIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJmaWxlbmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbCIsImRldGFpbCIsImRldGFpbENsYXNzTmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSIsImdldFRvcDNQbGFjZXMiLCJhbmltYXRpb24iLCJhbmltYXRpb25GdW5jdGlvbiIsImJlZm9yZUFkZENsYXNzIiwiY2xhc3NOYW1lIiwiZG9uZSIsInNsaWRpbmdEaXJlY3Rpb24iLCJhaHRsU2xpZGVyIiwic2xpZGVyU2VydmljZSIsImFodGxTbGlkZXJDb250cm9sbGVyIiwic2xpZGVyIiwibmV4dFNsaWRlIiwicHJldlNsaWRlIiwic2V0U2xpZGUiLCJzZXROZXh0U2xpZGUiLCJzZXRQcmV2U2xpZGUiLCJnZXRDdXJyZW50U2xpZGUiLCJzZXRDdXJyZW50U2xpZGUiLCJmaXhJRThwbmdCbGFja0JnIiwiYXJyb3dzIiwiY2xpY2siLCJkaXNhYmxlZCIsInNsaWRlckltZ1BhdGhDb25zdGFudCIsIlNsaWRlciIsInNsaWRlckltYWdlTGlzdCIsIl9pbWFnZVNyY0xpc3QiLCJfY3VycmVudFNsaWRlIiwiZ2V0SW1hZ2VTcmNMaXN0IiwiZ2V0SW5kZXgiLCJzbGlkZSIsIlBhZ2VzIiwiaG90ZWxzUGVyUGFnZSIsImN1cnJlbnRQYWdlIiwicGFnZXNUb3RhbCIsInNob3dGcm9tIiwic2hvd05leHQiLCJzaG93UHJldiIsInNldFBhZ2UiLCJwYWdlIiwiaXNMYXN0UGFnZSIsImlzRmlyc3RQYWdlIiwic2hvd0hvdGVsQ291bnQiLCJjZWlsIiwibW9kZWwiLCJzdGFydFBvc2l0aW9uIiwicHJpY2VTbGlkZXJEaXJlY3RpdmUiLCJsZWZ0U2xpZGVyIiwicmlnaHRTbGlkZXIiLCJwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsiLCJyaWdodEJ0biIsImxlZnRCdG4iLCJzbGlkZUFyZWFXaWR0aCIsInZhbHVlUGVyU3RlcCIsInZhbCIsImluaXREcmFnIiwiZHJhZ0VsZW0iLCJpbml0UG9zaXRpb24iLCJtYXhQb3NpdGlvbiIsIm1pblBvc2l0aW9uIiwic2hpZnQiLCJidG5Pbk1vdXNlRG93biIsInBhZ2VYIiwiZG9jT25Nb3VzZU1vdmUiLCJidG5Pbk1vdXNlVXAiLCJwb3NpdGlvbkxlc3NUaGFuTWF4IiwicG9zaXRpb25HcmF0ZXJUaGFuTWluIiwic2V0UHJpY2VzIiwiZW1pdCIsIm5ld01pbiIsIm5ld01heCIsInNldFNsaWRlcnMiLCJidG4iLCJuZXdQb3N0aW9uIiwiaGFzQ2xhc3MiLCJ0cmlnZ2VyIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rIiwic2xpZGVFbWl0RWxlbWVudHMiLCJzbGlkZUVtaXRPbkNsaWNrIiwic2xpZGVPbkVsZW1lbnQiLCJzbGlkZVVwIiwib25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlIiwic2xpZGVEb3duIiwic2xpZGVUb2dnbGVFbGVtZW50cyIsInRvZ2dsZUNsYXNz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QU1xUSxZQUFZclEsRUFBRSxNQUFNL0MsS0FBSzs7Ozs7O0tBdER6RCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcsIFsndWkucm91dGVyJywgJ3ByZWxvYWQnLCAnbmdBbmltYXRlJ10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uZmlnKGZ1bmN0aW9uICgkcHJvdmlkZSkge1xyXG4gICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJyRsb2cnLCBmdW5jdGlvbiAoJGRlbGVnYXRlLCAkd2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9nSGlzdG9yeSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2FybjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycjogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5sb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ1dhcm4gPSAkZGVsZWdhdGUud2FybjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS53YXJuID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nV2Fybi5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ0VyciA9ICRkZWxlZ2F0ZS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5lcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7bmFtZTogbWVzc2FnZSwgc3RhY2s6IG5ldyBFcnJvcigpLnN0YWNrfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ0Vyci5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gc2VuZE9uVW5sb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbG9nSGlzdG9yeS5lcnIubGVuZ3RoICYmICFsb2dIaXN0b3J5Lndhcm4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbigncG9zdCcsICcvYXBpL2xvZycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGxvZ0hpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGRlbGVnYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxufSkoKTtcclxuXHJcbi8qXHJcbiAgICAgICAgLmZhY3RvcnkoJ2xvZycsIGxvZyk7XHJcblxyXG4gICAgbG9nLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxvZygkd2luZG93LCAkbG9nKSB7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2goYXJncyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYnJvd3NlckxvZykge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBlcnJvcihlKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgc3RhY2s6IGUuc3RhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRsb2cuZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RvZG8gYWxsIGVycm9yc1xyXG5cclxuXHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHdhcm46IHdhcm4sXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICAgICAgc2VuZE9uVW5sb2FkOiBzZW5kT25VbmxvYWRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoY29uZmlnKTtcclxuXHJcbiAgICBjb25maWcuJGluamVjdCA9IFsncHJlbG9hZFNlcnZpY2VQcm92aWRlcicsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbmZpZyhwcmVsb2FkU2VydmljZVByb3ZpZGVyLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICBwcmVsb2FkU2VydmljZVByb3ZpZGVyLmNvbmZpZyhiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCAnR0VUJywgJ2dldCcsIDEwMCwgJ3dhcm5pbmcnKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5jb25maWcoY29uZmlnKTtcclxuXHJcblx0Y29uZmlnLiRpbmplY3QgPSBbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlciddO1xyXG5cclxuXHRmdW5jdGlvbiBjb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG5cdFx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG5cclxuXHRcdCRzdGF0ZVByb3ZpZGVyXHJcblx0XHRcdC5zdGF0ZSgnaG9tZScsIHtcclxuXHRcdFx0XHR1cmw6ICcvJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ob21lL2hvbWUuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdhdXRoJywge1xyXG5cdFx0XHRcdHVybDogJy9hdXRoJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9hdXRoL2F1dGguaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3R5cGUnOiAnbG9naW4nfS8qLFxyXG5cdFx0XHRcdG9uRW50ZXI6IGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XHJcblx0XHRcdFx0XHQkcm9vdFNjb3BlLiRzdGF0ZSA9IFwiYXV0aFwiO1xyXG5cdFx0XHRcdH0qL1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2J1bmdhbG93cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYnVuZ2Fsb3dzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvYnVuZ2Fsb3dzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnaG90ZWxzJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL3RvcCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvaG90ZWxzLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCd2aWxsYXMnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3ZpbGxhcycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL3ZpbGxhcy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2dhbGxlcnknLCB7XHJcblx0XHRcdFx0dXJsOiAnL2dhbGxlcnknLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2d1ZXN0Y29tbWVudHMnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2d1ZXN0Y29tbWVudHMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Rlc3RpbmF0aW9ucycsIHtcclxuXHRcdFx0XHRcdHVybDogJy9kZXN0aW5hdGlvbnMnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZGVzdGluYXRpb25zL2Rlc3RpbmF0aW9ucy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3Jlc29ydCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvcmVzb3J0JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcmVzb3J0Lmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYm9va2luZycsIHtcclxuXHRcdFx0XHR1cmw6ICcvcmVzb3J0JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7aWQ6ICcxJ31cclxuXHRcdFx0fSk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAucnVuKHJ1bik7XHJcblxyXG4gICAgcnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnICwgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJywgJyR3aW5kb3cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlLCAkd2luZG93LCBsb2cpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZU5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZVBhcmFtczogbnVsbCxcclxuICAgICAgICAgICAgc3RhdGVIaXN0b3J5OiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcy8qLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMgdG9kbyovKXtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZU5hbWUgPSB0b1N0YXRlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeS5wdXNoKHRvU3RhdGUubmFtZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvL3RvZG8gb25sb2FkIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vSDvv70g77+977+977+977+977+977+9XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlLnByZWxvYWRJbWFnZXMoJ2dhbGxlcnknLCB7dXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCBtZXRob2Q6ICdHRVQnLCBhY3Rpb246ICdnZXQnfSk7IC8vdG9kbyBkZWwgbWV0aG9kLCBhY3Rpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vbG9nLnNlbmRPblVubG9hZCgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncHJlbG9hZCcsIFtdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3ByZWxvYWQnKVxyXG4gICAgICAgIC5wcm92aWRlcigncHJlbG9hZFNlcnZpY2UnLCBwcmVsb2FkU2VydmljZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcHJlbG9hZFNlcnZpY2UoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gZnVuY3Rpb24odXJsID0gJy9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcclxuICAgICAgICAgICAgICAgIGxvZzogbG9nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCRodHRwLCAkdGltZW91dCkge1xyXG4gICAgICAgICAgICBsZXQgcHJlbG9hZENhY2hlID0gW10sXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIgPSBmdW5jdGlvbihtZXNzYWdlLCBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdzaWxlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnZGVidWcnICYmIGxvZyA9PT0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvZyA9PT0gJ3dhcm5pbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZEltYWdlcyhwcmVsb2FkTmFtZSwgaW1hZ2VzKSB7IC8vdG9kbyBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZXNTcmNMaXN0ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdhcnJheScpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gaW1hZ2VzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLm1ldGhvZCB8fCBjb25maWcubWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGltYWdlcy51cmwgfHwgY29uZmlnLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5hY3Rpb24gfHwgY29uZmlnLmFjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnRpbWVvdXQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cub25sb2FkID0gcHJlbG9hZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChwcmVsb2FkLmJpbmQobnVsbCwgaW1hZ2VzU3JjTGlzdCksIGNvbmZpZy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzU3JjTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2VzU3JjTGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzb2x2ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIodGhpcy5zcmMsICdkZWJ1ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRQcmVsb2FkKHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ3ByZWxvYWRTZXJ2aWNlOiBnZXQgcmVxdWVzdCAnICsgJ1wiJyArIHByZWxvYWROYW1lICsgJ1wiJywgJ2RlYnVnJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWxvYWRDYWNoZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkQ2FjaGVbaV0ubmFtZSA9PT0gcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZVtpXS5zcmNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdObyBwcmVsb2FkcyBmb3VuZCcsICd3YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwcmVsb2FkSW1hZ2VzOiBwcmVsb2FkSW1hZ2VzLFxyXG4gICAgICAgICAgICAgICAgZ2V0UHJlbG9hZENhY2hlOiBnZXRQcmVsb2FkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2JhY2tlbmRQYXRoc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0b3AzOiAnL2FwaS90b3AzJyxcclxuICAgICAgICAgICAgYXV0aDogJy9hcGkvdXNlcnMnLFxyXG4gICAgICAgICAgICBnYWxsZXJ5OiAnL2FwaS9nYWxsZXJ5JyxcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50czogJy9hcGkvZ3Vlc3Rjb21tZW50cycsXHJcbiAgICAgICAgICAgIGhvdGVsczogJy9hcGkvaG90ZWxzJ1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2hvdGVsRGV0YWlsc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0eXBlczogW1xyXG4gICAgICAgICAgICAgICAgJ0hvdGVsJyxcclxuICAgICAgICAgICAgICAgICdCdW5nYWxvdycsXHJcbiAgICAgICAgICAgICAgICAnVmlsbGEnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nczogW1xyXG4gICAgICAgICAgICAgICAgJ0NvYXN0JyxcclxuICAgICAgICAgICAgICAgICdDaXR5JyxcclxuICAgICAgICAgICAgICAgICdEZXNlcnQnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICdOYW1pYmlhJyxcclxuICAgICAgICAgICAgICAgICdMaWJ5YScsXHJcbiAgICAgICAgICAgICAgICAnU291dGggQWZyaWNhJyxcclxuICAgICAgICAgICAgICAgICdUYW56YW5pYScsXHJcbiAgICAgICAgICAgICAgICAnUGFwdWEgTmV3IEd1aW5lYScsXHJcbiAgICAgICAgICAgICAgICAnUmV1bmlvbicsXHJcbiAgICAgICAgICAgICAgICAnU3dhemlsYW5kJyxcclxuICAgICAgICAgICAgICAgICdTYW8gVG9tZScsXHJcbiAgICAgICAgICAgICAgICAnTWFkYWdhc2NhcicsXHJcbiAgICAgICAgICAgICAgICAnTWF1cml0aXVzJyxcclxuICAgICAgICAgICAgICAgICdTZXljaGVsbGVzJyxcclxuICAgICAgICAgICAgICAgICdNYXlvdHRlJyxcclxuICAgICAgICAgICAgICAgICdVa3JhaW5lJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgZ3Vlc3RzOiBbXHJcbiAgICAgICAgICAgICAgICAnMScsXHJcbiAgICAgICAgICAgICAgICAnMicsXHJcbiAgICAgICAgICAgICAgICAnMycsXHJcbiAgICAgICAgICAgICAgICAnNCcsXHJcbiAgICAgICAgICAgICAgICAnNSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIG11c3RIYXZlczogW1xyXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxyXG4gICAgICAgICAgICAgICAgJ2tpZHMnLFxyXG4gICAgICAgICAgICAgICAgJ3Bvb2wnLFxyXG4gICAgICAgICAgICAgICAgJ3NwYScsXHJcbiAgICAgICAgICAgICAgICAnd2lmaScsXHJcbiAgICAgICAgICAgICAgICAncGV0JyxcclxuICAgICAgICAgICAgICAgICdkaXNhYmxlJyxcclxuICAgICAgICAgICAgICAgICdiZWFjaCcsXHJcbiAgICAgICAgICAgICAgICAncGFya2luZycsXHJcbiAgICAgICAgICAgICAgICAnY29uZGl0aW9uaW5nJyxcclxuICAgICAgICAgICAgICAgICdsb3VuZ2UnLFxyXG4gICAgICAgICAgICAgICAgJ3RlcnJhY2UnLFxyXG4gICAgICAgICAgICAgICAgJ2dhcmRlbicsXHJcbiAgICAgICAgICAgICAgICAnZ3ltJyxcclxuICAgICAgICAgICAgICAgICdiaWN5Y2xlcydcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGFjdGl2aXRpZXM6IFtcclxuICAgICAgICAgICAgICAgICdDb29raW5nIGNsYXNzZXMnLFxyXG4gICAgICAgICAgICAgICAgJ0N5Y2xpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0Zpc2hpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0dvbGYnLFxyXG4gICAgICAgICAgICAgICAgJ0hpa2luZycsXHJcbiAgICAgICAgICAgICAgICAnSG9yc2UtcmlkaW5nJyxcclxuICAgICAgICAgICAgICAgICdLYXlha2luZycsXHJcbiAgICAgICAgICAgICAgICAnTmlnaHRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdTYWlsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTY3ViYSBkaXZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3BwaW5nIC8gbWFya2V0cycsXHJcbiAgICAgICAgICAgICAgICAnU25vcmtlbGxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NraWluZycsXHJcbiAgICAgICAgICAgICAgICAnU3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2lsZGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmRzdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaW5lIHRhc3RpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1lvZ2EnIFxyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgcHJpY2U6IFtcclxuICAgICAgICAgICAgICAgIFwibWluXCIsXHJcbiAgICAgICAgICAgICAgICBcIm1heFwiXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRyb290U2NvcGUsICRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3Q6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduSW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRyb290U2NvcGUsICRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWxldGVUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlVG9rZW46IHNhdmVUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnZXRUb2tlbjogZ2V0VG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlVG9rZW46IGRlbGV0ZVRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuZGVsZXRlVG9rZW4oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5nZXRMb2dJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogdGhpcy5fY3JlZGVudGlhbHMsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5fdG9rZW5LZWVwZXIuZ2V0VG9rZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0NvbnRyb2xsZXInLCBCb29raW5nQ29udHJvbGxlcik7XHJcblxyXG4gICAgQm9va2luZ0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlUGFyYW1zJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQm9va2luZ0NvbnRyb2xsZXIoJHN0YXRlUGFyYW1zKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHN0YXRlUGFyYW1zKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTWFwJywgYWh0bE1hcERpcmVjdGl2ZSk7XG5cbiAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImRlc3RpbmF0aW9uc19fbWFwXCI+PC9kaXY+JyxcbiAgICAgICAgICAgIGxpbms6IGFodGxNYXBEaXJlY3RpdmVMaW5rXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XG4gICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xuICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG1hcFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XG4gICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwU2NyaXB0KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gW1xuICAgICAgICAgICAgICAgICAgICBbXCJPdGpvem9uZGp1cGEgUmVnaW9uLCBLYWxhaGFyaSBEZXNlcnQsIE5hbWliaWFcIiwgLTIwLjMzMDg2OSwgMTcuMzQ2NTYzXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiU2lydGUgRGlzdHJpY3QsIFNhaGFyYSBEZXNlcnQsIExpYnlhXCIsIDMxLjE5NTAwNSwgMTYuNTAwNDgzXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiTGltcG9wbywgU291dGggQWZyaWNhXCIsIC0yMy43ODk5MDAsIDMwLjE3NTYzN10sXG4gICAgICAgICAgICAgICAgICAgIFtcIkJ1YnVidSwgWmFuemliYXIgVG93biBUYW56YW5pYVwiLCAtNi4xMDEyNDcsIDM5LjIxNTc1OF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIk1hZGFuZyBQcm92aW5jZSwgUGFwdWEgTmV3IEd1aW5lYVwiLCAtNS41MTAzNzksIDE0NS45ODA0OTddLFxuICAgICAgICAgICAgICAgICAgICBbXCJTYWludCBBbmRyZSwgUmV1bmlvblwiLCAtMjAuOTE5NDEwLCA1NS42NDI0ODNdLFxuICAgICAgICAgICAgICAgICAgICBbXCJMdWJvbWJvIFJlZ2lvbiwgU3dhemlsYW5kXCIsIC0yNi43ODQ5MzAsIDMxLjczNDgyMF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIkNhbnRhZ2FsbyBTP28gVG9tPyBhbmQgUHI/bmNpcGVcIiwgMC4yMzc2MzcsIDYuNzM4ODM1XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQW1wYW5paHkgTWFkYWdhc2NhclwiLCAtMjUuMDIzMjk2LCA0NC4wNjM4NjldLFxuICAgICAgICAgICAgICAgICAgICBbXCJQbGFpbmUgQ29yYWlsLUxhIEZvdWNoZSBDb3JhaWwgTWF1cml0aXVzXCIsIC0xOS43NDA4MTcsIDYzLjM2MzI5NF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIlNvdXRoIEFnYWxlZ2EgSXNsYW5kcyBNYXVyaXRpdXNcIiwgLTEwLjQ1NTQxMiwgNTYuNjg1MzAxXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiTm9ydGggQWdhbGVnYSBJc2xhbmRzIE1hdXJpdGl1c1wiLCAtMTAuNDMzOTk1LCA1Ni42NDcyNjhdLFxuICAgICAgICAgICAgICAgICAgICBbXCJDb2V0aXZ5IFNleWNoZWxsZXNcIiwgLTcuMTQwMzM4LCA1Ni4yNzAzODRdLFxuICAgICAgICAgICAgICAgICAgICBbXCJEZW1iZW5pIE1heW90dGVcIiwgLTEyLjgzOTkyOCwgNDUuMTkwODU1XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQmFieW50c2kgS3lpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjYzODgwMCwgMzAuMDIyNTM5XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiUGVjaHlraHZvc3R5LCBWb2x5bnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjUwMjQ5NSwgMjQuNjE0NzMyXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQmlsaG9yb2QtRG5pc3Ryb3ZzJ2t5aSBkaXN0cmljdCwgT2Rlc3NhIE9ibGFzdCwgVWtyYWluZVwiLCA0Ni4wNjExMTYsIDMwLjQxMjQwMV0sXG4gICAgICAgICAgICAgICAgICAgIFtcIlBldHJ1c2hreSwgS3lpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjQyMDk5OCwgMzAuMTYxNTQ4XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiVmVseWthIERvY2gsIENoZXJuaWhpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUxLjMwNzUxOCwgMzIuNTc0MjMyXVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICB2YXIgbXlMYXRMbmcgPSB7bGF0OiAtMjUuMzYzLCBsbmc6IDEzMS4wNDR9O1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXG4gICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZGVzdGluYXRpb25zX19tYXAnKVswXSwge1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnYXNzZXRzL2ltYWdlcy9pY29uX21hcC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbG9jYXRpb25zW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qY2VudGVyaW5nKi9cbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcyAoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICAgICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnJHRpbWVvdXQnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAncHJlbG9hZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsICR0aW1lb3V0LCBiYWNrZW5kUGF0aHNDb25zdGFudCwgcHJlbG9hZFNlcnZpY2UpIHsgLy90b2RvIG5vdCBvbmx5IGxvYWQgYnV0IGxpc3RTcmMgdG9vIGFjY2VwdFxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd0ZpcnN0JyxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93TmV4dCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LnRlbXBsYXRlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIGxldCBhbGxJbWFnZXNTcmMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gJHNjb3BlLnNob3dGaXJzdEltZ0NvdW50LFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudCA9ICRzY29wZS5zaG93TmV4dEltZ0NvdW50O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSBNYXRoLm1pbihzaG93Rmlyc3RJbWdDb3VudCArIHNob3dOZXh0SW1nQ291bnQsIGFsbEltYWdlc1NyYy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0FsbEltYWdlc0xvYWRlZCA9IHRoaXMuc2hvd0ZpcnN0ID49IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgLyokdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7Ki9cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsSW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvd0ZpcnN0KSA/IHRoaXMuc2hvd0ZpcnN0Lmxlbmd0aCA9PT0gdGhpcy5pbWFnZXNDb3VudDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuZ2FsbGVyeSBpbWcnKS5sZW5ndGggPCBzaG93Rmlyc3RJbWdDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvb3BzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQodGhpcy5hbGlnbkltYWdlcywgMClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcygpO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNDb3VudCA9IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5TGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbS5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdTcmMgPSBldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgLyogdmFyICRpbWFnZXMgPSAkKCcuZ2FsbGVyeSBpbWcnKTtcclxuICAgICAgICAgICAgdmFyIGxvYWRlZF9pbWFnZXNfY291bnQgPSAwOyovXHJcbiAgICAgICAgICAgIC8qJHNjb3BlLmFsaWduSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkX2ltYWdlc19jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkX2ltYWdlc19jb3VudCA9PSAkaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0SW1hZ2VBbGlnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7IC8vIHRvZG9cclxuICAgICAgICAgICAgfTsqL1xyXG5cclxuICAgICAgICAgICAgLy8kc2NvcGUuYWxpZ25JbWFnZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoY2IpIHtcclxuICAgICAgICAgICAgY2IocHJlbG9hZFNlcnZpY2UuZ2V0UHJlbG9hZENhY2hlKCdnYWxsZXJ5JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3NldEltYWdlQWxpZ21lbnQoKSB7IC8vdG9kbyBhcmd1bWVudHMgbmFtaW5nLCBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ3VyZXMgPSAkKCcuZ2FsbGVyeV9fZmlndXJlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FsbGVyeVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jbG9zZXN0KCcuZ2FsbGVyeScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY3NzKCd3aWR0aCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uc0NvdW50ID0gTWF0aC5yb3VuZChnYWxsZXJ5V2lkdGggLyBpbWFnZVdpZHRoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0ID0gbmV3IEFycmF5KGNvbHVtbnNDb3VudCArIDEpLmpvaW4oJzAnKS5zcGxpdCgnJykubWFwKCgpID0+IHtyZXR1cm4gMH0pLCAvL3RvZG8gZGVsIGpvaW4tc3BsaXRcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodCA9IGNvbHVtbnNIZWlnaHQuc2xpY2UoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgJChmaWd1cmVzKS5jc3MoJ21hcmdpbi10b3AnLCAnMCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChmaWd1cmVzLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnbWFyZ2luLXRvcCcsIC0oTWF0aC5tYXguYXBwbHkobnVsbCwgY29sdW1uc0hlaWdodCkgLSBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSkgKyBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uUG9pbnRlciA9PT0gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zSGVpZ2h0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0W2ldICs9IGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuLyogICAgICAgIC5jb250cm9sbGVyKCdHYWxsZXJ5Q29udHJvbGxlcicsIEdhbGxlcnlDb250cm9sbGVyKTtcclxuXHJcbiAgICBHYWxsZXJ5Q29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICB2YXIgaW1hZ2VzU3JjID0gX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGltYWdlc1NyYylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyovXHJcblxyXG4vKlxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3Q6IFwiPWFodGxHYWxsZXJ5U2hvd0ZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG93QWZ0ZXI6IFwiPWFodGxHYWxsZXJ5U2hvd0FmdGVyXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigpe31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hID0gMTM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5hKTtcclxuICAgICAgICAgICAgLyEqdmFyIGFsbEltYWdlc1NyYztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5zaG93Rmlyc3RJbWFnZXNTcmMgPSBbJzEyMyddO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG9cclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KSohL1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXInLCBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcik7XHJcblxyXG4gICAgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICdndWVzdGNvbW1lbnRzU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKCRyb290U2NvcGUsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy53cml0ZUNvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJGxvZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLmdldEd1ZXN0Q29tbWVudHMoKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLnNlbmRDb21tZW50KHRoaXMuZm9ybURhdGEpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2goeyduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lLCAnY29tbWVudCc6IHRoaXMuZm9ybURhdGEuY29tbWVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1EYXRhID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcigncmV2ZXJzZScsIHJldmVyc2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJldmVyc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIC8vdG8gZXJyb3JzXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtcy5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdndWVzdGNvbW1lbnRzU2VydmljZScsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKTtcclxuXHJcbiAgICBndWVzdGNvbW1lbnRzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRHdWVzdENvbW1lbnRzOiBnZXRHdWVzdENvbW1lbnRzLFxyXG4gICAgICAgICAgICBzZW5kQ29tbWVudDogc2VuZENvbW1lbnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRHdWVzdENvbW1lbnRzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbW1lbnQoY29tbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF1dGhTZXJ2aWNlLmdldExvZ0luZm8oKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlcixcclxuICAgICAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTtcclxuXHJcbiAgICBIZWFkZXJDb250cm9sbGVyLiRpbmplY3QgPSBbJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcihhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2lnbk91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbk91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsIGFodGxIZWFkZXIpO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9nJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgkdGltZW91dCwgJGxvZykge1xyXG5cdFx0ZnVuY3Rpb24gVUl0cmFuc2l0aW9ucyhjb250YWluZXIpIHtcclxuXHRcdFx0aWYgKCEkKGNvbnRhaW5lcikubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50ICcke2NvbnRhaW5lcn0nIG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmFuaW1hdGVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fY29udGFpbmVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bGV0IHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRFbGVtZW50cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke3RhcmdldEVsZW1lbnRzUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIHRvKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRsZXQgYW5pbWF0ZU9wdGlvbnMgPSB7fTtcclxuXHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayA9IGZ1bmN0aW9uKGVsZW1lbnRUcmlnZ2VyUXVlcnksIGVsZW1lbnRPblF1ZXJ5KSB7XHJcblx0XHRcdGlmICghJChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5sZW5ndGggfHwgISQoZWxlbWVudE9uUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2VsZW1lbnRUcmlnZ2VyUXVlcnl9ICR7ZWxlbWVudE9uUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWxlbWVudE9uUXVlcnkpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnMoaGVhZGVyUXVlcnksIGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdFVJdHJhbnNpdGlvbnMuY2FsbCh0aGlzLCBjb250YWluZXJRdWVyeSk7XHJcblxyXG5cdFx0XHRpZiAoISQoaGVhZGVyUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2hlYWRlclF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnRGaXhRdWVyeSwgZml4Q2xhc3NOYW1lLCB1bmZpeENsYXNzTmFtZSwgb3B0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5faGVhZGVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBmaXhFbGVtZW50ID0gJChlbGVtZW50Rml4UXVlcnkpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykuaW5uZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLnJlbW92ZUNsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b25XaWR0aENoYW5nZUhhbmRsZXIoKTtcclxuXHRcdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBvbldpZHRoQ2hhbmdlSGFuZGxlcik7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcik7XHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoKSB7XHJcblx0XHRcdGxldCBoZWFkZXIgPSBuZXcgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCcubC1oZWFkZXInLCAnLm5hdl9faXRlbS1jb250YWluZXInKTtcclxuXHJcblx0XHRcdGhlYWRlci5hbmltYXRlVHJhbnNpdGlvbihcclxuXHRcdFx0XHQnLnN1Yi1uYXYnLCB7XHJcblx0XHRcdFx0XHRjc3NFbnVtZXJhYmxlUnVsZTogJ2hlaWdodCcsXHJcblx0XHRcdFx0XHRkZWxheTogMzAwfSlcclxuXHRcdFx0XHQucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrKFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtdHJpZ2dlcl0nLFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtb25dJylcclxuXHRcdFx0XHQuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHRcdCdqc19uYXYtLWZpeGVkJyxcclxuXHRcdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdFx0b25NYXhXaW5kb3dXaWR0aDogODUwfSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcik7XHJcblxyXG4gICAgSG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsndHJlbmRIb3RlbHNJbWdQYXRocyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKHRyZW5kSG90ZWxzSW1nUGF0aHMpIHtcclxuICAgICAgICB0aGlzLmhvdGVscyA9IHRyZW5kSG90ZWxzSW1nUGF0aHM7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgndHJlbmRIb3RlbHNJbWdQYXRocycsIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMScsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMicsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsMycsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsNCcsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSx7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWw1JyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSG90ZWw2JyxcclxuICAgICAgICAgICAgICAgIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaG9tZS90cmVuZDYuanBnJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxNb2RhbCcsIGFodGxNb2RhbERpcmVjdGl2ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgbGluazogYWh0bE1vZGFsRGlyZWN0aXZlTGluayxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvbW9kYWwvbW9kYWwuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbignbW9kYWxPcGVuJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdpbWFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3JjID0gZGF0YS5zcmM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3cuaW1nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7Ly90b2RvIGFwcGx5P1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ21hcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5tYXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ29vZ2xlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBteUxhdGxuZyA9IHtsYXQ6IGRhdGEuY29vcmQubGF0LCBsbmc6IGRhdGEuY29vcmQubG5nfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbXlMYXRsbmdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbXlMYXRsbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlRGlhbG9nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcChuYW1lLCBjb29yZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBbbmFtZSwgY29vcmQubGF0LCBjb29yZC5sbmddXHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxyXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsTWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbF9fbWFwJylbMF0sIHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtsYXQ6IGNvb3JkLmxhdCwgbG5nOiBjb29yZC5sbmd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiA5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaWNvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3JkLmxhdCwgY29vcmQubG5nKSxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbi8qXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyEqY2VudGVyaW5nKiEvXHJcbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcyAoKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIExhdExhbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nIChsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGFsTWFwLmZpdEJvdW5kcyhib3VuZHMpOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2FjdGl2aXRpZXNGaWx0ZXInLCBhY3Rpdml0aWVzRmlsdGVyKTtcclxuXHJcbiAgICBhY3Rpdml0aWVzRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhY3Rpdml0aWVzRmlsdGVyKCRsb2csIGZpbHRlcnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhcmcsIF9zdHJpbmdMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHN0cmluZ0xlbmd0aCA9IHBhcnNlSW50KF9zdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHN0cmluZ0xlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybihgQ2FuJ3QgcGFyc2UgYXJndW1lbnQ6ICR7X3N0cmluZ0xlbmd0aH1gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcmdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGFyZy5qb2luKCcsICcpLnNsaWNlKDAsIHN0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnNsaWNlKDAsIHJlc3VsdC5sYXN0SW5kZXhPZignLCcpKSArICcuLi4nXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdSZXNvcnRDb250cm9sbGVyJywgUmVzb3J0Q29udHJvbGxlcik7XHJcblxyXG4gICAgUmVzb3J0Q29udHJvbGxlci4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50JywgJyRmaWx0ZXInLCAnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUmVzb3J0Q29udHJvbGxlcihyZXNvcnRTZXJ2aWNlLCBob3RlbERldGFpbHNDb25zdGFudCwgJGZpbHRlciwgJHNjb3BlKSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJzID0gaW5pdEZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRGaWx0ZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZSA9IGZ1bmN0aW9uKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSA9IGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5wdXNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uc3BsaWNlKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlciksIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKShob3RlbHMsIGN1cnJlbnRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGhvdGVscyA9IHt9O1xyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gaG90ZWxzO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMuZmlsdGVycy5wcmljZSxcclxuICAgICAgICAgICAgICAgIChuZXdWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzLnByaWNlID0gW25ld1ZhbHVlXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGN1cnJlbnRGaWx0ZXJzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpKGhvdGVscywgY3VycmVudEZpbHRlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7ICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub3Blbk1hcCA9IGZ1bmN0aW9uKGhvdGVsTmFtZSwgaG90ZWxDb29yZCwgaG90ZWwpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBzaG93OiAnbWFwJyxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGhvdGVsTmFtZSxcclxuICAgICAgICAgICAgICAgIGNvb3JkOiBob3RlbENvb3JkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCBkYXRhKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRGaWx0ZXJzKCkge1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVycyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaWx0ZXJzLnByaWNlID0ge1xyXG4gICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAxMDAwXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyc1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignaG90ZWxGaWx0ZXInLCBob3RlbEZpbHRlcik7XHJcblxyXG4gICAgaG90ZWxGaWx0ZXIuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGhvdGVsRmlsdGVyKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaG90ZWxzLCBmaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChob3RlbHMsIGZ1bmN0aW9uKGhvdGVsKSB7XHJcbiAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzLCBmdW5jdGlvbihmaWx0ZXJzSW5Hcm91cCwgZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJHcm91cCA9PT0gJ2d1ZXN0cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc0luR3JvdXAgPSBbZmlsdGVyc0luR3JvdXBbZmlsdGVyc0luR3JvdXAubGVuZ3RoIC0gMV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWx0ZXJzSW5Hcm91cC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hBdExlYXNlT25lRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb2NhdGlvbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwubG9jYXRpb24uY291bnRyeSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3R5cGVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnR5cGUgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXR0aW5ncyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5lbnZpcm9ubWVudCA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ211c3RIYXZlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5kZXRhaWxzW2ZpbHRlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWN0aXZpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB+aG90ZWwuYWN0aXZpdGllcy5pbmRleE9mKGZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwucHJpY2UgPj0gZmlsdGVyLm1pbiAmJiBob3RlbC5wcmljZSA8PSBmaWx0ZXIubWF4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2d1ZXN0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5ndWVzdHMubWF4ID49ICtmaWx0ZXJbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBob3RlbHMuZmlsdGVyKChob3RlbCkgPT4gIWhvdGVsLl9oaWRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3Njcm9sbFRvVG9wJywgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUpO1xyXG5cclxuICAgIHNjcm9sbFRvVG9wRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciwgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgaWYgKDEpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAkLnRyaW0oYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZSgwLCBhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzY3JvbGwtdG8tdG9wLWNvbmZpZyBpcyBub3QgZGVmaW5lZGApO1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yIHx8ICdodG1sLCBib2R5JztcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW0pLm9uKGF0dHIuc2Nyb2xsVG9Ub3AsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogaGVpZ2h0IH0sIFwic2xvd1wiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdyZXNvcnRTZXJ2aWNlJywgcmVzb3J0U2VydmljZSk7XHJcblxyXG4gICAgcmVzb3J0U2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlc29ydFNlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0UmVzb3J0OiBnZXRSZXNvcnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSZXNvcnQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSlcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsVG9wMycsIGFodGxUb3AzRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsVG9wM0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyd0b3AzU2VydmljZScsICdob3RlbERldGFpbHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxUb3AzRGlyZWN0aXZlKHRvcDNTZXJ2aWNlLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxUb3AzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndG9wMycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC90b3AzLnRlbXBsYXRlLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bFRvcDNDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICB0aGlzLmRldGFpbHMgPSBob3RlbERldGFpbHNDb25zdGFudC5tdXN0SGF2ZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnRUeXBlID0gJGF0dHJzLmFodGxUb3AzdHlwZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRJbWdTcmMgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvaW1hZ2VzLycgKyB0aGlzLnJlc29ydFR5cGUgKyAnLycgKyB0aGlzLnJlc29ydFtpbmRleF0uaW1nLmZpbGVuYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzUmVzb3J0SW5jbHVkZURldGFpbCA9IGZ1bmN0aW9uKGl0ZW0sIGRldGFpbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGFpbENsYXNzTmFtZSA9ICd0b3AzX19kZXRhaWwtY29udGFpbmVyLS0nICsgZGV0YWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSA9ICFpdGVtLmRldGFpbHNbZGV0YWlsXSA/ICcgdG9wM19fZGV0YWlsLWNvbnRhaW5lci0taGFzbnQnIDogJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFpbENsYXNzTmFtZSArIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdG9wM1NlcnZpY2UuZ2V0VG9wM1BsYWNlcyh0aGlzLnJlc29ydFR5cGUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5yZXNvcnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCd0b3AzU2VydmljZScsIHRvcDNTZXJ2aWNlKTtcclxuXHJcbiAgICB0b3AzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvcDNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvcDNQbGFjZXM6IGdldFRvcDNQbGFjZXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUb3AzUGxhY2VzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LnRvcDMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuYW5pbWF0aW9uKCcuc2xpZGVyX19pbWcnLCBhbmltYXRpb25GdW5jdGlvbik7XHJcblxyXG5cdGZ1bmN0aW9uIGFuaW1hdGlvbkZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0YmVmb3JlQWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHRsZXQgc2xpZGluZ0RpcmVjdGlvbiA9IGVsZW1lbnQuc2NvcGUoKS5zbGlkaW5nRGlyZWN0aW9uO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzEnKTtcclxuXHJcblx0XHRcdFx0aWYoc2xpZGluZ0RpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICcxMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnLTIwMCUnfSwgNTAwLCBkb25lKTsgLy8yMDA/ICQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJywgYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUGFnZXMnLCBQYWdlcyk7XHJcblxyXG4gICAgUGFnZXMuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUGFnZXMoJHNjb3BlKSB7XHJcbiAgICAgICAgY29uc3QgaG90ZWxzUGVyUGFnZSA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dGcm9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5jdXJyZW50UGFnZSAtIDEpICogaG90ZWxzUGVyUGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiArK3RoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93UHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLS10aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2UgKyAxO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWdlc1RvdGFsLmxlbmd0aCA9PT0gdGhpcy5jdXJyZW50UGFnZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNGaXJzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2UgPT09IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCAoZXZlbnQsIHNob3dIb3RlbENvdW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IG5ldyBBcnJheShNYXRoLmNlaWwoc2hvd0hvdGVsQ291bnQgLyBob3RlbHNQZXJQYWdlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignc2hvd0Zyb20nLCBzaG93RnJvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0Zyb20oKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBzdGFydFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnNsaWNlKHN0YXJ0UG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxQcmljZVNsaWRlcicsIHByaWNlU2xpZGVyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBwcmljZVNsaWRlckRpcmVjdGl2ZS4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiBcIkBcIixcclxuICAgICAgICAgICAgICAgIG1heDogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0U2xpZGVyOiAnPScsXHJcbiAgICAgICAgICAgICAgICByaWdodFNsaWRlcjogJz0nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5odG1sJyxcclxuICAgICAgICAgICAgbGluazogcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rKCRzY29wZSwgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmxlZnRTbGlkZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmlnaHRTbGlkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIubWF4ID0gMTU7Ki9cclxuICAgICAgICAgICAgbGV0IHJpZ2h0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVBcmVhV2lkdGggPSBwYXJzZUludCgkKCcuc2xpZGUnKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVQZXJTdGVwID0gJHNjb3BlLm1heCAvIChzbGlkZUFyZWFXaWR0aCAtIDIwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5taW4gPSBwYXJzZUludCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJHNjb3BlLm1heCA9IHBhcnNlSW50KCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIHJpZ2h0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gc2xpZGVBcmVhV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSArIDIwLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gMCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0RHJhZyhkcmFnRWxlbSwgaW5pdFBvc2l0aW9uLCBtYXhQb3NpdGlvbiwgbWluUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzaGlmdDtcclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2Vkb3duJywgYnRuT25Nb3VzZURvd24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSBldmVudC5wYWdlWDtcclxuICAgICAgICAgICAgICAgICAgICBpbml0UG9zaXRpb24gPSBwYXJzZUludChkcmFnRWxlbS5jc3MoJ2xlZnQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkb2NPbk1vdXNlTW92ZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbkxlc3NUaGFuTWF4ID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA8PSBtYXhQb3NpdGlvbigpIC0gMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uR3JhdGVyVGhhbk1pbiA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPj0gbWluUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uTGVzc1RoYW5NYXggJiYgcG9zaXRpb25HcmF0ZXJUaGFuTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdFbGVtLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIGluaXRQb3NpdGlvbiAtIGV2ZW50LnBhZ2VYICsgc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdkcmFnc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQcmljZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld01pbiA9IH5+KHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF4ID0gfn4ocGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKG5ld01pbik7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKG5ld01heCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0QnRuLmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRCdG4uY3NzKCdsZWZ0JylcclxuICAgICAgICAgICAgICAgICAgICB9KSovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0U2xpZGVycyhidG4sIG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1Bvc3Rpb24gPSBuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcDtcclxuICAgICAgICAgICAgICAgICAgICBidG4uY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidG4uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwID4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpIC0gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMobGVmdEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4Jykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPiAkc2NvcGUubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdWYWx1ZSwkc2NvcGUubWF4ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPCBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSArIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKHJpZ2h0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlbWl0KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZWZ0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEzKTsqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdG9kbyBpZTggYnVnIGZpeFxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnaWU4JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygrc2xpZGVBcmVhV2lkdGggLSArbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsICtzbGlkZUFyZWFXaWR0aCAtIHBhcnNlSW50KG5ld1ZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFNsaWRlT25DbGljaycsIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBsZXQgc2xpZGVFbWl0RWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1lbWl0XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNsaWRlRW1pdEVsZW1lbnRzLm9uKCdjbGljaycsIHNsaWRlRW1pdE9uQ2xpY2spO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2xpZGVFbWl0T25DbGljaygpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzbGlkZU9uRWxlbWVudCA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICcnICYmIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBXcm9uZyBpbml0IHZhbHVlIGZvciAnc2xpZGUtb24nIGF0dHJpYnV0ZSwgc2hvdWxkIGJlICcnIG9yICdjbG9zZWQnLmApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVVcCgnc2xvdycsIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnY2xvc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlRG93bignc2xvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2xpZGVUb2dnbGVFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uLXRvZ2dsZV0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHNsaWRlVG9nZ2xlRWxlbWVudHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCQodGhpcykuYXR0cignc2xpZGUtb24tdG9nZ2xlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iXX0=
