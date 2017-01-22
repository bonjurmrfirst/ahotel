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
			templateUrl: 'app/partials/resort/resort.html',
			data: {
				currentFilters: {}
			}
		}).state('booking', {
			url: '/booking?hotelId',
			templateUrl: 'app/partials/booking/booking.html',
			params: { 'hotelId': 'hotel Id' }
		});
	}
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').run(run);

    run.$inject = ['$rootScope', 'backendPathsConstant', 'preloadService', '$window', '$timeout'];

    function run($rootScope, backendPathsConstant, preloadService, $window, $timeout) {
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

                    var icons = {
                        ahotel: {
                            icon: 'assets/images/icon_map.png'
                        }
                    };

                    var map = new google.maps.Map(document.getElementsByClassName('modal__map')[0], {
                        title: data.name,
                        map: map,
                        zoom: 4,
                        center: myLatlng,
                        icon: icons["ahotel"].icon
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucHJlbG9hZC5qcyIsImFob3RlbC5yb3V0ZXMuanMiLCJhaG90ZWwucnVuLmpzIiwiY29tcG9uZW50cy9wcmVsb2FkLm1vZHVsZS5qcyIsImNvbXBvbmVudHMvcHJlbG9hZC5zZXJ2aWNlLmpzIiwiZ2xvYmFscy9iYWNrZW5kUGF0aHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL2hvdGVsRGV0YWlscy5jb25zdGFudC5qcyIsImdsb2JhbHMvcmVzb3J0LnNlcnZpY2UuanMiLCJwYXJ0aWFscy9hdXRoL2F1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvYm9va2luZy9ib29raW5nLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuZm9ybS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYm9va2luZy9kYXRlUGlja2VyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2Rlc3RpbmF0aW9ucy9tYXAuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmZpbHRlci5qcyIsInBhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlci5hdXRoLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXJUcmFuc2l0aW9ucy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3N0aWt5SGVhZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hvbWUvaG9tZS5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvbW9kYWwvbW9kYWwuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5hY3Rpdml0aWVzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaG90ZWwuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5zY3JvbGx0b1RvcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy90b3AvdG9wMy5zZXJ2aWNlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuYW5pbWF0aW9uLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuc2VydmljZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyUGF0aC5jb25zdGFudC5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3BhZ2VzL3BhZ2VzLmZpbHRlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvc2xpZGVPbkNsaWNrL3NsaWRlT25DbGljay5kaXJlY3RpdmUuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRwcm92aWRlIiwiZGVjb3JhdG9yIiwiJGRlbGVnYXRlIiwiJHdpbmRvdyIsImxvZ0hpc3RvcnkiLCJ3YXJuIiwiZXJyIiwibG9nIiwibWVzc2FnZSIsIl9sb2dXYXJuIiwicHVzaCIsImFwcGx5IiwiX2xvZ0VyciIsImVycm9yIiwibmFtZSIsInN0YWNrIiwiRXJyb3IiLCJzZW5kT25VbmxvYWQiLCJvbmJlZm9yZXVubG9hZCIsImxlbmd0aCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIiRpbmplY3QiLCJwcmVsb2FkU2VydmljZVByb3ZpZGVyIiwiYmFja2VuZFBhdGhzQ29uc3RhbnQiLCJnYWxsZXJ5IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCJvdGhlcndpc2UiLCJzdGF0ZSIsInVybCIsInRlbXBsYXRlVXJsIiwicGFyYW1zIiwiZGF0YSIsImN1cnJlbnRGaWx0ZXJzIiwicnVuIiwiJHJvb3RTY29wZSIsInByZWxvYWRTZXJ2aWNlIiwiJHRpbWVvdXQiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiZnJvbVN0YXRlIiwib25sb2FkIiwicHJlbG9hZEltYWdlcyIsIm1ldGhvZCIsImFjdGlvbiIsInByb3ZpZGVyIiwidGltZW91dCIsIiRnZXQiLCIkaHR0cCIsInByZWxvYWRDYWNoZSIsImxvZ2dlciIsImNvbnNvbGUiLCJkZWJ1ZyIsInByZWxvYWROYW1lIiwiaW1hZ2VzIiwiaW1hZ2VzU3JjTGlzdCIsInNyYyIsInByZWxvYWQiLCJ0aGVuIiwicmVzcG9uc2UiLCJiaW5kIiwiaSIsImltYWdlIiwiSW1hZ2UiLCJlIiwib25lcnJvciIsImdldFByZWxvYWQiLCJnZXRQcmVsb2FkQ2FjaGUiLCJjb25zdGFudCIsInRvcDMiLCJhdXRoIiwiZ3Vlc3Rjb21tZW50cyIsImhvdGVscyIsInR5cGVzIiwic2V0dGluZ3MiLCJsb2NhdGlvbnMiLCJndWVzdHMiLCJtdXN0SGF2ZXMiLCJhY3Rpdml0aWVzIiwicHJpY2UiLCJmYWN0b3J5IiwicmVzb3J0U2VydmljZSIsIiRxIiwibW9kZWwiLCJnZXRSZXNvcnQiLCJmaWx0ZXIiLCJ3aGVuIiwiYXBwbHlGaWx0ZXIiLCJvblJlc29sdmUiLCJvblJlamVjdGVkIiwiaG90ZWwiLCJwcm9wIiwidmFsdWUiLCJjb250cm9sbGVyIiwiQXV0aENvbnRyb2xsZXIiLCIkc2NvcGUiLCJhdXRoU2VydmljZSIsInZhbGlkYXRpb25TdGF0dXMiLCJ1c2VyQWxyZWFkeUV4aXN0cyIsImxvZ2luT3JQYXNzd29yZEluY29ycmVjdCIsImNyZWF0ZVVzZXIiLCJuZXdVc2VyIiwiZ28iLCJsb2dpblVzZXIiLCJzaWduSW4iLCJ1c2VyIiwicHJldmlvdXNTdGF0ZSIsIlVzZXIiLCJiYWNrZW5kQXBpIiwiX2JhY2tlbmRBcGkiLCJfY3JlZGVudGlhbHMiLCJfb25SZXNvbHZlIiwic3RhdHVzIiwidG9rZW4iLCJfdG9rZW5LZWVwZXIiLCJzYXZlVG9rZW4iLCJfb25SZWplY3RlZCIsIl90b2tlbiIsImdldFRva2VuIiwiZGVsZXRlVG9rZW4iLCJwcm90b3R5cGUiLCJjcmVkZW50aWFscyIsInNpZ25PdXQiLCJnZXRMb2dJbmZvIiwiQm9va2luZ0NvbnRyb2xsZXIiLCIkc3RhdGVQYXJhbXMiLCJsb2FkZWQiLCJob3RlbElkIiwiZ2V0SG90ZWxJbWFnZXNDb3VudCIsImNvdW50IiwiQXJyYXkiLCJvcGVuSW1hZ2UiLCIkZXZlbnQiLCJpbWdTcmMiLCJ0YXJnZXQiLCIkYnJvYWRjYXN0Iiwic2hvdyIsIkJvb2tpbmdGb3JtQ29udHJvbGxlciIsImZvcm0iLCJkYXRlIiwiYWRkR3Vlc3QiLCJyZW1vdmVHdWVzdCIsInN1Ym1pdCIsImRpcmVjdGl2ZSIsImRhdGVQaWNrZXJEaXJlY3RpdmUiLCIkaW50ZXJ2YWwiLCJyZXF1aXJlIiwibGluayIsImRhdGVQaWNrZXJEaXJlY3RpdmVMaW5rIiwic2NvcGUiLCJlbGVtZW50IiwiYXR0cnMiLCJjdHJsIiwiJCIsImRhdGVSYW5nZVBpY2tlciIsImxhbmd1YWdlIiwic3RhcnREYXRlIiwiRGF0ZSIsImVuZERhdGUiLCJzZXRGdWxsWWVhciIsImdldEZ1bGxZZWFyIiwib2JqIiwiJHNldFZpZXdWYWx1ZSIsIiRyZW5kZXIiLCIkYXBwbHkiLCJhaHRsTWFwRGlyZWN0aXZlIiwicmVzdHJpY3QiLCJ0ZW1wbGF0ZSIsImFodGxNYXBEaXJlY3RpdmVMaW5rIiwiZWxlbSIsImF0dHIiLCJ3aW5kb3ciLCJnb29nbGUiLCJpbml0TWFwIiwibWFwU2NyaXB0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwibXlMYXRMbmciLCJsYXQiLCJsbmciLCJtYXAiLCJtYXBzIiwiTWFwIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsInNjcm9sbHdoZWVsIiwiaWNvbnMiLCJhaG90ZWwiLCJpY29uIiwibWFya2VyIiwiTWFya2VyIiwidGl0bGUiLCJwb3NpdGlvbiIsIkxhdExuZyIsImJvdW5kcyIsIkxhdExuZ0JvdW5kcyIsIkxhdExhbmciLCJleHRlbmQiLCJmaXRCb3VuZHMiLCJhaHRsR2FsbGVyeURpcmVjdGl2ZSIsInNob3dGaXJzdEltZ0NvdW50Iiwic2hvd05leHRJbWdDb3VudCIsIkFodGxHYWxsZXJ5Q29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsImFodGxHYWxsZXJ5TGluayIsImFsbEltYWdlc1NyYyIsImxvYWRNb3JlIiwiTWF0aCIsIm1pbiIsInNob3dGaXJzdCIsInNsaWNlIiwiaXNBbGxJbWFnZXNMb2FkZWQiLCJhbGxJbWFnZXNMb2FkZWQiLCJpbWFnZXNDb3VudCIsImFsaWduSW1hZ2VzIiwiX3NldEltYWdlQWxpZ21lbnQiLCJvbiIsIl9nZXRJbWFnZVNvdXJjZXMiLCIkcm9vdCIsImNiIiwiZmlndXJlcyIsImdhbGxlcnlXaWR0aCIsInBhcnNlSW50IiwiY2xvc2VzdCIsImNzcyIsImltYWdlV2lkdGgiLCJjb2x1bW5zQ291bnQiLCJyb3VuZCIsImNvbHVtbnNIZWlnaHQiLCJqb2luIiwic3BsaXQiLCJjdXJyZW50Q29sdW1uc0hlaWdodCIsImNvbHVtblBvaW50ZXIiLCJlYWNoIiwiaW5kZXgiLCJtYXgiLCJHdWVzdGNvbW1lbnRzQ29udHJvbGxlciIsImd1ZXN0Y29tbWVudHNTZXJ2aWNlIiwiY29tbWVudHMiLCJvcGVuRm9ybSIsInNob3dQbGVhc2VMb2dpTWVzc2FnZSIsIndyaXRlQ29tbWVudCIsImdldEd1ZXN0Q29tbWVudHMiLCJhZGRDb21tZW50Iiwic2VuZENvbW1lbnQiLCJmb3JtRGF0YSIsImNvbW1lbnQiLCJyZXZlcnNlIiwiaXRlbXMiLCJ0eXBlIiwib25SZWplY3QiLCJIZWFkZXJDb250cm9sbGVyIiwiYWh0bEhlYWRlciIsInNlcnZpY2UiLCJIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UiLCIkbG9nIiwiVUl0cmFuc2l0aW9ucyIsImNvbnRhaW5lciIsIl9jb250YWluZXIiLCJhbmltYXRlVHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwiZmluZCIsInRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGUiLCJhbmltYXRlT3B0aW9ucyIsImFuaW1hdGUiLCJyZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2siLCJlbGVtZW50VHJpZ2dlclF1ZXJ5IiwiZWxlbWVudE9uUXVlcnkiLCJIZWFkZXJUcmFuc2l0aW9ucyIsImhlYWRlclF1ZXJ5IiwiY29udGFpbmVyUXVlcnkiLCJjYWxsIiwiX2hlYWRlciIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiZml4SGVhZGVyRWxlbWVudCIsImVsZW1lbnRGaXhRdWVyeSIsImZpeENsYXNzTmFtZSIsInVuZml4Q2xhc3NOYW1lIiwib3B0aW9ucyIsInNlbGYiLCJmaXhFbGVtZW50Iiwib25XaWR0aENoYW5nZUhhbmRsZXIiLCJ0aW1lciIsImZpeFVuZml4TWVudU9uU2Nyb2xsIiwic2Nyb2xsVG9wIiwib25NaW5TY3JvbGx0b3AiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwid2lkdGgiLCJpbm5lcldpZHRoIiwib25NYXhXaW5kb3dXaWR0aCIsIm9mZiIsInNjcm9sbCIsImFodGxTdGlreUhlYWRlciIsImhlYWRlciIsIkhvbWVDb250cm9sbGVyIiwiYWh0bE1vZGFsRGlyZWN0aXZlIiwicmVwbGFjZSIsImFodGxNb2RhbERpcmVjdGl2ZUxpbmsiLCJpbWciLCJ1bmRlZmluZWQiLCJteUxhdGxuZyIsImNvb3JkIiwiem9vbSIsImNlbnRlciIsImNsb3NlRGlhbG9nIiwibW9kYWxNYXAiLCJhY3Rpdml0aWVzRmlsdGVyIiwiZmlsdGVyc1NlcnZpY2UiLCJhcmciLCJfc3RyaW5nTGVuZ3RoIiwic3RyaW5nTGVuZ3RoIiwiaXNOYU4iLCJyZXN1bHQiLCJsYXN0SW5kZXhPZiIsIlJlc29ydENvbnRyb2xsZXIiLCIkZmlsdGVyIiwiJGN1cnJlbnQiLCJmaWx0ZXJzIiwiaW5pdEZpbHRlcnMiLCJvbkZpbHRlckNoYW5nZSIsImZpbHRlckdyb3VwIiwic3BsaWNlIiwiaW5kZXhPZiIsImFwcGx5RmlsdGVycyIsImdldFNob3dIb3RlbENvdW50IiwicmVkdWNlIiwiY291bnRlciIsIml0ZW0iLCJfaGlkZSIsIiR3YXRjaCIsIm5ld1ZhbHVlIiwib3Blbk1hcCIsImhvdGVsTmFtZSIsImhvdGVsQ29vcmQiLCJob3RlbEZpbHRlciIsImhvdGVsRGV0YWlsc0NvbnN0YW50Iiwic2F2ZWRGaWx0ZXJzIiwibG9hZEZpbHRlcnMiLCJrZXkiLCJmb3JFYWNoIiwiaXNIb3RlbE1hdGNoaW5nRmlsdGVycyIsImZpbHRlcnNJbkdyb3VwIiwibWF0Y2hBdExlYXNlT25lRmlsdGVyIiwiZ2V0SG90ZWxQcm9wIiwibG9jYXRpb24iLCJjb3VudHJ5IiwiZW52aXJvbm1lbnQiLCJkZXRhaWxzIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmUiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsiLCJzZWxlY3RvciIsImhlaWdodCIsInRyaW0iLCJzY3JvbGxUb1RvcENvbmZpZyIsInNjcm9sbFRvVG9wIiwiYWh0bFRvcDNEaXJlY3RpdmUiLCJ0b3AzU2VydmljZSIsIkFodGxUb3AzQ29udHJvbGxlciIsIiRlbGVtZW50IiwiJGF0dHJzIiwibXVzdEhhdmUiLCJyZXNvcnRUeXBlIiwiYWh0bFRvcDN0eXBlIiwicmVzb3J0IiwiZ2V0SW1nU3JjIiwiZmlsZW5hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWwiLCJkZXRhaWwiLCJkZXRhaWxDbGFzc05hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUiLCJnZXRUb3AzUGxhY2VzIiwiYW5pbWF0aW9uIiwiYW5pbWF0aW9uRnVuY3Rpb24iLCJiZWZvcmVBZGRDbGFzcyIsImNsYXNzTmFtZSIsImRvbmUiLCJzbGlkaW5nRGlyZWN0aW9uIiwiYWh0bFNsaWRlciIsInNsaWRlclNlcnZpY2UiLCJhaHRsU2xpZGVyQ29udHJvbGxlciIsInNsaWRlciIsIm5leHRTbGlkZSIsInByZXZTbGlkZSIsInNldFNsaWRlIiwic2V0TmV4dFNsaWRlIiwic2V0UHJldlNsaWRlIiwiZ2V0Q3VycmVudFNsaWRlIiwic2V0Q3VycmVudFNsaWRlIiwiZml4SUU4cG5nQmxhY2tCZyIsImFycm93cyIsImNsaWNrIiwiZGlzYWJsZWQiLCJzbGlkZXJJbWdQYXRoQ29uc3RhbnQiLCJTbGlkZXIiLCJzbGlkZXJJbWFnZUxpc3QiLCJfaW1hZ2VTcmNMaXN0IiwiX2N1cnJlbnRTbGlkZSIsImdldEltYWdlU3JjTGlzdCIsImdldEluZGV4Iiwic2xpZGUiLCJQYWdlcyIsImhvdGVsc1BlclBhZ2UiLCJjdXJyZW50UGFnZSIsInBhZ2VzVG90YWwiLCJzaG93RnJvbSIsInNob3dOZXh0Iiwic2hvd1ByZXYiLCJzZXRQYWdlIiwicGFnZSIsImlzTGFzdFBhZ2UiLCJpc0ZpcnN0UGFnZSIsInNob3dIb3RlbENvdW50IiwiY2VpbCIsInN0YXJ0UG9zaXRpb24iLCJwcmljZVNsaWRlckRpcmVjdGl2ZSIsImxlZnRTbGlkZXIiLCJyaWdodFNsaWRlciIsInByaWNlU2xpZGVyRGlyZWN0aXZlTGluayIsInJpZ2h0QnRuIiwibGVmdEJ0biIsInNsaWRlQXJlYVdpZHRoIiwidmFsdWVQZXJTdGVwIiwidmFsIiwiaW5pdERyYWciLCJkcmFnRWxlbSIsImluaXRQb3NpdGlvbiIsIm1heFBvc2l0aW9uIiwibWluUG9zaXRpb24iLCJzaGlmdCIsImJ0bk9uTW91c2VEb3duIiwicGFnZVgiLCJkb2NPbk1vdXNlTW92ZSIsImJ0bk9uTW91c2VVcCIsInBvc2l0aW9uTGVzc1RoYW5NYXgiLCJwb3NpdGlvbkdyYXRlclRoYW5NaW4iLCJzZXRQcmljZXMiLCJlbWl0IiwibmV3TWluIiwibmV3TWF4Iiwic2V0U2xpZGVycyIsImJ0biIsIm5ld1Bvc3Rpb24iLCJoYXNDbGFzcyIsInRyaWdnZXIiLCJhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmsiLCJzbGlkZUVtaXRFbGVtZW50cyIsInNsaWRlRW1pdE9uQ2xpY2siLCJzbGlkZU9uRWxlbWVudCIsInNsaWRlVXAiLCJvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUiLCJzbGlkZURvd24iLCJzbGlkZVRvZ2dsZUVsZW1lbnRzIiwidG9nZ2xlQ2xhc3MiXSwibWFwcGluZ3MiOiJBQUFBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBQSxRQUNLQyxPQUFPLGFBQWEsQ0FBQyxhQUFhLFdBQVc7S0FKdEQ7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUQsUUFDS0MsT0FBTyxhQUNQQyxvQkFBTyxVQUFVQyxVQUFVO1FBQ3hCQSxTQUFTQyxVQUFVLGlDQUFRLFVBQVVDLFdBQVdDLFNBQVM7WUFDckQsSUFBSUMsYUFBYTtnQkFDVEMsTUFBTTtnQkFDTkMsS0FBSzs7O1lBR2JKLFVBQVVLLE1BQU0sVUFBVUMsU0FBUzs7WUFHbkMsSUFBSUMsV0FBV1AsVUFBVUc7WUFDekJILFVBQVVHLE9BQU8sVUFBVUcsU0FBUztnQkFDaENKLFdBQVdDLEtBQUtLLEtBQUtGO2dCQUNyQkMsU0FBU0UsTUFBTSxNQUFNLENBQUNIOzs7WUFHMUIsSUFBSUksVUFBVVYsVUFBVVc7WUFDeEJYLFVBQVVXLFFBQVEsVUFBVUwsU0FBUztnQkFDakNKLFdBQVdFLElB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QW9CdVQ7O0lBRW5DQSwwQkFBMEJ4YixVQUFVLENBQUM7O0lBRXJDLFNBQVN3YiwwQkFBMEJ0TSxNQUFNO1FBQ3JDLE9BQU87WUFDSDFGLFVBQVU7WUFDVm5CLE1BQU1vVDs7O1FBR1YsU0FBU0EsOEJBQThCeFcsUUFBUTBFLE1BQU07WUFDakQsSUFBSStSLG9CQUFvQi9TLEVBQUVnQixNQUFNbUcsS0FBSzs7WUFFckMsSUFBSSxDQUFDNEwsa0JBQWtCbGMsUUFBUTtnQkFDM0IwUCxLQUFLeFEsS0FBTDs7Z0JBRUE7OztZQUdKZ2Qsa0JBQWtCL08sR0FBRyxTQUFTZ1A7O1lBRTlCLFNBQVNBLG1CQUFtQjtnQkFDeEIsSUFBSUMsaUJBQWlCalQsRUFBRWdCLE1BQU1tRyxLQUFLOztnQkFFbEMsSUFBSSxDQUFDNEwsa0JBQWtCbGMsUUFBUTtvQkFDM0IwUCxLQUFLeFEsS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJa2QsZUFBZWhTLEtBQUssZ0JBQWdCLE1BQU1nUyxlQUFlaFMsS0FBSyxnQkFBZ0IsVUFBVTtvQkFDeEZzRixLQUFLeFEsS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJa2QsZUFBZWhTLEtBQUssZ0JBQWdCLElBQUk7b0JBQ3hDZ1MsZUFBZUMsUUFBUSxRQUFRQztvQkFDL0JGLGVBQWVoUyxLQUFLLFlBQVk7dUJBQzdCO29CQUNIa1M7b0JBQ0FGLGVBQWVHLFVBQVU7b0JBQ3pCSCxlQUFlaFMsS0FBSyxZQUFZOzs7Z0JBR3BDLFNBQVNrUywyQkFBMkI7b0JBQ2hDLElBQUlFLHNCQUFzQnJULEVBQUVnQixNQUFNbUcsS0FBSzs7b0JBRXZDbkgsRUFBRWlGLEtBQUtvTyxxQkFBcUIsWUFBVzt3QkFDbkNyVCxFQUFFLE1BQU1zVCxZQUFZdFQsRUFBRSxNQUFNaUIsS0FBSzs7Ozs7O0tBdER6RCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcsIFsndWkucm91dGVyJywgJ3ByZWxvYWQnLCAnbmdBbmltYXRlJ10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uZmlnKGZ1bmN0aW9uICgkcHJvdmlkZSkge1xyXG4gICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJyRsb2cnLCBmdW5jdGlvbiAoJGRlbGVnYXRlLCAkd2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9nSGlzdG9yeSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2FybjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycjogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5sb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ1dhcm4gPSAkZGVsZWdhdGUud2FybjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS53YXJuID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nV2Fybi5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ0VyciA9ICRkZWxlZ2F0ZS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5lcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7bmFtZTogbWVzc2FnZSwgc3RhY2s6IG5ldyBFcnJvcigpLnN0YWNrfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ0Vyci5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gc2VuZE9uVW5sb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbG9nSGlzdG9yeS5lcnIubGVuZ3RoICYmICFsb2dIaXN0b3J5Lndhcm4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbigncG9zdCcsICcvYXBpL2xvZycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGxvZ0hpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGRlbGVnYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxufSkoKTtcclxuXHJcbi8qXHJcbiAgICAgICAgLmZhY3RvcnkoJ2xvZycsIGxvZyk7XHJcblxyXG4gICAgbG9nLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxvZygkd2luZG93LCAkbG9nKSB7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2goYXJncyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYnJvd3NlckxvZykge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBlcnJvcihlKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgc3RhY2s6IGUuc3RhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRsb2cuZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RvZG8gYWxsIGVycm9yc1xyXG5cclxuXHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHdhcm46IHdhcm4sXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICAgICAgc2VuZE9uVW5sb2FkOiBzZW5kT25VbmxvYWRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoY29uZmlnKTtcclxuXHJcbiAgICBjb25maWcuJGluamVjdCA9IFsncHJlbG9hZFNlcnZpY2VQcm92aWRlcicsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbmZpZyhwcmVsb2FkU2VydmljZVByb3ZpZGVyLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgICAgICBwcmVsb2FkU2VydmljZVByb3ZpZGVyLmNvbmZpZyhiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCAnR0VUJywgJ2dldCcsIDEwMCwgJ3dhcm5pbmcnKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5jb25maWcoY29uZmlnKTtcclxuXHJcblx0Y29uZmlnLiRpbmplY3QgPSBbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlciddO1xyXG5cclxuXHRmdW5jdGlvbiBjb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG5cdFx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG5cclxuXHRcdCRzdGF0ZVByb3ZpZGVyXHJcblx0XHRcdC5zdGF0ZSgnaG9tZScsIHtcclxuXHRcdFx0XHR1cmw6ICcvJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ob21lL2hvbWUuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdhdXRoJywge1xyXG5cdFx0XHRcdHVybDogJy9hdXRoJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9hdXRoL2F1dGguaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3R5cGUnOiAnbG9naW4gb3Igam9pbid9LyosXHJcblx0XHRcdFx0b25FbnRlcjogZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcclxuXHRcdFx0XHRcdCRyb290U2NvcGUuJHN0YXRlID0gXCJhdXRoXCI7XHJcblx0XHRcdFx0fSovXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYnVuZ2Fsb3dzJywge1xyXG5cdFx0XHRcdHVybDogJy9idW5nYWxvd3MnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9idW5nYWxvd3MuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdob3RlbHMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvdG9wJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9ob3RlbHMuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3ZpbGxhcycsIHtcclxuXHRcdFx0XHR1cmw6ICcvdmlsbGFzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdmlsbGFzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ2FsbGVyeScsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ2FsbGVyeScsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5Lmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ3Vlc3Rjb21tZW50cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ3Vlc3Rjb21tZW50cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZGVzdGluYXRpb25zJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL2Rlc3RpbmF0aW9ucycsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9kZXN0aW5hdGlvbnMvZGVzdGluYXRpb25zLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgncmVzb3J0Jywge1xyXG5cdFx0XHRcdHVybDogJy9yZXNvcnQnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaHRtbCcsXHJcblx0XHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdFx0Y3VycmVudEZpbHRlcnM6IHt9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Jvb2tpbmcnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2Jvb2tpbmc/aG90ZWxJZCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvYm9va2luZy9ib29raW5nLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydob3RlbElkJzogJ2hvdGVsIElkJ31cclxuXHRcdFx0fSk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAucnVuKHJ1bik7XHJcblxyXG4gICAgcnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnICwgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJywgJyR3aW5kb3cnLCAnJHRpbWVvdXQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlLCAkd2luZG93LCAkdGltZW91dCkge1xyXG4gICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUvKiwgZnJvbVBhcmFtcyB0b2RvKi8pe1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVOYW1lID0gdG9TdGF0ZS5uYW1lO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZS8qLCBmcm9tUGFyYW1zIHRvZG8qLykge1xyXG4gICAgICAgICAgICAvLyR0aW1lb3V0KCgpID0+ICQoJ2JvZHknKS5zY3JvbGxUb3AoMCksIDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvL3RvZG8gb25sb2FkIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vSDvv70g77+977+977+977+977+977+9XHJcbiAgICAgICAgICAgIHByZWxvYWRTZXJ2aWNlLnByZWxvYWRJbWFnZXMoJ2dhbGxlcnknLCB7dXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LCBtZXRob2Q6ICdHRVQnLCBhY3Rpb246ICdnZXQnfSk7IC8vdG9kbyBkZWwgbWV0aG9kLCBhY3Rpb24gYnkgZGVmYXVsdFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vbG9nLnNlbmRPblVubG9hZCgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncHJlbG9hZCcsIFtdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ3ByZWxvYWQnKVxyXG4gICAgICAgIC5wcm92aWRlcigncHJlbG9hZFNlcnZpY2UnLCBwcmVsb2FkU2VydmljZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcHJlbG9hZFNlcnZpY2UoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gZnVuY3Rpb24odXJsID0gJy9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZyA9ICdkZWJ1ZycpIHtcclxuICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcclxuICAgICAgICAgICAgICAgIGxvZzogbG9nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCRodHRwLCAkdGltZW91dCkge1xyXG4gICAgICAgICAgICBsZXQgcHJlbG9hZENhY2hlID0gW10sXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIgPSBmdW5jdGlvbihtZXNzYWdlLCBsb2cgPSAnZGVidWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5sb2cgPT09ICdzaWxlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcubG9nID09PSAnZGVidWcnICYmIGxvZyA9PT0gJ2RlYnVnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvZyA9PT0gJ3dhcm5pbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlbG9hZEltYWdlcyhwcmVsb2FkTmFtZSwgaW1hZ2VzKSB7IC8vdG9kbyBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZXNTcmNMaXN0ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZXMgPT09ICdhcnJheScpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gaW1hZ2VzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWxvYWROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlc1NyY0xpc3RcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGltYWdlcyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlczogaW1hZ2VzLm1ldGhvZCB8fCBjb25maWcubWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGltYWdlcy51cmwgfHwgY29uZmlnLnVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXM6IGltYWdlcy5hY3Rpb24gfHwgY29uZmlnLmFjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZXNTcmNMaXN0ID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVsb2FkQ2FjaGUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlbG9hZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZXNTcmNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnRpbWVvdXQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZChpbWFnZXNTcmNMaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cub25sb2FkID0gcHJlbG9hZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChwcmVsb2FkLmJpbmQobnVsbCwgaW1hZ2VzU3JjTGlzdCksIGNvbmZpZy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByZWxvYWQoaW1hZ2VzU3JjTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzU3JjTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2VzU3JjTGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzb2x2ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIodGhpcy5zcmMsICdkZWJ1ZycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRQcmVsb2FkKHByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIoJ3ByZWxvYWRTZXJ2aWNlOiBnZXQgcmVxdWVzdCAnICsgJ1wiJyArIHByZWxvYWROYW1lICsgJ1wiJywgJ2RlYnVnJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZWxvYWROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWxvYWRDYWNoZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkQ2FjaGVbaV0ubmFtZSA9PT0gcHJlbG9hZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWxvYWRDYWNoZVtpXS5zcmNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyKCdObyBwcmVsb2FkcyBmb3VuZCcsICd3YXJuaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwcmVsb2FkSW1hZ2VzOiBwcmVsb2FkSW1hZ2VzLFxyXG4gICAgICAgICAgICAgICAgZ2V0UHJlbG9hZENhY2hlOiBnZXRQcmVsb2FkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2JhY2tlbmRQYXRoc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0b3AzOiAnL2FwaS90b3AzJyxcclxuICAgICAgICAgICAgYXV0aDogJy9hcGkvdXNlcnMnLFxyXG4gICAgICAgICAgICBnYWxsZXJ5OiAnL2FwaS9nYWxsZXJ5JyxcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50czogJy9hcGkvZ3Vlc3Rjb21tZW50cycsXHJcbiAgICAgICAgICAgIGhvdGVsczogJy9hcGkvaG90ZWxzJ1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2hvdGVsRGV0YWlsc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0eXBlczogW1xyXG4gICAgICAgICAgICAgICAgJ0hvdGVsJyxcclxuICAgICAgICAgICAgICAgICdCdW5nYWxvdycsXHJcbiAgICAgICAgICAgICAgICAnVmlsbGEnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nczogW1xyXG4gICAgICAgICAgICAgICAgJ0NvYXN0JyxcclxuICAgICAgICAgICAgICAgICdDaXR5JyxcclxuICAgICAgICAgICAgICAgICdEZXNlcnQnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICdOYW1pYmlhJyxcclxuICAgICAgICAgICAgICAgICdMaWJ5YScsXHJcbiAgICAgICAgICAgICAgICAnU291dGggQWZyaWNhJyxcclxuICAgICAgICAgICAgICAgICdUYW56YW5pYScsXHJcbiAgICAgICAgICAgICAgICAnUGFwdWEgTmV3IEd1aW5lYScsXHJcbiAgICAgICAgICAgICAgICAnUmV1bmlvbicsXHJcbiAgICAgICAgICAgICAgICAnU3dhemlsYW5kJyxcclxuICAgICAgICAgICAgICAgICdTYW8gVG9tZScsXHJcbiAgICAgICAgICAgICAgICAnTWFkYWdhc2NhcicsXHJcbiAgICAgICAgICAgICAgICAnTWF1cml0aXVzJyxcclxuICAgICAgICAgICAgICAgICdTZXljaGVsbGVzJyxcclxuICAgICAgICAgICAgICAgICdNYXlvdHRlJyxcclxuICAgICAgICAgICAgICAgICdVa3JhaW5lJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgZ3Vlc3RzOiBbXHJcbiAgICAgICAgICAgICAgICAnMScsXHJcbiAgICAgICAgICAgICAgICAnMicsXHJcbiAgICAgICAgICAgICAgICAnMycsXHJcbiAgICAgICAgICAgICAgICAnNCcsXHJcbiAgICAgICAgICAgICAgICAnNSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIG11c3RIYXZlczogW1xyXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxyXG4gICAgICAgICAgICAgICAgJ2tpZHMnLFxyXG4gICAgICAgICAgICAgICAgJ3Bvb2wnLFxyXG4gICAgICAgICAgICAgICAgJ3NwYScsXHJcbiAgICAgICAgICAgICAgICAnd2lmaScsXHJcbiAgICAgICAgICAgICAgICAncGV0JyxcclxuICAgICAgICAgICAgICAgICdkaXNhYmxlJyxcclxuICAgICAgICAgICAgICAgICdiZWFjaCcsXHJcbiAgICAgICAgICAgICAgICAncGFya2luZycsXHJcbiAgICAgICAgICAgICAgICAnY29uZGl0aW9uaW5nJyxcclxuICAgICAgICAgICAgICAgICdsb3VuZ2UnLFxyXG4gICAgICAgICAgICAgICAgJ3RlcnJhY2UnLFxyXG4gICAgICAgICAgICAgICAgJ2dhcmRlbicsXHJcbiAgICAgICAgICAgICAgICAnZ3ltJyxcclxuICAgICAgICAgICAgICAgICdiaWN5Y2xlcydcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGFjdGl2aXRpZXM6IFtcclxuICAgICAgICAgICAgICAgICdDb29raW5nIGNsYXNzZXMnLFxyXG4gICAgICAgICAgICAgICAgJ0N5Y2xpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0Zpc2hpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0dvbGYnLFxyXG4gICAgICAgICAgICAgICAgJ0hpa2luZycsXHJcbiAgICAgICAgICAgICAgICAnSG9yc2UtcmlkaW5nJyxcclxuICAgICAgICAgICAgICAgICdLYXlha2luZycsXHJcbiAgICAgICAgICAgICAgICAnTmlnaHRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdTYWlsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTY3ViYSBkaXZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3BwaW5nIC8gbWFya2V0cycsXHJcbiAgICAgICAgICAgICAgICAnU25vcmtlbGxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NraWluZycsXHJcbiAgICAgICAgICAgICAgICAnU3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2lsZGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmRzdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaW5lIHRhc3RpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1lvZ2EnIFxyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgcHJpY2U6IFtcclxuICAgICAgICAgICAgICAgIFwibWluXCIsXHJcbiAgICAgICAgICAgICAgICBcIm1heFwiXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ3Jlc29ydFNlcnZpY2UnLCByZXNvcnRTZXJ2aWNlKTtcclxuXHJcbiAgICByZXNvcnRTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJyRxJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzb3J0U2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsICRxKSB7XHJcbiAgICAgICAgbGV0IG1vZGVsID0gbnVsbDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmVzb3J0KGZpbHRlcikge1xyXG4gICAgICAgICAgICAvL3RvZG8gZXJyb3JzOiBubyBob3RlbHMsIG5vIGZpbHRlci4uLlxyXG4gICAgICAgICAgICBpZiAobW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKGFwcGx5RmlsdGVyKG1vZGVsKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcHBseUZpbHRlcihtb2RlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcHBseUZpbHRlcihtb2RlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYXBwbHlGaWx0ZXIoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbC5maWx0ZXIoKGhvdGVsKSA9PiBob3RlbFtmaWx0ZXIucHJvcF0gPT0gZmlsdGVyLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0UmVzb3J0OiBnZXRSZXNvcnRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBBdXRoQ29udHJvbGxlcik7XHJcblxyXG4gICAgQXV0aENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckc2NvcGUnLCAnYXV0aFNlcnZpY2UnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0aENvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHNjb3BlLCBhdXRoU2VydmljZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzID0ge1xyXG4gICAgICAgICAgICB1c2VyQWxyZWFkeUV4aXN0czogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvZ2luT3JQYXNzd29yZEluY29ycmVjdDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2UuY3JlYXRlVXNlcih0aGlzLm5ld1VzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2F1dGgnLCB7J3R5cGUnOiAnbG9naW4nfSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMudXNlckFscmVhZHlFeGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmZvcm1Kb2luKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdVc2VyKTsqL1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9naW5Vc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25Jbih0aGlzLnVzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJldmlvdXNTdGF0ZSA9ICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeVskcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkubGVuZ3RoIC0gMl0gfHwgJ2hvbWUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwcmV2aW91c1N0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKHByZXZpb3VzU3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLmxvZ2luT3JQYXNzd29yZEluY29ycmVjdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdhdXRoU2VydmljZScsIGF1dGhTZXJ2aWNlKTtcclxuXHJcbiAgICBhdXRoU2VydmljZS4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYXV0aFNlcnZpY2UoJHJvb3RTY29wZSwgJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgLy90b2RvIGVycm9yc1xyXG4gICAgICAgIGZ1bmN0aW9uIFVzZXIoYmFja2VuZEFwaSkge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZW5kQXBpID0gYmFja2VuZEFwaTtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZXNvbHZlID0gKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEudG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuc2F2ZVRva2VuKHJlc3BvbnNlLmRhdGEudG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ09LJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZWplY3RlZCA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9rZW4gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNhdmVUb2tlbihfdG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gX3Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcodG9rZW4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0VG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRlbGV0ZVRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVUb2tlbjogc2F2ZVRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGdldFRva2VuOiBnZXRUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVUb2tlbjogZGVsZXRlVG9rZW5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbkluID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBjcmVkZW50aWFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLl9jcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5zaWduT3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlci5kZWxldGVUb2tlbigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmdldExvZ0luZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB0aGlzLl9jcmVkZW50aWFscyxcclxuICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLl90b2tlbktlZXBlci5nZXRUb2tlbigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFVzZXIoYmFja2VuZFBhdGhzQ29uc3RhbnQuYXV0aCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCb29raW5nQ29udHJvbGxlcicsIEJvb2tpbmdDb250cm9sbGVyKTtcclxuXHJcbiAgICBCb29raW5nQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGVQYXJhbXMnLCAncmVzb3J0U2VydmljZScsICckc3RhdGUnLCAnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdDb250cm9sbGVyKCRzdGF0ZVBhcmFtcywgcmVzb3J0U2VydmljZSwgJHN0YXRlLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgdGhpcy5ob3RlbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe1xyXG4gICAgICAgICAgICAgICAgcHJvcDogJ19pZCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJHN0YXRlUGFyYW1zLmhvdGVsSWR9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG90ZWwgPSByZXNwb25zZVswXTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5ob3RlbCA9ICRzdGF0ZVBhcmFtcy5ob3RlbDtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRIb3RlbEltYWdlc0NvdW50ID0gZnVuY3Rpb24oY291bnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBcnJheShjb3VudCAtIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5vcGVuSW1hZ2UgPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICAgICAgbGV0IGltZ1NyYyA9ICRldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgaWYgKGltZ1NyYykge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCb29raW5nRm9ybUNvbnRyb2xsZXInLCBCb29raW5nRm9ybUNvbnRyb2xsZXIpXHJcblxyXG4gICAgZnVuY3Rpb24gQm9va2luZ0Zvcm1Db250cm9sbGVyKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAgICAgdGhpcy5mb3JtID0ge1xyXG4gICAgICAgICAgICBkYXRlOiAncGljayBkYXRlJyxcclxuICAgICAgICAgICAgZ3Vlc3RzOiAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gNSA/IHRoaXMuZm9ybS5ndWVzdHMrKyA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZUd1ZXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcm0uZ3Vlc3RzICE9PSAxID8gdGhpcy5mb3JtLmd1ZXN0cy0tIDogdGhpcy5mb3JtLmd1ZXN0c1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnZGF0ZVBpY2tlcicsIGRhdGVQaWNrZXJEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJEaXJlY3RpdmUoJGludGVydmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxyXG4gICAgICAgICAgICAvKnNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsOiAnPSdcclxuICAgICAgICAgICAgfSwqL1xyXG4gICAgICAgICAgICBsaW5rOiBkYXRlUGlja2VyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJEaXJlY3RpdmVMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICAvL3RvZG8gYWxsXHJcbiAgICAgICAgICAgICQoJ1tkYXRlLXBpY2tlcl0nKS5kYXRlUmFuZ2VQaWNrZXIoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGU6IG5ldyBEYXRlKCkuc2V0RnVsbFllYXIobmV3IERhdGUoKS5nZXRGdWxsWWVhcigpICsgMSksXHJcbiAgICAgICAgICAgICAgICB9KS5iaW5kKCdkYXRlcGlja2VyLWZpcnN0LWRhdGUtc2VsZWN0ZWQnLCBmdW5jdGlvbihldmVudCwgb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBmaXJzdCBkYXRlIGlzIHNlbGVjdGVkICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZpcnN0LWRhdGUtc2VsZWN0ZWQnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2hhbmdlJyxmdW5jdGlvbihldmVudCxvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHNlY29uZCBkYXRlIGlzIHNlbGVjdGVkICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoYW5nZScsb2JqKTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLiRzZXRWaWV3VmFsdWUob2JqLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBvYmogd2lsbCBiZSBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTE6IChEYXRlIG9iamVjdCBvZiB0aGUgZWFybGllciBkYXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTI6IChEYXRlIG9iamVjdCBvZiB0aGUgbGF0ZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy9cdCBcdHZhbHVlOiBcIjIwMTMtMDYtMDUgdG8gMjAxMy0wNi0wN1wiXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWFwcGx5JyxmdW5jdGlvbihldmVudCxvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHVzZXIgY2xpY2tzIG9uIHRoZSBhcHBseSBidXR0b24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXBwbHknLG9iaik7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2xvc2UnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGJlZm9yZSBkYXRlIHJhbmdlIHBpY2tlciBjbG9zZSBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYmVmb3JlIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2xvc2VkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBjbG9zZSBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1vcGVuJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgb3BlbiBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYmVmb3JlIG9wZW4nKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1vcGVuZWQnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGFmdGVyIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIG9wZW4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTWFwJywgYWh0bE1hcERpcmVjdGl2ZSk7XG5cbiAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImRlc3RpbmF0aW9uc19fbWFwXCI+PC9kaXY+JyxcbiAgICAgICAgICAgIGxpbms6IGFodGxNYXBEaXJlY3RpdmVMaW5rXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XG4gICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xuICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG1hcFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XG4gICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwU2NyaXB0KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gW1xuICAgICAgICAgICAgICAgICAgICBbXCJPdGpvem9uZGp1cGEgUmVnaW9uLCBLYWxhaGFyaSBEZXNlcnQsIE5hbWliaWFcIiwgLTIwLjMzMDg2OSwgMTcuMzQ2NTYzXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiU2lydGUgRGlzdHJpY3QsIFNhaGFyYSBEZXNlcnQsIExpYnlhXCIsIDMxLjE5NTAwNSwgMTYuNTAwNDgzXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiTGltcG9wbywgU291dGggQWZyaWNhXCIsIC0yMy43ODk5MDAsIDMwLjE3NTYzN10sXG4gICAgICAgICAgICAgICAgICAgIFtcIkJ1YnVidSwgWmFuemliYXIgVG93biBUYW56YW5pYVwiLCAtNi4xMDEyNDcsIDM5LjIxNTc1OF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIk1hZGFuZyBQcm92aW5jZSwgUGFwdWEgTmV3IEd1aW5lYVwiLCAtNS41MTAzNzksIDE0NS45ODA0OTddLFxuICAgICAgICAgICAgICAgICAgICBbXCJTYWludCBBbmRyZSwgUmV1bmlvblwiLCAtMjAuOTE5NDEwLCA1NS42NDI0ODNdLFxuICAgICAgICAgICAgICAgICAgICBbXCJMdWJvbWJvIFJlZ2lvbiwgU3dhemlsYW5kXCIsIC0yNi43ODQ5MzAsIDMxLjczNDgyMF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIkNhbnRhZ2FsbyBTP28gVG9tPyBhbmQgUHI/bmNpcGVcIiwgMC4yMzc2MzcsIDYuNzM4ODM1XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQW1wYW5paHkgTWFkYWdhc2NhclwiLCAtMjUuMDIzMjk2LCA0NC4wNjM4NjldLFxuICAgICAgICAgICAgICAgICAgICBbXCJQbGFpbmUgQ29yYWlsLUxhIEZvdWNoZSBDb3JhaWwgTWF1cml0aXVzXCIsIC0xOS43NDA4MTcsIDYzLjM2MzI5NF0sXG4gICAgICAgICAgICAgICAgICAgIFtcIlNvdXRoIEFnYWxlZ2EgSXNsYW5kcyBNYXVyaXRpdXNcIiwgLTEwLjQ1NTQxMiwgNTYuNjg1MzAxXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiTm9ydGggQWdhbGVnYSBJc2xhbmRzIE1hdXJpdGl1c1wiLCAtMTAuNDMzOTk1LCA1Ni42NDcyNjhdLFxuICAgICAgICAgICAgICAgICAgICBbXCJDb2V0aXZ5IFNleWNoZWxsZXNcIiwgLTcuMTQwMzM4LCA1Ni4yNzAzODRdLFxuICAgICAgICAgICAgICAgICAgICBbXCJEZW1iZW5pIE1heW90dGVcIiwgLTEyLjgzOTkyOCwgNDUuMTkwODU1XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQmFieW50c2kgS3lpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjYzODgwMCwgMzAuMDIyNTM5XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiUGVjaHlraHZvc3R5LCBWb2x5bnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjUwMjQ5NSwgMjQuNjE0NzMyXSxcbiAgICAgICAgICAgICAgICAgICAgW1wiQmlsaG9yb2QtRG5pc3Ryb3ZzJ2t5aSBkaXN0cmljdCwgT2Rlc3NhIE9ibGFzdCwgVWtyYWluZVwiLCA0Ni4wNjExMTYsIDMwLjQxMjQwMV0sXG4gICAgICAgICAgICAgICAgICAgIFtcIlBldHJ1c2hreSwgS3lpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUwLjQyMDk5OCwgMzAuMTYxNTQ4XSxcbiAgICAgICAgICAgICAgICAgICAgW1wiVmVseWthIERvY2gsIENoZXJuaWhpdnMna2Egb2JsYXN0LCBVa3JhaW5lXCIsIDUxLjMwNzUxOCwgMzIuNTc0MjMyXVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICB2YXIgbXlMYXRMbmcgPSB7bGF0OiAtMjUuMzYzLCBsbmc6IDEzMS4wNDR9O1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXG4gICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZGVzdGluYXRpb25zX19tYXAnKVswXSwge1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBpY29ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnYXNzZXRzL2ltYWdlcy9pY29uX21hcC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbG9jYXRpb25zW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qY2VudGVyaW5nKi9cbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcyAoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICAgICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnJHRpbWVvdXQnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAncHJlbG9hZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsICR0aW1lb3V0LCBiYWNrZW5kUGF0aHNDb25zdGFudCwgcHJlbG9hZFNlcnZpY2UpIHsgLy90b2RvIG5vdCBvbmx5IGxvYWQgYnV0IGxpc3RTcmMgdG9vIGFjY2VwdFxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd0ZpcnN0JyxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93TmV4dCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LnRlbXBsYXRlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIGxldCBhbGxJbWFnZXNTcmMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gJHNjb3BlLnNob3dGaXJzdEltZ0NvdW50LFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudCA9ICRzY29wZS5zaG93TmV4dEltZ0NvdW50O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSBNYXRoLm1pbihzaG93Rmlyc3RJbWdDb3VudCArIHNob3dOZXh0SW1nQ291bnQsIGFsbEltYWdlc1NyYy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0FsbEltYWdlc0xvYWRlZCA9IHRoaXMuc2hvd0ZpcnN0ID49IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgLyokdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7Ki9cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsSW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvd0ZpcnN0KSA/IHRoaXMuc2hvd0ZpcnN0Lmxlbmd0aCA9PT0gdGhpcy5pbWFnZXNDb3VudDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuZ2FsbGVyeSBpbWcnKS5sZW5ndGggPCBzaG93Rmlyc3RJbWdDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvb3BzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQodGhpcy5hbGlnbkltYWdlcywgMClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcygpO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNDb3VudCA9IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5TGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbS5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdTcmMgPSBldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1nU3JjXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAvKiB2YXIgJGltYWdlcyA9ICQoJy5nYWxsZXJ5IGltZycpO1xyXG4gICAgICAgICAgICB2YXIgbG9hZGVkX2ltYWdlc19jb3VudCA9IDA7Ki9cclxuICAgICAgICAgICAgLyokc2NvcGUuYWxpZ25JbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRpbWFnZXMubG9hZChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRfaW1hZ2VzX2NvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkZWRfaW1hZ2VzX2NvdW50ID09ICRpbWFnZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRJbWFnZUFsaWdtZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50LCAwKTsgLy8gdG9kb1xyXG4gICAgICAgICAgICB9OyovXHJcblxyXG4gICAgICAgICAgICAvLyRzY29wZS5hbGlnbkltYWdlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcyhjYikge1xyXG4gICAgICAgICAgICBjYihwcmVsb2FkU2VydmljZS5nZXRQcmVsb2FkQ2FjaGUoJ2dhbGxlcnknKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfc2V0SW1hZ2VBbGlnbWVudCgpIHsgLy90b2RvIGFyZ3VtZW50cyBuYW1pbmcsIGVycm9yc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlndXJlcyA9ICQoJy5nYWxsZXJ5X19maWd1cmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBnYWxsZXJ5V2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNsb3Nlc3QoJy5nYWxsZXJ5JykuY3NzKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jc3MoJ3dpZHRoJykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjb2x1bW5zQ291bnQgPSBNYXRoLnJvdW5kKGdhbGxlcnlXaWR0aCAvIGltYWdlV2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnNIZWlnaHQgPSBuZXcgQXJyYXkoY29sdW1uc0NvdW50ICsgMSkuam9pbignMCcpLnNwbGl0KCcnKS5tYXAoKCkgPT4ge3JldHVybiAwfSksIC8vdG9kbyBkZWwgam9pbi1zcGxpdFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0ID0gY29sdW1uc0hlaWdodC5zbGljZSgwKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAkKGZpZ3VyZXMpLmNzcygnbWFyZ2luLXRvcCcsICcwJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGZpZ3VyZXMsIGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiBjb2x1bW5zQ291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKCdtYXJnaW4tdG9wJywgLShNYXRoLm1heC5hcHBseShudWxsLCBjb2x1bW5zSGVpZ2h0KSAtIGNvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0pICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2N1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKSArIGNvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2x1bW5Qb2ludGVyID09PSBjb2x1bW5zQ291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnNIZWlnaHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnNIZWlnaHRbaV0gKz0gY3VycmVudENvbHVtbnNIZWlnaHRbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4vKiAgICAgICAgLmNvbnRyb2xsZXIoJ0dhbGxlcnlDb250cm9sbGVyJywgR2FsbGVyeUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEdhbGxlcnlDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgIHZhciBpbWFnZXNTcmMgPSBfZ2V0SW1hZ2VTb3VyY2VzKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coaW1hZ2VzU3JjKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LFxyXG4gICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnRVJST1InOyAvL3RvZG9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuXHJcbi8qXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdDogXCI9YWh0bEdhbGxlcnlTaG93Rmlyc3RcIixcclxuICAgICAgICAgICAgICAgIHNob3dBZnRlcjogXCI9YWh0bEdhbGxlcnlTaG93QWZ0ZXJcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKCl7fVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmEgPSAxMztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmEpO1xyXG4gICAgICAgICAgICAvISp2YXIgYWxsSW1hZ2VzU3JjO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLnNob3dGaXJzdEltYWdlc1NyYyA9IFsnMTIzJ107XHJcblxyXG4gICAgICAgICAgICBfZ2V0SW1hZ2VTb3VyY2VzKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgYWxsSW1hZ2VzU3JjID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH0pKiEvXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdHdWVzdGNvbW1lbnRzQ29udHJvbGxlcicsIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKTtcclxuXHJcbiAgICBHdWVzdGNvbW1lbnRzQ29udHJvbGxlci4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJ2d1ZXN0Y29tbWVudHNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIoJHJvb3RTY29wZSwgZ3Vlc3Rjb21tZW50c1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmNvbW1lbnRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLndyaXRlQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoJHJvb3RTY29wZS4kbG9nZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gdHJ1ZVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuZ2V0R3Vlc3RDb21tZW50cygpLnRoZW4oXHJcbiAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cyA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmFkZENvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2Uuc2VuZENvbW1lbnQodGhpcy5mb3JtRGF0YSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMucHVzaCh7J25hbWUnOiB0aGlzLmZvcm1EYXRhLm5hbWUsICdjb21tZW50JzogdGhpcy5mb3JtRGF0YS5jb21tZW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybURhdGEgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdyZXZlcnNlJywgcmV2ZXJzZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcmV2ZXJzZSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaXRlbXMpIHtcclxuICAgICAgICAgICAgLy90byBlcnJvcnNcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zLnNsaWNlKCkucmV2ZXJzZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ2d1ZXN0Y29tbWVudHNTZXJ2aWNlJywgZ3Vlc3Rjb21tZW50c1NlcnZpY2UpO1xyXG5cclxuICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZ3Vlc3Rjb21tZW50c1NlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCBhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldEd1ZXN0Q29tbWVudHM6IGdldEd1ZXN0Q29tbWVudHMsXHJcbiAgICAgICAgICAgIHNlbmRDb21tZW50OiBzZW5kQ29tbWVudFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEd1ZXN0Q29tbWVudHModHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kQ29tbWVudChjb21tZW50KSB7XHJcbiAgICAgICAgICAgIGxldCB1c2VyID0gYXV0aFNlcnZpY2UuZ2V0TG9nSW5mbygpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyOiB1c2VyLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQ6IGNvbW1lbnRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSGVhZGVyQ29udHJvbGxlcicsIEhlYWRlckNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEhlYWRlckNvbnRyb2xsZXIuJGluamVjdCA9IFsnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5zaWduT3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduT3V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsSGVhZGVyJywgYWh0bEhlYWRlcik7XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxIZWFkZXIoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBQycsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hlYWRlci9oZWFkZXIuaHRtbCdcclxuXHRcdH07XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuc2VydmljZSgnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJywgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKTtcclxuXHJcblx0SGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRsb2cnXTtcclxuXHJcblx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCR0aW1lb3V0LCAkbG9nKSB7XHJcblx0XHRmdW5jdGlvbiBVSXRyYW5zaXRpb25zKGNvbnRhaW5lcikge1xyXG5cdFx0XHRpZiAoISQoY29udGFpbmVyKS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQgJyR7Y29udGFpbmVyfScgbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0dGhpcy5fY29udGFpbmVyID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIgPSAkKGNvbnRhaW5lcik7XHJcblx0XHR9XHJcblxyXG5cdFx0VUl0cmFuc2l0aW9ucy5wcm90b3R5cGUuYW5pbWF0ZVRyYW5zaXRpb24gPSBmdW5jdGlvbiAodGFyZ2V0RWxlbWVudHNRdWVyeSxcclxuXHRcdFx0e2Nzc0VudW1lcmFibGVSdWxlID0gJ3dpZHRoJywgZnJvbSA9IDAsIHRvID0gJ2F1dG8nLCBkZWxheSA9IDEwMH0pIHtcclxuXHJcblx0XHRcdGlmICh0aGlzLl9jb250YWluZXIgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmNvbnRhaW5lci5tb3VzZWVudGVyKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRsZXQgdGFyZ2V0RWxlbWVudHMgPSAkKHRoaXMpLmZpbmQodGFyZ2V0RWxlbWVudHNRdWVyeSksXHJcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHRpZiAoIXRhcmdldEVsZW1lbnRzLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50KHMpICR7dGFyZ2V0RWxlbWVudHNRdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSwgdG8pO1xyXG5cdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGUgPSB0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUpO1xyXG5cdFx0XHRcdHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSwgZnJvbSk7XHJcblxyXG5cdFx0XHRcdGxldCBhbmltYXRlT3B0aW9ucyA9IHt9O1xyXG5cdFx0XHRcdGFuaW1hdGVPcHRpb25zW2Nzc0VudW1lcmFibGVSdWxlXSA9IHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdHRhcmdldEVsZW1lbnRzLmFuaW1hdGUoYW5pbWF0ZU9wdGlvbnMsIGRlbGF5KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0VUl0cmFuc2l0aW9ucy5wcm90b3R5cGUucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrID0gZnVuY3Rpb24oZWxlbWVudFRyaWdnZXJRdWVyeSwgZWxlbWVudE9uUXVlcnkpIHtcclxuXHRcdFx0aWYgKCEkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLmxlbmd0aCB8fCAhJChlbGVtZW50T25RdWVyeSkubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50KHMpICR7ZWxlbWVudFRyaWdnZXJRdWVyeX0gJHtlbGVtZW50T25RdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdCQoZWxlbWVudFRyaWdnZXJRdWVyeSkub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0JChlbGVtZW50T25RdWVyeSkuY3NzKCdoZWlnaHQnLCAnYXV0bycpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9ucyhoZWFkZXJRdWVyeSwgY29udGFpbmVyUXVlcnkpIHtcclxuXHRcdFx0VUl0cmFuc2l0aW9ucy5jYWxsKHRoaXMsIGNvbnRhaW5lclF1ZXJ5KTtcclxuXHJcblx0XHRcdGlmICghJChoZWFkZXJRdWVyeSkubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50KHMpICR7aGVhZGVyUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2hlYWRlciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2hlYWRlciA9ICQoaGVhZGVyUXVlcnkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVUl0cmFuc2l0aW9ucy5wcm90b3R5cGUpO1xyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpeEhlYWRlckVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudEZpeFF1ZXJ5LCBmaXhDbGFzc05hbWUsIHVuZml4Q2xhc3NOYW1lLCBvcHRpb25zKSB7XHJcblx0XHRcdGlmICh0aGlzLl9oZWFkZXIgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCBzZWxmID0gdGhpcztcclxuXHRcdFx0bGV0IGZpeEVsZW1lbnQgPSAkKGVsZW1lbnRGaXhRdWVyeSk7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBvbldpZHRoQ2hhbmdlSGFuZGxlcigpIHtcclxuXHRcdFx0XHRsZXQgdGltZXI7XHJcblxyXG5cdFx0XHRcdGZ1bmN0aW9uIGZpeFVuZml4TWVudU9uU2Nyb2xsKCkge1xyXG5cdFx0XHRcdFx0aWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+IG9wdGlvbnMub25NaW5TY3JvbGx0b3ApIHtcclxuXHRcdFx0XHRcdFx0Zml4RWxlbWVudC5hZGRDbGFzcyhmaXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Zml4RWxlbWVudC5yZW1vdmVDbGFzcyhmaXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHRpbWVyID0gbnVsbDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8ICQod2luZG93KS5pbm5lcldpZHRoKCk7XHJcblxyXG5cdFx0XHRcdGlmICh3aWR0aCA8IG9wdGlvbnMub25NYXhXaW5kb3dXaWR0aCkge1xyXG5cdFx0XHRcdFx0Zml4VW5maXhNZW51T25TY3JvbGwoKTtcclxuXHRcdFx0XHRcdHNlbGYuX2hlYWRlci5hZGRDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblxyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLm9mZignc2Nyb2xsJyk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCF0aW1lcikge1xyXG5cdFx0XHRcdFx0XHRcdHRpbWVyID0gJHRpbWVvdXQoZml4VW5maXhNZW51T25TY3JvbGwsIDE1MCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIucmVtb3ZlQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0Zml4RWxlbWVudC5yZW1vdmVDbGFzcyhmaXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLm9mZignc2Nyb2xsJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRvbldpZHRoQ2hhbmdlSGFuZGxlcigpO1xyXG5cdFx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzXHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBIZWFkZXJUcmFuc2l0aW9ucztcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxTdGlreUhlYWRlcicsYWh0bFN0aWt5SGVhZGVyKTtcclxuXHJcblx0YWh0bFN0aWt5SGVhZGVyLiRpbmplY3QgPSBbJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZSddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU3Rpa3lIZWFkZXIoSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0EnLFxyXG5cdFx0XHRzY29wZToge30sXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluaygpIHtcclxuXHRcdFx0bGV0IGhlYWRlciA9IG5ldyBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJy5sLWhlYWRlcicsICcubmF2X19pdGVtLWNvbnRhaW5lcicpO1xyXG5cclxuXHRcdFx0aGVhZGVyLmFuaW1hdGVUcmFuc2l0aW9uKFxyXG5cdFx0XHRcdCcuc3ViLW5hdicsIHtcclxuXHRcdFx0XHRcdGNzc0VudW1lcmFibGVSdWxlOiAnaGVpZ2h0JyxcclxuXHRcdFx0XHRcdGRlbGF5OiAzMDB9KVxyXG5cdFx0XHRcdC5yZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2soXHJcblx0XHRcdFx0XHQnW2RhdGEtYXV0b2hlaWdodC10cmlnZ2VyXScsXHJcblx0XHRcdFx0XHQnW2RhdGEtYXV0b2hlaWdodC1vbl0nKVxyXG5cdFx0XHRcdC5maXhIZWFkZXJFbGVtZW50KFxyXG5cdFx0XHRcdFx0Jy5uYXYnLFxyXG5cdFx0XHRcdFx0J2pzX25hdi0tZml4ZWQnLFxyXG5cdFx0XHRcdFx0J2pzX2wtaGVhZGVyLS1yZWxhdGl2ZScsIHtcclxuXHRcdFx0XHRcdFx0b25NaW5TY3JvbGx0b3A6IDg4LFxyXG5cdFx0XHRcdFx0XHRvbk1heFdpbmRvd1dpZHRoOiA4NTB9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIEhvbWVDb250cm9sbGVyKTtcclxuXHJcbiAgICBIb21lQ29udHJvbGxlci4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIocmVzb3J0U2VydmljZSkge1xyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KHtwcm9wOiAnX3RyZW5kJywgdmFsdWU6IHRydWV9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAvL3RvZG8gaWYgbm90IHJlc3BvbnNlXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxNb2RhbCcsIGFodGxNb2RhbERpcmVjdGl2ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgbGluazogYWh0bE1vZGFsRGlyZWN0aXZlTGluayxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvbW9kYWwvbW9kYWwuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbignbW9kYWxPcGVuJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdpbWFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3JjID0gZGF0YS5zcmM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3cuaW1nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS4kYXBwbHkoKTsvL3RvZG8gYXBwbHk/XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAnbWFwJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93Lm1hcCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nb29nbGUgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZ29vZ2xlICYmICdtYXBzJyBpbiB3aW5kb3cuZ29vZ2xlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXBTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcFNjcmlwdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG15TGF0bG5nID0ge2xhdDogZGF0YS5jb29yZC5sYXQsIGxuZzogZGF0YS5jb29yZC5sbmd9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgaWNvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IG15TGF0bG5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG15TGF0bG5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5jbG9zZURpYWxvZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNob3cgPSB7fTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNYXAobmFtZSwgY29vcmQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbnMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgW25hbWUsIGNvb3JkLmxhdCwgY29vcmQubG5nXVxyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2JqZWN0IGFuZCBzcGVjaWZ5IHRoZSBET00gZWxlbWVudCBmb3IgZGlzcGxheS5cclxuICAgICAgICAgICAgICAgIHZhciBtb2RhbE1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiB7bGF0OiBjb29yZC5sYXQsIGxuZzogY29vcmQubG5nfSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgem9vbTogOVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGljb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnYXNzZXRzL2ltYWdlcy9pY29uX21hcC5wbmcnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtb2RhbE1hcCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4vKlxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3JkLmxhdCwgY29vcmQubG5nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtb2RhbE1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8hKmNlbnRlcmluZyohL1xyXG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMgKCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBMYXRMYW5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyAobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQoTGF0TGFuZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RhbE1hcC5maXRCb3VuZHMoYm91bmRzKTsqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdhY3Rpdml0aWVzRmlsdGVyJywgYWN0aXZpdGllc0ZpbHRlcik7XHJcblxyXG4gICAgYWN0aXZpdGllc0ZpbHRlci4kaW5qZWN0ID0gWyckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gYWN0aXZpdGllc0ZpbHRlcigkbG9nLCBmaWx0ZXJzU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYXJnLCBfc3RyaW5nTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBzdHJpbmdMZW5ndGggPSBwYXJzZUludChfc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc05hTihzdHJpbmdMZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYENhbid0IHBhcnNlIGFyZ3VtZW50OiAke19zdHJpbmdMZW5ndGh9YCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBhcmcuam9pbignLCAnKS5zbGljZSgwLCBzdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5zbGljZSgwLCByZXN1bHQubGFzdEluZGV4T2YoJywnKSkgKyAnLi4uJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUmVzb3J0Q29udHJvbGxlcicsIFJlc29ydENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFJlc29ydENvbnRyb2xsZXIuJGluamVjdCA9IFsncmVzb3J0U2VydmljZScsICckZmlsdGVyJywgJyRzY29wZScsICckc3RhdGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBSZXNvcnRDb250cm9sbGVyKHJlc29ydFNlcnZpY2UsICRmaWx0ZXIsICRzY29wZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRGaWx0ZXJzID0gJHN0YXRlLiRjdXJyZW50LmRhdGEuY3VycmVudEZpbHRlcnM7IC8vIHRlbXBcclxuXHJcbiAgICAgICAgdGhpcy5maWx0ZXJzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5pbml0RmlsdGVycygpO1xyXG5cclxuICAgICAgICB0aGlzLm9uRmlsdGVyQ2hhbmdlID0gZnVuY3Rpb24oZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpIHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhmaWx0ZXJHcm91cCwgZmlsdGVyLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdID0gY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLnB1c2goZmlsdGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5zcGxpY2UoY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLmluZGV4T2YoZmlsdGVyKSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpLmFwcGx5RmlsdGVycyhob3RlbHMsIGN1cnJlbnRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGhvdGVscyA9IHt9O1xyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gaG90ZWxzO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChcclxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMuZmlsdGVycy5wcmljZSxcclxuICAgICAgICAgICAgICAgIChuZXdWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzLnByaWNlID0gW25ld1ZhbHVlXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGN1cnJlbnRGaWx0ZXJzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpLmFwcGx5RmlsdGVycyhob3RlbHMsIGN1cnJlbnRGaWx0ZXJzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpOyAgICAgICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5NYXAgPSBmdW5jdGlvbihob3RlbE5hbWUsIGhvdGVsQ29vcmQsIGhvdGVsKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogJ21hcCcsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBob3RlbE5hbWUsXHJcbiAgICAgICAgICAgICAgICBjb29yZDogaG90ZWxDb29yZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywgZGF0YSlcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2hvdGVsRmlsdGVyJywgaG90ZWxGaWx0ZXIpO1xyXG5cclxuICAgIGhvdGVsRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBob3RlbEZpbHRlcigkbG9nLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIGxldCBzYXZlZEZpbHRlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbG9hZEZpbHRlcnM6IGxvYWRGaWx0ZXJzLFxyXG4gICAgICAgICAgICBhcHBseUZpbHRlcnM6IGFwcGx5RmlsdGVycyxcclxuICAgICAgICAgICAgaW5pdEZpbHRlcnM6IGluaXRGaWx0ZXJzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9hZEZpbHRlcnMoKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdEZpbHRlcnMoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNhdmVkRmlsdGVycyk7XHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3RlbERldGFpbHNDb25zdGFudFtrZXldLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV0gJiYgc2F2ZWRGaWx0ZXJzW2tleV0uaW5kZXhPZihob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldKSAhPT0gLTEgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9maWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gPSBzYXZlZEZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSB8fCBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZmlsdGVycy5wcmljZSA9IHtcclxuICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgIG1heDogMTAwMFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVycyhob3RlbHMsIGZpbHRlcnMpIHtcclxuICAgICAgICAgICAgc2F2ZWRGaWx0ZXJzID0gZmlsdGVycztcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChob3RlbHMsIGZ1bmN0aW9uKGhvdGVsKSB7XHJcbiAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzLCBmdW5jdGlvbihmaWx0ZXJzSW5Hcm91cCwgZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJHcm91cCA9PT0gJ2d1ZXN0cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc0luR3JvdXAgPSBbZmlsdGVyc0luR3JvdXBbZmlsdGVyc0luR3JvdXAubGVuZ3RoIC0gMV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWx0ZXJzSW5Hcm91cC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hBdExlYXNlT25lRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb2NhdGlvbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwubG9jYXRpb24uY291bnRyeSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3R5cGVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnR5cGUgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXR0aW5ncyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5lbnZpcm9ubWVudCA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ211c3RIYXZlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5kZXRhaWxzW2ZpbHRlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWN0aXZpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB+aG90ZWwuYWN0aXZpdGllcy5pbmRleE9mKGZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwucHJpY2UgPj0gZmlsdGVyLm1pbiAmJiBob3RlbC5wcmljZSA8PSBmaWx0ZXIubWF4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2d1ZXN0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5ndWVzdHMubWF4ID49ICtmaWx0ZXJbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBob3RlbHMuZmlsdGVyKChob3RlbCkgPT4gIWhvdGVsLl9oaWRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3Njcm9sbFRvVG9wJywgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUpO1xyXG5cclxuICAgIHNjcm9sbFRvVG9wRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciwgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgaWYgKDEpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAkLnRyaW0oYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZSgwLCBhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzY3JvbGwtdG8tdG9wLWNvbmZpZyBpcyBub3QgZGVmaW5lZGApO1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yIHx8ICdodG1sLCBib2R5JztcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW0pLm9uKGF0dHIuc2Nyb2xsVG9Ub3AsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogaGVpZ2h0IH0sIFwic2xvd1wiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxUb3AzJywgYWh0bFRvcDNEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxUb3AzRGlyZWN0aXZlLiRpbmplY3QgPSBbJ3RvcDNTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFRvcDNEaXJlY3RpdmUodG9wM1NlcnZpY2UsIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bFRvcDNDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd0b3AzJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL3RvcDMudGVtcGxhdGUuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsVG9wM0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWlscyA9IGhvdGVsRGV0YWlsc0NvbnN0YW50Lm11c3RIYXZlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydFR5cGUgPSAkYXR0cnMuYWh0bFRvcDN0eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEltZ1NyYyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9pbWFnZXMvJyArIHRoaXMucmVzb3J0VHlwZSArICcvJyArIHRoaXMucmVzb3J0W2luZGV4XS5pbWcuZmlsZW5hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNSZXNvcnRJbmNsdWRlRGV0YWlsID0gZnVuY3Rpb24oaXRlbSwgZGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0YWlsQ2xhc3NOYW1lID0gJ3RvcDNfX2RldGFpbC1jb250YWluZXItLScgKyBkZXRhaWwsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lID0gIWl0ZW0uZGV0YWlsc1tkZXRhaWxdID8gJyB0b3AzX19kZXRhaWwtY29udGFpbmVyLS1oYXNudCcgOiAnJztcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0YWlsQ2xhc3NOYW1lICsgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0b3AzU2VydmljZS5nZXRUb3AzUGxhY2VzKHRoaXMucmVzb3J0VHlwZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnJlc29ydCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ3RvcDNTZXJ2aWNlJywgdG9wM1NlcnZpY2UpO1xyXG5cclxuICAgIHRvcDNTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gdG9wM1NlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0VG9wM1BsYWNlczogZ2V0VG9wM1BsYWNlc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRvcDNQbGFjZXModHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQudG9wMyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5hbmltYXRpb24oJy5zbGlkZXJfX2ltZycsIGFuaW1hdGlvbkZ1bmN0aW9uKTtcclxuXHJcblx0ZnVuY3Rpb24gYW5pbWF0aW9uRnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRiZWZvcmVBZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZSkge1xyXG5cdFx0XHRcdGxldCBzbGlkaW5nRGlyZWN0aW9uID0gZWxlbWVudC5zY29wZSgpLnNsaWRpbmdEaXJlY3Rpb247XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMScpO1xyXG5cclxuXHRcdFx0XHRpZihzbGlkaW5nRGlyZWN0aW9uID09PSAncmlnaHQnKSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJzEwMCUnfSwgNTAwLCBkb25lKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICctMjAwJSd9LCA1MDAsIGRvbmUpOyAvLzIwMD8gJClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHRhZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZSkge1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCd6LWluZGV4JywgJzAnKTtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnbGVmdCcsICcwJyk7XHJcblx0XHRcdFx0ZG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxTbGlkZXInLCBhaHRsU2xpZGVyKTtcclxuXHJcblx0YWh0bFNsaWRlci4kaW5qZWN0ID0gWydzbGlkZXJTZXJ2aWNlJywgJyR0aW1lb3V0J107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTbGlkZXIoc2xpZGVyU2VydmljZSwgJHRpbWVvdXQpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHRzY29wZToge30sXHJcblx0XHRcdGNvbnRyb2xsZXI6IGFodGxTbGlkZXJDb250cm9sbGVyLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlci5odG1sJyxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBhaHRsU2xpZGVyQ29udHJvbGxlcigkc2NvcGUpIHtcclxuXHRcdFx0JHNjb3BlLnNsaWRlciA9IHNsaWRlclNlcnZpY2U7XHJcblx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gbnVsbDtcclxuXHJcblx0XHRcdCRzY29wZS5uZXh0U2xpZGUgPSBuZXh0U2xpZGU7XHJcblx0XHRcdCRzY29wZS5wcmV2U2xpZGUgPSBwcmV2U2xpZGU7XHJcblx0XHRcdCRzY29wZS5zZXRTbGlkZSA9IHNldFNsaWRlO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gbmV4dFNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ2xlZnQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0TmV4dFNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHByZXZTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRQcmV2U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gc2V0U2xpZGUoaW5kZXgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IGluZGV4ID4gJHNjb3BlLnNsaWRlci5nZXRDdXJyZW50U2xpZGUodHJ1ZSkgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0Q3VycmVudFNsaWRlKGluZGV4KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGZpeElFOHBuZ0JsYWNrQmcoZWxlbWVudCkge1xyXG5cdFx0XHQkKGVsZW1lbnQpXHJcblx0XHRcdFx0LmNzcygnLW1zLWZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCd6b29tJywgJzEnKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtKSB7XHJcblx0XHRcdGxldCBhcnJvd3MgPSAkKGVsZW0pLmZpbmQoJy5zbGlkZXJfX2Fycm93Jyk7XHJcblxyXG5cdFx0XHRhcnJvd3MuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzAuNScpO1xyXG5cdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcodGhpcyk7XHJcblxyXG5cdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHQkdGltZW91dCgoKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcxJyk7XHJcblx0XHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKCQodGhpcykpO1xyXG5cdFx0XHRcdH0sIDUwMCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTtcclxuXHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZmFjdG9yeSgnc2xpZGVyU2VydmljZScsc2xpZGVyU2VydmljZSk7XHJcblxyXG5cdHNsaWRlclNlcnZpY2UuJGluamVjdCA9IFsnc2xpZGVySW1nUGF0aENvbnN0YW50J107XHJcblxyXG5cdGZ1bmN0aW9uIHNsaWRlclNlcnZpY2Uoc2xpZGVySW1nUGF0aENvbnN0YW50KSB7XHJcblx0XHRmdW5jdGlvbiBTbGlkZXIoc2xpZGVySW1hZ2VMaXN0KSB7XHJcblx0XHRcdHRoaXMuX2ltYWdlU3JjTGlzdCA9IHNsaWRlckltYWdlTGlzdDtcclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEltYWdlU3JjTGlzdCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2ltYWdlU3JjTGlzdDtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRDdXJyZW50U2xpZGUgPSBmdW5jdGlvbiAoZ2V0SW5kZXgpIHtcclxuXHRcdFx0cmV0dXJuIGdldEluZGV4ID09IHRydWUgPyB0aGlzLl9jdXJyZW50U2xpZGUgOiB0aGlzLl9pbWFnZVNyY0xpc3RbdGhpcy5fY3VycmVudFNsaWRlXTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRDdXJyZW50U2xpZGUgPSBmdW5jdGlvbiAoc2xpZGUpIHtcclxuXHRcdFx0c2xpZGUgPSBwYXJzZUludChzbGlkZSk7XHJcblxyXG5cdFx0XHRpZiAoaXNOYU4oc2xpZGUpIHx8IHNsaWRlIDwgMCB8fCBzbGlkZSA+IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSBzbGlkZTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXROZXh0U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxKSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA9IDAgOiB0aGlzLl9jdXJyZW50U2xpZGUrKztcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0UHJldlNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSAwKSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA9IHRoaXMuX2ltYWdlU3JjTGlzdC5sZW5ndGggLSAxIDogdGhpcy5fY3VycmVudFNsaWRlLS07XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IFNsaWRlcihzbGlkZXJJbWdQYXRoQ29uc3RhbnQpO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdzbGlkZXJJbWdQYXRoQ29uc3RhbnQnLCBbXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIxLmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIyLmpwZycsXHJcbiAgICAgICAgICAgICdhc3NldHMvaW1hZ2VzL3NsaWRlci9zbGlkZXIzLmpwZydcclxuICAgICAgICBdKTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdQYWdlcycsIFBhZ2VzKTtcclxuXHJcbiAgICBQYWdlcy4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBQYWdlcygkc2NvcGUpIHtcclxuICAgICAgICBjb25zdCBob3RlbHNQZXJQYWdlID0gNTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IDE7XHJcbiAgICAgICAgdGhpcy5wYWdlc1RvdGFsID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd0Zyb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLmN1cnJlbnRQYWdlIC0gMSkgKiBob3RlbHNQZXJQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd05leHQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuICsrdGhpcy5jdXJyZW50UGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dQcmV2ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtLXRoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRQYWdlID0gZnVuY3Rpb24ocGFnZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gcGFnZSArIDE7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0xhc3RQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhZ2VzVG90YWwubGVuZ3RoID09PSB0aGlzLmN1cnJlbnRQYWdlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0ZpcnN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50UGFnZSA9PT0gMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIChldmVudCwgc2hvd0hvdGVsQ291bnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYWdlc1RvdGFsID0gbmV3IEFycmF5KE1hdGguY2VpbChzaG93SG90ZWxDb3VudCAvIGhvdGVsc1BlclBhZ2UpKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IDE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdzaG93RnJvbScsIHNob3dGcm9tKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzaG93RnJvbSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obW9kZWwsIHN0YXJ0UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgaWYgKCFtb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuc2xpY2Uoc3RhcnRQb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFByaWNlU2xpZGVyJywgcHJpY2VTbGlkZXJEaXJlY3RpdmUpO1xyXG5cclxuICAgIHByaWNlU2xpZGVyRGlyZWN0aXZlLiRpbmplY3QgPSBbJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBtaW46IFwiQFwiLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBcIkBcIixcclxuICAgICAgICAgICAgICAgIGxlZnRTbGlkZXI6ICc9JyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0U2xpZGVyOiAnPSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3ByaWNlU2xpZGVyL3ByaWNlU2xpZGVyLmh0bWwnLFxyXG4gICAgICAgICAgICBsaW5rOiBwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsoJHNjb3BlLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpIHtcclxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygkc2NvcGUubGVmdFNsaWRlcik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5yaWdodFNsaWRlcik7XHJcbiAgICAgICAgICAgICRzY29wZS5yaWdodFNsaWRlci5tYXggPSAxNTsqL1xyXG4gICAgICAgICAgICBsZXQgcmlnaHRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JyksXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1sZWZ0JyksXHJcbiAgICAgICAgICAgICAgICBzbGlkZUFyZWFXaWR0aCA9IHBhcnNlSW50KCQoJy5zbGlkZScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZVBlclN0ZXAgPSAkc2NvcGUubWF4IC8gKHNsaWRlQXJlYVdpZHRoIC0gMjApO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm1pbiA9IHBhcnNlSW50KCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkc2NvcGUubWF4ID0gcGFyc2VJbnQoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoJHNjb3BlLm1pbik7XHJcbiAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgkc2NvcGUubWF4KTtcclxuXHJcbiAgICAgICAgICAgIGluaXREcmFnKFxyXG4gICAgICAgICAgICAgICAgcmlnaHRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBzbGlkZUFyZWFXaWR0aCxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpKTtcclxuXHJcbiAgICAgICAgICAgIGluaXREcmFnKFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0bixcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICsgMjAsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiAwKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXREcmFnKGRyYWdFbGVtLCBpbml0UG9zaXRpb24sIG1heFBvc2l0aW9uLCBtaW5Qb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNoaWZ0O1xyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZWRvd24nLCBidG5Pbk1vdXNlRG93bik7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZURvd24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzaGlmdCA9IGV2ZW50LnBhZ2VYO1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRQb3NpdGlvbiA9IHBhcnNlSW50KGRyYWdFbGVtLmNzcygnbGVmdCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRvY09uTW91c2VNb3ZlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uTGVzc1RoYW5NYXggPSBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0IDw9IG1heFBvc2l0aW9uKCkgLSAyMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25HcmF0ZXJUaGFuTWluID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA+PSBtaW5Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zaXRpb25MZXNzVGhhbk1heCAmJiBwb3NpdGlvbkdyYXRlclRoYW5NaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0uY3NzKCdsZWZ0JywgaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0VsZW0uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gaW5pdFBvc2l0aW9uIC0gZXZlbnQucGFnZVggKyBzaGlmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFByaWNlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlVXAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ2RyYWdzdGFydCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFByaWNlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TWluID0gfn4ocGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkgKiB2YWx1ZVBlclN0ZXApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdNYXggPSB+fihwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgKiB2YWx1ZVBlclN0ZXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwobmV3TWluKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwobmV3TWF4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyokc2NvcGUuJGJyb2FkY2FzdCgncHJpY2VTbGlkZXJQb3NpdGlvbkNoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRCdG4uY3NzKCdsZWZ0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiByaWdodEJ0bi5jc3MoJ2xlZnQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKi9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRTbGlkZXJzKGJ0biwgbmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3UG9zdGlvbiA9IG5ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ0bi5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1Bvc3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0Jywgc2xpZGVBcmVhV2lkdGggLSBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGVtaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS5vbignY2hhbmdlIGtleXVwIHBhc3RlIGlucHV0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ZhbHVlID0gJCh0aGlzKS52YWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgLSAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhO2wnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2xpZGVycyhsZWZ0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS5vbignY2hhbmdlIGtleXVwIHBhc3RlIGlucHV0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ZhbHVlID0gJCh0aGlzKS52YWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSA+ICRzY29wZS5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld1ZhbHVlLCRzY29wZS5tYXggKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcCA8IHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICsgMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMocmlnaHRCdG4sIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGVtaXQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxlZnRTbGlkZXIgPSAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIgPSAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW46ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXg6ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coMTMpOyovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy90b2RvIGllOCBidWcgZml4XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCdpZTgnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuZmluZCgnLnNsaWRlX19wb2ludGVyLS1sZWZ0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKS5jc3MoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCtzbGlkZUFyZWFXaWR0aCAtICtuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0JywgK3NsaWRlQXJlYVdpZHRoIC0gcGFyc2VJbnQobmV3VmFsdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTsqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsU2xpZGVPbkNsaWNrJywgYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSgkbG9nKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGxldCBzbGlkZUVtaXRFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLWVtaXRdJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNsaWRlRW1pdEVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2xpZGVFbWl0RWxlbWVudHMub24oJ2NsaWNrJywgc2xpZGVFbWl0T25DbGljayk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzbGlkZUVtaXRPbkNsaWNrKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNsaWRlT25FbGVtZW50ID0gJChlbGVtKS5maW5kKCdbc2xpZGUtb25dJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNsaWRlLWVtaXQgbm90IGZvdW5kYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nKSAhPT0gJycgJiYgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nKSAhPT0gJ2Nsb3NlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLndhcm4oYFdyb25nIGluaXQgdmFsdWUgZm9yICdzbGlkZS1vbicgYXR0cmlidXRlLCBzaG91bGQgYmUgJycgb3IgJ2Nsb3NlZCcuYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nKSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5zbGlkZVVwKCdzbG93Jywgb25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicsICdjbG9zZWQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVEb3duKCdzbG93Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzbGlkZVRvZ2dsZUVsZW1lbnRzID0gJChlbGVtKS5maW5kKCdbc2xpZGUtb24tdG9nZ2xlXScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkLmVhY2goc2xpZGVUb2dnbGVFbGVtZW50cywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJCh0aGlzKS5hdHRyKCdzbGlkZS1vbi10b2dnbGUnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcbiJdfQ==
