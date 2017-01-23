'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp', ['ui.router' /*, 'preload'*/, 'ngAnimate', '720kb.socialshare']);
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
/*
(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .config(config);

    config.$inject = ['preloadServiceProvider', 'backendPathsConstant'];

    function config(preloadServiceProvider, backendPathsConstant) {
            preloadServiceProvider.config(backendPathsConstant.gallery, 'GET', 'get', 100, 'warning');
    }
})();*/
"use strict";
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
			templateUrl: 'app/partials/resort/resort.html',
			data: {
				currentFilters: {}
			}
		}).state('booking', {
			url: '/booking?hotelId',
			templateUrl: 'app/partials/booking/booking.html',
			params: { 'hotelId': 'hotel Id' }
		}).state('search', {
			url: '/search?query',
			templateUrl: 'app/partials/search/search.html',
			params: { 'query': 'search query' }
		});
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').run(run);

    run.$inject = ['$rootScope', 'backendPathsConstant', /*'preloadService',*/'$window'];

    function run($rootScope, backendPathsConstant, /*preloadService,*/$window) {
        $rootScope.$logged = false;

        $rootScope.$state = {
            currentStateName: null,
            currentStateParams: null,
            stateHistory: []
        };

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState /*, fromParams todo*/) {
            $rootScope.$state.currentStateName = toState.name;
            $rootScope.$state.currentStateParams = toParams;
            $rootScope.$state.stateHistory.push(toState.name);
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState /*, fromParams todo*/) {
            //$timeout(() => $('body').scrollTop(0), 0);
        });

        /*$window.onload = function() { //todo onload �������� � ������
            preloadService.preloadImages('gallery', {url: backendPathsConstant.gallery, method: 'GET', action: 'get'}); //todo del method, action by default
        };*/

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

    angular.module('ahotelApp').factory('resortService', resortService);

    resortService.$inject = ['$http', 'backendPathsConstant', '$q'];

    function resortService($http, backendPathsConstant, $q) {
        var model = null;

        function getResort(filter) {
            //todo errors: no hotels, no filter...
            if (model) {
                return $q.when(applyFilter(model));
            }

            return $http({
                method: 'GET',
                url: backendPathsConstant.hotels
            }).then(onResolve, onRejected);

            function onResolve(response) {
                model = response.data;
                return applyFilter(model);
            }

            function onRejected(response) {
                model = response;
                return applyFilter(model);
            }

            function applyFilter() {
                if (!filter) {
                    return model;
                }

                return model.filter(function (hotel) {
                    return hotel[filter.prop] == filter.value;
                });
            }
        }

        return {
            getResort: getResort
        };
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

    BookingController.$inject = ['$stateParams', 'resortService', '$state', '$rootScope'];

    function BookingController($stateParams, resortService, $state, $rootScope) {
        var _this = this;

        this.hotel = null;
        this.loaded = false;

        console.log($state);

        resortService.getResort({
            prop: '_id',
            value: $stateParams.hotelId }).then(function (response) {
            _this.hotel = response[0];
            _this.loaded = true;
        });

        //this.hotel = $stateParams.hotel;

        this.getHotelImagesCount = function (count) {
            return new Array(count - 1);
        };

        this.openImage = function ($event) {
            var imgSrc = $event.target.src;

            if (imgSrc) {
                $rootScope.$broadcast('modalOpen', {
                    show: 'image',
                    src: imgSrc
                });
            }
        };
    }
})();
'use strict';

(function () {
    angular.module('ahotelApp').controller('BookingFormController', BookingFormController);

    function BookingFormController() {
        'use strict';

        this.form = {
            date: 'pick date',
            guests: 1
        };

        this.addGuest = function () {
            this.form.guests !== 5 ? this.form.guests++ : this.form.guests;
        };

        this.removeGuest = function () {
            this.form.guests !== 1 ? this.form.guests-- : this.form.guests;
        };

        this.submit = function () {};
    }
})();
'use strict';

