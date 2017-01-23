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

    ahtlGalleryDirective.$inject = [];

    function ahtlGalleryDirective() {
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'app/partials/gallery/gallery.template.html',
            controller: ahtlGalleryController,
            controllerAs: 'gallery',
            link: ahtlGalleryDirectiveLink
        };

        function ahtlGalleryController() {
            this.imgs = new Array(20);
        }

        function ahtlGalleryDirectiveLink() {
            $(window).load(function () {
                var container = document.querySelector('.container');

                var masonry = new Masonry(container, {
                    // options
                    columnWidth: '.item',
                    itemSelector: '.item',
                    gutter: '.gutter-sizer',
                    transitionDuration: '0.2s',
                    initLayout: false
                });

                masonry.on('layoutComplete', onLayoutComplete);

                masonry.layout();

                function onLayoutComplete() {
                    setTimeout(function () {
                        return $(container).css('opacity', '1');
                    }, 0);
                }
            });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsImdsb2JhbHMvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy9hdXRoL2F1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvYm9va2luZy9ib29raW5nLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuZm9ybS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYm9va2luZy9kYXRlUGlja2VyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvbW9kYWwvbW9kYWwuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5hY3Rpdml0aWVzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaG90ZWwuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5zY3JvbGx0b1RvcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuYW5pbWF0aW9uLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyUGF0aC5jb25zdGFudC5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvc2xpZGVPbkNsaWNrL3NsaWRlT25DbGljay5kaXJlY3RpdmUuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRwcm92aWRlIiwiZGVjb3JhdG9yIiwiJGRlbGVnYXRlIiwiJHdpbmRvdyIsImxvZ0hpc3RvcnkiLCJ3YXJuIiwiZXJyIiwibG9nIiwibWVzc2FnZSIsIl9sb2dXYXJuIiwicHVzaCIsImFwcGx5IiwiX2xvZ0VyciIsImVycm9yIiwibmFtZSIsInN0YWNrIiwiRXJyb3IiLCJzZW5kT25VbmxvYWQiLCJvbmJlZm9yZXVubG9hZCIsImxlbmd0aCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIiRpbmplY3QiLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJkYXRhIiwiY3VycmVudEZpbHRlcnMiLCJydW4iLCIkcm9vdFNjb3BlIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiZnJvbVN0YXRlIiwicHJvdmlkZXIiLCJwcmVsb2FkU2VydmljZSIsIm1ldGhvZCIsImFjdGlvbiIsInRpbWVvdXQiLCIkZ2V0IiwiJGh0dHAiLCIkdGltZW91dCIsInByZWxvYWRDYWNoZSIsImxvZ2dlciIsImNvbnNvbGUiLCJkZWJ1ZyIsInByZWxvYWRJbWFnZXMiLCJwcmVsb2FkTmFtZSIsImltYWdlcyIsImltYWdlc1NyY0xpc3QiLCJzcmMiLCJwcmVsb2FkIiwidGhlbiIsInJlc3BvbnNlIiwiYmluZCIsImkiLCJpbWFnZSIsIkltYWdlIiwib25sb2FkIiwiZSIsIm9uZXJyb3IiLCJnZXRQcmVsb2FkIiwiZ2V0UHJlbG9hZENhY2hlIiwiY29uc3RhbnQiLCJ0b3AzIiwiYXV0aCIsImdhbGxlcnkiLCJndWVzdGNvbW1lbnRzIiwiaG90ZWxzIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJHEiLCJtb2RlbCIsImdldFJlc29ydCIsImZpbHRlciIsIndoZW4iLCJhcHBseUZpbHRlciIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJob3RlbCIsInByb3AiLCJ2YWx1ZSIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsInNpZ25JbiIsInVzZXIiLCJwcmV2aW91c1N0YXRlIiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsIl9jcmVkZW50aWFscyIsIl9vblJlc29sdmUiLCJzdGF0dXMiLCJ0b2tlbiIsIl90b2tlbktlZXBlciIsInNhdmVUb2tlbiIsIl9vblJlamVjdGVkIiwiX3Rva2VuIiwiZ2V0VG9rZW4iLCJkZWxldGVUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwic2lnbk91dCIsImdldExvZ0luZm8iLCJCb29raW5nQ29udHJvbGxlciIsIiRzdGF0ZVBhcmFtcyIsImxvYWRlZCIsImhvdGVsSWQiLCJnZXRIb3RlbEltYWdlc0NvdW50IiwiY291bnQiLCJBcnJheSIsIm9wZW5JbWFnZSIsIiRldmVudCIsImltZ1NyYyIsInRhcmdldCIsIiRicm9hZGNhc3QiLCJzaG93IiwiQm9va2luZ0Zvcm1Db250cm9sbGVyIiwiZm9ybSIsImRhdGUiLCJhZGRHdWVzdCIsInJlbW92ZUd1ZXN0Iiwic3VibWl0IiwiZGlyZWN0aXZlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZSIsIiRpbnRlcnZhbCIsInJlcXVpcmUiLCJsaW5rIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCIkIiwiZGF0ZVJhbmdlUGlja2VyIiwibGFuZ3VhZ2UiLCJzdGFydERhdGUiLCJEYXRlIiwiZW5kRGF0ZSIsInNldEZ1bGxZZWFyIiwiZ2V0RnVsbFllYXIiLCJvYmoiLCIkc2V0Vmlld1ZhbHVlIiwiJHJlbmRlciIsIiRhcHBseSIsImFodGxNYXBEaXJlY3RpdmUiLCJyZXN0cmljdCIsInRlbXBsYXRlIiwiYWh0bE1hcERpcmVjdGl2ZUxpbmsiLCJlbGVtIiwiYXR0ciIsImNyZWF0ZU1hcCIsIndpbmRvdyIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJfZ21hcHMiLCJsYXQiLCJsbmciLCJteUxhdExuZyIsIm1hcCIsIm1hcHMiLCJNYXAiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwic2Nyb2xsd2hlZWwiLCJpY29ucyIsImFob3RlbCIsImljb24iLCJtYXJrZXIiLCJNYXJrZXIiLCJ0aXRsZSIsInBvc2l0aW9uIiwiTGF0TG5nIiwiYWRkTGlzdGVuZXIiLCJzZXRab29tIiwic2V0Q2VudGVyIiwiZ2V0UG9zaXRpb24iLCJib3VuZHMiLCJMYXRMbmdCb3VuZHMiLCJMYXRMYW5nIiwiZXh0ZW5kIiwiZml0Qm91bmRzIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmUiLCJhaHRsR2FsbGVyeUNvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmsiLCJpbWdzIiwibG9hZCIsImNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJtYXNvbnJ5IiwiTWFzb25yeSIsImNvbHVtbldpZHRoIiwiaXRlbVNlbGVjdG9yIiwiZ3V0dGVyIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiaW5pdExheW91dCIsIm9uIiwib25MYXlvdXRDb21wbGV0ZSIsImxheW91dCIsInNldFRpbWVvdXQiLCJjc3MiLCJHdWVzdGNvbW1lbnRzQ29udHJvbGxlciIsImd1ZXN0Y29tbWVudHNTZXJ2aWNlIiwiY29tbWVudHMiLCJvcGVuRm9ybSIsInNob3dQbGVhc2VMb2dpTWVzc2FnZSIsIndyaXRlQ29tbWVudCIsImdldEd1ZXN0Q29tbWVudHMiLCJhZGRDb21tZW50Iiwic2VuZENvbW1lbnQiLCJmb3JtRGF0YSIsImNvbW1lbnQiLCJyZXZlcnNlIiwiaXRlbXMiLCJzbGljZSIsInR5cGUiLCJvblJlamVjdCIsIkhlYWRlckNvbnRyb2xsZXIiLCJhaHRsSGVhZGVyIiwic2VydmljZSIsIkhlYWRlclRyYW5zaXRpb25zU2VydmljZSIsIiRsb2ciLCJVSXRyYW5zaXRpb25zIiwiX2NvbnRhaW5lciIsImFuaW1hdGVUcmFuc2l0aW9uIiwidGFyZ2V0RWxlbWVudHNRdWVyeSIsImNzc0VudW1lcmFibGVSdWxlIiwiZnJvbSIsInRvIiwiZGVsYXkiLCJtb3VzZWVudGVyIiwidGFyZ2V0RWxlbWVudHMiLCJmaW5kIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJzY3JvbGxUb3AiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwiYWh0bFN0aWt5SGVhZGVyIiwiaGVhZGVyIiwiSG9tZUNvbnRyb2xsZXIiLCJhaHRsTW9kYWxEaXJlY3RpdmUiLCJyZXBsYWNlIiwiYWh0bE1vZGFsRGlyZWN0aXZlTGluayIsImltZyIsInVuZGVmaW5lZCIsIm15TGF0bG5nIiwiY29vcmQiLCJ6b29tIiwiY2VudGVyIiwiY2xvc2VEaWFsb2ciLCJtb2RhbE1hcCIsImFjdGl2aXRpZXNGaWx0ZXIiLCJmaWx0ZXJzU2VydmljZSIsImFyZyIsIl9zdHJpbmdMZW5ndGgiLCJzdHJpbmdMZW5ndGgiLCJwYXJzZUludCIsImlzTmFOIiwicmVzdWx0Iiwiam9pbiIsImxhc3RJbmRleE9mIiwiUmVzb3J0Q29udHJvbGxlciIsIiRmaWx0ZXIiLCIkY3VycmVudCIsImZpbHRlcnMiLCJpbml0RmlsdGVycyIsIm9uRmlsdGVyQ2hhbmdlIiwiZmlsdGVyR3JvdXAiLCJzcGxpY2UiLCJpbmRleE9mIiwiYXBwbHlGaWx0ZXJzIiwiZ2V0U2hvd0hvdGVsQ291bnQiLCJyZWR1Y2UiLCJjb3VudGVyIiwiaXRlbSIsIl9oaWRlIiwiJHdhdGNoIiwibmV3VmFsdWUiLCJvcGVuTWFwIiwiaG90ZWxOYW1lIiwiaG90ZWxDb29yZCIsIiRyb290IiwiaG90ZWxGaWx0ZXIiLCJob3RlbERldGFpbHNDb25zdGFudCIsInNhdmVkRmlsdGVycyIsImxvYWRGaWx0ZXJzIiwia2V5IiwibWluIiwibWF4IiwiZm9yRWFjaCIsImlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMiLCJmaWx0ZXJzSW5Hcm91cCIsIm1hdGNoQXRMZWFzZU9uZUZpbHRlciIsInJldmVyc2VGaWx0ZXJNYXRjaGluZyIsImdldEhvdGVsUHJvcCIsImxvY2F0aW9uIiwiY291bnRyeSIsImVudmlyb25tZW50IiwiZGV0YWlscyIsInNjcm9sbFRvVG9wRGlyZWN0aXZlIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rIiwic2VsZWN0b3IiLCJoZWlnaHQiLCJ0cmltIiwic2Nyb2xsVG9Ub3BDb25maWciLCJzY3JvbGxUb1RvcCIsIlNlYXJjaENvbnRyb2xsZXIiLCJxdWVyeSIsInNlYXJjaCIsInBhcnNlZFF1ZXJ5Iiwic3BsaXQiLCJob3RlbENvbnRlbnQiLCJyZWdpb24iLCJkZXNjIiwiZGVzY0xvY2F0aW9uIiwibWF0Y2hlc0NvdW50ZXIiLCJxUmVnRXhwIiwiUmVnRXhwIiwibWF0Y2giLCJfaWQiLCJzZWFyY2hSZXN1bHRzIiwiX21hdGNoZXMiLCJhaHRsVG9wM0RpcmVjdGl2ZSIsInRvcDNTZXJ2aWNlIiwiQWh0bFRvcDNDb250cm9sbGVyIiwiJGVsZW1lbnQiLCIkYXR0cnMiLCJtdXN0SGF2ZSIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJpbmRleCIsImZpbGVuYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsIiwiZGV0YWlsIiwiZGV0YWlsQ2xhc3NOYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lIiwiZ2V0VG9wM1BsYWNlcyIsImFuaW1hdGlvbiIsImFuaW1hdGlvbkZ1bmN0aW9uIiwiYmVmb3JlQWRkQ2xhc3MiLCJjbGFzc05hbWUiLCJkb25lIiwic2xpZGluZ0RpcmVjdGlvbiIsImFodGxTbGlkZXIiLCJzbGlkZXJTZXJ2aWNlIiwiYWh0bFNsaWRlckNvbnRyb2xsZXIiLCJzbGlkZXIiLCJuZXh0U2xpZGUiLCJwcmV2U2xpZGUiLCJzZXRTbGlkZSIsInNldE5leHRTbGlkZSIsInNldFByZXZTbGlkZSIsImdldEN1cnJlbnRTbGlkZSIsInNldEN1cnJlbnRTbGlkZSIsImZpeElFOHBuZ0JsYWNrQmciLCJhcnJvd3MiLCJjbGljayIsImRpc2FibGVkIiwic2xpZGVySW1nUGF0aENvbnN0YW50IiwiU2xpZGVyIiwic2xpZGVySW1hZ2VMaXN0IiwiX2ltYWdlU3JjTGlzdCIsIl9jdXJyZW50U2xpZGUiLCJnZXRJbWFnZVNyY0xpc3QiLCJnZXRJbmRleCIsInNsaWRlIiwiUGFnZXMiLCJob3RlbHNQZXJQYWdlIiwiY3VycmVudFBhZ2UiLCJwYWdlc1RvdGFsIiwic2hvd0Zyb20iLCJzaG93TmV4dCIsInNob3dQcmV2Iiwic2V0UGFnZSIsInBhZ2UiLCJpc0xhc3RQYWdlIiwiaXNGaXJzdFBhZ2UiLCJzaG93SG90ZWxDb3VudCIsIk1hdGgiLCJjZWlsIiwic3RhcnRQb3NpdGlvbiIsInByaWNlU2xpZGVyRGlyZWN0aXZlIiwibGVmdFNsaWRlciIsInJpZ2h0U2xpZGVyIiwicHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rIiwicmlnaHRCdG4iLCJsZWZ0QnRuIiwic2xpZGVBcmVhV2lkdGgiLCJ2YWx1ZVBlclN0ZXAiLCJ2YWwiLCJpbml0RHJhZyIsImRyYWdFbGVtIiwiaW5pdFBvc2l0aW9uIiwibWF4UG9zaXRpb24iLCJtaW5Qb3NpdGlvbiIsInNoaWZ0IiwiYnRuT25Nb3VzZURvd24iLCJwYWdlWCIsImRvY09uTW91c2VNb3ZlIiwiYnRuT25Nb3VzZVVwIiwicG9zaXRpb25MZXNzVGhhbk1heCIsInBvc2l0aW9uR3JhdGVyVGhhbk1pbiIsInNldFByaWNlcyIsImVtaXQiLCJuZXdNaW4iLCJuZXdNYXgiLCJzZXRTbGlkZXJzIiwiYnRuIiwibmV3UG9zdGlvbiIsImhhc0NsYXNzIiwidHJpZ2dlciIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUiLCJhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluayIsInNsaWRlRW1pdEVsZW1lbnRzIiwic2xpZGVFbWl0T25DbGljayIsInNsaWRlT25FbGVtZW50Iiwic2xpZGVVcCIsIm9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSIsInNsaWRlRG93biIsInNsaWRlVG9nZ2xlRWxlbWVudHMiLCJlYWNoIiwidG9nZ2xlQ2xhc3MiXSwibWFwcGluZ3MiOiJBQUFBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBQSxRQUNLQyxPQUFPLGFBQWEsQ0FBQyw2QkFBNEIsYUFBYTtLQUp2RTtBQ0FBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBRCxRQUNLQyxPQUFPLGFBQ1BDLG9CQUFPLFVBQVVDLFVBQVU7UUFDeEJBLFNBQVNDLFVBQVUsaUNBQVEsVUFBVUMsV0FBV0MsU0FBUztZQUNyRCxJQUFJQyxhQUFhO2dCQUNUQyxNQUFNO2dCQUNOQyxLQUFLOzs7WUFHYkosVUFBVUssTUFBTSxVQUFVQyxTQUFTOztZQUduQyxJQUFJQyxXQUFXUCxVQUFVRztZQUN6QkgsVUFBVUcs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OWMsUUFBUTtnQkFDM0IrTyxLQUFLN1AsS0FBTDs7Z0JBRUE7OztZQUdKNGQsa0JBQWtCeFAsR0FBRyxTQUFTeVA7O1lBRTlCLFNBQVNBLG1CQUFtQjtnQkFDeEIsSUFBSUMsaUJBQWlCOVQsRUFBRWdCLE1BQU13RixLQUFLOztnQkFFbEMsSUFBSSxDQUFDb04sa0JBQWtCOWMsUUFBUTtvQkFDM0IrTyxLQUFLN1AsS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJOGQsZUFBZTdTLEtBQUssZ0JBQWdCLE1BQU02UyxlQUFlN1MsS0FBSyxnQkFBZ0IsVUFBVTtvQkFDeEY0RSxLQUFLN1AsS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJOGQsZUFBZTdTLEtBQUssZ0JBQWdCLElBQUk7b0JBQ3hDNlMsZUFBZUMsUUFBUSxRQUFRQztvQkFDL0JGLGVBQWU3UyxLQUFLLFlBQVk7dUJBQzdCO29CQUNIK1M7b0JBQ0FGLGVBQWVHLFVBQVU7b0JBQ3pCSCxlQUFlN1MsS0FBSyxZQUFZOzs7Z0JBR3BDLFNBQVMrUywyQkFBMkI7b0JBQ2hDLElBQUlFLHNCQUFzQmxVLEVBQUVnQixNQUFNd0YsS0FBSzs7b0JBRXZDeEcsRUFBRW1VLEtBQUtELHFCQUFxQixZQUFXO3dCQUNuQ2xVLEVBQUUsTUFBTW9VLFlBQVlwVSxFQUFFLE1BQU1pQixLQUFLOzs7Ozs7S0F0RHpEIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJywgWyd1aS5yb3V0ZXInLyosICdwcmVsb2FkJyovLCAnbmdBbmltYXRlJywgJzcyMGtiLnNvY2lhbHNoYXJlJ10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uZmlnKGZ1bmN0aW9uICgkcHJvdmlkZSkge1xyXG4gICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJyRsb2cnLCBmdW5jdGlvbiAoJGRlbGVnYXRlLCAkd2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9nSGlzdG9yeSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2FybjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycjogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5sb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ1dhcm4gPSAkZGVsZWdhdGUud2FybjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS53YXJuID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nV2Fybi5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ0VyciA9ICRkZWxlZ2F0ZS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5lcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7bmFtZTogbWVzc2FnZSwgc3RhY2s6IG5ldyBFcnJvcigpLnN0YWNrfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ0Vyci5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gc2VuZE9uVW5sb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbG9nSGlzdG9yeS5lcnIubGVuZ3RoICYmICFsb2dIaXN0b3J5Lndhcm4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbigncG9zdCcsICcvYXBpL2xvZycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGxvZ0hpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGRlbGVnYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxufSkoKTtcclxuXHJcbi8qXHJcbiAgICAgICAgLmZhY3RvcnkoJ2xvZycsIGxvZyk7XHJcblxyXG4gICAgbG9nLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxvZygkd2luZG93LCAkbG9nKSB7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2goYXJncyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYnJvd3NlckxvZykge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBlcnJvcihlKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgc3RhY2s6IGUuc3RhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRsb2cuZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RvZG8gYWxsIGVycm9yc1xyXG5cclxuXHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHdhcm46IHdhcm4sXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICAgICAgc2VuZE9uVW5sb2FkOiBzZW5kT25VbmxvYWRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiLypcclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoY29uZmlnKTtcclxuXHJcbiAgICBjb25maWcuJGluamVjdCA9IFsncHJlbG9hZFNlcnZpY2VQcm92aWRlcicsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbmZpZyhwcmVsb2FkU2VydmljZVByb3ZpZGVyLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICBwcmVsb2FkU2VydmljZVByb3ZpZGVyLmNvbmZpZyhiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCAnR0VUJywgJ2dldCcsIDEwMCwgJ3dhcm5pbmcnKTtcclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5jb25maWcoY29uZmlnKTtcclxuXHJcblx0Y29uZmlnLiRpbmplY3QgPSBbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlciddO1xyXG5cclxuXHRmdW5jdGlvbiBjb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG5cdFx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG5cclxuXHRcdCRzdGF0ZVByb3ZpZGVyXHJcblx0XHRcdC5zdGF0ZSgnaG9tZScsIHtcclxuXHRcdFx0XHR1cmw6ICcvJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ob21lL2hvbWUuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdhdXRoJywge1xyXG5cdFx0XHRcdHVybDogJy9hdXRoJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9hdXRoL2F1dGguaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3R5cGUnOiAnbG9naW4gb3Igam9pbid9LyosXHJcblx0XHRcdFx0b25FbnRlcjogZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcclxuXHRcdFx0XHRcdCRyb290U2NvcGUuJHN0YXRlID0gXCJhdXRoXCI7XHJcblx0XHRcdFx0fSovXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYnVuZ2Fsb3dzJywge1xyXG5cdFx0XHRcdHVybDogJy9idW5nYWxvd3MnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9idW5nYWxvd3MuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdob3RlbHMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvdG9wJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9ob3RlbHMuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3ZpbGxhcycsIHtcclxuXHRcdFx0XHR1cmw6ICcvdmlsbGFzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdmlsbGFzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ2FsbGVyeScsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ2FsbGVyeScsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5Lmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ3Vlc3Rjb21tZW50cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ3Vlc3Rjb21tZW50cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZGVzdGluYXRpb25zJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL2Rlc3RpbmF0aW9ucycsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9kZXN0aW5hdGlvbnMvZGVzdGluYXRpb25zLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgncmVzb3J0Jywge1xyXG5cdFx0XHRcdHVybDogJy9yZXNvcnQnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaHRtbCcsXHJcblx0XHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdFx0Y3VycmVudEZpbHRlcnM6IHt9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Jvb2tpbmcnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2Jvb2tpbmc/aG90ZWxJZCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvYm9va2luZy9ib29raW5nLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydob3RlbElkJzogJ2hvdGVsIElkJ31cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdzZWFyY2gnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3NlYXJjaD9xdWVyeScsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvc2VhcmNoL3NlYXJjaC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsncXVlcnknOiAnc2VhcmNoIHF1ZXJ5J31cclxuXHRcdFx0fSlcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5ydW4ocnVuKTtcclxuXHJcbiAgICBydW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScgLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAvKidwcmVsb2FkU2VydmljZScsKi8gJyR3aW5kb3cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIC8qcHJlbG9hZFNlcnZpY2UsKi8gJHdpbmRvdykge1xyXG4gICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUvKiwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVOYW1lID0gdG9TdGF0ZS5uYW1lO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZS8qLCBmcm9tUGFyYW1zIHRvZG8qLykge1xyXG4gICAgICAgICAgICAvLyR0aW1lb3V0KCgpID0+ICQoJ2JvZHknKS5zY3JvbGxUb3AoMCksIDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKiR3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7IC8vdG9kbyBvbmxvYWQg77+977+977+977+977+977+977+977+9IO+/vSDvv73vv73vv73vv73vv73vv71cclxuICAgICAgICAgICAgcHJlbG9hZFNlcnZpY2UucHJlbG9hZEltYWdlcygnZ2FsbGVyeScsIHt1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksIG1ldGhvZDogJ0dFVCcsIGFjdGlvbjogJ2dldCd9KTsgLy90b2RvIGRlbCBtZXRob2QsIGFjdGlvbiBieSBkZWZhdWx0XHJcbiAgICAgICAgfTsqL1xyXG5cclxuICAgICAgICAvL2xvZy5zZW5kT25VbmxvYWQoKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3ByZWxvYWQnLCBbXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdwcmVsb2FkJylcclxuICAgICAgICAucHJvdmlkZXIoJ3ByZWxvYWRTZXJ2aWNlJywgcHJlbG9hZFNlcnZpY2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHByZWxvYWRTZXJ2aWNlKCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGZ1bmN0aW9uKHVybCA9ICcvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZCA9ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0ID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICBsb2c6IGxvZ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuJGdldCA9IGZ1bmN0aW9uICgkaHR0cCwgJHRpbWVvdXQpIHtcclxuICAgICAgICAgICAgbGV0IHByZWxvYWRDYWNoZSA9IFtdLFxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyID0gZnVuY3Rpb24obWVzc2FnZSwgbG9nID0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnc2lsZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmxvZyA9PT0gJ2RlYnVnJyAmJiBsb2cgPT09ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2cgPT09ICd3YXJuaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWRJbWFnZXMocHJlbG9hZE5hbWUsIGltYWdlcykgeyAvL3RvZG8gZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VzU3JjTGlzdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW1hZ2VzID09PSAnYXJyYXknKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzU3JjTGlzdCA9IGltYWdlcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZENhY2hlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVsb2FkTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5tZXRob2QgfHwgY29uZmlnLm1ldGhvZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBpbWFnZXMudXJsIHx8IGNvbmZpZy51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzOiBpbWFnZXMuYWN0aW9uIHx8IGNvbmZpZy5hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VzU3JjTGlzdCA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZENhY2hlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VzU3JjTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy50aW1lb3V0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93Lm9ubG9hZCA9IHByZWxvYWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQocHJlbG9hZC5iaW5kKG51bGwsIGltYWdlc1NyY0xpc3QpLCBjb25maWcudGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvL3RvZG9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcmVsb2FkKGltYWdlc1NyY0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlc1NyY0xpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IGltYWdlc1NyY0xpc3RbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc29sdmUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyKHRoaXMuc3JjLCAnZGVidWcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UHJlbG9hZChwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdwcmVsb2FkU2VydmljZTogZ2V0IHJlcXVlc3QgJyArICdcIicgKyBwcmVsb2FkTmFtZSArICdcIicsICdkZWJ1ZycpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmVsb2FkTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVsb2FkQ2FjaGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVsb2FkQ2FjaGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJlbG9hZENhY2hlW2ldLm5hbWUgPT09IHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVsb2FkQ2FjaGVbaV0uc3JjXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxvZ2dlcignTm8gcHJlbG9hZHMgZm91bmQnLCAnd2FybmluZycpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcHJlbG9hZEltYWdlczogcHJlbG9hZEltYWdlcyxcclxuICAgICAgICAgICAgICAgIGdldFByZWxvYWRDYWNoZTogZ2V0UHJlbG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdiYWNrZW5kUGF0aHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdG9wMzogJy9hcGkvdG9wMycsXHJcbiAgICAgICAgICAgIGF1dGg6ICcvYXBpL3VzZXJzJyxcclxuICAgICAgICAgICAgZ2FsbGVyeTogJy9hcGkvZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHM6ICcvYXBpL2d1ZXN0Y29tbWVudHMnLFxyXG4gICAgICAgICAgICBob3RlbHM6ICcvYXBpL2hvdGVscydcclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdob3RlbERldGFpbHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdHlwZXM6IFtcclxuICAgICAgICAgICAgICAgICdIb3RlbCcsXHJcbiAgICAgICAgICAgICAgICAnQnVuZ2Fsb3cnLFxyXG4gICAgICAgICAgICAgICAgJ1ZpbGxhJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3M6IFtcclxuICAgICAgICAgICAgICAgICdDb2FzdCcsXHJcbiAgICAgICAgICAgICAgICAnQ2l0eScsXHJcbiAgICAgICAgICAgICAgICAnRGVzZXJ0J1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgbG9jYXRpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnTmFtaWJpYScsXHJcbiAgICAgICAgICAgICAgICAnTGlieWEnLFxyXG4gICAgICAgICAgICAgICAgJ1NvdXRoIEFmcmljYScsXHJcbiAgICAgICAgICAgICAgICAnVGFuemFuaWEnLFxyXG4gICAgICAgICAgICAgICAgJ1BhcHVhIE5ldyBHdWluZWEnLFxyXG4gICAgICAgICAgICAgICAgJ1JldW5pb24nLFxyXG4gICAgICAgICAgICAgICAgJ1N3YXppbGFuZCcsXHJcbiAgICAgICAgICAgICAgICAnU2FvIFRvbWUnLFxyXG4gICAgICAgICAgICAgICAgJ01hZGFnYXNjYXInLFxyXG4gICAgICAgICAgICAgICAgJ01hdXJpdGl1cycsXHJcbiAgICAgICAgICAgICAgICAnU2V5Y2hlbGxlcycsXHJcbiAgICAgICAgICAgICAgICAnTWF5b3R0ZScsXHJcbiAgICAgICAgICAgICAgICAnVWtyYWluZSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGd1ZXN0czogW1xyXG4gICAgICAgICAgICAgICAgJzEnLFxyXG4gICAgICAgICAgICAgICAgJzInLFxyXG4gICAgICAgICAgICAgICAgJzMnLFxyXG4gICAgICAgICAgICAgICAgJzQnLFxyXG4gICAgICAgICAgICAgICAgJzUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBtdXN0SGF2ZXM6IFtcclxuICAgICAgICAgICAgICAgICdyZXN0YXVyYW50JyxcclxuICAgICAgICAgICAgICAgICdraWRzJyxcclxuICAgICAgICAgICAgICAgICdwb29sJyxcclxuICAgICAgICAgICAgICAgICdzcGEnLFxyXG4gICAgICAgICAgICAgICAgJ3dpZmknLFxyXG4gICAgICAgICAgICAgICAgJ3BldCcsXHJcbiAgICAgICAgICAgICAgICAnZGlzYWJsZScsXHJcbiAgICAgICAgICAgICAgICAnYmVhY2gnLFxyXG4gICAgICAgICAgICAgICAgJ3BhcmtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2NvbmRpdGlvbmluZycsXHJcbiAgICAgICAgICAgICAgICAnbG91bmdlJyxcclxuICAgICAgICAgICAgICAgICd0ZXJyYWNlJyxcclxuICAgICAgICAgICAgICAgICdnYXJkZW4nLFxyXG4gICAgICAgICAgICAgICAgJ2d5bScsXHJcbiAgICAgICAgICAgICAgICAnYmljeWNsZXMnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBhY3Rpdml0aWVzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29va2luZyBjbGFzc2VzJyxcclxuICAgICAgICAgICAgICAgICdDeWNsaW5nJyxcclxuICAgICAgICAgICAgICAgICdGaXNoaW5nJyxcclxuICAgICAgICAgICAgICAgICdHb2xmJyxcclxuICAgICAgICAgICAgICAgICdIaWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0hvcnNlLXJpZGluZycsXHJcbiAgICAgICAgICAgICAgICAnS2F5YWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ05pZ2h0bGlmZScsXHJcbiAgICAgICAgICAgICAgICAnU2FpbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2N1YmEgZGl2aW5nJyxcclxuICAgICAgICAgICAgICAgICdTaG9wcGluZyAvIG1hcmtldHMnLFxyXG4gICAgICAgICAgICAgICAgJ1Nub3JrZWxsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTa2lpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1N1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbGRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdXaW5kc3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2luZSB0YXN0aW5nJyxcclxuICAgICAgICAgICAgICAgICdZb2dhJyBcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHByaWNlOiBbXHJcbiAgICAgICAgICAgICAgICBcIm1pblwiLFxyXG4gICAgICAgICAgICAgICAgXCJtYXhcIlxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdyZXNvcnRTZXJ2aWNlJywgcmVzb3J0U2VydmljZSk7XHJcblxyXG4gICAgcmVzb3J0U2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICckcSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlc29ydFNlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCAkcSkge1xyXG4gICAgICAgIGxldCBtb2RlbCA9IG51bGw7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlc29ydChmaWx0ZXIpIHtcclxuICAgICAgICAgICAgLy90b2RvIGVycm9yczogbm8gaG90ZWxzLCBubyBmaWx0ZXIuLi5cclxuICAgICAgICAgICAgaWYgKG1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihhcHBseUZpbHRlcihtb2RlbCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihvblJlc29sdmUsIG9uUmVqZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwbHlGaWx0ZXIobW9kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwbHlGaWx0ZXIobW9kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVyKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWxcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwuZmlsdGVyKChob3RlbCkgPT4gaG90ZWxbZmlsdGVyLnByb3BdID09IGZpbHRlci52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFJlc29ydDogZ2V0UmVzb3J0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRyb290U2NvcGUsICRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3Q6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduSW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRyb290U2NvcGUsICRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWxldGVUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlVG9rZW46IHNhdmVUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnZXRUb2tlbjogZ2V0VG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlVG9rZW46IGRlbGV0ZVRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuZGVsZXRlVG9rZW4oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5nZXRMb2dJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogdGhpcy5fY3JlZGVudGlhbHMsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5fdG9rZW5LZWVwZXIuZ2V0VG9rZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0NvbnRyb2xsZXInLCBCb29raW5nQ29udHJvbGxlcik7XHJcblxyXG4gICAgQm9va2luZ0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlUGFyYW1zJywgJ3Jlc29ydFNlcnZpY2UnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCb29raW5nQ29udHJvbGxlcigkc3RhdGVQYXJhbXMsIHJlc29ydFNlcnZpY2UsICRzdGF0ZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHRoaXMuaG90ZWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KHtcclxuICAgICAgICAgICAgICAgIHByb3A6ICdfaWQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICRzdGF0ZVBhcmFtcy5ob3RlbElkfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdGVsID0gcmVzcG9uc2VbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL3RoaXMuaG90ZWwgPSAkc3RhdGVQYXJhbXMuaG90ZWw7XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0SG90ZWxJbWFnZXNDb3VudCA9IGZ1bmN0aW9uKGNvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQXJyYXkoY291bnQgLSAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub3BlbkltYWdlID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBpbWdTcmMgPSAkZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0Zvcm1Db250cm9sbGVyJywgQm9va2luZ0Zvcm1Db250cm9sbGVyKVxyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdGb3JtQ29udHJvbGxlcigpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIHRoaXMuZm9ybSA9IHtcclxuICAgICAgICAgICAgZGF0ZTogJ3BpY2sgZGF0ZScsXHJcbiAgICAgICAgICAgIGd1ZXN0czogMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR3Vlc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5ndWVzdHMgIT09IDUgPyB0aGlzLmZvcm0uZ3Vlc3RzKysgOiB0aGlzLmZvcm0uZ3Vlc3RzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gMSA/IHRoaXMuZm9ybS5ndWVzdHMtLSA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2RhdGVQaWNrZXInLCBkYXRlUGlja2VyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlKCRpbnRlcnZhbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcclxuICAgICAgICAgICAgLypzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbDogJz0nXHJcbiAgICAgICAgICAgIH0sKi9cclxuICAgICAgICAgICAgbGluazogZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlTGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgLy90b2RvIGFsbFxyXG4gICAgICAgICAgICAkKCdbZGF0ZS1waWNrZXJdJykuZGF0ZVJhbmdlUGlja2VyKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlOiBuZXcgRGF0ZSgpLnNldEZ1bGxZZWFyKG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSArIDEpLFxyXG4gICAgICAgICAgICAgICAgfSkuYmluZCgnZGF0ZXBpY2tlci1maXJzdC1kYXRlLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZlbnQsIG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gZmlyc3QgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmaXJzdC1kYXRlLXNlbGVjdGVkJyxvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9iaiB3aWxsIGJlIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMTogKERhdGUgb2JqZWN0IG9mIHRoZSBlYXJsaWVyIGRhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNoYW5nZScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBzZWNvbmQgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2UnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kc2V0Vmlld1ZhbHVlKG9iai52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUyOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGxhdGVyIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vXHQgXHR2YWx1ZTogXCIyMDEzLTA2LTA1IHRvIDIwMTMtMDYtMDdcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1hcHBseScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB1c2VyIGNsaWNrcyBvbiB0aGUgYXBwbHkgYnV0dG9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcGx5JyxvYmopO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlZCcsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYWZ0ZXIgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbicsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYmVmb3JlIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbmVkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBvcGVuIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1hcCcsIGFodGxNYXBEaXJlY3RpdmUpO1xuXG4gICAgYWh0bE1hcERpcmVjdGl2ZS4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJ107XG5cbiAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlKHJlc29ydFNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJkZXN0aW5hdGlvbnNfX21hcFwiPjwvZGl2PicsXG4gICAgICAgICAgICBsaW5rOiBhaHRsTWFwRGlyZWN0aXZlTGlua1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICAgICAgbGV0IGhvdGVscyA9IG51bGw7XG5cbiAgICAgICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBob3RlbHMgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICBjcmVhdGVNYXAoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2F0aW9ucyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMucHVzaChbaG90ZWxzW2ldLm5hbWUsIGhvdGVsc1tpXS5fZ21hcHMubGF0LCBob3RlbHNbaV0uX2dtYXBzLmxuZ10pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG15TGF0TG5nID0ge2xhdDogLTI1LjM2MywgbG5nOiAxMzEuMDQ0fTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2JqZWN0IGFuZCBzcGVjaWZ5IHRoZSBET00gZWxlbWVudCBmb3IgZGlzcGxheS5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZGVzdGluYXRpb25zX19tYXAnKVswXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBsb2NhdGlvbnNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcih0aGlzLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKmNlbnRlcmluZyovXG4gICAgICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHt9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkudGVtcGxhdGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5RGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5Q29udHJvbGxlcigpIHtcclxuICAgICAgICAgICAgdGhpcy5pbWdzID0gbmV3IEFycmF5KDIwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlTGluaygpIHtcclxuICAgICAgICAgICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtYXNvbnJ5ID0gbmV3IE1hc29ucnkoY29udGFpbmVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbldpZHRoOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICBndXR0ZXI6ICcuZ3V0dGVyLXNpemVyJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246ICcwLjJzJyxcclxuICAgICAgICAgICAgICAgICAgICBpbml0TGF5b3V0OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWFzb25yeS5vbignbGF5b3V0Q29tcGxldGUnLCBvbkxheW91dENvbXBsZXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtYXNvbnJ5LmxheW91dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTGF5b3V0Q29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiAkKGNvbnRhaW5lcikuY3NzKCdvcGFjaXR5JywgJzEnKSwgMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuXHJcbi8qXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJyR0aW1lb3V0JywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCAkdGltZW91dCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlKSB7IC8vdG9kbyBub3Qgb25seSBsb2FkIGJ1dCBsaXN0U3JjIHRvbyBhY2NlcHRcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dGaXJzdCcsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd05leHQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsSW1hZ2VzU3JjID0gW10sXHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9ICRzY29wZS5zaG93Rmlyc3RJbWdDb3VudCxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQgPSAkc2NvcGUuc2hvd05leHRJbWdDb3VudDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gTWF0aC5taW4oc2hvd0ZpcnN0SW1nQ291bnQgKyBzaG93TmV4dEltZ0NvdW50LCBhbGxJbWFnZXNTcmMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBbGxJbWFnZXNMb2FkZWQgPSB0aGlzLnNob3dGaXJzdCA+PSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8hKiR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50LCAwKTsqIS9cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsSW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvd0ZpcnN0KSA/IHRoaXMuc2hvd0ZpcnN0Lmxlbmd0aCA9PT0gdGhpcy5pbWFnZXNDb3VudDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuZ2FsbGVyeSBpbWcnKS5sZW5ndGggPCBzaG93Rmlyc3RJbWdDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvb3BzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQodGhpcy5hbGlnbkltYWdlcywgMClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcygpO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNDb3VudCA9IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5TGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbS5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdTcmMgPSBldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1nU3JjXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAvISogdmFyICRpbWFnZXMgPSAkKCcuZ2FsbGVyeSBpbWcnKTtcclxuICAgICAgICAgICAgdmFyIGxvYWRlZF9pbWFnZXNfY291bnQgPSAwOyohL1xyXG4gICAgICAgICAgICAvISokc2NvcGUuYWxpZ25JbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRpbWFnZXMubG9hZChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRfaW1hZ2VzX2NvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkZWRfaW1hZ2VzX2NvdW50ID09ICRpbWFnZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRJbWFnZUFsaWdtZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50LCAwKTsgLy8gdG9kb1xyXG4gICAgICAgICAgICB9OyohL1xyXG5cclxuICAgICAgICAgICAgLy8kc2NvcGUuYWxpZ25JbWFnZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoY2IpIHtcclxuICAgICAgICAgICAgY2IocHJlbG9hZFNlcnZpY2UuZ2V0UHJlbG9hZENhY2hlKCdnYWxsZXJ5JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3NldEltYWdlQWxpZ21lbnQoKSB7IC8vdG9kbyBhcmd1bWVudHMgbmFtaW5nLCBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ3VyZXMgPSAkKCcuZ2FsbGVyeV9fZmlndXJlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FsbGVyeVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jbG9zZXN0KCcuZ2FsbGVyeScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY3NzKCd3aWR0aCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uc0NvdW50ID0gTWF0aC5yb3VuZChnYWxsZXJ5V2lkdGggLyBpbWFnZVdpZHRoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0ID0gbmV3IEFycmF5KGNvbHVtbnNDb3VudCArIDEpLmpvaW4oJzAnKS5zcGxpdCgnJykubWFwKCgpID0+IHtyZXR1cm4gMH0pLCAvL3RvZG8gZGVsIGpvaW4tc3BsaXRcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodCA9IGNvbHVtbnNIZWlnaHQuc2xpY2UoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgJChmaWd1cmVzKS5jc3MoJ21hcmdpbi10b3AnLCAnMCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChmaWd1cmVzLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnbWFyZ2luLXRvcCcsIC0oTWF0aC5tYXguYXBwbHkobnVsbCwgY29sdW1uc0hlaWdodCkgLSBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSkgKyBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uUG9pbnRlciA9PT0gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zSGVpZ2h0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0W2ldICs9IGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuLyEqICAgICAgICAuY29udHJvbGxlcignR2FsbGVyeUNvbnRyb2xsZXInLCBHYWxsZXJ5Q29udHJvbGxlcik7XHJcblxyXG4gICAgR2FsbGVyeUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGltYWdlc1NyYyA9IF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhpbWFnZXNTcmMpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsqIS9cclxuXHJcbi8hKlxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3Q6IFwiPWFodGxHYWxsZXJ5U2hvd0ZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG93QWZ0ZXI6IFwiPWFodGxHYWxsZXJ5U2hvd0FmdGVyXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigpe31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hID0gMTM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5hKTtcclxuICAgICAgICAgICAgLyEqdmFyIGFsbEltYWdlc1NyYztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5zaG93Rmlyc3RJbWFnZXNTcmMgPSBbJzEyMyddO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG9cclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KSohL1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyohL1xyXG4qL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0d1ZXN0Y29tbWVudHNDb250cm9sbGVyJywgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcigkcm9vdFNjb3BlLCBndWVzdGNvbW1lbnRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMud3JpdGVDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiRsb2dnZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5nZXRHdWVzdENvbW1lbnRzKCkudGhlbihcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5zZW5kQ29tbWVudCh0aGlzLmZvcm1EYXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cy5wdXNoKHsnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZSwgJ2NvbW1lbnQnOiB0aGlzLmZvcm1EYXRhLmNvbW1lbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGF0YSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3JldmVyc2UnLCByZXZlcnNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXZlcnNlKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgICAgICAgICAvL3RvIGVycm9yc1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbXMuc2xpY2UoKS5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnLCBndWVzdGNvbW1lbnRzU2VydmljZSk7XHJcblxyXG4gICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBndWVzdGNvbW1lbnRzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0R3Vlc3RDb21tZW50czogZ2V0R3Vlc3RDb21tZW50cyxcclxuICAgICAgICAgICAgc2VuZENvbW1lbnQ6IHNlbmRDb21tZW50XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0R3Vlc3RDb21tZW50cyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb21tZW50KGNvbW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXIgPSBhdXRoU2VydmljZS5nZXRMb2dJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IHVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgSGVhZGVyQ29udHJvbGxlcik7XHJcblxyXG4gICAgSGVhZGVyQ29udHJvbGxlci4kaW5qZWN0ID0gWydhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnNpZ25PdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25PdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxIZWFkZXInLCBhaHRsSGVhZGVyKTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bEhlYWRlcigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUFDJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5zZXJ2aWNlKCdIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpO1xyXG5cclxuXHRIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvZyddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJHRpbWVvdXQsICRsb2cpIHtcclxuXHRcdGZ1bmN0aW9uIFVJdHJhbnNpdGlvbnMoY29udGFpbmVyKSB7XHJcblx0XHRcdGlmICghJChjb250YWluZXIpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudCAnJHtjb250YWluZXJ9JyBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9jb250YWluZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5hbmltYXRlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50c1F1ZXJ5LFxyXG5cdFx0XHR7Y3NzRW51bWVyYWJsZVJ1bGUgPSAnd2lkdGgnLCBmcm9tID0gMCwgdG8gPSAnYXV0bycsIGRlbGF5ID0gMTAwfSkge1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2NvbnRhaW5lciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGxldCB0YXJnZXRFbGVtZW50cyA9ICQodGhpcykuZmluZCh0YXJnZXRFbGVtZW50c1F1ZXJ5KSxcclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdGlmICghdGFyZ2V0RWxlbWVudHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHt0YXJnZXRFbGVtZW50c1F1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRcdHJldHVyblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCB0byk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSA9IHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCBmcm9tKTtcclxuXHJcblx0XHRcdFx0bGV0IGFuaW1hdGVPcHRpb25zID0ge307XHJcblx0XHRcdFx0YW5pbWF0ZU9wdGlvbnNbY3NzRW51bWVyYWJsZVJ1bGVdID0gdGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuYW5pbWF0ZShhbmltYXRlT3B0aW9ucywgZGVsYXkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5yZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2sgPSBmdW5jdGlvbihlbGVtZW50VHJpZ2dlclF1ZXJ5LCBlbGVtZW50T25RdWVyeSkge1xyXG5cdFx0XHRpZiAoISQoZWxlbWVudFRyaWdnZXJRdWVyeSkubGVuZ3RoIHx8ICEkKGVsZW1lbnRPblF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtlbGVtZW50VHJpZ2dlclF1ZXJ5fSAke2VsZW1lbnRPblF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnRPblF1ZXJ5KS5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zKGhlYWRlclF1ZXJ5LCBjb250YWluZXJRdWVyeSkge1xyXG5cdFx0XHRVSXRyYW5zaXRpb25zLmNhbGwodGhpcywgY29udGFpbmVyUXVlcnkpO1xyXG5cclxuXHRcdFx0aWYgKCEkKGhlYWRlclF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtoZWFkZXJRdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0dGhpcy5faGVhZGVyID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5faGVhZGVyID0gJChoZWFkZXJRdWVyeSk7XHJcblx0XHR9XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShVSXRyYW5zaXRpb25zLnByb3RvdHlwZSk7XHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZWFkZXJUcmFuc2l0aW9ucztcclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuZml4SGVhZGVyRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50Rml4UXVlcnksIGZpeENsYXNzTmFtZSwgdW5maXhDbGFzc05hbWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2hlYWRlciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgZml4RWxlbWVudCA9ICQoZWxlbWVudEZpeFF1ZXJ5KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCkge1xyXG5cdFx0XHRcdGxldCB0aW1lcjtcclxuXHJcblx0XHRcdFx0ZnVuY3Rpb24gZml4VW5maXhNZW51T25TY3JvbGwoKSB7XHJcblx0XHRcdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gb3B0aW9ucy5vbk1pblNjcm9sbHRvcCkge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LmFkZENsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLmlubmVyV2lkdGgoKTtcclxuXHJcblx0XHRcdFx0aWYgKHdpZHRoIDwgb3B0aW9ucy5vbk1heFdpbmRvd1dpZHRoKSB7XHJcblx0XHRcdFx0XHRmaXhVbmZpeE1lbnVPblNjcm9sbCgpO1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLmFkZENsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRpbWVyKSB7XHJcblx0XHRcdFx0XHRcdFx0dGltZXIgPSAkdGltZW91dChmaXhVbmZpeE1lbnVPblNjcm9sbCwgMTUwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNlbGYuX2hlYWRlci5yZW1vdmVDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCk7XHJcblx0XHRcdCQod2luZG93KS5vbigncmVzaXplJywgb25XaWR0aENoYW5nZUhhbmRsZXIpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIEhlYWRlclRyYW5zaXRpb25zO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFN0aWt5SGVhZGVyJyxhaHRsU3Rpa3lIZWFkZXIpO1xyXG5cclxuXHRhaHRsU3Rpa3lIZWFkZXIuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTdGlreUhlYWRlcihIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKCkge1xyXG5cdFx0XHRsZXQgaGVhZGVyID0gbmV3IEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgnLmwtaGVhZGVyJywgJy5uYXZfX2l0ZW0tY29udGFpbmVyJyk7XHJcblxyXG5cdFx0XHRoZWFkZXIuYW5pbWF0ZVRyYW5zaXRpb24oXHJcblx0XHRcdFx0Jy5zdWItbmF2Jywge1xyXG5cdFx0XHRcdFx0Y3NzRW51bWVyYWJsZVJ1bGU6ICdoZWlnaHQnLFxyXG5cdFx0XHRcdFx0ZGVsYXk6IDMwMH0pXHJcblx0XHRcdFx0LnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayhcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LXRyaWdnZXJdJyxcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LW9uXScpXHJcblx0XHRcdFx0LmZpeEhlYWRlckVsZW1lbnQoXHJcblx0XHRcdFx0XHQnLm5hdicsXHJcblx0XHRcdFx0XHQnanNfbmF2LS1maXhlZCcsXHJcblx0XHRcdFx0XHQnanNfbC1oZWFkZXItLXJlbGF0aXZlJywge1xyXG5cdFx0XHRcdFx0XHRvbk1pblNjcm9sbHRvcDogODgsXHJcblx0XHRcdFx0XHRcdG9uTWF4V2luZG93V2lkdGg6IDg1MH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgSG9tZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEhvbWVDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcihyZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe3Byb3A6ICdfdHJlbmQnLCB2YWx1ZTogdHJ1ZX0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBpZiBub3QgcmVzcG9uc2VcclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1vZGFsJywgYWh0bE1vZGFsRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9tb2RhbC9tb2RhbC5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdtb2RhbE9wZW4nLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ2ltYWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zcmMgPSBkYXRhLnNyYztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5pbWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseSgpOy8vdG9kbyBhcHBseT9cclxuICAgICAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdtYXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3cubWFwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmdvb2dsZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hcFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQuc3JjID0gJ2h0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9qcz9rZXk9QUl6YVN5Qnh4Q0syLXVWeWw2OXduN0s2MU5QQVFEZjd5SC1qZjN3JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwU2NyaXB0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbXlMYXRsbmcgPSB7bGF0OiBkYXRhLmNvb3JkLmxhdCwgbG5nOiBkYXRhLmNvb3JkLmxuZ307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogNCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBteUxhdGxuZyxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbXlMYXRsbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKHRoaXMuZ2V0UG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlRGlhbG9nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcChuYW1lLCBjb29yZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBbbmFtZSwgY29vcmQubGF0LCBjb29yZC5sbmddXHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxyXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsTWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbF9fbWFwJylbMF0sIHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtsYXQ6IGNvb3JkLmxhdCwgbG5nOiBjb29yZC5sbmd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiA5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaWNvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3JkLmxhdCwgY29vcmQubG5nKSxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbi8qXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyEqY2VudGVyaW5nKiEvXHJcbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcyAoKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIExhdExhbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nIChsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGFsTWFwLmZpdEJvdW5kcyhib3VuZHMpOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2FjdGl2aXRpZXNGaWx0ZXInLCBhY3Rpdml0aWVzRmlsdGVyKTtcclxuXHJcbiAgICBhY3Rpdml0aWVzRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhY3Rpdml0aWVzRmlsdGVyKCRsb2csIGZpbHRlcnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhcmcsIF9zdHJpbmdMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHN0cmluZ0xlbmd0aCA9IHBhcnNlSW50KF9zdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHN0cmluZ0xlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybihgQ2FuJ3QgcGFyc2UgYXJndW1lbnQ6ICR7X3N0cmluZ0xlbmd0aH1gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcmdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGFyZy5qb2luKCcsICcpLnNsaWNlKDAsIHN0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnNsaWNlKDAsIHJlc3VsdC5sYXN0SW5kZXhPZignLCcpKSArICcuLi4nXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdSZXNvcnRDb250cm9sbGVyJywgUmVzb3J0Q29udHJvbGxlcik7XHJcblxyXG4gICAgUmVzb3J0Q29udHJvbGxlci4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJywgJyRmaWx0ZXInLCAnJHNjb3BlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJlc29ydENvbnRyb2xsZXIocmVzb3J0U2VydmljZSwgJGZpbHRlciwgJHNjb3BlLCAkc3RhdGUpIHtcclxuICAgICAgICBsZXQgY3VycmVudEZpbHRlcnMgPSAkc3RhdGUuJGN1cnJlbnQuZGF0YS5jdXJyZW50RmlsdGVyczsgLy8gdGVtcFxyXG5cclxuICAgICAgICB0aGlzLmZpbHRlcnMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpLmluaXRGaWx0ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMub25GaWx0ZXJDaGFuZ2UgPSBmdW5jdGlvbihmaWx0ZXJHcm91cCwgZmlsdGVyLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0gPSBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0gfHwgW107XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0ucHVzaChmaWx0ZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLnNwbGljZShjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uaW5kZXhPZihmaWx0ZXIpLCAxKTtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuYXBwbHlGaWx0ZXJzKGhvdGVscywgY3VycmVudEZpbHRlcnMpO1xyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgaG90ZWxzID0ge307XHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICBob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSBob3RlbHM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5maWx0ZXJzLnByaWNlLFxyXG4gICAgICAgICAgICAgICAgKG5ld1ZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnMucHJpY2UgPSBbbmV3VmFsdWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY3VycmVudEZpbHRlcnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvdGVscyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuYXBwbHlGaWx0ZXJzKGhvdGVscywgY3VycmVudEZpbHRlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7ICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub3Blbk1hcCA9IGZ1bmN0aW9uKGhvdGVsTmFtZSwgaG90ZWxDb29yZCwgaG90ZWwpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBzaG93OiAnbWFwJyxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGhvdGVsTmFtZSxcclxuICAgICAgICAgICAgICAgIGNvb3JkOiBob3RlbENvb3JkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCBkYXRhKVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignaG90ZWxGaWx0ZXInLCBob3RlbEZpbHRlcik7XHJcblxyXG4gICAgaG90ZWxGaWx0ZXIuJGluamVjdCA9IFsnJGxvZycsICdob3RlbERldGFpbHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGhvdGVsRmlsdGVyKCRsb2csIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgbGV0IHNhdmVkRmlsdGVycyA9IHt9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBsb2FkRmlsdGVyczogbG9hZEZpbHRlcnMsXHJcbiAgICAgICAgICAgIGFwcGx5RmlsdGVyczogYXBwbHlGaWx0ZXJzLFxyXG4gICAgICAgICAgICBpbml0RmlsdGVyczogaW5pdEZpbHRlcnNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsb2FkRmlsdGVycygpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0RmlsdGVycygpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coc2F2ZWRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgbGV0IGZpbHRlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICAgICAgZmlsdGVyc1trZXldID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhvdGVsRGV0YWlsc0NvbnN0YW50W2tleV0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gPSBzYXZlZEZpbHRlcnNba2V5XSAmJiBzYXZlZEZpbHRlcnNba2V5XS5pbmRleE9mKGhvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV0pICE9PSAtMSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAvL2ZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSA9IHNhdmVkRmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaWx0ZXJzLnByaWNlID0ge1xyXG4gICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAxMDAwXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyc1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHlGaWx0ZXJzKGhvdGVscywgZmlsdGVycykge1xyXG4gICAgICAgICAgICBzYXZlZEZpbHRlcnMgPSBmaWx0ZXJzO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGhvdGVscywgZnVuY3Rpb24oaG90ZWwpIHtcclxuICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzKGhvdGVsLCBmaWx0ZXJzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzKGhvdGVsLCBmaWx0ZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbHRlcnMsIGZ1bmN0aW9uKGZpbHRlcnNJbkdyb3VwLCBmaWx0ZXJHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV2ZXJzZUZpbHRlck1hdGNoaW5nID0gZmFsc2U7IC8vIGZvciBhY3Rpdml0aWVzIGFuZCBtdXN0aGF2ZXMgZ3JvdXBzXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJHcm91cCA9PT0gJ2d1ZXN0cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc0luR3JvdXAgPSBbZmlsdGVyc0luR3JvdXBbZmlsdGVyc0luR3JvdXAubGVuZ3RoIC0gMV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJHcm91cCA9PT0gJ211c3RIYXZlcycgfHwgZmlsdGVyR3JvdXAgPT09ICdhY3Rpdml0aWVzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXZlcnNlRmlsdGVyTWF0Y2hpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWx0ZXJzSW5Hcm91cC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJldmVyc2VGaWx0ZXJNYXRjaGluZyAmJiBnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXJzSW5Hcm91cFtpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldmVyc2VGaWx0ZXJNYXRjaGluZyAmJiAhZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoQXRMZWFzZU9uZUZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoKGZpbHRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbG9jYXRpb25zJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmxvY2F0aW9uLmNvdW50cnkgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0eXBlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC50eXBlID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2V0dGluZ3MnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZW52aXJvbm1lbnQgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtdXN0SGF2ZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZGV0YWlsc1tmaWx0ZXJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FjdGl2aXRpZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gfmhvdGVsLmFjdGl2aXRpZXMuaW5kZXhPZihmaWx0ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3ByaWNlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnByaWNlID49IGZpbHRlci5taW4gJiYgaG90ZWwucHJpY2UgPD0gZmlsdGVyLm1heDtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdndWVzdHMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwuZ3Vlc3RzLm1heCA+PSArZmlsdGVyWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaG90ZWxzLmZpbHRlcigoaG90ZWwpID0+ICFob3RlbC5faGlkZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdzY3JvbGxUb1RvcCcsIHNjcm9sbFRvVG9wRGlyZWN0aXZlKTtcclxuXHJcbiAgICBzY3JvbGxUb1RvcERpcmVjdGl2ZS4kaW5qZWN0ID0gWyckd2luZG93JywgJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZSgkbG9nKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogc2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IsIGhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmICgxKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJC50cmltKGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoMCwgYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykpKTtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBwYXJzZUludChhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLnNsaWNlKGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuaW5kZXhPZignLCcpICsgMSkpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2Nyb2xsLXRvLXRvcC1jb25maWcgaXMgbm90IGRlZmluZWRgKTtcclxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciB8fCAnaHRtbCwgYm9keSc7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtKS5vbihhdHRyLnNjcm9sbFRvVG9wLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IGhlaWdodCB9LCBcInNsb3dcIik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1NlYXJjaENvbnRyb2xsZXInLCBTZWFyY2hDb250cm9sbGVyKTtcclxuXHJcbiAgICBTZWFyY2hDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzdGF0ZScsICdyZXNvcnRTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gU2VhcmNoQ29udHJvbGxlcigkc3RhdGUsIHJlc29ydFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnF1ZXJ5ID0gJHN0YXRlLnBhcmFtcy5xdWVyeTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnF1ZXJ5KTtcclxuICAgICAgICB0aGlzLmhvdGVscyA9IG51bGw7XHJcblxyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KClcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VhcmNoKCkge1xyXG4gICAgICAgICAgICBsZXQgcGFyc2VkUXVlcnkgPSAkLnRyaW0odGhpcy5xdWVyeSkucmVwbGFjZSgvXFxzKy9nLCAnICcpLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLmhvdGVscywgKGhvdGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGhvdGVsKTtcclxuICAgICAgICAgICAgICAgIGxldCBob3RlbENvbnRlbnQgPSBob3RlbC5uYW1lICsgaG90ZWwubG9jYXRpb24uY291bnRyeSArXHJcbiAgICAgICAgICAgICAgICAgICAgaG90ZWwubG9jYXRpb24ucmVnaW9uICsgaG90ZWwuZGVzYyArIGhvdGVsLmRlc2NMb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaG90ZWxDb250ZW50KVxyXG4gICAgICAgICAgICAgICAgLy9mb3IgKClcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaGVzQ291bnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnNlZFF1ZXJ5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHFSZWdFeHAgPSBuZXcgUmVnRXhwKHBhcnNlZFF1ZXJ5W2ldLCAnZ2knKTtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzQ291bnRlciArPSAoaG90ZWxDb250ZW50Lm1hdGNoKHFSZWdFeHApIHx8IFtdKS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXNDb3VudGVyID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtob3RlbC5faWRdID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2hvdGVsLl9pZF0ubWF0Y2hlc0NvdW50ZXIgPSBtYXRjaGVzQ291bnRlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFJlc3VsdHMgPSB0aGlzLmhvdGVsc1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoaG90ZWwpID0+IHJlc3VsdFtob3RlbC5faWRdKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgoaG90ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBob3RlbC5fbWF0Y2hlcyA9IHJlc3VsdFtob3RlbC5faWRdLm1hdGNoZXNDb3VudGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNlYXJjaFJlc3VsdHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFRvcDMnLCBhaHRsVG9wM0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFRvcDNEaXJlY3RpdmUuJGluamVjdCA9IFsndG9wM1NlcnZpY2UnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsVG9wM0RpcmVjdGl2ZSh0b3AzU2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsVG9wM0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3RvcDMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdG9wMy50ZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQubXVzdEhhdmU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0VHlwZSA9ICRhdHRycy5haHRsVG9wM3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1nU3JjID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL2ltYWdlcy8nICsgdGhpcy5yZXNvcnRUeXBlICsgJy8nICsgdGhpcy5yZXNvcnRbaW5kZXhdLmltZy5maWxlbmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc1Jlc29ydEluY2x1ZGVEZXRhaWwgPSBmdW5jdGlvbihpdGVtLCBkZXRhaWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZXRhaWxDbGFzc05hbWUgPSAndG9wM19fZGV0YWlsLWNvbnRhaW5lci0tJyArIGRldGFpbCxcclxuICAgICAgICAgICAgICAgICAgICBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUgPSAhaXRlbS5kZXRhaWxzW2RldGFpbF0gPyAnIHRvcDNfX2RldGFpbC1jb250YWluZXItLWhhc250JyA6ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXRhaWxDbGFzc05hbWUgKyBpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRvcDNTZXJ2aWNlLmdldFRvcDNQbGFjZXModGhpcy5yZXNvcnRUeXBlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucmVzb3J0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgndG9wM1NlcnZpY2UnLCB0b3AzU2VydmljZSk7XHJcblxyXG4gICAgdG9wM1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiB0b3AzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRUb3AzUGxhY2VzOiBnZXRUb3AzUGxhY2VzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VG9wM1BsYWNlcyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC50b3AzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmFuaW1hdGlvbignLnNsaWRlcl9faW1nJywgYW5pbWF0aW9uRnVuY3Rpb24pO1xyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7IC8vMjAwPyAkKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMCcpO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCdsZWZ0JywgJzAnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFNsaWRlcicsIGFodGxTbGlkZXIpO1xyXG5cclxuXHRhaHRsU2xpZGVyLiRpbmplY3QgPSBbJ3NsaWRlclNlcnZpY2UnLCAnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFNsaWRlcihzbGlkZXJTZXJ2aWNlLCAkdGltZW91dCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0Y29udHJvbGxlcjogYWh0bFNsaWRlckNvbnRyb2xsZXIsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmh0bWwnLFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGFodGxTbGlkZXJDb250cm9sbGVyKCRzY29wZSkge1xyXG5cdFx0XHQkc2NvcGUuc2xpZGVyID0gc2xpZGVyU2VydmljZTtcclxuXHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHRcdFx0JHNjb3BlLm5leHRTbGlkZSA9IG5leHRTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnByZXZTbGlkZSA9IHByZXZTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnNldFNsaWRlID0gc2V0U2xpZGU7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBuZXh0U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAnbGVmdCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXROZXh0U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcHJldlNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldFByZXZTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzZXRTbGlkZShpbmRleCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gaW5kZXggPiAkc2NvcGUuc2xpZGVyLmdldEN1cnJlbnRTbGlkZSh0cnVlKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRDdXJyZW50U2xpZGUoaW5kZXgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZml4SUU4cG5nQmxhY2tCZyhlbGVtZW50KSB7XHJcblx0XHRcdCQoZWxlbWVudClcclxuXHRcdFx0XHQuY3NzKCctbXMtZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCdmaWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ3pvb20nLCAnMScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0pIHtcclxuXHRcdFx0bGV0IGFycm93cyA9ICQoZWxlbSkuZmluZCgnLnNsaWRlcl9fYXJyb3cnKTtcclxuXHJcblx0XHRcdGFycm93cy5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMC41Jyk7XHJcblx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZyh0aGlzKTtcclxuXHJcblx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdCR0aW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzEnKTtcclxuXHRcdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcoJCh0aGlzKSk7XHJcblx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdzbGlkZXJTZXJ2aWNlJyxzbGlkZXJTZXJ2aWNlKTtcclxuXHJcblx0c2xpZGVyU2VydmljZS4kaW5qZWN0ID0gWydzbGlkZXJJbWdQYXRoQ29uc3RhbnQnXTtcclxuXHJcblx0ZnVuY3Rpb24gc2xpZGVyU2VydmljZShzbGlkZXJJbWdQYXRoQ29uc3RhbnQpIHtcclxuXHRcdGZ1bmN0aW9uIFNsaWRlcihzbGlkZXJJbWFnZUxpc3QpIHtcclxuXHRcdFx0dGhpcy5faW1hZ2VTcmNMaXN0ID0gc2xpZGVySW1hZ2VMaXN0O1xyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0SW1hZ2VTcmNMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW1hZ2VTcmNMaXN0O1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChnZXRJbmRleCkge1xyXG5cdFx0XHRyZXR1cm4gZ2V0SW5kZXggPT0gdHJ1ZSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA6IHRoaXMuX2ltYWdlU3JjTGlzdFt0aGlzLl9jdXJyZW50U2xpZGVdO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xyXG5cdFx0XHRzbGlkZSA9IHBhcnNlSW50KHNsaWRlKTtcclxuXHJcblx0XHRcdGlmIChpc05hTihzbGlkZSkgfHwgc2xpZGUgPCAwIHx8IHNsaWRlID4gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IHNsaWRlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldE5leHRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpID8gdGhpcy5fY3VycmVudFNsaWRlID0gMCA6IHRoaXMuX2N1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRQcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IDApID8gdGhpcy5fY3VycmVudFNsaWRlID0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEgOiB0aGlzLl9jdXJyZW50U2xpZGUtLTtcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBuZXcgU2xpZGVyKHNsaWRlckltZ1BhdGhDb25zdGFudCk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3NsaWRlckltZ1BhdGhDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjEuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjIuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjMuanBnJ1xyXG4gICAgICAgIF0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1BhZ2VzJywgUGFnZXMpO1xyXG5cclxuICAgIFBhZ2VzLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFBhZ2VzKCRzY29wZSkge1xyXG4gICAgICAgIGNvbnN0IGhvdGVsc1BlclBhZ2UgPSA1O1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93RnJvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudFBhZ2UgLSAxKSAqIGhvdGVsc1BlclBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKyt0aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd1ByZXYgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0tdGhpcy5jdXJyZW50UGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldFBhZ2UgPSBmdW5jdGlvbihwYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlICsgMTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzTGFzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFnZXNUb3RhbC5sZW5ndGggPT09IHRoaXMuY3VycmVudFBhZ2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzRmlyc3RQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlID09PSAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgKGV2ZW50LCBzaG93SG90ZWxDb3VudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBuZXcgQXJyYXkoTWF0aC5jZWlsKHNob3dIb3RlbENvdW50IC8gaG90ZWxzUGVyUGFnZSkpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3Nob3dGcm9tJywgc2hvd0Zyb20pO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dGcm9tKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgc3RhcnRQb3NpdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoIW1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5zbGljZShzdGFydFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsUHJpY2VTbGlkZXInLCBwcmljZVNsaWRlckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgcHJpY2VTbGlkZXJEaXJlY3RpdmUuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIG1pbjogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBtYXg6IFwiQFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdFNsaWRlcjogJz0nLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRTbGlkZXI6ICc9J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IHByaWNlU2xpZGVyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlTGluaygkc2NvcGUsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5sZWZ0U2xpZGVyKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnJpZ2h0U2xpZGVyKTtcclxuICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyLm1heCA9IDE1OyovXHJcbiAgICAgICAgICAgIGxldCByaWdodEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKSxcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKSxcclxuICAgICAgICAgICAgICAgIHNsaWRlQXJlYVdpZHRoID0gcGFyc2VJbnQoJCgnLnNsaWRlJykuY3NzKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlUGVyU3RlcCA9ICRzY29wZS5tYXggLyAoc2xpZGVBcmVhV2lkdGggLSAyMCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubWluID0gcGFyc2VJbnQoJHNjb3BlLm1pbik7XHJcbiAgICAgICAgICAgICRzY29wZS5tYXggPSBwYXJzZUludCgkc2NvcGUubWF4KTtcclxuXHJcbiAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICByaWdodEJ0bixcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHNsaWRlQXJlYVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCxcclxuICAgICAgICAgICAgICAgICgpID0+IDApO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdERyYWcoZHJhZ0VsZW0sIGluaXRQb3NpdGlvbiwgbWF4UG9zaXRpb24sIG1pblBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2hpZnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNlZG93bicsIGJ0bk9uTW91c2VEb3duKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlRG93bihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0ID0gZXZlbnQucGFnZVg7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFBvc2l0aW9uID0gcGFyc2VJbnQoZHJhZ0VsZW0uY3NzKCdsZWZ0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZG9jT25Nb3VzZU1vdmUoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb25MZXNzVGhhbk1heCA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPD0gbWF4UG9zaXRpb24oKSAtIDIwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkdyYXRlclRoYW5NaW4gPSBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0ID49IG1pblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbkxlc3NUaGFuTWF4ICYmIHBvc2l0aW9uR3JhdGVyVGhhbk1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcmFnRWxlbS5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0Jywgc2xpZGVBcmVhV2lkdGggLSBpbml0UG9zaXRpb24gLSBldmVudC5wYWdlWCArIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VVcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldFByaWNlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVtaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignZHJhZ3N0YXJ0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UHJpY2VzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdNaW4gPSB+fihwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld01heCA9IH5+KHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbChuZXdNaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbChuZXdNYXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdEJ0bi5jc3MoJ2xlZnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0QnRuLmNzcygnbGVmdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFNsaWRlcnMoYnRuLCBuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQb3N0aW9uID0gbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmNzcygnbGVmdCcsIG5ld1Bvc3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnRuLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIG5ld1Bvc3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcCA+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAtIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKGxlZnRCdG4sIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlID4gJHNjb3BlLm1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VmFsdWUsJHNjb3BlLm1heCApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwIDwgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhO2wnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2xpZGVycyhyaWdodEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZW1pdCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGVmdFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5yaWdodFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyokc2NvcGUuJGJyb2FkY2FzdCgncHJpY2VTbGlkZXJQb3NpdGlvbkNoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heDogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKClcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxMyk7Ki9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL3RvZG8gaWU4IGJ1ZyBmaXhcclxuICAgICAgICAgICAgICAgIGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ2llOCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyokc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKS5jc3MoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuZmluZCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coK3NsaWRlQXJlYVdpZHRoIC0gK25ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCArc2xpZGVBcmVhV2lkdGggLSBwYXJzZUludChuZXdWYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxTbGlkZU9uQ2xpY2snLCBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgbGluazogYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgbGV0IHNsaWRlRW1pdEVsZW1lbnRzID0gJChlbGVtKS5maW5kKCdbc2xpZGUtZW1pdF0nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNsaWRlLWVtaXQgbm90IGZvdW5kYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzbGlkZUVtaXRFbGVtZW50cy5vbignY2xpY2snLCBzbGlkZUVtaXRPbkNsaWNrKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNsaWRlRW1pdE9uQ2xpY2soKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2xpZGVPbkVsZW1lbnQgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbl0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXNsaWRlRW1pdEVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnJyAmJiBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2FybihgV3JvbmcgaW5pdCB2YWx1ZSBmb3IgJ3NsaWRlLW9uJyBhdHRyaWJ1dGUsIHNob3VsZCBiZSAnJyBvciAnY2xvc2VkJy5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlVXAoJ3Nsb3cnLCBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJ2Nsb3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5zbGlkZURvd24oJ3Nsb3cnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicsICcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNsaWRlVG9nZ2xlRWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbi10b2dnbGVdJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChzbGlkZVRvZ2dsZUVsZW1lbnRzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygkKHRoaXMpLmF0dHIoJ3NsaWRlLW9uLXRvZ2dsZScpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuIl19
