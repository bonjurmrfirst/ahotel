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
        ahtlGalleryController.$inject = ["$scope"];
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'app/partials/gallery/gallery.template.html',
            controller: ahtlGalleryController,
            controllerAs: 'gallery',
            link: ahtlGalleryDirectiveLink
        };

        function ahtlGalleryController($scope) {
            this.imgs = new Array(20);
            this.imgsLoaded = [];

            this.openImage = function (imageName) {
                var imageSrc = 'assets/images/gallery/' + imageName + '.jpg';

                $scope.$root.$broadcast('modalOpen', {
                    show: 'image',
                    src: imageSrc
                });
            };

            $timeout(function () {
                return $scope.$root.$broadcast('ahtlGallery:loaded');
            });
        }

        function ahtlGalleryDirectiveLink($scope, elem, a, ctrl) {
            $scope.$on('ahtlGallery:loaded', alignImages);

            function alignImages() {
                $timeout(function () {
                    var container = document.querySelector('.container');

                    var masonry = new Masonry(container, {
                        columnWidth: '.item',
                        itemSelector: '.item',
                        gutter: '.gutter-sizer',
                        transitionDuration: '0.2s',
                        initLayout: false
                    });

                    masonry.on('layoutComplete', onLayoutComplete);

                    masonry.layout();

                    function onLayoutComplete() {
                        $timeout(function () {
                            return $(container).css('opacity', '1');
                        }, 0);
                    }
                });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsImdsb2JhbHMvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy9hdXRoL2F1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvYm9va2luZy9ib29raW5nLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuZm9ybS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYm9va2luZy9kYXRlUGlja2VyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvbW9kYWwvbW9kYWwuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5hY3Rpdml0aWVzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaG90ZWwuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5zY3JvbGx0b1RvcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuYW5pbWF0aW9uLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyUGF0aC5jb25zdGFudC5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvc2xpZGVPbkNsaWNrL3NsaWRlT25DbGljay5kaXJlY3RpdmUuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRwcm92aWRlIiwiZGVjb3JhdG9yIiwiJGRlbGVnYXRlIiwiJHdpbmRvdyIsImxvZ0hpc3RvcnkiLCJ3YXJuIiwiZXJyIiwibG9nIiwibWVzc2FnZSIsIl9sb2dXYXJuIiwicHVzaCIsImFwcGx5IiwiX2xvZ0VyciIsImVycm9yIiwibmFtZSIsInN0YWNrIiwiRXJyb3IiLCJzZW5kT25VbmxvYWQiLCJvbmJlZm9yZXVubG9hZCIsImxlbmd0aCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIiRpbmplY3QiLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJkYXRhIiwiY3VycmVudEZpbHRlcnMiLCJydW4iLCIkcm9vdFNjb3BlIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiZnJvbVN0YXRlIiwicHJvdmlkZXIiLCJwcmVsb2FkU2VydmljZSIsIm1ldGhvZCIsImFjdGlvbiIsInRpbWVvdXQiLCIkZ2V0IiwiJGh0dHAiLCIkdGltZW91dCIsInByZWxvYWRDYWNoZSIsImxvZ2dlciIsImNvbnNvbGUiLCJkZWJ1ZyIsInByZWxvYWRJbWFnZXMiLCJwcmVsb2FkTmFtZSIsImltYWdlcyIsImltYWdlc1NyY0xpc3QiLCJzcmMiLCJwcmVsb2FkIiwidGhlbiIsInJlc3BvbnNlIiwiYmluZCIsImkiLCJpbWFnZSIsIkltYWdlIiwib25sb2FkIiwiZSIsIm9uZXJyb3IiLCJnZXRQcmVsb2FkIiwiZ2V0UHJlbG9hZENhY2hlIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImdhbGxlcnkiLCJndWVzdGNvbW1lbnRzIiwiaG90ZWxzIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJHEiLCJtb2RlbCIsImdldFJlc29ydCIsImZpbHRlciIsIndoZW4iLCJhcHBseUZpbHRlciIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJob3RlbCIsInByb3AiLCJ2YWx1ZSIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsInNpZ25JbiIsInVzZXIiLCJwcmV2aW91c1N0YXRlIiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsIl9jcmVkZW50aWFscyIsIl9vblJlc29sdmUiLCJzdGF0dXMiLCJ0b2tlbiIsIl90b2tlbktlZXBlciIsInNhdmVUb2tlbiIsIl9vblJlamVjdGVkIiwiX3Rva2VuIiwiZ2V0VG9rZW4iLCJkZWxldGVUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwic2lnbk91dCIsImdldExvZ0luZm8iLCJCb29raW5nQ29udHJvbGxlciIsIiRzdGF0ZVBhcmFtcyIsImxvYWRlZCIsImhvdGVsSWQiLCJnZXRIb3RlbEltYWdlc0NvdW50IiwiY291bnQiLCJBcnJheSIsIm9wZW5JbWFnZSIsIiRldmVudCIsImltZ1NyYyIsInRhcmdldCIsIiRicm9hZGNhc3QiLCJzaG93IiwiQm9va2luZ0Zvcm1Db250cm9sbGVyIiwiZm9ybSIsImRhdGUiLCJhZGRHdWVzdCIsInJlbW92ZUd1ZXN0Iiwic3VibWl0IiwiZGlyZWN0aXZlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZSIsIiRpbnRlcnZhbCIsInJlcXVpcmUiLCJsaW5rIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCIkIiwiZGF0ZVJhbmdlUGlja2VyIiwibGFuZ3VhZ2UiLCJzdGFydERhdGUiLCJEYXRlIiwiZW5kRGF0ZSIsInNldEZ1bGxZZWFyIiwiZ2V0RnVsbFllYXIiLCJvYmoiLCIkc2V0Vmlld1ZhbHVlIiwiJHJlbmRlciIsIiRhcHBseSIsImFodGxNYXBEaXJlY3RpdmUiLCJyZXN0cmljdCIsInRlbXBsYXRlIiwiYWh0bE1hcERpcmVjdGl2ZUxpbmsiLCJlbGVtIiwiYXR0ciIsImNyZWF0ZU1hcCIsIndpbmRvdyIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJfZ21hcHMiLCJsYXQiLCJsbmciLCJteUxhdExuZyIsIm1hcCIsIm1hcHMiLCJNYXAiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwic2Nyb2xsd2hlZWwiLCJpY29ucyIsImFob3RlbCIsImljb24iLCJtYXJrZXIiLCJNYXJrZXIiLCJ0aXRsZSIsInBvc2l0aW9uIiwiTGF0TG5nIiwiYWRkTGlzdGVuZXIiLCJzZXRab29tIiwic2V0Q2VudGVyIiwiZ2V0UG9zaXRpb24iLCJib3VuZHMiLCJMYXRMbmdCb3VuZHMiLCJMYXRMYW5nIiwiZXh0ZW5kIiwiZml0Qm91bmRzIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmUiLCJhaHRsR2FsbGVyeUNvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmsiLCJpbWdzIiwiaW1nc0xvYWRlZCIsImltYWdlTmFtZSIsImltYWdlU3JjIiwiJHJvb3QiLCJhIiwiYWxpZ25JbWFnZXMiLCJjb250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwibWFzb25yeSIsIk1hc29ucnkiLCJjb2x1bW5XaWR0aCIsIml0ZW1TZWxlY3RvciIsImd1dHRlciIsInRyYW5zaXRpb25EdXJhdGlvbiIsImluaXRMYXlvdXQiLCJvbiIsIm9uTGF5b3V0Q29tcGxldGUiLCJsYXlvdXQiLCJjc3MiLCJHdWVzdGNvbW1lbnRzQ29udHJvbGxlciIsImd1ZXN0Y29tbWVudHNTZXJ2aWNlIiwiY29tbWVudHMiLCJvcGVuRm9ybSIsInNob3dQbGVhc2VMb2dpTWVzc2FnZSIsIndyaXRlQ29tbWVudCIsImdldEd1ZXN0Q29tbWVudHMiLCJhZGRDb21tZW50Iiwic2VuZENvbW1lbnQiLCJmb3JtRGF0YSIsImNvbW1lbnQiLCJyZXZlcnNlIiwiaXRlbXMiLCJzbGljZSIsInR5cGUiLCJvblJlamVjdCIsIkhlYWRlckNvbnRyb2xsZXIiLCJhaHRsSGVhZGVyIiwic2VydmljZSIsIkhlYWRlclRyYW5zaXRpb25zU2VydmljZSIsIiRsb2ciLCJVSXRyYW5zaXRpb25zIiwiX2NvbnRhaW5lciIsImFuaW1hdGVUcmFuc2l0aW9uIiwidGFyZ2V0RWxlbWVudHNRdWVyeSIsImNzc0VudW1lcmFibGVSdWxlIiwiZnJvbSIsInRvIiwiZGVsYXkiLCJtb3VzZWVudGVyIiwidGFyZ2V0RWxlbWVudHMiLCJmaW5kIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJzY3JvbGxUb3AiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwiYWh0bFN0aWt5SGVhZGVyIiwiaGVhZGVyIiwiSG9tZUNvbnRyb2xsZXIiLCJhaHRsTW9kYWxEaXJlY3RpdmUiLCJyZXBsYWNlIiwiYWh0bE1vZGFsRGlyZWN0aXZlTGluayIsImltZyIsInVuZGVmaW5lZCIsIm15TGF0bG5nIiwiY29vcmQiLCJ6b29tIiwiY2VudGVyIiwiY2xvc2VEaWFsb2ciLCJtb2RhbE1hcCIsImFjdGl2aXRpZXNGaWx0ZXIiLCJmaWx0ZXJzU2VydmljZSIsImFyZyIsIl9zdHJpbmdMZW5ndGgiLCJzdHJpbmdMZW5ndGgiLCJwYXJzZUludCIsImlzTmFOIiwicmVzdWx0Iiwiam9pbiIsImxhc3RJbmRleE9mIiwiUmVzb3J0Q29udHJvbGxlciIsIiRmaWx0ZXIiLCIkY3VycmVudCIsImZpbHRlcnMiLCJpbml0RmlsdGVycyIsIm9uRmlsdGVyQ2hhbmdlIiwiZmlsdGVyR3JvdXAiLCJzcGxpY2UiLCJpbmRleE9mIiwiYXBwbHlGaWx0ZXJzIiwiZ2V0U2hvd0hvdGVsQ291bnQiLCJyZWR1Y2UiLCJjb3VudGVyIiwiaXRlbSIsIl9oaWRlIiwiJHdhdGNoIiwibmV3VmFsdWUiLCJvcGVuTWFwIiwiaG90ZWxOYW1lIiwiaG90ZWxDb29yZCIsImhvdGVsRmlsdGVyIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCJzYXZlZEZpbHRlcnMiLCJsb2FkRmlsdGVycyIsImtleSIsIm1pbiIsIm1heCIsImZvckVhY2giLCJpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzIiwiZmlsdGVyc0luR3JvdXAiLCJtYXRjaEF0TGVhc2VPbmVGaWx0ZXIiLCJyZXZlcnNlRmlsdGVyTWF0Y2hpbmciLCJnZXRIb3RlbFByb3AiLCJsb2NhdGlvbiIsImNvdW50cnkiLCJlbnZpcm9ubWVudCIsImRldGFpbHMiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZSIsInNjcm9sbFRvVG9wRGlyZWN0aXZlTGluayIsInNlbGVjdG9yIiwiaGVpZ2h0IiwidHJpbSIsInNjcm9sbFRvVG9wQ29uZmlnIiwic2Nyb2xsVG9Ub3AiLCJTZWFyY2hDb250cm9sbGVyIiwicXVlcnkiLCJzZWFyY2giLCJwYXJzZWRRdWVyeSIsInNwbGl0IiwiaG90ZWxDb250ZW50IiwicmVnaW9uIiwiZGVzYyIsImRlc2NMb2NhdGlvbiIsIm1hdGNoZXNDb3VudGVyIiwicVJlZ0V4cCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2lkIiwic2VhcmNoUmVzdWx0cyIsIl9tYXRjaGVzIiwiYWh0bFRvcDNEaXJlY3RpdmUiLCJ0b3AzU2VydmljZSIsIkFodGxUb3AzQ29udHJvbGxlciIsIiRlbGVtZW50IiwiJGF0dHJzIiwibXVzdEhhdmUiLCJyZXNvcnRUeXBlIiwiYWh0bFRvcDN0eXBlIiwicmVzb3J0IiwiZ2V0SW1nU3JjIiwiaW5kZXgiLCJmaWxlbmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbCIsImRldGFpbCIsImRldGFpbENsYXNzTmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSIsImdldFRvcDNQbGFjZXMiLCJhbmltYXRpb24iLCJhbmltYXRpb25GdW5jdGlvbiIsImJlZm9yZUFkZENsYXNzIiwiY2xhc3NOYW1lIiwiZG9uZSIsInNsaWRpbmdEaXJlY3Rpb24iLCJhaHRsU2xpZGVyIiwic2xpZGVyU2VydmljZSIsImFodGxTbGlkZXJDb250cm9sbGVyIiwic2xpZGVyIiwibmV4dFNsaWRlIiwicHJldlNsaWRlIiwic2V0U2xpZGUiLCJzZXROZXh0U2xpZGUiLCJzZXRQcmV2U2xpZGUiLCJnZXRDdXJyZW50U2xpZGUiLCJzZXRDdXJyZW50U2xpZGUiLCJmaXhJRThwbmdCbGFja0JnIiwiYXJyb3dzIiwiY2xpY2siLCJkaXNhYmxlZCIsInNsaWRlckltZ1BhdGhDb25zdGFudCIsIlNsaWRlciIsInNsaWRlckltYWdlTGlzdCIsIl9pbWFnZVNyY0xpc3QiLCJfY3VycmVudFNsaWRlIiwiZ2V0SW1hZ2VTcmNMaXN0IiwiZ2V0SW5kZXgiLCJzbGlkZSIsIlBhZ2VzIiwiaG90ZWxzUGVyUGFnZSIsImN1cnJlbnRQYWdlIiwicGFnZXNUb3RhbCIsInNob3dGcm9tIiwic2hvd05leHQiLCJzaG93UHJldiIsInNldFBhZ2UiLCJwYWdlIiwiaXNMYXN0UGFnZSIsImlzRmlyc3RQYWdlIiwic2hvd0hvdGVsQ291bnQiLCJNYXRoIiwiY2VpbCIsInN0YXJ0UG9zaXRpb24iLCJwcmljZVNsaWRlckRpcmVjdGl2ZSIsImxlZnRTbGlkZXIiLCJyaWdodFNsaWRlciIsInByaWNlU2xpZGVyRGlyZWN0aXZlTGluayIsInJpZ2h0QnRuIiwibGVmdEJ0biIsInNsaWRlQXJlYVdpZHRoIiwidmFsdWVQZXJTdGVwIiwidmFsIiwiaW5pdERyYWciLCJkcmFnRWxlbSIsImluaXRQb3NpdGlvbiIsIm1heFBvc2l0aW9uIiwibWluUG9zaXRpb24iLCJzaGlmdCIsImJ0bk9uTW91c2VEb3duIiwicGFnZVgiLCJkb2NPbk1vdXNlTW92ZSIsImJ0bk9uTW91c2VVcCIsInBvc2l0aW9uTGVzc1RoYW5NYXgiLCJwb3NpdGlvbkdyYXRlclRoYW5NaW4iLCJzZXRQcmljZXMiLCJlbWl0IiwibmV3TWluIiwibmV3TWF4Iiwic2V0U2xpZGVycyIsImJ0biIsIm5ld1Bvc3Rpb24iLCJoYXNDbGFzcyIsInRyaWdnZXIiLCJhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmsiLCJzbGlkZUVtaXRFbGVtZW50cyIsInNsaWRlRW1pdE9uQ2xpY2siLCJzbGlkZU9uRWxlbWVudCIsInNsaWRlVXAiLCJvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUiLCJzbGlkZURvd24iLCJzbGlkZVRvZ2dsZUVsZW1lbnRzIiwiZWFjaCIsInRvZ2dsZUNsYXNzIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUEsUUFDS0MsT0FBTyxhQUFhLENBQUMsNkJBQTRCLGFBQWE7S0FKdkU7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUQsUUFDS0MsT0FBTyxhQUNQQyxvQkFBTyxVQUFVQyxVQUFVO1FBQ3hCQSxTQUFTQyxVQUFVLGlDQUFRLFVBQVVDLFdBQVdDLFNBQVM7WUFDckQsSUFBSUMsYUFBYTtnQkFDVEMsTUFBTTtnQkFDTkMsS0FBSzs7O1lBR2JKLFVBQVVLLE1BQU0sVUFBVUMsU0FBUzs7WUFH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LCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnLCBbJ3VpLnJvdXRlcicvKiwgJ3ByZWxvYWQnKi8sICduZ0FuaW1hdGUnLCAnNzIwa2Iuc29jaWFsc2hhcmUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24gKCRwcm92aWRlKSB7XHJcbiAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcignJGxvZycsIGZ1bmN0aW9uICgkZGVsZWdhdGUsICR3aW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsb2dIaXN0b3J5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmxvZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nV2FybiA9ICRkZWxlZ2F0ZS53YXJuO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLndhcm4gPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dXYXJuLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nRXJyID0gJGRlbGVnYXRlLmVycm9yO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmVycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtuYW1lOiBtZXNzYWdlLCBzdGFjazogbmV3IEVycm9yKCkuc3RhY2t9KTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nRXJyLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiBzZW5kT25VbmxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2dIaXN0b3J5LmVyci5sZW5ndGggJiYgIWxvZ0hpc3Rvcnkud2Fybi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKCdwb3N0JywgJy9hcGkvbG9nJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkobG9nSGlzdG9yeSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkZGVsZWdhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpO1xyXG5cclxuLypcclxuICAgICAgICAuZmFjdG9yeSgnbG9nJywgbG9nKTtcclxuXHJcbiAgICBsb2cuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbG9nKCR3aW5kb3csICRsb2cpIHtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHdhcm4oLi4uYXJncykge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChhcmdzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChicm93c2VyTG9nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKGUpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICBzdGFjazogZS5zdGFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJGxvZy5lcnJvcihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdG9kbyBhbGwgZXJyb3JzXHJcblxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2Fybjogd2FybixcclxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgICAgICAgICBzZW5kT25VbmxvYWQ6IHNlbmRPblVubG9hZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIvKlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhjb25maWcpO1xyXG5cclxuICAgIGNvbmZpZy4kaW5qZWN0ID0gWydwcmVsb2FkU2VydmljZVByb3ZpZGVyJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gY29uZmlnKHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIuY29uZmlnKGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksICdHRVQnLCAnZ2V0JywgMTAwLCAnd2FybmluZycpO1xyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2F1dGgvYXV0aC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsndHlwZSc6ICdsb2dpbiBvciBqb2luJ30vKixcclxuXHRcdFx0XHRvbkVudGVyOiBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xyXG5cdFx0XHRcdFx0JHJvb3RTY29wZS4kc3RhdGUgPSBcImF1dGhcIjtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2J1bmdhbG93cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2hvdGVscycsIHtcclxuXHRcdFx0XHRcdHVybDogJy90b3AnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC92aWxsYXMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdnYWxsZXJ5Jywge1xyXG5cdFx0XHRcdHVybDogJy9nYWxsZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdndWVzdGNvbW1lbnRzJywge1xyXG5cdFx0XHRcdHVybDogJy9ndWVzdGNvbW1lbnRzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdkZXN0aW5hdGlvbnMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvZGVzdGluYXRpb25zJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Rlc3RpbmF0aW9ucy9kZXN0aW5hdGlvbnMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdyZXNvcnQnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3Jlc29ydCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3Jlc29ydC5odG1sJyxcclxuXHRcdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0XHRjdXJyZW50RmlsdGVyczoge31cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYm9va2luZycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYm9va2luZz9ob3RlbElkJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J2hvdGVsSWQnOiAnaG90ZWwgSWQnfVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3NlYXJjaCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvc2VhcmNoP3F1ZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydxdWVyeSc6ICdzZWFyY2ggcXVlcnknfVxyXG5cdFx0XHR9KVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLnJ1bihydW4pO1xyXG5cclxuICAgIHJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJyAsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsIC8qJ3ByZWxvYWRTZXJ2aWNlJywqLyAnJHdpbmRvdyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bigkcm9vdFNjb3BlLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgLypwcmVsb2FkU2VydmljZSwqLyAkd2luZG93KSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJHN0YXRlID0ge1xyXG4gICAgICAgICAgICBjdXJyZW50U3RhdGVOYW1lOiBudWxsLFxyXG4gICAgICAgICAgICBjdXJyZW50U3RhdGVQYXJhbXM6IG51bGwsXHJcbiAgICAgICAgICAgIHN0YXRlSGlzdG9yeTogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZS8qLCBmcm9tUGFyYW1zIHRvZG8qLyl7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZU5hbWUgPSB0b1N0YXRlLm5hbWU7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZVBhcmFtcyA9IHRvUGFyYW1zO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkucHVzaCh0b1N0YXRlLm5hbWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLyosIGZyb21QYXJhbXMgdG9kbyovKSB7XHJcbiAgICAgICAgICAgIC8vJHRpbWVvdXQoKCkgPT4gJCgnYm9keScpLnNjcm9sbFRvcCgwKSwgMCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qJHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHsgLy90b2RvIG9ubG9hZCDvv73vv73vv73vv73vv73vv73vv73vv70g77+9IO+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgICAgICAgICBwcmVsb2FkU2VydmljZS5wcmVsb2FkSW1hZ2VzKCdnYWxsZXJ5Jywge3VybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSwgbWV0aG9kOiAnR0VUJywgYWN0aW9uOiAnZ2V0J30pOyAvL3RvZG8gZGVsIG1ldGhvZCwgYWN0aW9uIGJ5IGRlZmF1bHRcclxuICAgICAgICB9OyovXHJcblxyXG4gICAgICAgIC8vbG9nLnNlbmRPblVubG9hZCgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncHJlbG9hZCcsIFtdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3ByZWxvYWQnKVxyXG4gICAgICAgIC5wcm92aWRlcigncHJlbG9hZFNlcnZpY2UnLCBwcmVsb2FkU2VydmljZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcHJlbG9hZFNlcnZpY2UoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gZnVuY3Rpb24odXJsID0gJy9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcclxuICAgICAgICAgICAgICAgIGxvZzogbG9nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCRodHRwLCAkdGltZW91dCkge1xyXG4gICAgICAgICAgICBsZXQgcHJlbG9hZENhY2hlID0gW10sXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIgPSBmdW5jdGlvbihtZXNzYWdlLCBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdzaWxlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnZGVidWcnICYmIGxvZyA9PT0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvZyA9PT0gJ3dhcm5pbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZEltYWdlcyhwcmVsb2FkTmFtZSwgaW1hZ2VzKSB7IC8vdG9kbyBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZXNTcmNMaXN0ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdhcnJheScpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gaW1hZ2VzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLm1ldGhvZCB8fCBjb25maWcubWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGltYWdlcy51cmwgfHwgY29uZmlnLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5hY3Rpb24gfHwgY29uZmlnLmFjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnRpbWVvdXQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cub25sb2FkID0gcHJlbG9hZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChwcmVsb2FkLmJpbmQobnVsbCwgaW1hZ2VzU3JjTGlzdCksIGNvbmZpZy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzU3JjTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2VzU3JjTGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzb2x2ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIodGhpcy5zcmMsICdkZWJ1ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRQcmVsb2FkKHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ3ByZWxvYWRTZXJ2aWNlOiBnZXQgcmVxdWVzdCAnICsgJ1wiJyArIHByZWxvYWROYW1lICsgJ1wiJywgJ2RlYnVnJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWxvYWRDYWNoZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkQ2FjaGVbaV0ubmFtZSA9PT0gcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZVtpXS5zcmNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdObyBwcmVsb2FkcyBmb3VuZCcsICd3YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwcmVsb2FkSW1hZ2VzOiBwcmVsb2FkSW1hZ2VzLFxyXG4gICAgICAgICAgICAgICAgZ2V0UHJlbG9hZENhY2hlOiBnZXRQcmVsb2FkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2JhY2tlbmRQYXRoc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0b3AzOiAnL2FwaS90b3AzJyxcclxuICAgICAgICAgICAgYXV0aDogJy9hcGkvdXNlcnMnLFxyXG4gICAgICAgICAgICBnYWxsZXJ5OiAnL2FwaS9nYWxsZXJ5JyxcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50czogJy9hcGkvZ3Vlc3Rjb21tZW50cycsXHJcbiAgICAgICAgICAgIGhvdGVsczogJy9hcGkvaG90ZWxzJ1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2hvdGVsRGV0YWlsc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0eXBlczogW1xyXG4gICAgICAgICAgICAgICAgJ0hvdGVsJyxcclxuICAgICAgICAgICAgICAgICdCdW5nYWxvdycsXHJcbiAgICAgICAgICAgICAgICAnVmlsbGEnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nczogW1xyXG4gICAgICAgICAgICAgICAgJ0NvYXN0JyxcclxuICAgICAgICAgICAgICAgICdDaXR5JyxcclxuICAgICAgICAgICAgICAgICdEZXNlcnQnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICdOYW1pYmlhJyxcclxuICAgICAgICAgICAgICAgICdMaWJ5YScsXHJcbiAgICAgICAgICAgICAgICAnU291dGggQWZyaWNhJyxcclxuICAgICAgICAgICAgICAgICdUYW56YW5pYScsXHJcbiAgICAgICAgICAgICAgICAnUGFwdWEgTmV3IEd1aW5lYScsXHJcbiAgICAgICAgICAgICAgICAnUmV1bmlvbicsXHJcbiAgICAgICAgICAgICAgICAnU3dhemlsYW5kJyxcclxuICAgICAgICAgICAgICAgICdTYW8gVG9tZScsXHJcbiAgICAgICAgICAgICAgICAnTWFkYWdhc2NhcicsXHJcbiAgICAgICAgICAgICAgICAnTWF1cml0aXVzJyxcclxuICAgICAgICAgICAgICAgICdTZXljaGVsbGVzJyxcclxuICAgICAgICAgICAgICAgICdNYXlvdHRlJyxcclxuICAgICAgICAgICAgICAgICdVa3JhaW5lJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgZ3Vlc3RzOiBbXHJcbiAgICAgICAgICAgICAgICAnMScsXHJcbiAgICAgICAgICAgICAgICAnMicsXHJcbiAgICAgICAgICAgICAgICAnMycsXHJcbiAgICAgICAgICAgICAgICAnNCcsXHJcbiAgICAgICAgICAgICAgICAnNSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIG11c3RIYXZlczogW1xyXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxyXG4gICAgICAgICAgICAgICAgJ2tpZHMnLFxyXG4gICAgICAgICAgICAgICAgJ3Bvb2wnLFxyXG4gICAgICAgICAgICAgICAgJ3NwYScsXHJcbiAgICAgICAgICAgICAgICAnd2lmaScsXHJcbiAgICAgICAgICAgICAgICAncGV0JyxcclxuICAgICAgICAgICAgICAgICdkaXNhYmxlJyxcclxuICAgICAgICAgICAgICAgICdiZWFjaCcsXHJcbiAgICAgICAgICAgICAgICAncGFya2luZycsXHJcbiAgICAgICAgICAgICAgICAnY29uZGl0aW9uaW5nJyxcclxuICAgICAgICAgICAgICAgICdsb3VuZ2UnLFxyXG4gICAgICAgICAgICAgICAgJ3RlcnJhY2UnLFxyXG4gICAgICAgICAgICAgICAgJ2dhcmRlbicsXHJcbiAgICAgICAgICAgICAgICAnZ3ltJyxcclxuICAgICAgICAgICAgICAgICdiaWN5Y2xlcydcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGFjdGl2aXRpZXM6IFtcclxuICAgICAgICAgICAgICAgICdDb29raW5nIGNsYXNzZXMnLFxyXG4gICAgICAgICAgICAgICAgJ0N5Y2xpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0Zpc2hpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0dvbGYnLFxyXG4gICAgICAgICAgICAgICAgJ0hpa2luZycsXHJcbiAgICAgICAgICAgICAgICAnSG9yc2UtcmlkaW5nJyxcclxuICAgICAgICAgICAgICAgICdLYXlha2luZycsXHJcbiAgICAgICAgICAgICAgICAnTmlnaHRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdTYWlsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTY3ViYSBkaXZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3BwaW5nIC8gbWFya2V0cycsXHJcbiAgICAgICAgICAgICAgICAnU25vcmtlbGxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NraWluZycsXHJcbiAgICAgICAgICAgICAgICAnU3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2lsZGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmRzdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaW5lIHRhc3RpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1lvZ2EnIFxyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgcHJpY2U6IFtcclxuICAgICAgICAgICAgICAgIFwibWluXCIsXHJcbiAgICAgICAgICAgICAgICBcIm1heFwiXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ3Jlc29ydFNlcnZpY2UnLCByZXNvcnRTZXJ2aWNlKTtcclxuXHJcbiAgICByZXNvcnRTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJyRxJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzb3J0U2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsICRxKSB7XHJcbiAgICAgICAgbGV0IG1vZGVsID0gbnVsbDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmVzb3J0KGZpbHRlcikge1xyXG4gICAgICAgICAgICAvL3RvZG8gZXJyb3JzOiBubyBob3RlbHMsIG5vIGZpbHRlci4uLlxyXG4gICAgICAgICAgICBpZiAobW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKGFwcGx5RmlsdGVyKG1vZGVsKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcHBseUZpbHRlcihtb2RlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcHBseUZpbHRlcihtb2RlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYXBwbHlGaWx0ZXIoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbC5maWx0ZXIoKGhvdGVsKSA9PiBob3RlbFtmaWx0ZXIucHJvcF0gPT0gZmlsdGVyLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0UmVzb3J0OiBnZXRSZXNvcnRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBBdXRoQ29udHJvbGxlcik7XHJcblxyXG4gICAgQXV0aENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckc2NvcGUnLCAnYXV0aFNlcnZpY2UnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0aENvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHNjb3BlLCBhdXRoU2VydmljZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzID0ge1xyXG4gICAgICAgICAgICB1c2VyQWxyZWFkeUV4aXN0czogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvZ2luT3JQYXNzd29yZEluY29ycmVjdDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2UuY3JlYXRlVXNlcih0aGlzLm5ld1VzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2F1dGgnLCB7J3R5cGUnOiAnbG9naW4nfSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMudXNlckFscmVhZHlFeGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmZvcm1Kb2luKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdVc2VyKTsqL1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9naW5Vc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25Jbih0aGlzLnVzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJldmlvdXNTdGF0ZSA9ICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeVskcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkubGVuZ3RoIC0gMl0gfHwgJ2hvbWUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwcmV2aW91c1N0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKHByZXZpb3VzU3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLmxvZ2luT3JQYXNzd29yZEluY29ycmVjdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdhdXRoU2VydmljZScsIGF1dGhTZXJ2aWNlKTtcclxuXHJcbiAgICBhdXRoU2VydmljZS4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYXV0aFNlcnZpY2UoJHJvb3RTY29wZSwgJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgLy90b2RvIGVycm9yc1xyXG4gICAgICAgIGZ1bmN0aW9uIFVzZXIoYmFja2VuZEFwaSkge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZW5kQXBpID0gYmFja2VuZEFwaTtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZXNvbHZlID0gKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEudG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuc2F2ZVRva2VuKHJlc3BvbnNlLmRhdGEudG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ09LJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZWplY3RlZCA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9rZW4gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNhdmVUb2tlbihfdG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gX3Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcodG9rZW4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0VG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRlbGV0ZVRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVUb2tlbjogc2F2ZVRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGdldFRva2VuOiBnZXRUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVUb2tlbjogZGVsZXRlVG9rZW5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbkluID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBjcmVkZW50aWFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLl9jcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5zaWduT3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlci5kZWxldGVUb2tlbigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmdldExvZ0luZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB0aGlzLl9jcmVkZW50aWFscyxcclxuICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLl90b2tlbktlZXBlci5nZXRUb2tlbigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFVzZXIoYmFja2VuZFBhdGhzQ29uc3RhbnQuYXV0aCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCb29raW5nQ29udHJvbGxlcicsIEJvb2tpbmdDb250cm9sbGVyKTtcclxuXHJcbiAgICBCb29raW5nQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGVQYXJhbXMnLCAncmVzb3J0U2VydmljZScsICckc3RhdGUnLCAnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdDb250cm9sbGVyKCRzdGF0ZVBhcmFtcywgcmVzb3J0U2VydmljZSwgJHN0YXRlLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgdGhpcy5ob3RlbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe1xyXG4gICAgICAgICAgICAgICAgcHJvcDogJ19pZCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJHN0YXRlUGFyYW1zLmhvdGVsSWR9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG90ZWwgPSByZXNwb25zZVswXTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5ob3RlbCA9ICRzdGF0ZVBhcmFtcy5ob3RlbDtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRIb3RlbEltYWdlc0NvdW50ID0gZnVuY3Rpb24oY291bnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBcnJheShjb3VudCAtIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5vcGVuSW1hZ2UgPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICAgICAgbGV0IGltZ1NyYyA9ICRldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgaWYgKGltZ1NyYykge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCb29raW5nRm9ybUNvbnRyb2xsZXInLCBCb29raW5nRm9ybUNvbnRyb2xsZXIpXHJcblxyXG4gICAgZnVuY3Rpb24gQm9va2luZ0Zvcm1Db250cm9sbGVyKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAgICAgdGhpcy5mb3JtID0ge1xyXG4gICAgICAgICAgICBkYXRlOiAncGljayBkYXRlJyxcclxuICAgICAgICAgICAgZ3Vlc3RzOiAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gNSA/IHRoaXMuZm9ybS5ndWVzdHMrKyA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZUd1ZXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcm0uZ3Vlc3RzICE9PSAxID8gdGhpcy5mb3JtLmd1ZXN0cy0tIDogdGhpcy5mb3JtLmd1ZXN0c1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnZGF0ZVBpY2tlcicsIGRhdGVQaWNrZXJEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJEaXJlY3RpdmUoJGludGVydmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxyXG4gICAgICAgICAgICAvKnNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsOiAnPSdcclxuICAgICAgICAgICAgfSwqL1xyXG4gICAgICAgICAgICBsaW5rOiBkYXRlUGlja2VyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJEaXJlY3RpdmVMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICAvL3RvZG8gYWxsXHJcbiAgICAgICAgICAgICQoJ1tkYXRlLXBpY2tlcl0nKS5kYXRlUmFuZ2VQaWNrZXIoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGU6IG5ldyBEYXRlKCkuc2V0RnVsbFllYXIobmV3IERhdGUoKS5nZXRGdWxsWWVhcigpICsgMSksXHJcbiAgICAgICAgICAgICAgICB9KS5iaW5kKCdkYXRlcGlja2VyLWZpcnN0LWRhdGUtc2VsZWN0ZWQnLCBmdW5jdGlvbihldmVudCwgb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBmaXJzdCBkYXRlIGlzIHNlbGVjdGVkICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZpcnN0LWRhdGUtc2VsZWN0ZWQnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2hhbmdlJyxmdW5jdGlvbihldmVudCxvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHNlY29uZCBkYXRlIGlzIHNlbGVjdGVkICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoYW5nZScsb2JqKTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLiRzZXRWaWV3VmFsdWUob2JqLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBvYmogd2lsbCBiZSBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTE6IChEYXRlIG9iamVjdCBvZiB0aGUgZWFybGllciBkYXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTI6IChEYXRlIG9iamVjdCBvZiB0aGUgbGF0ZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy9cdCBcdHZhbHVlOiBcIjIwMTMtMDYtMDUgdG8gMjAxMy0wNi0wN1wiXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWFwcGx5JyxmdW5jdGlvbihldmVudCxvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHVzZXIgY2xpY2tzIG9uIHRoZSBhcHBseSBidXR0b24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXBwbHknLG9iaik7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2xvc2UnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGJlZm9yZSBkYXRlIHJhbmdlIHBpY2tlciBjbG9zZSBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYmVmb3JlIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2xvc2VkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBjbG9zZSBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1vcGVuJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgb3BlbiBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYmVmb3JlIG9wZW4nKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1vcGVuZWQnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGFmdGVyIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIG9wZW4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTWFwJywgYWh0bE1hcERpcmVjdGl2ZSk7XG5cbiAgICBhaHRsTWFwRGlyZWN0aXZlLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnXTtcblxuICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmUocmVzb3J0U2VydmljZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImRlc3RpbmF0aW9uc19fbWFwXCI+PC9kaXY+JyxcbiAgICAgICAgICAgIGxpbms6IGFodGxNYXBEaXJlY3RpdmVMaW5rXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XG4gICAgICAgICAgICBsZXQgaG90ZWxzID0gbnVsbDtcblxuICAgICAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIGNyZWF0ZU1hcCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU1hcCgpIHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xuICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBtYXBTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICBtYXBTY3JpcHQuc3JjID0gJ2h0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9qcz9rZXk9QUl6YVN5Qnh4Q0syLXVWeWw2OXduN0s2MU5QQVFEZjd5SC1qZjN3JztcbiAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcFNjcmlwdCk7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbG9jYXRpb25zID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3RlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9ucy5wdXNoKFtob3RlbHNbaV0ubmFtZSwgaG90ZWxzW2ldLl9nbWFwcy5sYXQsIGhvdGVsc1tpXS5fZ21hcHMubG5nXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgbXlMYXRMbmcgPSB7bGF0OiAtMjUuMzYzLCBsbmc6IDEzMS4wNDR9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkZXN0aW5hdGlvbnNfX21hcCcpWzBdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGljb25zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGxvY2F0aW9uc1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSg4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKHRoaXMuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qY2VudGVyaW5nKi9cbiAgICAgICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBMYXRMYW5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkdGltZW91dCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge30sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogYWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICB0aGlzLmltZ3MgPSBuZXcgQXJyYXkoMjApO1xyXG4gICAgICAgICAgICB0aGlzLmltZ3NMb2FkZWQgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub3BlbkltYWdlID0gZnVuY3Rpb24oaW1hZ2VOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VTcmMgPSAnYXNzZXRzL2ltYWdlcy9nYWxsZXJ5LycgKyBpbWFnZU5hbWUgKyAnLmpwZyc7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VTcmNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ2FodGxHYWxsZXJ5OmxvYWRlZCcpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGEsIGN0cmwpIHtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignYWh0bEdhbGxlcnk6bG9hZGVkJywgYWxpZ25JbWFnZXMpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYWxpZ25JbWFnZXMoKXtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWFzb25yeSA9IG5ldyBNYXNvbnJ5KGNvbnRhaW5lciwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5XaWR0aDogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBndXR0ZXI6ICcuZ3V0dGVyLXNpemVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiAnMC4ycycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hc29ucnkub24oJ2xheW91dENvbXBsZXRlJywgb25MYXlvdXRDb21wbGV0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hc29ucnkubGF5b3V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTGF5b3V0Q29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQoY29udGFpbmVyKS5jc3MoJ29wYWNpdHknLCAnMScpLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG5cclxuLypcclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICAgICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnJHRpbWVvdXQnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAncHJlbG9hZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsICR0aW1lb3V0LCBiYWNrZW5kUGF0aHNDb25zdGFudCwgcHJlbG9hZFNlcnZpY2UpIHsgLy90b2RvIG5vdCBvbmx5IGxvYWQgYnV0IGxpc3RTcmMgdG9vIGFjY2VwdFxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd0ZpcnN0JyxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93TmV4dCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LnRlbXBsYXRlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIGxldCBhbGxJbWFnZXNTcmMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gJHNjb3BlLnNob3dGaXJzdEltZ0NvdW50LFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudCA9ICRzY29wZS5zaG93TmV4dEltZ0NvdW50O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSBNYXRoLm1pbihzaG93Rmlyc3RJbWdDb3VudCArIHNob3dOZXh0SW1nQ291bnQsIGFsbEltYWdlc1NyYy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0FsbEltYWdlc0xvYWRlZCA9IHRoaXMuc2hvd0ZpcnN0ID49IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgLyEqJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyohL1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGxJbWFnZXNMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5zaG93Rmlyc3QpID8gdGhpcy5zaG93Rmlyc3QubGVuZ3RoID09PSB0aGlzLmltYWdlc0NvdW50OiB0cnVlXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsaWduSW1hZ2VzID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5nYWxsZXJ5IGltZycpLmxlbmd0aCA8IHNob3dGaXJzdEltZ0NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29vcHMnKTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dCh0aGlzLmFsaWduSW1hZ2VzLCAwKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsaWduSW1hZ2VzKCk7XHJcblxyXG4gICAgICAgICAgICBfZ2V0SW1hZ2VTb3VyY2VzKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWxsSW1hZ2VzU3JjID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dGaXJzdCA9IGFsbEltYWdlc1NyYy5zbGljZSgwLCBzaG93Rmlyc3RJbWdDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc0NvdW50ID0gYWxsSW1hZ2VzU3JjLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIC8vJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBlbGVtLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltZ1NyYyA9IGV2ZW50LnRhcmdldC5zcmM7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGltZ1NyYykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgIC8hKiB2YXIgJGltYWdlcyA9ICQoJy5nYWxsZXJ5IGltZycpO1xyXG4gICAgICAgICAgICB2YXIgbG9hZGVkX2ltYWdlc19jb3VudCA9IDA7KiEvXHJcbiAgICAgICAgICAgIC8hKiRzY29wZS5hbGlnbkltYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJGltYWdlcy5sb2FkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZF9pbWFnZXNfY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZF9pbWFnZXNfY291bnQgPT0gJGltYWdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3NldEltYWdlQWxpZ21lbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyAvLyB0b2RvXHJcbiAgICAgICAgICAgIH07KiEvXHJcblxyXG4gICAgICAgICAgICAvLyRzY29wZS5hbGlnbkltYWdlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcyhjYikge1xyXG4gICAgICAgICAgICBjYihwcmVsb2FkU2VydmljZS5nZXRQcmVsb2FkQ2FjaGUoJ2dhbGxlcnknKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfc2V0SW1hZ2VBbGlnbWVudCgpIHsgLy90b2RvIGFyZ3VtZW50cyBuYW1pbmcsIGVycm9yc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlndXJlcyA9ICQoJy5nYWxsZXJ5X19maWd1cmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBnYWxsZXJ5V2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNsb3Nlc3QoJy5nYWxsZXJ5JykuY3NzKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jc3MoJ3dpZHRoJykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjb2x1bW5zQ291bnQgPSBNYXRoLnJvdW5kKGdhbGxlcnlXaWR0aCAvIGltYWdlV2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnNIZWlnaHQgPSBuZXcgQXJyYXkoY29sdW1uc0NvdW50ICsgMSkuam9pbignMCcpLnNwbGl0KCcnKS5tYXAoKCkgPT4ge3JldHVybiAwfSksIC8vdG9kbyBkZWwgam9pbi1zcGxpdFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0ID0gY29sdW1uc0hlaWdodC5zbGljZSgwKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAkKGZpZ3VyZXMpLmNzcygnbWFyZ2luLXRvcCcsICcwJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGZpZ3VyZXMsIGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiBjb2x1bW5zQ291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKCdtYXJnaW4tdG9wJywgLShNYXRoLm1heC5hcHBseShudWxsLCBjb2x1bW5zSGVpZ2h0KSAtIGNvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0pICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2N1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKSArIGNvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2x1bW5Qb2ludGVyID09PSBjb2x1bW5zQ291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnNIZWlnaHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnNIZWlnaHRbaV0gKz0gY3VycmVudENvbHVtbnNIZWlnaHRbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4vISogICAgICAgIC5jb250cm9sbGVyKCdHYWxsZXJ5Q29udHJvbGxlcicsIEdhbGxlcnlDb250cm9sbGVyKTtcclxuXHJcbiAgICBHYWxsZXJ5Q29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICB2YXIgaW1hZ2VzU3JjID0gX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGltYWdlc1NyYylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyohL1xyXG5cclxuLyEqXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdDogXCI9YWh0bEdhbGxlcnlTaG93Rmlyc3RcIixcclxuICAgICAgICAgICAgICAgIHNob3dBZnRlcjogXCI9YWh0bEdhbGxlcnlTaG93QWZ0ZXJcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKCl7fVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmEgPSAxMztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmEpO1xyXG4gICAgICAgICAgICAvISp2YXIgYWxsSW1hZ2VzU3JjO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLnNob3dGaXJzdEltYWdlc1NyYyA9IFsnMTIzJ107XHJcblxyXG4gICAgICAgICAgICBfZ2V0SW1hZ2VTb3VyY2VzKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgYWxsSW1hZ2VzU3JjID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH0pKiEvXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcbn0pKCk7KiEvXHJcbiovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXInLCBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcik7XHJcblxyXG4gICAgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICdndWVzdGNvbW1lbnRzU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKCRyb290U2NvcGUsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy53cml0ZUNvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJGxvZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLmdldEd1ZXN0Q29tbWVudHMoKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLnNlbmRDb21tZW50KHRoaXMuZm9ybURhdGEpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2goeyduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lLCAnY29tbWVudCc6IHRoaXMuZm9ybURhdGEuY29tbWVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1EYXRhID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcigncmV2ZXJzZScsIHJldmVyc2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJldmVyc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIC8vdG8gZXJyb3JzXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtcy5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdndWVzdGNvbW1lbnRzU2VydmljZScsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKTtcclxuXHJcbiAgICBndWVzdGNvbW1lbnRzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRHdWVzdENvbW1lbnRzOiBnZXRHdWVzdENvbW1lbnRzLFxyXG4gICAgICAgICAgICBzZW5kQ29tbWVudDogc2VuZENvbW1lbnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRHdWVzdENvbW1lbnRzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbW1lbnQoY29tbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF1dGhTZXJ2aWNlLmdldExvZ0luZm8oKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlcixcclxuICAgICAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTtcclxuXHJcbiAgICBIZWFkZXJDb250cm9sbGVyLiRpbmplY3QgPSBbJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcihhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2lnbk91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbk91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsIGFodGxIZWFkZXIpO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9nJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgkdGltZW91dCwgJGxvZykge1xyXG5cdFx0ZnVuY3Rpb24gVUl0cmFuc2l0aW9ucyhjb250YWluZXIpIHtcclxuXHRcdFx0aWYgKCEkKGNvbnRhaW5lcikubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50ICcke2NvbnRhaW5lcn0nIG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmFuaW1hdGVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fY29udGFpbmVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bGV0IHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRFbGVtZW50cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke3RhcmdldEVsZW1lbnRzUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIHRvKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRsZXQgYW5pbWF0ZU9wdGlvbnMgPSB7fTtcclxuXHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayA9IGZ1bmN0aW9uKGVsZW1lbnRUcmlnZ2VyUXVlcnksIGVsZW1lbnRPblF1ZXJ5KSB7XHJcblx0XHRcdGlmICghJChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5sZW5ndGggfHwgISQoZWxlbWVudE9uUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2VsZW1lbnRUcmlnZ2VyUXVlcnl9ICR7ZWxlbWVudE9uUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWxlbWVudE9uUXVlcnkpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnMoaGVhZGVyUXVlcnksIGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdFVJdHJhbnNpdGlvbnMuY2FsbCh0aGlzLCBjb250YWluZXJRdWVyeSk7XHJcblxyXG5cdFx0XHRpZiAoISQoaGVhZGVyUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2hlYWRlclF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnRGaXhRdWVyeSwgZml4Q2xhc3NOYW1lLCB1bmZpeENsYXNzTmFtZSwgb3B0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5faGVhZGVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBmaXhFbGVtZW50ID0gJChlbGVtZW50Rml4UXVlcnkpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykuaW5uZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLnJlbW92ZUNsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b25XaWR0aENoYW5nZUhhbmRsZXIoKTtcclxuXHRcdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBvbldpZHRoQ2hhbmdlSGFuZGxlcik7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcik7XHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoKSB7XHJcblx0XHRcdGxldCBoZWFkZXIgPSBuZXcgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCcubC1oZWFkZXInLCAnLm5hdl9faXRlbS1jb250YWluZXInKTtcclxuXHJcblx0XHRcdGhlYWRlci5hbmltYXRlVHJhbnNpdGlvbihcclxuXHRcdFx0XHQnLnN1Yi1uYXYnLCB7XHJcblx0XHRcdFx0XHRjc3NFbnVtZXJhYmxlUnVsZTogJ2hlaWdodCcsXHJcblx0XHRcdFx0XHRkZWxheTogMzAwfSlcclxuXHRcdFx0XHQucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrKFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtdHJpZ2dlcl0nLFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtb25dJylcclxuXHRcdFx0XHQuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHRcdCdqc19uYXYtLWZpeGVkJyxcclxuXHRcdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdFx0b25NYXhXaW5kb3dXaWR0aDogODUwfSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcik7XHJcblxyXG4gICAgSG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKHJlc29ydFNlcnZpY2UpIHtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7cHJvcDogJ190cmVuZCcsIHZhbHVlOiB0cnVlfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgLy90b2RvIGlmIG5vdCByZXNwb25zZVxyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTW9kYWwnLCBhaHRsTW9kYWxEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgcmVwbGFjZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxNb2RhbERpcmVjdGl2ZUxpbmssXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL21vZGFsL21vZGFsLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3cgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ21vZGFsT3BlbicsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAnaW1hZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNyYyA9IGRhdGEuc3JjO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LmltZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7Ly90b2RvIGFwcGx5P1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ21hcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5tYXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ29vZ2xlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBteUxhdGxuZyA9IHtsYXQ6IGRhdGEuY29vcmQubGF0LCBsbmc6IGRhdGEuY29vcmQubG5nfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IG15TGF0bG5nLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBteUxhdGxuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIodGhpcy5nZXRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2VEaWFsb2cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKG5hbWUsIGNvb3JkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIFtuYW1lLCBjb29yZC5sYXQsIGNvb3JkLmxuZ11cclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWxNYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge2xhdDogY29vcmQubGF0LCBsbmc6IGNvb3JkLmxuZ30sXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhaG90ZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuLypcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvISpjZW50ZXJpbmcqIS9cclxuICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzICgpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kYWxNYXAuZml0Qm91bmRzKGJvdW5kcyk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignYWN0aXZpdGllc0ZpbHRlcicsIGFjdGl2aXRpZXNGaWx0ZXIpO1xyXG5cclxuICAgIGFjdGl2aXRpZXNGaWx0ZXIuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFjdGl2aXRpZXNGaWx0ZXIoJGxvZywgZmlsdGVyc1NlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyZywgX3N0cmluZ0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc3RyaW5nTGVuZ3RoID0gcGFyc2VJbnQoX3N0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4oc3RyaW5nTGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBDYW4ndCBwYXJzZSBhcmd1bWVudDogJHtfc3RyaW5nTGVuZ3RofWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZ1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXJnLmpvaW4oJywgJykuc2xpY2UoMCwgc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuc2xpY2UoMCwgcmVzdWx0Lmxhc3RJbmRleE9mKCcsJykpICsgJy4uLidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jlc29ydENvbnRyb2xsZXInLCBSZXNvcnRDb250cm9sbGVyKTtcclxuXHJcbiAgICBSZXNvcnRDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnLCAnJGZpbHRlcicsICckc2NvcGUnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUmVzb3J0Q29udHJvbGxlcihyZXNvcnRTZXJ2aWNlLCAkZmlsdGVyLCAkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICAgIGxldCBjdXJyZW50RmlsdGVycyA9ICRzdGF0ZS4kY3VycmVudC5kYXRhLmN1cnJlbnRGaWx0ZXJzOyAvLyB0ZW1wXHJcblxyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuaW5pdEZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZSA9IGZ1bmN0aW9uKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSA9IGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5wdXNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uc3BsaWNlKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlciksIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBob3RlbHMgPSB7fTtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IGhvdGVscztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLmZpbHRlcnMucHJpY2UsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVycy5wcmljZSA9IFtuZXdWYWx1ZV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjdXJyZW50RmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTsgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuTWFwID0gZnVuY3Rpb24oaG90ZWxOYW1lLCBob3RlbENvb3JkLCBob3RlbCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHNob3c6ICdtYXAnLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogaG90ZWxOYW1lLFxyXG4gICAgICAgICAgICAgICAgY29vcmQ6IGhvdGVsQ29vcmRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIGRhdGEpXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdob3RlbEZpbHRlcicsIGhvdGVsRmlsdGVyKTtcclxuXHJcbiAgICBob3RlbEZpbHRlci4kaW5qZWN0ID0gWyckbG9nJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gaG90ZWxGaWx0ZXIoJGxvZywgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICBsZXQgc2F2ZWRGaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxvYWRGaWx0ZXJzOiBsb2FkRmlsdGVycyxcclxuICAgICAgICAgICAgYXBwbHlGaWx0ZXJzOiBhcHBseUZpbHRlcnMsXHJcbiAgICAgICAgICAgIGluaXRGaWx0ZXJzOiBpbml0RmlsdGVyc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRGaWx0ZXJzKCkge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRGaWx0ZXJzKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzYXZlZEZpbHRlcnMpO1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVycyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSA9IHNhdmVkRmlsdGVyc1trZXldICYmIHNhdmVkRmlsdGVyc1trZXldLmluZGV4T2YoaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXSkgIT09IC0xID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZpbHRlcnMucHJpY2UgPSB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDEwMDBcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseUZpbHRlcnMoaG90ZWxzLCBmaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIHNhdmVkRmlsdGVycyA9IGZpbHRlcnM7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaG90ZWxzLCBmdW5jdGlvbihob3RlbCkge1xyXG4gICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZmlsdGVycywgZnVuY3Rpb24oZmlsdGVyc0luR3JvdXAsIGZpbHRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXZlcnNlRmlsdGVyTWF0Y2hpbmcgPSBmYWxzZTsgLy8gZm9yIGFjdGl2aXRpZXMgYW5kIG11c3RoYXZlcyBncm91cHNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckdyb3VwID09PSAnZ3Vlc3RzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzSW5Hcm91cCA9IFtmaWx0ZXJzSW5Hcm91cFtmaWx0ZXJzSW5Hcm91cC5sZW5ndGggLSAxXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckdyb3VwID09PSAnbXVzdEhhdmVzJyB8fCBmaWx0ZXJHcm91cCA9PT0gJ2FjdGl2aXRpZXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VGaWx0ZXJNYXRjaGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbHRlcnNJbkdyb3VwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmV2ZXJzZUZpbHRlck1hdGNoaW5nICYmIGdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV2ZXJzZUZpbHRlck1hdGNoaW5nICYmICFnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXJzSW5Hcm91cFtpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hBdExlYXNlT25lRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb2NhdGlvbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwubG9jYXRpb24uY291bnRyeSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3R5cGVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnR5cGUgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXR0aW5ncyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5lbnZpcm9ubWVudCA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ211c3RIYXZlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5kZXRhaWxzW2ZpbHRlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWN0aXZpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB+aG90ZWwuYWN0aXZpdGllcy5pbmRleE9mKGZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwucHJpY2UgPj0gZmlsdGVyLm1pbiAmJiBob3RlbC5wcmljZSA8PSBmaWx0ZXIubWF4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2d1ZXN0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5ndWVzdHMubWF4ID49ICtmaWx0ZXJbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBob3RlbHMuZmlsdGVyKChob3RlbCkgPT4gIWhvdGVsLl9oaWRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3Njcm9sbFRvVG9wJywgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUpO1xyXG5cclxuICAgIHNjcm9sbFRvVG9wRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciwgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgaWYgKDEpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAkLnRyaW0oYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZSgwLCBhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzY3JvbGwtdG8tdG9wLWNvbmZpZyBpcyBub3QgZGVmaW5lZGApO1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yIHx8ICdodG1sLCBib2R5JztcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW0pLm9uKGF0dHIuc2Nyb2xsVG9Ub3AsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogaGVpZ2h0IH0sIFwic2xvd1wiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFNlYXJjaENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFNlYXJjaENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlJywgJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzdGF0ZSwgcmVzb3J0U2VydmljZSkge1xyXG4gICAgICAgIHRoaXMucXVlcnkgPSAkc3RhdGUucGFyYW1zLnF1ZXJ5O1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMucXVlcnkpO1xyXG4gICAgICAgIHRoaXMuaG90ZWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2guY2FsbCh0aGlzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZWFyY2goKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJzZWRRdWVyeSA9ICQudHJpbSh0aGlzLnF1ZXJ5KS5yZXBsYWNlKC9cXHMrL2csICcgJykuc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuaG90ZWxzLCAoaG90ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaG90ZWwpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhvdGVsQ29udGVudCA9IGhvdGVsLm5hbWUgKyBob3RlbC5sb2NhdGlvbi5jb3VudHJ5ICtcclxuICAgICAgICAgICAgICAgICAgICBob3RlbC5sb2NhdGlvbi5yZWdpb24gKyBob3RlbC5kZXNjICsgaG90ZWwuZGVzY0xvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhob3RlbENvbnRlbnQpXHJcbiAgICAgICAgICAgICAgICAvL2ZvciAoKVxyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoZXNDb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyc2VkUXVlcnkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcVJlZ0V4cCA9IG5ldyBSZWdFeHAocGFyc2VkUXVlcnlbaV0sICdnaScpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXNDb3VudGVyICs9IChob3RlbENvbnRlbnQubWF0Y2gocVJlZ0V4cCkgfHwgW10pLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlc0NvdW50ZXIgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2hvdGVsLl9pZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaG90ZWwuX2lkXS5tYXRjaGVzQ291bnRlciA9IG1hdGNoZXNDb3VudGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IHRoaXMuaG90ZWxzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChob3RlbCkgPT4gcmVzdWx0W2hvdGVsLl9pZF0pXHJcbiAgICAgICAgICAgICAgICAubWFwKChob3RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdGVsLl9tYXRjaGVzID0gcmVzdWx0W2hvdGVsLl9pZF0ubWF0Y2hlc0NvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2VhcmNoUmVzdWx0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsVG9wMycsIGFodGxUb3AzRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsVG9wM0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyd0b3AzU2VydmljZScsICdob3RlbERldGFpbHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxUb3AzRGlyZWN0aXZlKHRvcDNTZXJ2aWNlLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxUb3AzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndG9wMycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC90b3AzLnRlbXBsYXRlLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bFRvcDNDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICB0aGlzLmRldGFpbHMgPSBob3RlbERldGFpbHNDb25zdGFudC5tdXN0SGF2ZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnRUeXBlID0gJGF0dHJzLmFodGxUb3AzdHlwZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRJbWdTcmMgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvaW1hZ2VzLycgKyB0aGlzLnJlc29ydFR5cGUgKyAnLycgKyB0aGlzLnJlc29ydFtpbmRleF0uaW1nLmZpbGVuYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzUmVzb3J0SW5jbHVkZURldGFpbCA9IGZ1bmN0aW9uKGl0ZW0sIGRldGFpbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGFpbENsYXNzTmFtZSA9ICd0b3AzX19kZXRhaWwtY29udGFpbmVyLS0nICsgZGV0YWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSA9ICFpdGVtLmRldGFpbHNbZGV0YWlsXSA/ICcgdG9wM19fZGV0YWlsLWNvbnRhaW5lci0taGFzbnQnIDogJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFpbENsYXNzTmFtZSArIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdG9wM1NlcnZpY2UuZ2V0VG9wM1BsYWNlcyh0aGlzLnJlc29ydFR5cGUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5yZXNvcnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCd0b3AzU2VydmljZScsIHRvcDNTZXJ2aWNlKTtcclxuXHJcbiAgICB0b3AzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvcDNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvcDNQbGFjZXM6IGdldFRvcDNQbGFjZXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUb3AzUGxhY2VzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LnRvcDMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuYW5pbWF0aW9uKCcuc2xpZGVyX19pbWcnLCBhbmltYXRpb25GdW5jdGlvbik7XHJcblxyXG5cdGZ1bmN0aW9uIGFuaW1hdGlvbkZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0YmVmb3JlQWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHRsZXQgc2xpZGluZ0RpcmVjdGlvbiA9IGVsZW1lbnQuc2NvcGUoKS5zbGlkaW5nRGlyZWN0aW9uO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzEnKTtcclxuXHJcblx0XHRcdFx0aWYoc2xpZGluZ0RpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICcxMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnLTIwMCUnfSwgNTAwLCBkb25lKTsgLy8yMDA/ICQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJywgYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUGFnZXMnLCBQYWdlcyk7XHJcblxyXG4gICAgUGFnZXMuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUGFnZXMoJHNjb3BlKSB7XHJcbiAgICAgICAgY29uc3QgaG90ZWxzUGVyUGFnZSA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dGcm9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5jdXJyZW50UGFnZSAtIDEpICogaG90ZWxzUGVyUGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiArK3RoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93UHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLS10aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2UgKyAxO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWdlc1RvdGFsLmxlbmd0aCA9PT0gdGhpcy5jdXJyZW50UGFnZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNGaXJzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2UgPT09IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCAoZXZlbnQsIHNob3dIb3RlbENvdW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IG5ldyBBcnJheShNYXRoLmNlaWwoc2hvd0hvdGVsQ291bnQgLyBob3RlbHNQZXJQYWdlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignc2hvd0Zyb20nLCBzaG93RnJvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0Zyb20oKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBzdGFydFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnNsaWNlKHN0YXJ0UG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxQcmljZVNsaWRlcicsIHByaWNlU2xpZGVyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBwcmljZVNsaWRlckRpcmVjdGl2ZS4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiBcIkBcIixcclxuICAgICAgICAgICAgICAgIG1heDogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0U2xpZGVyOiAnPScsXHJcbiAgICAgICAgICAgICAgICByaWdodFNsaWRlcjogJz0nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5odG1sJyxcclxuICAgICAgICAgICAgbGluazogcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rKCRzY29wZSwgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmxlZnRTbGlkZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmlnaHRTbGlkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIubWF4ID0gMTU7Ki9cclxuICAgICAgICAgICAgbGV0IHJpZ2h0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVBcmVhV2lkdGggPSBwYXJzZUludCgkKCcuc2xpZGUnKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVQZXJTdGVwID0gJHNjb3BlLm1heCAvIChzbGlkZUFyZWFXaWR0aCAtIDIwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5taW4gPSBwYXJzZUludCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJHNjb3BlLm1heCA9IHBhcnNlSW50KCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIHJpZ2h0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gc2xpZGVBcmVhV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSArIDIwLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gMCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0RHJhZyhkcmFnRWxlbSwgaW5pdFBvc2l0aW9uLCBtYXhQb3NpdGlvbiwgbWluUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzaGlmdDtcclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2Vkb3duJywgYnRuT25Nb3VzZURvd24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSBldmVudC5wYWdlWDtcclxuICAgICAgICAgICAgICAgICAgICBpbml0UG9zaXRpb24gPSBwYXJzZUludChkcmFnRWxlbS5jc3MoJ2xlZnQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkb2NPbk1vdXNlTW92ZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbkxlc3NUaGFuTWF4ID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA8PSBtYXhQb3NpdGlvbigpIC0gMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uR3JhdGVyVGhhbk1pbiA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPj0gbWluUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uTGVzc1RoYW5NYXggJiYgcG9zaXRpb25HcmF0ZXJUaGFuTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdFbGVtLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIGluaXRQb3NpdGlvbiAtIGV2ZW50LnBhZ2VYICsgc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdkcmFnc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQcmljZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld01pbiA9IH5+KHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF4ID0gfn4ocGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKG5ld01pbik7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKG5ld01heCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0QnRuLmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRCdG4uY3NzKCdsZWZ0JylcclxuICAgICAgICAgICAgICAgICAgICB9KSovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0U2xpZGVycyhidG4sIG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1Bvc3Rpb24gPSBuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcDtcclxuICAgICAgICAgICAgICAgICAgICBidG4uY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidG4uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwID4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpIC0gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMobGVmdEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4Jykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPiAkc2NvcGUubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdWYWx1ZSwkc2NvcGUubWF4ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPCBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSArIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKHJpZ2h0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlbWl0KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZWZ0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEzKTsqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdG9kbyBpZTggYnVnIGZpeFxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnaWU4JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygrc2xpZGVBcmVhV2lkdGggLSArbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsICtzbGlkZUFyZWFXaWR0aCAtIHBhcnNlSW50KG5ld1ZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFNsaWRlT25DbGljaycsIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBsZXQgc2xpZGVFbWl0RWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1lbWl0XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNsaWRlRW1pdEVsZW1lbnRzLm9uKCdjbGljaycsIHNsaWRlRW1pdE9uQ2xpY2spO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2xpZGVFbWl0T25DbGljaygpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzbGlkZU9uRWxlbWVudCA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICcnICYmIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBXcm9uZyBpbml0IHZhbHVlIGZvciAnc2xpZGUtb24nIGF0dHJpYnV0ZSwgc2hvdWxkIGJlICcnIG9yICdjbG9zZWQnLmApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVVcCgnc2xvdycsIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnY2xvc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlRG93bignc2xvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2xpZGVUb2dnbGVFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uLXRvZ2dsZV0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHNsaWRlVG9nZ2xlRWxlbWVudHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCQodGhpcykuYXR0cignc2xpZGUtb24tdG9nZ2xlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iXX0=
