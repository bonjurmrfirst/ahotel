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

        function ahtlGalleryDirectiveLink() {
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
                var imageSrc = 'assets/images/gallery/' + image + '.jpg';

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsImdsb2JhbHMvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy9hdXRoL2F1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvYm9va2luZy9ib29raW5nLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuZm9ybS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYm9va2luZy9kYXRlUGlja2VyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvbW9kYWwvbW9kYWwuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5hY3Rpdml0aWVzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaG90ZWwuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5zY3JvbGx0b1RvcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuYW5pbWF0aW9uLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyUGF0aC5jb25zdGFudC5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvc2xpZGVPbkNsaWNrL3NsaWRlT25DbGljay5kaXJlY3RpdmUuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRwcm92aWRlIiwiZGVjb3JhdG9yIiwiJGRlbGVnYXRlIiwiJHdpbmRvdyIsImxvZ0hpc3RvcnkiLCJ3YXJuIiwiZXJyIiwibG9nIiwibWVzc2FnZSIsIl9sb2dXYXJuIiwicHVzaCIsImFwcGx5IiwiX2xvZ0VyciIsImVycm9yIiwibmFtZSIsInN0YWNrIiwiRXJyb3IiLCJzZW5kT25VbmxvYWQiLCJvbmJlZm9yZXVubG9hZCIsImxlbmd0aCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIiRpbmplY3QiLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJkYXRhIiwiY3VycmVudEZpbHRlcnMiLCJydW4iLCIkcm9vdFNjb3BlIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCIkdGltZW91dCIsIiRsb2dnZWQiLCIkc3RhdGUiLCJjdXJyZW50U3RhdGVOYW1lIiwiY3VycmVudFN0YXRlUGFyYW1zIiwic3RhdGVIaXN0b3J5IiwiJG9uIiwiZXZlbnQiLCJ0b1N0YXRlIiwidG9QYXJhbXMiLCJmcm9tU3RhdGUiLCIkIiwic2Nyb2xsVG9wIiwicHJvdmlkZXIiLCJwcmVsb2FkU2VydmljZSIsIm1ldGhvZCIsImFjdGlvbiIsInRpbWVvdXQiLCIkZ2V0IiwiJGh0dHAiLCJwcmVsb2FkQ2FjaGUiLCJsb2dnZXIiLCJjb25zb2xlIiwiZGVidWciLCJwcmVsb2FkSW1hZ2VzIiwicHJlbG9hZE5hbWUiLCJpbWFnZXMiLCJpbWFnZXNTcmNMaXN0Iiwic3JjIiwicHJlbG9hZCIsInRoZW4iLCJyZXNwb25zZSIsImJpbmQiLCJpIiwiaW1hZ2UiLCJJbWFnZSIsIm9ubG9hZCIsImUiLCJvbmVycm9yIiwiZ2V0UHJlbG9hZCIsImdldFByZWxvYWRDYWNoZSIsImNvbnN0YW50IiwidG9wMyIsImF1dGgiLCJnYWxsZXJ5IiwiZ3Vlc3Rjb21tZW50cyIsImhvdGVscyIsInR5cGVzIiwic2V0dGluZ3MiLCJsb2NhdGlvbnMiLCJndWVzdHMiLCJtdXN0SGF2ZXMiLCJhY3Rpdml0aWVzIiwicHJpY2UiLCJmYWN0b3J5IiwicmVzb3J0U2VydmljZSIsIiRxIiwibW9kZWwiLCJnZXRSZXNvcnQiLCJmaWx0ZXIiLCJ3aGVuIiwiYXBwbHlGaWx0ZXIiLCJvblJlc29sdmUiLCJvblJlamVjdGVkIiwiaG90ZWwiLCJwcm9wIiwidmFsdWUiLCJjb250cm9sbGVyIiwiQXV0aENvbnRyb2xsZXIiLCIkc2NvcGUiLCJhdXRoU2VydmljZSIsInZhbGlkYXRpb25TdGF0dXMiLCJ1c2VyQWxyZWFkeUV4aXN0cyIsImxvZ2luT3JQYXNzd29yZEluY29ycmVjdCIsImNyZWF0ZVVzZXIiLCJuZXdVc2VyIiwiZ28iLCJsb2dpblVzZXIiLCJzaWduSW4iLCJ1c2VyIiwicHJldmlvdXNTdGF0ZSIsIlVzZXIiLCJiYWNrZW5kQXBpIiwiX2JhY2tlbmRBcGkiLCJfY3JlZGVudGlhbHMiLCJfb25SZXNvbHZlIiwic3RhdHVzIiwidG9rZW4iLCJfdG9rZW5LZWVwZXIiLCJzYXZlVG9rZW4iLCJfb25SZWplY3RlZCIsIl90b2tlbiIsImdldFRva2VuIiwiZGVsZXRlVG9rZW4iLCJwcm90b3R5cGUiLCJjcmVkZW50aWFscyIsInNpZ25PdXQiLCJnZXRMb2dJbmZvIiwiQm9va2luZ0NvbnRyb2xsZXIiLCIkc3RhdGVQYXJhbXMiLCJsb2FkZWQiLCJob3RlbElkIiwiZ2V0SG90ZWxJbWFnZXNDb3VudCIsImNvdW50IiwiQXJyYXkiLCJvcGVuSW1hZ2UiLCIkZXZlbnQiLCJpbWdTcmMiLCJ0YXJnZXQiLCIkYnJvYWRjYXN0Iiwic2hvdyIsIkJvb2tpbmdGb3JtQ29udHJvbGxlciIsImZvcm0iLCJkYXRlIiwiYWRkR3Vlc3QiLCJyZW1vdmVHdWVzdCIsInN1Ym1pdCIsImRpcmVjdGl2ZSIsImRhdGVQaWNrZXJEaXJlY3RpdmUiLCIkaW50ZXJ2YWwiLCJyZXF1aXJlIiwibGluayIsImRhdGVQaWNrZXJEaXJlY3RpdmVMaW5rIiwic2NvcGUiLCJlbGVtZW50IiwiYXR0cnMiLCJjdHJsIiwiZGF0ZVJhbmdlUGlja2VyIiwibGFuZ3VhZ2UiLCJzdGFydERhdGUiLCJEYXRlIiwiZW5kRGF0ZSIsInNldEZ1bGxZZWFyIiwiZ2V0RnVsbFllYXIiLCJvYmoiLCIkc2V0Vmlld1ZhbHVlIiwiJHJlbmRlciIsIiRhcHBseSIsImFodGxNYXBEaXJlY3RpdmUiLCJyZXN0cmljdCIsInRlbXBsYXRlIiwiYWh0bE1hcERpcmVjdGl2ZUxpbmsiLCJlbGVtIiwiYXR0ciIsImNyZWF0ZU1hcCIsIndpbmRvdyIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJfZ21hcHMiLCJsYXQiLCJsbmciLCJteUxhdExuZyIsIm1hcCIsIm1hcHMiLCJNYXAiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwic2Nyb2xsd2hlZWwiLCJpY29ucyIsImFob3RlbCIsImljb24iLCJtYXJrZXIiLCJNYXJrZXIiLCJ0aXRsZSIsInBvc2l0aW9uIiwiTGF0TG5nIiwiYWRkTGlzdGVuZXIiLCJzZXRab29tIiwic2V0Q2VudGVyIiwiZ2V0UG9zaXRpb24iLCJib3VuZHMiLCJMYXRMbmdCb3VuZHMiLCJMYXRMYW5nIiwiZXh0ZW5kIiwiZml0Qm91bmRzIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmUiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmsiLCJpbWFnZXNJbkdhbGxlcnkiLCJpbWciLCJmaW5kIiwib24iLCJpbWFnZUxvYWRlZCIsImltYWdlQ2xpY2tlZCIsImFwcGVuZCIsImltYWdlc0xvYWRlZCIsImFsaWduSW1hZ2VzIiwiaW1hZ2VTcmMiLCIkcm9vdCIsImNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJtYXNvbnJ5IiwiTWFzb25yeSIsImNvbHVtbldpZHRoIiwiaXRlbVNlbGVjdG9yIiwiZ3V0dGVyIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwib25MYXlvdXRDb21wbGV0ZSIsImxheW91dCIsImNzcyIsIkd1ZXN0Y29tbWVudHNDb250cm9sbGVyIiwiZ3Vlc3Rjb21tZW50c1NlcnZpY2UiLCJjb21tZW50cyIsIm9wZW5Gb3JtIiwic2hvd1BsZWFzZUxvZ2lNZXNzYWdlIiwid3JpdGVDb21tZW50IiwiZ2V0R3Vlc3RDb21tZW50cyIsImFkZENvbW1lbnQiLCJzZW5kQ29tbWVudCIsImZvcm1EYXRhIiwiY29tbWVudCIsInJldmVyc2UiLCJpdGVtcyIsInNsaWNlIiwidHlwZSIsIm9uUmVqZWN0IiwiSGVhZGVyQ29udHJvbGxlciIsImFodGxIZWFkZXIiLCJzZXJ2aWNlIiwiSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlIiwiJGxvZyIsIlVJdHJhbnNpdGlvbnMiLCJfY29udGFpbmVyIiwiYW5pbWF0ZVRyYW5zaXRpb24iLCJ0YXJnZXRFbGVtZW50c1F1ZXJ5IiwiY3NzRW51bWVyYWJsZVJ1bGUiLCJmcm9tIiwidG8iLCJkZWxheSIsIm1vdXNlZW50ZXIiLCJ0YXJnZXRFbGVtZW50cyIsInRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGUiLCJhbmltYXRlT3B0aW9ucyIsImFuaW1hdGUiLCJyZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2siLCJlbGVtZW50VHJpZ2dlclF1ZXJ5IiwiZWxlbWVudE9uUXVlcnkiLCJIZWFkZXJUcmFuc2l0aW9ucyIsImhlYWRlclF1ZXJ5IiwiY29udGFpbmVyUXVlcnkiLCJjYWxsIiwiX2hlYWRlciIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiZml4SGVhZGVyRWxlbWVudCIsImVsZW1lbnRGaXhRdWVyeSIsImZpeENsYXNzTmFtZSIsInVuZml4Q2xhc3NOYW1lIiwib3B0aW9ucyIsInNlbGYiLCJmaXhFbGVtZW50Iiwib25XaWR0aENoYW5nZUhhbmRsZXIiLCJ0aW1lciIsImZpeFVuZml4TWVudU9uU2Nyb2xsIiwib25NaW5TY3JvbGx0b3AiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwid2lkdGgiLCJpbm5lcldpZHRoIiwib25NYXhXaW5kb3dXaWR0aCIsIm9mZiIsInNjcm9sbCIsImFodGxTdGlreUhlYWRlciIsImhlYWRlciIsIkhvbWVDb250cm9sbGVyIiwiYWh0bE1vZGFsRGlyZWN0aXZlIiwicmVwbGFjZSIsImFodGxNb2RhbERpcmVjdGl2ZUxpbmsiLCJ1bmRlZmluZWQiLCJteUxhdGxuZyIsImNvb3JkIiwibWFwVHlwZUlkIiwiem9vbSIsImNlbnRlciIsImNsb3NlRGlhbG9nIiwibW9kYWxNYXAiLCJhY3Rpdml0aWVzRmlsdGVyIiwiZmlsdGVyc1NlcnZpY2UiLCJhcmciLCJfc3RyaW5nTGVuZ3RoIiwic3RyaW5nTGVuZ3RoIiwicGFyc2VJbnQiLCJpc05hTiIsInJlc3VsdCIsImpvaW4iLCJsYXN0SW5kZXhPZiIsIlJlc29ydENvbnRyb2xsZXIiLCIkZmlsdGVyIiwiJGN1cnJlbnQiLCJmaWx0ZXJzIiwiaW5pdEZpbHRlcnMiLCJvbkZpbHRlckNoYW5nZSIsImZpbHRlckdyb3VwIiwic3BsaWNlIiwiaW5kZXhPZiIsImFwcGx5RmlsdGVycyIsImdldFNob3dIb3RlbENvdW50IiwicmVkdWNlIiwiY291bnRlciIsIml0ZW0iLCJfaGlkZSIsIiR3YXRjaCIsIm5ld1ZhbHVlIiwib3Blbk1hcCIsImhvdGVsTmFtZSIsImhvdGVsQ29vcmQiLCJob3RlbEZpbHRlciIsImhvdGVsRGV0YWlsc0NvbnN0YW50Iiwic2F2ZWRGaWx0ZXJzIiwibG9hZEZpbHRlcnMiLCJrZXkiLCJtaW4iLCJtYXgiLCJmb3JFYWNoIiwiaXNIb3RlbE1hdGNoaW5nRmlsdGVycyIsImZpbHRlcnNJbkdyb3VwIiwibWF0Y2hBdExlYXNlT25lRmlsdGVyIiwicmV2ZXJzZUZpbHRlck1hdGNoaW5nIiwiZ2V0SG90ZWxQcm9wIiwibG9jYXRpb24iLCJjb3VudHJ5IiwiZW52aXJvbm1lbnQiLCJkZXRhaWxzIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmUiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsiLCJzZWxlY3RvciIsImhlaWdodCIsInRyaW0iLCJzY3JvbGxUb1RvcENvbmZpZyIsInNjcm9sbFRvVG9wIiwiU2VhcmNoQ29udHJvbGxlciIsInF1ZXJ5Iiwic2VhcmNoIiwicGFyc2VkUXVlcnkiLCJzcGxpdCIsImhvdGVsQ29udGVudCIsInJlZ2lvbiIsImRlc2MiLCJkZXNjTG9jYXRpb24iLCJtYXRjaGVzQ291bnRlciIsInFSZWdFeHAiLCJSZWdFeHAiLCJtYXRjaCIsIl9pZCIsInNlYXJjaFJlc3VsdHMiLCJfbWF0Y2hlcyIsImFodGxUb3AzRGlyZWN0aXZlIiwidG9wM1NlcnZpY2UiLCJBaHRsVG9wM0NvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCIkZWxlbWVudCIsIiRhdHRycyIsIm11c3RIYXZlIiwicmVzb3J0VHlwZSIsImFodGxUb3AzdHlwZSIsInJlc29ydCIsImdldEltZ1NyYyIsImluZGV4IiwiZmlsZW5hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWwiLCJkZXRhaWwiLCJkZXRhaWxDbGFzc05hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUiLCJnZXRUb3AzUGxhY2VzIiwiYW5pbWF0aW9uIiwiYW5pbWF0aW9uRnVuY3Rpb24iLCJiZWZvcmVBZGRDbGFzcyIsImNsYXNzTmFtZSIsImRvbmUiLCJzbGlkaW5nRGlyZWN0aW9uIiwiYWh0bFNsaWRlciIsInNsaWRlclNlcnZpY2UiLCJhaHRsU2xpZGVyQ29udHJvbGxlciIsInNsaWRlciIsIm5leHRTbGlkZSIsInByZXZTbGlkZSIsInNldFNsaWRlIiwic2V0TmV4dFNsaWRlIiwic2V0UHJldlNsaWRlIiwiZ2V0Q3VycmVudFNsaWRlIiwic2V0Q3VycmVudFNsaWRlIiwiZml4SUU4cG5nQmxhY2tCZyIsImFycm93cyIsImNsaWNrIiwiZGlzYWJsZWQiLCJzbGlkZXJJbWdQYXRoQ29uc3RhbnQiLCJTbGlkZXIiLCJzbGlkZXJJbWFnZUxpc3QiLCJfaW1hZ2VTcmNMaXN0IiwiX2N1cnJlbnRTbGlkZSIsImdldEltYWdlU3JjTGlzdCIsImdldEluZGV4Iiwic2xpZGUiLCJQYWdlcyIsImhvdGVsc1BlclBhZ2UiLCJjdXJyZW50UGFnZSIsInBhZ2VzVG90YWwiLCJzaG93RnJvbSIsInNob3dOZXh0Iiwic2hvd1ByZXYiLCJzZXRQYWdlIiwicGFnZSIsImlzTGFzdFBhZ2UiLCJpc0ZpcnN0UGFnZSIsInNob3dIb3RlbENvdW50IiwiTWF0aCIsImNlaWwiLCJzdGFydFBvc2l0aW9uIiwicHJpY2VTbGlkZXJEaXJlY3RpdmUiLCJsZWZ0U2xpZGVyIiwicmlnaHRTbGlkZXIiLCJwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsiLCJyaWdodEJ0biIsImxlZnRCdG4iLCJzbGlkZUFyZWFXaWR0aCIsInZhbHVlUGVyU3RlcCIsInZhbCIsImluaXREcmFnIiwiZHJhZ0VsZW0iLCJpbml0UG9zaXRpb24iLCJtYXhQb3NpdGlvbiIsIm1pblBvc2l0aW9uIiwic2hpZnQiLCJidG5Pbk1vdXNlRG93biIsInBhZ2VYIiwiZG9jT25Nb3VzZU1vdmUiLCJidG5Pbk1vdXNlVXAiLCJwb3NpdGlvbkxlc3NUaGFuTWF4IiwicG9zaXRpb25HcmF0ZXJUaGFuTWluIiwic2V0UHJpY2VzIiwiZW1pdCIsIm5ld01pbiIsIm5ld01heCIsInNldFNsaWRlcnMiLCJidG4iLCJuZXdQb3N0aW9uIiwiaGFzQ2xhc3MiLCJ0cmlnZ2VyIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rIiwic2xpZGVFbWl0RWxlbWVudHMiLCJzbGlkZUVtaXRPbkNsaWNrIiwic2xpZGVPbkVsZW1lbnQiLCJzbGlkZVVwIiwib25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlIiwic2xpZGVEb3duIiwic2xpZGVUb2dnbGVFbGVtZW50cyIsImVhY2giLCJ0b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFBLFFBQ0tDLE9BQU8sYUFBYSxDQUFDLDZCQUE0QixhQUFhO0tBSnZFO0FDQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFELFFBQ0tDLE9BQU8sYUFDUEMsb0JBQU8sVUFBVUMsVUFBVTtRQUN4QkEsU0FBU0MsVUFBVSxpQ0FBUSxVQUFVQyxXQUFXQyxTQUFTO1lBQ3JELElBQUlDLGFBQWE7Z0JBQ1RDLE1BQU07Z0JBQ05DLEtBQUs7OztZQUdiSixVQUFVSyxNQUFNLFVBQVVD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Z0IsSUFBSTtvQkFDeEMrUyxlQUFlQyxRQUFRLFFBQVFDO29CQUMvQkYsZUFBZS9TLEtBQUssWUFBWTt1QkFDN0I7b0JBQ0hpVDtvQkFDQUYsZUFBZUcsVUFBVTtvQkFDekJILGVBQWUvUyxLQUFLLFlBQVk7OztnQkFHcEMsU0FBU2lULDJCQUEyQjtvQkFDaEMsSUFBSUUsc0JBQXNCdmIsRUFBRW1JLE1BQU15QyxLQUFLOztvQkFFdkM1SyxFQUFFd2IsS0FBS0QscUJBQXFCLFlBQVc7d0JBQ25DdmIsRUFBRSxNQUFNeWIsWUFBWXpiLEVBQUUsTUFBTW9JLEtBQUs7Ozs7OztLQXREekQiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnLCBbJ3VpLnJvdXRlcicvKiwgJ3ByZWxvYWQnKi8sICduZ0FuaW1hdGUnLCAnNzIwa2Iuc29jaWFsc2hhcmUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24gKCRwcm92aWRlKSB7XHJcbiAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcignJGxvZycsIGZ1bmN0aW9uICgkZGVsZWdhdGUsICR3aW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsb2dIaXN0b3J5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmxvZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nV2FybiA9ICRkZWxlZ2F0ZS53YXJuO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLndhcm4gPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dXYXJuLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nRXJyID0gJGRlbGVnYXRlLmVycm9yO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmVycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtuYW1lOiBtZXNzYWdlLCBzdGFjazogbmV3IEVycm9yKCkuc3RhY2t9KTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nRXJyLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiBzZW5kT25VbmxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2dIaXN0b3J5LmVyci5sZW5ndGggJiYgIWxvZ0hpc3Rvcnkud2Fybi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKCdwb3N0JywgJy9hcGkvbG9nJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkobG9nSGlzdG9yeSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkZGVsZWdhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpO1xyXG5cclxuLypcclxuICAgICAgICAuZmFjdG9yeSgnbG9nJywgbG9nKTtcclxuXHJcbiAgICBsb2cuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbG9nKCR3aW5kb3csICRsb2cpIHtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHdhcm4oLi4uYXJncykge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChhcmdzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChicm93c2VyTG9nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKGUpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICBzdGFjazogZS5zdGFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJGxvZy5lcnJvcihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdG9kbyBhbGwgZXJyb3JzXHJcblxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2Fybjogd2FybixcclxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgICAgICAgICBzZW5kT25VbmxvYWQ6IHNlbmRPblVubG9hZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIvKlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhjb25maWcpO1xyXG5cclxuICAgIGNvbmZpZy4kaW5qZWN0ID0gWydwcmVsb2FkU2VydmljZVByb3ZpZGVyJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gY29uZmlnKHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIuY29uZmlnKGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksICdHRVQnLCAnZ2V0JywgMTAwLCAnd2FybmluZycpO1xyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2F1dGgvYXV0aC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsndHlwZSc6ICdsb2dpbiBvciBqb2luJ30vKixcclxuXHRcdFx0XHRvbkVudGVyOiBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xyXG5cdFx0XHRcdFx0JHJvb3RTY29wZS4kc3RhdGUgPSBcImF1dGhcIjtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2J1bmdhbG93cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2hvdGVscycsIHtcclxuXHRcdFx0XHRcdHVybDogJy90b3AnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC92aWxsYXMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdnYWxsZXJ5Jywge1xyXG5cdFx0XHRcdHVybDogJy9nYWxsZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdndWVzdGNvbW1lbnRzJywge1xyXG5cdFx0XHRcdHVybDogJy9ndWVzdGNvbW1lbnRzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdkZXN0aW5hdGlvbnMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvZGVzdGluYXRpb25zJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Rlc3RpbmF0aW9ucy9kZXN0aW5hdGlvbnMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdyZXNvcnQnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3Jlc29ydCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3Jlc29ydC5odG1sJyxcclxuXHRcdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0XHRjdXJyZW50RmlsdGVyczoge31cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYm9va2luZycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYm9va2luZz9ob3RlbElkJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J2hvdGVsSWQnOiAnaG90ZWwgSWQnfVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3NlYXJjaCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvc2VhcmNoP3F1ZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydxdWVyeSc6ICdzZWFyY2ggcXVlcnknfVxyXG5cdFx0XHR9KVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLnJ1bihydW4pO1xyXG5cclxuICAgIHJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJyAsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsIC8qJ3ByZWxvYWRTZXJ2aWNlJywqLyAnJHdpbmRvdycsICckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bigkcm9vdFNjb3BlLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgLypwcmVsb2FkU2VydmljZSwqLyAkd2luZG93LCAkdGltZW91dCkge1xyXG4gICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUvKiwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVOYW1lID0gdG9TdGF0ZS5uYW1lO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZS8qLCBmcm9tUGFyYW1zIHRvZG8qLykge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkKCdib2R5Jykuc2Nyb2xsVG9wKDApLCAwKTtcclxuICAgICAgICAgICAgLy8kdGltZW91dCgoKSA9PiAkKCdib2R5Jykuc2Nyb2xsVG9wKDApLCAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyokd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvL3RvZG8gb25sb2FkIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vSDvv70g77+977+977+977+977+977+9XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlLnByZWxvYWRJbWFnZXMoJ2dhbGxlcnknLCB7dXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCBtZXRob2Q6ICdHRVQnLCBhY3Rpb246ICdnZXQnfSk7IC8vdG9kbyBkZWwgbWV0aG9kLCBhY3Rpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIH07Ki9cclxuXHJcbiAgICAgICAgLy9sb2cuc2VuZE9uVW5sb2FkKCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwcmVsb2FkJywgW10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgncHJlbG9hZCcpXHJcbiAgICAgICAgLnByb3ZpZGVyKCdwcmVsb2FkU2VydmljZScsIHByZWxvYWRTZXJ2aWNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmVsb2FkU2VydmljZSgpIHtcclxuICAgICAgICBsZXQgY29uZmlnID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBmdW5jdGlvbih1cmwgPSAnL2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2QgPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nID0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxyXG4gICAgICAgICAgICAgICAgbG9nOiBsb2dcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLiRnZXQgPSBmdW5jdGlvbiAoJGh0dHAsICR0aW1lb3V0KSB7XHJcbiAgICAgICAgICAgIGxldCBwcmVsb2FkQ2FjaGUgPSBbXSxcclxuICAgICAgICAgICAgICAgIGxvZ2dlciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmxvZyA9PT0gJ3NpbGVudCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdkZWJ1ZycgJiYgbG9nID09PSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9nID09PSAnd2FybmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkSW1hZ2VzKHByZWxvYWROYW1lLCBpbWFnZXMpIHsgLy90b2RvIGVycm9yc1xyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlc1NyY0xpc3QgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ2FycmF5Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlc1NyY0xpc3QgPSBpbWFnZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRDYWNoZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VzU3JjTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkKGltYWdlc1NyY0xpc3QpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW1hZ2VzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzOiBpbWFnZXMubWV0aG9kIHx8IGNvbmZpZy5tZXRob2QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogaW1hZ2VzLnVybCB8fCBjb25maWcudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLmFjdGlvbiB8fCBjb25maWcuYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlc1NyY0xpc3QgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWRDYWNoZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVsb2FkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcudGltZW91dCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkKGltYWdlc1NyY0xpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5vbmxvYWQgPSBwcmVsb2FkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHByZWxvYWQuYmluZChudWxsLCBpbWFnZXNTcmNMaXN0KSwgY29uZmlnLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnRVJST1InOyAvL3RvZG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZChpbWFnZXNTcmNMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbWFnZXNTcmNMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSBpbWFnZXNTcmNMaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXNvbHZlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcih0aGlzLnNyYywgJ2RlYnVnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFByZWxvYWQocHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcigncHJlbG9hZFNlcnZpY2U6IGdldCByZXF1ZXN0ICcgKyAnXCInICsgcHJlbG9hZE5hbWUgKyAnXCInLCAnZGVidWcnKTtcclxuICAgICAgICAgICAgICAgIGlmICghcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlbG9hZENhY2hlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlbG9hZENhY2hlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZWxvYWRDYWNoZVtpXS5uYW1lID09PSBwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlbG9hZENhY2hlW2ldLnNyY1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ05vIHByZWxvYWRzIGZvdW5kJywgJ3dhcm5pbmcnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHByZWxvYWRJbWFnZXM6IHByZWxvYWRJbWFnZXMsXHJcbiAgICAgICAgICAgICAgICBnZXRQcmVsb2FkQ2FjaGU6IGdldFByZWxvYWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHRvcDM6ICcvYXBpL3RvcDMnLFxyXG4gICAgICAgICAgICBhdXRoOiAnL2FwaS91c2VycycsXHJcbiAgICAgICAgICAgIGdhbGxlcnk6ICcvYXBpL2dhbGxlcnknLFxyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzOiAnL2FwaS9ndWVzdGNvbW1lbnRzJyxcclxuICAgICAgICAgICAgaG90ZWxzOiAnL2FwaS9ob3RlbHMnXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnaG90ZWxEZXRhaWxzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHR5cGVzOiBbXHJcbiAgICAgICAgICAgICAgICAnSG90ZWwnLFxyXG4gICAgICAgICAgICAgICAgJ0J1bmdhbG93JyxcclxuICAgICAgICAgICAgICAgICdWaWxsYSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29hc3QnLFxyXG4gICAgICAgICAgICAgICAgJ0NpdHknLFxyXG4gICAgICAgICAgICAgICAgJ0Rlc2VydCdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGxvY2F0aW9uczogW1xyXG4gICAgICAgICAgICAgICAgJ05hbWliaWEnLFxyXG4gICAgICAgICAgICAgICAgJ0xpYnlhJyxcclxuICAgICAgICAgICAgICAgICdTb3V0aCBBZnJpY2EnLFxyXG4gICAgICAgICAgICAgICAgJ1RhbnphbmlhJyxcclxuICAgICAgICAgICAgICAgICdQYXB1YSBOZXcgR3VpbmVhJyxcclxuICAgICAgICAgICAgICAgICdSZXVuaW9uJyxcclxuICAgICAgICAgICAgICAgICdTd2F6aWxhbmQnLFxyXG4gICAgICAgICAgICAgICAgJ1NhbyBUb21lJyxcclxuICAgICAgICAgICAgICAgICdNYWRhZ2FzY2FyJyxcclxuICAgICAgICAgICAgICAgICdNYXVyaXRpdXMnLFxyXG4gICAgICAgICAgICAgICAgJ1NleWNoZWxsZXMnLFxyXG4gICAgICAgICAgICAgICAgJ01heW90dGUnLFxyXG4gICAgICAgICAgICAgICAgJ1VrcmFpbmUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBndWVzdHM6IFtcclxuICAgICAgICAgICAgICAgICcxJyxcclxuICAgICAgICAgICAgICAgICcyJyxcclxuICAgICAgICAgICAgICAgICczJyxcclxuICAgICAgICAgICAgICAgICc0JyxcclxuICAgICAgICAgICAgICAgICc1J1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgbXVzdEhhdmVzOiBbXHJcbiAgICAgICAgICAgICAgICAncmVzdGF1cmFudCcsXHJcbiAgICAgICAgICAgICAgICAna2lkcycsXHJcbiAgICAgICAgICAgICAgICAncG9vbCcsXHJcbiAgICAgICAgICAgICAgICAnc3BhJyxcclxuICAgICAgICAgICAgICAgICd3aWZpJyxcclxuICAgICAgICAgICAgICAgICdwZXQnLFxyXG4gICAgICAgICAgICAgICAgJ2Rpc2FibGUnLFxyXG4gICAgICAgICAgICAgICAgJ2JlYWNoJyxcclxuICAgICAgICAgICAgICAgICdwYXJraW5nJyxcclxuICAgICAgICAgICAgICAgICdjb25kaXRpb25pbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2xvdW5nZScsXHJcbiAgICAgICAgICAgICAgICAndGVycmFjZScsXHJcbiAgICAgICAgICAgICAgICAnZ2FyZGVuJyxcclxuICAgICAgICAgICAgICAgICdneW0nLFxyXG4gICAgICAgICAgICAgICAgJ2JpY3ljbGVzJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgYWN0aXZpdGllczogW1xyXG4gICAgICAgICAgICAgICAgJ0Nvb2tpbmcgY2xhc3NlcycsXHJcbiAgICAgICAgICAgICAgICAnQ3ljbGluZycsXHJcbiAgICAgICAgICAgICAgICAnRmlzaGluZycsXHJcbiAgICAgICAgICAgICAgICAnR29sZicsXHJcbiAgICAgICAgICAgICAgICAnSGlraW5nJyxcclxuICAgICAgICAgICAgICAgICdIb3JzZS1yaWRpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0theWFraW5nJyxcclxuICAgICAgICAgICAgICAgICdOaWdodGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1NhaWxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NjdWJhIGRpdmluZycsXHJcbiAgICAgICAgICAgICAgICAnU2hvcHBpbmcgLyBtYXJrZXRzJyxcclxuICAgICAgICAgICAgICAgICdTbm9ya2VsbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2tpaW5nJyxcclxuICAgICAgICAgICAgICAgICdTdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaWxkbGlmZScsXHJcbiAgICAgICAgICAgICAgICAnV2luZHN1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmUgdGFzdGluZycsXHJcbiAgICAgICAgICAgICAgICAnWW9nYScgXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBwcmljZTogW1xyXG4gICAgICAgICAgICAgICAgXCJtaW5cIixcclxuICAgICAgICAgICAgICAgIFwibWF4XCJcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgncmVzb3J0U2VydmljZScsIHJlc29ydFNlcnZpY2UpO1xyXG5cclxuICAgIHJlc29ydFNlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnJHEnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXNvcnRTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgJHEpIHtcclxuICAgICAgICBsZXQgbW9kZWwgPSBudWxsO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSZXNvcnQoZmlsdGVyKSB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBlcnJvcnM6IG5vIGhvdGVscywgbm8gZmlsdGVyLi4uXHJcbiAgICAgICAgICAgIGlmIChtb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oYXBwbHlGaWx0ZXIobW9kZWwpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmhvdGVsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcGx5RmlsdGVyKG1vZGVsKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcGx5RmlsdGVyKG1vZGVsKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBhcHBseUZpbHRlcigpIHtcclxuICAgICAgICAgICAgICAgIGlmICghZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmZpbHRlcigoaG90ZWwpID0+IGhvdGVsW2ZpbHRlci5wcm9wXSA9PSBmaWx0ZXIudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRSZXNvcnQ6IGdldFJlc29ydFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIEF1dGhDb250cm9sbGVyKTtcclxuXHJcbiAgICBBdXRoQ29udHJvbGxlci4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRzY29wZScsICdhdXRoU2VydmljZScsICckc3RhdGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBBdXRoQ29udHJvbGxlcigkcm9vdFNjb3BlLCAkc2NvcGUsIGF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMgPSB7XHJcbiAgICAgICAgICAgIHVzZXJBbHJlYWR5RXhpc3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgbG9naW5PclBhc3N3b3JkSW5jb3JyZWN0OiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5jcmVhdGVVc2VyKHRoaXMubmV3VXNlcilcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gJ09LJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXV0aCcsIHsndHlwZSc6ICdsb2dpbid9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy51c2VyQWxyZWFkeUV4aXN0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygkc2NvcGUuZm9ybUpvaW4pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5ld1VzZXIpOyovXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dpblVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbkluKHRoaXMudXNlcilcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gJ09LJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmV2aW91c1N0YXRlID0gJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5WyRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeS5sZW5ndGggLSAyXSB8fCAnaG9tZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHByZXZpb3VzU3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28ocHJldmlvdXNTdGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMubG9naW5PclBhc3N3b3JkSW5jb3JyZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ2F1dGhTZXJ2aWNlJywgYXV0aFNlcnZpY2UpO1xyXG5cclxuICAgIGF1dGhTZXJ2aWNlLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhdXRoU2VydmljZSgkcm9vdFNjb3BlLCAkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICAvL3RvZG8gZXJyb3JzXHJcbiAgICAgICAgZnVuY3Rpb24gVXNlcihiYWNrZW5kQXBpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JhY2tlbmRBcGkgPSBiYWNrZW5kQXBpO1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVkZW50aWFscyA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9vblJlc29sdmUgPSAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS50b2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlci5zYXZlVG9rZW4ocmVzcG9uc2UuZGF0YS50b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnT0snXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9vblJlamVjdGVkID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlciA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0b2tlbiA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2F2ZVRva2VuKF90b2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSBfdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zyh0b2tlbilcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZXRUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZGVsZXRlVG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZVRva2VuOiBzYXZlVG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0VG9rZW46IGdldFRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZVRva2VuOiBkZWxldGVUb2tlblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5zaWduSW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVkZW50aWFscyA9IGNyZWRlbnRpYWxzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuX2NyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25PdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLmRlbGV0ZVRva2VuKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuZ2V0TG9nSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6IHRoaXMuX2NyZWRlbnRpYWxzLFxyXG4gICAgICAgICAgICAgICAgdG9rZW46IHRoaXMuX3Rva2VuS2VlcGVyLmdldFRva2VuKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgVXNlcihiYWNrZW5kUGF0aHNDb25zdGFudC5hdXRoKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0Jvb2tpbmdDb250cm9sbGVyJywgQm9va2luZ0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEJvb2tpbmdDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzdGF0ZVBhcmFtcycsICdyZXNvcnRTZXJ2aWNlJywgJyRzdGF0ZScsICckcm9vdFNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQm9va2luZ0NvbnRyb2xsZXIoJHN0YXRlUGFyYW1zLCByZXNvcnRTZXJ2aWNlLCAkc3RhdGUsICRyb290U2NvcGUpIHtcclxuICAgICAgICB0aGlzLmhvdGVsID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygkc3RhdGUpO1xyXG5cclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7XHJcbiAgICAgICAgICAgICAgICBwcm9wOiAnX2lkJyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAkc3RhdGVQYXJhbXMuaG90ZWxJZH0pXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3RlbCA9IHJlc3BvbnNlWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy90aGlzLmhvdGVsID0gJHN0YXRlUGFyYW1zLmhvdGVsO1xyXG5cclxuICAgICAgICB0aGlzLmdldEhvdGVsSW1hZ2VzQ291bnQgPSBmdW5jdGlvbihjb3VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEFycmF5KGNvdW50IC0gMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm9wZW5JbWFnZSA9IGZ1bmN0aW9uKCRldmVudCkge1xyXG4gICAgICAgICAgICBsZXQgaW1nU3JjID0gJGV2ZW50LnRhcmdldC5zcmM7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNyYzogaW1nU3JjXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0Jvb2tpbmdGb3JtQ29udHJvbGxlcicsIEJvb2tpbmdGb3JtQ29udHJvbGxlcilcclxuXHJcbiAgICBmdW5jdGlvbiBCb29raW5nRm9ybUNvbnRyb2xsZXIoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICAgICB0aGlzLmZvcm0gPSB7XHJcbiAgICAgICAgICAgIGRhdGU6ICdwaWNrIGRhdGUnLFxyXG4gICAgICAgICAgICBndWVzdHM6IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEd1ZXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcm0uZ3Vlc3RzICE9PSA1ID8gdGhpcy5mb3JtLmd1ZXN0cysrIDogdGhpcy5mb3JtLmd1ZXN0c1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlR3Vlc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5ndWVzdHMgIT09IDEgPyB0aGlzLmZvcm0uZ3Vlc3RzLS0gOiB0aGlzLmZvcm0uZ3Vlc3RzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zdWJtaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdkYXRlUGlja2VyJywgZGF0ZVBpY2tlckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gZGF0ZVBpY2tlckRpcmVjdGl2ZSgkaW50ZXJ2YWwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXHJcbiAgICAgICAgICAgIC8qc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIG5nTW9kZWw6ICc9J1xyXG4gICAgICAgICAgICB9LCovXHJcbiAgICAgICAgICAgIGxpbms6IGRhdGVQaWNrZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBhbGxcclxuICAgICAgICAgICAgJCgnW2RhdGUtcGlja2VyXScpLmRhdGVSYW5nZVBpY2tlcihcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogJ2VuJyxcclxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGU6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZTogbmV3IERhdGUoKS5zZXRGdWxsWWVhcihuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkgKyAxKSxcclxuICAgICAgICAgICAgICAgIH0pLmJpbmQoJ2RhdGVwaWNrZXItZmlyc3QtZGF0ZS1zZWxlY3RlZCcsIGZ1bmN0aW9uKGV2ZW50LCBvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIGZpcnN0IGRhdGUgaXMgc2VsZWN0ZWQgKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmlyc3QtZGF0ZS1zZWxlY3RlZCcsb2JqKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBvYmogd2lsbCBiZSBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTE6IChEYXRlIG9iamVjdCBvZiB0aGUgZWFybGllciBkYXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1jaGFuZ2UnLGZ1bmN0aW9uKGV2ZW50LG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gc2Vjb25kIGRhdGUgaXMgc2VsZWN0ZWQgKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hhbmdlJyxvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZShvYmoudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9iaiB3aWxsIGJlIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMTogKERhdGUgb2JqZWN0IG9mIHRoZSBlYXJsaWVyIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMjogKERhdGUgb2JqZWN0IG9mIHRoZSBsYXRlciBkYXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAvL1x0IFx0dmFsdWU6IFwiMjAxMy0wNi0wNSB0byAyMDEzLTA2LTA3XCJcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItYXBwbHknLGZ1bmN0aW9uKGV2ZW50LG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gdXNlciBjbGlja3Mgb24gdGhlIGFwcGx5IGJ1dHRvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhcHBseScsb2JqKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1jbG9zZScsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYmVmb3JlIGRhdGUgcmFuZ2UgcGlja2VyIGNsb3NlIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiZWZvcmUgY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1jbG9zZWQnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGFmdGVyIGRhdGUgcmFuZ2UgcGlja2VyIGNsb3NlIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciBjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLW9wZW4nLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGJlZm9yZSBkYXRlIHJhbmdlIHBpY2tlciBvcGVuIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiZWZvcmUgb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLW9wZW5lZCcsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYWZ0ZXIgZGF0ZSByYW5nZSBwaWNrZXIgb3BlbiBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxNYXAnLCBhaHRsTWFwRGlyZWN0aXZlKTtcblxuICAgIGFodGxNYXBEaXJlY3RpdmUuJGluamVjdCA9IFsncmVzb3J0U2VydmljZSddO1xuXG4gICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZShyZXNvcnRTZXJ2aWNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZGVzdGluYXRpb25zX19tYXBcIj48L2Rpdj4nLFxuICAgICAgICAgICAgbGluazogYWh0bE1hcERpcmVjdGl2ZUxpbmtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGF0dHIpIHtcbiAgICAgICAgICAgIGxldCBob3RlbHMgPSBudWxsO1xuXG4gICAgICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaG90ZWxzID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgY3JlYXRlTWFwKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlTWFwKCkge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZ29vZ2xlICYmICdtYXBzJyBpbiB3aW5kb3cuZ29vZ2xlKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IG1hcFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xuICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwU2NyaXB0KTtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2NhdGlvbnMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhvdGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zLnB1c2goW2hvdGVsc1tpXS5uYW1lLCBob3RlbHNbaV0uX2dtYXBzLmxhdCwgaG90ZWxzW2ldLl9nbWFwcy5sbmddKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBteUxhdExuZyA9IHtsYXQ6IC0yNS4zNjMsIGxuZzogMTMxLjA0NH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Rlc3RpbmF0aW9uc19fbWFwJylbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaWNvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhaG90ZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnYXNzZXRzL2ltYWdlcy9pY29uX21hcC5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbG9jYXRpb25zW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKDgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIodGhpcy5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLypjZW50ZXJpbmcqL1xuICAgICAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIExhdExhbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQoTGF0TGFuZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7fSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmFsaWduLmh0bWwnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmsoKSB7XHJcbiAgICAgICAgICAgIGxldCBpbWFnZXNJbkdhbGxlcnkgPSAyMDtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjA7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltZyA9ICQoJzxkaXYgY2xhc3M9XCJpdGVtXCI+PGltZyBzcmM9XCJhc3NldHMvaW1hZ2VzL2dhbGxlcnkvcHJldmlldycgKyAoaSArIDEpICsgJy5qcGdcIiB3aWR0aD1cIjMwMFwiPjwvZGl2PicpXHJcbiAgICAgICAgICAgICAgICBpbWcuZmluZCgnaW1nJylcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2xvYWQnLCBpbWFnZUxvYWRlZClcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgaW1hZ2VDbGlja2VkLmJpbmQobnVsbCwgaSkpO1xyXG4gICAgICAgICAgICAgICAgJCgnW2dhbGxlcnktY29udGFpbmVyXScpLmFwcGVuZChpbWcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2VzTG9hZGVkID0gMDtcclxuICAgICAgICAgICAgZnVuY3Rpb24gaW1hZ2VMb2FkZWQoKSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZXNMb2FkZWQrKztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1hZ2VzTG9hZGVkID09PSBpbWFnZXNJbkdhbGxlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWxpZ25lZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSW1hZ2VzKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW1hZ2VDbGlja2VkKGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VTcmMgPSAnYXNzZXRzL2ltYWdlcy9nYWxsZXJ5LycgKyBpbWFnZSArICcuanBnJztcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlU3JjXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYWxpZ25JbWFnZXMoKXtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtYXNvbnJ5ID0gbmV3IE1hc29ucnkoY29udGFpbmVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uV2lkdGg6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGd1dHRlcjogJy5ndXR0ZXItc2l6ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogJzAuMnMnLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWFzb25yeS5vbignbGF5b3V0Q29tcGxldGUnLCBvbkxheW91dENvbXBsZXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtYXNvbnJ5LmxheW91dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTGF5b3V0Q29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJChjb250YWluZXIpLmNzcygnb3BhY2l0eScsICcxJyksIDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuXHJcbi8qXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJyR0aW1lb3V0JywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCAkdGltZW91dCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlKSB7IC8vdG9kbyBub3Qgb25seSBsb2FkIGJ1dCBsaXN0U3JjIHRvbyBhY2NlcHRcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dGaXJzdCcsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd05leHQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsSW1hZ2VzU3JjID0gW10sXHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9ICRzY29wZS5zaG93Rmlyc3RJbWdDb3VudCxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQgPSAkc2NvcGUuc2hvd05leHRJbWdDb3VudDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gTWF0aC5taW4oc2hvd0ZpcnN0SW1nQ291bnQgKyBzaG93TmV4dEltZ0NvdW50LCBhbGxJbWFnZXNTcmMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBbGxJbWFnZXNMb2FkZWQgPSB0aGlzLnNob3dGaXJzdCA+PSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8hKiR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50LCAwKTsqIS9cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsSW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvd0ZpcnN0KSA/IHRoaXMuc2hvd0ZpcnN0Lmxlbmd0aCA9PT0gdGhpcy5pbWFnZXNDb3VudDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuZ2FsbGVyeSBpbWcnKS5sZW5ndGggPCBzaG93Rmlyc3RJbWdDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvb3BzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQodGhpcy5hbGlnbkltYWdlcywgMClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcygpO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNDb3VudCA9IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5TGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbS5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdTcmMgPSBldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1nU3JjXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAvISogdmFyICRpbWFnZXMgPSAkKCcuZ2FsbGVyeSBpbWcnKTtcclxuICAgICAgICAgICAgdmFyIGxvYWRlZF9pbWFnZXNfY291bnQgPSAwOyohL1xyXG4gICAgICAgICAgICAvISokc2NvcGUuYWxpZ25JbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRpbWFnZXMubG9hZChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRfaW1hZ2VzX2NvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkZWRfaW1hZ2VzX2NvdW50ID09ICRpbWFnZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRJbWFnZUFsaWdtZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50LCAwKTsgLy8gdG9kb1xyXG4gICAgICAgICAgICB9OyohL1xyXG5cclxuICAgICAgICAgICAgLy8kc2NvcGUuYWxpZ25JbWFnZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoY2IpIHtcclxuICAgICAgICAgICAgY2IocHJlbG9hZFNlcnZpY2UuZ2V0UHJlbG9hZENhY2hlKCdnYWxsZXJ5JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3NldEltYWdlQWxpZ21lbnQoKSB7IC8vdG9kbyBhcmd1bWVudHMgbmFtaW5nLCBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ3VyZXMgPSAkKCcuZ2FsbGVyeV9fZmlndXJlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FsbGVyeVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jbG9zZXN0KCcuZ2FsbGVyeScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY3NzKCd3aWR0aCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uc0NvdW50ID0gTWF0aC5yb3VuZChnYWxsZXJ5V2lkdGggLyBpbWFnZVdpZHRoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0ID0gbmV3IEFycmF5KGNvbHVtbnNDb3VudCArIDEpLmpvaW4oJzAnKS5zcGxpdCgnJykubWFwKCgpID0+IHtyZXR1cm4gMH0pLCAvL3RvZG8gZGVsIGpvaW4tc3BsaXRcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodCA9IGNvbHVtbnNIZWlnaHQuc2xpY2UoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgJChmaWd1cmVzKS5jc3MoJ21hcmdpbi10b3AnLCAnMCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChmaWd1cmVzLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnbWFyZ2luLXRvcCcsIC0oTWF0aC5tYXguYXBwbHkobnVsbCwgY29sdW1uc0hlaWdodCkgLSBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSkgKyBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uUG9pbnRlciA9PT0gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zSGVpZ2h0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0W2ldICs9IGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuLyEqICAgICAgICAuY29udHJvbGxlcignR2FsbGVyeUNvbnRyb2xsZXInLCBHYWxsZXJ5Q29udHJvbGxlcik7XHJcblxyXG4gICAgR2FsbGVyeUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGltYWdlc1NyYyA9IF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhpbWFnZXNTcmMpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsqIS9cclxuXHJcbi8hKlxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3Q6IFwiPWFodGxHYWxsZXJ5U2hvd0ZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG93QWZ0ZXI6IFwiPWFodGxHYWxsZXJ5U2hvd0FmdGVyXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigpe31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hID0gMTM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5hKTtcclxuICAgICAgICAgICAgLyEqdmFyIGFsbEltYWdlc1NyYztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5zaG93Rmlyc3RJbWFnZXNTcmMgPSBbJzEyMyddO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG9cclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KSohL1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyohL1xyXG4qL1xyXG5cclxuXHJcblxyXG4vKjJcclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHt9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuYWxpZ24uaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5RGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbWdzID0gbmV3IEFycmF5KDIwKTtcclxuICAgICAgICAgICAgdGhpcy5pbWdzTG9hZGVkID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9wZW5JbWFnZSA9IGZ1bmN0aW9uKGltYWdlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvZ2FsbGVyeS8nICsgaW1hZ2VOYW1lICsgJy5qcGcnO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlU3JjXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdhaHRsR2FsbGVyeTpsb2FkZWQnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCQoZWxlbSkuZmluZCgnaW1nJykpO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbignYWh0bEdhbGxlcnk6bG9hZGVkJywgYWxpZ25JbWFnZXMpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYWxpZ25JbWFnZXMoKXtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWFzb25yeSA9IG5ldyBNYXNvbnJ5KGNvbnRhaW5lciwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5XaWR0aDogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBndXR0ZXI6ICcuZ3V0dGVyLXNpemVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiAnMC4ycycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hc29ucnkub24oJ2xheW91dENvbXBsZXRlJywgb25MYXlvdXRDb21wbGV0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hc29ucnkubGF5b3V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTGF5b3V0Q29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQoY29udGFpbmVyKS5jc3MoJ29wYWNpdHknLCAnMScpLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXInLCBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcik7XHJcblxyXG4gICAgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICdndWVzdGNvbW1lbnRzU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKCRyb290U2NvcGUsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy53cml0ZUNvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJGxvZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLmdldEd1ZXN0Q29tbWVudHMoKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLnNlbmRDb21tZW50KHRoaXMuZm9ybURhdGEpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2goeyduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lLCAnY29tbWVudCc6IHRoaXMuZm9ybURhdGEuY29tbWVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1EYXRhID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcigncmV2ZXJzZScsIHJldmVyc2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJldmVyc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIC8vdG8gZXJyb3JzXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtcy5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdndWVzdGNvbW1lbnRzU2VydmljZScsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKTtcclxuXHJcbiAgICBndWVzdGNvbW1lbnRzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRHdWVzdENvbW1lbnRzOiBnZXRHdWVzdENvbW1lbnRzLFxyXG4gICAgICAgICAgICBzZW5kQ29tbWVudDogc2VuZENvbW1lbnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRHdWVzdENvbW1lbnRzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbW1lbnQoY29tbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF1dGhTZXJ2aWNlLmdldExvZ0luZm8oKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlcixcclxuICAgICAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTtcclxuXHJcbiAgICBIZWFkZXJDb250cm9sbGVyLiRpbmplY3QgPSBbJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcihhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2lnbk91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbk91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsIGFodGxIZWFkZXIpO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9nJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgkdGltZW91dCwgJGxvZykge1xyXG5cdFx0ZnVuY3Rpb24gVUl0cmFuc2l0aW9ucyhjb250YWluZXIpIHtcclxuXHRcdFx0aWYgKCEkKGNvbnRhaW5lcikubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50ICcke2NvbnRhaW5lcn0nIG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmFuaW1hdGVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fY29udGFpbmVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bGV0IHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRFbGVtZW50cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke3RhcmdldEVsZW1lbnRzUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIHRvKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRsZXQgYW5pbWF0ZU9wdGlvbnMgPSB7fTtcclxuXHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayA9IGZ1bmN0aW9uKGVsZW1lbnRUcmlnZ2VyUXVlcnksIGVsZW1lbnRPblF1ZXJ5KSB7XHJcblx0XHRcdGlmICghJChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5sZW5ndGggfHwgISQoZWxlbWVudE9uUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2VsZW1lbnRUcmlnZ2VyUXVlcnl9ICR7ZWxlbWVudE9uUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWxlbWVudE9uUXVlcnkpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnMoaGVhZGVyUXVlcnksIGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdFVJdHJhbnNpdGlvbnMuY2FsbCh0aGlzLCBjb250YWluZXJRdWVyeSk7XHJcblxyXG5cdFx0XHRpZiAoISQoaGVhZGVyUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2hlYWRlclF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnRGaXhRdWVyeSwgZml4Q2xhc3NOYW1lLCB1bmZpeENsYXNzTmFtZSwgb3B0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5faGVhZGVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBmaXhFbGVtZW50ID0gJChlbGVtZW50Rml4UXVlcnkpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykuaW5uZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLnJlbW92ZUNsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b25XaWR0aENoYW5nZUhhbmRsZXIoKTtcclxuXHRcdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBvbldpZHRoQ2hhbmdlSGFuZGxlcik7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcik7XHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoKSB7XHJcblx0XHRcdGxldCBoZWFkZXIgPSBuZXcgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCcubC1oZWFkZXInLCAnLm5hdl9faXRlbS1jb250YWluZXInKTtcclxuXHJcblx0XHRcdGhlYWRlci5hbmltYXRlVHJhbnNpdGlvbihcclxuXHRcdFx0XHQnLnN1Yi1uYXYnLCB7XHJcblx0XHRcdFx0XHRjc3NFbnVtZXJhYmxlUnVsZTogJ2hlaWdodCcsXHJcblx0XHRcdFx0XHRkZWxheTogMzAwfSlcclxuXHRcdFx0XHQucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrKFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtdHJpZ2dlcl0nLFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtb25dJylcclxuXHRcdFx0XHQuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHRcdCdqc19uYXYtLWZpeGVkJyxcclxuXHRcdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdFx0b25NYXhXaW5kb3dXaWR0aDogODUwfSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcik7XHJcblxyXG4gICAgSG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKHJlc29ydFNlcnZpY2UpIHtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7cHJvcDogJ190cmVuZCcsIHZhbHVlOiB0cnVlfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgLy90b2RvIGlmIG5vdCByZXNwb25zZVxyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTW9kYWwnLCBhaHRsTW9kYWxEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgcmVwbGFjZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxNb2RhbERpcmVjdGl2ZUxpbmssXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL21vZGFsL21vZGFsLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3cgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ21vZGFsT3BlbicsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAnaW1hZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNyYyA9IGRhdGEuc3JjO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LmltZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAnbWFwJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93Lm1hcCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nb29nbGUgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZ29vZ2xlICYmICdtYXBzJyBpbiB3aW5kb3cuZ29vZ2xlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXBTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcFNjcmlwdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG15TGF0bG5nID0ge2xhdDogZGF0YS5jb29yZC5sYXQsIGxuZzogZGF0YS5jb29yZC5sbmd9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbF9fbWFwJylbMF0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogJ3JvYWRtYXAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiA4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IG15TGF0bG5nXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG15TGF0bG5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKDEyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcih0aGlzLmdldFBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5jbG9zZURpYWxvZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNob3cgPSB7fTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNYXAobmFtZSwgY29vcmQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbnMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgW25hbWUsIGNvb3JkLmxhdCwgY29vcmQubG5nXVxyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2JqZWN0IGFuZCBzcGVjaWZ5IHRoZSBET00gZWxlbWVudCBmb3IgZGlzcGxheS5cclxuICAgICAgICAgICAgICAgIHZhciBtb2RhbE1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiB7bGF0OiBjb29yZC5sYXQsIGxuZzogY29vcmQubG5nfSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogOVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGljb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnYXNzZXRzL2ltYWdlcy9pY29uX21hcC5wbmcnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtb2RhbE1hcCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4vKlxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3JkLmxhdCwgY29vcmQubG5nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtb2RhbE1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8hKmNlbnRlcmluZyohL1xyXG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMgKCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBMYXRMYW5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyAobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQoTGF0TGFuZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RhbE1hcC5maXRCb3VuZHMoYm91bmRzKTsqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdhY3Rpdml0aWVzRmlsdGVyJywgYWN0aXZpdGllc0ZpbHRlcik7XHJcblxyXG4gICAgYWN0aXZpdGllc0ZpbHRlci4kaW5qZWN0ID0gWyckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gYWN0aXZpdGllc0ZpbHRlcigkbG9nLCBmaWx0ZXJzU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYXJnLCBfc3RyaW5nTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzdHJpbmdMZW5ndGggPSBwYXJzZUludChfc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc05hTihzdHJpbmdMZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYENhbid0IHBhcnNlIGFyZ3VtZW50OiAke19zdHJpbmdMZW5ndGh9YCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBhcmcuam9pbignLCAnKS5zbGljZSgwLCBzdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5zbGljZSgwLCByZXN1bHQubGFzdEluZGV4T2YoJywnKSkgKyAnLi4uJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUmVzb3J0Q29udHJvbGxlcicsIFJlc29ydENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFJlc29ydENvbnRyb2xsZXIuJGluamVjdCA9IFsncmVzb3J0U2VydmljZScsICckZmlsdGVyJywgJyRzY29wZScsICckc3RhdGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSZXNvcnRDb250cm9sbGVyKHJlc29ydFNlcnZpY2UsICRmaWx0ZXIsICRzY29wZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRGaWx0ZXJzID0gJHN0YXRlLiRjdXJyZW50LmRhdGEuY3VycmVudEZpbHRlcnM7IC8vIHRlbXBcclxuXHJcbiAgICAgICAgdGhpcy5maWx0ZXJzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5pbml0RmlsdGVycygpO1xyXG5cclxuICAgICAgICB0aGlzLm9uRmlsdGVyQ2hhbmdlID0gZnVuY3Rpb24oZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpIHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhmaWx0ZXJHcm91cCwgZmlsdGVyLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdID0gY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLnB1c2goZmlsdGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5zcGxpY2UoY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLmluZGV4T2YoZmlsdGVyKSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpLmFwcGx5RmlsdGVycyhob3RlbHMsIGN1cnJlbnRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGhvdGVscyA9IHt9O1xyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gaG90ZWxzO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMuZmlsdGVycy5wcmljZSxcclxuICAgICAgICAgICAgICAgIChuZXdWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzLnByaWNlID0gW25ld1ZhbHVlXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGN1cnJlbnRGaWx0ZXJzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpLmFwcGx5RmlsdGVycyhob3RlbHMsIGN1cnJlbnRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpOyAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5NYXAgPSBmdW5jdGlvbihob3RlbE5hbWUsIGhvdGVsQ29vcmQsIGhvdGVsKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogJ21hcCcsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBob3RlbE5hbWUsXHJcbiAgICAgICAgICAgICAgICBjb29yZDogaG90ZWxDb29yZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywgZGF0YSlcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2hvdGVsRmlsdGVyJywgaG90ZWxGaWx0ZXIpO1xyXG5cclxuICAgIGhvdGVsRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBob3RlbEZpbHRlcigkbG9nLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIGxldCBzYXZlZEZpbHRlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbG9hZEZpbHRlcnM6IGxvYWRGaWx0ZXJzLFxyXG4gICAgICAgICAgICBhcHBseUZpbHRlcnM6IGFwcGx5RmlsdGVycyxcclxuICAgICAgICAgICAgaW5pdEZpbHRlcnM6IGluaXRGaWx0ZXJzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9hZEZpbHRlcnMoKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdEZpbHRlcnMoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNhdmVkRmlsdGVycyk7XHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3RlbERldGFpbHNDb25zdGFudFtrZXldLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV0gJiYgc2F2ZWRGaWx0ZXJzW2tleV0uaW5kZXhPZihob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldKSAhPT0gLTEgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9maWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gPSBzYXZlZEZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSB8fCBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZmlsdGVycy5wcmljZSA9IHtcclxuICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgIG1heDogMTAwMFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVycyhob3RlbHMsIGZpbHRlcnMpIHtcclxuICAgICAgICAgICAgc2F2ZWRGaWx0ZXJzID0gZmlsdGVycztcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChob3RlbHMsIGZ1bmN0aW9uKGhvdGVsKSB7XHJcbiAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzLCBmdW5jdGlvbihmaWx0ZXJzSW5Hcm91cCwgZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VGaWx0ZXJNYXRjaGluZyA9IGZhbHNlOyAvLyBmb3IgYWN0aXZpdGllcyBhbmQgbXVzdGhhdmVzIGdyb3Vwc1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdndWVzdHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnNJbkdyb3VwID0gW2ZpbHRlcnNJbkdyb3VwW2ZpbHRlcnNJbkdyb3VwLmxlbmd0aCAtIDFdXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdtdXN0SGF2ZXMnIHx8IGZpbHRlckdyb3VwID09PSAnYWN0aXZpdGllcycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV2ZXJzZUZpbHRlck1hdGNoaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsdGVyc0luR3JvdXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXZlcnNlRmlsdGVyTWF0Y2hpbmcgJiYgZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXZlcnNlRmlsdGVyTWF0Y2hpbmcgJiYgIWdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaEF0TGVhc2VPbmVGaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaChmaWx0ZXJHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xvY2F0aW9ucyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5sb2NhdGlvbi5jb3VudHJ5ID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndHlwZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwudHlwZSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHRpbmdzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmVudmlyb25tZW50ID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbXVzdEhhdmVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmRldGFpbHNbZmlsdGVyXTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdhY3Rpdml0aWVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIH5ob3RlbC5hY3Rpdml0aWVzLmluZGV4T2YoZmlsdGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdwcmljZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5wcmljZSA+PSBmaWx0ZXIubWluICYmIGhvdGVsLnByaWNlIDw9IGZpbHRlci5tYXg7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ3Vlc3RzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmd1ZXN0cy5tYXggPj0gK2ZpbHRlclswXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhvdGVscy5maWx0ZXIoKGhvdGVsKSA9PiAhaG90ZWwuX2hpZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnc2Nyb2xsVG9Ub3AnLCBzY3JvbGxUb1RvcERpcmVjdGl2ZSk7XHJcblxyXG4gICAgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gc2Nyb2xsVG9Ub3BEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IHNjcm9sbFRvVG9wRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGF0dHIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yLCBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoMSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICQudHJpbShhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLnNsaWNlKDAsIGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuaW5kZXhPZignLCcpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcGFyc2VJbnQoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZShhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSArIDEpKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNjcm9sbC10by10b3AtY29uZmlnIGlzIG5vdCBkZWZpbmVkYCk7XHJcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgfHwgJ2h0bWwsIGJvZHknO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbSkub24oYXR0ci5zY3JvbGxUb1RvcCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBoZWlnaHQgfSwgXCJzbG93XCIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgU2VhcmNoQ29udHJvbGxlcik7XHJcblxyXG4gICAgU2VhcmNoQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGUnLCAncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHN0YXRlLCByZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5xdWVyeSA9ICRzdGF0ZS5wYXJhbXMucXVlcnk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5xdWVyeSk7XHJcbiAgICAgICAgdGhpcy5ob3RlbHMgPSBudWxsO1xyXG5cclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcclxuICAgICAgICAgICAgbGV0IHBhcnNlZFF1ZXJ5ID0gJC50cmltKHRoaXMucXVlcnkpLnJlcGxhY2UoL1xccysvZywgJyAnKS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5ob3RlbHMsIChob3RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhob3RlbCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaG90ZWxDb250ZW50ID0gaG90ZWwubmFtZSArIGhvdGVsLmxvY2F0aW9uLmNvdW50cnkgK1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdGVsLmxvY2F0aW9uLnJlZ2lvbiArIGhvdGVsLmRlc2MgKyBob3RlbC5kZXNjTG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGhvdGVsQ29udGVudClcclxuICAgICAgICAgICAgICAgIC8vZm9yICgpXHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlc0NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJzZWRRdWVyeS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBxUmVnRXhwID0gbmV3IFJlZ0V4cChwYXJzZWRRdWVyeVtpXSwgJ2dpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlc0NvdW50ZXIgKz0gKGhvdGVsQ29udGVudC5tYXRjaChxUmVnRXhwKSB8fCBbXSkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzQ291bnRlciA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaG90ZWwuX2lkXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtob3RlbC5faWRdLm1hdGNoZXNDb3VudGVyID0gbWF0Y2hlc0NvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gdGhpcy5ob3RlbHNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGhvdGVsKSA9PiByZXN1bHRbaG90ZWwuX2lkXSlcclxuICAgICAgICAgICAgICAgIC5tYXAoKGhvdGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG90ZWwuX21hdGNoZXMgPSByZXN1bHRbaG90ZWwuX2lkXS5tYXRjaGVzQ291bnRlcjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zZWFyY2hSZXN1bHRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxUb3AzJywgYWh0bFRvcDNEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxUb3AzRGlyZWN0aXZlLiRpbmplY3QgPSBbJ3RvcDNTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFRvcDNEaXJlY3RpdmUodG9wM1NlcnZpY2UsIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bFRvcDNDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd0b3AzJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL3RvcDMudGVtcGxhdGUuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsVG9wM0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWlscyA9IGhvdGVsRGV0YWlsc0NvbnN0YW50Lm11c3RIYXZlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydFR5cGUgPSAkYXR0cnMuYWh0bFRvcDN0eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEltZ1NyYyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9pbWFnZXMvJyArIHRoaXMucmVzb3J0VHlwZSArICcvJyArIHRoaXMucmVzb3J0W2luZGV4XS5pbWcuZmlsZW5hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNSZXNvcnRJbmNsdWRlRGV0YWlsID0gZnVuY3Rpb24oaXRlbSwgZGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0YWlsQ2xhc3NOYW1lID0gJ3RvcDNfX2RldGFpbC1jb250YWluZXItLScgKyBkZXRhaWwsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lID0gIWl0ZW0uZGV0YWlsc1tkZXRhaWxdID8gJyB0b3AzX19kZXRhaWwtY29udGFpbmVyLS1oYXNudCcgOiAnJztcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0YWlsQ2xhc3NOYW1lICsgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0b3AzU2VydmljZS5nZXRUb3AzUGxhY2VzKHRoaXMucmVzb3J0VHlwZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnJlc29ydCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ3RvcDNTZXJ2aWNlJywgdG9wM1NlcnZpY2UpO1xyXG5cclxuICAgIHRvcDNTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gdG9wM1NlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0VG9wM1BsYWNlczogZ2V0VG9wM1BsYWNlc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRvcDNQbGFjZXModHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQudG9wMyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5hbmltYXRpb24oJy5zbGlkZXJfX2ltZycsIGFuaW1hdGlvbkZ1bmN0aW9uKTtcclxuXHJcblx0ZnVuY3Rpb24gYW5pbWF0aW9uRnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRiZWZvcmVBZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZSkge1xyXG5cdFx0XHRcdGxldCBzbGlkaW5nRGlyZWN0aW9uID0gZWxlbWVudC5zY29wZSgpLnNsaWRpbmdEaXJlY3Rpb247XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMScpO1xyXG5cclxuXHRcdFx0XHRpZihzbGlkaW5nRGlyZWN0aW9uID09PSAncmlnaHQnKSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJzEwMCUnfSwgNTAwLCBkb25lKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICctMjAwJSd9LCA1MDAsIGRvbmUpOyAvLzIwMD8gJClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHRhZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZSkge1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzAnKTtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnbGVmdCcsICcwJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxTbGlkZXInLCBhaHRsU2xpZGVyKTtcclxuXHJcblx0YWh0bFNsaWRlci4kaW5qZWN0ID0gWydzbGlkZXJTZXJ2aWNlJywgJyR0aW1lb3V0J107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTbGlkZXIoc2xpZGVyU2VydmljZSwgJHRpbWVvdXQpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHRzY29wZToge30sXHJcblx0XHRcdGNvbnRyb2xsZXI6IGFodGxTbGlkZXJDb250cm9sbGVyLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5odG1sJyxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBhaHRsU2xpZGVyQ29udHJvbGxlcigkc2NvcGUpIHtcclxuXHRcdFx0JHNjb3BlLnNsaWRlciA9IHNsaWRlclNlcnZpY2U7XHJcblx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gbnVsbDtcclxuXHJcblx0XHRcdCRzY29wZS5uZXh0U2xpZGUgPSBuZXh0U2xpZGU7XHJcblx0XHRcdCRzY29wZS5wcmV2U2xpZGUgPSBwcmV2U2xpZGU7XHJcblx0XHRcdCRzY29wZS5zZXRTbGlkZSA9IHNldFNsaWRlO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gbmV4dFNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ2xlZnQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0TmV4dFNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHByZXZTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRQcmV2U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gc2V0U2xpZGUoaW5kZXgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IGluZGV4ID4gJHNjb3BlLnNsaWRlci5nZXRDdXJyZW50U2xpZGUodHJ1ZSkgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0Q3VycmVudFNsaWRlKGluZGV4KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGZpeElFOHBuZ0JsYWNrQmcoZWxlbWVudCkge1xyXG5cdFx0XHQkKGVsZW1lbnQpXHJcblx0XHRcdFx0LmNzcygnLW1zLWZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCd6b29tJywgJzEnKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtKSB7XHJcblx0XHRcdGxldCBhcnJvd3MgPSAkKGVsZW0pLmZpbmQoJy5zbGlkZXJfX2Fycm93Jyk7XHJcblxyXG5cdFx0XHRhcnJvd3MuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzAuNScpO1xyXG5cdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcodGhpcyk7XHJcblxyXG5cdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHQkdGltZW91dCgoKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcxJyk7XHJcblx0XHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKCQodGhpcykpO1xyXG5cdFx0XHRcdH0sIDUwMCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTtcclxuXHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZmFjdG9yeSgnc2xpZGVyU2VydmljZScsc2xpZGVyU2VydmljZSk7XHJcblxyXG5cdHNsaWRlclNlcnZpY2UuJGluamVjdCA9IFsnc2xpZGVySW1nUGF0aENvbnN0YW50J107XHJcblxyXG5cdGZ1bmN0aW9uIHNsaWRlclNlcnZpY2Uoc2xpZGVySW1nUGF0aENvbnN0YW50KSB7XHJcblx0XHRmdW5jdGlvbiBTbGlkZXIoc2xpZGVySW1hZ2VMaXN0KSB7XHJcblx0XHRcdHRoaXMuX2ltYWdlU3JjTGlzdCA9IHNsaWRlckltYWdlTGlzdDtcclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEltYWdlU3JjTGlzdCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2ltYWdlU3JjTGlzdDtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRDdXJyZW50U2xpZGUgPSBmdW5jdGlvbiAoZ2V0SW5kZXgpIHtcclxuXHRcdFx0cmV0dXJuIGdldEluZGV4ID09IHRydWUgPyB0aGlzLl9jdXJyZW50U2xpZGUgOiB0aGlzLl9pbWFnZVNyY0xpc3RbdGhpcy5fY3VycmVudFNsaWRlXTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRDdXJyZW50U2xpZGUgPSBmdW5jdGlvbiAoc2xpZGUpIHtcclxuXHRcdFx0c2xpZGUgPSBwYXJzZUludChzbGlkZSk7XHJcblxyXG5cdFx0XHRpZiAoaXNOYU4oc2xpZGUpIHx8IHNsaWRlIDwgMCB8fCBzbGlkZSA+IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSBzbGlkZTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXROZXh0U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxKSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA9IDAgOiB0aGlzLl9jdXJyZW50U2xpZGUrKztcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0UHJldlNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSAwKSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA9IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxIDogdGhpcy5fY3VycmVudFNsaWRlLS07XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IFNsaWRlcihzbGlkZXJJbWdQYXRoQ29uc3RhbnQpO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdzbGlkZXJJbWdQYXRoQ29uc3RhbnQnLCBbXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIxLmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIyLmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIzLmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXI0LmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXI1LmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXI2LmpwZydcclxuICAgICAgICBdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdQYWdlcycsIFBhZ2VzKTtcclxuXHJcbiAgICBQYWdlcy4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBQYWdlcygkc2NvcGUpIHtcclxuICAgICAgICBjb25zdCBob3RlbHNQZXJQYWdlID0gNTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IDE7XHJcbiAgICAgICAgdGhpcy5wYWdlc1RvdGFsID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd0Zyb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLmN1cnJlbnRQYWdlIC0gMSkgKiBob3RlbHNQZXJQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd05leHQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuICsrdGhpcy5jdXJyZW50UGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dQcmV2ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtLXRoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRQYWdlID0gZnVuY3Rpb24ocGFnZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gcGFnZSArIDE7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0xhc3RQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZ2VzVG90YWwubGVuZ3RoID09PSB0aGlzLmN1cnJlbnRQYWdlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0ZpcnN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50UGFnZSA9PT0gMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIChldmVudCwgc2hvd0hvdGVsQ291bnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYWdlc1RvdGFsID0gbmV3IEFycmF5KE1hdGguY2VpbChzaG93SG90ZWxDb3VudCAvIGhvdGVsc1BlclBhZ2UpKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IDE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdzaG93RnJvbScsIHNob3dGcm9tKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzaG93RnJvbSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obW9kZWwsIHN0YXJ0UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgaWYgKCFtb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuc2xpY2Uoc3RhcnRQb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFByaWNlU2xpZGVyJywgcHJpY2VTbGlkZXJEaXJlY3RpdmUpO1xyXG5cclxuICAgIHByaWNlU2xpZGVyRGlyZWN0aXZlLiRpbmplY3QgPSBbJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBtaW46IFwiQFwiLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBcIkBcIixcclxuICAgICAgICAgICAgICAgIGxlZnRTbGlkZXI6ICc9JyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0U2xpZGVyOiAnPSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3ByaWNlU2xpZGVyL3ByaWNlU2xpZGVyLmh0bWwnLFxyXG4gICAgICAgICAgICBsaW5rOiBwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsoJHNjb3BlLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpIHtcclxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygkc2NvcGUubGVmdFNsaWRlcik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5yaWdodFNsaWRlcik7XHJcbiAgICAgICAgICAgICRzY29wZS5yaWdodFNsaWRlci5tYXggPSAxNTsqL1xyXG4gICAgICAgICAgICBsZXQgcmlnaHRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JyksXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1sZWZ0JyksXHJcbiAgICAgICAgICAgICAgICBzbGlkZUFyZWFXaWR0aCA9IHBhcnNlSW50KCQoJy5zbGlkZScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZVBlclN0ZXAgPSAkc2NvcGUubWF4IC8gKHNsaWRlQXJlYVdpZHRoIC0gMjApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm1pbiA9IHBhcnNlSW50KCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkc2NvcGUubWF4ID0gcGFyc2VJbnQoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoJHNjb3BlLm1pbik7XHJcbiAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgkc2NvcGUubWF4KTtcclxuXHJcbiAgICAgICAgICAgIGluaXREcmFnKFxyXG4gICAgICAgICAgICAgICAgcmlnaHRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBzbGlkZUFyZWFXaWR0aCxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpKTtcclxuXHJcbiAgICAgICAgICAgIGluaXREcmFnKFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0bixcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICsgMjAsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiAwKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXREcmFnKGRyYWdFbGVtLCBpbml0UG9zaXRpb24sIG1heFBvc2l0aW9uLCBtaW5Qb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNoaWZ0O1xyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZWRvd24nLCBidG5Pbk1vdXNlRG93bik7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZURvd24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzaGlmdCA9IGV2ZW50LnBhZ2VYO1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRQb3NpdGlvbiA9IHBhcnNlSW50KGRyYWdFbGVtLmNzcygnbGVmdCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRvY09uTW91c2VNb3ZlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uTGVzc1RoYW5NYXggPSBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0IDw9IG1heFBvc2l0aW9uKCkgLSAyMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25HcmF0ZXJUaGFuTWluID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA+PSBtaW5Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zaXRpb25MZXNzVGhhbk1heCAmJiBwb3NpdGlvbkdyYXRlclRoYW5NaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0uY3NzKCdsZWZ0JywgaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0VsZW0uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gaW5pdFBvc2l0aW9uIC0gZXZlbnQucGFnZVggKyBzaGlmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFByaWNlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlVXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ2RyYWdzdGFydCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFByaWNlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TWluID0gfn4ocGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkgKiB2YWx1ZVBlclN0ZXApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdNYXggPSB+fihwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgKiB2YWx1ZVBlclN0ZXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwobmV3TWluKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwobmV3TWF4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyokc2NvcGUuJGJyb2FkY2FzdCgncHJpY2VTbGlkZXJQb3NpdGlvbkNoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRCdG4uY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodEJ0bi5jc3MoJ2xlZnQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKi9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRTbGlkZXJzKGJ0biwgbmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3UG9zdGlvbiA9IG5ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ0bi5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1Bvc3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0Jywgc2xpZGVBcmVhV2lkdGggLSBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGVtaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS5vbignY2hhbmdlIGtleXVwIHBhc3RlIGlucHV0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ZhbHVlID0gJCh0aGlzKS52YWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgLSAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhO2wnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2xpZGVycyhsZWZ0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS5vbignY2hhbmdlIGtleXVwIHBhc3RlIGlucHV0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ZhbHVlID0gJCh0aGlzKS52YWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSA+ICRzY29wZS5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld1ZhbHVlLCRzY29wZS5tYXggKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcCA8IHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICsgMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMocmlnaHRCdG4sIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGVtaXQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxlZnRTbGlkZXIgPSAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIgPSAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW46ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXg6ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coMTMpOyovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy90b2RvIGllOCBidWcgZml4XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdpZTgnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuZmluZCgnLnNsaWRlX19wb2ludGVyLS1sZWZ0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKS5jc3MoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCtzbGlkZUFyZWFXaWR0aCAtICtuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0JywgK3NsaWRlQXJlYVdpZHRoIC0gcGFyc2VJbnQobmV3VmFsdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTsqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsU2xpZGVPbkNsaWNrJywgYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSgkbG9nKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGxldCBzbGlkZUVtaXRFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLWVtaXRdJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNsaWRlRW1pdEVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2xpZGVFbWl0RWxlbWVudHMub24oJ2NsaWNrJywgc2xpZGVFbWl0T25DbGljayk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzbGlkZUVtaXRPbkNsaWNrKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNsaWRlT25FbGVtZW50ID0gJChlbGVtKS5maW5kKCdbc2xpZGUtb25dJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNsaWRlLWVtaXQgbm90IGZvdW5kYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nKSAhPT0gJycgJiYgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nKSAhPT0gJ2Nsb3NlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLndhcm4oYFdyb25nIGluaXQgdmFsdWUgZm9yICdzbGlkZS1vbicgYXR0cmlidXRlLCBzaG91bGQgYmUgJycgb3IgJ2Nsb3NlZCcuYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nKSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5zbGlkZVVwKCdzbG93Jywgb25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicsICdjbG9zZWQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVEb3duKCdzbG93Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzbGlkZVRvZ2dsZUVsZW1lbnRzID0gJChlbGVtKS5maW5kKCdbc2xpZGUtb24tdG9nZ2xlXScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkLmVhY2goc2xpZGVUb2dnbGVFbGVtZW50cywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJCh0aGlzKS5hdHRyKCdzbGlkZS1vbi10b2dnbGUnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcbiJdfQ==