(function () {
    'use strict';

    datePickerDirective.$inject = ["$interval"];
    angular.module('ahotelApp').directive('datePicker', datePickerDirective);

    function datePickerDirective($interval) {
        return {
            require: 'ngModel',
            /*scope: {
                ngModel: '='
            },*/
            link: datePickerDirectiveLink
        };

        function datePickerDirectiveLink(scope, element, attrs, ctrl) {
            //todo all
            $('[date-picker]').dateRangePicker({
                language: 'en',
                startDate: new Date(),
                endDate: new Date().setFullYear(new Date().getFullYear() + 1)
            }).bind('datepicker-first-date-selected', function (event, obj) {
                /* This event will be triggered when first date is selected */
                console.log('first-date-selected', obj);
                // obj will be something like this:
                // {
                // 		date1: (Date object of the earlier date)
                // }
            }).bind('datepicker-change', function (event, obj) {
                /* This event will be triggered when second date is selected */
                console.log('change', obj);
                ctrl.$setViewValue(obj.value);
                ctrl.$render();
                scope.$apply();
                // obj will be something like this:
                // {
                // 		date1: (Date object of the earlier date),
                // 		date2: (Date object of the later date),
                //	 	value: "2013-06-05 to 2013-06-07"
                // }
            }).bind('datepicker-apply', function (event, obj) {
                /* This event will be triggered when user clicks on the apply button */
                console.log('apply', obj);
            }).bind('datepicker-close', function () {
                /* This event will be triggered before date range picker close animation */
                console.log('before close');
            }).bind('datepicker-closed', function () {
                /* This event will be triggered after date range picker close animation */
                console.log('after close');
            }).bind('datepicker-open', function () {
                /* This event will be triggered before date range picker open animation */
                console.log('before open');
            }).bind('datepicker-opened', function () {
                /* This event will be triggered after date range picker open animation */
                console.log('after open');
            });
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').directive('ahtlMap', ahtlMapDirective);

    ahtlMapDirective.$inject = ['resortService'];

    function ahtlMapDirective(resortService) {
        return {
            restrict: 'E',
            template: '<div class="destinations__map"></div>',
            link: ahtlMapDirectiveLink
        };

        function ahtlMapDirectiveLink($scope, elem, attr) {
            var hotels = null;

            resortService.getResort().then(function (response) {
                hotels = response;
                createMap();
            });

            function createMap() {
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
                    var locations = [];

                    for (var i = 0; i < hotels.length; i++) {
                        locations.push([hotels[i].name, hotels[i]._gmaps.lat, hotels[i]._gmaps.lng]);
                    }

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

                    for (var _i = 0; _i < locations.length; _i++) {
                        var marker = new google.maps.Marker({
                            title: locations[_i][0],
                            position: new google.maps.LatLng(locations[_i][1], locations[_i][2]),
                            map: map,
                            icon: icons["ahotel"].icon
                        });

                        marker.addListener('click', function () {
                            map.setZoom(8);
                            map.setCenter(this.getPosition());
                        });
                    }

                    /*centering*/
                    var bounds = new google.maps.LatLngBounds();
                    for (var _i2 = 0; _i2 < locations.length; _i2++) {
                        var LatLang = new google.maps.LatLng(locations[_i2][1], locations[_i2][2]);
                        bounds.extend(LatLang);
                    }
                    map.fitBounds(bounds);
                };
            }
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').directive('ahtlGallery', ahtlGalleryDirective);

    ahtlGalleryDirective.$inject = ['$timeout'];

    function ahtlGalleryDirective($timeout) {
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'app/partials/gallery/gallery.align.html',
            /*controller: ahtlGalleryController,
            controllerAs: 'gallery',*/
            link: ahtlGalleryDirectiveLink
        };

        /*function ahtlGalleryController($scope) {
            this.imgs = new Array(20);
            this.imgsLoaded = [];
              this.openImage = function(imageName) {
                let imageSrc = 'assets/images/gallery/' + imageName + '.jpg';
                  $scope.$root.$broadcast('modalOpen', {
                    show: 'image',
                    src: imageSrc
                });
            };
              $timeout(() => $scope.$root.$broadcast('ahtlGallery:loaded'));
        }*/

        function ahtlGalleryDirectiveLink($scope, elem, a, ctrl) {
            /*console.log($(elem).find('img'));
              $scope.$on('ahtlGallery:loaded', alignImages);*/
            var imagesInGallery = 20;

            for (var i = 0; i < 20; i++) {
                var img = $('<div class="item"><img src="assets/images/gallery/preview' + (i + 1) + '.jpg" width="300"></div>');
                img.find('img').on('load', imageLoaded);
                $('[gallery-container]').append(img);
            }

            var imagesLoaded = 0;
            function imageLoaded() {
                imagesLoaded++;
                console.log(imagesLoaded);

                if (imagesLoaded === imagesInGallery) {
                    console.log('align');
                    alignImages();
                }
            }

            function alignImages() {

                var container = document.querySelector('.container');

                var masonry = new Masonry(container, {
                    columnWidth: '.item',
                    itemSelector: '.item',
                    gutter: '.gutter-sizer',
                    transitionDuration: '0.2s',
                    initLayout: true
                });

                /*masonry.on('layoutComplete', onLayoutComplete);
                  masonry.layout();
                  function onLayoutComplete() {
                    $timeout(() => $(container).css('opacity', '1'), 0);
                }*/
            }
        }
    }
})();

/*
(function() {
    'use strict';

    angular
        .module('ahotelApp')
            .directive('ahtlGallery', ahtlGalleryDirective);

        ahtlGalleryDirective.$inject = ['$http', '$timeout', 'backendPathsConstant', 'preloadService'];

        function ahtlGalleryDirective($http, $timeout, backendPathsConstant, preloadService) { //todo not only load but listSrc too accept
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
            let allImagesSrc = [],
                showFirstImgCount = $scope.showFirstImgCount,
                showNextImgCount = $scope.showNextImgCount;

            this.loadMore = function() {
                showFirstImgCount = Math.min(showFirstImgCount + showNextImgCount, allImagesSrc.length);
                this.showFirst = allImagesSrc.slice(0, showFirstImgCount);
                this.isAllImagesLoaded = this.showFirst >= allImagesSrc.length;

                /!*$timeout(_setImageAligment, 0);*!/
            };

            this.allImagesLoaded = function() {
                return (this.showFirst) ? this.showFirst.length === this.imagesCount: true
            };

            this.alignImages = () => {
                if ($('.gallery img').length < showFirstImgCount) {
                    console.log('oops');
                    $timeout(this.alignImages, 0)
                } else {
                    $timeout(_setImageAligment);
                    $(window).on('resize', _setImageAligment);
                }
            };

            this.alignImages();

            _getImageSources((response) => {
                allImagesSrc = response;
                this.showFirst = allImagesSrc.slice(0, showFirstImgCount);
                this.imagesCount = allImagesSrc.length;
                //$timeout(_setImageAligment);
            })
        }

        function ahtlGalleryLink($scope, elem) {
            elem.on('click', (event) => {
                let imgSrc = event.target.src;

                if (imgSrc) {
                    $scope.$apply(function() {
                        $scope.$root.$broadcast('modalOpen', {
                            show: 'image',
                            src: imgSrc
                        });
                    })
                }
            });

           /!* var $images = $('.gallery img');
            var loaded_images_count = 0;*!/
            /!*$scope.alignImages = function() {
                $images.load(function() {
                    loaded_images_count++;

                    if (loaded_images_count == $images.length) {
                        _setImageAligment();
                    }
                });
                //$timeout(_setImageAligment, 0); // todo
            };*!/

            //$scope.alignImages();
        }

        function _getImageSources(cb) {
            cb(preloadService.getPreloadCache('gallery'));
        }

        function _setImageAligment() { //todo arguments naming, errors
                const figures = $('.gallery__figure');

                const galleryWidth = parseInt(figures.closest('.gallery').css('width')),
                    imageWidth = parseInt(figures.css('width'));

                let columnsCount = Math.round(galleryWidth / imageWidth),
                    columnsHeight = new Array(columnsCount + 1).join('0').split('').map(() => {return 0}), //todo del join-split
                    currentColumnsHeight = columnsHeight.slice(0),
                    columnPointer = 0;

                $(figures).css('margin-top', '0');

                $.each(figures, function(index) {
                    currentColumnsHeight[columnPointer] = parseInt($(this).css('height'));

                    if (index > columnsCount - 1) {
                        $(this).css('margin-top', -(Math.max.apply(null, columnsHeight) - columnsHeight[columnPointer]) + 'px');
                    }

                    //currentColumnsHeight[columnPointer] = parseInt($(this).css('height')) + columnsHeight[columnPointer];

                    if (columnPointer === columnsCount - 1) {
                        columnPointer = 0;
                        for (let i = 0; i < columnsHeight.length; i++) {
                            columnsHeight[i] += currentColumnsHeight[i];
                        }
                    } else {
                        columnPointer++;
                    }
                });
        }
    }
})();
/!*        .controller('GalleryController', GalleryController);

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
})();*!/

/!*
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
})();*!/
*/

/*2
(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlGallery', ahtlGalleryDirective);

    ahtlGalleryDirective.$inject = ['$timeout'];

    function ahtlGalleryDirective($timeout) {
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'app/partials/gallery/gallery.align.html',
            controller: ahtlGalleryController,
            controllerAs: 'gallery',
            link: ahtlGalleryDirectiveLink
        };

        function ahtlGalleryController($scope) {
            this.imgs = new Array(20);
            this.imgsLoaded = [];

            this.openImage = function(imageName) {
                let imageSrc = 'assets/images/gallery/' + imageName + '.jpg';

                $scope.$root.$broadcast('modalOpen', {
                    show: 'image',
                    src: imageSrc
                });
            };

            $timeout(() => $scope.$root.$broadcast('ahtlGallery:loaded'));
        }

        function ahtlGalleryDirectiveLink($scope, elem, a, ctrl) {
            console.log($(elem).find('img'));

            $scope.$on('ahtlGallery:loaded', alignImages);

            function alignImages(){
                $timeout(() => {
                    let container = document.querySelector('.container');

                    let masonry = new Masonry(container, {
                        columnWidth: '.item',
                        itemSelector: '.item',
                        gutter: '.gutter-sizer',
                        transitionDuration: '0.2s',
                        initLayout: false
                    });

                    masonry.on('layoutComplete', onLayoutComplete);

                    masonry.layout();

                    function onLayoutComplete() {
                        $timeout(() => $(container).css('opacity', '1'), 0);
                    }
                })
            }
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

    HomeController.$inject = ['resortService'];

    function HomeController(resortService) {
        var _this = this;

        resortService.getResort({ prop: '_trend', value: true }).then(function (response) {
            //todo if not response
            _this.hotels = response;
        });
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
            $scope.show = {};

            $scope.$on('modalOpen', function (event, data) {
                if (data.show === 'image') {
                    $scope.src = data.src;
                    $scope.show.img = true;
                    //$scope.$apply();//todo apply?
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
                        title: data.name,
                        map: map,
                        zoom: 4,
                        center: myLatlng
                    });

                    var marker = new google.maps.Marker({
                        position: myLatlng,
                        map: map,
                        title: data.name
                    });

                    marker.addListener('click', function () {
                        map.setZoom(10);
                        map.setCenter(this.getPosition());
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

    ResortController.$inject = ['resortService', '$filter', '$scope', '$state'];

    function ResortController(resortService, $filter, $scope, $state) {
        var _this = this;

        var currentFilters = $state.$current.data.currentFilters; // temp

        this.filters = $filter('hotelFilter').initFilters();

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

            this.hotels = $filter('hotelFilter').applyFilters(hotels, currentFilters);
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

                _this.hotels = $filter('hotelFilter').applyFilters(hotels, currentFilters);
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
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').filter('hotelFilter', hotelFilter);

    hotelFilter.$inject = ['$log', 'hotelDetailsConstant'];

    function hotelFilter($log, hotelDetailsConstant) {
        var savedFilters = {};

        return {
            loadFilters: loadFilters,
            applyFilters: applyFilters,
            initFilters: initFilters
        };

        function loadFilters() {}

        function initFilters() {
            console.log(savedFilters);
            var filters = {};

            for (var key in hotelDetailsConstant) {
                filters[key] = {};
                for (var i = 0; i < hotelDetailsConstant[key].length; i++) {
                    filters[key][hotelDetailsConstant[key][i]] = savedFilters[key] && savedFilters[key].indexOf(hotelDetailsConstant[key][i]) !== -1 ? true : false;
                    //filters[key][hotelDetailsConstant[key][i]] = savedFilters[key][hotelDetailsConstant[key][i]] || false;
                }
            }

            filters.price = {
                min: 0,
                max: 1000
            };

            return filters;
        }

        function applyFilters(hotels, filters) {
            savedFilters = filters;

            angular.forEach(hotels, function (hotel) {
                hotel._hide = false;
                isHotelMatchingFilters(hotel, filters);
            });

            function isHotelMatchingFilters(hotel, filters) {

                angular.forEach(filters, function (filtersInGroup, filterGroup) {
                    var matchAtLeaseOneFilter = false,
                        reverseFilterMatching = false; // for activities and musthaves groups

                    if (filterGroup === 'guests') {
                        filtersInGroup = [filtersInGroup[filtersInGroup.length - 1]];
                    }

                    if (filterGroup === 'mustHaves' || filterGroup === 'activities') {
                        matchAtLeaseOneFilter = true;
                        reverseFilterMatching = true;
                    }

                    for (var i = 0; i < filtersInGroup.length; i++) {
                        if (!reverseFilterMatching && getHotelProp(hotel, filterGroup, filtersInGroup[i])) {
                            matchAtLeaseOneFilter = true;
                            break;
                        }

                        if (reverseFilterMatching && !getHotelProp(hotel, filterGroup, filtersInGroup[i])) {
                            matchAtLeaseOneFilter = false;
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
        }
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

    angular.module('ahotelApp').controller('SearchController', SearchController);

    SearchController.$inject = ['$state', 'resortService'];

    function SearchController($state, resortService) {
        var _this = this;

        this.query = $state.params.query;
        console.log(this.query);
        this.hotels = null;

        resortService.getResort().then(function (response) {
            _this.hotels = response;
            search.call(_this);
        });

        function search() {
            var parsedQuery = $.trim(this.query).replace(/\s+/g, ' ').split(' ');
            var result = [];

            angular.forEach(this.hotels, function (hotel) {
                //console.log(hotel);
                var hotelContent = hotel.name + hotel.location.country + hotel.location.region + hotel.desc + hotel.descLocation;
                //console.log(hotelContent)
                //for ()
                var matchesCounter = 0;
                for (var i = 0; i < parsedQuery.length; i++) {
                    var qRegExp = new RegExp(parsedQuery[i], 'gi');
                    matchesCounter += (hotelContent.match(qRegExp) || []).length;
                }

                if (matchesCounter > 0) {
                    result[hotel._id] = {};
                    result[hotel._id].matchesCounter = matchesCounter;
                }
            });

            this.searchResults = this.hotels.filter(function (hotel) {
                return result[hotel._id];
            }).map(function (hotel) {
                hotel._matches = result[hotel._id].matchesCounter;
                return hotel;
            });

            console.log(this.searchResults);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsImdsb2JhbHMvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy9hdXRoL2F1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvYm9va2luZy9ib29raW5nLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuZm9ybS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYm9va2luZy9kYXRlUGlja2VyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvbW9kYWwvbW9kYWwuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5hY3Rpdml0aWVzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaG90ZWwuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5zY3JvbGx0b1RvcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuYW5pbWF0aW9uLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyUGF0aC5jb25zdGFudC5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvc2xpZGVPbkNsaWNrL3NsaWRlT25DbGljay5kaXJlY3RpdmUuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRwcm92aWRlIiwiZGVjb3JhdG9yIiwiJGRlbGVnYXRlIiwiJHdpbmRvdyIsImxvZ0hpc3RvcnkiLCJ3YXJuIiwiZXJyIiwibG9nIiwibWVzc2FnZSIsIl9sb2dXYXJuIiwicHVzaCIsImFwcGx5IiwiX2xvZ0VyciIsImVycm9yIiwibmFtZSIsInN0YWNrIiwiRXJyb3IiLCJzZW5kT25VbmxvYWQiLCJvbmJlZm9yZXVubG9hZCIsImxlbmd0aCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIiRpbmplY3QiLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJkYXRhIiwiY3VycmVudEZpbHRlcnMiLCJydW4iLCIkcm9vdFNjb3BlIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiZnJvbVN0YXRlIiwicHJvdmlkZXIiLCJwcmVsb2FkU2VydmljZSIsIm1ldGhvZCIsImFjdGlvbiIsInRpbWVvdXQiLCIkZ2V0IiwiJGh0dHAiLCIkdGltZW91dCIsInByZWxvYWRDYWNoZSIsImxvZ2dlciIsImNvbnNvbGUiLCJkZWJ1ZyIsInByZWxvYWRJbWFnZXMiLCJwcmVsb2FkTmFtZSIsImltYWdlcyIsImltYWdlc1NyY0xpc3QiLCJzcmMiLCJwcmVsb2FkIiwidGhlbiIsInJlc3BvbnNlIiwiYmluZCIsImkiLCJpbWFnZSIsIkltYWdlIiwib25sb2FkIiwiZSIsIm9uZXJyb3IiLCJnZXRQcmVsb2FkIiwiZ2V0UHJlbG9hZENhY2hlIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImdhbGxlcnkiLCJndWVzdGNvbW1lbnRzIiwiaG90ZWxzIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJHEiLCJtb2RlbCIsImdldFJlc29ydCIsImZpbHRlciIsIndoZW4iLCJhcHBseUZpbHRlciIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJob3RlbCIsInByb3AiLCJ2YWx1ZSIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsInNpZ25JbiIsInVzZXIiLCJwcmV2aW91c1N0YXRlIiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsIl9jcmVkZW50aWFscyIsIl9vblJlc29sdmUiLCJzdGF0dXMiLCJ0b2tlbiIsIl90b2tlbktlZXBlciIsInNhdmVUb2tlbiIsIl9vblJlamVjdGVkIiwiX3Rva2VuIiwiZ2V0VG9rZW4iLCJkZWxldGVUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwic2lnbk91dCIsImdldExvZ0luZm8iLCJCb29raW5nQ29udHJvbGxlciIsIiRzdGF0ZVBhcmFtcyIsImxvYWRlZCIsImhvdGVsSWQiLCJnZXRIb3RlbEltYWdlc0NvdW50IiwiY291bnQiLCJBcnJheSIsIm9wZW5JbWFnZSIsIiRldmVudCIsImltZ1NyYyIsInRhcmdldCIsIiRicm9hZGNhc3QiLCJzaG93IiwiQm9va2luZ0Zvcm1Db250cm9sbGVyIiwiZm9ybSIsImRhdGUiLCJhZGRHdWVzdCIsInJlbW92ZUd1ZXN0Iiwic3VibWl0IiwiZGlyZWN0aXZlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZSIsIiRpbnRlcnZhbCIsInJlcXVpcmUiLCJsaW5rIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCIkIiwiZGF0ZVJhbmdlUGlja2VyIiwibGFuZ3VhZ2UiLCJzdGFydERhdGUiLCJEYXRlIiwiZW5kRGF0ZSIsInNldEZ1bGxZZWFyIiwiZ2V0RnVsbFllYXIiLCJvYmoiLCIkc2V0Vmlld1ZhbHVlIiwiJHJlbmRlciIsIiRhcHBseSIsImFodGxNYXBEaXJlY3RpdmUiLCJyZXN0cmljdCIsInRlbXBsYXRlIiwiYWh0bE1hcERpcmVjdGl2ZUxpbmsiLCJlbGVtIiwiYXR0ciIsImNyZWF0ZU1hcCIsIndpbmRvdyIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJfZ21hcHMiLCJsYXQiLCJsbmciLCJteUxhdExuZyIsIm1hcCIsIm1hcHMiLCJNYXAiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwic2Nyb2xsd2hlZWwiLCJpY29ucyIsImFob3RlbCIsImljb24iLCJtYXJrZXIiLCJNYXJrZXIiLCJ0aXRsZSIsInBvc2l0aW9uIiwiTGF0TG5nIiwiYWRkTGlzdGVuZXIiLCJzZXRab29tIiwic2V0Q2VudGVyIiwiZ2V0UG9zaXRpb24iLCJib3VuZHMiLCJMYXRMbmdCb3VuZHMiLCJMYXRMYW5nIiwiZXh0ZW5kIiwiZml0Qm91bmRzIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmUiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmsiLCJhIiwiaW1hZ2VzSW5HYWxsZXJ5IiwiaW1nIiwiZmluZCIsIm9uIiwiaW1hZ2VMb2FkZWQiLCJhcHBlbmQiLCJpbWFnZXNMb2FkZWQiLCJhbGlnbkltYWdlcyIsImNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJtYXNvbnJ5IiwiTWFzb25yeSIsImNvbHVtbldpZHRoIiwiaXRlbVNlbGVjdG9yIiwiZ3V0dGVyIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiaW5pdExheW91dCIsIkd1ZXN0Y29tbWVudHNDb250cm9sbGVyIiwiZ3Vlc3Rjb21tZW50c1NlcnZpY2UiLCJjb21tZW50cyIsIm9wZW5Gb3JtIiwic2hvd1BsZWFzZUxvZ2lNZXNzYWdlIiwid3JpdGVDb21tZW50IiwiZ2V0R3Vlc3RDb21tZW50cyIsImFkZENvbW1lbnQiLCJzZW5kQ29tbWVudCIsImZvcm1EYXRhIiwiY29tbWVudCIsInJldmVyc2UiLCJpdGVtcyIsInNsaWNlIiwidHlwZSIsIm9uUmVqZWN0IiwiSGVhZGVyQ29udHJvbGxlciIsImFodGxIZWFkZXIiLCJzZXJ2aWNlIiwiSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlIiwiJGxvZyIsIlVJdHJhbnNpdGlvbnMiLCJfY29udGFpbmVyIiwiYW5pbWF0ZVRyYW5zaXRpb24iLCJ0YXJnZXRFbGVtZW50c1F1ZXJ5IiwiY3NzRW51bWVyYWJsZVJ1bGUiLCJmcm9tIiwidG8iLCJkZWxheSIsIm1vdXNlZW50ZXIiLCJ0YXJnZXRFbGVtZW50cyIsInRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGUiLCJjc3MiLCJhbmltYXRlT3B0aW9ucyIsImFuaW1hdGUiLCJyZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2siLCJlbGVtZW50VHJpZ2dlclF1ZXJ5IiwiZWxlbWVudE9uUXVlcnkiLCJIZWFkZXJUcmFuc2l0aW9ucyIsImhlYWRlclF1ZXJ5IiwiY29udGFpbmVyUXVlcnkiLCJjYWxsIiwiX2hlYWRlciIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiZml4SGVhZGVyRWxlbWVudCIsImVsZW1lbnRGaXhRdWVyeSIsImZpeENsYXNzTmFtZSIsInVuZml4Q2xhc3NOYW1lIiwib3B0aW9ucyIsInNlbGYiLCJmaXhFbGVtZW50Iiwib25XaWR0aENoYW5nZUhhbmRsZXIiLCJ0aW1lciIsImZpeFVuZml4TWVudU9uU2Nyb2xsIiwic2Nyb2xsVG9wIiwib25NaW5TY3JvbGx0b3AiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwid2lkdGgiLCJpbm5lcldpZHRoIiwib25NYXhXaW5kb3dXaWR0aCIsIm9mZiIsInNjcm9sbCIsImFodGxTdGlreUhlYWRlciIsImhlYWRlciIsIkhvbWVDb250cm9sbGVyIiwiYWh0bE1vZGFsRGlyZWN0aXZlIiwicmVwbGFjZSIsImFodGxNb2RhbERpcmVjdGl2ZUxpbmsiLCJ1bmRlZmluZWQiLCJteUxhdGxuZyIsImNvb3JkIiwiem9vbSIsImNlbnRlciIsImNsb3NlRGlhbG9nIiwibW9kYWxNYXAiLCJhY3Rpdml0aWVzRmlsdGVyIiwiZmlsdGVyc1NlcnZpY2UiLCJhcmciLCJfc3RyaW5nTGVuZ3RoIiwic3RyaW5nTGVuZ3RoIiwicGFyc2VJbnQiLCJpc05hTiIsInJlc3VsdCIsImpvaW4iLCJsYXN0SW5kZXhPZiIsIlJlc29ydENvbnRyb2xsZXIiLCIkZmlsdGVyIiwiJGN1cnJlbnQiLCJmaWx0ZXJzIiwiaW5pdEZpbHRlcnMiLCJvbkZpbHRlckNoYW5nZSIsImZpbHRlckdyb3VwIiwic3BsaWNlIiwiaW5kZXhPZiIsImFwcGx5RmlsdGVycyIsImdldFNob3dIb3RlbENvdW50IiwicmVkdWNlIiwiY291bnRlciIsIml0ZW0iLCJfaGlkZSIsIiR3YXRjaCIsIm5ld1ZhbHVlIiwib3Blbk1hcCIsImhvdGVsTmFtZSIsImhvdGVsQ29vcmQiLCIkcm9vdCIsImhvdGVsRmlsdGVyIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCJzYXZlZEZpbHRlcnMiLCJsb2FkRmlsdGVycyIsImtleSIsIm1pbiIsIm1heCIsImZvckVhY2giLCJpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzIiwiZmlsdGVyc0luR3JvdXAiLCJtYXRjaEF0TGVhc2VPbmVGaWx0ZXIiLCJyZXZlcnNlRmlsdGVyTWF0Y2hpbmciLCJnZXRIb3RlbFByb3AiLCJsb2NhdGlvbiIsImNvdW50cnkiLCJlbnZpcm9ubWVudCIsImRldGFpbHMiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZSIsInNjcm9sbFRvVG9wRGlyZWN0aXZlTGluayIsInNlbGVjdG9yIiwiaGVpZ2h0IiwidHJpbSIsInNjcm9sbFRvVG9wQ29uZmlnIiwic2Nyb2xsVG9Ub3AiLCJTZWFyY2hDb250cm9sbGVyIiwicXVlcnkiLCJzZWFyY2giLCJwYXJzZWRRdWVyeSIsInNwbGl0IiwiaG90ZWxDb250ZW50IiwicmVnaW9uIiwiZGVzYyIsImRlc2NMb2NhdGlvbiIsIm1hdGNoZXNDb3VudGVyIiwicVJlZ0V4cCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2lkIiwic2VhcmNoUmVzdWx0cyIsIl9tYXRjaGVzIiwiYWh0bFRvcDNEaXJlY3RpdmUiLCJ0b3AzU2VydmljZSIsIkFodGxUb3AzQ29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsIiRlbGVtZW50IiwiJGF0dHJzIiwibXVzdEhhdmUiLCJyZXNvcnRUeXBlIiwiYWh0bFRvcDN0eXBlIiwicmVzb3J0IiwiZ2V0SW1nU3JjIiwiaW5kZXgiLCJmaWxlbmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbCIsImRldGFpbCIsImRldGFpbENsYXNzTmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSIsImdldFRvcDNQbGFjZXMiLCJhbmltYXRpb24iLCJhbmltYXRpb25GdW5jdGlvbiIsImJlZm9yZUFkZENsYXNzIiwiY2xhc3NOYW1lIiwiZG9uZSIsInNsaWRpbmdEaXJlY3Rpb24iLCJhaHRsU2xpZGVyIiwic2xpZGVyU2VydmljZSIsImFodGxTbGlkZXJDb250cm9sbGVyIiwic2xpZGVyIiwibmV4dFNsaWRlIiwicHJldlNsaWRlIiwic2V0U2xpZGUiLCJzZXROZXh0U2xpZGUiLCJzZXRQcmV2U2xpZGUiLCJnZXRDdXJyZW50U2xpZGUiLCJzZXRDdXJyZW50U2xpZGUiLCJmaXhJRThwbmdCbGFja0JnIiwiYXJyb3dzIiwiY2xpY2siLCJkaXNhYmxlZCIsInNsaWRlckltZ1BhdGhDb25zdGFudCIsIlNsaWRlciIsInNsaWRlckltYWdlTGlzdCIsIl9pbWFnZVNyY0xpc3QiLCJfY3VycmVudFNsaWRlIiwiZ2V0SW1hZ2VTcmNMaXN0IiwiZ2V0SW5kZXgiLCJzbGlkZSIsIlBhZ2VzIiwiaG90ZWxzUGVyUGFnZSIsImN1cnJlbnRQYWdlIiwicGFnZXNUb3RhbCIsInNob3dGcm9tIiwic2hvd05leHQiLCJzaG93UHJldiIsInNldFBhZ2UiLCJwYWdlIiwiaXNMYXN0UGFnZSIsImlzRmlyc3RQYWdlIiwic2hvd0hvdGVsQ291bnQiLCJNYXRoIiwiY2VpbCIsInN0YXJ0UG9zaXRpb24iLCJwcmljZVNsaWRlckRpcmVjdGl2ZSIsImxlZnRTbGlkZXIiLCJyaWdodFNsaWRlciIsInByaWNlU2xpZGVyRGlyZWN0aXZlTGluayIsInJpZ2h0QnRuIiwibGVmdEJ0biIsInNsaWRlQXJlYVdpZHRoIiwidmFsdWVQZXJTdGVwIiwidmFsIiwiaW5pdERyYWciLCJkcmFnRWxlbSIsImluaXRQb3NpdGlvbiIsIm1heFBvc2l0aW9uIiwibWluUG9zaXRpb24iLCJzaGlmdCIsImJ0bk9uTW91c2VEb3duIiwicGFnZVgiLCJkb2NPbk1vdXNlTW92ZSIsImJ0bk9uTW91c2VVcCIsInBvc2l0aW9uTGVzc1RoYW5NYXgiLCJwb3NpdGlvbkdyYXRlclRoYW5NaW4iLCJzZXRQcmljZXMiLCJlbWl0IiwibmV3TWluIiwibmV3TWF4Iiwic2V0U2xpZGVycyIsImJ0biIsIm5ld1Bvc3Rpb24iLCJoYXNDbGFzcyIsInRyaWdnZXIiLCJhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmsiLCJzbGlkZUVtaXRFbGVtZW50cyIsInNsaWRlRW1pdE9uQ2xpY2siLCJzbGlkZU9uRWxlbWVudCIsInNsaWRlVXAiLCJvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUiLCJzbGlkZURvd24iLCJzbGlkZVRvZ2dsZUVsZW1lbnRzIiwiZWFjaCIsInRvZ2dsZUNsYXNzIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUEsUUFDS0MsT0FBTyxhQUFhLENBQUMsNkJBQTRCLGFBQWE7S0FKdkU7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUQsUUFDS0MsT0FBTyxhQUNQQyxvQkFBTyxVQUFVQyxVQUFVO1FBQ3hCQSxTQUFTQyxVQUFVLGlDQUFRLFVBQVVDLFdBQVdDLFNBQVM7WUFDckQsSUFBSUMsYUFBYTtnQkFDVEMsTUFBTTtnQkFDTkMsS0FBSzs7O1lBR2JKLFVBQVVLLE1BQU0sVUFBVUMsU0FBUzs7WUFHbkMsSUFBSUMsV0FBV1AsVUFBVUc7WUFDekJILFVBQVVHLE9BQU8s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QVUsb0JBQW9Cb1U7O0lBRW5DQSwwQkFBMEJwYyxVQUFVLENBQUM7O0lBRXJDLFNBQVNvYywwQkFBMEI3TixNQUFNO1FBQ3JDLE9BQU87WUFDSGhGLFVBQVU7WUFDVm5CLE1BQU1pVTs7O1FBR1YsU0FBU0EsOEJBQThCclgsUUFBUTBFLE1BQU07WUFDakQsSUFBSTRTLG9CQUFvQjVULEVBQUVnQixNQUFNMEMsS0FBSzs7WUFFckMsSUFBSSxDQUFDa1Esa0JBQWtCOWMsUUFBUTtnQkFDM0IrTyxLQUFLN1AsS0FBTDs7Z0JBRUE7OztZQUdKNGQsa0JBQWtCalEsR0FBRyxTQUFTa1E7O1lBRTlCLFNBQVNBLG1CQUFtQjtnQkFDeEIsSUFBSUMsaUJBQWlCOVQsRUFBRWdCLE1BQU0wQyxLQUFLOztnQkFFbEMsSUFBSSxDQUFDa1Esa0JBQWtCOWMsUUFBUTtvQkFDM0IrTyxLQUFLN1AsS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJOGQsZUFBZTdTLEtBQUssZ0JBQWdCLE1BQU02UyxlQUFlN1MsS0FBSyxnQkFBZ0IsVUFBVTtvQkFDeEY0RSxLQUFLN1AsS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJOGQsZUFBZTdTLEtBQUssZ0JBQWdCLElBQUk7b0JBQ3hDNlMsZUFBZUMsUUFBUSxRQUFRQztvQkFDL0JGLGVBQWU3UyxLQUFLLFlBQVk7dUJBQzdCO29CQUNIK1M7b0JBQ0FGLGVBQWVHLFVBQVU7b0JBQ3pCSCxlQUFlN1MsS0FBSyxZQUFZOzs7Z0JBR3BDLFNBQVMrUywyQkFBMkI7b0JBQ2hDLElBQUlFLHNCQUFzQmxVLEVBQUVnQixNQUFNMEMsS0FBSzs7b0JBRXZDMUQsRUFBRW1VLEtBQUtELHFCQUFxQixZQUFXO3dCQUNuQ2xVLEVBQUUsTUFBTW9VLFlBQVlwVSxFQUFFLE1BQU1pQixLQUFLOzs7Ozs7S0F0RHpEIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJywgWyd1aS5yb3V0ZXInLyosICdwcmVsb2FkJyovLCAnbmdBbmltYXRlJywgJzcyMGtiLnNvY2lhbHNoYXJlJ10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uZmlnKGZ1bmN0aW9uICgkcHJvdmlkZSkge1xyXG4gICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJyRsb2cnLCBmdW5jdGlvbiAoJGRlbGVnYXRlLCAkd2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9nSGlzdG9yeSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2FybjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycjogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5sb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ1dhcm4gPSAkZGVsZWdhdGUud2FybjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS53YXJuID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nV2Fybi5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ0VyciA9ICRkZWxlZ2F0ZS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5lcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7bmFtZTogbWVzc2FnZSwgc3RhY2s6IG5ldyBFcnJvcigpLnN0YWNrfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ0Vyci5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gc2VuZE9uVW5sb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbG9nSGlzdG9yeS5lcnIubGVuZ3RoICYmICFsb2dIaXN0b3J5Lndhcm4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbigncG9zdCcsICcvYXBpL2xvZycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGxvZ0hpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGRlbGVnYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxufSkoKTtcclxuXHJcbi8qXHJcbiAgICAgICAgLmZhY3RvcnkoJ2xvZycsIGxvZyk7XHJcblxyXG4gICAgbG9nLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxvZygkd2luZG93LCAkbG9nKSB7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2goYXJncyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYnJvd3NlckxvZykge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBlcnJvcihlKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgc3RhY2s6IGUuc3RhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRsb2cuZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RvZG8gYWxsIGVycm9yc1xyXG5cclxuXHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHdhcm46IHdhcm4sXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICAgICAgc2VuZE9uVW5sb2FkOiBzZW5kT25VbmxvYWRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiLypcclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoY29uZmlnKTtcclxuXHJcbiAgICBjb25maWcuJGluamVjdCA9IFsncHJlbG9hZFNlcnZpY2VQcm92aWRlcicsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbmZpZyhwcmVsb2FkU2VydmljZVByb3ZpZGVyLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICBwcmVsb2FkU2VydmljZVByb3ZpZGVyLmNvbmZpZyhiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCAnR0VUJywgJ2dldCcsIDEwMCwgJ3dhcm5pbmcnKTtcclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5jb25maWcoY29uZmlnKTtcclxuXHJcblx0Y29uZmlnLiRpbmplY3QgPSBbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlciddO1xyXG5cclxuXHRmdW5jdGlvbiBjb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG5cdFx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG5cclxuXHRcdCRzdGF0ZVByb3ZpZGVyXHJcblx0XHRcdC5zdGF0ZSgnaG9tZScsIHtcclxuXHRcdFx0XHR1cmw6ICcvJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ob21lL2hvbWUuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdhdXRoJywge1xyXG5cdFx0XHRcdHVybDogJy9hdXRoJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9hdXRoL2F1dGguaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3R5cGUnOiAnbG9naW4gb3Igam9pbid9LyosXHJcblx0XHRcdFx0b25FbnRlcjogZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcclxuXHRcdFx0XHRcdCRyb290U2NvcGUuJHN0YXRlID0gXCJhdXRoXCI7XHJcblx0XHRcdFx0fSovXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYnVuZ2Fsb3dzJywge1xyXG5cdFx0XHRcdHVybDogJy9idW5nYWxvd3MnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9idW5nYWxvd3MuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdob3RlbHMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvdG9wJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9ob3RlbHMuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3ZpbGxhcycsIHtcclxuXHRcdFx0XHR1cmw6ICcvdmlsbGFzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdmlsbGFzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ2FsbGVyeScsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ2FsbGVyeScsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5Lmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ3Vlc3Rjb21tZW50cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ3Vlc3Rjb21tZW50cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZGVzdGluYXRpb25zJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL2Rlc3RpbmF0aW9ucycsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9kZXN0aW5hdGlvbnMvZGVzdGluYXRpb25zLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgncmVzb3J0Jywge1xyXG5cdFx0XHRcdHVybDogJy9yZXNvcnQnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaHRtbCcsXHJcblx0XHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdFx0Y3VycmVudEZpbHRlcnM6IHt9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Jvb2tpbmcnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2Jvb2tpbmc/aG90ZWxJZCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvYm9va2luZy9ib29raW5nLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydob3RlbElkJzogJ2hvdGVsIElkJ31cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdzZWFyY2gnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3NlYXJjaD9xdWVyeScsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvc2VhcmNoL3NlYXJjaC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsncXVlcnknOiAnc2VhcmNoIHF1ZXJ5J31cclxuXHRcdFx0fSlcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5ydW4ocnVuKTtcclxuXHJcbiAgICBydW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScgLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAvKidwcmVsb2FkU2VydmljZScsKi8gJyR3aW5kb3cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIC8qcHJlbG9hZFNlcnZpY2UsKi8gJHdpbmRvdykge1xyXG4gICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUvKiwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVOYW1lID0gdG9TdGF0ZS5uYW1lO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZS8qLCBmcm9tUGFyYW1zIHRvZG8qLykge1xyXG4gICAgICAgICAgICAvLyR0aW1lb3V0KCgpID0+ICQoJ2JvZHknKS5zY3JvbGxUb3AoMCksIDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKiR3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7IC8vdG9kbyBvbmxvYWQg77+977+977+977+977+977+977+977+9IO+/vSDvv73vv73vv73vv73vv73vv71cclxuICAgICAgICAgICAgcHJlbG9hZFNlcnZpY2UucHJlbG9hZEltYWdlcygnZ2FsbGVyeScsIHt1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksIG1ldGhvZDogJ0dFVCcsIGFjdGlvbjogJ2dldCd9KTsgLy90b2RvIGRlbCBtZXRob2QsIGFjdGlvbiBieSBkZWZhdWx0XHJcbiAgICAgICAgfTsqL1xyXG5cclxuICAgICAgICAvL2xvZy5zZW5kT25VbmxvYWQoKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3ByZWxvYWQnLCBbXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwcmVsb2FkJylcclxuICAgICAgICAucHJvdmlkZXIoJ3ByZWxvYWRTZXJ2aWNlJywgcHJlbG9hZFNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHByZWxvYWRTZXJ2aWNlKCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGZ1bmN0aW9uKHVybCA9ICcvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZCA9ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0ID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICBsb2c6IGxvZ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuJGdldCA9IGZ1bmN0aW9uICgkaHR0cCwgJHRpbWVvdXQpIHtcclxuICAgICAgICAgICAgbGV0IHByZWxvYWRDYWNoZSA9IFtdLFxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyID0gZnVuY3Rpb24obWVzc2FnZSwgbG9nID0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnc2lsZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmxvZyA9PT0gJ2RlYnVnJyAmJiBsb2cgPT09ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2cgPT09ICd3YXJuaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWRJbWFnZXMocHJlbG9hZE5hbWUsIGltYWdlcykgeyAvL3RvZG8gZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VzU3JjTGlzdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW1hZ2VzID09PSAnYXJyYXknKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzU3JjTGlzdCA9IGltYWdlcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZENhY2hlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVsb2FkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5tZXRob2QgfHwgY29uZmlnLm1ldGhvZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBpbWFnZXMudXJsIHx8IGNvbmZpZy51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzOiBpbWFnZXMuYWN0aW9uIHx8IGNvbmZpZy5hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzU3JjTGlzdCA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZENhY2hlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VzU3JjTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy50aW1lb3V0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93Lm9ubG9hZCA9IHByZWxvYWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQocHJlbG9hZC5iaW5kKG51bGwsIGltYWdlc1NyY0xpc3QpLCBjb25maWcudGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvL3RvZG9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkKGltYWdlc1NyY0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlc1NyY0xpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IGltYWdlc1NyY0xpc3RbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc29sdmUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyKHRoaXMuc3JjLCAnZGVidWcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UHJlbG9hZChwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdwcmVsb2FkU2VydmljZTogZ2V0IHJlcXVlc3QgJyArICdcIicgKyBwcmVsb2FkTmFtZSArICdcIicsICdkZWJ1ZycpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVsb2FkQ2FjaGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVsb2FkQ2FjaGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJlbG9hZENhY2hlW2ldLm5hbWUgPT09IHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVsb2FkQ2FjaGVbaV0uc3JjXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxvZ2dlcignTm8gcHJlbG9hZHMgZm91bmQnLCAnd2FybmluZycpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcHJlbG9hZEltYWdlczogcHJlbG9hZEltYWdlcyxcclxuICAgICAgICAgICAgICAgIGdldFByZWxvYWRDYWNoZTogZ2V0UHJlbG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdiYWNrZW5kUGF0aHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdG9wMzogJy9hcGkvdG9wMycsXHJcbiAgICAgICAgICAgIGF1dGg6ICcvYXBpL3VzZXJzJyxcclxuICAgICAgICAgICAgZ2FsbGVyeTogJy9hcGkvZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHM6ICcvYXBpL2d1ZXN0Y29tbWVudHMnLFxyXG4gICAgICAgICAgICBob3RlbHM6ICcvYXBpL2hvdGVscydcclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdob3RlbERldGFpbHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdHlwZXM6IFtcclxuICAgICAgICAgICAgICAgICdIb3RlbCcsXHJcbiAgICAgICAgICAgICAgICAnQnVuZ2Fsb3cnLFxyXG4gICAgICAgICAgICAgICAgJ1ZpbGxhJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3M6IFtcclxuICAgICAgICAgICAgICAgICdDb2FzdCcsXHJcbiAgICAgICAgICAgICAgICAnQ2l0eScsXHJcbiAgICAgICAgICAgICAgICAnRGVzZXJ0J1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgbG9jYXRpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnTmFtaWJpYScsXHJcbiAgICAgICAgICAgICAgICAnTGlieWEnLFxyXG4gICAgICAgICAgICAgICAgJ1NvdXRoIEFmcmljYScsXHJcbiAgICAgICAgICAgICAgICAnVGFuemFuaWEnLFxyXG4gICAgICAgICAgICAgICAgJ1BhcHVhIE5ldyBHdWluZWEnLFxyXG4gICAgICAgICAgICAgICAgJ1JldW5pb24nLFxyXG4gICAgICAgICAgICAgICAgJ1N3YXppbGFuZCcsXHJcbiAgICAgICAgICAgICAgICAnU2FvIFRvbWUnLFxyXG4gICAgICAgICAgICAgICAgJ01hZGFnYXNjYXInLFxyXG4gICAgICAgICAgICAgICAgJ01hdXJpdGl1cycsXHJcbiAgICAgICAgICAgICAgICAnU2V5Y2hlbGxlcycsXHJcbiAgICAgICAgICAgICAgICAnTWF5b3R0ZScsXHJcbiAgICAgICAgICAgICAgICAnVWtyYWluZSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGd1ZXN0czogW1xyXG4gICAgICAgICAgICAgICAgJzEnLFxyXG4gICAgICAgICAgICAgICAgJzInLFxyXG4gICAgICAgICAgICAgICAgJzMnLFxyXG4gICAgICAgICAgICAgICAgJzQnLFxyXG4gICAgICAgICAgICAgICAgJzUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBtdXN0SGF2ZXM6IFtcclxuICAgICAgICAgICAgICAgICdyZXN0YXVyYW50JyxcclxuICAgICAgICAgICAgICAgICdraWRzJyxcclxuICAgICAgICAgICAgICAgICdwb29sJyxcclxuICAgICAgICAgICAgICAgICdzcGEnLFxyXG4gICAgICAgICAgICAgICAgJ3dpZmknLFxyXG4gICAgICAgICAgICAgICAgJ3BldCcsXHJcbiAgICAgICAgICAgICAgICAnZGlzYWJsZScsXHJcbiAgICAgICAgICAgICAgICAnYmVhY2gnLFxyXG4gICAgICAgICAgICAgICAgJ3BhcmtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2NvbmRpdGlvbmluZycsXHJcbiAgICAgICAgICAgICAgICAnbG91bmdlJyxcclxuICAgICAgICAgICAgICAgICd0ZXJyYWNlJyxcclxuICAgICAgICAgICAgICAgICdnYXJkZW4nLFxyXG4gICAgICAgICAgICAgICAgJ2d5bScsXHJcbiAgICAgICAgICAgICAgICAnYmljeWNsZXMnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBhY3Rpdml0aWVzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29va2luZyBjbGFzc2VzJyxcclxuICAgICAgICAgICAgICAgICdDeWNsaW5nJyxcclxuICAgICAgICAgICAgICAgICdGaXNoaW5nJyxcclxuICAgICAgICAgICAgICAgICdHb2xmJyxcclxuICAgICAgICAgICAgICAgICdIaWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0hvcnNlLXJpZGluZycsXHJcbiAgICAgICAgICAgICAgICAnS2F5YWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ05pZ2h0bGlmZScsXHJcbiAgICAgICAgICAgICAgICAnU2FpbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2N1YmEgZGl2aW5nJyxcclxuICAgICAgICAgICAgICAgICdTaG9wcGluZyAvIG1hcmtldHMnLFxyXG4gICAgICAgICAgICAgICAgJ1Nub3JrZWxsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTa2lpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1N1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbGRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdXaW5kc3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2luZSB0YXN0aW5nJyxcclxuICAgICAgICAgICAgICAgICdZb2dhJyBcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHByaWNlOiBbXHJcbiAgICAgICAgICAgICAgICBcIm1pblwiLFxyXG4gICAgICAgICAgICAgICAgXCJtYXhcIlxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdyZXNvcnRTZXJ2aWNlJywgcmVzb3J0U2VydmljZSk7XHJcblxyXG4gICAgcmVzb3J0U2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICckcSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlc29ydFNlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCAkcSkge1xyXG4gICAgICAgIGxldCBtb2RlbCA9IG51bGw7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlc29ydChmaWx0ZXIpIHtcclxuICAgICAgICAgICAgLy90b2RvIGVycm9yczogbm8gaG90ZWxzLCBubyBmaWx0ZXIuLi5cclxuICAgICAgICAgICAgaWYgKG1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihhcHBseUZpbHRlcihtb2RlbCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihvblJlc29sdmUsIG9uUmVqZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwbHlGaWx0ZXIobW9kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwbHlGaWx0ZXIobW9kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVyKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWxcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwuZmlsdGVyKChob3RlbCkgPT4gaG90ZWxbZmlsdGVyLnByb3BdID09IGZpbHRlci52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFJlc29ydDogZ2V0UmVzb3J0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRyb290U2NvcGUsICRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3Q6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduSW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRyb290U2NvcGUsICRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWxldGVUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlVG9rZW46IHNhdmVUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnZXRUb2tlbjogZ2V0VG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlVG9rZW46IGRlbGV0ZVRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuZGVsZXRlVG9rZW4oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5nZXRMb2dJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogdGhpcy5fY3JlZGVudGlhbHMsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5fdG9rZW5LZWVwZXIuZ2V0VG9rZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0NvbnRyb2xsZXInLCBCb29raW5nQ29udHJvbGxlcik7XHJcblxyXG4gICAgQm9va2luZ0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlUGFyYW1zJywgJ3Jlc29ydFNlcnZpY2UnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCb29raW5nQ29udHJvbGxlcigkc3RhdGVQYXJhbXMsIHJlc29ydFNlcnZpY2UsICRzdGF0ZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHRoaXMuaG90ZWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KHtcclxuICAgICAgICAgICAgICAgIHByb3A6ICdfaWQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICRzdGF0ZVBhcmFtcy5ob3RlbElkfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdGVsID0gcmVzcG9uc2VbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL3RoaXMuaG90ZWwgPSAkc3RhdGVQYXJhbXMuaG90ZWw7XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0SG90ZWxJbWFnZXNDb3VudCA9IGZ1bmN0aW9uKGNvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQXJyYXkoY291bnQgLSAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub3BlbkltYWdlID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBpbWdTcmMgPSAkZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0Zvcm1Db250cm9sbGVyJywgQm9va2luZ0Zvcm1Db250cm9sbGVyKVxyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdGb3JtQ29udHJvbGxlcigpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIHRoaXMuZm9ybSA9IHtcclxuICAgICAgICAgICAgZGF0ZTogJ3BpY2sgZGF0ZScsXHJcbiAgICAgICAgICAgIGd1ZXN0czogMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR3Vlc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5ndWVzdHMgIT09IDUgPyB0aGlzLmZvcm0uZ3Vlc3RzKysgOiB0aGlzLmZvcm0uZ3Vlc3RzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gMSA/IHRoaXMuZm9ybS5ndWVzdHMtLSA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2RhdGVQaWNrZXInLCBkYXRlUGlja2VyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlKCRpbnRlcnZhbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcclxuICAgICAgICAgICAgLypzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbDogJz0nXHJcbiAgICAgICAgICAgIH0sKi9cclxuICAgICAgICAgICAgbGluazogZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlTGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgLy90b2RvIGFsbFxyXG4gICAgICAgICAgICAkKCdbZGF0ZS1waWNrZXJdJykuZGF0ZVJhbmdlUGlja2VyKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlOiBuZXcgRGF0ZSgpLnNldEZ1bGxZZWFyKG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSArIDEpLFxyXG4gICAgICAgICAgICAgICAgfSkuYmluZCgnZGF0ZXBpY2tlci1maXJzdC1kYXRlLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZlbnQsIG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gZmlyc3QgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmaXJzdC1kYXRlLXNlbGVjdGVkJyxvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9iaiB3aWxsIGJlIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMTogKERhdGUgb2JqZWN0IG9mIHRoZSBlYXJsaWVyIGRhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNoYW5nZScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBzZWNvbmQgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2UnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kc2V0Vmlld1ZhbHVlKG9iai52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUyOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGxhdGVyIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vXHQgXHR2YWx1ZTogXCIyMDEzLTA2LTA1IHRvIDIwMTMtMDYtMDdcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1hcHBseScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB1c2VyIGNsaWNrcyBvbiB0aGUgYXBwbHkgYnV0dG9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcGx5JyxvYmopO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlZCcsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYWZ0ZXIgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbicsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYmVmb3JlIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbmVkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBvcGVuIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1hcCcsIGFodGxNYXBEaXJlY3RpdmUpO1xuXG4gICAgYWh0bE1hcERpcmVjdGl2ZS4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJ107XG5cbiAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlKHJlc29ydFNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJkZXN0aW5hdGlvbnNfX21hcFwiPjwvZGl2PicsXG4gICAgICAgICAgICBsaW5rOiBhaHRsTWFwRGlyZWN0aXZlTGlua1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICAgICAgbGV0IGhvdGVscyA9IG51bGw7XG5cbiAgICAgICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBob3RlbHMgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICBjcmVhdGVNYXAoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2F0aW9ucyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMucHVzaChbaG90ZWxzW2ldLm5hbWUsIGhvdGVsc1tpXS5fZ21hcHMubGF0LCBob3RlbHNbaV0uX2dtYXBzLmxuZ10pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG15TGF0TG5nID0ge2xhdDogLTI1LjM2MywgbG5nOiAxMzEuMDQ0fTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2JqZWN0IGFuZCBzcGVjaWZ5IHRoZSBET00gZWxlbWVudCBmb3IgZGlzcGxheS5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZGVzdGluYXRpb25zX19tYXAnKVswXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBsb2NhdGlvbnNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcih0aGlzLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKmNlbnRlcmluZyovXG4gICAgICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHt9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuYWxpZ24uaHRtbCcsXHJcbiAgICAgICAgICAgIC8qY29udHJvbGxlcjogYWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JywqL1xyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKmZ1bmN0aW9uIGFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbWdzID0gbmV3IEFycmF5KDIwKTtcclxuICAgICAgICAgICAgdGhpcy5pbWdzTG9hZGVkID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9wZW5JbWFnZSA9IGZ1bmN0aW9uKGltYWdlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvZ2FsbGVyeS8nICsgaW1hZ2VOYW1lICsgJy5qcGcnO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlU3JjXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdhaHRsR2FsbGVyeTpsb2FkZWQnKSk7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGEsIGN0cmwpIHtcclxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygkKGVsZW0pLmZpbmQoJ2ltZycpKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ2FodGxHYWxsZXJ5OmxvYWRlZCcsIGFsaWduSW1hZ2VzKTsqL1xyXG4gICAgICAgICAgICBsZXQgaW1hZ2VzSW5HYWxsZXJ5ID0gMjA7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDIwOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWcgPSAkKCc8ZGl2IGNsYXNzPVwiaXRlbVwiPjxpbWcgc3JjPVwiYXNzZXRzL2ltYWdlcy9nYWxsZXJ5L3ByZXZpZXcnICsgKGkgKyAxKSArICcuanBnXCIgd2lkdGg9XCIzMDBcIj48L2Rpdj4nKVxyXG4gICAgICAgICAgICAgICAgaW1nLmZpbmQoJ2ltZycpLm9uKCdsb2FkJywgaW1hZ2VMb2FkZWQpO1xyXG4gICAgICAgICAgICAgICAgJCgnW2dhbGxlcnktY29udGFpbmVyXScpLmFwcGVuZChpbWcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2VzTG9hZGVkID0gMDtcclxuICAgICAgICAgICAgZnVuY3Rpb24gaW1hZ2VMb2FkZWQoKSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZXNMb2FkZWQrKztcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGltYWdlc0xvYWRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGltYWdlc0xvYWRlZCA9PT0gaW1hZ2VzSW5HYWxsZXJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FsaWduJyk7XHJcbiAgICAgICAgICAgICAgICAgICBhbGlnbkltYWdlcygpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsaWduSW1hZ2VzKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXNvbnJ5ID0gbmV3IE1hc29ucnkoY29udGFpbmVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbldpZHRoOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtU2VsZWN0b3I6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGd1dHRlcjogJy5ndXR0ZXItc2l6ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246ICcwLjJzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdExheW91dDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKm1hc29ucnkub24oJ2xheW91dENvbXBsZXRlJywgb25MYXlvdXRDb21wbGV0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hc29ucnkubGF5b3V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTGF5b3V0Q29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQoY29udGFpbmVyKS5jc3MoJ29wYWNpdHknLCAnMScpLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4vKlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgICAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICckdGltZW91dCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdwcmVsb2FkU2VydmljZSddO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkaHR0cCwgJHRpbWVvdXQsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCBwcmVsb2FkU2VydmljZSkgeyAvL3RvZG8gbm90IG9ubHkgbG9hZCBidXQgbGlzdFNyYyB0b28gYWNjZXB0XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93Rmlyc3QnLFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dOZXh0J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkudGVtcGxhdGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5TGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgbGV0IGFsbEltYWdlc1NyYyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSAkc2NvcGUuc2hvd0ZpcnN0SW1nQ291bnQsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50ID0gJHNjb3BlLnNob3dOZXh0SW1nQ291bnQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9IE1hdGgubWluKHNob3dGaXJzdEltZ0NvdW50ICsgc2hvd05leHRJbWdDb3VudCwgYWxsSW1hZ2VzU3JjLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dGaXJzdCA9IGFsbEltYWdlc1NyYy5zbGljZSgwLCBzaG93Rmlyc3RJbWdDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQWxsSW1hZ2VzTG9hZGVkID0gdGhpcy5zaG93Rmlyc3QgPj0gYWxsSW1hZ2VzU3JjLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvISokdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7KiEvXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsbEltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob3dGaXJzdCkgPyB0aGlzLnNob3dGaXJzdC5sZW5ndGggPT09IHRoaXMuaW1hZ2VzQ291bnQ6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmdhbGxlcnkgaW1nJykubGVuZ3RoIDwgc2hvd0ZpcnN0SW1nQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb29wcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHRoaXMuYWxpZ25JbWFnZXMsIDApXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMoKTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzQ291bnQgPSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGVsZW0ub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nU3JjID0gZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgLyEqIHZhciAkaW1hZ2VzID0gJCgnLmdhbGxlcnkgaW1nJyk7XHJcbiAgICAgICAgICAgIHZhciBsb2FkZWRfaW1hZ2VzX2NvdW50ID0gMDsqIS9cclxuICAgICAgICAgICAgLyEqJHNjb3BlLmFsaWduSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkX2ltYWdlc19jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkX2ltYWdlc19jb3VudCA9PSAkaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0SW1hZ2VBbGlnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7IC8vIHRvZG9cclxuICAgICAgICAgICAgfTsqIS9cclxuXHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmFsaWduSW1hZ2VzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKGNiKSB7XHJcbiAgICAgICAgICAgIGNiKHByZWxvYWRTZXJ2aWNlLmdldFByZWxvYWRDYWNoZSgnZ2FsbGVyeScpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9zZXRJbWFnZUFsaWdtZW50KCkgeyAvL3RvZG8gYXJndW1lbnRzIG5hbWluZywgZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWd1cmVzID0gJCgnLmdhbGxlcnlfX2ZpZ3VyZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdhbGxlcnlXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY2xvc2VzdCgnLmdhbGxlcnknKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlV2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNzcygnd2lkdGgnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbHVtbnNDb3VudCA9IE1hdGgucm91bmQoZ2FsbGVyeVdpZHRoIC8gaW1hZ2VXaWR0aCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodCA9IG5ldyBBcnJheShjb2x1bW5zQ291bnQgKyAxKS5qb2luKCcwJykuc3BsaXQoJycpLm1hcCgoKSA9PiB7cmV0dXJuIDB9KSwgLy90b2RvIGRlbCBqb2luLXNwbGl0XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHQgPSBjb2x1bW5zSGVpZ2h0LnNsaWNlKDApLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICQoZmlndXJlcykuY3NzKCdtYXJnaW4tdG9wJywgJzAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZmlndXJlcywgZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ21hcmdpbi10b3AnLCAtKE1hdGgubWF4LmFwcGx5KG51bGwsIGNvbHVtbnNIZWlnaHQpIC0gY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSkgKyAncHgnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpICsgY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbHVtblBvaW50ZXIgPT09IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uc0hlaWdodC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodFtpXSArPSBjdXJyZW50Q29sdW1uc0hlaWdodFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcbi8hKiAgICAgICAgLmNvbnRyb2xsZXIoJ0dhbGxlcnlDb250cm9sbGVyJywgR2FsbGVyeUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEdhbGxlcnlDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgIHZhciBpbWFnZXNTcmMgPSBfZ2V0SW1hZ2VTb3VyY2VzKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coaW1hZ2VzU3JjKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LFxyXG4gICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnRVJST1InOyAvL3RvZG9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7KiEvXHJcblxyXG4vISpcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0OiBcIj1haHRsR2FsbGVyeVNob3dGaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgc2hvd0FmdGVyOiBcIj1haHRsR2FsbGVyeVNob3dBZnRlclwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oKXt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYSA9IDEzO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuYSk7XHJcbiAgICAgICAgICAgIC8hKnZhciBhbGxJbWFnZXNTcmM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd0ZpcnN0SW1hZ2VzU3JjID0gWycxMjMnXTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy90b2RvXHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgfSkqIS9cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxufSkoKTsqIS9cclxuKi9cclxuXHJcblxyXG5cclxuLyoyXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7fSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmFsaWduLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBhaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW1ncyA9IG5ldyBBcnJheSgyMCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nc0xvYWRlZCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vcGVuSW1hZ2UgPSBmdW5jdGlvbihpbWFnZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2dhbGxlcnkvJyArIGltYWdlTmFtZSArICcuanBnJztcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZVNyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnYWh0bEdhbGxlcnk6bG9hZGVkJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYSwgY3RybCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkKGVsZW0pLmZpbmQoJ2ltZycpKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ2FodGxHYWxsZXJ5OmxvYWRlZCcsIGFsaWduSW1hZ2VzKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsaWduSW1hZ2VzKCl7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hc29ucnkgPSBuZXcgTWFzb25yeShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uV2lkdGg6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3V0dGVyOiAnLmd1dHRlci1zaXplcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogJzAuMnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TGF5b3V0OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXNvbnJ5Lm9uKCdsYXlvdXRDb21wbGV0ZScsIG9uTGF5b3V0Q29tcGxldGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXNvbnJ5LmxheW91dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkxheW91dENvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkKGNvbnRhaW5lcikuY3NzKCdvcGFjaXR5JywgJzEnKSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0d1ZXN0Y29tbWVudHNDb250cm9sbGVyJywgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcigkcm9vdFNjb3BlLCBndWVzdGNvbW1lbnRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMud3JpdGVDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiRsb2dnZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5nZXRHdWVzdENvbW1lbnRzKCkudGhlbihcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5zZW5kQ29tbWVudCh0aGlzLmZvcm1EYXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cy5wdXNoKHsnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZSwgJ2NvbW1lbnQnOiB0aGlzLmZvcm1EYXRhLmNvbW1lbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGF0YSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3JldmVyc2UnLCByZXZlcnNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXZlcnNlKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgICAgICAgICAvL3RvIGVycm9yc1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbXMuc2xpY2UoKS5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnLCBndWVzdGNvbW1lbnRzU2VydmljZSk7XHJcblxyXG4gICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBndWVzdGNvbW1lbnRzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0R3Vlc3RDb21tZW50czogZ2V0R3Vlc3RDb21tZW50cyxcclxuICAgICAgICAgICAgc2VuZENvbW1lbnQ6IHNlbmRDb21tZW50XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0R3Vlc3RDb21tZW50cyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb21tZW50KGNvbW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXIgPSBhdXRoU2VydmljZS5nZXRMb2dJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IHVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgSGVhZGVyQ29udHJvbGxlcik7XHJcblxyXG4gICAgSGVhZGVyQ29udHJvbGxlci4kaW5qZWN0ID0gWydhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnNpZ25PdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25PdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxIZWFkZXInLCBhaHRsSGVhZGVyKTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bEhlYWRlcigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUFDJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5zZXJ2aWNlKCdIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpO1xyXG5cclxuXHRIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvZyddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJHRpbWVvdXQsICRsb2cpIHtcclxuXHRcdGZ1bmN0aW9uIFVJdHJhbnNpdGlvbnMoY29udGFpbmVyKSB7XHJcblx0XHRcdGlmICghJChjb250YWluZXIpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudCAnJHtjb250YWluZXJ9JyBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9jb250YWluZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5hbmltYXRlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50c1F1ZXJ5LFxyXG5cdFx0XHR7Y3NzRW51bWVyYWJsZVJ1bGUgPSAnd2lkdGgnLCBmcm9tID0gMCwgdG8gPSAnYXV0bycsIGRlbGF5ID0gMTAwfSkge1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2NvbnRhaW5lciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGxldCB0YXJnZXRFbGVtZW50cyA9ICQodGhpcykuZmluZCh0YXJnZXRFbGVtZW50c1F1ZXJ5KSxcclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdGlmICghdGFyZ2V0RWxlbWVudHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHt0YXJnZXRFbGVtZW50c1F1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRcdHJldHVyblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCB0byk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSA9IHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCBmcm9tKTtcclxuXHJcblx0XHRcdFx0bGV0IGFuaW1hdGVPcHRpb25zID0ge307XHJcblx0XHRcdFx0YW5pbWF0ZU9wdGlvbnNbY3NzRW51bWVyYWJsZVJ1bGVdID0gdGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuYW5pbWF0ZShhbmltYXRlT3B0aW9ucywgZGVsYXkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5yZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2sgPSBmdW5jdGlvbihlbGVtZW50VHJpZ2dlclF1ZXJ5LCBlbGVtZW50T25RdWVyeSkge1xyXG5cdFx0XHRpZiAoISQoZWxlbWVudFRyaWdnZXJRdWVyeSkubGVuZ3RoIHx8ICEkKGVsZW1lbnRPblF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtlbGVtZW50VHJpZ2dlclF1ZXJ5fSAke2VsZW1lbnRPblF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnRPblF1ZXJ5KS5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zKGhlYWRlclF1ZXJ5LCBjb250YWluZXJRdWVyeSkge1xyXG5cdFx0XHRVSXRyYW5zaXRpb25zLmNhbGwodGhpcywgY29udGFpbmVyUXVlcnkpO1xyXG5cclxuXHRcdFx0aWYgKCEkKGhlYWRlclF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtoZWFkZXJRdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0dGhpcy5faGVhZGVyID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5faGVhZGVyID0gJChoZWFkZXJRdWVyeSk7XHJcblx0XHR9XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShVSXRyYW5zaXRpb25zLnByb3RvdHlwZSk7XHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZWFkZXJUcmFuc2l0aW9ucztcclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuZml4SGVhZGVyRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50Rml4UXVlcnksIGZpeENsYXNzTmFtZSwgdW5maXhDbGFzc05hbWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2hlYWRlciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgZml4RWxlbWVudCA9ICQoZWxlbWVudEZpeFF1ZXJ5KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCkge1xyXG5cdFx0XHRcdGxldCB0aW1lcjtcclxuXHJcblx0XHRcdFx0ZnVuY3Rpb24gZml4VW5maXhNZW51T25TY3JvbGwoKSB7XHJcblx0XHRcdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gb3B0aW9ucy5vbk1pblNjcm9sbHRvcCkge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LmFkZENsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLmlubmVyV2lkdGgoKTtcclxuXHJcblx0XHRcdFx0aWYgKHdpZHRoIDwgb3B0aW9ucy5vbk1heFdpbmRvd1dpZHRoKSB7XHJcblx0XHRcdFx0XHRmaXhVbmZpeE1lbnVPblNjcm9sbCgpO1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLmFkZENsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRpbWVyKSB7XHJcblx0XHRcdFx0XHRcdFx0dGltZXIgPSAkdGltZW91dChmaXhVbmZpeE1lbnVPblNjcm9sbCwgMTUwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNlbGYuX2hlYWRlci5yZW1vdmVDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCk7XHJcblx0XHRcdCQod2luZG93KS5vbigncmVzaXplJywgb25XaWR0aENoYW5nZUhhbmRsZXIpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIEhlYWRlclRyYW5zaXRpb25zO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFN0aWt5SGVhZGVyJyxhaHRsU3Rpa3lIZWFkZXIpO1xyXG5cclxuXHRhaHRsU3Rpa3lIZWFkZXIuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTdGlreUhlYWRlcihIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKCkge1xyXG5cdFx0XHRsZXQgaGVhZGVyID0gbmV3IEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgnLmwtaGVhZGVyJywgJy5uYXZfX2l0ZW0tY29udGFpbmVyJyk7XHJcblxyXG5cdFx0XHRoZWFkZXIuYW5pbWF0ZVRyYW5zaXRpb24oXHJcblx0XHRcdFx0Jy5zdWItbmF2Jywge1xyXG5cdFx0XHRcdFx0Y3NzRW51bWVyYWJsZVJ1bGU6ICdoZWlnaHQnLFxyXG5cdFx0XHRcdFx0ZGVsYXk6IDMwMH0pXHJcblx0XHRcdFx0LnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayhcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LXRyaWdnZXJdJyxcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LW9uXScpXHJcblx0XHRcdFx0LmZpeEhlYWRlckVsZW1lbnQoXHJcblx0XHRcdFx0XHQnLm5hdicsXHJcblx0XHRcdFx0XHQnanNfbmF2LS1maXhlZCcsXHJcblx0XHRcdFx0XHQnanNfbC1oZWFkZXItLXJlbGF0aXZlJywge1xyXG5cdFx0XHRcdFx0XHRvbk1pblNjcm9sbHRvcDogODgsXHJcblx0XHRcdFx0XHRcdG9uTWF4V2luZG93V2lkdGg6IDg1MH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgSG9tZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEhvbWVDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcihyZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe3Byb3A6ICdfdHJlbmQnLCB2YWx1ZTogdHJ1ZX0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBpZiBub3QgcmVzcG9uc2VcclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1vZGFsJywgYWh0bE1vZGFsRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9tb2RhbC9tb2RhbC5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdtb2RhbE9wZW4nLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ2ltYWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zcmMgPSBkYXRhLnNyYztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5pbWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseSgpOy8vdG9kbyBhcHBseT9cclxuICAgICAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdtYXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3cubWFwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmdvb2dsZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hcFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQuc3JjID0gJ2h0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9qcz9rZXk9QUl6YVN5Qnh4Q0syLXVWeWw2OXduN0s2MU5QQVFEZjd5SC1qZjN3JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwU2NyaXB0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbXlMYXRsbmcgPSB7bGF0OiBkYXRhLmNvb3JkLmxhdCwgbG5nOiBkYXRhLmNvb3JkLmxuZ307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogNCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBteUxhdGxuZyxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbXlMYXRsbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKHRoaXMuZ2V0UG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlRGlhbG9nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcChuYW1lLCBjb29yZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBbbmFtZSwgY29vcmQubGF0LCBjb29yZC5sbmddXHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxyXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsTWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbF9fbWFwJylbMF0sIHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtsYXQ6IGNvb3JkLmxhdCwgbG5nOiBjb29yZC5sbmd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiA5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaWNvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3JkLmxhdCwgY29vcmQubG5nKSxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbi8qXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyEqY2VudGVyaW5nKiEvXHJcbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcyAoKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIExhdExhbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nIChsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGFsTWFwLmZpdEJvdW5kcyhib3VuZHMpOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2FjdGl2aXRpZXNGaWx0ZXInLCBhY3Rpdml0aWVzRmlsdGVyKTtcclxuXHJcbiAgICBhY3Rpdml0aWVzRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhY3Rpdml0aWVzRmlsdGVyKCRsb2csIGZpbHRlcnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhcmcsIF9zdHJpbmdMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHN0cmluZ0xlbmd0aCA9IHBhcnNlSW50KF9zdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHN0cmluZ0xlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybihgQ2FuJ3QgcGFyc2UgYXJndW1lbnQ6ICR7X3N0cmluZ0xlbmd0aH1gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcmdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGFyZy5qb2luKCcsICcpLnNsaWNlKDAsIHN0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnNsaWNlKDAsIHJlc3VsdC5sYXN0SW5kZXhPZignLCcpKSArICcuLi4nXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdSZXNvcnRDb250cm9sbGVyJywgUmVzb3J0Q29udHJvbGxlcik7XHJcblxyXG4gICAgUmVzb3J0Q29udHJvbGxlci4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJywgJyRmaWx0ZXInLCAnJHNjb3BlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJlc29ydENvbnRyb2xsZXIocmVzb3J0U2VydmljZSwgJGZpbHRlciwgJHNjb3BlLCAkc3RhdGUpIHtcclxuICAgICAgICBsZXQgY3VycmVudEZpbHRlcnMgPSAkc3RhdGUuJGN1cnJlbnQuZGF0YS5jdXJyZW50RmlsdGVyczsgLy8gdGVtcFxyXG5cclxuICAgICAgICB0aGlzLmZpbHRlcnMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpLmluaXRGaWx0ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMub25GaWx0ZXJDaGFuZ2UgPSBmdW5jdGlvbihmaWx0ZXJHcm91cCwgZmlsdGVyLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0gPSBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0gfHwgW107XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0ucHVzaChmaWx0ZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLnNwbGljZShjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uaW5kZXhPZihmaWx0ZXIpLCAxKTtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuYXBwbHlGaWx0ZXJzKGhvdGVscywgY3VycmVudEZpbHRlcnMpO1xyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgaG90ZWxzID0ge307XHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICBob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSBob3RlbHM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5maWx0ZXJzLnByaWNlLFxyXG4gICAgICAgICAgICAgICAgKG5ld1ZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnMucHJpY2UgPSBbbmV3VmFsdWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY3VycmVudEZpbHRlcnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvdGVscyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuYXBwbHlGaWx0ZXJzKGhvdGVscywgY3VycmVudEZpbHRlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7ICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub3Blbk1hcCA9IGZ1bmN0aW9uKGhvdGVsTmFtZSwgaG90ZWxDb29yZCwgaG90ZWwpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBzaG93OiAnbWFwJyxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGhvdGVsTmFtZSxcclxuICAgICAgICAgICAgICAgIGNvb3JkOiBob3RlbENvb3JkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCBkYXRhKVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignaG90ZWxGaWx0ZXInLCBob3RlbEZpbHRlcik7XHJcblxyXG4gICAgaG90ZWxGaWx0ZXIuJGluamVjdCA9IFsnJGxvZycsICdob3RlbERldGFpbHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGhvdGVsRmlsdGVyKCRsb2csIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgbGV0IHNhdmVkRmlsdGVycyA9IHt9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBsb2FkRmlsdGVyczogbG9hZEZpbHRlcnMsXHJcbiAgICAgICAgICAgIGFwcGx5RmlsdGVyczogYXBwbHlGaWx0ZXJzLFxyXG4gICAgICAgICAgICBpbml0RmlsdGVyczogaW5pdEZpbHRlcnNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsb2FkRmlsdGVycygpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0RmlsdGVycygpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coc2F2ZWRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgbGV0IGZpbHRlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICAgICAgZmlsdGVyc1trZXldID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhvdGVsRGV0YWlsc0NvbnN0YW50W2tleV0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gPSBzYXZlZEZpbHRlcnNba2V5XSAmJiBzYXZlZEZpbHRlcnNba2V5XS5pbmRleE9mKGhvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV0pICE9PSAtMSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAvL2ZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSA9IHNhdmVkRmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaWx0ZXJzLnByaWNlID0ge1xyXG4gICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAxMDAwXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyc1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHlGaWx0ZXJzKGhvdGVscywgZmlsdGVycykge1xyXG4gICAgICAgICAgICBzYXZlZEZpbHRlcnMgPSBmaWx0ZXJzO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGhvdGVscywgZnVuY3Rpb24oaG90ZWwpIHtcclxuICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzKGhvdGVsLCBmaWx0ZXJzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzKGhvdGVsLCBmaWx0ZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbHRlcnMsIGZ1bmN0aW9uKGZpbHRlcnNJbkdyb3VwLCBmaWx0ZXJHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV2ZXJzZUZpbHRlck1hdGNoaW5nID0gZmFsc2U7IC8vIGZvciBhY3Rpdml0aWVzIGFuZCBtdXN0aGF2ZXMgZ3JvdXBzXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJHcm91cCA9PT0gJ2d1ZXN0cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc0luR3JvdXAgPSBbZmlsdGVyc0luR3JvdXBbZmlsdGVyc0luR3JvdXAubGVuZ3RoIC0gMV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJHcm91cCA9PT0gJ211c3RIYXZlcycgfHwgZmlsdGVyR3JvdXAgPT09ICdhY3Rpdml0aWVzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXZlcnNlRmlsdGVyTWF0Y2hpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWx0ZXJzSW5Hcm91cC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJldmVyc2VGaWx0ZXJNYXRjaGluZyAmJiBnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXJzSW5Hcm91cFtpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldmVyc2VGaWx0ZXJNYXRjaGluZyAmJiAhZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoQXRMZWFzZU9uZUZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoKGZpbHRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbG9jYXRpb25zJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmxvY2F0aW9uLmNvdW50cnkgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0eXBlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC50eXBlID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2V0dGluZ3MnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZW52aXJvbm1lbnQgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtdXN0SGF2ZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZGV0YWlsc1tmaWx0ZXJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FjdGl2aXRpZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gfmhvdGVsLmFjdGl2aXRpZXMuaW5kZXhPZihmaWx0ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3ByaWNlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnByaWNlID49IGZpbHRlci5taW4gJiYgaG90ZWwucHJpY2UgPD0gZmlsdGVyLm1heDtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdndWVzdHMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZ3Vlc3RzLm1heCA+PSArZmlsdGVyWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaG90ZWxzLmZpbHRlcigoaG90ZWwpID0+ICFob3RlbC5faGlkZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdzY3JvbGxUb1RvcCcsIHNjcm9sbFRvVG9wRGlyZWN0aXZlKTtcclxuXHJcbiAgICBzY3JvbGxUb1RvcERpcmVjdGl2ZS4kaW5qZWN0ID0gWyckd2luZG93JywgJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZSgkbG9nKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogc2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IsIGhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmICgxKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJC50cmltKGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoMCwgYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykpKTtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBwYXJzZUludChhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLnNsaWNlKGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuaW5kZXhPZignLCcpICsgMSkpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2Nyb2xsLXRvLXRvcC1jb25maWcgaXMgbm90IGRlZmluZWRgKTtcclxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciB8fCAnaHRtbCwgYm9keSc7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtKS5vbihhdHRyLnNjcm9sbFRvVG9wLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IGhlaWdodCB9LCBcInNsb3dcIik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1NlYXJjaENvbnRyb2xsZXInLCBTZWFyY2hDb250cm9sbGVyKTtcclxuXHJcbiAgICBTZWFyY2hDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzdGF0ZScsICdyZXNvcnRTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gU2VhcmNoQ29udHJvbGxlcigkc3RhdGUsIHJlc29ydFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnF1ZXJ5ID0gJHN0YXRlLnBhcmFtcy5xdWVyeTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnF1ZXJ5KTtcclxuICAgICAgICB0aGlzLmhvdGVscyA9IG51bGw7XHJcblxyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KClcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VhcmNoKCkge1xyXG4gICAgICAgICAgICBsZXQgcGFyc2VkUXVlcnkgPSAkLnRyaW0odGhpcy5xdWVyeSkucmVwbGFjZSgvXFxzKy9nLCAnICcpLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLmhvdGVscywgKGhvdGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGhvdGVsKTtcclxuICAgICAgICAgICAgICAgIGxldCBob3RlbENvbnRlbnQgPSBob3RlbC5uYW1lICsgaG90ZWwubG9jYXRpb24uY291bnRyeSArXHJcbiAgICAgICAgICAgICAgICAgICAgaG90ZWwubG9jYXRpb24ucmVnaW9uICsgaG90ZWwuZGVzYyArIGhvdGVsLmRlc2NMb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaG90ZWxDb250ZW50KVxyXG4gICAgICAgICAgICAgICAgLy9mb3IgKClcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaGVzQ291bnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnNlZFF1ZXJ5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHFSZWdFeHAgPSBuZXcgUmVnRXhwKHBhcnNlZFF1ZXJ5W2ldLCAnZ2knKTtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzQ291bnRlciArPSAoaG90ZWxDb250ZW50Lm1hdGNoKHFSZWdFeHApIHx8IFtdKS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXNDb3VudGVyID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtob3RlbC5faWRdID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2hvdGVsLl9pZF0ubWF0Y2hlc0NvdW50ZXIgPSBtYXRjaGVzQ291bnRlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFJlc3VsdHMgPSB0aGlzLmhvdGVsc1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoaG90ZWwpID0+IHJlc3VsdFtob3RlbC5faWRdKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgoaG90ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBob3RlbC5fbWF0Y2hlcyA9IHJlc3VsdFtob3RlbC5faWRdLm1hdGNoZXNDb3VudGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNlYXJjaFJlc3VsdHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFRvcDMnLCBhaHRsVG9wM0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFRvcDNEaXJlY3RpdmUuJGluamVjdCA9IFsndG9wM1NlcnZpY2UnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsVG9wM0RpcmVjdGl2ZSh0b3AzU2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsVG9wM0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3RvcDMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdG9wMy50ZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQubXVzdEhhdmU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0VHlwZSA9ICRhdHRycy5haHRsVG9wM3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1nU3JjID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL2ltYWdlcy8nICsgdGhpcy5yZXNvcnRUeXBlICsgJy8nICsgdGhpcy5yZXNvcnRbaW5kZXhdLmltZy5maWxlbmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc1Jlc29ydEluY2x1ZGVEZXRhaWwgPSBmdW5jdGlvbihpdGVtLCBkZXRhaWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZXRhaWxDbGFzc05hbWUgPSAndG9wM19fZGV0YWlsLWNvbnRhaW5lci0tJyArIGRldGFpbCxcclxuICAgICAgICAgICAgICAgICAgICBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUgPSAhaXRlbS5kZXRhaWxzW2RldGFpbF0gPyAnIHRvcDNfX2RldGFpbC1jb250YWluZXItLWhhc250JyA6ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXRhaWxDbGFzc05hbWUgKyBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRvcDNTZXJ2aWNlLmdldFRvcDNQbGFjZXModGhpcy5yZXNvcnRUeXBlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucmVzb3J0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgndG9wM1NlcnZpY2UnLCB0b3AzU2VydmljZSk7XHJcblxyXG4gICAgdG9wM1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiB0b3AzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRUb3AzUGxhY2VzOiBnZXRUb3AzUGxhY2VzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VG9wM1BsYWNlcyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC50b3AzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmFuaW1hdGlvbignLnNsaWRlcl9faW1nJywgYW5pbWF0aW9uRnVuY3Rpb24pO1xyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7IC8vMjAwPyAkKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMCcpO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCdsZWZ0JywgJzAnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFNsaWRlcicsIGFodGxTbGlkZXIpO1xyXG5cclxuXHRhaHRsU2xpZGVyLiRpbmplY3QgPSBbJ3NsaWRlclNlcnZpY2UnLCAnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFNsaWRlcihzbGlkZXJTZXJ2aWNlLCAkdGltZW91dCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0Y29udHJvbGxlcjogYWh0bFNsaWRlckNvbnRyb2xsZXIsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmh0bWwnLFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGFodGxTbGlkZXJDb250cm9sbGVyKCRzY29wZSkge1xyXG5cdFx0XHQkc2NvcGUuc2xpZGVyID0gc2xpZGVyU2VydmljZTtcclxuXHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHRcdFx0JHNjb3BlLm5leHRTbGlkZSA9IG5leHRTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnByZXZTbGlkZSA9IHByZXZTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnNldFNsaWRlID0gc2V0U2xpZGU7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBuZXh0U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAnbGVmdCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXROZXh0U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcHJldlNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldFByZXZTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzZXRTbGlkZShpbmRleCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gaW5kZXggPiAkc2NvcGUuc2xpZGVyLmdldEN1cnJlbnRTbGlkZSh0cnVlKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRDdXJyZW50U2xpZGUoaW5kZXgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZml4SUU4cG5nQmxhY2tCZyhlbGVtZW50KSB7XHJcblx0XHRcdCQoZWxlbWVudClcclxuXHRcdFx0XHQuY3NzKCctbXMtZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCdmaWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ3pvb20nLCAnMScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0pIHtcclxuXHRcdFx0bGV0IGFycm93cyA9ICQoZWxlbSkuZmluZCgnLnNsaWRlcl9fYXJyb3cnKTtcclxuXHJcblx0XHRcdGFycm93cy5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMC41Jyk7XHJcblx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZyh0aGlzKTtcclxuXHJcblx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdCR0aW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzEnKTtcclxuXHRcdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcoJCh0aGlzKSk7XHJcblx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdzbGlkZXJTZXJ2aWNlJyxzbGlkZXJTZXJ2aWNlKTtcclxuXHJcblx0c2xpZGVyU2VydmljZS4kaW5qZWN0ID0gWydzbGlkZXJJbWdQYXRoQ29uc3RhbnQnXTtcclxuXHJcblx0ZnVuY3Rpb24gc2xpZGVyU2VydmljZShzbGlkZXJJbWdQYXRoQ29uc3RhbnQpIHtcclxuXHRcdGZ1bmN0aW9uIFNsaWRlcihzbGlkZXJJbWFnZUxpc3QpIHtcclxuXHRcdFx0dGhpcy5faW1hZ2VTcmNMaXN0ID0gc2xpZGVySW1hZ2VMaXN0O1xyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0SW1hZ2VTcmNMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW1hZ2VTcmNMaXN0O1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChnZXRJbmRleCkge1xyXG5cdFx0XHRyZXR1cm4gZ2V0SW5kZXggPT0gdHJ1ZSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA6IHRoaXMuX2ltYWdlU3JjTGlzdFt0aGlzLl9jdXJyZW50U2xpZGVdO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xyXG5cdFx0XHRzbGlkZSA9IHBhcnNlSW50KHNsaWRlKTtcclxuXHJcblx0XHRcdGlmIChpc05hTihzbGlkZSkgfHwgc2xpZGUgPCAwIHx8IHNsaWRlID4gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IHNsaWRlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldE5leHRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpID8gdGhpcy5fY3VycmVudFNsaWRlID0gMCA6IHRoaXMuX2N1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRQcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IDApID8gdGhpcy5fY3VycmVudFNsaWRlID0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEgOiB0aGlzLl9jdXJyZW50U2xpZGUtLTtcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBuZXcgU2xpZGVyKHNsaWRlckltZ1BhdGhDb25zdGFudCk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3NsaWRlckltZ1BhdGhDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjEuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjIuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjMuanBnJ1xyXG4gICAgICAgIF0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1BhZ2VzJywgUGFnZXMpO1xyXG5cclxuICAgIFBhZ2VzLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFBhZ2VzKCRzY29wZSkge1xyXG4gICAgICAgIGNvbnN0IGhvdGVsc1BlclBhZ2UgPSA1O1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93RnJvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudFBhZ2UgLSAxKSAqIGhvdGVsc1BlclBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKyt0aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd1ByZXYgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0tdGhpcy5jdXJyZW50UGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldFBhZ2UgPSBmdW5jdGlvbihwYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlICsgMTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzTGFzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFnZXNUb3RhbC5sZW5ndGggPT09IHRoaXMuY3VycmVudFBhZ2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzRmlyc3RQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlID09PSAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgKGV2ZW50LCBzaG93SG90ZWxDb3VudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBuZXcgQXJyYXkoTWF0aC5jZWlsKHNob3dIb3RlbENvdW50IC8gaG90ZWxzUGVyUGFnZSkpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3Nob3dGcm9tJywgc2hvd0Zyb20pO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dGcm9tKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgc3RhcnRQb3NpdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoIW1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5zbGljZShzdGFydFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsUHJpY2VTbGlkZXInLCBwcmljZVNsaWRlckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgcHJpY2VTbGlkZXJEaXJlY3RpdmUuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIG1pbjogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBtYXg6IFwiQFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdFNsaWRlcjogJz0nLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRTbGlkZXI6ICc9J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IHByaWNlU2xpZGVyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlTGluaygkc2NvcGUsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5sZWZ0U2xpZGVyKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnJpZ2h0U2xpZGVyKTtcclxuICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyLm1heCA9IDE1OyovXHJcbiAgICAgICAgICAgIGxldCByaWdodEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKSxcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKSxcclxuICAgICAgICAgICAgICAgIHNsaWRlQXJlYVdpZHRoID0gcGFyc2VJbnQoJCgnLnNsaWRlJykuY3NzKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlUGVyU3RlcCA9ICRzY29wZS5tYXggLyAoc2xpZGVBcmVhV2lkdGggLSAyMCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubWluID0gcGFyc2VJbnQoJHNjb3BlLm1pbik7XHJcbiAgICAgICAgICAgICRzY29wZS5tYXggPSBwYXJzZUludCgkc2NvcGUubWF4KTtcclxuXHJcbiAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICByaWdodEJ0bixcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHNsaWRlQXJlYVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCxcclxuICAgICAgICAgICAgICAgICgpID0+IDApO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdERyYWcoZHJhZ0VsZW0sIGluaXRQb3NpdGlvbiwgbWF4UG9zaXRpb24sIG1pblBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2hpZnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNlZG93bicsIGJ0bk9uTW91c2VEb3duKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlRG93bihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0ID0gZXZlbnQucGFnZVg7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFBvc2l0aW9uID0gcGFyc2VJbnQoZHJhZ0VsZW0uY3NzKCdsZWZ0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZG9jT25Nb3VzZU1vdmUoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb25MZXNzVGhhbk1heCA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPD0gbWF4UG9zaXRpb24oKSAtIDIwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkdyYXRlclRoYW5NaW4gPSBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0ID49IG1pblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbkxlc3NUaGFuTWF4ICYmIHBvc2l0aW9uR3JhdGVyVGhhbk1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcmFnRWxlbS5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0Jywgc2xpZGVBcmVhV2lkdGggLSBpbml0UG9zaXRpb24gLSBldmVudC5wYWdlWCArIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VVcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldFByaWNlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVtaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignZHJhZ3N0YXJ0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UHJpY2VzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdNaW4gPSB+fihwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld01heCA9IH5+KHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbChuZXdNaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbChuZXdNYXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdEJ0bi5jc3MoJ2xlZnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0QnRuLmNzcygnbGVmdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFNsaWRlcnMoYnRuLCBuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQb3N0aW9uID0gbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmNzcygnbGVmdCcsIG5ld1Bvc3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnRuLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIG5ld1Bvc3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcCA+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAtIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKGxlZnRCdG4sIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlID4gJHNjb3BlLm1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VmFsdWUsJHNjb3BlLm1heCApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwIDwgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhO2wnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2xpZGVycyhyaWdodEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZW1pdCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGVmdFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5yaWdodFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyokc2NvcGUuJGJyb2FkY2FzdCgncHJpY2VTbGlkZXJQb3NpdGlvbkNoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heDogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKClcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxMyk7Ki9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL3RvZG8gaWU4IGJ1ZyBmaXhcclxuICAgICAgICAgICAgICAgIGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ2llOCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyokc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKS5jc3MoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuZmluZCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coK3NsaWRlQXJlYVdpZHRoIC0gK25ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCArc2xpZGVBcmVhV2lkdGggLSBwYXJzZUludChuZXdWYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxTbGlkZU9uQ2xpY2snLCBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgbGluazogYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgbGV0IHNsaWRlRW1pdEVsZW1lbnRzID0gJChlbGVtKS5maW5kKCdbc2xpZGUtZW1pdF0nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNsaWRlLWVtaXQgbm90IGZvdW5kYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzbGlkZUVtaXRFbGVtZW50cy5vbignY2xpY2snLCBzbGlkZUVtaXRPbkNsaWNrKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNsaWRlRW1pdE9uQ2xpY2soKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2xpZGVPbkVsZW1lbnQgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbl0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXNsaWRlRW1pdEVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnJyAmJiBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2FybihgV3JvbmcgaW5pdCB2YWx1ZSBmb3IgJ3NsaWRlLW9uJyBhdHRyaWJ1dGUsIHNob3VsZCBiZSAnJyBvciAnY2xvc2VkJy5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlVXAoJ3Nsb3cnLCBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJ2Nsb3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5zbGlkZURvd24oJ3Nsb3cnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicsICcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNsaWRlVG9nZ2xlRWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbi10b2dnbGVdJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChzbGlkZVRvZ2dsZUVsZW1lbnRzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygkKHRoaXMpLmF0dHIoJ3NsaWRlLW9uLXRvZ2dsZScpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuIl19
