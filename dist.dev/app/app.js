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

    run.$inject = ['$rootScope', 'backendPathsConstant', /*'preloadService',*/'$window', '$timeout'];

    function run($rootScope, backendPathsConstant, /*preloadService,*/$window, $timeout) {
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
            $timeout(function () {
                return $('body').scrollTop(0);
            }, 0);
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
            link: ahtlGalleryDirectiveLink
        };

        function ahtlGalleryDirectiveLink($scope) {
            var imagesInGallery = 20;

            for (var i = 0; i < 20; i++) {
                var img = $('<div class="item"><img src="assets/images/gallery/preview' + (i + 1) + '.jpg" width="300"></div>');
                img.find('img').on('load', imageLoaded).on('click', imageClicked.bind(null, i));
                $('[gallery-container]').append(img);
            }

            var imagesLoaded = 0;
            function imageLoaded() {
                imagesLoaded++;

                if (imagesLoaded === imagesInGallery) {
                    console.log('aligned');
                    alignImages();
                }
            }

            function imageClicked(image) {
                var imageSrc = 'assets/images/gallery/' + ++image + '.jpg';

                $scope.$apply(function () {
                    $scope.$root.$broadcast('modalOpen', {
                        show: 'image',
                        src: imageSrc
                    });
                });
            }

            function alignImages() {

                var container = document.querySelector('.container');

                var masonry = new Masonry(container, {
                    columnWidth: '.item',
                    itemSelector: '.item',
                    gutter: '.gutter-sizer',
                    transitionDuration: '0.2s'
                });

                masonry.on('layoutComplete', onLayoutComplete);

                masonry.layout();

                function onLayoutComplete() {
                    $timeout(function () {
                        return $(container).css('opacity', '1');
                    }, 0);
                }
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
                        mapTypeId: 'roadmap',
                        zoom: 8,
                        center: myLatlng
                    });

                    var marker = new google.maps.Marker({
                        position: myLatlng,
                        map: map,
                        title: data.name
                    });

                    marker.addListener('click', function () {
                        map.setZoom(12);
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

    ahtlTop3Directive.$inject = ['resortService', 'hotelDetailsConstant'];

    function ahtlTop3Directive(resortService, hotelDetailsConstant) {
        AhtlTop3Controller.$inject = ["$scope", "$element", "$attrs"];
        return {
            restrict: 'E',
            controller: AhtlTop3Controller,
            controllerAs: 'top3',
            templateUrl: 'app/partials/top/top3.template.html'
        };

        function AhtlTop3Controller($scope, $element, $attrs) {
            var _this = this;

            this.details = hotelDetailsConstant.mustHaves;
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

            resortService.getResort({ prop: 'type', value: this.resortType }).then(function (response) {
                _this.resort = response;

                if (_this.resortType === 'Hotel') {
                    _this.resort = _this.resort.filter(function (hotel) {
                        return hotel._showInTop === true;
                    });
                }
            });
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

    angular.module('ahotelApp').constant('sliderImgPathConstant', ['assets/images/slider/slider1.jpg', 'assets/images/slider/slider2.jpg', 'assets/images/slider/slider3.jpg', 'assets/images/slider/slider4.jpg', 'assets/images/slider/slider5.jpg', 'assets/images/slider/slider6.jpg']);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsImdsb2JhbHMvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy9hdXRoL2F1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvYm9va2luZy9ib29raW5nLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuZm9ybS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYm9va2luZy9kYXRlUGlja2VyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvbW9kYWwvbW9kYWwuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5hY3Rpdml0aWVzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaG90ZWwuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5zY3JvbGx0b1RvcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5hbmltYXRpb24uanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXJQYXRoLmNvbnN0YW50LmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcGFnZXMvcGFnZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3ByaWNlU2xpZGVyL3ByaWNlU2xpZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9zbGlkZU9uQ2xpY2svc2xpZGVPbkNsaWNrLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJHByb3ZpZGUiLCJkZWNvcmF0b3IiLCIkZGVsZWdhdGUiLCIkd2luZG93IiwibG9nSGlzdG9yeSIsIndhcm4iLCJlcnIiLCJsb2ciLCJtZXNzYWdlIiwiX2xvZ1dhcm4iLCJwdXNoIiwiYXBwbHkiLCJfbG9nRXJyIiwiZXJyb3IiLCJuYW1lIiwic3RhY2siLCJFcnJvciIsInNlbmRPblVubG9hZCIsIm9uYmVmb3JldW5sb2FkIiwibGVuZ3RoIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5IiwiJGluamVjdCIsIiRzdGF0ZVByb3ZpZGVyIiwiJHVybFJvdXRlclByb3ZpZGVyIiwib3RoZXJ3aXNlIiwic3RhdGUiLCJ1cmwiLCJ0ZW1wbGF0ZVVybCIsInBhcmFtcyIsImRhdGEiLCJjdXJyZW50RmlsdGVycyIsInJ1biIsIiRyb290U2NvcGUiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsIiR0aW1lb3V0IiwiJGxvZ2dlZCIsIiRzdGF0ZSIsImN1cnJlbnRTdGF0ZU5hbWUiLCJjdXJyZW50U3RhdGVQYXJhbXMiLCJzdGF0ZUhpc3RvcnkiLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsImZyb21TdGF0ZSIsIiQiLCJzY3JvbGxUb3AiLCJwcm92aWRlciIsInByZWxvYWRTZXJ2aWNlIiwibWV0aG9kIiwiYWN0aW9uIiwidGltZW91dCIsIiRnZXQiLCIkaHR0cCIsInByZWxvYWRDYWNoZSIsImxvZ2dlciIsImNvbnNvbGUiLCJkZWJ1ZyIsInByZWxvYWRJbWFnZXMiLCJwcmVsb2FkTmFtZSIsImltYWdlcyIsImltYWdlc1NyY0xpc3QiLCJzcmMiLCJwcmVsb2FkIiwidGhlbiIsInJlc3BvbnNlIiwiYmluZCIsImkiLCJpbWFnZSIsIkltYWdlIiwib25sb2FkIiwiZSIsIm9uZXJyb3IiLCJnZXRQcmVsb2FkIiwiZ2V0UHJlbG9hZENhY2hlIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImdhbGxlcnkiLCJndWVzdGNvbW1lbnRzIiwiaG90ZWxzIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJHEiLCJtb2RlbCIsImdldFJlc29ydCIsImZpbHRlciIsIndoZW4iLCJhcHBseUZpbHRlciIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJob3RlbCIsInByb3AiLCJ2YWx1ZSIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsInNpZ25JbiIsInVzZXIiLCJwcmV2aW91c1N0YXRlIiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsIl9jcmVkZW50aWFscyIsIl9vblJlc29sdmUiLCJzdGF0dXMiLCJ0b2tlbiIsIl90b2tlbktlZXBlciIsInNhdmVUb2tlbiIsIl9vblJlamVjdGVkIiwiX3Rva2VuIiwiZ2V0VG9rZW4iLCJkZWxldGVUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwic2lnbk91dCIsImdldExvZ0luZm8iLCJCb29raW5nQ29udHJvbGxlciIsIiRzdGF0ZVBhcmFtcyIsImxvYWRlZCIsImhvdGVsSWQiLCJnZXRIb3RlbEltYWdlc0NvdW50IiwiY291bnQiLCJBcnJheSIsIm9wZW5JbWFnZSIsIiRldmVudCIsImltZ1NyYyIsInRhcmdldCIsIiRicm9hZGNhc3QiLCJzaG93IiwiQm9va2luZ0Zvcm1Db250cm9sbGVyIiwiZm9ybSIsImRhdGUiLCJhZGRHdWVzdCIsInJlbW92ZUd1ZXN0Iiwic3VibWl0IiwiZGlyZWN0aXZlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZSIsIiRpbnRlcnZhbCIsInJlcXVpcmUiLCJsaW5rIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCJkYXRlUmFuZ2VQaWNrZXIiLCJsYW5ndWFnZSIsInN0YXJ0RGF0ZSIsIkRhdGUiLCJlbmREYXRlIiwic2V0RnVsbFllYXIiLCJnZXRGdWxsWWVhciIsIm9iaiIsIiRzZXRWaWV3VmFsdWUiLCIkcmVuZGVyIiwiJGFwcGx5IiwiYWh0bE1hcERpcmVjdGl2ZSIsInJlc3RyaWN0IiwidGVtcGxhdGUiLCJhaHRsTWFwRGlyZWN0aXZlTGluayIsImVsZW0iLCJhdHRyIiwiY3JlYXRlTWFwIiwid2luZG93IiwiZ29vZ2xlIiwiaW5pdE1hcCIsIm1hcFNjcmlwdCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsIl9nbWFwcyIsImxhdCIsImxuZyIsIm15TGF0TG5nIiwibWFwIiwibWFwcyIsIk1hcCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJzY3JvbGx3aGVlbCIsImljb25zIiwiYWhvdGVsIiwiaWNvbiIsIm1hcmtlciIsIk1hcmtlciIsInRpdGxlIiwicG9zaXRpb24iLCJMYXRMbmciLCJhZGRMaXN0ZW5lciIsInNldFpvb20iLCJzZXRDZW50ZXIiLCJnZXRQb3NpdGlvbiIsImJvdW5kcyIsIkxhdExuZ0JvdW5kcyIsIkxhdExhbmciLCJleHRlbmQiLCJmaXRCb3VuZHMiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZSIsImFodGxHYWxsZXJ5RGlyZWN0aXZlTGluayIsImltYWdlc0luR2FsbGVyeSIsImltZyIsImZpbmQiLCJvbiIsImltYWdlTG9hZGVkIiwiaW1hZ2VDbGlja2VkIiwiYXBwZW5kIiwiaW1hZ2VzTG9hZGVkIiwiYWxpZ25JbWFnZXMiLCJpbWFnZVNyYyIsIiRyb290IiwiY29udGFpbmVyIiwicXVlcnlTZWxlY3RvciIsIm1hc29ucnkiLCJNYXNvbnJ5IiwiY29sdW1uV2lkdGgiLCJpdGVtU2VsZWN0b3IiLCJndXR0ZXIiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJvbkxheW91dENvbXBsZXRlIiwibGF5b3V0IiwiY3NzIiwiR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIiLCJndWVzdGNvbW1lbnRzU2VydmljZSIsImNvbW1lbnRzIiwib3BlbkZvcm0iLCJzaG93UGxlYXNlTG9naU1lc3NhZ2UiLCJ3cml0ZUNvbW1lbnQiLCJnZXRHdWVzdENvbW1lbnRzIiwiYWRkQ29tbWVudCIsInNlbmRDb21tZW50IiwiZm9ybURhdGEiLCJjb21tZW50IiwicmV2ZXJzZSIsIml0ZW1zIiwic2xpY2UiLCJ0eXBlIiwib25SZWplY3QiLCJIZWFkZXJDb250cm9sbGVyIiwiYWh0bEhlYWRlciIsInNlcnZpY2UiLCJIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UiLCIkbG9nIiwiVUl0cmFuc2l0aW9ucyIsIl9jb250YWluZXIiLCJhbmltYXRlVHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwiYWh0bFN0aWt5SGVhZGVyIiwiaGVhZGVyIiwiSG9tZUNvbnRyb2xsZXIiLCJhaHRsTW9kYWxEaXJlY3RpdmUiLCJyZXBsYWNlIiwiYWh0bE1vZGFsRGlyZWN0aXZlTGluayIsInVuZGVmaW5lZCIsIm15TGF0bG5nIiwiY29vcmQiLCJtYXBUeXBlSWQiLCJ6b29tIiwiY2VudGVyIiwiY2xvc2VEaWFsb2ciLCJtb2RhbE1hcCIsImFjdGl2aXRpZXNGaWx0ZXIiLCJmaWx0ZXJzU2VydmljZSIsImFyZyIsIl9zdHJpbmdMZW5ndGgiLCJzdHJpbmdMZW5ndGgiLCJwYXJzZUludCIsImlzTmFOIiwicmVzdWx0Iiwiam9pbiIsImxhc3RJbmRleE9mIiwiUmVzb3J0Q29udHJvbGxlciIsIiRmaWx0ZXIiLCIkY3VycmVudCIsImZpbHRlcnMiLCJpbml0RmlsdGVycyIsIm9uRmlsdGVyQ2hhbmdlIiwiZmlsdGVyR3JvdXAiLCJzcGxpY2UiLCJpbmRleE9mIiwiYXBwbHlGaWx0ZXJzIiwiZ2V0U2hvd0hvdGVsQ291bnQiLCJyZWR1Y2UiLCJjb3VudGVyIiwiaXRlbSIsIl9oaWRlIiwiJHdhdGNoIiwibmV3VmFsdWUiLCJvcGVuTWFwIiwiaG90ZWxOYW1lIiwiaG90ZWxDb29yZCIsImhvdGVsRmlsdGVyIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCJzYXZlZEZpbHRlcnMiLCJsb2FkRmlsdGVycyIsImtleSIsIm1pbiIsIm1heCIsImZvckVhY2giLCJpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzIiwiZmlsdGVyc0luR3JvdXAiLCJtYXRjaEF0TGVhc2VPbmVGaWx0ZXIiLCJyZXZlcnNlRmlsdGVyTWF0Y2hpbmciLCJnZXRIb3RlbFByb3AiLCJsb2NhdGlvbiIsImNvdW50cnkiLCJlbnZpcm9ubWVudCIsImRldGFpbHMiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZSIsInNjcm9sbFRvVG9wRGlyZWN0aXZlTGluayIsInNlbGVjdG9yIiwiaGVpZ2h0IiwidHJpbSIsInNjcm9sbFRvVG9wQ29uZmlnIiwic2Nyb2xsVG9Ub3AiLCJTZWFyY2hDb250cm9sbGVyIiwicXVlcnkiLCJzZWFyY2giLCJwYXJzZWRRdWVyeSIsInNwbGl0IiwiaG90ZWxDb250ZW50IiwicmVnaW9uIiwiZGVzYyIsImRlc2NMb2NhdGlvbiIsIm1hdGNoZXNDb3VudGVyIiwicVJlZ0V4cCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2lkIiwic2VhcmNoUmVzdWx0cyIsIl9tYXRjaGVzIiwiYWh0bFRvcDNEaXJlY3RpdmUiLCJBaHRsVG9wM0NvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCIkZWxlbWVudCIsIiRhdHRycyIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJpbmRleCIsImZpbGVuYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsIiwiZGV0YWlsIiwiZGV0YWlsQ2xhc3NOYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lIiwiX3Nob3dJblRvcCIsImFuaW1hdGlvbiIsImFuaW1hdGlvbkZ1bmN0aW9uIiwiYmVmb3JlQWRkQ2xhc3MiLCJjbGFzc05hbWUiLCJkb25lIiwic2xpZGluZ0RpcmVjdGlvbiIsImFodGxTbGlkZXIiLCJzbGlkZXJTZXJ2aWNlIiwiYWh0bFNsaWRlckNvbnRyb2xsZXIiLCJzbGlkZXIiLCJuZXh0U2xpZGUiLCJwcmV2U2xpZGUiLCJzZXRTbGlkZSIsInNldE5leHRTbGlkZSIsInNldFByZXZTbGlkZSIsImdldEN1cnJlbnRTbGlkZSIsInNldEN1cnJlbnRTbGlkZSIsImZpeElFOHBuZ0JsYWNrQmciLCJhcnJvd3MiLCJjbGljayIsImRpc2FibGVkIiwic2xpZGVySW1nUGF0aENvbnN0YW50IiwiU2xpZGVyIiwic2xpZGVySW1hZ2VMaXN0IiwiX2ltYWdlU3JjTGlzdCIsIl9jdXJyZW50U2xpZGUiLCJnZXRJbWFnZVNyY0xpc3QiLCJnZXRJbmRleCIsInNsaWRlIiwiUGFnZXMiLCJob3RlbHNQZXJQYWdlIiwiY3VycmVudFBhZ2UiLCJwYWdlc1RvdGFsIiwic2hvd0Zyb20iLCJzaG93TmV4dCIsInNob3dQcmV2Iiwic2V0UGFnZSIsInBhZ2UiLCJpc0xhc3RQYWdlIiwiaXNGaXJzdFBhZ2UiLCJzaG93SG90ZWxDb3VudCIsIk1hdGgiLCJjZWlsIiwic3RhcnRQb3NpdGlvbiIsInByaWNlU2xpZGVyRGlyZWN0aXZlIiwibGVmdFNsaWRlciIsInJpZ2h0U2xpZGVyIiwicHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rIiwicmlnaHRCdG4iLCJsZWZ0QnRuIiwic2xpZGVBcmVhV2lkdGgiLCJ2YWx1ZVBlclN0ZXAiLCJ2YWwiLCJpbml0RHJhZyIsImRyYWdFbGVtIiwiaW5pdFBvc2l0aW9uIiwibWF4UG9zaXRpb24iLCJtaW5Qb3NpdGlvbiIsInNoaWZ0IiwiYnRuT25Nb3VzZURvd24iLCJwYWdlWCIsImRvY09uTW91c2VNb3ZlIiwiYnRuT25Nb3VzZVVwIiwicG9zaXRpb25MZXNzVGhhbk1heCIsInBvc2l0aW9uR3JhdGVyVGhhbk1pbiIsInNldFByaWNlcyIsImVtaXQiLCJuZXdNaW4iLCJuZXdNYXgiLCJzZXRTbGlkZXJzIiwiYnRuIiwibmV3UG9zdGlvbiIsImhhc0NsYXNzIiwidHJpZ2dlciIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUiLCJhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluayIsInNsaWRlRW1pdEVsZW1lbnRzIiwic2xpZGVFbWl0T25DbGljayIsInNsaWRlT25FbGVtZW50Iiwic2xpZGVVcCIsIm9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSIsInNsaWRlRG93biIsInNsaWRlVG9nZ2xlRWxlbWVudHMiLCJlYWNoIiwidG9nZ2xlQ2xhc3MiXSwibWFwcGluZ3MiOiJBQUFBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBQSxRQUNLQyxPQUFPLGFBQWEsQ0FBQyw2QkFBNEIsYUFBYTtLQUp2RTtBQ0FBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBRCxRQUNLQyxPQUFPLGFBQ1BDLG9CQUFPLFVBQVVDLFVBQVU7UUFDeEJBLFNBQVNDLFVBQVUsaUNBQVEsVUFBVUMsV0FBV0MsU0FBUztZQUNyRCxJQUFJQyxhQUFhO2dCQUNUQyxNQUFNO2dCQUNOQyxLQUFLOzs7WUFHYkosVUFBVUssTUFBTSxVQUFVQyxTQUFTOztZQUduQyxJQUFJQyxXQUFXUCxVQUFVRztZQUN6QkgsVUFBVUcsT0FBTyxVQUFVRyxTQUFT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IHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcsIFsndWkucm91dGVyJy8qLCAncHJlbG9hZCcqLywgJ25nQW5pbWF0ZScsICc3MjBrYi5zb2NpYWxzaGFyZSddKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhmdW5jdGlvbiAoJHByb3ZpZGUpIHtcclxuICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCckbG9nJywgZnVuY3Rpb24gKCRkZWxlZ2F0ZSwgJHdpbmRvdykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvZ0hpc3RvcnkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhcm46IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnI6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUubG9nID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IF9sb2dXYXJuID0gJGRlbGVnYXRlLndhcm47XHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUud2FybiA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ1dhcm4uYXBwbHkobnVsbCwgW21lc3NhZ2VdKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IF9sb2dFcnIgPSAkZGVsZWdhdGUuZXJyb3I7XHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUuZXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe25hbWU6IG1lc3NhZ2UsIHN0YWNrOiBuZXcgRXJyb3IoKS5zdGFja30pO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dFcnIuYXBwbHkobnVsbCwgW21lc3NhZ2VdKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIHNlbmRPblVubG9hZCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxvZ0hpc3RvcnkuZXJyLmxlbmd0aCAmJiAhbG9nSGlzdG9yeS53YXJuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCAnL2FwaS9sb2cnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShsb2dIaXN0b3J5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRkZWxlZ2F0ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbn0pKCk7XHJcblxyXG4vKlxyXG4gICAgICAgIC5mYWN0b3J5KCdsb2cnLCBsb2cpO1xyXG5cclxuICAgIGxvZy4kaW5qZWN0ID0gWyckd2luZG93JywgJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBsb2coJHdpbmRvdywgJGxvZykge1xyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gd2FybiguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKGFyZ3MpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJyb3dzZXJMb2cpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybihhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZXJyb3IoZSkge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IGUubmFtZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGUubWVzc2FnZSxcclxuICAgICAgICAgICAgICAgIHN0YWNrOiBlLnN0YWNrXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkbG9nLmVycm9yKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy90b2RvIGFsbCBlcnJvcnNcclxuXHJcblxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB3YXJuOiB3YXJuLFxyXG4gICAgICAgICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICAgICAgICAgIHNlbmRPblVubG9hZDogc2VuZE9uVW5sb2FkXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIi8qXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uZmlnKGNvbmZpZyk7XHJcblxyXG4gICAgY29uZmlnLiRpbmplY3QgPSBbJ3ByZWxvYWRTZXJ2aWNlUHJvdmlkZXInLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb25maWcocHJlbG9hZFNlcnZpY2VQcm92aWRlciwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICAgICAgcHJlbG9hZFNlcnZpY2VQcm92aWRlci5jb25maWcoYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSwgJ0dFVCcsICdnZXQnLCAxMDAsICd3YXJuaW5nJyk7XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuY29uZmlnKGNvbmZpZyk7XHJcblxyXG5cdGNvbmZpZy4kaW5qZWN0ID0gWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInXTtcclxuXHJcblx0ZnVuY3Rpb24gY29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuXHRcdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcclxuXHJcblx0XHQkc3RhdGVQcm92aWRlclxyXG5cdFx0XHQuc3RhdGUoJ2hvbWUnLCB7XHJcblx0XHRcdFx0dXJsOiAnLycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaG9tZS9ob21lLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYXV0aCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvYXV0aCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvYXV0aC9hdXRoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeyd0eXBlJzogJ2xvZ2luIG9yIGpvaW4nfS8qLFxyXG5cdFx0XHRcdG9uRW50ZXI6IGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XHJcblx0XHRcdFx0XHQkcm9vdFNjb3BlLiRzdGF0ZSA9IFwiYXV0aFwiO1xyXG5cdFx0XHRcdH0qL1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2J1bmdhbG93cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYnVuZ2Fsb3dzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvYnVuZ2Fsb3dzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnaG90ZWxzJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL3RvcCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvaG90ZWxzLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCd2aWxsYXMnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3ZpbGxhcycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL3ZpbGxhcy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2dhbGxlcnknLCB7XHJcblx0XHRcdFx0dXJsOiAnL2dhbGxlcnknLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2d1ZXN0Y29tbWVudHMnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2d1ZXN0Y29tbWVudHMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Rlc3RpbmF0aW9ucycsIHtcclxuXHRcdFx0XHRcdHVybDogJy9kZXN0aW5hdGlvbnMnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZGVzdGluYXRpb25zL2Rlc3RpbmF0aW9ucy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3Jlc29ydCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvcmVzb3J0JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcmVzb3J0Lmh0bWwnLFxyXG5cdFx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRcdGN1cnJlbnRGaWx0ZXJzOiB7fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdib29raW5nJywge1xyXG5cdFx0XHRcdHVybDogJy9ib29raW5nP2hvdGVsSWQnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Jvb2tpbmcvYm9va2luZy5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsnaG90ZWxJZCc6ICdob3RlbCBJZCd9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnc2VhcmNoJywge1xyXG5cdFx0XHRcdHVybDogJy9zZWFyY2g/cXVlcnknLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3NlYXJjaC9zZWFyY2guaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3F1ZXJ5JzogJ3NlYXJjaCBxdWVyeSd9XHJcblx0XHRcdH0pXHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAucnVuKHJ1bik7XHJcblxyXG4gICAgcnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnICwgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgLyoncHJlbG9hZFNlcnZpY2UnLCovICckd2luZG93JywgJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuKCRyb290U2NvcGUsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCAvKnByZWxvYWRTZXJ2aWNlLCovICR3aW5kb3csICR0aW1lb3V0KSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJHN0YXRlID0ge1xyXG4gICAgICAgICAgICBjdXJyZW50U3RhdGVOYW1lOiBudWxsLFxyXG4gICAgICAgICAgICBjdXJyZW50U3RhdGVQYXJhbXM6IG51bGwsXHJcbiAgICAgICAgICAgIHN0YXRlSGlzdG9yeTogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZS8qLCBmcm9tUGFyYW1zIHRvZG8qLyl7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZU5hbWUgPSB0b1N0YXRlLm5hbWU7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZVBhcmFtcyA9IHRvUGFyYW1zO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkucHVzaCh0b1N0YXRlLm5hbWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLyosIGZyb21QYXJhbXMgdG9kbyovKSB7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQoJ2JvZHknKS5zY3JvbGxUb3AoMCksIDApO1xyXG4gICAgICAgICAgICAvLyR0aW1lb3V0KCgpID0+ICQoJ2JvZHknKS5zY3JvbGxUb3AoMCksIDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKiR3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7IC8vdG9kbyBvbmxvYWQg77+977+977+977+977+977+977+977+9IO+/vSDvv73vv73vv73vv73vv73vv71cclxuICAgICAgICAgICAgcHJlbG9hZFNlcnZpY2UucHJlbG9hZEltYWdlcygnZ2FsbGVyeScsIHt1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksIG1ldGhvZDogJ0dFVCcsIGFjdGlvbjogJ2dldCd9KTsgLy90b2RvIGRlbCBtZXRob2QsIGFjdGlvbiBieSBkZWZhdWx0XHJcbiAgICAgICAgfTsqL1xyXG5cclxuICAgICAgICAvL2xvZy5zZW5kT25VbmxvYWQoKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3ByZWxvYWQnLCBbXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwcmVsb2FkJylcclxuICAgICAgICAucHJvdmlkZXIoJ3ByZWxvYWRTZXJ2aWNlJywgcHJlbG9hZFNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHByZWxvYWRTZXJ2aWNlKCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGZ1bmN0aW9uKHVybCA9ICcvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZCA9ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0ID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICBsb2c6IGxvZ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuJGdldCA9IGZ1bmN0aW9uICgkaHR0cCwgJHRpbWVvdXQpIHtcclxuICAgICAgICAgICAgbGV0IHByZWxvYWRDYWNoZSA9IFtdLFxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyID0gZnVuY3Rpb24obWVzc2FnZSwgbG9nID0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnc2lsZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmxvZyA9PT0gJ2RlYnVnJyAmJiBsb2cgPT09ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2cgPT09ICd3YXJuaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWRJbWFnZXMocHJlbG9hZE5hbWUsIGltYWdlcykgeyAvL3RvZG8gZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VzU3JjTGlzdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW1hZ2VzID09PSAnYXJyYXknKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzU3JjTGlzdCA9IGltYWdlcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZENhY2hlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVsb2FkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5tZXRob2QgfHwgY29uZmlnLm1ldGhvZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBpbWFnZXMudXJsIHx8IGNvbmZpZy51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzOiBpbWFnZXMuYWN0aW9uIHx8IGNvbmZpZy5hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzU3JjTGlzdCA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZENhY2hlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VzU3JjTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy50aW1lb3V0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93Lm9ubG9hZCA9IHByZWxvYWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQocHJlbG9hZC5iaW5kKG51bGwsIGltYWdlc1NyY0xpc3QpLCBjb25maWcudGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvL3RvZG9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkKGltYWdlc1NyY0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlc1NyY0xpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IGltYWdlc1NyY0xpc3RbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc29sdmUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyKHRoaXMuc3JjLCAnZGVidWcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UHJlbG9hZChwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdwcmVsb2FkU2VydmljZTogZ2V0IHJlcXVlc3QgJyArICdcIicgKyBwcmVsb2FkTmFtZSArICdcIicsICdkZWJ1ZycpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVsb2FkQ2FjaGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVsb2FkQ2FjaGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJlbG9hZENhY2hlW2ldLm5hbWUgPT09IHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVsb2FkQ2FjaGVbaV0uc3JjXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxvZ2dlcignTm8gcHJlbG9hZHMgZm91bmQnLCAnd2FybmluZycpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcHJlbG9hZEltYWdlczogcHJlbG9hZEltYWdlcyxcclxuICAgICAgICAgICAgICAgIGdldFByZWxvYWRDYWNoZTogZ2V0UHJlbG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdiYWNrZW5kUGF0aHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdG9wMzogJy9hcGkvdG9wMycsXHJcbiAgICAgICAgICAgIGF1dGg6ICcvYXBpL3VzZXJzJyxcclxuICAgICAgICAgICAgZ2FsbGVyeTogJy9hcGkvZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHM6ICcvYXBpL2d1ZXN0Y29tbWVudHMnLFxyXG4gICAgICAgICAgICBob3RlbHM6ICcvYXBpL2hvdGVscydcclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdob3RlbERldGFpbHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdHlwZXM6IFtcclxuICAgICAgICAgICAgICAgICdIb3RlbCcsXHJcbiAgICAgICAgICAgICAgICAnQnVuZ2Fsb3cnLFxyXG4gICAgICAgICAgICAgICAgJ1ZpbGxhJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3M6IFtcclxuICAgICAgICAgICAgICAgICdDb2FzdCcsXHJcbiAgICAgICAgICAgICAgICAnQ2l0eScsXHJcbiAgICAgICAgICAgICAgICAnRGVzZXJ0J1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgbG9jYXRpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnTmFtaWJpYScsXHJcbiAgICAgICAgICAgICAgICAnTGlieWEnLFxyXG4gICAgICAgICAgICAgICAgJ1NvdXRoIEFmcmljYScsXHJcbiAgICAgICAgICAgICAgICAnVGFuemFuaWEnLFxyXG4gICAgICAgICAgICAgICAgJ1BhcHVhIE5ldyBHdWluZWEnLFxyXG4gICAgICAgICAgICAgICAgJ1JldW5pb24nLFxyXG4gICAgICAgICAgICAgICAgJ1N3YXppbGFuZCcsXHJcbiAgICAgICAgICAgICAgICAnU2FvIFRvbWUnLFxyXG4gICAgICAgICAgICAgICAgJ01hZGFnYXNjYXInLFxyXG4gICAgICAgICAgICAgICAgJ01hdXJpdGl1cycsXHJcbiAgICAgICAgICAgICAgICAnU2V5Y2hlbGxlcycsXHJcbiAgICAgICAgICAgICAgICAnTWF5b3R0ZScsXHJcbiAgICAgICAgICAgICAgICAnVWtyYWluZSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGd1ZXN0czogW1xyXG4gICAgICAgICAgICAgICAgJzEnLFxyXG4gICAgICAgICAgICAgICAgJzInLFxyXG4gICAgICAgICAgICAgICAgJzMnLFxyXG4gICAgICAgICAgICAgICAgJzQnLFxyXG4gICAgICAgICAgICAgICAgJzUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBtdXN0SGF2ZXM6IFtcclxuICAgICAgICAgICAgICAgICdyZXN0YXVyYW50JyxcclxuICAgICAgICAgICAgICAgICdraWRzJyxcclxuICAgICAgICAgICAgICAgICdwb29sJyxcclxuICAgICAgICAgICAgICAgICdzcGEnLFxyXG4gICAgICAgICAgICAgICAgJ3dpZmknLFxyXG4gICAgICAgICAgICAgICAgJ3BldCcsXHJcbiAgICAgICAgICAgICAgICAnZGlzYWJsZScsXHJcbiAgICAgICAgICAgICAgICAnYmVhY2gnLFxyXG4gICAgICAgICAgICAgICAgJ3BhcmtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2NvbmRpdGlvbmluZycsXHJcbiAgICAgICAgICAgICAgICAnbG91bmdlJyxcclxuICAgICAgICAgICAgICAgICd0ZXJyYWNlJyxcclxuICAgICAgICAgICAgICAgICdnYXJkZW4nLFxyXG4gICAgICAgICAgICAgICAgJ2d5bScsXHJcbiAgICAgICAgICAgICAgICAnYmljeWNsZXMnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBhY3Rpdml0aWVzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29va2luZyBjbGFzc2VzJyxcclxuICAgICAgICAgICAgICAgICdDeWNsaW5nJyxcclxuICAgICAgICAgICAgICAgICdGaXNoaW5nJyxcclxuICAgICAgICAgICAgICAgICdHb2xmJyxcclxuICAgICAgICAgICAgICAgICdIaWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0hvcnNlLXJpZGluZycsXHJcbiAgICAgICAgICAgICAgICAnS2F5YWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ05pZ2h0bGlmZScsXHJcbiAgICAgICAgICAgICAgICAnU2FpbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2N1YmEgZGl2aW5nJyxcclxuICAgICAgICAgICAgICAgICdTaG9wcGluZyAvIG1hcmtldHMnLFxyXG4gICAgICAgICAgICAgICAgJ1Nub3JrZWxsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTa2lpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1N1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbGRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdXaW5kc3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2luZSB0YXN0aW5nJyxcclxuICAgICAgICAgICAgICAgICdZb2dhJyBcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHByaWNlOiBbXHJcbiAgICAgICAgICAgICAgICBcIm1pblwiLFxyXG4gICAgICAgICAgICAgICAgXCJtYXhcIlxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdyZXNvcnRTZXJ2aWNlJywgcmVzb3J0U2VydmljZSk7XHJcblxyXG4gICAgcmVzb3J0U2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICckcSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlc29ydFNlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCAkcSkge1xyXG4gICAgICAgIGxldCBtb2RlbCA9IG51bGw7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlc29ydChmaWx0ZXIpIHtcclxuICAgICAgICAgICAgLy90b2RvIGVycm9yczogbm8gaG90ZWxzLCBubyBmaWx0ZXIuLi5cclxuICAgICAgICAgICAgaWYgKG1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihhcHBseUZpbHRlcihtb2RlbCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihvblJlc29sdmUsIG9uUmVqZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwbHlGaWx0ZXIobW9kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwbHlGaWx0ZXIobW9kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVyKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWxcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwuZmlsdGVyKChob3RlbCkgPT4gaG90ZWxbZmlsdGVyLnByb3BdID09IGZpbHRlci52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFJlc29ydDogZ2V0UmVzb3J0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRyb290U2NvcGUsICRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3Q6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduSW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRyb290U2NvcGUsICRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWxldGVUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlVG9rZW46IHNhdmVUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnZXRUb2tlbjogZ2V0VG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlVG9rZW46IGRlbGV0ZVRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuZGVsZXRlVG9rZW4oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5nZXRMb2dJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogdGhpcy5fY3JlZGVudGlhbHMsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5fdG9rZW5LZWVwZXIuZ2V0VG9rZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0NvbnRyb2xsZXInLCBCb29raW5nQ29udHJvbGxlcik7XHJcblxyXG4gICAgQm9va2luZ0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlUGFyYW1zJywgJ3Jlc29ydFNlcnZpY2UnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCb29raW5nQ29udHJvbGxlcigkc3RhdGVQYXJhbXMsIHJlc29ydFNlcnZpY2UsICRzdGF0ZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHRoaXMuaG90ZWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KHtcclxuICAgICAgICAgICAgICAgIHByb3A6ICdfaWQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICRzdGF0ZVBhcmFtcy5ob3RlbElkfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdGVsID0gcmVzcG9uc2VbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL3RoaXMuaG90ZWwgPSAkc3RhdGVQYXJhbXMuaG90ZWw7XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0SG90ZWxJbWFnZXNDb3VudCA9IGZ1bmN0aW9uKGNvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQXJyYXkoY291bnQgLSAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub3BlbkltYWdlID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBpbWdTcmMgPSAkZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0Zvcm1Db250cm9sbGVyJywgQm9va2luZ0Zvcm1Db250cm9sbGVyKVxyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdGb3JtQ29udHJvbGxlcigpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIHRoaXMuZm9ybSA9IHtcclxuICAgICAgICAgICAgZGF0ZTogJ3BpY2sgZGF0ZScsXHJcbiAgICAgICAgICAgIGd1ZXN0czogMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR3Vlc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5ndWVzdHMgIT09IDUgPyB0aGlzLmZvcm0uZ3Vlc3RzKysgOiB0aGlzLmZvcm0uZ3Vlc3RzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gMSA/IHRoaXMuZm9ybS5ndWVzdHMtLSA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2RhdGVQaWNrZXInLCBkYXRlUGlja2VyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlKCRpbnRlcnZhbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcclxuICAgICAgICAgICAgLypzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbDogJz0nXHJcbiAgICAgICAgICAgIH0sKi9cclxuICAgICAgICAgICAgbGluazogZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlTGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgLy90b2RvIGFsbFxyXG4gICAgICAgICAgICAkKCdbZGF0ZS1waWNrZXJdJykuZGF0ZVJhbmdlUGlja2VyKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlOiBuZXcgRGF0ZSgpLnNldEZ1bGxZZWFyKG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSArIDEpLFxyXG4gICAgICAgICAgICAgICAgfSkuYmluZCgnZGF0ZXBpY2tlci1maXJzdC1kYXRlLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZlbnQsIG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gZmlyc3QgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmaXJzdC1kYXRlLXNlbGVjdGVkJyxvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9iaiB3aWxsIGJlIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMTogKERhdGUgb2JqZWN0IG9mIHRoZSBlYXJsaWVyIGRhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNoYW5nZScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBzZWNvbmQgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2UnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kc2V0Vmlld1ZhbHVlKG9iai52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUyOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGxhdGVyIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vXHQgXHR2YWx1ZTogXCIyMDEzLTA2LTA1IHRvIDIwMTMtMDYtMDdcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1hcHBseScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB1c2VyIGNsaWNrcyBvbiB0aGUgYXBwbHkgYnV0dG9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcGx5JyxvYmopO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlZCcsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYWZ0ZXIgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbicsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYmVmb3JlIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbmVkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBvcGVuIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1hcCcsIGFodGxNYXBEaXJlY3RpdmUpO1xuXG4gICAgYWh0bE1hcERpcmVjdGl2ZS4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJ107XG5cbiAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlKHJlc29ydFNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJkZXN0aW5hdGlvbnNfX21hcFwiPjwvZGl2PicsXG4gICAgICAgICAgICBsaW5rOiBhaHRsTWFwRGlyZWN0aXZlTGlua1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICAgICAgbGV0IGhvdGVscyA9IG51bGw7XG5cbiAgICAgICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBob3RlbHMgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICBjcmVhdGVNYXAoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2F0aW9ucyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMucHVzaChbaG90ZWxzW2ldLm5hbWUsIGhvdGVsc1tpXS5fZ21hcHMubGF0LCBob3RlbHNbaV0uX2dtYXBzLmxuZ10pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG15TGF0TG5nID0ge2xhdDogLTI1LjM2MywgbG5nOiAxMzEuMDQ0fTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2JqZWN0IGFuZCBzcGVjaWZ5IHRoZSBET00gZWxlbWVudCBmb3IgZGlzcGxheS5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZGVzdGluYXRpb25zX19tYXAnKVswXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBsb2NhdGlvbnNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcih0aGlzLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKmNlbnRlcmluZyovXG4gICAgICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHt9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuYWxpZ24uaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5RGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlTGluaygkc2NvcGUpIHtcclxuICAgICAgICAgICAgbGV0IGltYWdlc0luR2FsbGVyeSA9IDIwO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyMDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nID0gJCgnPGRpdiBjbGFzcz1cIml0ZW1cIj48aW1nIHNyYz1cImFzc2V0cy9pbWFnZXMvZ2FsbGVyeS9wcmV2aWV3JyArIChpICsgMSkgKyAnLmpwZ1wiIHdpZHRoPVwiMzAwXCI+PC9kaXY+JylcclxuICAgICAgICAgICAgICAgIGltZy5maW5kKCdpbWcnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignbG9hZCcsIGltYWdlTG9hZGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCBpbWFnZUNsaWNrZWQuYmluZChudWxsLCBpKSk7XHJcbiAgICAgICAgICAgICAgICAkKCdbZ2FsbGVyeS1jb250YWluZXJdJykuYXBwZW5kKGltZyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZXNMb2FkZWQgPSAwO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbWFnZUxvYWRlZCgpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlc0xvYWRlZCsrO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWFnZXNMb2FkZWQgPT09IGltYWdlc0luR2FsbGVyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbGlnbmVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JbWFnZXMoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbWFnZUNsaWNrZWQoaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2dhbGxlcnkvJyArICsraW1hZ2UgKyAnLmpwZyc7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZVNyY1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsaWduSW1hZ2VzKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWFzb25yeSA9IG5ldyBNYXNvbnJ5KGNvbnRhaW5lciwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbldpZHRoOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICBndXR0ZXI6ICcuZ3V0dGVyLXNpemVyJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246ICcwLjJzJyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIG1hc29ucnkub24oJ2xheW91dENvbXBsZXRlJywgb25MYXlvdXRDb21wbGV0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWFzb25yeS5sYXlvdXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkxheW91dENvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQoY29udGFpbmVyKS5jc3MoJ29wYWNpdHknLCAnMScpLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4vKlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgICAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICckdGltZW91dCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdwcmVsb2FkU2VydmljZSddO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkaHR0cCwgJHRpbWVvdXQsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCBwcmVsb2FkU2VydmljZSkgeyAvL3RvZG8gbm90IG9ubHkgbG9hZCBidXQgbGlzdFNyYyB0b28gYWNjZXB0XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93Rmlyc3QnLFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dOZXh0J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkudGVtcGxhdGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5TGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgbGV0IGFsbEltYWdlc1NyYyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSAkc2NvcGUuc2hvd0ZpcnN0SW1nQ291bnQsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50ID0gJHNjb3BlLnNob3dOZXh0SW1nQ291bnQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9IE1hdGgubWluKHNob3dGaXJzdEltZ0NvdW50ICsgc2hvd05leHRJbWdDb3VudCwgYWxsSW1hZ2VzU3JjLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dGaXJzdCA9IGFsbEltYWdlc1NyYy5zbGljZSgwLCBzaG93Rmlyc3RJbWdDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQWxsSW1hZ2VzTG9hZGVkID0gdGhpcy5zaG93Rmlyc3QgPj0gYWxsSW1hZ2VzU3JjLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvISokdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7KiEvXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsbEltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob3dGaXJzdCkgPyB0aGlzLnNob3dGaXJzdC5sZW5ndGggPT09IHRoaXMuaW1hZ2VzQ291bnQ6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmdhbGxlcnkgaW1nJykubGVuZ3RoIDwgc2hvd0ZpcnN0SW1nQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb29wcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHRoaXMuYWxpZ25JbWFnZXMsIDApXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMoKTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzQ291bnQgPSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGVsZW0ub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nU3JjID0gZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgLyEqIHZhciAkaW1hZ2VzID0gJCgnLmdhbGxlcnkgaW1nJyk7XHJcbiAgICAgICAgICAgIHZhciBsb2FkZWRfaW1hZ2VzX2NvdW50ID0gMDsqIS9cclxuICAgICAgICAgICAgLyEqJHNjb3BlLmFsaWduSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkX2ltYWdlc19jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkX2ltYWdlc19jb3VudCA9PSAkaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0SW1hZ2VBbGlnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7IC8vIHRvZG9cclxuICAgICAgICAgICAgfTsqIS9cclxuXHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmFsaWduSW1hZ2VzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKGNiKSB7XHJcbiAgICAgICAgICAgIGNiKHByZWxvYWRTZXJ2aWNlLmdldFByZWxvYWRDYWNoZSgnZ2FsbGVyeScpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9zZXRJbWFnZUFsaWdtZW50KCkgeyAvL3RvZG8gYXJndW1lbnRzIG5hbWluZywgZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWd1cmVzID0gJCgnLmdhbGxlcnlfX2ZpZ3VyZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdhbGxlcnlXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY2xvc2VzdCgnLmdhbGxlcnknKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlV2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNzcygnd2lkdGgnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbHVtbnNDb3VudCA9IE1hdGgucm91bmQoZ2FsbGVyeVdpZHRoIC8gaW1hZ2VXaWR0aCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodCA9IG5ldyBBcnJheShjb2x1bW5zQ291bnQgKyAxKS5qb2luKCcwJykuc3BsaXQoJycpLm1hcCgoKSA9PiB7cmV0dXJuIDB9KSwgLy90b2RvIGRlbCBqb2luLXNwbGl0XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHQgPSBjb2x1bW5zSGVpZ2h0LnNsaWNlKDApLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICQoZmlndXJlcykuY3NzKCdtYXJnaW4tdG9wJywgJzAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZmlndXJlcywgZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ21hcmdpbi10b3AnLCAtKE1hdGgubWF4LmFwcGx5KG51bGwsIGNvbHVtbnNIZWlnaHQpIC0gY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSkgKyAncHgnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpICsgY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbHVtblBvaW50ZXIgPT09IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uc0hlaWdodC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodFtpXSArPSBjdXJyZW50Q29sdW1uc0hlaWdodFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcbi8hKiAgICAgICAgLmNvbnRyb2xsZXIoJ0dhbGxlcnlDb250cm9sbGVyJywgR2FsbGVyeUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEdhbGxlcnlDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgIHZhciBpbWFnZXNTcmMgPSBfZ2V0SW1hZ2VTb3VyY2VzKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coaW1hZ2VzU3JjKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LFxyXG4gICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnRVJST1InOyAvL3RvZG9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7KiEvXHJcblxyXG4vISpcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0OiBcIj1haHRsR2FsbGVyeVNob3dGaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgc2hvd0FmdGVyOiBcIj1haHRsR2FsbGVyeVNob3dBZnRlclwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oKXt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYSA9IDEzO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuYSk7XHJcbiAgICAgICAgICAgIC8hKnZhciBhbGxJbWFnZXNTcmM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd0ZpcnN0SW1hZ2VzU3JjID0gWycxMjMnXTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy90b2RvXHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgfSkqIS9cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxufSkoKTsqIS9cclxuKi9cclxuXHJcblxyXG5cclxuLyoyXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7fSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmFsaWduLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBhaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW1ncyA9IG5ldyBBcnJheSgyMCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nc0xvYWRlZCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vcGVuSW1hZ2UgPSBmdW5jdGlvbihpbWFnZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2dhbGxlcnkvJyArIGltYWdlTmFtZSArICcuanBnJztcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZVNyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnYWh0bEdhbGxlcnk6bG9hZGVkJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYSwgY3RybCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkKGVsZW0pLmZpbmQoJ2ltZycpKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ2FodGxHYWxsZXJ5OmxvYWRlZCcsIGFsaWduSW1hZ2VzKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsaWduSW1hZ2VzKCl7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hc29ucnkgPSBuZXcgTWFzb25yeShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uV2lkdGg6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3V0dGVyOiAnLmd1dHRlci1zaXplcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogJzAuMnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TGF5b3V0OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXNvbnJ5Lm9uKCdsYXlvdXRDb21wbGV0ZScsIG9uTGF5b3V0Q29tcGxldGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXNvbnJ5LmxheW91dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkxheW91dENvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkKGNvbnRhaW5lcikuY3NzKCdvcGFjaXR5JywgJzEnKSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0d1ZXN0Y29tbWVudHNDb250cm9sbGVyJywgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcigkcm9vdFNjb3BlLCBndWVzdGNvbW1lbnRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMud3JpdGVDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiRsb2dnZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5nZXRHdWVzdENvbW1lbnRzKCkudGhlbihcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5zZW5kQ29tbWVudCh0aGlzLmZvcm1EYXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cy5wdXNoKHsnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZSwgJ2NvbW1lbnQnOiB0aGlzLmZvcm1EYXRhLmNvbW1lbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGF0YSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3JldmVyc2UnLCByZXZlcnNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXZlcnNlKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgICAgICAgICAvL3RvIGVycm9yc1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbXMuc2xpY2UoKS5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnLCBndWVzdGNvbW1lbnRzU2VydmljZSk7XHJcblxyXG4gICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBndWVzdGNvbW1lbnRzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0R3Vlc3RDb21tZW50czogZ2V0R3Vlc3RDb21tZW50cyxcclxuICAgICAgICAgICAgc2VuZENvbW1lbnQ6IHNlbmRDb21tZW50XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0R3Vlc3RDb21tZW50cyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb21tZW50KGNvbW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXIgPSBhdXRoU2VydmljZS5nZXRMb2dJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IHVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgSGVhZGVyQ29udHJvbGxlcik7XHJcblxyXG4gICAgSGVhZGVyQ29udHJvbGxlci4kaW5qZWN0ID0gWydhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnNpZ25PdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25PdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxIZWFkZXInLCBhaHRsSGVhZGVyKTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bEhlYWRlcigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUFDJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5zZXJ2aWNlKCdIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpO1xyXG5cclxuXHRIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvZyddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJHRpbWVvdXQsICRsb2cpIHtcclxuXHRcdGZ1bmN0aW9uIFVJdHJhbnNpdGlvbnMoY29udGFpbmVyKSB7XHJcblx0XHRcdGlmICghJChjb250YWluZXIpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudCAnJHtjb250YWluZXJ9JyBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9jb250YWluZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5hbmltYXRlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50c1F1ZXJ5LFxyXG5cdFx0XHR7Y3NzRW51bWVyYWJsZVJ1bGUgPSAnd2lkdGgnLCBmcm9tID0gMCwgdG8gPSAnYXV0bycsIGRlbGF5ID0gMTAwfSkge1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2NvbnRhaW5lciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGxldCB0YXJnZXRFbGVtZW50cyA9ICQodGhpcykuZmluZCh0YXJnZXRFbGVtZW50c1F1ZXJ5KSxcclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdGlmICghdGFyZ2V0RWxlbWVudHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHt0YXJnZXRFbGVtZW50c1F1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRcdHJldHVyblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCB0byk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSA9IHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCBmcm9tKTtcclxuXHJcblx0XHRcdFx0bGV0IGFuaW1hdGVPcHRpb25zID0ge307XHJcblx0XHRcdFx0YW5pbWF0ZU9wdGlvbnNbY3NzRW51bWVyYWJsZVJ1bGVdID0gdGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuYW5pbWF0ZShhbmltYXRlT3B0aW9ucywgZGVsYXkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5yZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2sgPSBmdW5jdGlvbihlbGVtZW50VHJpZ2dlclF1ZXJ5LCBlbGVtZW50T25RdWVyeSkge1xyXG5cdFx0XHRpZiAoISQoZWxlbWVudFRyaWdnZXJRdWVyeSkubGVuZ3RoIHx8ICEkKGVsZW1lbnRPblF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtlbGVtZW50VHJpZ2dlclF1ZXJ5fSAke2VsZW1lbnRPblF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnRPblF1ZXJ5KS5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zKGhlYWRlclF1ZXJ5LCBjb250YWluZXJRdWVyeSkge1xyXG5cdFx0XHRVSXRyYW5zaXRpb25zLmNhbGwodGhpcywgY29udGFpbmVyUXVlcnkpO1xyXG5cclxuXHRcdFx0aWYgKCEkKGhlYWRlclF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtoZWFkZXJRdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0dGhpcy5faGVhZGVyID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5faGVhZGVyID0gJChoZWFkZXJRdWVyeSk7XHJcblx0XHR9XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShVSXRyYW5zaXRpb25zLnByb3RvdHlwZSk7XHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZWFkZXJUcmFuc2l0aW9ucztcclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuZml4SGVhZGVyRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50Rml4UXVlcnksIGZpeENsYXNzTmFtZSwgdW5maXhDbGFzc05hbWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2hlYWRlciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgZml4RWxlbWVudCA9ICQoZWxlbWVudEZpeFF1ZXJ5KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCkge1xyXG5cdFx0XHRcdGxldCB0aW1lcjtcclxuXHJcblx0XHRcdFx0ZnVuY3Rpb24gZml4VW5maXhNZW51T25TY3JvbGwoKSB7XHJcblx0XHRcdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gb3B0aW9ucy5vbk1pblNjcm9sbHRvcCkge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LmFkZENsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLmlubmVyV2lkdGgoKTtcclxuXHJcblx0XHRcdFx0aWYgKHdpZHRoIDwgb3B0aW9ucy5vbk1heFdpbmRvd1dpZHRoKSB7XHJcblx0XHRcdFx0XHRmaXhVbmZpeE1lbnVPblNjcm9sbCgpO1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLmFkZENsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRpbWVyKSB7XHJcblx0XHRcdFx0XHRcdFx0dGltZXIgPSAkdGltZW91dChmaXhVbmZpeE1lbnVPblNjcm9sbCwgMTUwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNlbGYuX2hlYWRlci5yZW1vdmVDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCk7XHJcblx0XHRcdCQod2luZG93KS5vbigncmVzaXplJywgb25XaWR0aENoYW5nZUhhbmRsZXIpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIEhlYWRlclRyYW5zaXRpb25zO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFN0aWt5SGVhZGVyJyxhaHRsU3Rpa3lIZWFkZXIpO1xyXG5cclxuXHRhaHRsU3Rpa3lIZWFkZXIuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTdGlreUhlYWRlcihIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKCkge1xyXG5cdFx0XHRsZXQgaGVhZGVyID0gbmV3IEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgnLmwtaGVhZGVyJywgJy5uYXZfX2l0ZW0tY29udGFpbmVyJyk7XHJcblxyXG5cdFx0XHRoZWFkZXIuYW5pbWF0ZVRyYW5zaXRpb24oXHJcblx0XHRcdFx0Jy5zdWItbmF2Jywge1xyXG5cdFx0XHRcdFx0Y3NzRW51bWVyYWJsZVJ1bGU6ICdoZWlnaHQnLFxyXG5cdFx0XHRcdFx0ZGVsYXk6IDMwMH0pXHJcblx0XHRcdFx0LnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayhcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LXRyaWdnZXJdJyxcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LW9uXScpXHJcblx0XHRcdFx0LmZpeEhlYWRlckVsZW1lbnQoXHJcblx0XHRcdFx0XHQnLm5hdicsXHJcblx0XHRcdFx0XHQnanNfbmF2LS1maXhlZCcsXHJcblx0XHRcdFx0XHQnanNfbC1oZWFkZXItLXJlbGF0aXZlJywge1xyXG5cdFx0XHRcdFx0XHRvbk1pblNjcm9sbHRvcDogODgsXHJcblx0XHRcdFx0XHRcdG9uTWF4V2luZG93V2lkdGg6IDg1MH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgSG9tZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEhvbWVDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcihyZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe3Byb3A6ICdfdHJlbmQnLCB2YWx1ZTogdHJ1ZX0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBpZiBub3QgcmVzcG9uc2VcclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1vZGFsJywgYWh0bE1vZGFsRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9tb2RhbC9tb2RhbC5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdtb2RhbE9wZW4nLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ2ltYWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zcmMgPSBkYXRhLnNyYztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5pbWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ21hcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5tYXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ29vZ2xlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBteUxhdGxuZyA9IHtsYXQ6IGRhdGEuY29vcmQubGF0LCBsbmc6IGRhdGEuY29vcmQubG5nfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6ICdyb2FkbWFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBteUxhdGxuZ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBteUxhdGxuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIodGhpcy5nZXRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2VEaWFsb2cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKG5hbWUsIGNvb3JkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIFtuYW1lLCBjb29yZC5sYXQsIGNvb3JkLmxuZ11cclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWxNYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge2xhdDogY29vcmQubGF0LCBsbmc6IGNvb3JkLmxuZ30sXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhaG90ZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuLypcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvISpjZW50ZXJpbmcqIS9cclxuICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzICgpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kYWxNYXAuZml0Qm91bmRzKGJvdW5kcyk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignYWN0aXZpdGllc0ZpbHRlcicsIGFjdGl2aXRpZXNGaWx0ZXIpO1xyXG5cclxuICAgIGFjdGl2aXRpZXNGaWx0ZXIuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFjdGl2aXRpZXNGaWx0ZXIoJGxvZywgZmlsdGVyc1NlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyZywgX3N0cmluZ0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc3RyaW5nTGVuZ3RoID0gcGFyc2VJbnQoX3N0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4oc3RyaW5nTGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBDYW4ndCBwYXJzZSBhcmd1bWVudDogJHtfc3RyaW5nTGVuZ3RofWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZ1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXJnLmpvaW4oJywgJykuc2xpY2UoMCwgc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuc2xpY2UoMCwgcmVzdWx0Lmxhc3RJbmRleE9mKCcsJykpICsgJy4uLidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jlc29ydENvbnRyb2xsZXInLCBSZXNvcnRDb250cm9sbGVyKTtcclxuXHJcbiAgICBSZXNvcnRDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnLCAnJGZpbHRlcicsICckc2NvcGUnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUmVzb3J0Q29udHJvbGxlcihyZXNvcnRTZXJ2aWNlLCAkZmlsdGVyLCAkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICAgIGxldCBjdXJyZW50RmlsdGVycyA9ICRzdGF0ZS4kY3VycmVudC5kYXRhLmN1cnJlbnRGaWx0ZXJzOyAvLyB0ZW1wXHJcblxyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuaW5pdEZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZSA9IGZ1bmN0aW9uKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSA9IGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5wdXNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uc3BsaWNlKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlciksIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBob3RlbHMgPSB7fTtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IGhvdGVscztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLmZpbHRlcnMucHJpY2UsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVycy5wcmljZSA9IFtuZXdWYWx1ZV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjdXJyZW50RmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTsgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuTWFwID0gZnVuY3Rpb24oaG90ZWxOYW1lLCBob3RlbENvb3JkLCBob3RlbCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHNob3c6ICdtYXAnLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogaG90ZWxOYW1lLFxyXG4gICAgICAgICAgICAgICAgY29vcmQ6IGhvdGVsQ29vcmRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIGRhdGEpXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdob3RlbEZpbHRlcicsIGhvdGVsRmlsdGVyKTtcclxuXHJcbiAgICBob3RlbEZpbHRlci4kaW5qZWN0ID0gWyckbG9nJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gaG90ZWxGaWx0ZXIoJGxvZywgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICBsZXQgc2F2ZWRGaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxvYWRGaWx0ZXJzOiBsb2FkRmlsdGVycyxcclxuICAgICAgICAgICAgYXBwbHlGaWx0ZXJzOiBhcHBseUZpbHRlcnMsXHJcbiAgICAgICAgICAgIGluaXRGaWx0ZXJzOiBpbml0RmlsdGVyc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRGaWx0ZXJzKCkge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRGaWx0ZXJzKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzYXZlZEZpbHRlcnMpO1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVycyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSA9IHNhdmVkRmlsdGVyc1trZXldICYmIHNhdmVkRmlsdGVyc1trZXldLmluZGV4T2YoaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXSkgIT09IC0xID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZpbHRlcnMucHJpY2UgPSB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDEwMDBcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseUZpbHRlcnMoaG90ZWxzLCBmaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIHNhdmVkRmlsdGVycyA9IGZpbHRlcnM7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaG90ZWxzLCBmdW5jdGlvbihob3RlbCkge1xyXG4gICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZmlsdGVycywgZnVuY3Rpb24oZmlsdGVyc0luR3JvdXAsIGZpbHRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXZlcnNlRmlsdGVyTWF0Y2hpbmcgPSBmYWxzZTsgLy8gZm9yIGFjdGl2aXRpZXMgYW5kIG11c3RoYXZlcyBncm91cHNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckdyb3VwID09PSAnZ3Vlc3RzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzSW5Hcm91cCA9IFtmaWx0ZXJzSW5Hcm91cFtmaWx0ZXJzSW5Hcm91cC5sZW5ndGggLSAxXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckdyb3VwID09PSAnbXVzdEhhdmVzJyB8fCBmaWx0ZXJHcm91cCA9PT0gJ2FjdGl2aXRpZXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VGaWx0ZXJNYXRjaGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbHRlcnNJbkdyb3VwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmV2ZXJzZUZpbHRlck1hdGNoaW5nICYmIGdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV2ZXJzZUZpbHRlck1hdGNoaW5nICYmICFnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXJzSW5Hcm91cFtpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hBdExlYXNlT25lRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb2NhdGlvbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwubG9jYXRpb24uY291bnRyeSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3R5cGVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnR5cGUgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXR0aW5ncyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5lbnZpcm9ubWVudCA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ211c3RIYXZlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5kZXRhaWxzW2ZpbHRlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWN0aXZpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB+aG90ZWwuYWN0aXZpdGllcy5pbmRleE9mKGZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwucHJpY2UgPj0gZmlsdGVyLm1pbiAmJiBob3RlbC5wcmljZSA8PSBmaWx0ZXIubWF4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2d1ZXN0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5ndWVzdHMubWF4ID49ICtmaWx0ZXJbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBob3RlbHMuZmlsdGVyKChob3RlbCkgPT4gIWhvdGVsLl9oaWRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3Njcm9sbFRvVG9wJywgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUpO1xyXG5cclxuICAgIHNjcm9sbFRvVG9wRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciwgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgaWYgKDEpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAkLnRyaW0oYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZSgwLCBhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzY3JvbGwtdG8tdG9wLWNvbmZpZyBpcyBub3QgZGVmaW5lZGApO1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yIHx8ICdodG1sLCBib2R5JztcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW0pLm9uKGF0dHIuc2Nyb2xsVG9Ub3AsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogaGVpZ2h0IH0sIFwic2xvd1wiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFNlYXJjaENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFNlYXJjaENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlJywgJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzdGF0ZSwgcmVzb3J0U2VydmljZSkge1xyXG4gICAgICAgIHRoaXMucXVlcnkgPSAkc3RhdGUucGFyYW1zLnF1ZXJ5O1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMucXVlcnkpO1xyXG4gICAgICAgIHRoaXMuaG90ZWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2guY2FsbCh0aGlzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZWFyY2goKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJzZWRRdWVyeSA9ICQudHJpbSh0aGlzLnF1ZXJ5KS5yZXBsYWNlKC9cXHMrL2csICcgJykuc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuaG90ZWxzLCAoaG90ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaG90ZWwpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhvdGVsQ29udGVudCA9IGhvdGVsLm5hbWUgKyBob3RlbC5sb2NhdGlvbi5jb3VudHJ5ICtcclxuICAgICAgICAgICAgICAgICAgICBob3RlbC5sb2NhdGlvbi5yZWdpb24gKyBob3RlbC5kZXNjICsgaG90ZWwuZGVzY0xvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhob3RlbENvbnRlbnQpXHJcbiAgICAgICAgICAgICAgICAvL2ZvciAoKVxyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoZXNDb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyc2VkUXVlcnkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcVJlZ0V4cCA9IG5ldyBSZWdFeHAocGFyc2VkUXVlcnlbaV0sICdnaScpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXNDb3VudGVyICs9IChob3RlbENvbnRlbnQubWF0Y2gocVJlZ0V4cCkgfHwgW10pLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlc0NvdW50ZXIgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2hvdGVsLl9pZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaG90ZWwuX2lkXS5tYXRjaGVzQ291bnRlciA9IG1hdGNoZXNDb3VudGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IHRoaXMuaG90ZWxzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChob3RlbCkgPT4gcmVzdWx0W2hvdGVsLl9pZF0pXHJcbiAgICAgICAgICAgICAgICAubWFwKChob3RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdGVsLl9tYXRjaGVzID0gcmVzdWx0W2hvdGVsLl9pZF0ubWF0Y2hlc0NvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2VhcmNoUmVzdWx0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsVG9wMycsIGFodGxUb3AzRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsVG9wM0RpcmVjdGl2ZS4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFRvcDNEaXJlY3RpdmUocmVzb3J0U2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsVG9wM0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3RvcDMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdG9wMy50ZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQubXVzdEhhdmVzO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydFR5cGUgPSAkYXR0cnMuYWh0bFRvcDN0eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEltZ1NyYyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9pbWFnZXMvJyArIHRoaXMucmVzb3J0VHlwZSArICcvJyArIHRoaXMucmVzb3J0W2luZGV4XS5pbWcuZmlsZW5hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNSZXNvcnRJbmNsdWRlRGV0YWlsID0gZnVuY3Rpb24oaXRlbSwgZGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0YWlsQ2xhc3NOYW1lID0gJ3RvcDNfX2RldGFpbC1jb250YWluZXItLScgKyBkZXRhaWwsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lID0gIWl0ZW0uZGV0YWlsc1tkZXRhaWxdID8gJyB0b3AzX19kZXRhaWwtY29udGFpbmVyLS1oYXNudCcgOiAnJztcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0YWlsQ2xhc3NOYW1lICsgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7cHJvcDogJ3R5cGUnLCB2YWx1ZTogdGhpcy5yZXNvcnRUeXBlfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvcnRUeXBlID09PSAnSG90ZWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gdGhpcy5yZXNvcnQuZmlsdGVyKChob3RlbCkgPT4gaG90ZWwuX3Nob3dJblRvcCA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmFuaW1hdGlvbignLnNsaWRlcl9faW1nJywgYW5pbWF0aW9uRnVuY3Rpb24pO1xyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7IC8vMjAwPyAkKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMCcpO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCdsZWZ0JywgJzAnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFNsaWRlcicsIGFodGxTbGlkZXIpO1xyXG5cclxuXHRhaHRsU2xpZGVyLiRpbmplY3QgPSBbJ3NsaWRlclNlcnZpY2UnLCAnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFNsaWRlcihzbGlkZXJTZXJ2aWNlLCAkdGltZW91dCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0Y29udHJvbGxlcjogYWh0bFNsaWRlckNvbnRyb2xsZXIsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmh0bWwnLFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGFodGxTbGlkZXJDb250cm9sbGVyKCRzY29wZSkge1xyXG5cdFx0XHQkc2NvcGUuc2xpZGVyID0gc2xpZGVyU2VydmljZTtcclxuXHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHRcdFx0JHNjb3BlLm5leHRTbGlkZSA9IG5leHRTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnByZXZTbGlkZSA9IHByZXZTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnNldFNsaWRlID0gc2V0U2xpZGU7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBuZXh0U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAnbGVmdCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXROZXh0U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcHJldlNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldFByZXZTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzZXRTbGlkZShpbmRleCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gaW5kZXggPiAkc2NvcGUuc2xpZGVyLmdldEN1cnJlbnRTbGlkZSh0cnVlKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRDdXJyZW50U2xpZGUoaW5kZXgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZml4SUU4cG5nQmxhY2tCZyhlbGVtZW50KSB7XHJcblx0XHRcdCQoZWxlbWVudClcclxuXHRcdFx0XHQuY3NzKCctbXMtZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCdmaWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ3pvb20nLCAnMScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0pIHtcclxuXHRcdFx0bGV0IGFycm93cyA9ICQoZWxlbSkuZmluZCgnLnNsaWRlcl9fYXJyb3cnKTtcclxuXHJcblx0XHRcdGFycm93cy5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMC41Jyk7XHJcblx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZyh0aGlzKTtcclxuXHJcblx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdCR0aW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzEnKTtcclxuXHRcdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcoJCh0aGlzKSk7XHJcblx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdzbGlkZXJTZXJ2aWNlJyxzbGlkZXJTZXJ2aWNlKTtcclxuXHJcblx0c2xpZGVyU2VydmljZS4kaW5qZWN0ID0gWydzbGlkZXJJbWdQYXRoQ29uc3RhbnQnXTtcclxuXHJcblx0ZnVuY3Rpb24gc2xpZGVyU2VydmljZShzbGlkZXJJbWdQYXRoQ29uc3RhbnQpIHtcclxuXHRcdGZ1bmN0aW9uIFNsaWRlcihzbGlkZXJJbWFnZUxpc3QpIHtcclxuXHRcdFx0dGhpcy5faW1hZ2VTcmNMaXN0ID0gc2xpZGVySW1hZ2VMaXN0O1xyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0SW1hZ2VTcmNMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW1hZ2VTcmNMaXN0O1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChnZXRJbmRleCkge1xyXG5cdFx0XHRyZXR1cm4gZ2V0SW5kZXggPT0gdHJ1ZSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA6IHRoaXMuX2ltYWdlU3JjTGlzdFt0aGlzLl9jdXJyZW50U2xpZGVdO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xyXG5cdFx0XHRzbGlkZSA9IHBhcnNlSW50KHNsaWRlKTtcclxuXHJcblx0XHRcdGlmIChpc05hTihzbGlkZSkgfHwgc2xpZGUgPCAwIHx8IHNsaWRlID4gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IHNsaWRlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldE5leHRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpID8gdGhpcy5fY3VycmVudFNsaWRlID0gMCA6IHRoaXMuX2N1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRQcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IDApID8gdGhpcy5fY3VycmVudFNsaWRlID0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEgOiB0aGlzLl9jdXJyZW50U2xpZGUtLTtcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBuZXcgU2xpZGVyKHNsaWRlckltZ1BhdGhDb25zdGFudCk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3NsaWRlckltZ1BhdGhDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjEuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjIuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjMuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjQuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjUuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjYuanBnJ1xyXG4gICAgICAgIF0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1BhZ2VzJywgUGFnZXMpO1xyXG5cclxuICAgIFBhZ2VzLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFBhZ2VzKCRzY29wZSkge1xyXG4gICAgICAgIGNvbnN0IGhvdGVsc1BlclBhZ2UgPSA1O1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93RnJvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudFBhZ2UgLSAxKSAqIGhvdGVsc1BlclBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKyt0aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd1ByZXYgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0tdGhpcy5jdXJyZW50UGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldFBhZ2UgPSBmdW5jdGlvbihwYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlICsgMTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzTGFzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFnZXNUb3RhbC5sZW5ndGggPT09IHRoaXMuY3VycmVudFBhZ2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzRmlyc3RQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlID09PSAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgKGV2ZW50LCBzaG93SG90ZWxDb3VudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBuZXcgQXJyYXkoTWF0aC5jZWlsKHNob3dIb3RlbENvdW50IC8gaG90ZWxzUGVyUGFnZSkpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3Nob3dGcm9tJywgc2hvd0Zyb20pO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dGcm9tKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgc3RhcnRQb3NpdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoIW1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5zbGljZShzdGFydFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsUHJpY2VTbGlkZXInLCBwcmljZVNsaWRlckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgcHJpY2VTbGlkZXJEaXJlY3RpdmUuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIG1pbjogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBtYXg6IFwiQFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdFNsaWRlcjogJz0nLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRTbGlkZXI6ICc9J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IHByaWNlU2xpZGVyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlTGluaygkc2NvcGUsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5sZWZ0U2xpZGVyKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnJpZ2h0U2xpZGVyKTtcclxuICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyLm1heCA9IDE1OyovXHJcbiAgICAgICAgICAgIGxldCByaWdodEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKSxcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKSxcclxuICAgICAgICAgICAgICAgIHNsaWRlQXJlYVdpZHRoID0gcGFyc2VJbnQoJCgnLnNsaWRlJykuY3NzKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlUGVyU3RlcCA9ICRzY29wZS5tYXggLyAoc2xpZGVBcmVhV2lkdGggLSAyMCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubWluID0gcGFyc2VJbnQoJHNjb3BlLm1pbik7XHJcbiAgICAgICAgICAgICRzY29wZS5tYXggPSBwYXJzZUludCgkc2NvcGUubWF4KTtcclxuXHJcbiAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICByaWdodEJ0bixcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHNsaWRlQXJlYVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCxcclxuICAgICAgICAgICAgICAgICgpID0+IDApO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdERyYWcoZHJhZ0VsZW0sIGluaXRQb3NpdGlvbiwgbWF4UG9zaXRpb24sIG1pblBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2hpZnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNlZG93bicsIGJ0bk9uTW91c2VEb3duKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlRG93bihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0ID0gZXZlbnQucGFnZVg7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFBvc2l0aW9uID0gcGFyc2VJbnQoZHJhZ0VsZW0uY3NzKCdsZWZ0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZG9jT25Nb3VzZU1vdmUoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb25MZXNzVGhhbk1heCA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPD0gbWF4UG9zaXRpb24oKSAtIDIwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkdyYXRlclRoYW5NaW4gPSBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0ID49IG1pblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbkxlc3NUaGFuTWF4ICYmIHBvc2l0aW9uR3JhdGVyVGhhbk1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcmFnRWxlbS5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0Jywgc2xpZGVBcmVhV2lkdGggLSBpbml0UG9zaXRpb24gLSBldmVudC5wYWdlWCArIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VVcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldFByaWNlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVtaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignZHJhZ3N0YXJ0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UHJpY2VzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdNaW4gPSB+fihwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld01heCA9IH5+KHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbChuZXdNaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbChuZXdNYXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdEJ0bi5jc3MoJ2xlZnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0QnRuLmNzcygnbGVmdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFNsaWRlcnMoYnRuLCBuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQb3N0aW9uID0gbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmNzcygnbGVmdCcsIG5ld1Bvc3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnRuLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIG5ld1Bvc3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcCA+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAtIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKGxlZnRCdG4sIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlID4gJHNjb3BlLm1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VmFsdWUsJHNjb3BlLm1heCApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwIDwgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhO2wnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2xpZGVycyhyaWdodEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZW1pdCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGVmdFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5yaWdodFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyokc2NvcGUuJGJyb2FkY2FzdCgncHJpY2VTbGlkZXJQb3NpdGlvbkNoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heDogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKClcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxMyk7Ki9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL3RvZG8gaWU4IGJ1ZyBmaXhcclxuICAgICAgICAgICAgICAgIGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ2llOCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyokc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKS5jc3MoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuZmluZCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coK3NsaWRlQXJlYVdpZHRoIC0gK25ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCArc2xpZGVBcmVhV2lkdGggLSBwYXJzZUludChuZXdWYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxTbGlkZU9uQ2xpY2snLCBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgbGluazogYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgbGV0IHNsaWRlRW1pdEVsZW1lbnRzID0gJChlbGVtKS5maW5kKCdbc2xpZGUtZW1pdF0nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNsaWRlLWVtaXQgbm90IGZvdW5kYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzbGlkZUVtaXRFbGVtZW50cy5vbignY2xpY2snLCBzbGlkZUVtaXRPbkNsaWNrKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNsaWRlRW1pdE9uQ2xpY2soKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2xpZGVPbkVsZW1lbnQgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbl0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXNsaWRlRW1pdEVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnJyAmJiBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2FybihgV3JvbmcgaW5pdCB2YWx1ZSBmb3IgJ3NsaWRlLW9uJyBhdHRyaWJ1dGUsIHNob3VsZCBiZSAnJyBvciAnY2xvc2VkJy5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlVXAoJ3Nsb3cnLCBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJ2Nsb3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5zbGlkZURvd24oJ3Nsb3cnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicsICcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNsaWRlVG9nZ2xlRWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbi10b2dnbGVdJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChzbGlkZVRvZ2dsZUVsZW1lbnRzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygkKHRoaXMpLmF0dHIoJ3NsaWRlLW9uLXRvZ2dsZScpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuIl19
