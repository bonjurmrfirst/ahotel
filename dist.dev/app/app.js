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
			params: { 'type': 'login or join' } /*,
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
			url: '/booking',
			templateUrl: 'app/partials/booking/booking.html',
			params: { 'hotel': 'hotel object' }
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

    BookingController.$inject = ['$stateParams', 'resortService', '$scope'];

    function BookingController($stateParams, resortService, $scope) {

        this.hotel = null;
        this.loaded = false;

        /* dev only */
        var self = this;
        if ($stateParams.hotel._id) {
            this.hotel = $stateParams.hotel;
            self.loaded = true;
        } else {
            getHotels();
        }

        function getHotels() {
            resortService.getResort().then(function (response) {
                self.hotel = response[0];
                self.loaded = true;
            });
        }
        /* dev only */

        //this.hotel = $stateParams.hotel;

        this.getHotelImagesCount = function (count) {
            return new Array(count - 1);
        };
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvaG9tZS9ob21lLnRyZW5kSG90ZWxzSW1nUGF0aHMuanMiLCJwYXJ0aWFscy9tb2RhbC9tb2RhbC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LmFjdGl2aXRpZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5ob3RlbC5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LnNjcm9sbHRvVG9wLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuc2VydmljZS5qcyIsInBhcnRpYWxzL3RvcC90b3AzLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3RvcC90b3AzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5hbmltYXRpb24uanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXJQYXRoLmNvbnN0YW50LmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcGFnZXMvcGFnZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3ByaWNlU2xpZGVyL3ByaWNlU2xpZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9zbGlkZU9uQ2xpY2svc2xpZGVPbkNsaWNrLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJHByb3ZpZGUiLCJkZWNvcmF0b3IiLCIkZGVsZWdhdGUiLCIkd2luZG93IiwibG9nSGlzdG9yeSIsIndhcm4iLCJlcnIiLCJsb2ciLCJtZXNzYWdlIiwiX2xvZ1dhcm4iLCJwdXNoIiwiYXBwbHkiLCJfbG9nRXJyIiwiZXJyb3IiLCJuYW1lIiwic3RhY2siLCJFcnJvciIsInNlbmRPblVubG9hZCIsIm9uYmVmb3JldW5sb2FkIiwibGVuZ3RoIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5IiwiJGluamVjdCIsInByZWxvYWRTZXJ2aWNlUHJvdmlkZXIiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsImdhbGxlcnkiLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJydW4iLCIkcm9vdFNjb3BlIiwicHJlbG9hZFNlcnZpY2UiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwib25sb2FkIiwicHJlbG9hZEltYWdlcyIsIm1ldGhvZCIsImFjdGlvbiIsInByb3ZpZGVyIiwidGltZW91dCIsIiRnZXQiLCIkaHR0cCIsIiR0aW1lb3V0IiwicHJlbG9hZENhY2hlIiwibG9nZ2VyIiwiY29uc29sZSIsImRlYnVnIiwicHJlbG9hZE5hbWUiLCJpbWFnZXMiLCJpbWFnZXNTcmNMaXN0Iiwic3JjIiwicHJlbG9hZCIsInRoZW4iLCJyZXNwb25zZSIsImRhdGEiLCJiaW5kIiwiaSIsImltYWdlIiwiSW1hZ2UiLCJlIiwib25lcnJvciIsImdldFByZWxvYWQiLCJnZXRQcmVsb2FkQ2FjaGUiLCJjb25zdGFudCIsInRvcDMiLCJhdXRoIiwiZ3Vlc3Rjb21tZW50cyIsImhvdGVscyIsInR5cGVzIiwic2V0dGluZ3MiLCJsb2NhdGlvbnMiLCJndWVzdHMiLCJtdXN0SGF2ZXMiLCJhY3Rpdml0aWVzIiwicHJpY2UiLCJjb250cm9sbGVyIiwiQXV0aENvbnRyb2xsZXIiLCIkc2NvcGUiLCJhdXRoU2VydmljZSIsInZhbGlkYXRpb25TdGF0dXMiLCJ1c2VyQWxyZWFkeUV4aXN0cyIsImxvZ2luT3JQYXNzd29yZEluY29ycmVjdCIsImNyZWF0ZVVzZXIiLCJuZXdVc2VyIiwiZ28iLCJsb2dpblVzZXIiLCJzaWduSW4iLCJ1c2VyIiwicHJldmlvdXNTdGF0ZSIsImZhY3RvcnkiLCJVc2VyIiwiYmFja2VuZEFwaSIsIl9iYWNrZW5kQXBpIiwiX2NyZWRlbnRpYWxzIiwiX29uUmVzb2x2ZSIsInN0YXR1cyIsInRva2VuIiwiX3Rva2VuS2VlcGVyIiwic2F2ZVRva2VuIiwiX29uUmVqZWN0ZWQiLCJfdG9rZW4iLCJnZXRUb2tlbiIsImRlbGV0ZVRva2VuIiwicHJvdG90eXBlIiwiY3JlZGVudGlhbHMiLCJzaWduT3V0IiwiZ2V0TG9nSW5mbyIsIkJvb2tpbmdDb250cm9sbGVyIiwiJHN0YXRlUGFyYW1zIiwicmVzb3J0U2VydmljZSIsImhvdGVsIiwibG9hZGVkIiwic2VsZiIsIl9pZCIsImdldEhvdGVscyIsImdldFJlc29ydCIsImdldEhvdGVsSW1hZ2VzQ291bnQiLCJjb3VudCIsIkFycmF5IiwiZGlyZWN0aXZlIiwiYWh0bE1hcERpcmVjdGl2ZSIsInJlc3RyaWN0IiwidGVtcGxhdGUiLCJsaW5rIiwiYWh0bE1hcERpcmVjdGl2ZUxpbmsiLCJlbGVtIiwiYXR0ciIsIndpbmRvdyIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJteUxhdExuZyIsImxhdCIsImxuZyIsIm1hcCIsIm1hcHMiLCJNYXAiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwic2Nyb2xsd2hlZWwiLCJpY29ucyIsImFob3RlbCIsImljb24iLCJtYXJrZXIiLCJNYXJrZXIiLCJ0aXRsZSIsInBvc2l0aW9uIiwiTGF0TG5nIiwiYm91bmRzIiwiTGF0TG5nQm91bmRzIiwiTGF0TGFuZyIsImV4dGVuZCIsImZpdEJvdW5kcyIsImFodGxHYWxsZXJ5RGlyZWN0aXZlIiwic2NvcGUiLCJzaG93Rmlyc3RJbWdDb3VudCIsInNob3dOZXh0SW1nQ291bnQiLCJBaHRsR2FsbGVyeUNvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCJhaHRsR2FsbGVyeUxpbmsiLCJhbGxJbWFnZXNTcmMiLCJsb2FkTW9yZSIsIk1hdGgiLCJtaW4iLCJzaG93Rmlyc3QiLCJzbGljZSIsImlzQWxsSW1hZ2VzTG9hZGVkIiwiYWxsSW1hZ2VzTG9hZGVkIiwiaW1hZ2VzQ291bnQiLCJhbGlnbkltYWdlcyIsIiQiLCJfc2V0SW1hZ2VBbGlnbWVudCIsIm9uIiwiX2dldEltYWdlU291cmNlcyIsImltZ1NyYyIsInRhcmdldCIsIiRyb290IiwiJGJyb2FkY2FzdCIsInNob3ciLCJjYiIsImZpZ3VyZXMiLCJnYWxsZXJ5V2lkdGgiLCJwYXJzZUludCIsImNsb3Nlc3QiLCJjc3MiLCJpbWFnZVdpZHRoIiwiY29sdW1uc0NvdW50Iiwicm91bmQiLCJjb2x1bW5zSGVpZ2h0Iiwiam9pbiIsInNwbGl0IiwiY3VycmVudENvbHVtbnNIZWlnaHQiLCJjb2x1bW5Qb2ludGVyIiwiZWFjaCIsImluZGV4IiwibWF4IiwiR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIiLCJndWVzdGNvbW1lbnRzU2VydmljZSIsImNvbW1lbnRzIiwib3BlbkZvcm0iLCJzaG93UGxlYXNlTG9naU1lc3NhZ2UiLCJ3cml0ZUNvbW1lbnQiLCJnZXRHdWVzdENvbW1lbnRzIiwiYWRkQ29tbWVudCIsInNlbmRDb21tZW50IiwiZm9ybURhdGEiLCJjb21tZW50IiwiZmlsdGVyIiwicmV2ZXJzZSIsIml0ZW1zIiwidHlwZSIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0IiwiSGVhZGVyQ29udHJvbGxlciIsImFodGxIZWFkZXIiLCJzZXJ2aWNlIiwiSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlIiwiJGxvZyIsIlVJdHJhbnNpdGlvbnMiLCJjb250YWluZXIiLCJfY29udGFpbmVyIiwiYW5pbWF0ZVRyYW5zaXRpb24iLCJ0YXJnZXRFbGVtZW50c1F1ZXJ5IiwiY3NzRW51bWVyYWJsZVJ1bGUiLCJmcm9tIiwidG8iLCJkZWxheSIsIm1vdXNlZW50ZXIiLCJ0YXJnZXRFbGVtZW50cyIsImZpbmQiLCJ0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlIiwiYW5pbWF0ZU9wdGlvbnMiLCJhbmltYXRlIiwicmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrIiwiZWxlbWVudFRyaWdnZXJRdWVyeSIsImVsZW1lbnRPblF1ZXJ5IiwiSGVhZGVyVHJhbnNpdGlvbnMiLCJoZWFkZXJRdWVyeSIsImNvbnRhaW5lclF1ZXJ5IiwiY2FsbCIsIl9oZWFkZXIiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsImZpeEhlYWRlckVsZW1lbnQiLCJlbGVtZW50Rml4UXVlcnkiLCJmaXhDbGFzc05hbWUiLCJ1bmZpeENsYXNzTmFtZSIsIm9wdGlvbnMiLCJmaXhFbGVtZW50Iiwib25XaWR0aENoYW5nZUhhbmRsZXIiLCJ0aW1lciIsImZpeFVuZml4TWVudU9uU2Nyb2xsIiwic2Nyb2xsVG9wIiwib25NaW5TY3JvbGx0b3AiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwid2lkdGgiLCJpbm5lcldpZHRoIiwib25NYXhXaW5kb3dXaWR0aCIsIm9mZiIsInNjcm9sbCIsImFodGxTdGlreUhlYWRlciIsImhlYWRlciIsIkhvbWVDb250cm9sbGVyIiwidHJlbmRIb3RlbHNJbWdQYXRocyIsImFodGxNb2RhbERpcmVjdGl2ZSIsInJlcGxhY2UiLCJhaHRsTW9kYWxEaXJlY3RpdmVMaW5rIiwiaW1nIiwiJGFwcGx5IiwidW5kZWZpbmVkIiwibXlMYXRsbmciLCJjb29yZCIsInpvb20iLCJjZW50ZXIiLCJjbG9zZURpYWxvZyIsIm1vZGFsTWFwIiwiYWN0aXZpdGllc0ZpbHRlciIsImZpbHRlcnNTZXJ2aWNlIiwiYXJnIiwiX3N0cmluZ0xlbmd0aCIsInN0cmluZ0xlbmd0aCIsImlzTmFOIiwicmVzdWx0IiwibGFzdEluZGV4T2YiLCJSZXNvcnRDb250cm9sbGVyIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCIkZmlsdGVyIiwiZmlsdGVycyIsImluaXRGaWx0ZXJzIiwiY3VycmVudEZpbHRlcnMiLCJvbkZpbHRlckNoYW5nZSIsImZpbHRlckdyb3VwIiwidmFsdWUiLCJzcGxpY2UiLCJpbmRleE9mIiwiZ2V0U2hvd0hvdGVsQ291bnQiLCJyZWR1Y2UiLCJjb3VudGVyIiwiaXRlbSIsIl9oaWRlIiwiJHdhdGNoIiwibmV3VmFsdWUiLCJvcGVuTWFwIiwiaG90ZWxOYW1lIiwiaG90ZWxDb29yZCIsImtleSIsImhvdGVsRmlsdGVyIiwiZm9yRWFjaCIsImlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMiLCJmaWx0ZXJzSW5Hcm91cCIsIm1hdGNoQXRMZWFzZU9uZUZpbHRlciIsImdldEhvdGVsUHJvcCIsImxvY2F0aW9uIiwiY291bnRyeSIsImVudmlyb25tZW50IiwiZGV0YWlscyIsInNjcm9sbFRvVG9wRGlyZWN0aXZlIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rIiwic2VsZWN0b3IiLCJoZWlnaHQiLCJ0cmltIiwic2Nyb2xsVG9Ub3BDb25maWciLCJlbGVtZW50Iiwic2Nyb2xsVG9Ub3AiLCJvblJlamVjdGVkIiwiYWh0bFRvcDNEaXJlY3RpdmUiLCJ0b3AzU2VydmljZSIsIkFodGxUb3AzQ29udHJvbGxlciIsIiRlbGVtZW50IiwiJGF0dHJzIiwibXVzdEhhdmUiLCJyZXNvcnRUeXBlIiwiYWh0bFRvcDN0eXBlIiwicmVzb3J0IiwiZ2V0SW1nU3JjIiwiZmlsZW5hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWwiLCJkZXRhaWwiLCJkZXRhaWxDbGFzc05hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUiLCJnZXRUb3AzUGxhY2VzIiwiYW5pbWF0aW9uIiwiYW5pbWF0aW9uRnVuY3Rpb24iLCJiZWZvcmVBZGRDbGFzcyIsImNsYXNzTmFtZSIsImRvbmUiLCJzbGlkaW5nRGlyZWN0aW9uIiwiYWh0bFNsaWRlciIsInNsaWRlclNlcnZpY2UiLCJhaHRsU2xpZGVyQ29udHJvbGxlciIsInNsaWRlciIsIm5leHRTbGlkZSIsInByZXZTbGlkZSIsInNldFNsaWRlIiwic2V0TmV4dFNsaWRlIiwic2V0UHJldlNsaWRlIiwiZ2V0Q3VycmVudFNsaWRlIiwic2V0Q3VycmVudFNsaWRlIiwiZml4SUU4cG5nQmxhY2tCZyIsImFycm93cyIsImNsaWNrIiwiZGlzYWJsZWQiLCJzbGlkZXJJbWdQYXRoQ29uc3RhbnQiLCJTbGlkZXIiLCJzbGlkZXJJbWFnZUxpc3QiLCJfaW1hZ2VTcmNMaXN0IiwiX2N1cnJlbnRTbGlkZSIsImdldEltYWdlU3JjTGlzdCIsImdldEluZGV4Iiwic2xpZGUiLCJQYWdlcyIsImhvdGVsc1BlclBhZ2UiLCJjdXJyZW50UGFnZSIsInBhZ2VzVG90YWwiLCJzaG93RnJvbSIsInNob3dOZXh0Iiwic2hvd1ByZXYiLCJzZXRQYWdlIiwicGFnZSIsImlzTGFzdFBhZ2UiLCJpc0ZpcnN0UGFnZSIsInNob3dIb3RlbENvdW50IiwiY2VpbCIsIm1vZGVsIiwic3RhcnRQb3NpdGlvbiIsInByaWNlU2xpZGVyRGlyZWN0aXZlIiwibGVmdFNsaWRlciIsInJpZ2h0U2xpZGVyIiwicHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rIiwicmlnaHRCdG4iLCJsZWZ0QnRuIiwic2xpZGVBcmVhV2lkdGgiLCJ2YWx1ZVBlclN0ZXAiLCJ2YWwiLCJpbml0RHJhZyIsImRyYWdFbGVtIiwiaW5pdFBvc2l0aW9uIiwibWF4UG9zaXRpb24iLCJtaW5Qb3NpdGlvbiIsInNoaWZ0IiwiYnRuT25Nb3VzZURvd24iLCJwYWdlWCIsImRvY09uTW91c2VNb3ZlIiwiYnRuT25Nb3VzZVVwIiwicG9zaXRpb25MZXNzVGhhbk1heCIsInBvc2l0aW9uR3JhdGVyVGhhbk1pbiIsInNldFByaWNlcyIsImVtaXQiLCJuZXdNaW4iLCJuZXdNYXgiLCJzZXRTbGlkZXJzIiwiYnRuIiwibmV3UG9zdGlvbiIsImhhc0NsYXNzIiwidHJpZ2dlciIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUiLCJhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluayIsInNsaWRlRW1pdEVsZW1lbnRzIiwic2xpZGVFbWl0T25DbGljayIsInNsaWRlT25FbGVtZW50Iiwic2xpZGVVcCIsIm9uU2xpZGVBbmltYXRpb25Db21w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QnlOLEtBQUt2TyxLQUFMOztvQkFFQTs7O2dCQUdKLElBQUltYixlQUFlMVMsS0FBSyxnQkFBZ0IsTUFBTTBTLGVBQWUxUyxLQUFLLGdCQUFnQixVQUFVO29CQUN4RjhGLEtBQUt2TyxLQUFMOztvQkFFQTs7O2dCQUdKLElBQUltYixlQUFlMVMsS0FBSyxnQkFBZ0IsSUFBSTtvQkFDeEMwUyxlQUFlQyxRQUFRLFFBQVFDO29CQUMvQkYsZUFBZTFTLEtBQUssWUFBWTt1QkFDN0I7b0JBQ0g0UztvQkFDQUYsZUFBZUcsVUFBVTtvQkFDekJILGVBQWUxUyxLQUFLLFlBQVk7OztnQkFHcEMsU0FBUzRTLDJCQUEyQjtvQkFDaEMsSUFBSUUsc0JBQXNCL1AsRUFBRWhELE1BQU0yRyxLQUFLOztvQkFFdkMzRCxFQUFFdUIsS0FBS3dPLHFCQUFxQixZQUFXO3dCQUNuQy9QLEVBQUUsTUFBTWdRLFlBQVloUSxFQUFFLE1BQU0vQyxLQUFLOzs7Ozs7S0F0RHpEIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJywgWyd1aS5yb3V0ZXInLCAncHJlbG9hZCcsICduZ0FuaW1hdGUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24gKCRwcm92aWRlKSB7XHJcbiAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcignJGxvZycsIGZ1bmN0aW9uICgkZGVsZWdhdGUsICR3aW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsb2dIaXN0b3J5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmxvZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nV2FybiA9ICRkZWxlZ2F0ZS53YXJuO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLndhcm4gPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dXYXJuLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nRXJyID0gJGRlbGVnYXRlLmVycm9yO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmVycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtuYW1lOiBtZXNzYWdlLCBzdGFjazogbmV3IEVycm9yKCkuc3RhY2t9KTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nRXJyLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiBzZW5kT25VbmxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2dIaXN0b3J5LmVyci5sZW5ndGggJiYgIWxvZ0hpc3Rvcnkud2Fybi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKCdwb3N0JywgJy9hcGkvbG9nJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkobG9nSGlzdG9yeSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkZGVsZWdhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpO1xyXG5cclxuLypcclxuICAgICAgICAuZmFjdG9yeSgnbG9nJywgbG9nKTtcclxuXHJcbiAgICBsb2cuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbG9nKCR3aW5kb3csICRsb2cpIHtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHdhcm4oLi4uYXJncykge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChhcmdzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChicm93c2VyTG9nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKGUpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICBzdGFjazogZS5zdGFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJGxvZy5lcnJvcihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdG9kbyBhbGwgZXJyb3JzXHJcblxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2Fybjogd2FybixcclxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgICAgICAgICBzZW5kT25VbmxvYWQ6IHNlbmRPblVubG9hZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhjb25maWcpO1xyXG5cclxuICAgIGNvbmZpZy4kaW5qZWN0ID0gWydwcmVsb2FkU2VydmljZVByb3ZpZGVyJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gY29uZmlnKHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIuY29uZmlnKGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksICdHRVQnLCAnZ2V0JywgMTAwLCAnd2FybmluZycpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2F1dGgvYXV0aC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsndHlwZSc6ICdsb2dpbiBvciBqb2luJ30vKixcclxuXHRcdFx0XHRvbkVudGVyOiBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xyXG5cdFx0XHRcdFx0JHJvb3RTY29wZS4kc3RhdGUgPSBcImF1dGhcIjtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2J1bmdhbG93cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2hvdGVscycsIHtcclxuXHRcdFx0XHRcdHVybDogJy90b3AnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC92aWxsYXMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdnYWxsZXJ5Jywge1xyXG5cdFx0XHRcdHVybDogJy9nYWxsZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdndWVzdGNvbW1lbnRzJywge1xyXG5cdFx0XHRcdHVybDogJy9ndWVzdGNvbW1lbnRzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdkZXN0aW5hdGlvbnMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvZGVzdGluYXRpb25zJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Rlc3RpbmF0aW9ucy9kZXN0aW5hdGlvbnMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdyZXNvcnQnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3Jlc29ydCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3Jlc29ydC5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Jvb2tpbmcnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2Jvb2tpbmcnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Jvb2tpbmcvYm9va2luZy5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsnaG90ZWwnOiAnaG90ZWwgb2JqZWN0J31cclxuXHRcdFx0fSk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAucnVuKHJ1bik7XHJcblxyXG4gICAgcnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnICwgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJywgJyR3aW5kb3cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlLCAkd2luZG93LCBsb2cpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZU5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZVBhcmFtczogbnVsbCxcclxuICAgICAgICAgICAgc3RhdGVIaXN0b3J5OiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcy8qLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMgdG9kbyovKXtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZU5hbWUgPSB0b1N0YXRlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeS5wdXNoKHRvU3RhdGUubmFtZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvL3RvZG8gb25sb2FkIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vSDvv70g77+977+977+977+977+977+9XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlLnByZWxvYWRJbWFnZXMoJ2dhbGxlcnknLCB7dXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCBtZXRob2Q6ICdHRVQnLCBhY3Rpb246ICdnZXQnfSk7IC8vdG9kbyBkZWwgbWV0aG9kLCBhY3Rpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vbG9nLnNlbmRPblVubG9hZCgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncHJlbG9hZCcsIFtdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3ByZWxvYWQnKVxyXG4gICAgICAgIC5wcm92aWRlcigncHJlbG9hZFNlcnZpY2UnLCBwcmVsb2FkU2VydmljZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcHJlbG9hZFNlcnZpY2UoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gZnVuY3Rpb24odXJsID0gJy9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcclxuICAgICAgICAgICAgICAgIGxvZzogbG9nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCRodHRwLCAkdGltZW91dCkge1xyXG4gICAgICAgICAgICBsZXQgcHJlbG9hZENhY2hlID0gW10sXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIgPSBmdW5jdGlvbihtZXNzYWdlLCBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdzaWxlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnZGVidWcnICYmIGxvZyA9PT0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvZyA9PT0gJ3dhcm5pbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZEltYWdlcyhwcmVsb2FkTmFtZSwgaW1hZ2VzKSB7IC8vdG9kbyBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZXNTcmNMaXN0ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdhcnJheScpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gaW1hZ2VzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLm1ldGhvZCB8fCBjb25maWcubWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGltYWdlcy51cmwgfHwgY29uZmlnLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5hY3Rpb24gfHwgY29uZmlnLmFjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnRpbWVvdXQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cub25sb2FkID0gcHJlbG9hZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChwcmVsb2FkLmJpbmQobnVsbCwgaW1hZ2VzU3JjTGlzdCksIGNvbmZpZy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzU3JjTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2VzU3JjTGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzb2x2ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIodGhpcy5zcmMsICdkZWJ1ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRQcmVsb2FkKHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ3ByZWxvYWRTZXJ2aWNlOiBnZXQgcmVxdWVzdCAnICsgJ1wiJyArIHByZWxvYWROYW1lICsgJ1wiJywgJ2RlYnVnJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWxvYWRDYWNoZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkQ2FjaGVbaV0ubmFtZSA9PT0gcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZVtpXS5zcmNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdObyBwcmVsb2FkcyBmb3VuZCcsICd3YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwcmVsb2FkSW1hZ2VzOiBwcmVsb2FkSW1hZ2VzLFxyXG4gICAgICAgICAgICAgICAgZ2V0UHJlbG9hZENhY2hlOiBnZXRQcmVsb2FkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2JhY2tlbmRQYXRoc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0b3AzOiAnL2FwaS90b3AzJyxcclxuICAgICAgICAgICAgYXV0aDogJy9hcGkvdXNlcnMnLFxyXG4gICAgICAgICAgICBnYWxsZXJ5OiAnL2FwaS9nYWxsZXJ5JyxcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50czogJy9hcGkvZ3Vlc3Rjb21tZW50cycsXHJcbiAgICAgICAgICAgIGhvdGVsczogJy9hcGkvaG90ZWxzJ1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2hvdGVsRGV0YWlsc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0eXBlczogW1xyXG4gICAgICAgICAgICAgICAgJ0hvdGVsJyxcclxuICAgICAgICAgICAgICAgICdCdW5nYWxvdycsXHJcbiAgICAgICAgICAgICAgICAnVmlsbGEnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nczogW1xyXG4gICAgICAgICAgICAgICAgJ0NvYXN0JyxcclxuICAgICAgICAgICAgICAgICdDaXR5JyxcclxuICAgICAgICAgICAgICAgICdEZXNlcnQnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICdOYW1pYmlhJyxcclxuICAgICAgICAgICAgICAgICdMaWJ5YScsXHJcbiAgICAgICAgICAgICAgICAnU291dGggQWZyaWNhJyxcclxuICAgICAgICAgICAgICAgICdUYW56YW5pYScsXHJcbiAgICAgICAgICAgICAgICAnUGFwdWEgTmV3IEd1aW5lYScsXHJcbiAgICAgICAgICAgICAgICAnUmV1bmlvbicsXHJcbiAgICAgICAgICAgICAgICAnU3dhemlsYW5kJyxcclxuICAgICAgICAgICAgICAgICdTYW8gVG9tZScsXHJcbiAgICAgICAgICAgICAgICAnTWFkYWdhc2NhcicsXHJcbiAgICAgICAgICAgICAgICAnTWF1cml0aXVzJyxcclxuICAgICAgICAgICAgICAgICdTZXljaGVsbGVzJyxcclxuICAgICAgICAgICAgICAgICdNYXlvdHRlJyxcclxuICAgICAgICAgICAgICAgICdVa3JhaW5lJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgZ3Vlc3RzOiBbXHJcbiAgICAgICAgICAgICAgICAnMScsXHJcbiAgICAgICAgICAgICAgICAnMicsXHJcbiAgICAgICAgICAgICAgICAnMycsXHJcbiAgICAgICAgICAgICAgICAnNCcsXHJcbiAgICAgICAgICAgICAgICAnNSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIG11c3RIYXZlczogW1xyXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxyXG4gICAgICAgICAgICAgICAgJ2tpZHMnLFxyXG4gICAgICAgICAgICAgICAgJ3Bvb2wnLFxyXG4gICAgICAgICAgICAgICAgJ3NwYScsXHJcbiAgICAgICAgICAgICAgICAnd2lmaScsXHJcbiAgICAgICAgICAgICAgICAncGV0JyxcclxuICAgICAgICAgICAgICAgICdkaXNhYmxlJyxcclxuICAgICAgICAgICAgICAgICdiZWFjaCcsXHJcbiAgICAgICAgICAgICAgICAncGFya2luZycsXHJcbiAgICAgICAgICAgICAgICAnY29uZGl0aW9uaW5nJyxcclxuICAgICAgICAgICAgICAgICdsb3VuZ2UnLFxyXG4gICAgICAgICAgICAgICAgJ3RlcnJhY2UnLFxyXG4gICAgICAgICAgICAgICAgJ2dhcmRlbicsXHJcbiAgICAgICAgICAgICAgICAnZ3ltJyxcclxuICAgICAgICAgICAgICAgICdiaWN5Y2xlcydcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGFjdGl2aXRpZXM6IFtcclxuICAgICAgICAgICAgICAgICdDb29raW5nIGNsYXNzZXMnLFxyXG4gICAgICAgICAgICAgICAgJ0N5Y2xpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0Zpc2hpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0dvbGYnLFxyXG4gICAgICAgICAgICAgICAgJ0hpa2luZycsXHJcbiAgICAgICAgICAgICAgICAnSG9yc2UtcmlkaW5nJyxcclxuICAgICAgICAgICAgICAgICdLYXlha2luZycsXHJcbiAgICAgICAgICAgICAgICAnTmlnaHRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdTYWlsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTY3ViYSBkaXZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3BwaW5nIC8gbWFya2V0cycsXHJcbiAgICAgICAgICAgICAgICAnU25vcmtlbGxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NraWluZycsXHJcbiAgICAgICAgICAgICAgICAnU3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2lsZGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmRzdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaW5lIHRhc3RpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1lvZ2EnIFxyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgcHJpY2U6IFtcclxuICAgICAgICAgICAgICAgIFwibWluXCIsXHJcbiAgICAgICAgICAgICAgICBcIm1heFwiXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRyb290U2NvcGUsICRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3Q6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduSW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRyb290U2NvcGUsICRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWxldGVUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlVG9rZW46IHNhdmVUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnZXRUb2tlbjogZ2V0VG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlVG9rZW46IGRlbGV0ZVRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuZGVsZXRlVG9rZW4oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5nZXRMb2dJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogdGhpcy5fY3JlZGVudGlhbHMsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5fdG9rZW5LZWVwZXIuZ2V0VG9rZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0NvbnRyb2xsZXInLCBCb29raW5nQ29udHJvbGxlcik7XHJcblxyXG4gICAgQm9va2luZ0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlUGFyYW1zJywgJ3Jlc29ydFNlcnZpY2UnLCAnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQm9va2luZ0NvbnRyb2xsZXIoJHN0YXRlUGFyYW1zLCByZXNvcnRTZXJ2aWNlLCAkc2NvcGUpIHtcclxuXHJcbiAgICAgICAgdGhpcy5ob3RlbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyogZGV2IG9ubHkgKi9cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5ob3RlbC5faWQpIHtcclxuICAgICAgICAgICAgdGhpcy5ob3RlbCA9ICRzdGF0ZVBhcmFtcy5ob3RlbDtcclxuICAgICAgICAgICAgc2VsZi5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdldEhvdGVscygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0SG90ZWxzKCkge1xyXG4gICAgICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhvdGVsID0gcmVzcG9uc2VbMF07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBkZXYgb25seSAqL1xyXG5cclxuICAgICAgICAvL3RoaXMuaG90ZWwgPSAkc3RhdGVQYXJhbXMuaG90ZWw7XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0SG90ZWxJbWFnZXNDb3VudCA9IGZ1bmN0aW9uKGNvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQXJyYXkoY291bnQgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1hcCcsIGFodGxNYXBEaXJlY3RpdmUpO1xuXG4gICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJkZXN0aW5hdGlvbnNfX21hcFwiPjwvZGl2PicsXG4gICAgICAgICAgICBsaW5rOiBhaHRsTWFwRGlyZWN0aXZlTGlua1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcbiAgICAgICAgICAgICAgICBpbml0TWFwKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBtYXBTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xuICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcFNjcmlwdCk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9ucyA9IFtcbiAgICAgICAgICAgICAgICAgICAgW1wiT3Rqb3pvbmRqdXBhIFJlZ2lvbiwgS2FsYWhhcmkgRGVzZXJ0LCBOYW1pYmlhXCIsIC0yMC4zMzA4NjksIDE3LjM0NjU2M10sXG4gICAgICAgICAgICAgICAgICAgIFtcIlNpcnRlIERpc3RyaWN0LCBTYWhhcmEgRGVzZXJ0LCBMaWJ5YVwiLCAzMS4xOTUwMDUsIDE2LjUwMDQ4M10sXG4gICAgICAgICAgICAgICAgICAgIFtcIkxpbXBvcG8sIFNvdXRoIEFmcmljYVwiLCAtMjMuNzg5OTAwLCAzMC4xNzU2MzddLFxuICAgICAgICAgICAgICAgICAgICBbXCJCdWJ1YnUsIFphbnppYmFyIFRvd24gVGFuemFuaWFcIiwgLTYuMTAxMjQ3LCAzOS4yMTU3NThdLFxuICAgICAgICAgICAgICAgICAgICBbXCJNYWRhbmcgUHJvdmluY2UsIFBhcHVhIE5ldyBHdWluZWFcIiwgLTUuNTEwMzc5LCAxNDUuOTgwNDk3XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiU2FpbnQgQW5kcmUsIFJldW5pb25cIiwgLTIwLjkxOTQxMCwgNTUuNjQyNDgzXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiTHVib21ibyBSZWdpb24sIFN3YXppbGFuZFwiLCAtMjYuNzg0OTMwLCAzMS43MzQ4MjBdLFxuICAgICAgICAgICAgICAgICAgICBbXCJDYW50YWdhbG8gUz9vIFRvbT8gYW5kIFByP25jaXBlXCIsIDAuMjM3NjM3LCA2LjczODgzNV0sXG4gICAgICAgICAgICAgICAgICAgIFtcIkFtcGFuaWh5IE1hZGFnYXNjYXJcIiwgLTI1LjAyMzI5NiwgNDQuMDYzODY5XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiUGxhaW5lIENvcmFpbC1MYSBGb3VjaGUgQ29yYWlsIE1hdXJpdGl1c1wiLCAtMTkuNzQwODE3LCA2My4zNjMyOTRdLFxuICAgICAgICAgICAgICAgICAgICBbXCJTb3V0aCBBZ2FsZWdhIElzbGFuZHMgTWF1cml0aXVzXCIsIC0xMC40NTU0MTIsIDU2LjY4NTMwMV0sXG4gICAgICAgICAgICAgICAgICAgIFtcIk5vcnRoIEFnYWxlZ2EgSXNsYW5kcyBNYXVyaXRpdXNcIiwgLTEwLjQzMzk5NSwgNTYuNjQ3MjY4XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQ29ldGl2eSBTZXljaGVsbGVzXCIsIC03LjE0MDMzOCwgNTYuMjcwMzg0XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiRGVtYmVuaSBNYXlvdHRlXCIsIC0xMi44Mzk5MjgsIDQ1LjE5MDg1NV0sXG4gICAgICAgICAgICAgICAgICAgIFtcIkJhYnludHNpIEt5aXZzJ2thIG9ibGFzdCwgVWtyYWluZVwiLCA1MC42Mzg4MDAsIDMwLjAyMjUzOV0sXG4gICAgICAgICAgICAgICAgICAgIFtcIlBlY2h5a2h2b3N0eSwgVm9seW5zJ2thIG9ibGFzdCwgVWtyYWluZVwiLCA1MC41MDI0OTUsIDI0LjYxNDczMl0sXG4gICAgICAgICAgICAgICAgICAgIFtcIkJpbGhvcm9kLURuaXN0cm92cydreWkgZGlzdHJpY3QsIE9kZXNzYSBPYmxhc3QsIFVrcmFpbmVcIiwgNDYuMDYxMTE2LCAzMC40MTI0MDFdLFxuICAgICAgICAgICAgICAgICAgICBbXCJQZXRydXNoa3ksIEt5aXZzJ2thIG9ibGFzdCwgVWtyYWluZVwiLCA1MC40MjA5OTgsIDMwLjE2MTU0OF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIlZlbHlrYSBEb2NoLCBDaGVybmloaXZzJ2thIG9ibGFzdCwgVWtyYWluZVwiLCA1MS4zMDc1MTgsIDMyLjU3NDIzMl1cbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgdmFyIG15TGF0TG5nID0ge2xhdDogLTI1LjM2MywgbG5nOiAxMzEuMDQ0fTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxuICAgICAgICAgICAgICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Rlc3RpbmF0aW9uc19fbWFwJylbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgaWNvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGxvY2F0aW9uc1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKmNlbnRlcmluZyovXG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMgKCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIExhdExhbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nIChsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQoTGF0TGFuZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJyR0aW1lb3V0JywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCAkdGltZW91dCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlKSB7IC8vdG9kbyBub3Qgb25seSBsb2FkIGJ1dCBsaXN0U3JjIHRvbyBhY2NlcHRcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dGaXJzdCcsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd05leHQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsSW1hZ2VzU3JjID0gW10sXHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9ICRzY29wZS5zaG93Rmlyc3RJbWdDb3VudCxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQgPSAkc2NvcGUuc2hvd05leHRJbWdDb3VudDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gTWF0aC5taW4oc2hvd0ZpcnN0SW1nQ291bnQgKyBzaG93TmV4dEltZ0NvdW50LCBhbGxJbWFnZXNTcmMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBbGxJbWFnZXNMb2FkZWQgPSB0aGlzLnNob3dGaXJzdCA+PSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyovXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsbEltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob3dGaXJzdCkgPyB0aGlzLnNob3dGaXJzdC5sZW5ndGggPT09IHRoaXMuaW1hZ2VzQ291bnQ6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmdhbGxlcnkgaW1nJykubGVuZ3RoIDwgc2hvd0ZpcnN0SW1nQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb29wcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHRoaXMuYWxpZ25JbWFnZXMsIDApXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMoKTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzQ291bnQgPSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGVsZW0ub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nU3JjID0gZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgIC8qIHZhciAkaW1hZ2VzID0gJCgnLmdhbGxlcnkgaW1nJyk7XHJcbiAgICAgICAgICAgIHZhciBsb2FkZWRfaW1hZ2VzX2NvdW50ID0gMDsqL1xyXG4gICAgICAgICAgICAvKiRzY29wZS5hbGlnbkltYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJGltYWdlcy5sb2FkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZF9pbWFnZXNfY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZF9pbWFnZXNfY291bnQgPT0gJGltYWdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3NldEltYWdlQWxpZ21lbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyAvLyB0b2RvXHJcbiAgICAgICAgICAgIH07Ki9cclxuXHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmFsaWduSW1hZ2VzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKGNiKSB7XHJcbiAgICAgICAgICAgIGNiKHByZWxvYWRTZXJ2aWNlLmdldFByZWxvYWRDYWNoZSgnZ2FsbGVyeScpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9zZXRJbWFnZUFsaWdtZW50KCkgeyAvL3RvZG8gYXJndW1lbnRzIG5hbWluZywgZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWd1cmVzID0gJCgnLmdhbGxlcnlfX2ZpZ3VyZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdhbGxlcnlXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY2xvc2VzdCgnLmdhbGxlcnknKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlV2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNzcygnd2lkdGgnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbHVtbnNDb3VudCA9IE1hdGgucm91bmQoZ2FsbGVyeVdpZHRoIC8gaW1hZ2VXaWR0aCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodCA9IG5ldyBBcnJheShjb2x1bW5zQ291bnQgKyAxKS5qb2luKCcwJykuc3BsaXQoJycpLm1hcCgoKSA9PiB7cmV0dXJuIDB9KSwgLy90b2RvIGRlbCBqb2luLXNwbGl0XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHQgPSBjb2x1bW5zSGVpZ2h0LnNsaWNlKDApLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICQoZmlndXJlcykuY3NzKCdtYXJnaW4tdG9wJywgJzAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZmlndXJlcywgZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ21hcmdpbi10b3AnLCAtKE1hdGgubWF4LmFwcGx5KG51bGwsIGNvbHVtbnNIZWlnaHQpIC0gY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSkgKyAncHgnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpICsgY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbHVtblBvaW50ZXIgPT09IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uc0hlaWdodC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodFtpXSArPSBjdXJyZW50Q29sdW1uc0hlaWdodFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcbi8qICAgICAgICAuY29udHJvbGxlcignR2FsbGVyeUNvbnRyb2xsZXInLCBHYWxsZXJ5Q29udHJvbGxlcik7XHJcblxyXG4gICAgR2FsbGVyeUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGltYWdlc1NyYyA9IF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhpbWFnZXNTcmMpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsqL1xyXG5cclxuLypcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0OiBcIj1haHRsR2FsbGVyeVNob3dGaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgc2hvd0FmdGVyOiBcIj1haHRsR2FsbGVyeVNob3dBZnRlclwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oKXt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYSA9IDEzO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuYSk7XHJcbiAgICAgICAgICAgIC8hKnZhciBhbGxJbWFnZXNTcmM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd0ZpcnN0SW1hZ2VzU3JjID0gWycxMjMnXTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy90b2RvXHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgfSkqIS9cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0d1ZXN0Y29tbWVudHNDb250cm9sbGVyJywgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcigkcm9vdFNjb3BlLCBndWVzdGNvbW1lbnRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMud3JpdGVDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiRsb2dnZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5nZXRHdWVzdENvbW1lbnRzKCkudGhlbihcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5zZW5kQ29tbWVudCh0aGlzLmZvcm1EYXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cy5wdXNoKHsnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZSwgJ2NvbW1lbnQnOiB0aGlzLmZvcm1EYXRhLmNvbW1lbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGF0YSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3JldmVyc2UnLCByZXZlcnNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXZlcnNlKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgICAgICAgICAvL3RvIGVycm9yc1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbXMuc2xpY2UoKS5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnLCBndWVzdGNvbW1lbnRzU2VydmljZSk7XHJcblxyXG4gICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBndWVzdGNvbW1lbnRzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0R3Vlc3RDb21tZW50czogZ2V0R3Vlc3RDb21tZW50cyxcclxuICAgICAgICAgICAgc2VuZENvbW1lbnQ6IHNlbmRDb21tZW50XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0R3Vlc3RDb21tZW50cyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb21tZW50KGNvbW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXIgPSBhdXRoU2VydmljZS5nZXRMb2dJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IHVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgSGVhZGVyQ29udHJvbGxlcik7XHJcblxyXG4gICAgSGVhZGVyQ29udHJvbGxlci4kaW5qZWN0ID0gWydhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnNpZ25PdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25PdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxIZWFkZXInLCBhaHRsSGVhZGVyKTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bEhlYWRlcigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUFDJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5zZXJ2aWNlKCdIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpO1xyXG5cclxuXHRIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvZyddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJHRpbWVvdXQsICRsb2cpIHtcclxuXHRcdGZ1bmN0aW9uIFVJdHJhbnNpdGlvbnMoY29udGFpbmVyKSB7XHJcblx0XHRcdGlmICghJChjb250YWluZXIpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudCAnJHtjb250YWluZXJ9JyBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9jb250YWluZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5hbmltYXRlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50c1F1ZXJ5LFxyXG5cdFx0XHR7Y3NzRW51bWVyYWJsZVJ1bGUgPSAnd2lkdGgnLCBmcm9tID0gMCwgdG8gPSAnYXV0bycsIGRlbGF5ID0gMTAwfSkge1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2NvbnRhaW5lciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGxldCB0YXJnZXRFbGVtZW50cyA9ICQodGhpcykuZmluZCh0YXJnZXRFbGVtZW50c1F1ZXJ5KSxcclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdGlmICghdGFyZ2V0RWxlbWVudHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHt0YXJnZXRFbGVtZW50c1F1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRcdHJldHVyblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCB0byk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSA9IHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCBmcm9tKTtcclxuXHJcblx0XHRcdFx0bGV0IGFuaW1hdGVPcHRpb25zID0ge307XHJcblx0XHRcdFx0YW5pbWF0ZU9wdGlvbnNbY3NzRW51bWVyYWJsZVJ1bGVdID0gdGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuYW5pbWF0ZShhbmltYXRlT3B0aW9ucywgZGVsYXkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5yZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2sgPSBmdW5jdGlvbihlbGVtZW50VHJpZ2dlclF1ZXJ5LCBlbGVtZW50T25RdWVyeSkge1xyXG5cdFx0XHRpZiAoISQoZWxlbWVudFRyaWdnZXJRdWVyeSkubGVuZ3RoIHx8ICEkKGVsZW1lbnRPblF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtlbGVtZW50VHJpZ2dlclF1ZXJ5fSAke2VsZW1lbnRPblF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnRPblF1ZXJ5KS5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zKGhlYWRlclF1ZXJ5LCBjb250YWluZXJRdWVyeSkge1xyXG5cdFx0XHRVSXRyYW5zaXRpb25zLmNhbGwodGhpcywgY29udGFpbmVyUXVlcnkpO1xyXG5cclxuXHRcdFx0aWYgKCEkKGhlYWRlclF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtoZWFkZXJRdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0dGhpcy5faGVhZGVyID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5faGVhZGVyID0gJChoZWFkZXJRdWVyeSk7XHJcblx0XHR9XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShVSXRyYW5zaXRpb25zLnByb3RvdHlwZSk7XHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZWFkZXJUcmFuc2l0aW9ucztcclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuZml4SGVhZGVyRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50Rml4UXVlcnksIGZpeENsYXNzTmFtZSwgdW5maXhDbGFzc05hbWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2hlYWRlciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgZml4RWxlbWVudCA9ICQoZWxlbWVudEZpeFF1ZXJ5KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCkge1xyXG5cdFx0XHRcdGxldCB0aW1lcjtcclxuXHJcblx0XHRcdFx0ZnVuY3Rpb24gZml4VW5maXhNZW51T25TY3JvbGwoKSB7XHJcblx0XHRcdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gb3B0aW9ucy5vbk1pblNjcm9sbHRvcCkge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LmFkZENsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLmlubmVyV2lkdGgoKTtcclxuXHJcblx0XHRcdFx0aWYgKHdpZHRoIDwgb3B0aW9ucy5vbk1heFdpbmRvd1dpZHRoKSB7XHJcblx0XHRcdFx0XHRmaXhVbmZpeE1lbnVPblNjcm9sbCgpO1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLmFkZENsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRpbWVyKSB7XHJcblx0XHRcdFx0XHRcdFx0dGltZXIgPSAkdGltZW91dChmaXhVbmZpeE1lbnVPblNjcm9sbCwgMTUwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNlbGYuX2hlYWRlci5yZW1vdmVDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCk7XHJcblx0XHRcdCQod2luZG93KS5vbigncmVzaXplJywgb25XaWR0aENoYW5nZUhhbmRsZXIpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIEhlYWRlclRyYW5zaXRpb25zO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFN0aWt5SGVhZGVyJyxhaHRsU3Rpa3lIZWFkZXIpO1xyXG5cclxuXHRhaHRsU3Rpa3lIZWFkZXIuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTdGlreUhlYWRlcihIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKCkge1xyXG5cdFx0XHRsZXQgaGVhZGVyID0gbmV3IEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgnLmwtaGVhZGVyJywgJy5uYXZfX2l0ZW0tY29udGFpbmVyJyk7XHJcblxyXG5cdFx0XHRoZWFkZXIuYW5pbWF0ZVRyYW5zaXRpb24oXHJcblx0XHRcdFx0Jy5zdWItbmF2Jywge1xyXG5cdFx0XHRcdFx0Y3NzRW51bWVyYWJsZVJ1bGU6ICdoZWlnaHQnLFxyXG5cdFx0XHRcdFx0ZGVsYXk6IDMwMH0pXHJcblx0XHRcdFx0LnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayhcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LXRyaWdnZXJdJyxcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LW9uXScpXHJcblx0XHRcdFx0LmZpeEhlYWRlckVsZW1lbnQoXHJcblx0XHRcdFx0XHQnLm5hdicsXHJcblx0XHRcdFx0XHQnanNfbmF2LS1maXhlZCcsXHJcblx0XHRcdFx0XHQnanNfbC1oZWFkZXItLXJlbGF0aXZlJywge1xyXG5cdFx0XHRcdFx0XHRvbk1pblNjcm9sbHRvcDogODgsXHJcblx0XHRcdFx0XHRcdG9uTWF4V2luZG93V2lkdGg6IDg1MH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgSG9tZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEhvbWVDb250cm9sbGVyLiRpbmplY3QgPSBbJ3RyZW5kSG90ZWxzSW1nUGF0aHMnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcih0cmVuZEhvdGVsc0ltZ1BhdGhzKSB7XHJcbiAgICAgICAgdGhpcy5ob3RlbHMgPSB0cmVuZEhvdGVsc0ltZ1BhdGhzO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3RyZW5kSG90ZWxzSW1nUGF0aHMnLCBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdIb3RlbDEnLFxyXG4gICAgICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2ltYWdlcy9ob21lL3RyZW5kNi5qcGcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdIb3RlbDInLFxyXG4gICAgICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2ltYWdlcy9ob21lL3RyZW5kNi5qcGcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdIb3RlbDMnLFxyXG4gICAgICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2ltYWdlcy9ob21lL3RyZW5kNi5qcGcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdIb3RlbDQnLFxyXG4gICAgICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2ltYWdlcy9ob21lL3RyZW5kNi5qcGcnXHJcbiAgICAgICAgICAgIH0se1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsNScsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0hvdGVsNicsXHJcbiAgICAgICAgICAgICAgICBzcmM6ICdhc3NldHMvaW1hZ2VzL2hvbWUvdHJlbmQ2LmpwZydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTW9kYWwnLCBhaHRsTW9kYWxEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgcmVwbGFjZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxNb2RhbERpcmVjdGl2ZUxpbmssXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL21vZGFsL21vZGFsLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3cgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ21vZGFsT3BlbicsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAnaW1hZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNyYyA9IGRhdGEuc3JjO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LmltZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpOy8vdG9kbyBhcHBseT9cclxuICAgICAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdtYXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3cubWFwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmdvb2dsZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hcFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQuc3JjID0gJ2h0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9qcz9rZXk9QUl6YVN5Qnh4Q0syLXVWeWw2OXduN0s2MU5QQVFEZjd5SC1qZjN3JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwU2NyaXB0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbXlMYXRsbmcgPSB7bGF0OiBkYXRhLmNvb3JkLmxhdCwgbG5nOiBkYXRhLmNvb3JkLmxuZ307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IG15TGF0bG5nXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG15TGF0bG5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5jbG9zZURpYWxvZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNob3cgPSB7fTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNYXAobmFtZSwgY29vcmQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbnMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgW25hbWUsIGNvb3JkLmxhdCwgY29vcmQubG5nXVxyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2JqZWN0IGFuZCBzcGVjaWZ5IHRoZSBET00gZWxlbWVudCBmb3IgZGlzcGxheS5cclxuICAgICAgICAgICAgICAgIHZhciBtb2RhbE1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiB7bGF0OiBjb29yZC5sYXQsIGxuZzogY29vcmQubG5nfSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogOVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGljb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnYXNzZXRzL2ltYWdlcy9pY29uX21hcC5wbmcnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtb2RhbE1hcCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4vKlxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3JkLmxhdCwgY29vcmQubG5nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtb2RhbE1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8hKmNlbnRlcmluZyohL1xyXG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMgKCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBMYXRMYW5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyAobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQoTGF0TGFuZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RhbE1hcC5maXRCb3VuZHMoYm91bmRzKTsqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdhY3Rpdml0aWVzRmlsdGVyJywgYWN0aXZpdGllc0ZpbHRlcik7XHJcblxyXG4gICAgYWN0aXZpdGllc0ZpbHRlci4kaW5qZWN0ID0gWyckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gYWN0aXZpdGllc0ZpbHRlcigkbG9nLCBmaWx0ZXJzU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYXJnLCBfc3RyaW5nTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzdHJpbmdMZW5ndGggPSBwYXJzZUludChfc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc05hTihzdHJpbmdMZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYENhbid0IHBhcnNlIGFyZ3VtZW50OiAke19zdHJpbmdMZW5ndGh9YCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBhcmcuam9pbignLCAnKS5zbGljZSgwLCBzdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5zbGljZSgwLCByZXN1bHQubGFzdEluZGV4T2YoJywnKSkgKyAnLi4uJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUmVzb3J0Q29udHJvbGxlcicsIFJlc29ydENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFJlc29ydENvbnRyb2xsZXIuJGluamVjdCA9IFsncmVzb3J0U2VydmljZScsICdob3RlbERldGFpbHNDb25zdGFudCcsICckZmlsdGVyJywgJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJlc29ydENvbnRyb2xsZXIocmVzb3J0U2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQsICRmaWx0ZXIsICRzY29wZSkge1xyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9IGluaXRGaWx0ZXJzKCk7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50RmlsdGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMub25GaWx0ZXJDaGFuZ2UgPSBmdW5jdGlvbihmaWx0ZXJHcm91cCwgZmlsdGVyLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0gPSBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0gfHwgW107XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0ucHVzaChmaWx0ZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLnNwbGljZShjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uaW5kZXhPZihmaWx0ZXIpLCAxKTtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBob3RlbHMgPSB7fTtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IGhvdGVscztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLmZpbHRlcnMucHJpY2UsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVycy5wcmljZSA9IFtuZXdWYWx1ZV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjdXJyZW50RmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKShob3RlbHMsIGN1cnJlbnRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpOyAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5NYXAgPSBmdW5jdGlvbihob3RlbE5hbWUsIGhvdGVsQ29vcmQsIGhvdGVsKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogJ21hcCcsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBob3RlbE5hbWUsXHJcbiAgICAgICAgICAgICAgICBjb29yZDogaG90ZWxDb29yZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywgZGF0YSlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0RmlsdGVycygpIHtcclxuICAgICAgICAgICAgbGV0IGZpbHRlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICAgICAgZmlsdGVyc1trZXldID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhvdGVsRGV0YWlsc0NvbnN0YW50W2tleV0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZmlsdGVycy5wcmljZSA9IHtcclxuICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgIG1heDogMTAwMFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcnNcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2hvdGVsRmlsdGVyJywgaG90ZWxGaWx0ZXIpO1xyXG5cclxuICAgIGhvdGVsRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBob3RlbEZpbHRlcigkbG9nKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGhvdGVscywgZmlsdGVycykge1xyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaG90ZWxzLCBmdW5jdGlvbihob3RlbCkge1xyXG4gICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZmlsdGVycywgZnVuY3Rpb24oZmlsdGVyc0luR3JvdXAsIGZpbHRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdndWVzdHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnNJbkdyb3VwID0gW2ZpbHRlcnNJbkdyb3VwW2ZpbHRlcnNJbkdyb3VwLmxlbmd0aCAtIDFdXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsdGVyc0luR3JvdXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoQXRMZWFzZU9uZUZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoKGZpbHRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbG9jYXRpb25zJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmxvY2F0aW9uLmNvdW50cnkgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0eXBlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC50eXBlID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2V0dGluZ3MnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZW52aXJvbm1lbnQgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtdXN0SGF2ZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZGV0YWlsc1tmaWx0ZXJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FjdGl2aXRpZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gfmhvdGVsLmFjdGl2aXRpZXMuaW5kZXhPZihmaWx0ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3ByaWNlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnByaWNlID49IGZpbHRlci5taW4gJiYgaG90ZWwucHJpY2UgPD0gZmlsdGVyLm1heDtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdndWVzdHMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZ3Vlc3RzLm1heCA+PSArZmlsdGVyWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaG90ZWxzLmZpbHRlcigoaG90ZWwpID0+ICFob3RlbC5faGlkZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdzY3JvbGxUb1RvcCcsIHNjcm9sbFRvVG9wRGlyZWN0aXZlKTtcclxuXHJcbiAgICBzY3JvbGxUb1RvcERpcmVjdGl2ZS4kaW5qZWN0ID0gWyckd2luZG93JywgJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZSgkbG9nKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogc2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IsIGhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmICgxKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJC50cmltKGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoMCwgYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykpKTtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBwYXJzZUludChhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLnNsaWNlKGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuaW5kZXhPZignLCcpICsgMSkpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2Nyb2xsLXRvLXRvcC1jb25maWcgaXMgbm90IGRlZmluZWRgKTtcclxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciB8fCAnaHRtbCwgYm9keSc7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtKS5vbihhdHRyLnNjcm9sbFRvVG9wLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IGhlaWdodCB9LCBcInNsb3dcIik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgncmVzb3J0U2VydmljZScsIHJlc29ydFNlcnZpY2UpO1xyXG5cclxuICAgIHJlc29ydFNlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXNvcnRTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFJlc29ydDogZ2V0UmVzb3J0XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmVzb3J0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihvblJlc29sdmUsIG9uUmVqZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFRvcDMnLCBhaHRsVG9wM0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFRvcDNEaXJlY3RpdmUuJGluamVjdCA9IFsndG9wM1NlcnZpY2UnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsVG9wM0RpcmVjdGl2ZSh0b3AzU2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsVG9wM0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3RvcDMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdG9wMy50ZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQubXVzdEhhdmU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0VHlwZSA9ICRhdHRycy5haHRsVG9wM3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1nU3JjID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL2ltYWdlcy8nICsgdGhpcy5yZXNvcnRUeXBlICsgJy8nICsgdGhpcy5yZXNvcnRbaW5kZXhdLmltZy5maWxlbmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc1Jlc29ydEluY2x1ZGVEZXRhaWwgPSBmdW5jdGlvbihpdGVtLCBkZXRhaWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZXRhaWxDbGFzc05hbWUgPSAndG9wM19fZGV0YWlsLWNvbnRhaW5lci0tJyArIGRldGFpbCxcclxuICAgICAgICAgICAgICAgICAgICBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUgPSAhaXRlbS5kZXRhaWxzW2RldGFpbF0gPyAnIHRvcDNfX2RldGFpbC1jb250YWluZXItLWhhc250JyA6ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXRhaWxDbGFzc05hbWUgKyBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRvcDNTZXJ2aWNlLmdldFRvcDNQbGFjZXModGhpcy5yZXNvcnRUeXBlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucmVzb3J0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgndG9wM1NlcnZpY2UnLCB0b3AzU2VydmljZSk7XHJcblxyXG4gICAgdG9wM1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiB0b3AzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRUb3AzUGxhY2VzOiBnZXRUb3AzUGxhY2VzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VG9wM1BsYWNlcyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC50b3AzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmFuaW1hdGlvbignLnNsaWRlcl9faW1nJywgYW5pbWF0aW9uRnVuY3Rpb24pO1xyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7IC8vMjAwPyAkKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMCcpO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCdsZWZ0JywgJzAnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFNsaWRlcicsIGFodGxTbGlkZXIpO1xyXG5cclxuXHRhaHRsU2xpZGVyLiRpbmplY3QgPSBbJ3NsaWRlclNlcnZpY2UnLCAnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFNsaWRlcihzbGlkZXJTZXJ2aWNlLCAkdGltZW91dCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0Y29udHJvbGxlcjogYWh0bFNsaWRlckNvbnRyb2xsZXIsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmh0bWwnLFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGFodGxTbGlkZXJDb250cm9sbGVyKCRzY29wZSkge1xyXG5cdFx0XHQkc2NvcGUuc2xpZGVyID0gc2xpZGVyU2VydmljZTtcclxuXHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHRcdFx0JHNjb3BlLm5leHRTbGlkZSA9IG5leHRTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnByZXZTbGlkZSA9IHByZXZTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnNldFNsaWRlID0gc2V0U2xpZGU7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBuZXh0U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAnbGVmdCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXROZXh0U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcHJldlNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldFByZXZTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzZXRTbGlkZShpbmRleCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gaW5kZXggPiAkc2NvcGUuc2xpZGVyLmdldEN1cnJlbnRTbGlkZSh0cnVlKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRDdXJyZW50U2xpZGUoaW5kZXgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZml4SUU4cG5nQmxhY2tCZyhlbGVtZW50KSB7XHJcblx0XHRcdCQoZWxlbWVudClcclxuXHRcdFx0XHQuY3NzKCctbXMtZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCdmaWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ3pvb20nLCAnMScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0pIHtcclxuXHRcdFx0bGV0IGFycm93cyA9ICQoZWxlbSkuZmluZCgnLnNsaWRlcl9fYXJyb3cnKTtcclxuXHJcblx0XHRcdGFycm93cy5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMC41Jyk7XHJcblx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZyh0aGlzKTtcclxuXHJcblx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdCR0aW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzEnKTtcclxuXHRcdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcoJCh0aGlzKSk7XHJcblx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdzbGlkZXJTZXJ2aWNlJyxzbGlkZXJTZXJ2aWNlKTtcclxuXHJcblx0c2xpZGVyU2VydmljZS4kaW5qZWN0ID0gWydzbGlkZXJJbWdQYXRoQ29uc3RhbnQnXTtcclxuXHJcblx0ZnVuY3Rpb24gc2xpZGVyU2VydmljZShzbGlkZXJJbWdQYXRoQ29uc3RhbnQpIHtcclxuXHRcdGZ1bmN0aW9uIFNsaWRlcihzbGlkZXJJbWFnZUxpc3QpIHtcclxuXHRcdFx0dGhpcy5faW1hZ2VTcmNMaXN0ID0gc2xpZGVySW1hZ2VMaXN0O1xyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0SW1hZ2VTcmNMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW1hZ2VTcmNMaXN0O1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChnZXRJbmRleCkge1xyXG5cdFx0XHRyZXR1cm4gZ2V0SW5kZXggPT0gdHJ1ZSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA6IHRoaXMuX2ltYWdlU3JjTGlzdFt0aGlzLl9jdXJyZW50U2xpZGVdO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xyXG5cdFx0XHRzbGlkZSA9IHBhcnNlSW50KHNsaWRlKTtcclxuXHJcblx0XHRcdGlmIChpc05hTihzbGlkZSkgfHwgc2xpZGUgPCAwIHx8IHNsaWRlID4gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IHNsaWRlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldE5leHRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpID8gdGhpcy5fY3VycmVudFNsaWRlID0gMCA6IHRoaXMuX2N1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRQcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IDApID8gdGhpcy5fY3VycmVudFNsaWRlID0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEgOiB0aGlzLl9jdXJyZW50U2xpZGUtLTtcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBuZXcgU2xpZGVyKHNsaWRlckltZ1BhdGhDb25zdGFudCk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3NsaWRlckltZ1BhdGhDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjEuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjIuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjMuanBnJ1xyXG4gICAgICAgIF0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1BhZ2VzJywgUGFnZXMpO1xyXG5cclxuICAgIFBhZ2VzLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFBhZ2VzKCRzY29wZSkge1xyXG4gICAgICAgIGNvbnN0IGhvdGVsc1BlclBhZ2UgPSA1O1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93RnJvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudFBhZ2UgLSAxKSAqIGhvdGVsc1BlclBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKyt0aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd1ByZXYgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0tdGhpcy5jdXJyZW50UGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldFBhZ2UgPSBmdW5jdGlvbihwYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlICsgMTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzTGFzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFnZXNUb3RhbC5sZW5ndGggPT09IHRoaXMuY3VycmVudFBhZ2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzRmlyc3RQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlID09PSAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgKGV2ZW50LCBzaG93SG90ZWxDb3VudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBuZXcgQXJyYXkoTWF0aC5jZWlsKHNob3dIb3RlbENvdW50IC8gaG90ZWxzUGVyUGFnZSkpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3Nob3dGcm9tJywgc2hvd0Zyb20pO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dGcm9tKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgc3RhcnRQb3NpdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoIW1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5zbGljZShzdGFydFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsUHJpY2VTbGlkZXInLCBwcmljZVNsaWRlckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgcHJpY2VTbGlkZXJEaXJlY3RpdmUuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIG1pbjogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBtYXg6IFwiQFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdFNsaWRlcjogJz0nLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRTbGlkZXI6ICc9J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IHByaWNlU2xpZGVyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlTGluaygkc2NvcGUsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5sZWZ0U2xpZGVyKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnJpZ2h0U2xpZGVyKTtcclxuICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyLm1heCA9IDE1OyovXHJcbiAgICAgICAgICAgIGxldCByaWdodEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKSxcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKSxcclxuICAgICAgICAgICAgICAgIHNsaWRlQXJlYVdpZHRoID0gcGFyc2VJbnQoJCgnLnNsaWRlJykuY3NzKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlUGVyU3RlcCA9ICRzY29wZS5tYXggLyAoc2xpZGVBcmVhV2lkdGggLSAyMCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubWluID0gcGFyc2VJbnQoJHNjb3BlLm1pbik7XHJcbiAgICAgICAgICAgICRzY29wZS5tYXggPSBwYXJzZUludCgkc2NvcGUubWF4KTtcclxuXHJcbiAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICByaWdodEJ0bixcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHNsaWRlQXJlYVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCxcclxuICAgICAgICAgICAgICAgICgpID0+IDApO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdERyYWcoZHJhZ0VsZW0sIGluaXRQb3NpdGlvbiwgbWF4UG9zaXRpb24sIG1pblBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2hpZnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNlZG93bicsIGJ0bk9uTW91c2VEb3duKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlRG93bihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0ID0gZXZlbnQucGFnZVg7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFBvc2l0aW9uID0gcGFyc2VJbnQoZHJhZ0VsZW0uY3NzKCdsZWZ0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZG9jT25Nb3VzZU1vdmUoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb25MZXNzVGhhbk1heCA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPD0gbWF4UG9zaXRpb24oKSAtIDIwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkdyYXRlclRoYW5NaW4gPSBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0ID49IG1pblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbkxlc3NUaGFuTWF4ICYmIHBvc2l0aW9uR3JhdGVyVGhhbk1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcmFnRWxlbS5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0Jywgc2xpZGVBcmVhV2lkdGggLSBpbml0UG9zaXRpb24gLSBldmVudC5wYWdlWCArIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VVcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldFByaWNlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVtaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignZHJhZ3N0YXJ0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UHJpY2VzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdNaW4gPSB+fihwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld01heCA9IH5+KHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbChuZXdNaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbChuZXdNYXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdEJ0bi5jc3MoJ2xlZnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0QnRuLmNzcygnbGVmdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFNsaWRlcnMoYnRuLCBuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQb3N0aW9uID0gbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmNzcygnbGVmdCcsIG5ld1Bvc3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnRuLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIG5ld1Bvc3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcCA+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAtIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKGxlZnRCdG4sIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlID4gJHNjb3BlLm1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VmFsdWUsJHNjb3BlLm1heCApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwIDwgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhO2wnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2xpZGVycyhyaWdodEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZW1pdCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGVmdFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5yaWdodFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyokc2NvcGUuJGJyb2FkY2FzdCgncHJpY2VTbGlkZXJQb3NpdGlvbkNoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heDogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKClcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxMyk7Ki9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL3RvZG8gaWU4IGJ1ZyBmaXhcclxuICAgICAgICAgICAgICAgIGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ2llOCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyokc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKS5jc3MoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuZmluZCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coK3NsaWRlQXJlYVdpZHRoIC0gK25ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCArc2xpZGVBcmVhV2lkdGggLSBwYXJzZUludChuZXdWYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxTbGlkZU9uQ2xpY2snLCBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgbGluazogYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgbGV0IHNsaWRlRW1pdEVsZW1lbnRzID0gJChlbGVtKS5maW5kKCdbc2xpZGUtZW1pdF0nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNsaWRlLWVtaXQgbm90IGZvdW5kYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzbGlkZUVtaXRFbGVtZW50cy5vbignY2xpY2snLCBzbGlkZUVtaXRPbkNsaWNrKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNsaWRlRW1pdE9uQ2xpY2soKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2xpZGVPbkVsZW1lbnQgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbl0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXNsaWRlRW1pdEVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnJyAmJiBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2FybihgV3JvbmcgaW5pdCB2YWx1ZSBmb3IgJ3NsaWRlLW9uJyBhdHRyaWJ1dGUsIHNob3VsZCBiZSAnJyBvciAnY2xvc2VkJy5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlVXAoJ3Nsb3cnLCBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJ2Nsb3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5zbGlkZURvd24oJ3Nsb3cnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicsICcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNsaWRlVG9nZ2xlRWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbi10b2dnbGVdJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChzbGlkZVRvZ2dsZUVsZW1lbnRzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygkKHRoaXMpLmF0dHIoJ3NsaWRlLW9uLXRvZ2dsZScpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuIl19
