'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp', ['ui.router', 'preload', 'ngAnimate', '720kb.socialshare']);
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

    run.$inject = ['$rootScope', 'backendPathsConstant', 'preloadService', '$window'];

    function run($rootScope, backendPathsConstant, preloadService, $window) {
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

    angular.module('ahotelApp').controller('SocialShareController', SocialShareController);

    SocialShareController.$inject = ['Socialshare'];

    function SocialShareController(Socialshare) {
        var share = {
            content: 'Ahotel Limited is an international hospitality brand that ' + 'manages and develops resorts, hotels and spas in Asia, America, Africa and Middle East.',
            url: 'https://enigmatic-depths-59034.herokuapp.com/'
        };
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
                    $scope.$apply(function () {
                        $scope.$root.$broadcast('modalOpen', {
                            show: 'image',
                            src: imgSrc
                        });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsImdsb2JhbHMvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy9hdXRoL2F1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvYm9va2luZy9ib29raW5nLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuZm9ybS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYm9va2luZy9kYXRlUGlja2VyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZm9vdGVyL3NvY2lhbFNoYXJlLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuZmlsdGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmF1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlclRyYW5zaXRpb25zLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc3Rpa3lIZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaG9tZS9ob21lLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9tb2RhbC9tb2RhbC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LmFjdGl2aXRpZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5ob3RlbC5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LnNjcm9sbHRvVG9wLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3NlYXJjaC9zZWFyY2guY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3RvcC90b3AzLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3RvcC90b3AzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5hbmltYXRpb24uanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXJQYXRoLmNvbnN0YW50LmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcGFnZXMvcGFnZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3ByaWNlU2xpZGVyL3ByaWNlU2xpZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3Jlc29ydC9zbGlkZU9uQ2xpY2svc2xpZGVPbkNsaWNrLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJHByb3ZpZGUiLCJkZWNvcmF0b3IiLCIkZGVsZWdhdGUiLCIkd2luZG93IiwibG9nSGlzdG9yeSIsIndhcm4iLCJlcnIiLCJsb2ciLCJtZXNzYWdlIiwiX2xvZ1dhcm4iLCJwdXNoIiwiYXBwbHkiLCJfbG9nRXJyIiwiZXJyb3IiLCJuYW1lIiwic3RhY2siLCJFcnJvciIsInNlbmRPblVubG9hZCIsIm9uYmVmb3JldW5sb2FkIiwibGVuZ3RoIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5IiwiJGluamVjdCIsInByZWxvYWRTZXJ2aWNlUHJvdmlkZXIiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsImdhbGxlcnkiLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJkYXRhIiwiY3VycmVudEZpbHRlcnMiLCJydW4iLCIkcm9vdFNjb3BlIiwicHJlbG9hZFNlcnZpY2UiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiZnJvbVN0YXRlIiwib25sb2FkIiwicHJlbG9hZEltYWdlcyIsIm1ldGhvZCIsImFjdGlvbiIsInByb3ZpZGVyIiwidGltZW91dCIsIiRnZXQiLCIkaHR0cCIsIiR0aW1lb3V0IiwicHJlbG9hZENhY2hlIiwibG9nZ2VyIiwiY29uc29sZSIsImRlYnVnIiwicHJlbG9hZE5hbWUiLCJpbWFnZXMiLCJpbWFnZXNTcmNMaXN0Iiwic3JjIiwicHJlbG9hZCIsInRoZW4iLCJyZXNwb25zZSIsImJpbmQiLCJpIiwiaW1hZ2UiLCJJbWFnZSIsImUiLCJvbmVycm9yIiwiZ2V0UHJlbG9hZCIsImdldFByZWxvYWRDYWNoZSIsImNvbnN0YW50IiwidG9wMyIsImF1dGgiLCJndWVzdGNvbW1lbnRzIiwiaG90ZWxzIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJHEiLCJtb2RlbCIsImdldFJlc29ydCIsImZpbHRlciIsIndoZW4iLCJhcHBseUZpbHRlciIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJob3RlbCIsInByb3AiLCJ2YWx1ZSIsImNvbnRyb2xsZXIiLCJBdXRoQ29udHJvbGxlciIsIiRzY29wZSIsImF1dGhTZXJ2aWNlIiwidmFsaWRhdGlvblN0YXR1cyIsInVzZXJBbHJlYWR5RXhpc3RzIiwibG9naW5PclBhc3N3b3JkSW5jb3JyZWN0IiwiY3JlYXRlVXNlciIsIm5ld1VzZXIiLCJnbyIsImxvZ2luVXNlciIsInNpZ25JbiIsInVzZXIiLCJwcmV2aW91c1N0YXRlIiwiVXNlciIsImJhY2tlbmRBcGkiLCJfYmFja2VuZEFwaSIsIl9jcmVkZW50aWFscyIsIl9vblJlc29sdmUiLCJzdGF0dXMiLCJ0b2tlbiIsIl90b2tlbktlZXBlciIsInNhdmVUb2tlbiIsIl9vblJlamVjdGVkIiwiX3Rva2VuIiwiZ2V0VG9rZW4iLCJkZWxldGVUb2tlbiIsInByb3RvdHlwZSIsImNyZWRlbnRpYWxzIiwic2lnbk91dCIsImdldExvZ0luZm8iLCJCb29raW5nQ29udHJvbGxlciIsIiRzdGF0ZVBhcmFtcyIsImxvYWRlZCIsImhvdGVsSWQiLCJnZXRIb3RlbEltYWdlc0NvdW50IiwiY291bnQiLCJBcnJheSIsIm9wZW5JbWFnZSIsIiRldmVudCIsImltZ1NyYyIsInRhcmdldCIsIiRicm9hZGNhc3QiLCJzaG93IiwiQm9va2luZ0Zvcm1Db250cm9sbGVyIiwiZm9ybSIsImRhdGUiLCJhZGRHdWVzdCIsInJlbW92ZUd1ZXN0Iiwic3VibWl0IiwiZGlyZWN0aXZlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZSIsIiRpbnRlcnZhbCIsInJlcXVpcmUiLCJsaW5rIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCIkIiwiZGF0ZVJhbmdlUGlja2VyIiwibGFuZ3VhZ2UiLCJzdGFydERhdGUiLCJEYXRlIiwiZW5kRGF0ZSIsInNldEZ1bGxZZWFyIiwiZ2V0RnVsbFllYXIiLCJvYmoiLCIkc2V0Vmlld1ZhbHVlIiwiJHJlbmRlciIsIiRhcHBseSIsImFodGxNYXBEaXJlY3RpdmUiLCJyZXN0cmljdCIsInRlbXBsYXRlIiwiYWh0bE1hcERpcmVjdGl2ZUxpbmsiLCJlbGVtIiwiYXR0ciIsImNyZWF0ZU1hcCIsIndpbmRvdyIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJfZ21hcHMiLCJsYXQiLCJsbmciLCJteUxhdExuZyIsIm1hcCIsIm1hcHMiLCJNYXAiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwic2Nyb2xsd2hlZWwiLCJpY29ucyIsImFob3RlbCIsImljb24iLCJtYXJrZXIiLCJNYXJrZXIiLCJ0aXRsZSIsInBvc2l0aW9uIiwiTGF0TG5nIiwiYWRkTGlzdGVuZXIiLCJzZXRab29tIiwic2V0Q2VudGVyIiwiZ2V0UG9zaXRpb24iLCJib3VuZHMiLCJMYXRMbmdCb3VuZHMiLCJMYXRMYW5nIiwiZXh0ZW5kIiwiZml0Qm91bmRzIiwiU29jaWFsU2hhcmVDb250cm9sbGVyIiwiU29jaWFsc2hhcmUiLCJzaGFyZSIsImNvbnRlbnQiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZSIsInNob3dGaXJzdEltZ0NvdW50Iiwic2hvd05leHRJbWdDb3VudCIsIkFodGxHYWxsZXJ5Q29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsImFodGxHYWxsZXJ5TGluayIsImFsbEltYWdlc1NyYyIsImxvYWRNb3JlIiwiTWF0aCIsIm1pbiIsInNob3dGaXJzdCIsInNsaWNlIiwiaXNBbGxJbWFnZXNMb2FkZWQiLCJhbGxJbWFnZXNMb2FkZWQiLCJpbWFnZXNDb3VudCIsImFsaWduSW1hZ2VzIiwiX3NldEltYWdlQWxpZ21lbnQiLCJvbiIsIl9nZXRJbWFnZVNvdXJjZXMiLCIkcm9vdCIsImNiIiwiZmlndXJlcyIsImdhbGxlcnlXaWR0aCIsInBhcnNlSW50IiwiY2xvc2VzdCIsImNzcyIsImltYWdlV2lkdGgiLCJjb2x1bW5zQ291bnQiLCJyb3VuZCIsImNvbHVtbnNIZWlnaHQiLCJqb2luIiwic3BsaXQiLCJjdXJyZW50Q29sdW1uc0hlaWdodCIsImNvbHVtblBvaW50ZXIiLCJlYWNoIiwiaW5kZXgiLCJtYXgiLCJHdWVzdGNvbW1lbnRzQ29udHJvbGxlciIsImd1ZXN0Y29tbWVudHNTZXJ2aWNlIiwiY29tbWVudHMiLCJvcGVuRm9ybSIsInNob3dQbGVhc2VMb2dpTWVzc2FnZSIsIndyaXRlQ29tbWVudCIsImdldEd1ZXN0Q29tbWVudHMiLCJhZGRDb21tZW50Iiwic2VuZENvbW1lbnQiLCJmb3JtRGF0YSIsImNvbW1lbnQiLCJyZXZlcnNlIiwiaXRlbXMiLCJ0eXBlIiwib25SZWplY3QiLCJIZWFkZXJDb250cm9sbGVyIiwiYWh0bEhlYWRlciIsInNlcnZpY2UiLCJIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UiLCIkbG9nIiwiVUl0cmFuc2l0aW9ucyIsImNvbnRhaW5lciIsIl9jb250YWluZXIiLCJhbmltYXRlVHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwiZmluZCIsInRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGUiLCJhbmltYXRlT3B0aW9ucyIsImFuaW1hdGUiLCJyZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2siLCJlbGVtZW50VHJpZ2dlclF1ZXJ5IiwiZWxlbWVudE9uUXVlcnkiLCJIZWFkZXJUcmFuc2l0aW9ucyIsImhlYWRlclF1ZXJ5IiwiY29udGFpbmVyUXVlcnkiLCJjYWxsIiwiX2hlYWRlciIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiZml4SGVhZGVyRWxlbWVudCIsImVsZW1lbnRGaXhRdWVyeSIsImZpeENsYXNzTmFtZSIsInVuZml4Q2xhc3NOYW1lIiwib3B0aW9ucyIsInNlbGYiLCJmaXhFbGVtZW50Iiwib25XaWR0aENoYW5nZUhhbmRsZXIiLCJ0aW1lciIsImZpeFVuZml4TWVudU9uU2Nyb2xsIiwic2Nyb2xsVG9wIiwib25NaW5TY3JvbGx0b3AiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwid2lkdGgiLCJpbm5lcldpZHRoIiwib25NYXhXaW5kb3dXaWR0aCIsIm9mZiIsInNjcm9sbCIsImFodGxTdGlreUhlYWRlciIsImhlYWRlciIsIkhvbWVDb250cm9sbGVyIiwiYWh0bE1vZGFsRGlyZWN0aXZlIiwicmVwbGFjZSIsImFodGxNb2RhbERpcmVjdGl2ZUxpbmsiLCJpbWciLCJ1bmRlZmluZWQiLCJteUxhdGxuZyIsImNvb3JkIiwiem9vbSIsImNlbnRlciIsImNsb3NlRGlhbG9nIiwibW9kYWxNYXAiLCJhY3Rpdml0aWVzRmlsdGVyIiwiZmlsdGVyc1NlcnZpY2UiLCJhcmciLCJfc3RyaW5nTGVuZ3RoIiwic3RyaW5nTGVuZ3RoIiwiaXNOYU4iLCJyZXN1bHQiLCJsYXN0SW5kZXhPZiIsIlJlc29ydENvbnRyb2xsZXIiLCIkZmlsdGVyIiwiJGN1cnJlbnQiLCJmaWx0ZXJzIiwiaW5pdEZpbHRlcnMiLCJvbkZpbHRlckNoYW5nZSIsImZpbHRlckdyb3VwIiwic3BsaWNlIiwiaW5kZXhPZiIsImFwcGx5RmlsdGVycyIsImdldFNob3dIb3RlbENvdW50IiwicmVkdWNlIiwiY291bnRlciIsIml0ZW0iLCJfaGlkZSIsIiR3YXRjaCIsIm5ld1ZhbHVlIiwib3Blbk1hcCIsImhvdGVsTmFtZSIsImhvdGVsQ29vcmQiLCJob3RlbEZpbHRlciIsImhvdGVsRGV0YWlsc0NvbnN0YW50Iiwic2F2ZWRGaWx0ZXJzIiwibG9hZEZpbHRlcnMiLCJrZXkiLCJmb3JFYWNoIiwiaXNIb3RlbE1hdGNoaW5nRmlsdGVycyIsImZpbHRlcnNJbkdyb3VwIiwibWF0Y2hBdExlYXNlT25lRmlsdGVyIiwicmV2ZXJzZUZpbHRlck1hdGNoaW5nIiwiZ2V0SG90ZWxQcm9wIiwibG9jYXRpb24iLCJjb3VudHJ5IiwiZW52aXJvbm1lbnQiLCJkZXRhaWxzIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmUiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsiLCJzZWxlY3RvciIsImhlaWdodCIsInRyaW0iLCJzY3JvbGxUb1RvcENvbmZpZyIsInNjcm9sbFRvVG9wIiwiU2VhcmNoQ29udHJvbGxlciIsInF1ZXJ5Iiwic2VhcmNoIiwicGFyc2VkUXVlcnkiLCJob3RlbENvbnRlbnQiLCJyZWdpb24iLCJkZXNjIiwiZGVzY0xvY2F0aW9uIiwibWF0Y2hlc0NvdW50ZXIiLCJxUmVnRXhwIiwiUmVnRXhwIiwibWF0Y2giLCJfaWQiLCJzZWFyY2hSZXN1bHRzIiwiX21hdGNoZXMiLCJhaHRsVG9wM0RpcmVjdGl2ZSIsInRvcDNTZXJ2aWNlIiwiQWh0bFRvcDNDb250cm9sbGVyIiwiJGVsZW1lbnQiLCIkYXR0cnMiLCJtdXN0SGF2ZSIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJmaWxlbmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbCIsImRldGFpbCIsImRldGFpbENsYXNzTmFtZSIsImlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSIsImdldFRvcDNQbGFjZXMiLCJhbmltYXRpb24iLCJhbmltYXRpb25GdW5jdGlvbiIsImJlZm9yZUFkZENsYXNzIiwiY2xhc3NOYW1lIiwiZG9uZSIsInNsaWRpbmdEaXJlY3Rpb24iLCJhaHRsU2xpZGVyIiwic2xpZGVyU2VydmljZSIsImFodGxTbGlkZXJDb250cm9sbGVyIiwic2xpZGVyIiwibmV4dFNsaWRlIiwicHJldlNsaWRlIiwic2V0U2xpZGUiLCJzZXROZXh0U2xpZGUiLCJzZXRQcmV2U2xpZGUiLCJnZXRDdXJyZW50U2xpZGUiLCJzZXRDdXJyZW50U2xpZGUiLCJmaXhJRThwbmdCbGFja0JnIiwiYXJyb3dzIiwiY2xpY2siLCJkaXNhYmxlZCIsInNsaWRlckltZ1BhdGhDb25zdGFudCIsIlNsaWRlciIsInNsaWRlckltYWdlTGlzdCIsIl9pbWFnZVNyY0xpc3QiLCJfY3VycmVudFNsaWRlIiwiZ2V0SW1hZ2VTcmNMaXN0IiwiZ2V0SW5kZXgiLCJzbGlkZSIsIlBhZ2VzIiwiaG90ZWxzUGVyUGFnZSIsImN1cnJlbnRQYWdlIiwicGFnZXNUb3RhbCIsInNob3dGcm9tIiwic2hvd05leHQiLCJzaG93UHJldiIsInNldFBhZ2UiLCJwYWdlIiwiaXNMYXN0UGFnZSIsImlzRmlyc3RQYWdlIiwic2hvd0hvdGVsQ291bnQiLCJjZWlsIiwic3RhcnRQb3NpdGlvbiIsInByaWNlU2xpZGVyRGlyZWN0aXZlIiwibGVmdFNsaWRlciIsInJpZ2h0U2xpZGVyIiwicHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rIiwicmlnaHRCdG4iLCJsZWZ0QnRuIiwic2xpZGVBcmVhV2lkdGgiLCJ2YWx1ZVBlclN0ZXAiLCJ2YWwiLCJpbml0RHJhZyIsImRyYWdFbGVtIiwiaW5pdFBvc2l0aW9uIiwibWF4UG9zaXRpb24iLCJtaW5Qb3NpdGlvbiIsInNoaWZ0IiwiYnRuT25Nb3VzZURvd24iLCJwYWdlWCIsImRvY09uTW91c2VNb3ZlIiwiYnRuT25Nb3VzZVVwIiwicG9zaXRpb25MZXNzVGhhbk1heCIsInBvc2l0aW9uR3JhdGVyVGhhbk1pbiIsInNldFByaWNlcyIsImVtaXQiLCJuZXdNaW4iLCJuZXdNYXgiLCJzZXRTbGlkZXJzIiwiYnRuIiwibmV3UG9zdGlvbiIsImhhc0NsYXNzIiwidHJpZ2dlciIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUiLCJhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluayIsInNsaWRlRW1pdEVsZW1lbnRzIiwic2xpZGVFbWl0T25DbGljayIsInNsaWRlT25FbGVtZW50Iiwic2xpZGVVcCIsIm9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSIsInNsaWRlRG93biIsInNsaWRlVG9nZ2xlRWxlbWVudHMiLCJ0b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQUEsQ0FBQyxZQUFXO0lB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QUFTQSw4QkFBOEJsWSxRQUFRMEUsTUFBTTtZQUNqRCxJQUFJeVQsb0JBQW9CelUsRUFBRWdCLE1BQU02RyxLQUFLOztZQUVyQyxJQUFJLENBQUM0TSxrQkFBa0I1ZCxRQUFRO2dCQUMzQm9RLEtBQUtsUixLQUFMOztnQkFFQTs7O1lBR0owZSxrQkFBa0IvUCxHQUFHLFNBQVNnUTs7WUFFOUIsU0FBU0EsbUJBQW1CO2dCQUN4QixJQUFJQyxpQkFBaUIzVSxFQUFFZ0IsTUFBTTZHLEtBQUs7O2dCQUVsQyxJQUFJLENBQUM0TSxrQkFBa0I1ZCxRQUFRO29CQUMzQm9RLEtBQUtsUixLQUFMOztvQkFFQTs7O2dCQUdKLElBQUk0ZSxlQUFlMVQsS0FBSyxnQkFBZ0IsTUFBTTBULGVBQWUxVCxLQUFLLGdCQUFnQixVQUFVO29CQUN4RmdHLEtBQUtsUixLQUFMOztvQkFFQTs7O2dCQUdKLElBQUk0ZSxlQUFlMVQsS0FBSyxnQkFBZ0IsSUFBSTtvQkFDeEMwVCxlQUFlQyxRQUFRLFFBQVFDO29CQUMvQkYsZUFBZTFULEtBQUssWUFBWTt1QkFDN0I7b0JBQ0g0VDtvQkFDQUYsZUFBZUcsVUFBVTtvQkFDekJILGVBQWUxVCxLQUFLLFlBQVk7OztnQkFHcEMsU0FBUzRULDJCQUEyQjtvQkFDaEMsSUFBSUUsc0JBQXNCL1UsRUFBRWdCLE1BQU02RyxLQUFLOztvQkFFdkM3SCxFQUFFMkYsS0FBS29QLHFCQUFxQixZQUFXO3dCQUNuQy9VLEVBQUUsTUFBTWdWLFlBQVloVixFQUFFLE1BQU1pQixLQUFLOzs7Ozs7S0F0RHpEIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJywgWyd1aS5yb3V0ZXInLCAncHJlbG9hZCcsICduZ0FuaW1hdGUnLCAnNzIwa2Iuc29jaWFsc2hhcmUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24gKCRwcm92aWRlKSB7XHJcbiAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcignJGxvZycsIGZ1bmN0aW9uICgkZGVsZWdhdGUsICR3aW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsb2dIaXN0b3J5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmxvZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nV2FybiA9ICRkZWxlZ2F0ZS53YXJuO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLndhcm4gPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dXYXJuLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nRXJyID0gJGRlbGVnYXRlLmVycm9yO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmVycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtuYW1lOiBtZXNzYWdlLCBzdGFjazogbmV3IEVycm9yKCkuc3RhY2t9KTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nRXJyLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiBzZW5kT25VbmxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2dIaXN0b3J5LmVyci5sZW5ndGggJiYgIWxvZ0hpc3Rvcnkud2Fybi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKCdwb3N0JywgJy9hcGkvbG9nJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkobG9nSGlzdG9yeSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkZGVsZWdhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpO1xyXG5cclxuLypcclxuICAgICAgICAuZmFjdG9yeSgnbG9nJywgbG9nKTtcclxuXHJcbiAgICBsb2cuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbG9nKCR3aW5kb3csICRsb2cpIHtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHdhcm4oLi4uYXJncykge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChhcmdzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChicm93c2VyTG9nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKGUpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICBzdGFjazogZS5zdGFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJGxvZy5lcnJvcihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdG9kbyBhbGwgZXJyb3JzXHJcblxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2Fybjogd2FybixcclxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgICAgICAgICBzZW5kT25VbmxvYWQ6IHNlbmRPblVubG9hZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhjb25maWcpO1xyXG5cclxuICAgIGNvbmZpZy4kaW5qZWN0ID0gWydwcmVsb2FkU2VydmljZVByb3ZpZGVyJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gY29uZmlnKHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlUHJvdmlkZXIuY29uZmlnKGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksICdHRVQnLCAnZ2V0JywgMTAwLCAnd2FybmluZycpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2F1dGgvYXV0aC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsndHlwZSc6ICdsb2dpbiBvciBqb2luJ30vKixcclxuXHRcdFx0XHRvbkVudGVyOiBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xyXG5cdFx0XHRcdFx0JHJvb3RTY29wZS4kc3RhdGUgPSBcImF1dGhcIjtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2J1bmdhbG93cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2hvdGVscycsIHtcclxuXHRcdFx0XHRcdHVybDogJy90b3AnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC92aWxsYXMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdnYWxsZXJ5Jywge1xyXG5cdFx0XHRcdHVybDogJy9nYWxsZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdndWVzdGNvbW1lbnRzJywge1xyXG5cdFx0XHRcdHVybDogJy9ndWVzdGNvbW1lbnRzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdkZXN0aW5hdGlvbnMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvZGVzdGluYXRpb25zJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Rlc3RpbmF0aW9ucy9kZXN0aW5hdGlvbnMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdyZXNvcnQnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3Jlc29ydCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3Jlc29ydC5odG1sJyxcclxuXHRcdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0XHRjdXJyZW50RmlsdGVyczoge31cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYm9va2luZycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYm9va2luZz9ob3RlbElkJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J2hvdGVsSWQnOiAnaG90ZWwgSWQnfVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3NlYXJjaCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvc2VhcmNoP3F1ZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydxdWVyeSc6ICdzZWFyY2ggcXVlcnknfVxyXG5cdFx0XHR9KVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLnJ1bihydW4pO1xyXG5cclxuICAgIHJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJyAsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdwcmVsb2FkU2VydmljZScsICckd2luZG93J107XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuKCRyb290U2NvcGUsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCBwcmVsb2FkU2VydmljZSwgJHdpbmRvdykge1xyXG4gICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUvKiwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVOYW1lID0gdG9TdGF0ZS5uYW1lO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZS8qLCBmcm9tUGFyYW1zIHRvZG8qLykge1xyXG4gICAgICAgICAgICAvLyR0aW1lb3V0KCgpID0+ICQoJ2JvZHknKS5zY3JvbGxUb3AoMCksIDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvL3RvZG8gb25sb2FkIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vSDvv70g77+977+977+977+977+977+9XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlLnByZWxvYWRJbWFnZXMoJ2dhbGxlcnknLCB7dXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCBtZXRob2Q6ICdHRVQnLCBhY3Rpb246ICdnZXQnfSk7IC8vdG9kbyBkZWwgbWV0aG9kLCBhY3Rpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vbG9nLnNlbmRPblVubG9hZCgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncHJlbG9hZCcsIFtdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3ByZWxvYWQnKVxyXG4gICAgICAgIC5wcm92aWRlcigncHJlbG9hZFNlcnZpY2UnLCBwcmVsb2FkU2VydmljZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcHJlbG9hZFNlcnZpY2UoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gZnVuY3Rpb24odXJsID0gJy9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcclxuICAgICAgICAgICAgICAgIGxvZzogbG9nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCRodHRwLCAkdGltZW91dCkge1xyXG4gICAgICAgICAgICBsZXQgcHJlbG9hZENhY2hlID0gW10sXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIgPSBmdW5jdGlvbihtZXNzYWdlLCBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdzaWxlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnZGVidWcnICYmIGxvZyA9PT0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvZyA9PT0gJ3dhcm5pbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZEltYWdlcyhwcmVsb2FkTmFtZSwgaW1hZ2VzKSB7IC8vdG9kbyBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZXNTcmNMaXN0ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdhcnJheScpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gaW1hZ2VzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLm1ldGhvZCB8fCBjb25maWcubWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGltYWdlcy51cmwgfHwgY29uZmlnLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5hY3Rpb24gfHwgY29uZmlnLmFjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnRpbWVvdXQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cub25sb2FkID0gcHJlbG9hZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChwcmVsb2FkLmJpbmQobnVsbCwgaW1hZ2VzU3JjTGlzdCksIGNvbmZpZy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzU3JjTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2VzU3JjTGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzb2x2ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIodGhpcy5zcmMsICdkZWJ1ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRQcmVsb2FkKHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ3ByZWxvYWRTZXJ2aWNlOiBnZXQgcmVxdWVzdCAnICsgJ1wiJyArIHByZWxvYWROYW1lICsgJ1wiJywgJ2RlYnVnJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWxvYWRDYWNoZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkQ2FjaGVbaV0ubmFtZSA9PT0gcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZVtpXS5zcmNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdObyBwcmVsb2FkcyBmb3VuZCcsICd3YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwcmVsb2FkSW1hZ2VzOiBwcmVsb2FkSW1hZ2VzLFxyXG4gICAgICAgICAgICAgICAgZ2V0UHJlbG9hZENhY2hlOiBnZXRQcmVsb2FkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2JhY2tlbmRQYXRoc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0b3AzOiAnL2FwaS90b3AzJyxcclxuICAgICAgICAgICAgYXV0aDogJy9hcGkvdXNlcnMnLFxyXG4gICAgICAgICAgICBnYWxsZXJ5OiAnL2FwaS9nYWxsZXJ5JyxcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50czogJy9hcGkvZ3Vlc3Rjb21tZW50cycsXHJcbiAgICAgICAgICAgIGhvdGVsczogJy9hcGkvaG90ZWxzJ1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2hvdGVsRGV0YWlsc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0eXBlczogW1xyXG4gICAgICAgICAgICAgICAgJ0hvdGVsJyxcclxuICAgICAgICAgICAgICAgICdCdW5nYWxvdycsXHJcbiAgICAgICAgICAgICAgICAnVmlsbGEnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nczogW1xyXG4gICAgICAgICAgICAgICAgJ0NvYXN0JyxcclxuICAgICAgICAgICAgICAgICdDaXR5JyxcclxuICAgICAgICAgICAgICAgICdEZXNlcnQnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICdOYW1pYmlhJyxcclxuICAgICAgICAgICAgICAgICdMaWJ5YScsXHJcbiAgICAgICAgICAgICAgICAnU291dGggQWZyaWNhJyxcclxuICAgICAgICAgICAgICAgICdUYW56YW5pYScsXHJcbiAgICAgICAgICAgICAgICAnUGFwdWEgTmV3IEd1aW5lYScsXHJcbiAgICAgICAgICAgICAgICAnUmV1bmlvbicsXHJcbiAgICAgICAgICAgICAgICAnU3dhemlsYW5kJyxcclxuICAgICAgICAgICAgICAgICdTYW8gVG9tZScsXHJcbiAgICAgICAgICAgICAgICAnTWFkYWdhc2NhcicsXHJcbiAgICAgICAgICAgICAgICAnTWF1cml0aXVzJyxcclxuICAgICAgICAgICAgICAgICdTZXljaGVsbGVzJyxcclxuICAgICAgICAgICAgICAgICdNYXlvdHRlJyxcclxuICAgICAgICAgICAgICAgICdVa3JhaW5lJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgZ3Vlc3RzOiBbXHJcbiAgICAgICAgICAgICAgICAnMScsXHJcbiAgICAgICAgICAgICAgICAnMicsXHJcbiAgICAgICAgICAgICAgICAnMycsXHJcbiAgICAgICAgICAgICAgICAnNCcsXHJcbiAgICAgICAgICAgICAgICAnNSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIG11c3RIYXZlczogW1xyXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxyXG4gICAgICAgICAgICAgICAgJ2tpZHMnLFxyXG4gICAgICAgICAgICAgICAgJ3Bvb2wnLFxyXG4gICAgICAgICAgICAgICAgJ3NwYScsXHJcbiAgICAgICAgICAgICAgICAnd2lmaScsXHJcbiAgICAgICAgICAgICAgICAncGV0JyxcclxuICAgICAgICAgICAgICAgICdkaXNhYmxlJyxcclxuICAgICAgICAgICAgICAgICdiZWFjaCcsXHJcbiAgICAgICAgICAgICAgICAncGFya2luZycsXHJcbiAgICAgICAgICAgICAgICAnY29uZGl0aW9uaW5nJyxcclxuICAgICAgICAgICAgICAgICdsb3VuZ2UnLFxyXG4gICAgICAgICAgICAgICAgJ3RlcnJhY2UnLFxyXG4gICAgICAgICAgICAgICAgJ2dhcmRlbicsXHJcbiAgICAgICAgICAgICAgICAnZ3ltJyxcclxuICAgICAgICAgICAgICAgICdiaWN5Y2xlcydcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGFjdGl2aXRpZXM6IFtcclxuICAgICAgICAgICAgICAgICdDb29raW5nIGNsYXNzZXMnLFxyXG4gICAgICAgICAgICAgICAgJ0N5Y2xpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0Zpc2hpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0dvbGYnLFxyXG4gICAgICAgICAgICAgICAgJ0hpa2luZycsXHJcbiAgICAgICAgICAgICAgICAnSG9yc2UtcmlkaW5nJyxcclxuICAgICAgICAgICAgICAgICdLYXlha2luZycsXHJcbiAgICAgICAgICAgICAgICAnTmlnaHRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdTYWlsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTY3ViYSBkaXZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3BwaW5nIC8gbWFya2V0cycsXHJcbiAgICAgICAgICAgICAgICAnU25vcmtlbGxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NraWluZycsXHJcbiAgICAgICAgICAgICAgICAnU3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2lsZGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmRzdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaW5lIHRhc3RpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1lvZ2EnIFxyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgcHJpY2U6IFtcclxuICAgICAgICAgICAgICAgIFwibWluXCIsXHJcbiAgICAgICAgICAgICAgICBcIm1heFwiXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ3Jlc29ydFNlcnZpY2UnLCByZXNvcnRTZXJ2aWNlKTtcclxuXHJcbiAgICByZXNvcnRTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJyRxJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzb3J0U2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsICRxKSB7XHJcbiAgICAgICAgbGV0IG1vZGVsID0gbnVsbDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmVzb3J0KGZpbHRlcikge1xyXG4gICAgICAgICAgICAvL3RvZG8gZXJyb3JzOiBubyBob3RlbHMsIG5vIGZpbHRlci4uLlxyXG4gICAgICAgICAgICBpZiAobW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKGFwcGx5RmlsdGVyKG1vZGVsKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcHBseUZpbHRlcihtb2RlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcHBseUZpbHRlcihtb2RlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYXBwbHlGaWx0ZXIoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbC5maWx0ZXIoKGhvdGVsKSA9PiBob3RlbFtmaWx0ZXIucHJvcF0gPT0gZmlsdGVyLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0UmVzb3J0OiBnZXRSZXNvcnRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBBdXRoQ29udHJvbGxlcik7XHJcblxyXG4gICAgQXV0aENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckc2NvcGUnLCAnYXV0aFNlcnZpY2UnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0aENvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHNjb3BlLCBhdXRoU2VydmljZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzID0ge1xyXG4gICAgICAgICAgICB1c2VyQWxyZWFkeUV4aXN0czogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvZ2luT3JQYXNzd29yZEluY29ycmVjdDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2UuY3JlYXRlVXNlcih0aGlzLm5ld1VzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2F1dGgnLCB7J3R5cGUnOiAnbG9naW4nfSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMudXNlckFscmVhZHlFeGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmZvcm1Kb2luKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdVc2VyKTsqL1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9naW5Vc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25Jbih0aGlzLnVzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJldmlvdXNTdGF0ZSA9ICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeVskcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkubGVuZ3RoIC0gMl0gfHwgJ2hvbWUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwcmV2aW91c1N0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKHByZXZpb3VzU3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLmxvZ2luT3JQYXNzd29yZEluY29ycmVjdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdhdXRoU2VydmljZScsIGF1dGhTZXJ2aWNlKTtcclxuXHJcbiAgICBhdXRoU2VydmljZS4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYXV0aFNlcnZpY2UoJHJvb3RTY29wZSwgJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgLy90b2RvIGVycm9yc1xyXG4gICAgICAgIGZ1bmN0aW9uIFVzZXIoYmFja2VuZEFwaSkge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZW5kQXBpID0gYmFja2VuZEFwaTtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZXNvbHZlID0gKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEudG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuc2F2ZVRva2VuKHJlc3BvbnNlLmRhdGEudG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ09LJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZWplY3RlZCA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9rZW4gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNhdmVUb2tlbihfdG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gX3Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcodG9rZW4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0VG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRlbGV0ZVRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVUb2tlbjogc2F2ZVRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGdldFRva2VuOiBnZXRUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVUb2tlbjogZGVsZXRlVG9rZW5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbkluID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBjcmVkZW50aWFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLl9jcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5zaWduT3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlci5kZWxldGVUb2tlbigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmdldExvZ0luZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB0aGlzLl9jcmVkZW50aWFscyxcclxuICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLl90b2tlbktlZXBlci5nZXRUb2tlbigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFVzZXIoYmFja2VuZFBhdGhzQ29uc3RhbnQuYXV0aCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCb29raW5nQ29udHJvbGxlcicsIEJvb2tpbmdDb250cm9sbGVyKTtcclxuXHJcbiAgICBCb29raW5nQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGVQYXJhbXMnLCAncmVzb3J0U2VydmljZScsICckc3RhdGUnLCAnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdDb250cm9sbGVyKCRzdGF0ZVBhcmFtcywgcmVzb3J0U2VydmljZSwgJHN0YXRlLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgdGhpcy5ob3RlbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe1xyXG4gICAgICAgICAgICAgICAgcHJvcDogJ19pZCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJHN0YXRlUGFyYW1zLmhvdGVsSWR9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG90ZWwgPSByZXNwb25zZVswXTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5ob3RlbCA9ICRzdGF0ZVBhcmFtcy5ob3RlbDtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRIb3RlbEltYWdlc0NvdW50ID0gZnVuY3Rpb24oY291bnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBcnJheShjb3VudCAtIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5vcGVuSW1hZ2UgPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICAgICAgbGV0IGltZ1NyYyA9ICRldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgaWYgKGltZ1NyYykge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCb29raW5nRm9ybUNvbnRyb2xsZXInLCBCb29raW5nRm9ybUNvbnRyb2xsZXIpXHJcblxyXG4gICAgZnVuY3Rpb24gQm9va2luZ0Zvcm1Db250cm9sbGVyKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAgICAgdGhpcy5mb3JtID0ge1xyXG4gICAgICAgICAgICBkYXRlOiAncGljayBkYXRlJyxcclxuICAgICAgICAgICAgZ3Vlc3RzOiAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gNSA/IHRoaXMuZm9ybS5ndWVzdHMrKyA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZUd1ZXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcm0uZ3Vlc3RzICE9PSAxID8gdGhpcy5mb3JtLmd1ZXN0cy0tIDogdGhpcy5mb3JtLmd1ZXN0c1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnZGF0ZVBpY2tlcicsIGRhdGVQaWNrZXJEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJEaXJlY3RpdmUoJGludGVydmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxyXG4gICAgICAgICAgICAvKnNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsOiAnPSdcclxuICAgICAgICAgICAgfSwqL1xyXG4gICAgICAgICAgICBsaW5rOiBkYXRlUGlja2VyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJEaXJlY3RpdmVMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICAvL3RvZG8gYWxsXHJcbiAgICAgICAgICAgICQoJ1tkYXRlLXBpY2tlcl0nKS5kYXRlUmFuZ2VQaWNrZXIoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGU6IG5ldyBEYXRlKCkuc2V0RnVsbFllYXIobmV3IERhdGUoKS5nZXRGdWxsWWVhcigpICsgMSksXHJcbiAgICAgICAgICAgICAgICB9KS5iaW5kKCdkYXRlcGlja2VyLWZpcnN0LWRhdGUtc2VsZWN0ZWQnLCBmdW5jdGlvbihldmVudCwgb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBmaXJzdCBkYXRlIGlzIHNlbGVjdGVkICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZpcnN0LWRhdGUtc2VsZWN0ZWQnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2hhbmdlJyxmdW5jdGlvbihldmVudCxvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHNlY29uZCBkYXRlIGlzIHNlbGVjdGVkICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoYW5nZScsb2JqKTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLiRzZXRWaWV3VmFsdWUob2JqLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBvYmogd2lsbCBiZSBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTE6IChEYXRlIG9iamVjdCBvZiB0aGUgZWFybGllciBkYXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTI6IChEYXRlIG9iamVjdCBvZiB0aGUgbGF0ZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy9cdCBcdHZhbHVlOiBcIjIwMTMtMDYtMDUgdG8gMjAxMy0wNi0wN1wiXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWFwcGx5JyxmdW5jdGlvbihldmVudCxvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHVzZXIgY2xpY2tzIG9uIHRoZSBhcHBseSBidXR0b24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXBwbHknLG9iaik7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2xvc2UnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGJlZm9yZSBkYXRlIHJhbmdlIHBpY2tlciBjbG9zZSBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYmVmb3JlIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2xvc2VkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBjbG9zZSBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1vcGVuJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgb3BlbiBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYmVmb3JlIG9wZW4nKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1vcGVuZWQnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGFmdGVyIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIG9wZW4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTWFwJywgYWh0bE1hcERpcmVjdGl2ZSk7XG5cbiAgICBhaHRsTWFwRGlyZWN0aXZlLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnXTtcblxuICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmUocmVzb3J0U2VydmljZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImRlc3RpbmF0aW9uc19fbWFwXCI+PC9kaXY+JyxcbiAgICAgICAgICAgIGxpbms6IGFodGxNYXBEaXJlY3RpdmVMaW5rXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XG4gICAgICAgICAgICBsZXQgaG90ZWxzID0gbnVsbDtcblxuICAgICAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIGNyZWF0ZU1hcCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU1hcCgpIHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xuICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBtYXBTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICBtYXBTY3JpcHQuc3JjID0gJ2h0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9qcz9rZXk9QUl6YVN5Qnh4Q0syLXVWeWw2OXduN0s2MU5QQVFEZjd5SC1qZjN3JztcbiAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcFNjcmlwdCk7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbG9jYXRpb25zID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3RlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9ucy5wdXNoKFtob3RlbHNbaV0ubmFtZSwgaG90ZWxzW2ldLl9nbWFwcy5sYXQsIGhvdGVsc1tpXS5fZ21hcHMubG5nXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgbXlMYXRMbmcgPSB7bGF0OiAtMjUuMzYzLCBsbmc6IDEzMS4wNDR9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkZXN0aW5hdGlvbnNfX21hcCcpWzBdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGljb25zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGxvY2F0aW9uc1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSg4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKHRoaXMuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qY2VudGVyaW5nKi9cbiAgICAgICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBMYXRMYW5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdTb2NpYWxTaGFyZUNvbnRyb2xsZXInLCBTb2NpYWxTaGFyZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIFNvY2lhbFNoYXJlQ29udHJvbGxlci4kaW5qZWN0ID0gWydTb2NpYWxzaGFyZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFNvY2lhbFNoYXJlQ29udHJvbGxlcihTb2NpYWxzaGFyZSkge1xyXG4gICAgICAgIGxldCBzaGFyZSA9IHtcclxuICAgICAgICAgICAgY29udGVudDogJ0Fob3RlbCBMaW1pdGVkIGlzIGFuIGludGVybmF0aW9uYWwgaG9zcGl0YWxpdHkgYnJhbmQgdGhhdCAnICtcclxuICAgICAgICAgICAgICAgICdtYW5hZ2VzIGFuZCBkZXZlbG9wcyByZXNvcnRzLCBob3RlbHMgYW5kIHNwYXMgaW4gQXNpYSwgQW1lcmljYSwgQWZyaWNhIGFuZCBNaWRkbGUgRWFzdC4nLFxyXG4gICAgICAgICAgICB1cmw6ICdodHRwczovL2VuaWdtYXRpYy1kZXB0aHMtNTkwMzQuaGVyb2t1YXBwLmNvbS8nXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJyR0aW1lb3V0JywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCAkdGltZW91dCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlKSB7IC8vdG9kbyBub3Qgb25seSBsb2FkIGJ1dCBsaXN0U3JjIHRvbyBhY2NlcHRcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dGaXJzdCcsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd05leHQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsSW1hZ2VzU3JjID0gW10sXHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9ICRzY29wZS5zaG93Rmlyc3RJbWdDb3VudCxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQgPSAkc2NvcGUuc2hvd05leHRJbWdDb3VudDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gTWF0aC5taW4oc2hvd0ZpcnN0SW1nQ291bnQgKyBzaG93TmV4dEltZ0NvdW50LCBhbGxJbWFnZXNTcmMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBbGxJbWFnZXNMb2FkZWQgPSB0aGlzLnNob3dGaXJzdCA+PSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyovXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsbEltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob3dGaXJzdCkgPyB0aGlzLnNob3dGaXJzdC5sZW5ndGggPT09IHRoaXMuaW1hZ2VzQ291bnQ6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmdhbGxlcnkgaW1nJykubGVuZ3RoIDwgc2hvd0ZpcnN0SW1nQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb29wcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHRoaXMuYWxpZ25JbWFnZXMsIDApXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMoKTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzQ291bnQgPSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGVsZW0ub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nU3JjID0gZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgLyogdmFyICRpbWFnZXMgPSAkKCcuZ2FsbGVyeSBpbWcnKTtcclxuICAgICAgICAgICAgdmFyIGxvYWRlZF9pbWFnZXNfY291bnQgPSAwOyovXHJcbiAgICAgICAgICAgIC8qJHNjb3BlLmFsaWduSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkX2ltYWdlc19jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkX2ltYWdlc19jb3VudCA9PSAkaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0SW1hZ2VBbGlnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7IC8vIHRvZG9cclxuICAgICAgICAgICAgfTsqL1xyXG5cclxuICAgICAgICAgICAgLy8kc2NvcGUuYWxpZ25JbWFnZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoY2IpIHtcclxuICAgICAgICAgICAgY2IocHJlbG9hZFNlcnZpY2UuZ2V0UHJlbG9hZENhY2hlKCdnYWxsZXJ5JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3NldEltYWdlQWxpZ21lbnQoKSB7IC8vdG9kbyBhcmd1bWVudHMgbmFtaW5nLCBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ3VyZXMgPSAkKCcuZ2FsbGVyeV9fZmlndXJlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FsbGVyeVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jbG9zZXN0KCcuZ2FsbGVyeScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY3NzKCd3aWR0aCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uc0NvdW50ID0gTWF0aC5yb3VuZChnYWxsZXJ5V2lkdGggLyBpbWFnZVdpZHRoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0ID0gbmV3IEFycmF5KGNvbHVtbnNDb3VudCArIDEpLmpvaW4oJzAnKS5zcGxpdCgnJykubWFwKCgpID0+IHtyZXR1cm4gMH0pLCAvL3RvZG8gZGVsIGpvaW4tc3BsaXRcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodCA9IGNvbHVtbnNIZWlnaHQuc2xpY2UoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgJChmaWd1cmVzKS5jc3MoJ21hcmdpbi10b3AnLCAnMCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChmaWd1cmVzLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnbWFyZ2luLXRvcCcsIC0oTWF0aC5tYXguYXBwbHkobnVsbCwgY29sdW1uc0hlaWdodCkgLSBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSkgKyBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uUG9pbnRlciA9PT0gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zSGVpZ2h0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0W2ldICs9IGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuLyogICAgICAgIC5jb250cm9sbGVyKCdHYWxsZXJ5Q29udHJvbGxlcicsIEdhbGxlcnlDb250cm9sbGVyKTtcclxuXHJcbiAgICBHYWxsZXJ5Q29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICB2YXIgaW1hZ2VzU3JjID0gX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGltYWdlc1NyYylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyovXHJcblxyXG4vKlxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3Q6IFwiPWFodGxHYWxsZXJ5U2hvd0ZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG93QWZ0ZXI6IFwiPWFodGxHYWxsZXJ5U2hvd0FmdGVyXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigpe31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hID0gMTM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5hKTtcclxuICAgICAgICAgICAgLyEqdmFyIGFsbEltYWdlc1NyYztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5zaG93Rmlyc3RJbWFnZXNTcmMgPSBbJzEyMyddO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG9cclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KSohL1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXInLCBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcik7XHJcblxyXG4gICAgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICdndWVzdGNvbW1lbnRzU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKCRyb290U2NvcGUsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy53cml0ZUNvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJGxvZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLmdldEd1ZXN0Q29tbWVudHMoKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLnNlbmRDb21tZW50KHRoaXMuZm9ybURhdGEpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2goeyduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lLCAnY29tbWVudCc6IHRoaXMuZm9ybURhdGEuY29tbWVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1EYXRhID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcigncmV2ZXJzZScsIHJldmVyc2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJldmVyc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIC8vdG8gZXJyb3JzXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtcy5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdndWVzdGNvbW1lbnRzU2VydmljZScsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKTtcclxuXHJcbiAgICBndWVzdGNvbW1lbnRzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRHdWVzdENvbW1lbnRzOiBnZXRHdWVzdENvbW1lbnRzLFxyXG4gICAgICAgICAgICBzZW5kQ29tbWVudDogc2VuZENvbW1lbnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRHdWVzdENvbW1lbnRzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbW1lbnQoY29tbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF1dGhTZXJ2aWNlLmdldExvZ0luZm8oKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlcixcclxuICAgICAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3QocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTtcclxuXHJcbiAgICBIZWFkZXJDb250cm9sbGVyLiRpbmplY3QgPSBbJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcihhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2lnbk91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbk91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsIGFodGxIZWFkZXIpO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9nJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgkdGltZW91dCwgJGxvZykge1xyXG5cdFx0ZnVuY3Rpb24gVUl0cmFuc2l0aW9ucyhjb250YWluZXIpIHtcclxuXHRcdFx0aWYgKCEkKGNvbnRhaW5lcikubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50ICcke2NvbnRhaW5lcn0nIG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmFuaW1hdGVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fY29udGFpbmVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bGV0IHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRFbGVtZW50cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke3RhcmdldEVsZW1lbnRzUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIHRvKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRsZXQgYW5pbWF0ZU9wdGlvbnMgPSB7fTtcclxuXHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayA9IGZ1bmN0aW9uKGVsZW1lbnRUcmlnZ2VyUXVlcnksIGVsZW1lbnRPblF1ZXJ5KSB7XHJcblx0XHRcdGlmICghJChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5sZW5ndGggfHwgISQoZWxlbWVudE9uUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2VsZW1lbnRUcmlnZ2VyUXVlcnl9ICR7ZWxlbWVudE9uUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWxlbWVudE9uUXVlcnkpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnMoaGVhZGVyUXVlcnksIGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdFVJdHJhbnNpdGlvbnMuY2FsbCh0aGlzLCBjb250YWluZXJRdWVyeSk7XHJcblxyXG5cdFx0XHRpZiAoISQoaGVhZGVyUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2hlYWRlclF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnRGaXhRdWVyeSwgZml4Q2xhc3NOYW1lLCB1bmZpeENsYXNzTmFtZSwgb3B0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5faGVhZGVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBmaXhFbGVtZW50ID0gJChlbGVtZW50Rml4UXVlcnkpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykuaW5uZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLnJlbW92ZUNsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b25XaWR0aENoYW5nZUhhbmRsZXIoKTtcclxuXHRcdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBvbldpZHRoQ2hhbmdlSGFuZGxlcik7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcik7XHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoKSB7XHJcblx0XHRcdGxldCBoZWFkZXIgPSBuZXcgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCcubC1oZWFkZXInLCAnLm5hdl9faXRlbS1jb250YWluZXInKTtcclxuXHJcblx0XHRcdGhlYWRlci5hbmltYXRlVHJhbnNpdGlvbihcclxuXHRcdFx0XHQnLnN1Yi1uYXYnLCB7XHJcblx0XHRcdFx0XHRjc3NFbnVtZXJhYmxlUnVsZTogJ2hlaWdodCcsXHJcblx0XHRcdFx0XHRkZWxheTogMzAwfSlcclxuXHRcdFx0XHQucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrKFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtdHJpZ2dlcl0nLFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtb25dJylcclxuXHRcdFx0XHQuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHRcdCdqc19uYXYtLWZpeGVkJyxcclxuXHRcdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdFx0b25NYXhXaW5kb3dXaWR0aDogODUwfSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcik7XHJcblxyXG4gICAgSG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKHJlc29ydFNlcnZpY2UpIHtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7cHJvcDogJ190cmVuZCcsIHZhbHVlOiB0cnVlfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgLy90b2RvIGlmIG5vdCByZXNwb25zZVxyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTW9kYWwnLCBhaHRsTW9kYWxEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgcmVwbGFjZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxNb2RhbERpcmVjdGl2ZUxpbmssXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL21vZGFsL21vZGFsLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3cgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ21vZGFsT3BlbicsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAnaW1hZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNyYyA9IGRhdGEuc3JjO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LmltZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7Ly90b2RvIGFwcGx5P1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ21hcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5tYXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ29vZ2xlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBteUxhdGxuZyA9IHtsYXQ6IGRhdGEuY29vcmQubGF0LCBsbmc6IGRhdGEuY29vcmQubG5nfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IG15TGF0bG5nLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBteUxhdGxuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIodGhpcy5nZXRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2VEaWFsb2cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKG5hbWUsIGNvb3JkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIFtuYW1lLCBjb29yZC5sYXQsIGNvb3JkLmxuZ11cclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWxNYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge2xhdDogY29vcmQubGF0LCBsbmc6IGNvb3JkLmxuZ30sXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhaG90ZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuLypcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvISpjZW50ZXJpbmcqIS9cclxuICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzICgpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kYWxNYXAuZml0Qm91bmRzKGJvdW5kcyk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignYWN0aXZpdGllc0ZpbHRlcicsIGFjdGl2aXRpZXNGaWx0ZXIpO1xyXG5cclxuICAgIGFjdGl2aXRpZXNGaWx0ZXIuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFjdGl2aXRpZXNGaWx0ZXIoJGxvZywgZmlsdGVyc1NlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyZywgX3N0cmluZ0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc3RyaW5nTGVuZ3RoID0gcGFyc2VJbnQoX3N0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4oc3RyaW5nTGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBDYW4ndCBwYXJzZSBhcmd1bWVudDogJHtfc3RyaW5nTGVuZ3RofWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZ1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXJnLmpvaW4oJywgJykuc2xpY2UoMCwgc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuc2xpY2UoMCwgcmVzdWx0Lmxhc3RJbmRleE9mKCcsJykpICsgJy4uLidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jlc29ydENvbnRyb2xsZXInLCBSZXNvcnRDb250cm9sbGVyKTtcclxuXHJcbiAgICBSZXNvcnRDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnLCAnJGZpbHRlcicsICckc2NvcGUnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUmVzb3J0Q29udHJvbGxlcihyZXNvcnRTZXJ2aWNlLCAkZmlsdGVyLCAkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICAgIGxldCBjdXJyZW50RmlsdGVycyA9ICRzdGF0ZS4kY3VycmVudC5kYXRhLmN1cnJlbnRGaWx0ZXJzOyAvLyB0ZW1wXHJcblxyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuaW5pdEZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZSA9IGZ1bmN0aW9uKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSA9IGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5wdXNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uc3BsaWNlKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlciksIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBob3RlbHMgPSB7fTtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IGhvdGVscztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLmZpbHRlcnMucHJpY2UsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVycy5wcmljZSA9IFtuZXdWYWx1ZV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjdXJyZW50RmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTsgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuTWFwID0gZnVuY3Rpb24oaG90ZWxOYW1lLCBob3RlbENvb3JkLCBob3RlbCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHNob3c6ICdtYXAnLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogaG90ZWxOYW1lLFxyXG4gICAgICAgICAgICAgICAgY29vcmQ6IGhvdGVsQ29vcmRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIGRhdGEpXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdob3RlbEZpbHRlcicsIGhvdGVsRmlsdGVyKTtcclxuXHJcbiAgICBob3RlbEZpbHRlci4kaW5qZWN0ID0gWyckbG9nJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gaG90ZWxGaWx0ZXIoJGxvZywgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICBsZXQgc2F2ZWRGaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxvYWRGaWx0ZXJzOiBsb2FkRmlsdGVycyxcclxuICAgICAgICAgICAgYXBwbHlGaWx0ZXJzOiBhcHBseUZpbHRlcnMsXHJcbiAgICAgICAgICAgIGluaXRGaWx0ZXJzOiBpbml0RmlsdGVyc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRGaWx0ZXJzKCkge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRGaWx0ZXJzKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzYXZlZEZpbHRlcnMpO1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVycyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSA9IHNhdmVkRmlsdGVyc1trZXldICYmIHNhdmVkRmlsdGVyc1trZXldLmluZGV4T2YoaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXSkgIT09IC0xID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZpbHRlcnMucHJpY2UgPSB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDEwMDBcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseUZpbHRlcnMoaG90ZWxzLCBmaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIHNhdmVkRmlsdGVycyA9IGZpbHRlcnM7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaG90ZWxzLCBmdW5jdGlvbihob3RlbCkge1xyXG4gICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZmlsdGVycywgZnVuY3Rpb24oZmlsdGVyc0luR3JvdXAsIGZpbHRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXZlcnNlRmlsdGVyTWF0Y2hpbmcgPSBmYWxzZTsgLy8gZm9yIGFjdGl2aXRpZXMgYW5kIG11c3RoYXZlcyBncm91cHNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckdyb3VwID09PSAnZ3Vlc3RzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzSW5Hcm91cCA9IFtmaWx0ZXJzSW5Hcm91cFtmaWx0ZXJzSW5Hcm91cC5sZW5ndGggLSAxXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckdyb3VwID09PSAnbXVzdEhhdmVzJyB8fCBmaWx0ZXJHcm91cCA9PT0gJ2FjdGl2aXRpZXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VGaWx0ZXJNYXRjaGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbHRlcnNJbkdyb3VwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmV2ZXJzZUZpbHRlck1hdGNoaW5nICYmIGdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV2ZXJzZUZpbHRlck1hdGNoaW5nICYmICFnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXJzSW5Hcm91cFtpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hBdExlYXNlT25lRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb2NhdGlvbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwubG9jYXRpb24uY291bnRyeSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3R5cGVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnR5cGUgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXR0aW5ncyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5lbnZpcm9ubWVudCA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ211c3RIYXZlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5kZXRhaWxzW2ZpbHRlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWN0aXZpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB+aG90ZWwuYWN0aXZpdGllcy5pbmRleE9mKGZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwucHJpY2UgPj0gZmlsdGVyLm1pbiAmJiBob3RlbC5wcmljZSA8PSBmaWx0ZXIubWF4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2d1ZXN0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5ndWVzdHMubWF4ID49ICtmaWx0ZXJbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBob3RlbHMuZmlsdGVyKChob3RlbCkgPT4gIWhvdGVsLl9oaWRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3Njcm9sbFRvVG9wJywgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUpO1xyXG5cclxuICAgIHNjcm9sbFRvVG9wRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciwgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgaWYgKDEpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAkLnRyaW0oYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZSgwLCBhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzY3JvbGwtdG8tdG9wLWNvbmZpZyBpcyBub3QgZGVmaW5lZGApO1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yIHx8ICdodG1sLCBib2R5JztcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW0pLm9uKGF0dHIuc2Nyb2xsVG9Ub3AsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogaGVpZ2h0IH0sIFwic2xvd1wiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFNlYXJjaENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFNlYXJjaENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlJywgJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzdGF0ZSwgcmVzb3J0U2VydmljZSkge1xyXG4gICAgICAgIHRoaXMucXVlcnkgPSAkc3RhdGUucGFyYW1zLnF1ZXJ5O1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMucXVlcnkpO1xyXG4gICAgICAgIHRoaXMuaG90ZWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2guY2FsbCh0aGlzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZWFyY2goKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJzZWRRdWVyeSA9ICQudHJpbSh0aGlzLnF1ZXJ5KS5yZXBsYWNlKC9cXHMrL2csICcgJykuc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuaG90ZWxzLCAoaG90ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaG90ZWwpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhvdGVsQ29udGVudCA9IGhvdGVsLm5hbWUgKyBob3RlbC5sb2NhdGlvbi5jb3VudHJ5ICtcclxuICAgICAgICAgICAgICAgICAgICBob3RlbC5sb2NhdGlvbi5yZWdpb24gKyBob3RlbC5kZXNjICsgaG90ZWwuZGVzY0xvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhob3RlbENvbnRlbnQpXHJcbiAgICAgICAgICAgICAgICAvL2ZvciAoKVxyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoZXNDb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyc2VkUXVlcnkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcVJlZ0V4cCA9IG5ldyBSZWdFeHAocGFyc2VkUXVlcnlbaV0sICdnaScpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXNDb3VudGVyICs9IChob3RlbENvbnRlbnQubWF0Y2gocVJlZ0V4cCkgfHwgW10pLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlc0NvdW50ZXIgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2hvdGVsLl9pZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaG90ZWwuX2lkXS5tYXRjaGVzQ291bnRlciA9IG1hdGNoZXNDb3VudGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IHRoaXMuaG90ZWxzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChob3RlbCkgPT4gcmVzdWx0W2hvdGVsLl9pZF0pXHJcbiAgICAgICAgICAgICAgICAubWFwKChob3RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdGVsLl9tYXRjaGVzID0gcmVzdWx0W2hvdGVsLl9pZF0ubWF0Y2hlc0NvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2VhcmNoUmVzdWx0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsVG9wMycsIGFodGxUb3AzRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsVG9wM0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyd0b3AzU2VydmljZScsICdob3RlbERldGFpbHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxUb3AzRGlyZWN0aXZlKHRvcDNTZXJ2aWNlLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxUb3AzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndG9wMycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC90b3AzLnRlbXBsYXRlLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bFRvcDNDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICB0aGlzLmRldGFpbHMgPSBob3RlbERldGFpbHNDb25zdGFudC5tdXN0SGF2ZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnRUeXBlID0gJGF0dHJzLmFodGxUb3AzdHlwZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRJbWdTcmMgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvaW1hZ2VzLycgKyB0aGlzLnJlc29ydFR5cGUgKyAnLycgKyB0aGlzLnJlc29ydFtpbmRleF0uaW1nLmZpbGVuYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzUmVzb3J0SW5jbHVkZURldGFpbCA9IGZ1bmN0aW9uKGl0ZW0sIGRldGFpbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGFpbENsYXNzTmFtZSA9ICd0b3AzX19kZXRhaWwtY29udGFpbmVyLS0nICsgZGV0YWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSA9ICFpdGVtLmRldGFpbHNbZGV0YWlsXSA/ICcgdG9wM19fZGV0YWlsLWNvbnRhaW5lci0taGFzbnQnIDogJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFpbENsYXNzTmFtZSArIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdG9wM1NlcnZpY2UuZ2V0VG9wM1BsYWNlcyh0aGlzLnJlc29ydFR5cGUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5yZXNvcnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCd0b3AzU2VydmljZScsIHRvcDNTZXJ2aWNlKTtcclxuXHJcbiAgICB0b3AzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHRvcDNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvcDNQbGFjZXM6IGdldFRvcDNQbGFjZXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUb3AzUGxhY2VzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LnRvcDMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuYW5pbWF0aW9uKCcuc2xpZGVyX19pbWcnLCBhbmltYXRpb25GdW5jdGlvbik7XHJcblxyXG5cdGZ1bmN0aW9uIGFuaW1hdGlvbkZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0YmVmb3JlQWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHRsZXQgc2xpZGluZ0RpcmVjdGlvbiA9IGVsZW1lbnQuc2NvcGUoKS5zbGlkaW5nRGlyZWN0aW9uO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzEnKTtcclxuXHJcblx0XHRcdFx0aWYoc2xpZGluZ0RpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICcxMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnLTIwMCUnfSwgNTAwLCBkb25lKTsgLy8yMDA/ICQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJywgYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUGFnZXMnLCBQYWdlcyk7XHJcblxyXG4gICAgUGFnZXMuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUGFnZXMoJHNjb3BlKSB7XHJcbiAgICAgICAgY29uc3QgaG90ZWxzUGVyUGFnZSA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dGcm9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5jdXJyZW50UGFnZSAtIDEpICogaG90ZWxzUGVyUGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiArK3RoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93UHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLS10aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2UgKyAxO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWdlc1RvdGFsLmxlbmd0aCA9PT0gdGhpcy5jdXJyZW50UGFnZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNGaXJzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2UgPT09IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCAoZXZlbnQsIHNob3dIb3RlbENvdW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IG5ldyBBcnJheShNYXRoLmNlaWwoc2hvd0hvdGVsQ291bnQgLyBob3RlbHNQZXJQYWdlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignc2hvd0Zyb20nLCBzaG93RnJvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0Zyb20oKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBzdGFydFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnNsaWNlKHN0YXJ0UG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxQcmljZVNsaWRlcicsIHByaWNlU2xpZGVyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBwcmljZVNsaWRlckRpcmVjdGl2ZS4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiBcIkBcIixcclxuICAgICAgICAgICAgICAgIG1heDogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0U2xpZGVyOiAnPScsXHJcbiAgICAgICAgICAgICAgICByaWdodFNsaWRlcjogJz0nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5odG1sJyxcclxuICAgICAgICAgICAgbGluazogcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rKCRzY29wZSwgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmxlZnRTbGlkZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmlnaHRTbGlkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIubWF4ID0gMTU7Ki9cclxuICAgICAgICAgICAgbGV0IHJpZ2h0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVBcmVhV2lkdGggPSBwYXJzZUludCgkKCcuc2xpZGUnKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVQZXJTdGVwID0gJHNjb3BlLm1heCAvIChzbGlkZUFyZWFXaWR0aCAtIDIwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5taW4gPSBwYXJzZUludCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJHNjb3BlLm1heCA9IHBhcnNlSW50KCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIHJpZ2h0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gc2xpZGVBcmVhV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSArIDIwLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gMCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0RHJhZyhkcmFnRWxlbSwgaW5pdFBvc2l0aW9uLCBtYXhQb3NpdGlvbiwgbWluUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzaGlmdDtcclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2Vkb3duJywgYnRuT25Nb3VzZURvd24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSBldmVudC5wYWdlWDtcclxuICAgICAgICAgICAgICAgICAgICBpbml0UG9zaXRpb24gPSBwYXJzZUludChkcmFnRWxlbS5jc3MoJ2xlZnQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkb2NPbk1vdXNlTW92ZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbkxlc3NUaGFuTWF4ID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA8PSBtYXhQb3NpdGlvbigpIC0gMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uR3JhdGVyVGhhbk1pbiA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPj0gbWluUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uTGVzc1RoYW5NYXggJiYgcG9zaXRpb25HcmF0ZXJUaGFuTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdFbGVtLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIGluaXRQb3NpdGlvbiAtIGV2ZW50LnBhZ2VYICsgc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdkcmFnc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQcmljZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld01pbiA9IH5+KHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF4ID0gfn4ocGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKG5ld01pbik7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKG5ld01heCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0QnRuLmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRCdG4uY3NzKCdsZWZ0JylcclxuICAgICAgICAgICAgICAgICAgICB9KSovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0U2xpZGVycyhidG4sIG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1Bvc3Rpb24gPSBuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcDtcclxuICAgICAgICAgICAgICAgICAgICBidG4uY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidG4uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwID4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpIC0gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMobGVmdEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4Jykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPiAkc2NvcGUubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdWYWx1ZSwkc2NvcGUubWF4ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPCBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSArIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKHJpZ2h0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlbWl0KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZWZ0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEzKTsqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdG9kbyBpZTggYnVnIGZpeFxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnaWU4JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygrc2xpZGVBcmVhV2lkdGggLSArbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsICtzbGlkZUFyZWFXaWR0aCAtIHBhcnNlSW50KG5ld1ZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFNsaWRlT25DbGljaycsIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBsZXQgc2xpZGVFbWl0RWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1lbWl0XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNsaWRlRW1pdEVsZW1lbnRzLm9uKCdjbGljaycsIHNsaWRlRW1pdE9uQ2xpY2spO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2xpZGVFbWl0T25DbGljaygpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzbGlkZU9uRWxlbWVudCA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICcnICYmIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBXcm9uZyBpbml0IHZhbHVlIGZvciAnc2xpZGUtb24nIGF0dHJpYnV0ZSwgc2hvdWxkIGJlICcnIG9yICdjbG9zZWQnLmApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVVcCgnc2xvdycsIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnY2xvc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlRG93bignc2xvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2xpZGVUb2dnbGVFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uLXRvZ2dsZV0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHNsaWRlVG9nZ2xlRWxlbWVudHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCQodGhpcykuYXR0cignc2xpZGUtb24tdG9nZ2xlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iXX0=
