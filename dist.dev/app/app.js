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

                if (filter.prop === '_id' && filter.value === 'random') {
                    var discountModel = model.filter(function (hotel) {
                        return hotel['discount'];
                    });
                    var rndHotel = Math.floor(Math.random() * discountModel.length);
                    return [discountModel[rndHotel]];
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

        this.openMap = function (hotelName, hotelCoord) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsImdsb2JhbHMvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy9hdXRoL2F1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvYm9va2luZy9ib29raW5nLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuZm9ybS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYm9va2luZy9kYXRlUGlja2VyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvbW9kYWwvbW9kYWwuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5hY3Rpdml0aWVzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaG90ZWwuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5zY3JvbGx0b1RvcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5hbmltYXRpb24uanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXJQYXRoLmNvbnN0YW50LmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcGFnZXMvcGFnZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3ByaWNlU2xpZGVyL3ByaWNlU2xpZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9zbGlkZU9uQ2xpY2svc2xpZGVPbkNsaWNrLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJHByb3ZpZGUiLCJkZWNvcmF0b3IiLCIkZGVsZWdhdGUiLCIkd2luZG93IiwibG9nSGlzdG9yeSIsIndhcm4iLCJlcnIiLCJsb2ciLCJtZXNzYWdlIiwiX2xvZ1dhcm4iLCJwdXNoIiwiYXBwbHkiLCJfbG9nRXJyIiwiZXJyb3IiLCJuYW1lIiwic3RhY2siLCJFcnJvciIsInNlbmRPblVubG9hZCIsIm9uYmVmb3JldW5sb2FkIiwibGVuZ3RoIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5IiwiJGluamVjdCIsIiRzdGF0ZVByb3ZpZGVyIiwiJHVybFJvdXRlclByb3ZpZGVyIiwib3RoZXJ3aXNlIiwic3RhdGUiLCJ1cmwiLCJ0ZW1wbGF0ZVVybCIsInBhcmFtcyIsImRhdGEiLCJjdXJyZW50RmlsdGVycyIsInJ1biIsIiRyb290U2NvcGUiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsIiR0aW1lb3V0IiwiJGxvZ2dlZCIsIiRzdGF0ZSIsImN1cnJlbnRTdGF0ZU5hbWUiLCJjdXJyZW50U3RhdGVQYXJhbXMiLCJzdGF0ZUhpc3RvcnkiLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsImZyb21TdGF0ZSIsIiQiLCJzY3JvbGxUb3AiLCJwcm92aWRlciIsInByZWxvYWRTZXJ2aWNlIiwibWV0aG9kIiwiYWN0aW9uIiwidGltZW91dCIsIiRnZXQiLCIkaHR0cCIsInByZWxvYWRDYWNoZSIsImxvZ2dlciIsImNvbnNvbGUiLCJkZWJ1ZyIsInByZWxvYWRJbWFnZXMiLCJwcmVsb2FkTmFtZSIsImltYWdlcyIsImltYWdlc1NyY0xpc3QiLCJzcmMiLCJwcmVsb2FkIiwidGhlbiIsInJlc3BvbnNlIiwiYmluZCIsImkiLCJpbWFnZSIsIkltYWdlIiwib25sb2FkIiwiZSIsIm9uZXJyb3IiLCJnZXRQcmVsb2FkIiwiZ2V0UHJlbG9hZENhY2hlIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImdhbGxlcnkiLCJndWVzdGNvbW1lbnRzIiwiaG90ZWxzIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJHEiLCJtb2RlbCIsImdldFJlc29ydCIsImZpbHRlciIsIndoZW4iLCJhcHBseUZpbHRlciIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJwcm9wIiwidmFsdWUiLCJkaXNjb3VudE1vZGVsIiwiaG90ZWwiLCJybmRIb3RlbCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsInNpZ25JbiIsInVzZXIiLCJwcmV2aW91c1N0YXRlIiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsIl9jcmVkZW50aWFscyIsIl9vblJlc29sdmUiLCJzdGF0dXMiLCJ0b2tlbiIsIl90b2tlbktlZXBlciIsInNhdmVUb2tlbiIsIl9vblJlamVjdGVkIiwiX3Rva2VuIiwiZ2V0VG9rZW4iLCJkZWxldGVUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwic2lnbk91dCIsImdldExvZ0luZm8iLCJCb29raW5nQ29udHJvbGxlciIsIiRzdGF0ZVBhcmFtcyIsImxvYWRlZCIsImhvdGVsSWQiLCJnZXRIb3RlbEltYWdlc0NvdW50IiwiY291bnQiLCJBcnJheSIsIm9wZW5JbWFnZSIsIiRldmVudCIsImltZ1NyYyIsInRhcmdldCIsIiRicm9hZGNhc3QiLCJzaG93IiwiQm9va2luZ0Zvcm1Db250cm9sbGVyIiwiZm9ybSIsImRhdGUiLCJhZGRHdWVzdCIsInJlbW92ZUd1ZXN0Iiwic3VibWl0IiwiZGlyZWN0aXZlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZSIsIiRpbnRlcnZhbCIsInJlcXVpcmUiLCJsaW5rIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCJkYXRlUmFuZ2VQaWNrZXIiLCJsYW5ndWFnZSIsInN0YXJ0RGF0ZSIsIkRhdGUiLCJlbmREYXRlIiwic2V0RnVsbFllYXIiLCJnZXRGdWxsWWVhciIsIm9iaiIsIiRzZXRWaWV3VmFsdWUiLCIkcmVuZGVyIiwiJGFwcGx5IiwiYWh0bE1hcERpcmVjdGl2ZSIsInJlc3RyaWN0IiwidGVtcGxhdGUiLCJhaHRsTWFwRGlyZWN0aXZlTGluayIsImVsZW0iLCJhdHRyIiwiY3JlYXRlTWFwIiwid2luZG93IiwiZ29vZ2xlIiwiaW5pdE1hcCIsIm1hcFNjcmlwdCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsIl9nbWFwcyIsImxhdCIsImxuZyIsIm15TGF0TG5nIiwibWFwIiwibWFwcyIsIk1hcCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJzY3JvbGx3aGVlbCIsImljb25zIiwiYWhvdGVsIiwiaWNvbiIsIm1hcmtlciIsIk1hcmtlciIsInRpdGxlIiwicG9zaXRpb24iLCJMYXRMbmciLCJhZGRMaXN0ZW5lciIsInNldFpvb20iLCJzZXRDZW50ZXIiLCJnZXRQb3NpdGlvbiIsImJvdW5kcyIsIkxhdExuZ0JvdW5kcyIsIkxhdExhbmciLCJleHRlbmQiLCJmaXRCb3VuZHMiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZSIsImFodGxHYWxsZXJ5RGlyZWN0aXZlTGluayIsImltYWdlc0luR2FsbGVyeSIsImltZyIsImZpbmQiLCJvbiIsImltYWdlTG9hZGVkIiwiaW1hZ2VDbGlja2VkIiwiYXBwZW5kIiwiaW1hZ2VzTG9hZGVkIiwiYWxpZ25JbWFnZXMiLCJpbWFnZVNyYyIsIiRyb290IiwiY29udGFpbmVyIiwicXVlcnlTZWxlY3RvciIsIm1hc29ucnkiLCJNYXNvbnJ5IiwiY29sdW1uV2lkdGgiLCJpdGVtU2VsZWN0b3IiLCJndXR0ZXIiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJvbkxheW91dENvbXBsZXRlIiwibGF5b3V0IiwiY3NzIiwiR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIiLCJndWVzdGNvbW1lbnRzU2VydmljZSIsImNvbW1lbnRzIiwib3BlbkZvcm0iLCJzaG93UGxlYXNlTG9naU1lc3NhZ2UiLCJ3cml0ZUNvbW1lbnQiLCJnZXRHdWVzdENvbW1lbnRzIiwiYWRkQ29tbWVudCIsInNlbmRDb21tZW50IiwiZm9ybURhdGEiLCJjb21tZW50IiwicmV2ZXJzZSIsIml0ZW1zIiwic2xpY2UiLCJ0eXBlIiwib25SZWplY3QiLCJIZWFkZXJDb250cm9sbGVyIiwiYWh0bEhlYWRlciIsInNlcnZpY2UiLCJIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UiLCIkbG9nIiwiVUl0cmFuc2l0aW9ucyIsIl9jb250YWluZXIiLCJhbmltYXRlVHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwiYWh0bFN0aWt5SGVhZGVyIiwiaGVhZGVyIiwiSG9tZUNvbnRyb2xsZXIiLCJhaHRsTW9kYWxEaXJlY3RpdmUiLCJyZXBsYWNlIiwiYWh0bE1vZGFsRGlyZWN0aXZlTGluayIsInVuZGVmaW5lZCIsIm15TGF0bG5nIiwiY29vcmQiLCJtYXBUeXBlSWQiLCJ6b29tIiwiY2VudGVyIiwiY2xvc2VEaWFsb2ciLCJtb2RhbE1hcCIsImFjdGl2aXRpZXNGaWx0ZXIiLCJmaWx0ZXJzU2VydmljZSIsImFyZyIsIl9zdHJpbmdMZW5ndGgiLCJzdHJpbmdMZW5ndGgiLCJwYXJzZUludCIsImlzTmFOIiwicmVzdWx0Iiwiam9pbiIsImxhc3RJbmRleE9mIiwiUmVzb3J0Q29udHJvbGxlciIsIiRmaWx0ZXIiLCIkY3VycmVudCIsImZpbHRlcnMiLCJpbml0RmlsdGVycyIsIm9uRmlsdGVyQ2hhbmdlIiwiZmlsdGVyR3JvdXAiLCJzcGxpY2UiLCJpbmRleE9mIiwiYXBwbHlGaWx0ZXJzIiwiZ2V0U2hvd0hvdGVsQ291bnQiLCJyZWR1Y2UiLCJjb3VudGVyIiwiaXRlbSIsIl9oaWRlIiwiJHdhdGNoIiwibmV3VmFsdWUiLCJvcGVuTWFwIiwiaG90ZWxOYW1lIiwiaG90ZWxDb29yZCIsImhvdGVsRmlsdGVyIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCJzYXZlZEZpbHRlcnMiLCJsb2FkRmlsdGVycyIsImtleSIsIm1pbiIsIm1heCIsImZvckVhY2giLCJpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzIiwiZmlsdGVyc0luR3JvdXAiLCJtYXRjaEF0TGVhc2VPbmVGaWx0ZXIiLCJyZXZlcnNlRmlsdGVyTWF0Y2hpbmciLCJnZXRIb3RlbFByb3AiLCJsb2NhdGlvbiIsImNvdW50cnkiLCJlbnZpcm9ubWVudCIsImRldGFpbHMiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZSIsInNjcm9sbFRvVG9wRGlyZWN0aXZlTGluayIsInNlbGVjdG9yIiwiaGVpZ2h0IiwidHJpbSIsInNjcm9sbFRvVG9wQ29uZmlnIiwic2Nyb2xsVG9Ub3AiLCJTZWFyY2hDb250cm9sbGVyIiwicXVlcnkiLCJzZWFyY2giLCJwYXJzZWRRdWVyeSIsInNwbGl0IiwiaG90ZWxDb250ZW50IiwicmVnaW9uIiwiZGVzYyIsImRlc2NMb2NhdGlvbiIsIm1hdGNoZXNDb3VudGVyIiwicVJlZ0V4cCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2lkIiwic2VhcmNoUmVzdWx0cyIsIl9tYXRjaGVzIiwiYWh0bFRvcDNEaXJlY3RpdmUiLCJBaHRsVG9wM0NvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCIkZWxlbWVudCIsIiRhdHRycyIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJpbmRleCIsImZpbGVuYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsIiwiZGV0YWlsIiwiZGV0YWlsQ2xhc3NOYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lIiwiX3Nob3dJblRvcCIsImFuaW1hdGlvbiIsImFuaW1hdGlvbkZ1bmN0aW9uIiwiYmVmb3JlQWRkQ2xhc3MiLCJjbGFzc05hbWUiLCJkb25lIiwic2xpZGluZ0RpcmVjdGlvbiIsImFodGxTbGlkZXIiLCJzbGlkZXJTZXJ2aWNlIiwiYWh0bFNsaWRlckNvbnRyb2xsZXIiLCJzbGlkZXIiLCJuZXh0U2xpZGUiLCJwcmV2U2xpZGUiLCJzZXRTbGlkZSIsInNldE5leHRTbGlkZSIsInNldFByZXZTbGlkZSIsImdldEN1cnJlbnRTbGlkZSIsInNldEN1cnJlbnRTbGlkZSIsImZpeElFOHBuZ0JsYWNrQmciLCJhcnJvd3MiLCJjbGljayIsImRpc2FibGVkIiwic2xpZGVySW1nUGF0aENvbnN0YW50IiwiU2xpZGVyIiwic2xpZGVySW1hZ2VMaXN0IiwiX2ltYWdlU3JjTGlzdCIsIl9jdXJyZW50U2xpZGUiLCJnZXRJbWFnZVNyY0xpc3QiLCJnZXRJbmRleCIsInNsaWRlIiwiUGFnZXMiLCJob3RlbHNQZXJQYWdlIiwiY3VycmVudFBhZ2UiLCJwYWdlc1RvdGFsIiwic2hvd0Zyb20iLCJzaG93TmV4dCIsInNob3dQcmV2Iiwic2V0UGFnZSIsInBhZ2UiLCJpc0xhc3RQYWdlIiwiaXNGaXJzdFBhZ2UiLCJzaG93SG90ZWxDb3VudCIsImNlaWwiLCJzdGFydFBvc2l0aW9uIiwicHJpY2VTbGlkZXJEaXJlY3RpdmUiLCJsZWZ0U2xpZGVyIiwicmlnaHRTbGlkZXIiLCJwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsiLCJyaWdodEJ0biIsImxlZnRCdG4iLCJzbGlkZUFyZWFXaWR0aCIsInZhbHVlUGVyU3RlcCIsInZhbCIsImluaXREcmFnIiwiZHJhZ0VsZW0iLCJpbml0UG9zaXRpb24iLCJtYXhQb3NpdGlvbiIsIm1pblBvc2l0aW9uIiwic2hpZnQiLCJidG5Pbk1vdXNlRG93biIsInBhZ2VYIiwiZG9jT25Nb3VzZU1vdmUiLCJidG5Pbk1vdXNlVXAiLCJwb3NpdGlvbkxlc3NUaGFuTWF4IiwicG9zaXRpb25HcmF0ZXJUaGFuTWluIiwic2V0UHJpY2VzIiwiZW1pdCIsIm5ld01pbiIsIm5ld01heCIsInNldFNsaWRlcnMiLCJidG4iLCJuZXdQb3N0aW9uIiwiaGFzQ2xhc3MiLCJ0cmlnZ2VyIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rIiwic2xpZGVFbWl0RWxlbWVudHMiLCJzbGlkZUVtaXRPbkNsaWNrIiwic2xpZGVPbkVsZW1lbnQiLCJzbGlkZVVwIiwib25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlIiwic2xpZGVEb3duIiwic2xpZGVUb2dnbGVFbGVtZW50cyIsImVhY2giLCJ0b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFBLFFBQ0tDLE9BQU8sYUFBYSxDQUFDLDZCQUE0QixhQUFhO0tBSnZFO0FDQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFELFFBQ0tDLE9BQU8sYUFDUEMsb0JBQU8sVUFBVUMsVUFBVTtRQUN4QkEsU0FBU0MsVUFBVSxpQ0FBUSxVQUFVQyxXQUFXQyxTQUFTO1lBQ3JELElBQUlDLGFBQWE7Z0JBQ1RDLE1BQU07Z0JBQ05DLEtBQUs7OztZQUdiSixVQUFVSyxNQUFNLFVBQVVDLFNBQVM7O1lBR25DLElB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LFlBQVk7OztnQkFHcEMsU0FBUzhTLDJCQUEyQjtvQkFDaEMsSUFBSUUsc0JBQXNCemIsRUFBRXdJLE1BQU15QyxLQUFLOztvQkFFdkNqTCxFQUFFMGIsS0FBS0QscUJBQXFCLFlBQVc7d0JBQ25DemIsRUFBRSxNQUFNMmIsWUFBWTNiLEVBQUUsTUFBTXlJLEtBQUs7Ozs7OztLQXREekQiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnLCBbJ3VpLnJvdXRlcicvKiwgJ3ByZWxvYWQnKi8sICduZ0FuaW1hdGUnLCAnNzIwa2Iuc29jaWFsc2hhcmUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24gKCRwcm92aWRlKSB7XHJcbiAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcignJGxvZycsIGZ1bmN0aW9uICgkZGVsZWdhdGUsICR3aW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsb2dIaXN0b3J5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmxvZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nV2FybiA9ICRkZWxlZ2F0ZS53YXJuO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLndhcm4gPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dXYXJuLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nRXJyID0gJGRlbGVnYXRlLmVycm9yO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmVycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtuYW1lOiBtZXNzYWdlLCBzdGFjazogbmV3IEVycm9yKCkuc3RhY2t9KTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nRXJyLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiBzZW5kT25VbmxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2dIaXN0b3J5LmVyci5sZW5ndGggJiYgIWxvZ0hpc3Rvcnkud2Fybi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKCdwb3N0JywgJy9hcGkvbG9nJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkobG9nSGlzdG9yeSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkZGVsZWdhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpO1xyXG5cclxuLypcclxuICAgICAgICAuZmFjdG9yeSgnbG9nJywgbG9nKTtcclxuXHJcbiAgICBsb2cuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbG9nKCR3aW5kb3csICRsb2cpIHtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHdhcm4oLi4uYXJncykge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChhcmdzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChicm93c2VyTG9nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKGUpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICBzdGFjazogZS5zdGFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJGxvZy5lcnJvcihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdG9kbyBhbGwgZXJyb3JzXHJcblxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2Fybjogd2FybixcclxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgICAgICAgICBzZW5kT25VbmxvYWQ6IHNlbmRPblVubG9hZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIvKlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhjb25maWcpO1xyXG5cclxuICAgIGNvbmZpZy4kaW5qZWN0ID0gWydwcmVsb2FkU2VydmljZVByb3ZpZGVyJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gY29uZmlnKHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIuY29uZmlnKGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksICdHRVQnLCAnZ2V0JywgMTAwLCAnd2FybmluZycpO1xyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2F1dGgvYXV0aC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsndHlwZSc6ICdsb2dpbiBvciBqb2luJ30vKixcclxuXHRcdFx0XHRvbkVudGVyOiBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xyXG5cdFx0XHRcdFx0JHJvb3RTY29wZS4kc3RhdGUgPSBcImF1dGhcIjtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2J1bmdhbG93cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2hvdGVscycsIHtcclxuXHRcdFx0XHRcdHVybDogJy90b3AnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC92aWxsYXMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdnYWxsZXJ5Jywge1xyXG5cdFx0XHRcdHVybDogJy9nYWxsZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdndWVzdGNvbW1lbnRzJywge1xyXG5cdFx0XHRcdHVybDogJy9ndWVzdGNvbW1lbnRzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdkZXN0aW5hdGlvbnMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvZGVzdGluYXRpb25zJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Rlc3RpbmF0aW9ucy9kZXN0aW5hdGlvbnMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdyZXNvcnQnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3Jlc29ydCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3Jlc29ydC5odG1sJyxcclxuXHRcdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0XHRjdXJyZW50RmlsdGVyczoge31cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYm9va2luZycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYm9va2luZz9ob3RlbElkJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J2hvdGVsSWQnOiAnaG90ZWwgSWQnfVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3NlYXJjaCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvc2VhcmNoP3F1ZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydxdWVyeSc6ICdzZWFyY2ggcXVlcnknfVxyXG5cdFx0XHR9KVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLnJ1bihydW4pO1xyXG5cclxuICAgIHJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJyAsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsIC8qJ3ByZWxvYWRTZXJ2aWNlJywqLyAnJHdpbmRvdycsICckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bigkcm9vdFNjb3BlLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgLypwcmVsb2FkU2VydmljZSwqLyAkd2luZG93LCAkdGltZW91dCkge1xyXG4gICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUvKiwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVOYW1lID0gdG9TdGF0ZS5uYW1lO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZS8qLCBmcm9tUGFyYW1zIHRvZG8qLykge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkKCdib2R5Jykuc2Nyb2xsVG9wKDApLCAwKTtcclxuICAgICAgICAgICAgLy8kdGltZW91dCgoKSA9PiAkKCdib2R5Jykuc2Nyb2xsVG9wKDApLCAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyokd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvL3RvZG8gb25sb2FkIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vSDvv70g77+977+977+977+977+977+9XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlLnByZWxvYWRJbWFnZXMoJ2dhbGxlcnknLCB7dXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCBtZXRob2Q6ICdHRVQnLCBhY3Rpb246ICdnZXQnfSk7IC8vdG9kbyBkZWwgbWV0aG9kLCBhY3Rpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIH07Ki9cclxuXHJcbiAgICAgICAgLy9sb2cuc2VuZE9uVW5sb2FkKCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwcmVsb2FkJywgW10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncHJlbG9hZCcpXHJcbiAgICAgICAgLnByb3ZpZGVyKCdwcmVsb2FkU2VydmljZScsIHByZWxvYWRTZXJ2aWNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmVsb2FkU2VydmljZSgpIHtcclxuICAgICAgICBsZXQgY29uZmlnID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBmdW5jdGlvbih1cmwgPSAnL2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2QgPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nID0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxyXG4gICAgICAgICAgICAgICAgbG9nOiBsb2dcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLiRnZXQgPSBmdW5jdGlvbiAoJGh0dHAsICR0aW1lb3V0KSB7XHJcbiAgICAgICAgICAgIGxldCBwcmVsb2FkQ2FjaGUgPSBbXSxcclxuICAgICAgICAgICAgICAgIGxvZ2dlciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmxvZyA9PT0gJ3NpbGVudCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdkZWJ1ZycgJiYgbG9nID09PSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9nID09PSAnd2FybmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkSW1hZ2VzKHByZWxvYWROYW1lLCBpbWFnZXMpIHsgLy90b2RvIGVycm9yc1xyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlc1NyY0xpc3QgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ2FycmF5Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlc1NyY0xpc3QgPSBpbWFnZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRDYWNoZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VzU3JjTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkKGltYWdlc1NyY0xpc3QpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW1hZ2VzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzOiBpbWFnZXMubWV0aG9kIHx8IGNvbmZpZy5tZXRob2QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogaW1hZ2VzLnVybCB8fCBjb25maWcudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLmFjdGlvbiB8fCBjb25maWcuYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlc1NyY0xpc3QgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWRDYWNoZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVsb2FkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcudGltZW91dCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkKGltYWdlc1NyY0xpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5vbmxvYWQgPSBwcmVsb2FkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHByZWxvYWQuYmluZChudWxsLCBpbWFnZXNTcmNMaXN0KSwgY29uZmlnLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnRVJST1InOyAvL3RvZG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZChpbWFnZXNTcmNMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbWFnZXNTcmNMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSBpbWFnZXNTcmNMaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXNvbHZlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcih0aGlzLnNyYywgJ2RlYnVnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFByZWxvYWQocHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcigncHJlbG9hZFNlcnZpY2U6IGdldCByZXF1ZXN0ICcgKyAnXCInICsgcHJlbG9hZE5hbWUgKyAnXCInLCAnZGVidWcnKTtcclxuICAgICAgICAgICAgICAgIGlmICghcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlbG9hZENhY2hlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlbG9hZENhY2hlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZWxvYWRDYWNoZVtpXS5uYW1lID09PSBwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlbG9hZENhY2hlW2ldLnNyY1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ05vIHByZWxvYWRzIGZvdW5kJywgJ3dhcm5pbmcnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHByZWxvYWRJbWFnZXM6IHByZWxvYWRJbWFnZXMsXHJcbiAgICAgICAgICAgICAgICBnZXRQcmVsb2FkQ2FjaGU6IGdldFByZWxvYWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHRvcDM6ICcvYXBpL3RvcDMnLFxyXG4gICAgICAgICAgICBhdXRoOiAnL2FwaS91c2VycycsXHJcbiAgICAgICAgICAgIGdhbGxlcnk6ICcvYXBpL2dhbGxlcnknLFxyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzOiAnL2FwaS9ndWVzdGNvbW1lbnRzJyxcclxuICAgICAgICAgICAgaG90ZWxzOiAnL2FwaS9ob3RlbHMnXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnaG90ZWxEZXRhaWxzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHR5cGVzOiBbXHJcbiAgICAgICAgICAgICAgICAnSG90ZWwnLFxyXG4gICAgICAgICAgICAgICAgJ0J1bmdhbG93JyxcclxuICAgICAgICAgICAgICAgICdWaWxsYSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29hc3QnLFxyXG4gICAgICAgICAgICAgICAgJ0NpdHknLFxyXG4gICAgICAgICAgICAgICAgJ0Rlc2VydCdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGxvY2F0aW9uczogW1xyXG4gICAgICAgICAgICAgICAgJ05hbWliaWEnLFxyXG4gICAgICAgICAgICAgICAgJ0xpYnlhJyxcclxuICAgICAgICAgICAgICAgICdTb3V0aCBBZnJpY2EnLFxyXG4gICAgICAgICAgICAgICAgJ1RhbnphbmlhJyxcclxuICAgICAgICAgICAgICAgICdQYXB1YSBOZXcgR3VpbmVhJyxcclxuICAgICAgICAgICAgICAgICdSZXVuaW9uJyxcclxuICAgICAgICAgICAgICAgICdTd2F6aWxhbmQnLFxyXG4gICAgICAgICAgICAgICAgJ1NhbyBUb21lJyxcclxuICAgICAgICAgICAgICAgICdNYWRhZ2FzY2FyJyxcclxuICAgICAgICAgICAgICAgICdNYXVyaXRpdXMnLFxyXG4gICAgICAgICAgICAgICAgJ1NleWNoZWxsZXMnLFxyXG4gICAgICAgICAgICAgICAgJ01heW90dGUnLFxyXG4gICAgICAgICAgICAgICAgJ1VrcmFpbmUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBndWVzdHM6IFtcclxuICAgICAgICAgICAgICAgICcxJyxcclxuICAgICAgICAgICAgICAgICcyJyxcclxuICAgICAgICAgICAgICAgICczJyxcclxuICAgICAgICAgICAgICAgICc0JyxcclxuICAgICAgICAgICAgICAgICc1J1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgbXVzdEhhdmVzOiBbXHJcbiAgICAgICAgICAgICAgICAncmVzdGF1cmFudCcsXHJcbiAgICAgICAgICAgICAgICAna2lkcycsXHJcbiAgICAgICAgICAgICAgICAncG9vbCcsXHJcbiAgICAgICAgICAgICAgICAnc3BhJyxcclxuICAgICAgICAgICAgICAgICd3aWZpJyxcclxuICAgICAgICAgICAgICAgICdwZXQnLFxyXG4gICAgICAgICAgICAgICAgJ2Rpc2FibGUnLFxyXG4gICAgICAgICAgICAgICAgJ2JlYWNoJyxcclxuICAgICAgICAgICAgICAgICdwYXJraW5nJyxcclxuICAgICAgICAgICAgICAgICdjb25kaXRpb25pbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2xvdW5nZScsXHJcbiAgICAgICAgICAgICAgICAndGVycmFjZScsXHJcbiAgICAgICAgICAgICAgICAnZ2FyZGVuJyxcclxuICAgICAgICAgICAgICAgICdneW0nLFxyXG4gICAgICAgICAgICAgICAgJ2JpY3ljbGVzJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgYWN0aXZpdGllczogW1xyXG4gICAgICAgICAgICAgICAgJ0Nvb2tpbmcgY2xhc3NlcycsXHJcbiAgICAgICAgICAgICAgICAnQ3ljbGluZycsXHJcbiAgICAgICAgICAgICAgICAnRmlzaGluZycsXHJcbiAgICAgICAgICAgICAgICAnR29sZicsXHJcbiAgICAgICAgICAgICAgICAnSGlraW5nJyxcclxuICAgICAgICAgICAgICAgICdIb3JzZS1yaWRpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0theWFraW5nJyxcclxuICAgICAgICAgICAgICAgICdOaWdodGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1NhaWxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NjdWJhIGRpdmluZycsXHJcbiAgICAgICAgICAgICAgICAnU2hvcHBpbmcgLyBtYXJrZXRzJyxcclxuICAgICAgICAgICAgICAgICdTbm9ya2VsbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2tpaW5nJyxcclxuICAgICAgICAgICAgICAgICdTdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaWxkbGlmZScsXHJcbiAgICAgICAgICAgICAgICAnV2luZHN1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmUgdGFzdGluZycsXHJcbiAgICAgICAgICAgICAgICAnWW9nYScgXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBwcmljZTogW1xyXG4gICAgICAgICAgICAgICAgXCJtaW5cIixcclxuICAgICAgICAgICAgICAgIFwibWF4XCJcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgncmVzb3J0U2VydmljZScsIHJlc29ydFNlcnZpY2UpO1xyXG5cclxuICAgIHJlc29ydFNlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnJHEnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXNvcnRTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgJHEpIHtcclxuICAgICAgICBsZXQgbW9kZWwgPSBudWxsO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSZXNvcnQoZmlsdGVyKSB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBlcnJvcnM6IG5vIGhvdGVscywgbm8gZmlsdGVyLi4uXHJcbiAgICAgICAgICAgIGlmIChtb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oYXBwbHlGaWx0ZXIobW9kZWwpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmhvdGVsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcGx5RmlsdGVyKG1vZGVsKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcGx5RmlsdGVyKG1vZGVsKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBhcHBseUZpbHRlcigpIHtcclxuICAgICAgICAgICAgICAgIGlmICghZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlci5wcm9wID09PSAnX2lkJyAmJiBmaWx0ZXIudmFsdWUgPT09ICdyYW5kb20nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpc2NvdW50TW9kZWwgPSBtb2RlbC5maWx0ZXIoKGhvdGVsKSA9PiBob3RlbFsnZGlzY291bnQnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJuZEhvdGVsID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGRpc2NvdW50TW9kZWwubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtkaXNjb3VudE1vZGVsW3JuZEhvdGVsXV1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwuZmlsdGVyKChob3RlbCkgPT4gaG90ZWxbZmlsdGVyLnByb3BdID09IGZpbHRlci52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFJlc29ydDogZ2V0UmVzb3J0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRyb290U2NvcGUsICRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3Q6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduSW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRyb290U2NvcGUsICRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWxldGVUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlVG9rZW46IHNhdmVUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnZXRUb2tlbjogZ2V0VG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlVG9rZW46IGRlbGV0ZVRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuZGVsZXRlVG9rZW4oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5nZXRMb2dJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogdGhpcy5fY3JlZGVudGlhbHMsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5fdG9rZW5LZWVwZXIuZ2V0VG9rZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0NvbnRyb2xsZXInLCBCb29raW5nQ29udHJvbGxlcik7XHJcblxyXG4gICAgQm9va2luZ0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlUGFyYW1zJywgJ3Jlc29ydFNlcnZpY2UnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCb29raW5nQ29udHJvbGxlcigkc3RhdGVQYXJhbXMsIHJlc29ydFNlcnZpY2UsICRzdGF0ZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHRoaXMuaG90ZWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KHtcclxuICAgICAgICAgICAgICAgIHByb3A6ICdfaWQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICRzdGF0ZVBhcmFtcy5ob3RlbElkfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdGVsID0gcmVzcG9uc2VbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL3RoaXMuaG90ZWwgPSAkc3RhdGVQYXJhbXMuaG90ZWw7XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0SG90ZWxJbWFnZXNDb3VudCA9IGZ1bmN0aW9uKGNvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQXJyYXkoY291bnQgLSAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub3BlbkltYWdlID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBpbWdTcmMgPSAkZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0Zvcm1Db250cm9sbGVyJywgQm9va2luZ0Zvcm1Db250cm9sbGVyKVxyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdGb3JtQ29udHJvbGxlcigpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIHRoaXMuZm9ybSA9IHtcclxuICAgICAgICAgICAgZGF0ZTogJ3BpY2sgZGF0ZScsXHJcbiAgICAgICAgICAgIGd1ZXN0czogMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR3Vlc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5ndWVzdHMgIT09IDUgPyB0aGlzLmZvcm0uZ3Vlc3RzKysgOiB0aGlzLmZvcm0uZ3Vlc3RzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gMSA/IHRoaXMuZm9ybS5ndWVzdHMtLSA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2RhdGVQaWNrZXInLCBkYXRlUGlja2VyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlKCRpbnRlcnZhbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcclxuICAgICAgICAgICAgLypzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbDogJz0nXHJcbiAgICAgICAgICAgIH0sKi9cclxuICAgICAgICAgICAgbGluazogZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlTGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgLy90b2RvIGFsbFxyXG4gICAgICAgICAgICAkKCdbZGF0ZS1waWNrZXJdJykuZGF0ZVJhbmdlUGlja2VyKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlOiBuZXcgRGF0ZSgpLnNldEZ1bGxZZWFyKG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSArIDEpLFxyXG4gICAgICAgICAgICAgICAgfSkuYmluZCgnZGF0ZXBpY2tlci1maXJzdC1kYXRlLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZlbnQsIG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gZmlyc3QgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmaXJzdC1kYXRlLXNlbGVjdGVkJyxvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9iaiB3aWxsIGJlIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMTogKERhdGUgb2JqZWN0IG9mIHRoZSBlYXJsaWVyIGRhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNoYW5nZScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBzZWNvbmQgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2UnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kc2V0Vmlld1ZhbHVlKG9iai52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUyOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGxhdGVyIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vXHQgXHR2YWx1ZTogXCIyMDEzLTA2LTA1IHRvIDIwMTMtMDYtMDdcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1hcHBseScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB1c2VyIGNsaWNrcyBvbiB0aGUgYXBwbHkgYnV0dG9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcGx5JyxvYmopO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlZCcsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYWZ0ZXIgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbicsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYmVmb3JlIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbmVkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBvcGVuIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1hcCcsIGFodGxNYXBEaXJlY3RpdmUpO1xuXG4gICAgYWh0bE1hcERpcmVjdGl2ZS4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJ107XG5cbiAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlKHJlc29ydFNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJkZXN0aW5hdGlvbnNfX21hcFwiPjwvZGl2PicsXG4gICAgICAgICAgICBsaW5rOiBhaHRsTWFwRGlyZWN0aXZlTGlua1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICAgICAgbGV0IGhvdGVscyA9IG51bGw7XG5cbiAgICAgICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBob3RlbHMgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICBjcmVhdGVNYXAoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2F0aW9ucyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMucHVzaChbaG90ZWxzW2ldLm5hbWUsIGhvdGVsc1tpXS5fZ21hcHMubGF0LCBob3RlbHNbaV0uX2dtYXBzLmxuZ10pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG15TGF0TG5nID0ge2xhdDogLTI1LjM2MywgbG5nOiAxMzEuMDQ0fTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2JqZWN0IGFuZCBzcGVjaWZ5IHRoZSBET00gZWxlbWVudCBmb3IgZGlzcGxheS5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZGVzdGluYXRpb25zX19tYXAnKVswXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBsb2NhdGlvbnNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcih0aGlzLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKmNlbnRlcmluZyovXG4gICAgICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHt9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuYWxpZ24uaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5RGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlTGluaygkc2NvcGUpIHtcclxuICAgICAgICAgICAgbGV0IGltYWdlc0luR2FsbGVyeSA9IDIwO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyMDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nID0gJCgnPGRpdiBjbGFzcz1cIml0ZW1cIj48aW1nIHNyYz1cImFzc2V0cy9pbWFnZXMvZ2FsbGVyeS9wcmV2aWV3JyArIChpICsgMSkgKyAnLmpwZ1wiIHdpZHRoPVwiMzAwXCI+PC9kaXY+JylcclxuICAgICAgICAgICAgICAgIGltZy5maW5kKCdpbWcnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignbG9hZCcsIGltYWdlTG9hZGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCBpbWFnZUNsaWNrZWQuYmluZChudWxsLCBpKSk7XHJcbiAgICAgICAgICAgICAgICAkKCdbZ2FsbGVyeS1jb250YWluZXJdJykuYXBwZW5kKGltZyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZXNMb2FkZWQgPSAwO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbWFnZUxvYWRlZCgpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlc0xvYWRlZCsrO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWFnZXNMb2FkZWQgPT09IGltYWdlc0luR2FsbGVyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbGlnbmVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JbWFnZXMoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbWFnZUNsaWNrZWQoaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2dhbGxlcnkvJyArICsraW1hZ2UgKyAnLmpwZyc7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZVNyY1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsaWduSW1hZ2VzKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWFzb25yeSA9IG5ldyBNYXNvbnJ5KGNvbnRhaW5lciwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbldpZHRoOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICBndXR0ZXI6ICcuZ3V0dGVyLXNpemVyJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246ICcwLjJzJyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIG1hc29ucnkub24oJ2xheW91dENvbXBsZXRlJywgb25MYXlvdXRDb21wbGV0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWFzb25yeS5sYXlvdXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkxheW91dENvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQoY29udGFpbmVyKS5jc3MoJ29wYWNpdHknLCAnMScpLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4vKlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgICAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICckdGltZW91dCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdwcmVsb2FkU2VydmljZSddO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkaHR0cCwgJHRpbWVvdXQsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCBwcmVsb2FkU2VydmljZSkgeyAvL3RvZG8gbm90IG9ubHkgbG9hZCBidXQgbGlzdFNyYyB0b28gYWNjZXB0XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93Rmlyc3QnLFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dOZXh0J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkudGVtcGxhdGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5TGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgbGV0IGFsbEltYWdlc1NyYyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSAkc2NvcGUuc2hvd0ZpcnN0SW1nQ291bnQsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50ID0gJHNjb3BlLnNob3dOZXh0SW1nQ291bnQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9IE1hdGgubWluKHNob3dGaXJzdEltZ0NvdW50ICsgc2hvd05leHRJbWdDb3VudCwgYWxsSW1hZ2VzU3JjLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dGaXJzdCA9IGFsbEltYWdlc1NyYy5zbGljZSgwLCBzaG93Rmlyc3RJbWdDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQWxsSW1hZ2VzTG9hZGVkID0gdGhpcy5zaG93Rmlyc3QgPj0gYWxsSW1hZ2VzU3JjLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvISokdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7KiEvXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsbEltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob3dGaXJzdCkgPyB0aGlzLnNob3dGaXJzdC5sZW5ndGggPT09IHRoaXMuaW1hZ2VzQ291bnQ6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmdhbGxlcnkgaW1nJykubGVuZ3RoIDwgc2hvd0ZpcnN0SW1nQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb29wcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHRoaXMuYWxpZ25JbWFnZXMsIDApXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMoKTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzQ291bnQgPSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGVsZW0ub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nU3JjID0gZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgLyEqIHZhciAkaW1hZ2VzID0gJCgnLmdhbGxlcnkgaW1nJyk7XHJcbiAgICAgICAgICAgIHZhciBsb2FkZWRfaW1hZ2VzX2NvdW50ID0gMDsqIS9cclxuICAgICAgICAgICAgLyEqJHNjb3BlLmFsaWduSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkX2ltYWdlc19jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkX2ltYWdlc19jb3VudCA9PSAkaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0SW1hZ2VBbGlnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7IC8vIHRvZG9cclxuICAgICAgICAgICAgfTsqIS9cclxuXHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmFsaWduSW1hZ2VzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKGNiKSB7XHJcbiAgICAgICAgICAgIGNiKHByZWxvYWRTZXJ2aWNlLmdldFByZWxvYWRDYWNoZSgnZ2FsbGVyeScpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9zZXRJbWFnZUFsaWdtZW50KCkgeyAvL3RvZG8gYXJndW1lbnRzIG5hbWluZywgZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWd1cmVzID0gJCgnLmdhbGxlcnlfX2ZpZ3VyZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdhbGxlcnlXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY2xvc2VzdCgnLmdhbGxlcnknKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlV2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNzcygnd2lkdGgnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbHVtbnNDb3VudCA9IE1hdGgucm91bmQoZ2FsbGVyeVdpZHRoIC8gaW1hZ2VXaWR0aCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodCA9IG5ldyBBcnJheShjb2x1bW5zQ291bnQgKyAxKS5qb2luKCcwJykuc3BsaXQoJycpLm1hcCgoKSA9PiB7cmV0dXJuIDB9KSwgLy90b2RvIGRlbCBqb2luLXNwbGl0XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHQgPSBjb2x1bW5zSGVpZ2h0LnNsaWNlKDApLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICQoZmlndXJlcykuY3NzKCdtYXJnaW4tdG9wJywgJzAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZmlndXJlcywgZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ21hcmdpbi10b3AnLCAtKE1hdGgubWF4LmFwcGx5KG51bGwsIGNvbHVtbnNIZWlnaHQpIC0gY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSkgKyAncHgnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpICsgY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbHVtblBvaW50ZXIgPT09IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uc0hlaWdodC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodFtpXSArPSBjdXJyZW50Q29sdW1uc0hlaWdodFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcbi8hKiAgICAgICAgLmNvbnRyb2xsZXIoJ0dhbGxlcnlDb250cm9sbGVyJywgR2FsbGVyeUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEdhbGxlcnlDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgIHZhciBpbWFnZXNTcmMgPSBfZ2V0SW1hZ2VTb3VyY2VzKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coaW1hZ2VzU3JjKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LFxyXG4gICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnRVJST1InOyAvL3RvZG9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7KiEvXHJcblxyXG4vISpcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0OiBcIj1haHRsR2FsbGVyeVNob3dGaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgc2hvd0FmdGVyOiBcIj1haHRsR2FsbGVyeVNob3dBZnRlclwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oKXt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYSA9IDEzO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuYSk7XHJcbiAgICAgICAgICAgIC8hKnZhciBhbGxJbWFnZXNTcmM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd0ZpcnN0SW1hZ2VzU3JjID0gWycxMjMnXTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy90b2RvXHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgfSkqIS9cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxufSkoKTsqIS9cclxuKi9cclxuXHJcblxyXG5cclxuLyoyXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7fSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmFsaWduLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBhaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW1ncyA9IG5ldyBBcnJheSgyMCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nc0xvYWRlZCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vcGVuSW1hZ2UgPSBmdW5jdGlvbihpbWFnZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2dhbGxlcnkvJyArIGltYWdlTmFtZSArICcuanBnJztcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZVNyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnYWh0bEdhbGxlcnk6bG9hZGVkJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYSwgY3RybCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkKGVsZW0pLmZpbmQoJ2ltZycpKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ2FodGxHYWxsZXJ5OmxvYWRlZCcsIGFsaWduSW1hZ2VzKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsaWduSW1hZ2VzKCl7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hc29ucnkgPSBuZXcgTWFzb25yeShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uV2lkdGg6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3V0dGVyOiAnLmd1dHRlci1zaXplcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogJzAuMnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TGF5b3V0OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXNvbnJ5Lm9uKCdsYXlvdXRDb21wbGV0ZScsIG9uTGF5b3V0Q29tcGxldGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXNvbnJ5LmxheW91dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkxheW91dENvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkKGNvbnRhaW5lcikuY3NzKCdvcGFjaXR5JywgJzEnKSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0d1ZXN0Y29tbWVudHNDb250cm9sbGVyJywgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcigkcm9vdFNjb3BlLCBndWVzdGNvbW1lbnRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMud3JpdGVDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiRsb2dnZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5nZXRHdWVzdENvbW1lbnRzKCkudGhlbihcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5zZW5kQ29tbWVudCh0aGlzLmZvcm1EYXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cy5wdXNoKHsnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZSwgJ2NvbW1lbnQnOiB0aGlzLmZvcm1EYXRhLmNvbW1lbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGF0YSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3JldmVyc2UnLCByZXZlcnNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXZlcnNlKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgICAgICAgICAvL3RvIGVycm9yc1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbXMuc2xpY2UoKS5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnLCBndWVzdGNvbW1lbnRzU2VydmljZSk7XHJcblxyXG4gICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBndWVzdGNvbW1lbnRzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0R3Vlc3RDb21tZW50czogZ2V0R3Vlc3RDb21tZW50cyxcclxuICAgICAgICAgICAgc2VuZENvbW1lbnQ6IHNlbmRDb21tZW50XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0R3Vlc3RDb21tZW50cyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb21tZW50KGNvbW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXIgPSBhdXRoU2VydmljZS5nZXRMb2dJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IHVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgSGVhZGVyQ29udHJvbGxlcik7XHJcblxyXG4gICAgSGVhZGVyQ29udHJvbGxlci4kaW5qZWN0ID0gWydhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnNpZ25PdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25PdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxIZWFkZXInLCBhaHRsSGVhZGVyKTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bEhlYWRlcigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUFDJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5zZXJ2aWNlKCdIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpO1xyXG5cclxuXHRIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvZyddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJHRpbWVvdXQsICRsb2cpIHtcclxuXHRcdGZ1bmN0aW9uIFVJdHJhbnNpdGlvbnMoY29udGFpbmVyKSB7XHJcblx0XHRcdGlmICghJChjb250YWluZXIpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudCAnJHtjb250YWluZXJ9JyBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9jb250YWluZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5hbmltYXRlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50c1F1ZXJ5LFxyXG5cdFx0XHR7Y3NzRW51bWVyYWJsZVJ1bGUgPSAnd2lkdGgnLCBmcm9tID0gMCwgdG8gPSAnYXV0bycsIGRlbGF5ID0gMTAwfSkge1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2NvbnRhaW5lciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGxldCB0YXJnZXRFbGVtZW50cyA9ICQodGhpcykuZmluZCh0YXJnZXRFbGVtZW50c1F1ZXJ5KSxcclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdGlmICghdGFyZ2V0RWxlbWVudHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHt0YXJnZXRFbGVtZW50c1F1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRcdHJldHVyblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCB0byk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSA9IHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCBmcm9tKTtcclxuXHJcblx0XHRcdFx0bGV0IGFuaW1hdGVPcHRpb25zID0ge307XHJcblx0XHRcdFx0YW5pbWF0ZU9wdGlvbnNbY3NzRW51bWVyYWJsZVJ1bGVdID0gdGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuYW5pbWF0ZShhbmltYXRlT3B0aW9ucywgZGVsYXkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5yZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2sgPSBmdW5jdGlvbihlbGVtZW50VHJpZ2dlclF1ZXJ5LCBlbGVtZW50T25RdWVyeSkge1xyXG5cdFx0XHRpZiAoISQoZWxlbWVudFRyaWdnZXJRdWVyeSkubGVuZ3RoIHx8ICEkKGVsZW1lbnRPblF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtlbGVtZW50VHJpZ2dlclF1ZXJ5fSAke2VsZW1lbnRPblF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnRPblF1ZXJ5KS5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zKGhlYWRlclF1ZXJ5LCBjb250YWluZXJRdWVyeSkge1xyXG5cdFx0XHRVSXRyYW5zaXRpb25zLmNhbGwodGhpcywgY29udGFpbmVyUXVlcnkpO1xyXG5cclxuXHRcdFx0aWYgKCEkKGhlYWRlclF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtoZWFkZXJRdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0dGhpcy5faGVhZGVyID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5faGVhZGVyID0gJChoZWFkZXJRdWVyeSk7XHJcblx0XHR9XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShVSXRyYW5zaXRpb25zLnByb3RvdHlwZSk7XHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZWFkZXJUcmFuc2l0aW9ucztcclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuZml4SGVhZGVyRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50Rml4UXVlcnksIGZpeENsYXNzTmFtZSwgdW5maXhDbGFzc05hbWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2hlYWRlciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgZml4RWxlbWVudCA9ICQoZWxlbWVudEZpeFF1ZXJ5KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCkge1xyXG5cdFx0XHRcdGxldCB0aW1lcjtcclxuXHJcblx0XHRcdFx0ZnVuY3Rpb24gZml4VW5maXhNZW51T25TY3JvbGwoKSB7XHJcblx0XHRcdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gb3B0aW9ucy5vbk1pblNjcm9sbHRvcCkge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LmFkZENsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLmlubmVyV2lkdGgoKTtcclxuXHJcblx0XHRcdFx0aWYgKHdpZHRoIDwgb3B0aW9ucy5vbk1heFdpbmRvd1dpZHRoKSB7XHJcblx0XHRcdFx0XHRmaXhVbmZpeE1lbnVPblNjcm9sbCgpO1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLmFkZENsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRpbWVyKSB7XHJcblx0XHRcdFx0XHRcdFx0dGltZXIgPSAkdGltZW91dChmaXhVbmZpeE1lbnVPblNjcm9sbCwgMTUwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNlbGYuX2hlYWRlci5yZW1vdmVDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCk7XHJcblx0XHRcdCQod2luZG93KS5vbigncmVzaXplJywgb25XaWR0aENoYW5nZUhhbmRsZXIpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIEhlYWRlclRyYW5zaXRpb25zO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFN0aWt5SGVhZGVyJyxhaHRsU3Rpa3lIZWFkZXIpO1xyXG5cclxuXHRhaHRsU3Rpa3lIZWFkZXIuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTdGlreUhlYWRlcihIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKCkge1xyXG5cdFx0XHRsZXQgaGVhZGVyID0gbmV3IEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgnLmwtaGVhZGVyJywgJy5uYXZfX2l0ZW0tY29udGFpbmVyJyk7XHJcblxyXG5cdFx0XHRoZWFkZXIuYW5pbWF0ZVRyYW5zaXRpb24oXHJcblx0XHRcdFx0Jy5zdWItbmF2Jywge1xyXG5cdFx0XHRcdFx0Y3NzRW51bWVyYWJsZVJ1bGU6ICdoZWlnaHQnLFxyXG5cdFx0XHRcdFx0ZGVsYXk6IDMwMH0pXHJcblx0XHRcdFx0LnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayhcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LXRyaWdnZXJdJyxcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LW9uXScpXHJcblx0XHRcdFx0LmZpeEhlYWRlckVsZW1lbnQoXHJcblx0XHRcdFx0XHQnLm5hdicsXHJcblx0XHRcdFx0XHQnanNfbmF2LS1maXhlZCcsXHJcblx0XHRcdFx0XHQnanNfbC1oZWFkZXItLXJlbGF0aXZlJywge1xyXG5cdFx0XHRcdFx0XHRvbk1pblNjcm9sbHRvcDogODgsXHJcblx0XHRcdFx0XHRcdG9uTWF4V2luZG93V2lkdGg6IDg1MH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgSG9tZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEhvbWVDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcihyZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe3Byb3A6ICdfdHJlbmQnLCB2YWx1ZTogdHJ1ZX0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBpZiBub3QgcmVzcG9uc2VcclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1vZGFsJywgYWh0bE1vZGFsRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9tb2RhbC9tb2RhbC5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdtb2RhbE9wZW4nLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ2ltYWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zcmMgPSBkYXRhLnNyYztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5pbWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ21hcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5tYXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ29vZ2xlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBteUxhdGxuZyA9IHtsYXQ6IGRhdGEuY29vcmQubGF0LCBsbmc6IGRhdGEuY29vcmQubG5nfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6ICdyb2FkbWFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBteUxhdGxuZ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBteUxhdGxuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIodGhpcy5nZXRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2VEaWFsb2cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKG5hbWUsIGNvb3JkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIFtuYW1lLCBjb29yZC5sYXQsIGNvb3JkLmxuZ11cclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWxNYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge2xhdDogY29vcmQubGF0LCBsbmc6IGNvb3JkLmxuZ30sXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhaG90ZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuLypcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvISpjZW50ZXJpbmcqIS9cclxuICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzICgpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kYWxNYXAuZml0Qm91bmRzKGJvdW5kcyk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignYWN0aXZpdGllc0ZpbHRlcicsIGFjdGl2aXRpZXNGaWx0ZXIpO1xyXG5cclxuICAgIGFjdGl2aXRpZXNGaWx0ZXIuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFjdGl2aXRpZXNGaWx0ZXIoJGxvZywgZmlsdGVyc1NlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyZywgX3N0cmluZ0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc3RyaW5nTGVuZ3RoID0gcGFyc2VJbnQoX3N0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4oc3RyaW5nTGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBDYW4ndCBwYXJzZSBhcmd1bWVudDogJHtfc3RyaW5nTGVuZ3RofWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZ1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXJnLmpvaW4oJywgJykuc2xpY2UoMCwgc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuc2xpY2UoMCwgcmVzdWx0Lmxhc3RJbmRleE9mKCcsJykpICsgJy4uLidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jlc29ydENvbnRyb2xsZXInLCBSZXNvcnRDb250cm9sbGVyKTtcclxuXHJcbiAgICBSZXNvcnRDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnLCAnJGZpbHRlcicsICckc2NvcGUnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUmVzb3J0Q29udHJvbGxlcihyZXNvcnRTZXJ2aWNlLCAkZmlsdGVyLCAkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICAgIGxldCBjdXJyZW50RmlsdGVycyA9ICRzdGF0ZS4kY3VycmVudC5kYXRhLmN1cnJlbnRGaWx0ZXJzOyAvLyB0ZW1wXHJcblxyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuaW5pdEZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZSA9IGZ1bmN0aW9uKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSA9IGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5wdXNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uc3BsaWNlKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlciksIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBob3RlbHMgPSB7fTtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IGhvdGVscztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLmZpbHRlcnMucHJpY2UsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVycy5wcmljZSA9IFtuZXdWYWx1ZV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjdXJyZW50RmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTsgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuTWFwID0gZnVuY3Rpb24oaG90ZWxOYW1lLCBob3RlbENvb3JkKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogJ21hcCcsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBob3RlbE5hbWUsXHJcbiAgICAgICAgICAgICAgICBjb29yZDogaG90ZWxDb29yZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywgZGF0YSlcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2hvdGVsRmlsdGVyJywgaG90ZWxGaWx0ZXIpO1xyXG5cclxuICAgIGhvdGVsRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBob3RlbEZpbHRlcigkbG9nLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIGxldCBzYXZlZEZpbHRlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbG9hZEZpbHRlcnM6IGxvYWRGaWx0ZXJzLFxyXG4gICAgICAgICAgICBhcHBseUZpbHRlcnM6IGFwcGx5RmlsdGVycyxcclxuICAgICAgICAgICAgaW5pdEZpbHRlcnM6IGluaXRGaWx0ZXJzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9hZEZpbHRlcnMoKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdEZpbHRlcnMoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNhdmVkRmlsdGVycyk7XHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3RlbERldGFpbHNDb25zdGFudFtrZXldLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV0gJiYgc2F2ZWRGaWx0ZXJzW2tleV0uaW5kZXhPZihob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldKSAhPT0gLTEgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9maWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gPSBzYXZlZEZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSB8fCBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZmlsdGVycy5wcmljZSA9IHtcclxuICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgIG1heDogMTAwMFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVycyhob3RlbHMsIGZpbHRlcnMpIHtcclxuICAgICAgICAgICAgc2F2ZWRGaWx0ZXJzID0gZmlsdGVycztcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChob3RlbHMsIGZ1bmN0aW9uKGhvdGVsKSB7XHJcbiAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzLCBmdW5jdGlvbihmaWx0ZXJzSW5Hcm91cCwgZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VGaWx0ZXJNYXRjaGluZyA9IGZhbHNlOyAvLyBmb3IgYWN0aXZpdGllcyBhbmQgbXVzdGhhdmVzIGdyb3Vwc1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdndWVzdHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnNJbkdyb3VwID0gW2ZpbHRlcnNJbkdyb3VwW2ZpbHRlcnNJbkdyb3VwLmxlbmd0aCAtIDFdXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdtdXN0SGF2ZXMnIHx8IGZpbHRlckdyb3VwID09PSAnYWN0aXZpdGllcycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV2ZXJzZUZpbHRlck1hdGNoaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsdGVyc0luR3JvdXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXZlcnNlRmlsdGVyTWF0Y2hpbmcgJiYgZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXZlcnNlRmlsdGVyTWF0Y2hpbmcgJiYgIWdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaEF0TGVhc2VPbmVGaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaChmaWx0ZXJHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xvY2F0aW9ucyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5sb2NhdGlvbi5jb3VudHJ5ID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndHlwZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwudHlwZSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHRpbmdzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmVudmlyb25tZW50ID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbXVzdEhhdmVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmRldGFpbHNbZmlsdGVyXTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdhY3Rpdml0aWVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIH5ob3RlbC5hY3Rpdml0aWVzLmluZGV4T2YoZmlsdGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdwcmljZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5wcmljZSA+PSBmaWx0ZXIubWluICYmIGhvdGVsLnByaWNlIDw9IGZpbHRlci5tYXg7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ3Vlc3RzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmd1ZXN0cy5tYXggPj0gK2ZpbHRlclswXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhvdGVscy5maWx0ZXIoKGhvdGVsKSA9PiAhaG90ZWwuX2hpZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnc2Nyb2xsVG9Ub3AnLCBzY3JvbGxUb1RvcERpcmVjdGl2ZSk7XHJcblxyXG4gICAgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gc2Nyb2xsVG9Ub3BEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IHNjcm9sbFRvVG9wRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGF0dHIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yLCBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoMSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICQudHJpbShhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLnNsaWNlKDAsIGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuaW5kZXhPZignLCcpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcGFyc2VJbnQoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZShhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSArIDEpKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNjcm9sbC10by10b3AtY29uZmlnIGlzIG5vdCBkZWZpbmVkYCk7XHJcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgfHwgJ2h0bWwsIGJvZHknO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbSkub24oYXR0ci5zY3JvbGxUb1RvcCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBoZWlnaHQgfSwgXCJzbG93XCIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgU2VhcmNoQ29udHJvbGxlcik7XHJcblxyXG4gICAgU2VhcmNoQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGUnLCAncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHN0YXRlLCByZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5xdWVyeSA9ICRzdGF0ZS5wYXJhbXMucXVlcnk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5xdWVyeSk7XHJcbiAgICAgICAgdGhpcy5ob3RlbHMgPSBudWxsO1xyXG5cclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcclxuICAgICAgICAgICAgbGV0IHBhcnNlZFF1ZXJ5ID0gJC50cmltKHRoaXMucXVlcnkpLnJlcGxhY2UoL1xccysvZywgJyAnKS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5ob3RlbHMsIChob3RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhob3RlbCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaG90ZWxDb250ZW50ID0gaG90ZWwubmFtZSArIGhvdGVsLmxvY2F0aW9uLmNvdW50cnkgK1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdGVsLmxvY2F0aW9uLnJlZ2lvbiArIGhvdGVsLmRlc2MgKyBob3RlbC5kZXNjTG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGhvdGVsQ29udGVudClcclxuICAgICAgICAgICAgICAgIC8vZm9yICgpXHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlc0NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJzZWRRdWVyeS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBxUmVnRXhwID0gbmV3IFJlZ0V4cChwYXJzZWRRdWVyeVtpXSwgJ2dpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlc0NvdW50ZXIgKz0gKGhvdGVsQ29udGVudC5tYXRjaChxUmVnRXhwKSB8fCBbXSkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzQ291bnRlciA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaG90ZWwuX2lkXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtob3RlbC5faWRdLm1hdGNoZXNDb3VudGVyID0gbWF0Y2hlc0NvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gdGhpcy5ob3RlbHNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGhvdGVsKSA9PiByZXN1bHRbaG90ZWwuX2lkXSlcclxuICAgICAgICAgICAgICAgIC5tYXAoKGhvdGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG90ZWwuX21hdGNoZXMgPSByZXN1bHRbaG90ZWwuX2lkXS5tYXRjaGVzQ291bnRlcjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zZWFyY2hSZXN1bHRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxUb3AzJywgYWh0bFRvcDNEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxUb3AzRGlyZWN0aXZlLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsVG9wM0RpcmVjdGl2ZShyZXNvcnRTZXJ2aWNlLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxUb3AzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndG9wMycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC90b3AzLnRlbXBsYXRlLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bFRvcDNDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICB0aGlzLmRldGFpbHMgPSBob3RlbERldGFpbHNDb25zdGFudC5tdXN0SGF2ZXM7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0VHlwZSA9ICRhdHRycy5haHRsVG9wM3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1nU3JjID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL2ltYWdlcy8nICsgdGhpcy5yZXNvcnRUeXBlICsgJy8nICsgdGhpcy5yZXNvcnRbaW5kZXhdLmltZy5maWxlbmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc1Jlc29ydEluY2x1ZGVEZXRhaWwgPSBmdW5jdGlvbihpdGVtLCBkZXRhaWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZXRhaWxDbGFzc05hbWUgPSAndG9wM19fZGV0YWlsLWNvbnRhaW5lci0tJyArIGRldGFpbCxcclxuICAgICAgICAgICAgICAgICAgICBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUgPSAhaXRlbS5kZXRhaWxzW2RldGFpbF0gPyAnIHRvcDNfX2RldGFpbC1jb250YWluZXItLWhhc250JyA6ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXRhaWxDbGFzc05hbWUgKyBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KHtwcm9wOiAndHlwZScsIHZhbHVlOiB0aGlzLnJlc29ydFR5cGV9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gcmVzcG9uc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlc29ydFR5cGUgPT09ICdIb3RlbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSB0aGlzLnJlc29ydC5maWx0ZXIoKGhvdGVsKSA9PiBob3RlbC5fc2hvd0luVG9wID09PSB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuYW5pbWF0aW9uKCcuc2xpZGVyX19pbWcnLCBhbmltYXRpb25GdW5jdGlvbik7XHJcblxyXG5cdGZ1bmN0aW9uIGFuaW1hdGlvbkZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0YmVmb3JlQWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHRsZXQgc2xpZGluZ0RpcmVjdGlvbiA9IGVsZW1lbnQuc2NvcGUoKS5zbGlkaW5nRGlyZWN0aW9uO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzEnKTtcclxuXHJcblx0XHRcdFx0aWYoc2xpZGluZ0RpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICcxMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnLTIwMCUnfSwgNTAwLCBkb25lKTsgLy8yMDA/ICQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJywgYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNC5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNi5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUGFnZXMnLCBQYWdlcyk7XHJcblxyXG4gICAgUGFnZXMuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUGFnZXMoJHNjb3BlKSB7XHJcbiAgICAgICAgY29uc3QgaG90ZWxzUGVyUGFnZSA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dGcm9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5jdXJyZW50UGFnZSAtIDEpICogaG90ZWxzUGVyUGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiArK3RoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93UHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLS10aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2UgKyAxO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWdlc1RvdGFsLmxlbmd0aCA9PT0gdGhpcy5jdXJyZW50UGFnZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNGaXJzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2UgPT09IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCAoZXZlbnQsIHNob3dIb3RlbENvdW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IG5ldyBBcnJheShNYXRoLmNlaWwoc2hvd0hvdGVsQ291bnQgLyBob3RlbHNQZXJQYWdlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignc2hvd0Zyb20nLCBzaG93RnJvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0Zyb20oKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBzdGFydFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnNsaWNlKHN0YXJ0UG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxQcmljZVNsaWRlcicsIHByaWNlU2xpZGVyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBwcmljZVNsaWRlckRpcmVjdGl2ZS4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiBcIkBcIixcclxuICAgICAgICAgICAgICAgIG1heDogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0U2xpZGVyOiAnPScsXHJcbiAgICAgICAgICAgICAgICByaWdodFNsaWRlcjogJz0nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5odG1sJyxcclxuICAgICAgICAgICAgbGluazogcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rKCRzY29wZSwgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmxlZnRTbGlkZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmlnaHRTbGlkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIubWF4ID0gMTU7Ki9cclxuICAgICAgICAgICAgbGV0IHJpZ2h0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVBcmVhV2lkdGggPSBwYXJzZUludCgkKCcuc2xpZGUnKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVQZXJTdGVwID0gJHNjb3BlLm1heCAvIChzbGlkZUFyZWFXaWR0aCAtIDIwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5taW4gPSBwYXJzZUludCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJHNjb3BlLm1heCA9IHBhcnNlSW50KCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIHJpZ2h0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gc2xpZGVBcmVhV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSArIDIwLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gMCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0RHJhZyhkcmFnRWxlbSwgaW5pdFBvc2l0aW9uLCBtYXhQb3NpdGlvbiwgbWluUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzaGlmdDtcclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2Vkb3duJywgYnRuT25Nb3VzZURvd24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSBldmVudC5wYWdlWDtcclxuICAgICAgICAgICAgICAgICAgICBpbml0UG9zaXRpb24gPSBwYXJzZUludChkcmFnRWxlbS5jc3MoJ2xlZnQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkb2NPbk1vdXNlTW92ZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbkxlc3NUaGFuTWF4ID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA8PSBtYXhQb3NpdGlvbigpIC0gMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uR3JhdGVyVGhhbk1pbiA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPj0gbWluUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uTGVzc1RoYW5NYXggJiYgcG9zaXRpb25HcmF0ZXJUaGFuTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdFbGVtLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIGluaXRQb3NpdGlvbiAtIGV2ZW50LnBhZ2VYICsgc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdkcmFnc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQcmljZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld01pbiA9IH5+KHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF4ID0gfn4ocGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKG5ld01pbik7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKG5ld01heCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0QnRuLmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRCdG4uY3NzKCdsZWZ0JylcclxuICAgICAgICAgICAgICAgICAgICB9KSovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0U2xpZGVycyhidG4sIG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1Bvc3Rpb24gPSBuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcDtcclxuICAgICAgICAgICAgICAgICAgICBidG4uY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidG4uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwID4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpIC0gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMobGVmdEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4Jykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPiAkc2NvcGUubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdWYWx1ZSwkc2NvcGUubWF4ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPCBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSArIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKHJpZ2h0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlbWl0KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZWZ0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEzKTsqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdG9kbyBpZTggYnVnIGZpeFxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnaWU4JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygrc2xpZGVBcmVhV2lkdGggLSArbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsICtzbGlkZUFyZWFXaWR0aCAtIHBhcnNlSW50KG5ld1ZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFNsaWRlT25DbGljaycsIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBsZXQgc2xpZGVFbWl0RWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1lbWl0XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNsaWRlRW1pdEVsZW1lbnRzLm9uKCdjbGljaycsIHNsaWRlRW1pdE9uQ2xpY2spO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2xpZGVFbWl0T25DbGljaygpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzbGlkZU9uRWxlbWVudCA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICcnICYmIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBXcm9uZyBpbml0IHZhbHVlIGZvciAnc2xpZGUtb24nIGF0dHJpYnV0ZSwgc2hvdWxkIGJlICcnIG9yICdjbG9zZWQnLmApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVVcCgnc2xvdycsIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnY2xvc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlRG93bignc2xvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2xpZGVUb2dnbGVFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uLXRvZ2dsZV0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHNsaWRlVG9nZ2xlRWxlbWVudHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCQodGhpcykuYXR0cignc2xpZGUtb24tdG9nZ2xlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iXX0=
