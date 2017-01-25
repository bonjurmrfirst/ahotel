'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp', ['ui.router', 'ngAnimate', '720kb.socialshare']);
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

	config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

	function config($stateProvider, $urlRouterProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$urlRouterProvider.otherwise('/');

		$stateProvider.state('home', {
			url: '/',
			templateUrl: 'app/partials/home/home.html'
		}).state('auth', {
			url: '/auth',
			templateUrl: 'app/partials/auth/auth.html',
			params: { 'type': 'login' }
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

    run.$inject = ['$rootScope', '$timeout'];

    function run($rootScope, $timeout) {
        $rootScope.$logged = false;

        $rootScope.$state = {
            currentStateName: null,
            currentStateParams: null,
            stateHistory: []
        };

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.$state.currentStateName = toState.name;
            $rootScope.$state.currentStateParams = toParams;
            $rootScope.$state.stateHistory.push(toState.name);
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $timeout(function () {
                return $(window).scrollTop(0);
            });
        });
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
        hotels: '/api/hotels',
        booking: '/booking'
    }).constant('templatesPathsConstant', ['app/partials/auth/auth.html']);
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

    resortService.$inject = ['$http', 'backendPathsConstant', '$q', '$log', '$rootScope'];

    function resortService($http, backendPathsConstant, $q, $log, $rootScope) {
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
                $log.error('Cant get ' + backendPathsConstant.hotels);
                $rootScope.$broadcast('displayError', { show: true });

                return null;
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

                var result = void 0;

                try {
                    result = model.filter(function (hotel) {
                        return hotel[filter.prop] == filter.value;
                    });
                } catch (e) {
                    $log.error('Cant parse response');
                    $rootScope.$broadcast('displayError', { show: true, message: 'Error occurred' });
                    result = null;
                }

                return result;
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

    angular.module('ahotelApp').directive('ahtlDisplayError', displayErrorDirective);

    displayErrorDirective.$inject = ['$state'];

    function displayErrorDirective() {
        return {
            restrict: 'A',
            link: function link($scope, elem) {
                var defaultErrorMsg = 'Could not connect to server. Refresh the page or try again later.';

                $scope.$on('displayError', function (event, data) {
                    var show = data.show ? 'block' : 'none';

                    $(elem).text(data.message || defaultErrorMsg);
                    $(elem).css('display', show);
                });

                $scope.$on('$stateChangeStart', function () {
                    $(elem).css('display', 'none');
                });
            }
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
                    if (response.data === 'User already exists') {
                        _this.validationStatus.userAlreadyExists = true;
                    } else {
                        return;
                    }
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
                if (response.data === 'User already exists' || response.data === 'Login or password incorrect') {
                    return response;
                }
                $rootScope.$broadcast('displayError', { show: true });
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
            if (!response) {
                _this.error = true;
                return;
            }
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

    BookingFormController.$inject = ['$http', 'backendPathsConstant', '$scope', '$log'];

    function BookingFormController($http, backendPathsConstant, $scope, $log) {
        'use strict';

        this.showForm = true;

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

        this.submit = function () {
            $http({
                method: 'GET',
                url: backendPathsConstant.booking,
                data: this.form
            }).then(onResolve, onRejected);

            var self = this;
            function onResolve(response) {
                self.showForm = false;

                $scope.$root.$broadcast('modalOpen', {
                    show: 'text',
                    header: 'Your request is in process.',
                    message: 'We will send you email with all information about your travel.'
                });
            }

            function onRejected(response) {
                $log.error('Cant post /booking');
                $scope.$root.$broadcast('displayError', {
                    show: true,
                    message: 'Server is not responding. Try again or call hotline: +0 123 456 89'
                });
            }
            /*
            }, (response) => {
            if (!response) {
                       */
        };
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
                if (!response) {
                    return;
                }
                hotels = response;
                createMap();
            });

            function createMap() {
                if (window.google && 'maps' in window.google) {
                    initMap();
                    return;
                }

                var mapScript = document.createElement('script');
                mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxCK2-uVyl69wn7K61NPAQDf7yH-jf3w&language=en';
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
                    if ($("html").hasClass("ie8")) {
                        return;
                    }

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
            if (!response || !response.data) {
                _this.loadCommentsError = true;
                return;
            }
            _this.comments = response.data;
        });

        this.addComment = function () {
            var _this2 = this;

            guestcommentsService.sendComment(this.formData).then(function (response) {
                if (!response) {
                    _this2.loadCommentsError = true;
                    return;
                }

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

        function onReject() {
            $log.error('Cant get ' + backendPathsConstant.hotels);
            $rootScope.$broadcast('displayError', { show: true });

            return null;
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

            function onReject() {
                $log.error('Cant get ' + backendPathsConstant.hotels);
                $rootScope.$broadcast('displayError', { show: true });

                return null;
            }
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('ahotelApp').controller('HeaderAuthController', HeaderAuthController);

    HeaderAuthController.$inject = ['authService'];

    function HeaderAuthController(authService) {
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
			var header = new HeaderTransitionsService('[data-header]', '[data-header-item]');

			header.animateTransition('[data-header-subnav]', {
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
                        mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxCK2-uVyl69wn7K61NPAQDf7yH-jf3w&language=en';
                        mapScript.onload = function () {
                            initMap();
                            elem.css('display', 'block');
                        };
                        document.body.appendChild(mapScript);
                    }
                }

                if (data.show === 'text') {
                    $scope.show.text = true;
                    $scope.show.header = data.header;
                    $scope.show.message = data.message;
                    elem.css('display', 'block');
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
            if (!response) {
                _this.error = true;
                return;
            }

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
            if (!response) {
                return;
            }
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
                if (!response) {
                    return;
                }
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
					$(element).animate({ 'left': '-200%' }, 500, done);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucm91dGVzLmpzIiwiYWhvdGVsLnJ1bi5qcyIsImdsb2JhbHMvYmFja2VuZFBhdGhzLmNvbnN0YW50LmpzIiwiZ2xvYmFscy9ob3RlbERldGFpbHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL3Jlc29ydC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvZGlzcGxheUVycm9yLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2Jvb2tpbmcvYm9va2luZy5mb3JtLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2RhdGVQaWNrZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZGVzdGluYXRpb25zL21hcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuZmlsdGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmF1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlclRyYW5zaXRpb25zLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc3Rpa3lIZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaG9tZS9ob21lLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9tb2RhbC9tb2RhbC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LmFjdGl2aXRpZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5ob3RlbC5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LnNjcm9sbHRvVG9wLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3NlYXJjaC9zZWFyY2guY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3RvcC90b3AzLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmFuaW1hdGlvbi5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlclBhdGguY29uc3RhbnQuanMiLCJwYXJ0aWFscy9yZXNvcnQvcGFnZXMvcGFnZXMuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3NsaWRlT25DbGljay9zbGlkZU9uQ2xpY2suZGlyZWN0aXZlLmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkcHJvdmlkZSIsImRlY29yYXRvciIsIiRkZWxlZ2F0ZSIsIiR3aW5kb3ciLCJsb2dIaXN0b3J5Iiwid2FybiIsImVyciIsImxvZyIsIm1lc3NhZ2UiLCJfbG9nV2FybiIsInB1c2giLCJhcHBseSIsIl9sb2dFcnIiLCJlcnJvciIsIm5hbWUiLCJzdGFjayIsIkVycm9yIiwic2VuZE9uVW5sb2FkIiwib25iZWZvcmV1bmxvYWQiLCJsZW5ndGgiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJzZXRSZXF1ZXN0SGVhZGVyIiwic2VuZCIsIkpTT04iLCJzdHJpbmdpZnkiLCIkaW5qZWN0IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCIkbG9jYXRpb25Qcm92aWRlciIsImh0bWw1TW9kZSIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJkYXRhIiwiY3VycmVudEZpbHRlcnMiLCJydW4iLCIkcm9vdFNjb3BlIiwiJHRpbWVvdXQiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiZnJvbVN0YXRlIiwiZnJvbVBhcmFtcyIsIiQiLCJ3aW5kb3ciLCJzY3JvbGxUb3AiLCJjb25zdGFudCIsInRvcDMiLCJhdXRoIiwiZ2FsbGVyeSIsImd1ZXN0Y29tbWVudHMiLCJob3RlbHMiLCJib29raW5nIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJGh0dHAiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsIiRxIiwiJGxvZyIsIm1vZGVsIiwiZ2V0UmVzb3J0IiwiZmlsdGVyIiwid2hlbiIsImFwcGx5RmlsdGVyIiwibWV0aG9kIiwidGhlbiIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJyZXNwb25zZSIsIiRicm9hZGNhc3QiLCJzaG93IiwicHJvcCIsInZhbHVlIiwiZGlzY291bnRNb2RlbCIsImhvdGVsIiwicm5kSG90ZWwiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJyZXN1bHQiLCJlIiwiZGlyZWN0aXZlIiwiZGlzcGxheUVycm9yRGlyZWN0aXZlIiwicmVzdHJpY3QiLCJsaW5rIiwiJHNjb3BlIiwiZWxlbSIsImRlZmF1bHRFcnJvck1zZyIsInRleHQiLCJjc3MiLCJjb250cm9sbGVyIiwiQXV0aENvbnRyb2xsZXIiLCJhdXRoU2VydmljZSIsInZhbGlkYXRpb25TdGF0dXMiLCJ1c2VyQWxyZWFkeUV4aXN0cyIsImxvZ2luT3JQYXNzd29yZEluY29ycmVjdCIsImNyZWF0ZVVzZXIiLCJuZXdVc2VyIiwiY29uc29sZSIsImdvIiwibG9naW5Vc2VyIiwic2lnbkluIiwidXNlciIsInByZXZpb3VzU3RhdGUiLCJVc2VyIiwiYmFja2VuZEFwaSIsIl9iYWNrZW5kQXBpIiwiX2NyZWRlbnRpYWxzIiwiX29uUmVzb2x2ZSIsInN0YXR1cyIsInRva2VuIiwiX3Rva2VuS2VlcGVyIiwic2F2ZVRva2VuIiwiX29uUmVqZWN0ZWQiLCJfdG9rZW4iLCJkZWJ1ZyIsImdldFRva2VuIiwiZGVsZXRlVG9rZW4iLCJwcm90b3R5cGUiLCJjcmVkZW50aWFscyIsImFjdGlvbiIsInNpZ25PdXQiLCJnZXRMb2dJbmZvIiwiQm9va2luZ0NvbnRyb2xsZXIiLCIkc3RhdGVQYXJhbXMiLCJsb2FkZWQiLCJob3RlbElkIiwiZ2V0SG90ZWxJbWFnZXNDb3VudCIsImNvdW50IiwiQXJyYXkiLCJvcGVuSW1hZ2UiLCIkZXZlbnQiLCJpbWdTcmMiLCJ0YXJnZXQiLCJzcmMiLCJCb29raW5nRm9ybUNvbnRyb2xsZXIiLCJzaG93Rm9ybSIsImZvcm0iLCJkYXRlIiwiYWRkR3Vlc3QiLCJyZW1vdmVHdWVzdCIsInN1Ym1pdCIsInNlbGYiLCIkcm9vdCIsImhlYWRlciIsImRhdGVQaWNrZXJEaXJlY3RpdmUiLCIkaW50ZXJ2YWwiLCJyZXF1aXJlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCJkYXRlUmFuZ2VQaWNrZXIiLCJsYW5ndWFnZSIsInN0YXJ0RGF0ZSIsIkRhdGUiLCJlbmREYXRlIiwic2V0RnVsbFllYXIiLCJnZXRGdWxsWWVhciIsImJpbmQiLCJvYmoiLCIkc2V0Vmlld1ZhbHVlIiwiJHJlbmRlciIsIiRhcHBseSIsImFodGxNYXBEaXJlY3RpdmUiLCJ0ZW1wbGF0ZSIsImFodGxNYXBEaXJlY3RpdmVMaW5rIiwiYXR0ciIsImNyZWF0ZU1hcCIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJpIiwiX2dtYXBzIiwibGF0IiwibG5nIiwibXlMYXRMbmciLCJtYXAiLCJtYXBzIiwiTWFwIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsInNjcm9sbHdoZWVsIiwiaWNvbnMiLCJhaG90ZWwiLCJpY29uIiwibWFya2VyIiwiTWFya2VyIiwidGl0bGUiLCJwb3NpdGlvbiIsIkxhdExuZyIsImFkZExpc3RlbmVyIiwic2V0Wm9vbSIsInNldENlbnRlciIsImdldFBvc2l0aW9uIiwiYm91bmRzIiwiTGF0TG5nQm91bmRzIiwiTGF0TGFuZyIsImV4dGVuZCIsImZpdEJvdW5kcyIsImFodGxHYWxsZXJ5RGlyZWN0aXZlIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rIiwiaW1hZ2VzSW5HYWxsZXJ5IiwiaW1nIiwiZmluZCIsIm9uIiwiaW1hZ2VMb2FkZWQiLCJpbWFnZUNsaWNrZWQiLCJhcHBlbmQiLCJpbWFnZXNMb2FkZWQiLCJoYXNDbGFzcyIsImFsaWduSW1hZ2VzIiwiaW1hZ2UiLCJpbWFnZVNyYyIsImNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJtYXNvbnJ5IiwiTWFzb25yeSIsImNvbHVtbldpZHRoIiwiaXRlbVNlbGVjdG9yIiwiZ3V0dGVyIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwib25MYXlvdXRDb21wbGV0ZSIsImxheW91dCIsIkd1ZXN0Y29tbWVudHNDb250cm9sbGVyIiwiZ3Vlc3Rjb21tZW50c1NlcnZpY2UiLCJjb21tZW50cyIsIm9wZW5Gb3JtIiwic2hvd1BsZWFzZUxvZ2lNZXNzYWdlIiwid3JpdGVDb21tZW50IiwiZ2V0R3Vlc3RDb21tZW50cyIsImxvYWRDb21tZW50c0Vycm9yIiwiYWRkQ29tbWVudCIsInNlbmRDb21tZW50IiwiZm9ybURhdGEiLCJjb21tZW50IiwicmV2ZXJzZSIsIml0ZW1zIiwic2xpY2UiLCJ0eXBlIiwib25SZWplY3QiLCJIZWFkZXJBdXRoQ29udHJvbGxlciIsImFodGxIZWFkZXIiLCJzZXJ2aWNlIiwiSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlIiwiVUl0cmFuc2l0aW9ucyIsIl9jb250YWluZXIiLCJhbmltYXRlVHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwiZml4RWxlbWVudCIsIm9uV2lkdGhDaGFuZ2VIYW5kbGVyIiwidGltZXIiLCJmaXhVbmZpeE1lbnVPblNjcm9sbCIsIm9uTWluU2Nyb2xsdG9wIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsIndpZHRoIiwiaW5uZXJXaWR0aCIsIm9uTWF4V2luZG93V2lkdGgiLCJvZmYiLCJzY3JvbGwiLCJhaHRsU3Rpa3lIZWFkZXIiLCJIb21lQ29udHJvbGxlciIsImFodGxNb2RhbERpcmVjdGl2ZSIsInJlcGxhY2UiLCJhaHRsTW9kYWxEaXJlY3RpdmVMaW5rIiwidW5kZWZpbmVkIiwibXlMYXRsbmciLCJjb29yZCIsIm1hcFR5cGVJZCIsInpvb20iLCJjZW50ZXIiLCJjbG9zZURpYWxvZyIsIm1vZGFsTWFwIiwiYWN0aXZpdGllc0ZpbHRlciIsImZpbHRlcnNTZXJ2aWNlIiwiYXJnIiwiX3N0cmluZ0xlbmd0aCIsInN0cmluZ0xlbmd0aCIsInBhcnNlSW50IiwiaXNOYU4iLCJqb2luIiwibGFzdEluZGV4T2YiLCJSZXNvcnRDb250cm9sbGVyIiwiJGZpbHRlciIsIiRjdXJyZW50IiwiZmlsdGVycyIsImluaXRGaWx0ZXJzIiwib25GaWx0ZXJDaGFuZ2UiLCJmaWx0ZXJHcm91cCIsInNwbGljZSIsImluZGV4T2YiLCJhcHBseUZpbHRlcnMiLCJnZXRTaG93SG90ZWxDb3VudCIsInJlZHVjZSIsImNvdW50ZXIiLCJpdGVtIiwiX2hpZGUiLCIkd2F0Y2giLCJuZXdWYWx1ZSIsIm9wZW5NYXAiLCJob3RlbE5hbWUiLCJob3RlbENvb3JkIiwiaG90ZWxGaWx0ZXIiLCJob3RlbERldGFpbHNDb25zdGFudCIsInNhdmVkRmlsdGVycyIsImxvYWRGaWx0ZXJzIiwia2V5IiwibWluIiwibWF4IiwiZm9yRWFjaCIsImlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMiLCJmaWx0ZXJzSW5Hcm91cCIsIm1hdGNoQXRMZWFzZU9uZUZpbHRlciIsInJldmVyc2VGaWx0ZXJNYXRjaGluZyIsImdldEhvdGVsUHJvcCIsImxvY2F0aW9uIiwiY291bnRyeSIsImVudmlyb25tZW50IiwiZGV0YWlscyIsInNjcm9sbFRvVG9wRGlyZWN0aXZlIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rIiwic2VsZWN0b3IiLCJoZWlnaHQiLCJ0cmltIiwic2Nyb2xsVG9Ub3BDb25maWciLCJzY3JvbGxUb1RvcCIsIlNlYXJjaENvbnRyb2xsZXIiLCJxdWVyeSIsInNlYXJjaCIsInBhcnNlZFF1ZXJ5Iiwic3BsaXQiLCJob3RlbENvbnRlbnQiLCJyZWdpb24iLCJkZXNjIiwiZGVzY0xvY2F0aW9uIiwibWF0Y2hlc0NvdW50ZXIiLCJxUmVnRXhwIiwiUmVnRXhwIiwibWF0Y2giLCJfaWQiLCJzZWFyY2hSZXN1bHRzIiwiX21hdGNoZXMiLCJhaHRsVG9wM0RpcmVjdGl2ZSIsIkFodGxUb3AzQ29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsIiRlbGVtZW50IiwiJGF0dHJzIiwicmVzb3J0VHlwZSIsImFodGxUb3AzdHlwZSIsInJlc29ydCIsImdldEltZ1NyYyIsImluZGV4IiwiZmlsZW5hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWwiLCJkZXRhaWwiLCJkZXRhaWxDbGFzc05hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUiLCJfc2hvd0luVG9wIiwiYW5pbWF0aW9uIiwiYW5pbWF0aW9uRnVuY3Rpb24iLCJiZWZvcmVBZGRDbGFzcyIsImNsYXNzTmFtZSIsImRvbmUiLCJzbGlkaW5nRGlyZWN0aW9uIiwiYWh0bFNsaWRlciIsInNsaWRlclNlcnZpY2UiLCJhaHRsU2xpZGVyQ29udHJvbGxlciIsInNsaWRlciIsIm5leHRTbGlkZSIsInByZXZTbGlkZSIsInNldFNsaWRlIiwic2V0TmV4dFNsaWRlIiwic2V0UHJldlNsaWRlIiwiZ2V0Q3VycmVudFNsaWRlIiwic2V0Q3VycmVudFNsaWRlIiwiZml4SUU4cG5nQmxhY2tCZyIsImFycm93cyIsImNsaWNrIiwiZGlzYWJsZWQiLCJzbGlkZXJJbWdQYXRoQ29uc3RhbnQiLCJTbGlkZXIiLCJzbGlkZXJJbWFnZUxpc3QiLCJfaW1hZ2VTcmNMaXN0IiwiX2N1cnJlbnRTbGlkZSIsImdldEltYWdlU3JjTGlzdCIsImdldEluZGV4Iiwic2xpZGUiLCJQYWdlcyIsImhvdGVsc1BlclBhZ2UiLCJjdXJyZW50UGFnZSIsInBhZ2VzVG90YWwiLCJzaG93RnJvbSIsInNob3dOZXh0Iiwic2hvd1ByZXYiLCJzZXRQYWdlIiwicGFnZSIsImlzTGFzdFBhZ2UiLCJpc0ZpcnN0UGFnZSIsInNob3dIb3RlbENvdW50IiwiY2VpbCIsInN0YXJ0UG9zaXRpb24iLCJwcmljZVNsaWRlckRpcmVjdGl2ZSIsImxlZnRTbGlkZXIiLCJyaWdodFNsaWRlciIsInByaWNlU2xpZGVyRGlyZWN0aXZlTGluayIsInJpZ2h0QnRuIiwibGVmdEJ0biIsInNsaWRlQXJlYVdpZHRoIiwidmFsdWVQZXJTdGVwIiwidmFsIiwiaW5pdERyYWciLCJkcmFnRWxlbSIsImluaXRQb3NpdGlvbiIsIm1heFBvc2l0aW9uIiwibWluUG9zaXRpb24iLCJzaGlmdCIsImJ0bk9uTW91c2VEb3duIiwicGFnZVgiLCJkb2NPbk1vdXNlTW92ZSIsImJ0bk9uTW91c2VVcCIsInBvc2l0aW9uTGVzc1RoYW5NYXgiLCJwb3NpdGlvbkdyYXRlclRoYW5NaW4iLCJzZXRQcmljZXMiLCJlbWl0IiwibmV3TWluIiwibmV3TWF4Iiwic2V0U2xpZGVycyIsImJ0biIsIm5ld1Bvc3Rpb24iLCJ0cmlnZ2VyIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rIiwic2xpZGVFbWl0RWxlbWVudHMiLCJzbGlkZUVtaXRPbkNsaWNrIiwic2xpZGVPbkVsZW1lbnQiLCJzbGlkZVVwIiwib25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlIiwic2xpZGVEb3duIiwic2xpZGVUb2dnbGVFbGVtZW50cyIsImVhY2giLCJ0b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFBLFFBQ0tDLE9BQU8sYUFBYSxDQUFDLGFBQWEsYUFBYTtLQUp4RDtBQ0FBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBRCxRQUNLQyxPQUFPLGFBQ1BDLG9CQUFPLFVBQVVDLFVBQVU7UUFDeEJBLFNBQVNDLFVBQVUsaUNBQVEsVUFBVUMsV0FBV0MsU0FBUztZQUNyRCxJQUFJQyxhQUFhO2dCQUNUQyxNQUFNO2dCQUNOQyxLQUFLOzs7WUFHYkosVUFBVUssTUFBTSxVQUFVQyxTQUFTOztZQUduQyxJQUFJQyxXQUFXUCxVQUFVRztZQUN6QkgsVUFBVUcsT0FBTyxVQUFVRyxTQUFTO2dCQUNoQ0osV0FBV0MsS0FBS0ssS0FBS0Y7Z0JBQ3JCQyxTQUFTRSxNQUFNLE1B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a0JBQWtCN2MsUUFBUTtnQkFDM0J3RCxLQUFLdEUsS0FBTDs7Z0JBRUE7OztZQUdKMmQsa0JBQWtCN1AsR0FBRyxTQUFTOFA7O1lBRTlCLFNBQVNBLG1CQUFtQjtnQkFDeEIsSUFBSUMsaUJBQWlCN2EsRUFBRWtELE1BQU0ySCxLQUFLOztnQkFFbEMsSUFBSSxDQUFDOFAsa0JBQWtCN2MsUUFBUTtvQkFDM0J3RCxLQUFLdEUsS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJNmQsZUFBZXpTLEtBQUssZ0JBQWdCLE1BQU15UyxlQUFlelMsS0FBSyxnQkFBZ0IsVUFBVTtvQkFDeEY5RyxLQUFLdEUsS0FBTDs7b0JBRUE7OztnQkFHSixJQUFJNmQsZUFBZXpTLEtBQUssZ0JBQWdCLElBQUk7b0JBQ3hDeVMsZUFBZUMsUUFBUSxRQUFRQztvQkFDL0JGLGVBQWV6UyxLQUFLLFlBQVk7dUJBQzdCO29CQUNIMlM7b0JBQ0FGLGVBQWVHLFVBQVU7b0JBQ3pCSCxlQUFlelMsS0FBSyxZQUFZOzs7Z0JBR3BDLFNBQVMyUywyQkFBMkI7b0JBQ2hDLElBQUlFLHNCQUFzQmpiLEVBQUVrRCxNQUFNMkgsS0FBSzs7b0JBRXZDN0ssRUFBRWtiLEtBQUtELHFCQUFxQixZQUFXO3dCQUNuQ2piLEVBQUUsTUFBTW1iLFlBQVluYixFQUFFLE1BQU1vSSxLQUFLOzs7Ozs7S0F0RHpEIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJywgWyd1aS5yb3V0ZXInLCAnbmdBbmltYXRlJywgJzcyMGtiLnNvY2lhbHNoYXJlJ10pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uZmlnKGZ1bmN0aW9uICgkcHJvdmlkZSkge1xyXG4gICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJyRsb2cnLCBmdW5jdGlvbiAoJGRlbGVnYXRlLCAkd2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9nSGlzdG9yeSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2FybjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycjogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5sb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ1dhcm4gPSAkZGVsZWdhdGUud2FybjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS53YXJuID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nV2Fybi5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgX2xvZ0VyciA9ICRkZWxlZ2F0ZS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICRkZWxlZ2F0ZS5lcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7bmFtZTogbWVzc2FnZSwgc3RhY2s6IG5ldyBFcnJvcigpLnN0YWNrfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ0Vyci5hcHBseShudWxsLCBbbWVzc2FnZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gc2VuZE9uVW5sb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbG9nSGlzdG9yeS5lcnIubGVuZ3RoICYmICFsb2dIaXN0b3J5Lndhcm4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbigncG9zdCcsICcvYXBpL2xvZycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGxvZ0hpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGRlbGVnYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxufSkoKTtcclxuXHJcbi8qXHJcbiAgICAgICAgLmZhY3RvcnkoJ2xvZycsIGxvZyk7XHJcblxyXG4gICAgbG9nLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxvZygkd2luZG93LCAkbG9nKSB7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2goYXJncyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYnJvd3NlckxvZykge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBlcnJvcihlKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgc3RhY2s6IGUuc3RhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRsb2cuZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RvZG8gYWxsIGVycm9yc1xyXG5cclxuXHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHdhcm46IHdhcm4sXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICAgICAgc2VuZE9uVW5sb2FkOiBzZW5kT25VbmxvYWRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuY29uZmlnKGNvbmZpZyk7XHJcblxyXG5cdGNvbmZpZy4kaW5qZWN0ID0gWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcclxuXHJcblx0ZnVuY3Rpb24gY29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XHJcblx0XHQkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XHJcblxyXG5cdFx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG5cclxuXHRcdCRzdGF0ZVByb3ZpZGVyXHJcblx0XHRcdC5zdGF0ZSgnaG9tZScsIHtcclxuXHRcdFx0XHR1cmw6ICcvJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ob21lL2hvbWUuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdhdXRoJywge1xyXG5cdFx0XHRcdHVybDogJy9hdXRoJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9hdXRoL2F1dGguaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3R5cGUnOiAnbG9naW4nfVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2J1bmdhbG93cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYnVuZ2Fsb3dzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvYnVuZ2Fsb3dzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnaG90ZWxzJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL3RvcCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvaG90ZWxzLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCd2aWxsYXMnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3ZpbGxhcycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL3ZpbGxhcy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2dhbGxlcnknLCB7XHJcblx0XHRcdFx0dXJsOiAnL2dhbGxlcnknLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2d1ZXN0Y29tbWVudHMnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2d1ZXN0Y29tbWVudHMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2d1ZXN0Y29tbWVudHMvZ3Vlc3Rjb21tZW50cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Rlc3RpbmF0aW9ucycsIHtcclxuXHRcdFx0XHRcdHVybDogJy9kZXN0aW5hdGlvbnMnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZGVzdGluYXRpb25zL2Rlc3RpbmF0aW9ucy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3Jlc29ydCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvcmVzb3J0JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcmVzb3J0Lmh0bWwnLFxyXG5cdFx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRcdGN1cnJlbnRGaWx0ZXJzOiB7fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdib29raW5nJywge1xyXG5cdFx0XHRcdHVybDogJy9ib29raW5nP2hvdGVsSWQnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Jvb2tpbmcvYm9va2luZy5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsnaG90ZWxJZCc6ICdob3RlbCBJZCd9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnc2VhcmNoJywge1xyXG5cdFx0XHRcdHVybDogJy9zZWFyY2g/cXVlcnknLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3NlYXJjaC9zZWFyY2guaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J3F1ZXJ5JzogJ3NlYXJjaCBxdWVyeSd9XHJcblx0XHRcdH0pO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLnJ1bihydW4pO1xyXG5cclxuICAgIHJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJyAsICckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bigkcm9vdFNjb3BlLCAkdGltZW91dCkge1xyXG4gICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9IHtcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlTmFtZTogbnVsbCxcclxuICAgICAgICAgICAgY3VycmVudFN0YXRlUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0ZUhpc3Rvcnk6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMpe1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVOYW1lID0gdG9TdGF0ZS5uYW1lO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5jdXJyZW50U3RhdGVQYXJhbXMgPSB0b1BhcmFtcztcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5LnB1c2godG9TdGF0ZS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJCh3aW5kb3cpLnNjcm9sbFRvcCgwKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHRvcDM6ICcvYXBpL3RvcDMnLFxyXG4gICAgICAgICAgICBhdXRoOiAnL2FwaS91c2VycycsXHJcbiAgICAgICAgICAgIGdhbGxlcnk6ICcvYXBpL2dhbGxlcnknLFxyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzOiAnL2FwaS9ndWVzdGNvbW1lbnRzJyxcclxuICAgICAgICAgICAgaG90ZWxzOiAnL2FwaS9ob3RlbHMnLFxyXG4gICAgICAgICAgICBib29raW5nOiAnL2Jvb2tpbmcnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY29uc3RhbnQoJ3RlbXBsYXRlc1BhdGhzQ29uc3RhbnQnLCBbXHJcbiAgICAgICAgICAgICdhcHAvcGFydGlhbHMvYXV0aC9hdXRoLmh0bWwnXHJcbiAgICAgICAgXSlcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdob3RlbERldGFpbHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdHlwZXM6IFtcclxuICAgICAgICAgICAgICAgICdIb3RlbCcsXHJcbiAgICAgICAgICAgICAgICAnQnVuZ2Fsb3cnLFxyXG4gICAgICAgICAgICAgICAgJ1ZpbGxhJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3M6IFtcclxuICAgICAgICAgICAgICAgICdDb2FzdCcsXHJcbiAgICAgICAgICAgICAgICAnQ2l0eScsXHJcbiAgICAgICAgICAgICAgICAnRGVzZXJ0J1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgbG9jYXRpb25zOiBbXHJcbiAgICAgICAgICAgICAgICAnTmFtaWJpYScsXHJcbiAgICAgICAgICAgICAgICAnTGlieWEnLFxyXG4gICAgICAgICAgICAgICAgJ1NvdXRoIEFmcmljYScsXHJcbiAgICAgICAgICAgICAgICAnVGFuemFuaWEnLFxyXG4gICAgICAgICAgICAgICAgJ1BhcHVhIE5ldyBHdWluZWEnLFxyXG4gICAgICAgICAgICAgICAgJ1JldW5pb24nLFxyXG4gICAgICAgICAgICAgICAgJ1N3YXppbGFuZCcsXHJcbiAgICAgICAgICAgICAgICAnU2FvIFRvbWUnLFxyXG4gICAgICAgICAgICAgICAgJ01hZGFnYXNjYXInLFxyXG4gICAgICAgICAgICAgICAgJ01hdXJpdGl1cycsXHJcbiAgICAgICAgICAgICAgICAnU2V5Y2hlbGxlcycsXHJcbiAgICAgICAgICAgICAgICAnTWF5b3R0ZScsXHJcbiAgICAgICAgICAgICAgICAnVWtyYWluZSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGd1ZXN0czogW1xyXG4gICAgICAgICAgICAgICAgJzEnLFxyXG4gICAgICAgICAgICAgICAgJzInLFxyXG4gICAgICAgICAgICAgICAgJzMnLFxyXG4gICAgICAgICAgICAgICAgJzQnLFxyXG4gICAgICAgICAgICAgICAgJzUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBtdXN0SGF2ZXM6IFtcclxuICAgICAgICAgICAgICAgICdyZXN0YXVyYW50JyxcclxuICAgICAgICAgICAgICAgICdraWRzJyxcclxuICAgICAgICAgICAgICAgICdwb29sJyxcclxuICAgICAgICAgICAgICAgICdzcGEnLFxyXG4gICAgICAgICAgICAgICAgJ3dpZmknLFxyXG4gICAgICAgICAgICAgICAgJ3BldCcsXHJcbiAgICAgICAgICAgICAgICAnZGlzYWJsZScsXHJcbiAgICAgICAgICAgICAgICAnYmVhY2gnLFxyXG4gICAgICAgICAgICAgICAgJ3BhcmtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2NvbmRpdGlvbmluZycsXHJcbiAgICAgICAgICAgICAgICAnbG91bmdlJyxcclxuICAgICAgICAgICAgICAgICd0ZXJyYWNlJyxcclxuICAgICAgICAgICAgICAgICdnYXJkZW4nLFxyXG4gICAgICAgICAgICAgICAgJ2d5bScsXHJcbiAgICAgICAgICAgICAgICAnYmljeWNsZXMnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBhY3Rpdml0aWVzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29va2luZyBjbGFzc2VzJyxcclxuICAgICAgICAgICAgICAgICdDeWNsaW5nJyxcclxuICAgICAgICAgICAgICAgICdGaXNoaW5nJyxcclxuICAgICAgICAgICAgICAgICdHb2xmJyxcclxuICAgICAgICAgICAgICAgICdIaWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0hvcnNlLXJpZGluZycsXHJcbiAgICAgICAgICAgICAgICAnS2F5YWtpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ05pZ2h0bGlmZScsXHJcbiAgICAgICAgICAgICAgICAnU2FpbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2N1YmEgZGl2aW5nJyxcclxuICAgICAgICAgICAgICAgICdTaG9wcGluZyAvIG1hcmtldHMnLFxyXG4gICAgICAgICAgICAgICAgJ1Nub3JrZWxsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTa2lpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1N1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbGRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdXaW5kc3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2luZSB0YXN0aW5nJyxcclxuICAgICAgICAgICAgICAgICdZb2dhJyBcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHByaWNlOiBbXHJcbiAgICAgICAgICAgICAgICBcIm1pblwiLFxyXG4gICAgICAgICAgICAgICAgXCJtYXhcIlxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdyZXNvcnRTZXJ2aWNlJywgcmVzb3J0U2VydmljZSk7XHJcblxyXG4gICAgcmVzb3J0U2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICckcScsICckbG9nJywgJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXNvcnRTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgJHEsICRsb2csICRyb290U2NvcGUpIHtcclxuICAgICAgICBsZXQgbW9kZWwgPSBudWxsO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSZXNvcnQoZmlsdGVyKSB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBlcnJvcnM6IG5vIGhvdGVscywgbm8gZmlsdGVyLi4uXHJcbiAgICAgICAgICAgIGlmIChtb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oYXBwbHlGaWx0ZXIobW9kZWwpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmhvdGVsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcGx5RmlsdGVyKG1vZGVsKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGBDYW50IGdldCAke2JhY2tlbmRQYXRoc0NvbnN0YW50LmhvdGVsc31gKTtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZGlzcGxheUVycm9yJywge3Nob3c6IHRydWV9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBhcHBseUZpbHRlcigpIHtcclxuICAgICAgICAgICAgICAgIGlmICghZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlci5wcm9wID09PSAnX2lkJyAmJiBmaWx0ZXIudmFsdWUgPT09ICdyYW5kb20nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpc2NvdW50TW9kZWwgPSBtb2RlbC5maWx0ZXIoKGhvdGVsKSA9PiBob3RlbFsnZGlzY291bnQnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJuZEhvdGVsID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGRpc2NvdW50TW9kZWwubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtkaXNjb3VudE1vZGVsW3JuZEhvdGVsXV1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbW9kZWwuZmlsdGVyKChob3RlbCkgPT4gaG90ZWxbZmlsdGVyLnByb3BdID09IGZpbHRlci52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKCdDYW50IHBhcnNlIHJlc3BvbnNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkaXNwbGF5RXJyb3InLCB7c2hvdzogdHJ1ZSwgbWVzc2FnZTogJ0Vycm9yIG9jY3VycmVkJ30pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRSZXNvcnQ6IGdldFJlc29ydFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxEaXNwbGF5RXJyb3InLCBkaXNwbGF5RXJyb3JEaXJlY3RpdmUpO1xyXG5cclxuICAgIGRpc3BsYXlFcnJvckRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckc3RhdGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBkaXNwbGF5RXJyb3JEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0RXJyb3JNc2cgPSAnQ291bGQgbm90IGNvbm5lY3QgdG8gc2VydmVyLiBSZWZyZXNoIHRoZSBwYWdlIG9yIHRyeSBhZ2FpbiBsYXRlci4nO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ2Rpc3BsYXlFcnJvcicsIChldmVudCwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzaG93ID0gZGF0YS5zaG93ID8gJ2Jsb2NrJyA6ICdub25lJztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChlbGVtKS50ZXh0KGRhdGEubWVzc2FnZSB8fCBkZWZhdWx0RXJyb3JNc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuY3NzKCdkaXNwbGF5Jywgc2hvdyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIEF1dGhDb250cm9sbGVyKTtcclxuXHJcbiAgICBBdXRoQ29udHJvbGxlci4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRzY29wZScsICdhdXRoU2VydmljZScsICckc3RhdGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBBdXRoQ29udHJvbGxlcigkcm9vdFNjb3BlLCAkc2NvcGUsIGF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMgPSB7XHJcbiAgICAgICAgICAgIHVzZXJBbHJlYWR5RXhpc3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgbG9naW5PclBhc3N3b3JkSW5jb3JyZWN0OiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5jcmVhdGVVc2VyKHRoaXMubmV3VXNlcilcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gJ09LJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXV0aCcsIHsndHlwZSc6ICdsb2dpbid9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhID09PSAnVXNlciBhbHJlYWR5IGV4aXN0cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy51c2VyQWxyZWFkeUV4aXN0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmZvcm1Kb2luKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdVc2VyKTsqL1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9naW5Vc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25Jbih0aGlzLnVzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJldmlvdXNTdGF0ZSA9ICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeVskcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkubGVuZ3RoIC0gMl0gfHwgJ2hvbWUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwcmV2aW91c1N0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKHByZXZpb3VzU3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLmxvZ2luT3JQYXNzd29yZEluY29ycmVjdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdhdXRoU2VydmljZScsIGF1dGhTZXJ2aWNlKTtcclxuXHJcbiAgICBhdXRoU2VydmljZS4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYXV0aFNlcnZpY2UoJHJvb3RTY29wZSwgJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgLy90b2RvIGVycm9yc1xyXG4gICAgICAgIGZ1bmN0aW9uIFVzZXIoYmFja2VuZEFwaSkge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZW5kQXBpID0gYmFja2VuZEFwaTtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZXNvbHZlID0gKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEudG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuc2F2ZVRva2VuKHJlc3BvbnNlLmRhdGEudG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ09LJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZWplY3RlZCA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSA9PT0gJ1VzZXIgYWxyZWFkeSBleGlzdHMnIHx8IHJlc3BvbnNlLmRhdGEgPT09ICdMb2dpbiBvciBwYXNzd29yZCBpbmNvcnJlY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2Rpc3BsYXlFcnJvcicsIHtzaG93OiB0cnVlfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlciA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0b2tlbiA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2F2ZVRva2VuKF90b2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSBfdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zyh0b2tlbilcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBnZXRUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZGVsZXRlVG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZVRva2VuOiBzYXZlVG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0VG9rZW46IGdldFRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZVRva2VuOiBkZWxldGVUb2tlblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5zaWduSW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVkZW50aWFscyA9IGNyZWRlbnRpYWxzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuX2NyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25PdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLmRlbGV0ZVRva2VuKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuZ2V0TG9nSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6IHRoaXMuX2NyZWRlbnRpYWxzLFxyXG4gICAgICAgICAgICAgICAgdG9rZW46IHRoaXMuX3Rva2VuS2VlcGVyLmdldFRva2VuKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgVXNlcihiYWNrZW5kUGF0aHNDb25zdGFudC5hdXRoKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0Jvb2tpbmdDb250cm9sbGVyJywgQm9va2luZ0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEJvb2tpbmdDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzdGF0ZVBhcmFtcycsICdyZXNvcnRTZXJ2aWNlJywgJyRzdGF0ZScsICckcm9vdFNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQm9va2luZ0NvbnRyb2xsZXIoJHN0YXRlUGFyYW1zLCByZXNvcnRTZXJ2aWNlLCAkc3RhdGUsICRyb290U2NvcGUpIHtcclxuICAgICAgICB0aGlzLmhvdGVsID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygkc3RhdGUpO1xyXG5cclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7XHJcbiAgICAgICAgICAgICAgICBwcm9wOiAnX2lkJyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAkc3RhdGVQYXJhbXMuaG90ZWxJZH0pXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3RlbCA9IHJlc3BvbnNlWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy90aGlzLmhvdGVsID0gJHN0YXRlUGFyYW1zLmhvdGVsO1xyXG5cclxuICAgICAgICB0aGlzLmdldEhvdGVsSW1hZ2VzQ291bnQgPSBmdW5jdGlvbihjb3VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEFycmF5KGNvdW50IC0gMSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuSW1hZ2UgPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICAgICAgbGV0IGltZ1NyYyA9ICRldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgaWYgKGltZ1NyYykge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCb29raW5nRm9ybUNvbnRyb2xsZXInLCBCb29raW5nRm9ybUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEJvb2tpbmdGb3JtQ29udHJvbGxlci4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICckc2NvcGUnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdGb3JtQ29udHJvbGxlcigkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsICRzY29wZSwgJGxvZykge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB0aGlzLnNob3dGb3JtID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5mb3JtID0ge1xyXG4gICAgICAgICAgICBkYXRlOiAncGljayBkYXRlJyxcclxuICAgICAgICAgICAgZ3Vlc3RzOiAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gNSA/IHRoaXMuZm9ybS5ndWVzdHMrKyA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZUd1ZXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcm0uZ3Vlc3RzICE9PSAxID8gdGhpcy5mb3JtLmd1ZXN0cy0tIDogdGhpcy5mb3JtLmd1ZXN0c1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc3VibWl0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmJvb2tpbmcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmZvcm1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvd0Zvcm0gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXI6ICdZb3VyIHJlcXVlc3QgaXMgaW4gcHJvY2Vzcy4nLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdXZSB3aWxsIHNlbmQgeW91IGVtYWlsIHdpdGggYWxsIGluZm9ybWF0aW9uIGFib3V0IHlvdXIgdHJhdmVsLidcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKCdDYW50IHBvc3QgL2Jvb2tpbmcnKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdkaXNwbGF5RXJyb3InLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnU2VydmVyIGlzIG5vdCByZXNwb25kaW5nLiBUcnkgYWdhaW4gb3IgY2FsbCBob3RsaW5lOiArMCAxMjMgNDU2IDg5J1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICB9LCAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2RhdGVQaWNrZXInLCBkYXRlUGlja2VyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlKCRpbnRlcnZhbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcclxuICAgICAgICAgICAgLypzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbDogJz0nXHJcbiAgICAgICAgICAgIH0sKi9cclxuICAgICAgICAgICAgbGluazogZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBkYXRlUGlja2VyRGlyZWN0aXZlTGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgLy90b2RvIGFsbFxyXG4gICAgICAgICAgICAkKCdbZGF0ZS1waWNrZXJdJykuZGF0ZVJhbmdlUGlja2VyKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlOiBuZXcgRGF0ZSgpLnNldEZ1bGxZZWFyKG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSArIDEpLFxyXG4gICAgICAgICAgICAgICAgfSkuYmluZCgnZGF0ZXBpY2tlci1maXJzdC1kYXRlLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZlbnQsIG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gZmlyc3QgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmaXJzdC1kYXRlLXNlbGVjdGVkJyxvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9iaiB3aWxsIGJlIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMTogKERhdGUgb2JqZWN0IG9mIHRoZSBlYXJsaWVyIGRhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNoYW5nZScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBzZWNvbmQgZGF0ZSBpcyBzZWxlY3RlZCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2UnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kc2V0Vmlld1ZhbHVlKG9iai52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUyOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGxhdGVyIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vXHQgXHR2YWx1ZTogXCIyMDEzLTA2LTA1IHRvIDIwMTMtMDYtMDdcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1hcHBseScsZnVuY3Rpb24oZXZlbnQsb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB1c2VyIGNsaWNrcyBvbiB0aGUgYXBwbHkgYnV0dG9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcGx5JyxvYmopO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWNsb3NlZCcsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYWZ0ZXIgZGF0ZSByYW5nZSBwaWNrZXIgY2xvc2UgYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbicsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYmVmb3JlIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItb3BlbmVkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBvcGVuIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciBvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1hcCcsIGFodGxNYXBEaXJlY3RpdmUpO1xuXG4gICAgYWh0bE1hcERpcmVjdGl2ZS4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJ107XG5cbiAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlKHJlc29ydFNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJkZXN0aW5hdGlvbnNfX21hcFwiPjwvZGl2PicsXG4gICAgICAgICAgICBsaW5rOiBhaHRsTWFwRGlyZWN0aXZlTGlua1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICAgICAgbGV0IGhvdGVscyA9IG51bGw7XG5cbiAgICAgICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBob3RlbHMgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICBjcmVhdGVNYXAoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyZsYW5ndWFnZT1lbic7XG4gICAgICAgICAgICAgICAgbWFwU2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2F0aW9ucyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMucHVzaChbaG90ZWxzW2ldLm5hbWUsIGhvdGVsc1tpXS5fZ21hcHMubGF0LCBob3RlbHNbaV0uX2dtYXBzLmxuZ10pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG15TGF0TG5nID0ge2xhdDogLTI1LjM2MywgbG5nOiAxMzEuMDQ0fTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2JqZWN0IGFuZCBzcGVjaWZ5IHRoZSBET00gZWxlbWVudCBmb3IgZGlzcGxheS5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZGVzdGluYXRpb25zX19tYXAnKVswXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBpY29ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFob3RlbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBsb2NhdGlvbnNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcih0aGlzLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKmNlbnRlcmluZyovXG4gICAgICAgICAgICAgICAgICAgIGxldCBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYXRpb25zW2ldWzFdLCBsb2NhdGlvbnNbaV1bMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHt9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuYWxpZ24uaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5RGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlTGluaygkc2NvcGUpIHtcclxuICAgICAgICAgICAgbGV0IGltYWdlc0luR2FsbGVyeSA9IDIwO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyMDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nID0gJCgnPGRpdiBjbGFzcz1cIml0ZW1cIj48aW1nIHNyYz1cImFzc2V0cy9pbWFnZXMvZ2FsbGVyeS9wcmV2aWV3JyArIChpICsgMSkgKyAnLmpwZ1wiIHdpZHRoPVwiMzAwXCI+PC9kaXY+JylcclxuICAgICAgICAgICAgICAgIGltZy5maW5kKCdpbWcnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignbG9hZCcsIGltYWdlTG9hZGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCBpbWFnZUNsaWNrZWQuYmluZChudWxsLCBpKSk7XHJcbiAgICAgICAgICAgICAgICAkKCdbZ2FsbGVyeS1jb250YWluZXJdJykuYXBwZW5kKGltZyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZXNMb2FkZWQgPSAwO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbWFnZUxvYWRlZCgpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlc0xvYWRlZCsrO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWFnZXNMb2FkZWQgPT09IGltYWdlc0luR2FsbGVyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcImllOFwiKSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBhbGlnbkltYWdlcygpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGltYWdlQ2xpY2tlZChpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvZ2FsbGVyeS8nICsgKytpbWFnZSArICcuanBnJztcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlU3JjXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYWxpZ25JbWFnZXMoKXtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtYXNvbnJ5ID0gbmV3IE1hc29ucnkoY29udGFpbmVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uV2lkdGg6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGd1dHRlcjogJy5ndXR0ZXItc2l6ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogJzAuMnMnLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWFzb25yeS5vbignbGF5b3V0Q29tcGxldGUnLCBvbkxheW91dENvbXBsZXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtYXNvbnJ5LmxheW91dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTGF5b3V0Q29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJChjb250YWluZXIpLmNzcygnb3BhY2l0eScsICcxJyksIDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuXHJcbi8qXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJyR0aW1lb3V0JywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ3ByZWxvYWRTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCAkdGltZW91dCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIHByZWxvYWRTZXJ2aWNlKSB7IC8vdG9kbyBub3Qgb25seSBsb2FkIGJ1dCBsaXN0U3JjIHRvbyBhY2NlcHRcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dGaXJzdCcsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd05leHQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS50ZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsSW1hZ2VzU3JjID0gW10sXHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9ICRzY29wZS5zaG93Rmlyc3RJbWdDb3VudCxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQgPSAkc2NvcGUuc2hvd05leHRJbWdDb3VudDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gTWF0aC5taW4oc2hvd0ZpcnN0SW1nQ291bnQgKyBzaG93TmV4dEltZ0NvdW50LCBhbGxJbWFnZXNTcmMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBbGxJbWFnZXNMb2FkZWQgPSB0aGlzLnNob3dGaXJzdCA+PSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8hKiR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50LCAwKTsqIS9cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsSW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvd0ZpcnN0KSA/IHRoaXMuc2hvd0ZpcnN0Lmxlbmd0aCA9PT0gdGhpcy5pbWFnZXNDb3VudDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuZ2FsbGVyeSBpbWcnKS5sZW5ndGggPCBzaG93Rmlyc3RJbWdDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvb3BzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQodGhpcy5hbGlnbkltYWdlcywgMClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGlnbkltYWdlcygpO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNDb3VudCA9IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5TGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbS5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdTcmMgPSBldmVudC50YXJnZXQuc3JjO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1nU3JjXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAvISogdmFyICRpbWFnZXMgPSAkKCcuZ2FsbGVyeSBpbWcnKTtcclxuICAgICAgICAgICAgdmFyIGxvYWRlZF9pbWFnZXNfY291bnQgPSAwOyohL1xyXG4gICAgICAgICAgICAvISokc2NvcGUuYWxpZ25JbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRpbWFnZXMubG9hZChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRfaW1hZ2VzX2NvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkZWRfaW1hZ2VzX2NvdW50ID09ICRpbWFnZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRJbWFnZUFsaWdtZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50LCAwKTsgLy8gdG9kb1xyXG4gICAgICAgICAgICB9OyohL1xyXG5cclxuICAgICAgICAgICAgLy8kc2NvcGUuYWxpZ25JbWFnZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoY2IpIHtcclxuICAgICAgICAgICAgY2IocHJlbG9hZFNlcnZpY2UuZ2V0UHJlbG9hZENhY2hlKCdnYWxsZXJ5JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3NldEltYWdlQWxpZ21lbnQoKSB7IC8vdG9kbyBhcmd1bWVudHMgbmFtaW5nLCBlcnJvcnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZ3VyZXMgPSAkKCcuZ2FsbGVyeV9fZmlndXJlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FsbGVyeVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jbG9zZXN0KCcuZ2FsbGVyeScpLmNzcygnd2lkdGgnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY3NzKCd3aWR0aCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY29sdW1uc0NvdW50ID0gTWF0aC5yb3VuZChnYWxsZXJ5V2lkdGggLyBpbWFnZVdpZHRoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0ID0gbmV3IEFycmF5KGNvbHVtbnNDb3VudCArIDEpLmpvaW4oJzAnKS5zcGxpdCgnJykubWFwKCgpID0+IHtyZXR1cm4gMH0pLCAvL3RvZG8gZGVsIGpvaW4tc3BsaXRcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodCA9IGNvbHVtbnNIZWlnaHQuc2xpY2UoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgJChmaWd1cmVzKS5jc3MoJ21hcmdpbi10b3AnLCAnMCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChmaWd1cmVzLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnbWFyZ2luLXRvcCcsIC0oTWF0aC5tYXguYXBwbHkobnVsbCwgY29sdW1uc0hlaWdodCkgLSBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdKSArICdweCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSkgKyBjb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uUG9pbnRlciA9PT0gY29sdW1uc0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zSGVpZ2h0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zSGVpZ2h0W2ldICs9IGN1cnJlbnRDb2x1bW5zSGVpZ2h0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlcisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuLyEqICAgICAgICAuY29udHJvbGxlcignR2FsbGVyeUNvbnRyb2xsZXInLCBHYWxsZXJ5Q29udHJvbGxlcik7XHJcblxyXG4gICAgR2FsbGVyeUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGltYWdlc1NyYyA9IF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhpbWFnZXNTcmMpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50LmdhbGxlcnksXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdFUlJPUic7IC8vdG9kb1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsqIS9cclxuXHJcbi8hKlxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3Q6IFwiPWFodGxHYWxsZXJ5U2hvd0ZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG93QWZ0ZXI6IFwiPWFodGxHYWxsZXJ5U2hvd0FmdGVyXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigpe31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hID0gMTM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5hKTtcclxuICAgICAgICAgICAgLyEqdmFyIGFsbEltYWdlc1NyYztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5zaG93Rmlyc3RJbWFnZXNTcmMgPSBbJzEyMyddO1xyXG5cclxuICAgICAgICAgICAgX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3RvZG9cclxuICAgICAgICAgICAgICAgIGFsbEltYWdlc1NyYyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KSohL1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyohL1xyXG4qL1xyXG5cclxuXHJcblxyXG4vKjJcclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxHYWxsZXJ5RGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHt9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuYWxpZ24uaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5RGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbWdzID0gbmV3IEFycmF5KDIwKTtcclxuICAgICAgICAgICAgdGhpcy5pbWdzTG9hZGVkID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9wZW5JbWFnZSA9IGZ1bmN0aW9uKGltYWdlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvZ2FsbGVyeS8nICsgaW1hZ2VOYW1lICsgJy5qcGcnO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICBzcmM6IGltYWdlU3JjXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdhaHRsR2FsbGVyeTpsb2FkZWQnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCQoZWxlbSkuZmluZCgnaW1nJykpO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbignYWh0bEdhbGxlcnk6bG9hZGVkJywgYWxpZ25JbWFnZXMpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYWxpZ25JbWFnZXMoKXtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWFzb25yeSA9IG5ldyBNYXNvbnJ5KGNvbnRhaW5lciwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5XaWR0aDogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBndXR0ZXI6ICcuZ3V0dGVyLXNpemVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiAnMC4ycycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hc29ucnkub24oJ2xheW91dENvbXBsZXRlJywgb25MYXlvdXRDb21wbGV0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hc29ucnkubGF5b3V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTGF5b3V0Q29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQoY29udGFpbmVyKS5jc3MoJ29wYWNpdHknLCAnMScpLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXInLCBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcik7XHJcblxyXG4gICAgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICdndWVzdGNvbW1lbnRzU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKCRyb290U2NvcGUsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy53cml0ZUNvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJGxvZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLmdldEd1ZXN0Q29tbWVudHMoKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRDb21tZW50c0Vycm9yID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlXHJcbiAgICAgICAgICAgICAgICAuc2VuZENvbW1lbnQodGhpcy5mb3JtRGF0YSlcclxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkQ29tbWVudHNFcnJvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cy5wdXNoKHsnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZSwgJ2NvbW1lbnQnOiB0aGlzLmZvcm1EYXRhLmNvbW1lbnR9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGF0YSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3JldmVyc2UnLCByZXZlcnNlKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXZlcnNlKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbXMuc2xpY2UoKS5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnLCBndWVzdGNvbW1lbnRzU2VydmljZSk7XHJcblxyXG4gICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBndWVzdGNvbW1lbnRzU2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsIGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0R3Vlc3RDb21tZW50czogZ2V0R3Vlc3RDb21tZW50cyxcclxuICAgICAgICAgICAgc2VuZENvbW1lbnQ6IHNlbmRDb21tZW50XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0R3Vlc3RDb21tZW50cyh0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZ2V0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KCkge1xyXG4gICAgICAgICAgICAkbG9nLmVycm9yKGBDYW50IGdldCAke2JhY2tlbmRQYXRoc0NvbnN0YW50LmhvdGVsc31gKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkaXNwbGF5RXJyb3InLCB7c2hvdzogdHJ1ZX0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kQ29tbWVudChjb21tZW50KSB7XHJcbiAgICAgICAgICAgIGxldCB1c2VyID0gYXV0aFNlcnZpY2UuZ2V0TG9nSW5mbygpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ndWVzdGNvbW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyOiB1c2VyLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQ6IGNvbW1lbnRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdCgpIHtcclxuICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoYENhbnQgZ2V0ICR7YmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzfWApO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkaXNwbGF5RXJyb3InLCB7c2hvdzogdHJ1ZX0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIZWFkZXJBdXRoQ29udHJvbGxlcicsIEhlYWRlckF1dGhDb250cm9sbGVyKTtcclxuXHJcbiAgICBIZWFkZXJBdXRoQ29udHJvbGxlci4kaW5qZWN0ID0gWydhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhlYWRlckF1dGhDb250cm9sbGVyKGF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5zaWduT3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduT3V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsSGVhZGVyJywgYWh0bEhlYWRlcik7XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxIZWFkZXIoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBQycsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hlYWRlci9oZWFkZXIuaHRtbCdcclxuXHRcdH07XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuc2VydmljZSgnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJywgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKTtcclxuXHJcblx0SGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRsb2cnXTtcclxuXHJcblx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCR0aW1lb3V0LCAkbG9nKSB7XHJcblx0XHRmdW5jdGlvbiBVSXRyYW5zaXRpb25zKGNvbnRhaW5lcikge1xyXG5cdFx0XHRpZiAoISQoY29udGFpbmVyKS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQgJyR7Y29udGFpbmVyfScgbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0dGhpcy5fY29udGFpbmVyID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIgPSAkKGNvbnRhaW5lcik7XHJcblx0XHR9XHJcblxyXG5cdFx0VUl0cmFuc2l0aW9ucy5wcm90b3R5cGUuYW5pbWF0ZVRyYW5zaXRpb24gPSBmdW5jdGlvbiAodGFyZ2V0RWxlbWVudHNRdWVyeSxcclxuXHRcdFx0e2Nzc0VudW1lcmFibGVSdWxlID0gJ3dpZHRoJywgZnJvbSA9IDAsIHRvID0gJ2F1dG8nLCBkZWxheSA9IDEwMH0pIHtcclxuXHJcblx0XHRcdGlmICh0aGlzLl9jb250YWluZXIgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmNvbnRhaW5lci5tb3VzZWVudGVyKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRsZXQgdGFyZ2V0RWxlbWVudHMgPSAkKHRoaXMpLmZpbmQodGFyZ2V0RWxlbWVudHNRdWVyeSksXHJcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHRpZiAoIXRhcmdldEVsZW1lbnRzLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50KHMpICR7dGFyZ2V0RWxlbWVudHNRdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSwgdG8pO1xyXG5cdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGUgPSB0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUpO1xyXG5cdFx0XHRcdHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSwgZnJvbSk7XHJcblxyXG5cdFx0XHRcdGxldCBhbmltYXRlT3B0aW9ucyA9IHt9O1xyXG5cdFx0XHRcdGFuaW1hdGVPcHRpb25zW2Nzc0VudW1lcmFibGVSdWxlXSA9IHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdHRhcmdldEVsZW1lbnRzLmFuaW1hdGUoYW5pbWF0ZU9wdGlvbnMsIGRlbGF5KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0VUl0cmFuc2l0aW9ucy5wcm90b3R5cGUucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrID0gZnVuY3Rpb24oZWxlbWVudFRyaWdnZXJRdWVyeSwgZWxlbWVudE9uUXVlcnkpIHtcclxuXHRcdFx0aWYgKCEkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLmxlbmd0aCB8fCAhJChlbGVtZW50T25RdWVyeSkubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50KHMpICR7ZWxlbWVudFRyaWdnZXJRdWVyeX0gJHtlbGVtZW50T25RdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdCQoZWxlbWVudFRyaWdnZXJRdWVyeSkub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0JChlbGVtZW50T25RdWVyeSkuY3NzKCdoZWlnaHQnLCAnYXV0bycpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9ucyhoZWFkZXJRdWVyeSwgY29udGFpbmVyUXVlcnkpIHtcclxuXHRcdFx0VUl0cmFuc2l0aW9ucy5jYWxsKHRoaXMsIGNvbnRhaW5lclF1ZXJ5KTtcclxuXHJcblx0XHRcdGlmICghJChoZWFkZXJRdWVyeSkubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50KHMpICR7aGVhZGVyUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2hlYWRlciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2hlYWRlciA9ICQoaGVhZGVyUXVlcnkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVUl0cmFuc2l0aW9ucy5wcm90b3R5cGUpO1xyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpeEhlYWRlckVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudEZpeFF1ZXJ5LCBmaXhDbGFzc05hbWUsIHVuZml4Q2xhc3NOYW1lLCBvcHRpb25zKSB7XHJcblx0XHRcdGlmICh0aGlzLl9oZWFkZXIgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCBzZWxmID0gdGhpcztcclxuXHRcdFx0bGV0IGZpeEVsZW1lbnQgPSAkKGVsZW1lbnRGaXhRdWVyeSk7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBvbldpZHRoQ2hhbmdlSGFuZGxlcigpIHtcclxuXHRcdFx0XHRsZXQgdGltZXI7XHJcblxyXG5cdFx0XHRcdGZ1bmN0aW9uIGZpeFVuZml4TWVudU9uU2Nyb2xsKCkge1xyXG5cdFx0XHRcdFx0aWYgKCQod2luZG93KS5zY3JvbGxUb3AoKSA+IG9wdGlvbnMub25NaW5TY3JvbGx0b3ApIHtcclxuXHRcdFx0XHRcdFx0Zml4RWxlbWVudC5hZGRDbGFzcyhmaXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Zml4RWxlbWVudC5yZW1vdmVDbGFzcyhmaXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHRpbWVyID0gbnVsbDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8ICQod2luZG93KS5pbm5lcldpZHRoKCk7XHJcblxyXG5cdFx0XHRcdGlmICh3aWR0aCA8IG9wdGlvbnMub25NYXhXaW5kb3dXaWR0aCkge1xyXG5cdFx0XHRcdFx0Zml4VW5maXhNZW51T25TY3JvbGwoKTtcclxuXHRcdFx0XHRcdHNlbGYuX2hlYWRlci5hZGRDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblxyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLm9mZignc2Nyb2xsJyk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCF0aW1lcikge1xyXG5cdFx0XHRcdFx0XHRcdHRpbWVyID0gJHRpbWVvdXQoZml4VW5maXhNZW51T25TY3JvbGwsIDE1MCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIucmVtb3ZlQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0Zml4RWxlbWVudC5yZW1vdmVDbGFzcyhmaXhDbGFzc05hbWUpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLm9mZignc2Nyb2xsJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRvbldpZHRoQ2hhbmdlSGFuZGxlcigpO1xyXG5cdFx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzXHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBIZWFkZXJUcmFuc2l0aW9ucztcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxTdGlreUhlYWRlcicsYWh0bFN0aWt5SGVhZGVyKTtcclxuXHJcblx0YWh0bFN0aWt5SGVhZGVyLiRpbmplY3QgPSBbJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZSddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU3Rpa3lIZWFkZXIoSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0EnLFxyXG5cdFx0XHRzY29wZToge30sXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluaygpIHtcclxuXHRcdFx0bGV0IGhlYWRlciA9IG5ldyBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJ1tkYXRhLWhlYWRlcl0nLCAnW2RhdGEtaGVhZGVyLWl0ZW1dJyk7XHJcblxyXG5cdFx0XHRoZWFkZXIuYW5pbWF0ZVRyYW5zaXRpb24oXHJcblx0XHRcdFx0J1tkYXRhLWhlYWRlci1zdWJuYXZdJywge1xyXG5cdFx0XHRcdFx0Y3NzRW51bWVyYWJsZVJ1bGU6ICdoZWlnaHQnLFxyXG5cdFx0XHRcdFx0ZGVsYXk6IDMwMH0pXHJcblx0XHRcdFx0LnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayhcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LXRyaWdnZXJdJyxcclxuXHRcdFx0XHRcdCdbZGF0YS1hdXRvaGVpZ2h0LW9uXScpXHJcblx0XHRcdFx0LmZpeEhlYWRlckVsZW1lbnQoXHJcblx0XHRcdFx0XHQnLm5hdicsXHJcblx0XHRcdFx0XHQnanNfbmF2LS1maXhlZCcsXHJcblx0XHRcdFx0XHQnanNfbC1oZWFkZXItLXJlbGF0aXZlJywge1xyXG5cdFx0XHRcdFx0XHRvbk1pblNjcm9sbHRvcDogODgsXHJcblx0XHRcdFx0XHRcdG9uTWF4V2luZG93V2lkdGg6IDg1MH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgSG9tZUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEhvbWVDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcihyZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe3Byb3A6ICdfdHJlbmQnLCB2YWx1ZTogdHJ1ZX0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxNb2RhbCcsIGFodGxNb2RhbERpcmVjdGl2ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgbGluazogYWh0bE1vZGFsRGlyZWN0aXZlTGluayxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvbW9kYWwvbW9kYWwuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbignbW9kYWxPcGVuJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdpbWFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3JjID0gZGF0YS5zcmM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3cuaW1nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICdtYXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3cubWFwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmdvb2dsZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5nb29nbGUgJiYgJ21hcHMnIGluIHdpbmRvdy5nb29nbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFwU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cmbGFuZ3VhZ2U9ZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBTY3JpcHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy50ZXh0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5oZWFkZXIgPSBkYXRhLmhlYWRlcjtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5tZXNzYWdlID0gZGF0YS5tZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbXlMYXRsbmcgPSB7bGF0OiBkYXRhLmNvb3JkLmxhdCwgbG5nOiBkYXRhLmNvb3JkLmxuZ307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUlkOiAncm9hZG1hcCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbXlMYXRsbmdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbXlMYXRsbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKHRoaXMuZ2V0UG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlRGlhbG9nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdyA9IHt9O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcChuYW1lLCBjb29yZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2F0aW9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBbbmFtZSwgY29vcmQubGF0LCBjb29yZC5sbmddXHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxyXG4gICAgICAgICAgICAgICAgbGV0IG1vZGFsTWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbF9fbWFwJylbMF0sIHtcclxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtsYXQ6IGNvb3JkLmxhdCwgbG5nOiBjb29yZC5sbmd9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiA5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaWNvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246ICdhc3NldHMvaW1hZ2VzL2ljb25fbWFwLnBuZydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3JkLmxhdCwgY29vcmQubG5nKSxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbi8qXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1vZGFsTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyEqY2VudGVyaW5nKiEvXHJcbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcyAoKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIExhdExhbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nIChsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChMYXRMYW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGFsTWFwLmZpdEJvdW5kcyhib3VuZHMpOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2FjdGl2aXRpZXNGaWx0ZXInLCBhY3Rpdml0aWVzRmlsdGVyKTtcclxuXHJcbiAgICBhY3Rpdml0aWVzRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhY3Rpdml0aWVzRmlsdGVyKCRsb2csIGZpbHRlcnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhcmcsIF9zdHJpbmdMZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHN0cmluZ0xlbmd0aCA9IHBhcnNlSW50KF9zdHJpbmdMZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHN0cmluZ0xlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybihgQ2FuJ3QgcGFyc2UgYXJndW1lbnQ6ICR7X3N0cmluZ0xlbmd0aH1gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcmdcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGFyZy5qb2luKCcsICcpLnNsaWNlKDAsIHN0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnNsaWNlKDAsIHJlc3VsdC5sYXN0SW5kZXhPZignLCcpKSArICcuLi4nXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdSZXNvcnRDb250cm9sbGVyJywgUmVzb3J0Q29udHJvbGxlcik7XHJcblxyXG4gICAgUmVzb3J0Q29udHJvbGxlci4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJywgJyRmaWx0ZXInLCAnJHNjb3BlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFJlc29ydENvbnRyb2xsZXIocmVzb3J0U2VydmljZSwgJGZpbHRlciwgJHNjb3BlLCAkc3RhdGUpIHtcclxuICAgICAgICBsZXQgY3VycmVudEZpbHRlcnMgPSAkc3RhdGUuJGN1cnJlbnQuZGF0YS5jdXJyZW50RmlsdGVyczsgLy8gdGVtcFxyXG5cclxuICAgICAgICB0aGlzLmZpbHRlcnMgPSAkZmlsdGVyKCdob3RlbEZpbHRlcicpLmluaXRGaWx0ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMub25GaWx0ZXJDaGFuZ2UgPSBmdW5jdGlvbihmaWx0ZXJHcm91cCwgZmlsdGVyLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0gPSBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0gfHwgW107XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0ucHVzaChmaWx0ZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdLnNwbGljZShjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uaW5kZXhPZihmaWx0ZXIpLCAxKTtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuYXBwbHlGaWx0ZXJzKGhvdGVscywgY3VycmVudEZpbHRlcnMpO1xyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgaG90ZWxzID0ge307XHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSBob3RlbHM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoKFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5maWx0ZXJzLnByaWNlLFxyXG4gICAgICAgICAgICAgICAgKG5ld1ZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEZpbHRlcnMucHJpY2UgPSBbbmV3VmFsdWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY3VycmVudEZpbHRlcnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvdGVscyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuYXBwbHlGaWx0ZXJzKGhvdGVscywgY3VycmVudEZpbHRlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7ICAgICAgICAgICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgdGhpcy5nZXRTaG93SG90ZWxDb3VudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub3Blbk1hcCA9IGZ1bmN0aW9uKGhvdGVsTmFtZSwgaG90ZWxDb29yZCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHNob3c6ICdtYXAnLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogaG90ZWxOYW1lLFxyXG4gICAgICAgICAgICAgICAgY29vcmQ6IGhvdGVsQ29vcmRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIGRhdGEpXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdob3RlbEZpbHRlcicsIGhvdGVsRmlsdGVyKTtcclxuXHJcbiAgICBob3RlbEZpbHRlci4kaW5qZWN0ID0gWyckbG9nJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gaG90ZWxGaWx0ZXIoJGxvZywgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICBsZXQgc2F2ZWRGaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxvYWRGaWx0ZXJzOiBsb2FkRmlsdGVycyxcclxuICAgICAgICAgICAgYXBwbHlGaWx0ZXJzOiBhcHBseUZpbHRlcnMsXHJcbiAgICAgICAgICAgIGluaXRGaWx0ZXJzOiBpbml0RmlsdGVyc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRGaWx0ZXJzKCkge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRGaWx0ZXJzKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzYXZlZEZpbHRlcnMpO1xyXG4gICAgICAgICAgICBsZXQgZmlsdGVycyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJzW2tleV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSA9IHNhdmVkRmlsdGVyc1trZXldICYmIHNhdmVkRmlsdGVyc1trZXldLmluZGV4T2YoaG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXSkgIT09IC0xID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZpbHRlcnMucHJpY2UgPSB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDEwMDBcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseUZpbHRlcnMoaG90ZWxzLCBmaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgIHNhdmVkRmlsdGVycyA9IGZpbHRlcnM7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaG90ZWxzLCBmdW5jdGlvbihob3RlbCkge1xyXG4gICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMoaG90ZWwsIGZpbHRlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZmlsdGVycywgZnVuY3Rpb24oZmlsdGVyc0luR3JvdXAsIGZpbHRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXZlcnNlRmlsdGVyTWF0Y2hpbmcgPSBmYWxzZTsgLy8gZm9yIGFjdGl2aXRpZXMgYW5kIG11c3RoYXZlcyBncm91cHNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckdyb3VwID09PSAnZ3Vlc3RzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzSW5Hcm91cCA9IFtmaWx0ZXJzSW5Hcm91cFtmaWx0ZXJzSW5Hcm91cC5sZW5ndGggLSAxXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckdyb3VwID09PSAnbXVzdEhhdmVzJyB8fCBmaWx0ZXJHcm91cCA9PT0gJ2FjdGl2aXRpZXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VGaWx0ZXJNYXRjaGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlcnNJbkdyb3VwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmV2ZXJzZUZpbHRlck1hdGNoaW5nICYmIGdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV2ZXJzZUZpbHRlck1hdGNoaW5nICYmICFnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXJzSW5Hcm91cFtpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQXRMZWFzZU9uZUZpbHRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hBdExlYXNlT25lRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdGVsLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb2NhdGlvbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwubG9jYXRpb24uY291bnRyeSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3R5cGVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLnR5cGUgPT09IGZpbHRlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXR0aW5ncyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5lbnZpcm9ubWVudCA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ211c3RIYXZlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5kZXRhaWxzW2ZpbHRlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWN0aXZpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB+aG90ZWwuYWN0aXZpdGllcy5pbmRleE9mKGZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwucHJpY2UgPj0gZmlsdGVyLm1pbiAmJiBob3RlbC5wcmljZSA8PSBmaWx0ZXIubWF4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2d1ZXN0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5ndWVzdHMubWF4ID49ICtmaWx0ZXJbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBob3RlbHMuZmlsdGVyKChob3RlbCkgPT4gIWhvdGVsLl9oaWRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ3Njcm9sbFRvVG9wJywgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUpO1xyXG5cclxuICAgIHNjcm9sbFRvVG9wRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzY3JvbGxUb1RvcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciwgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgaWYgKDEpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAkLnRyaW0oYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZSgwLCBhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHBhcnNlSW50KGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuc2xpY2UoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5pbmRleE9mKCcsJykgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzY3JvbGwtdG8tdG9wLWNvbmZpZyBpcyBub3QgZGVmaW5lZGApO1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yIHx8ICdodG1sLCBib2R5JztcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW0pLm9uKGF0dHIuc2Nyb2xsVG9Ub3AsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYW5pbWF0ZSh7IHNjcm9sbFRvcDogaGVpZ2h0IH0sIFwic2xvd1wiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFNlYXJjaENvbnRyb2xsZXIpO1xyXG5cclxuICAgIFNlYXJjaENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlJywgJ3Jlc29ydFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzdGF0ZSwgcmVzb3J0U2VydmljZSkge1xyXG4gICAgICAgIHRoaXMucXVlcnkgPSAkc3RhdGUucGFyYW1zLnF1ZXJ5O1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMucXVlcnkpO1xyXG4gICAgICAgIHRoaXMuaG90ZWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2guY2FsbCh0aGlzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZWFyY2goKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJzZWRRdWVyeSA9ICQudHJpbSh0aGlzLnF1ZXJ5KS5yZXBsYWNlKC9cXHMrL2csICcgJykuc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuaG90ZWxzLCAoaG90ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaG90ZWwpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhvdGVsQ29udGVudCA9IGhvdGVsLm5hbWUgKyBob3RlbC5sb2NhdGlvbi5jb3VudHJ5ICtcclxuICAgICAgICAgICAgICAgICAgICBob3RlbC5sb2NhdGlvbi5yZWdpb24gKyBob3RlbC5kZXNjICsgaG90ZWwuZGVzY0xvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhob3RlbENvbnRlbnQpXHJcbiAgICAgICAgICAgICAgICAvL2ZvciAoKVxyXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoZXNDb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyc2VkUXVlcnkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcVJlZ0V4cCA9IG5ldyBSZWdFeHAocGFyc2VkUXVlcnlbaV0sICdnaScpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXNDb3VudGVyICs9IChob3RlbENvbnRlbnQubWF0Y2gocVJlZ0V4cCkgfHwgW10pLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlc0NvdW50ZXIgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2hvdGVsLl9pZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaG90ZWwuX2lkXS5tYXRjaGVzQ291bnRlciA9IG1hdGNoZXNDb3VudGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IHRoaXMuaG90ZWxzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChob3RlbCkgPT4gcmVzdWx0W2hvdGVsLl9pZF0pXHJcbiAgICAgICAgICAgICAgICAubWFwKChob3RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdGVsLl9tYXRjaGVzID0gcmVzdWx0W2hvdGVsLl9pZF0ubWF0Y2hlc0NvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFRvcDMnLCBhaHRsVG9wM0RpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bFRvcDNEaXJlY3RpdmUuJGluamVjdCA9IFsncmVzb3J0U2VydmljZScsICdob3RlbERldGFpbHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxUb3AzRGlyZWN0aXZlKHJlc29ydFNlcnZpY2UsIGhvdGVsRGV0YWlsc0NvbnN0YW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQWh0bFRvcDNDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd0b3AzJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL3RvcDMudGVtcGxhdGUuaHRtbCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsVG9wM0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWlscyA9IGhvdGVsRGV0YWlsc0NvbnN0YW50Lm11c3RIYXZlcztcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnRUeXBlID0gJGF0dHJzLmFodGxUb3AzdHlwZTtcclxuICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRJbWdTcmMgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvaW1hZ2VzLycgKyB0aGlzLnJlc29ydFR5cGUgKyAnLycgKyB0aGlzLnJlc29ydFtpbmRleF0uaW1nLmZpbGVuYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzUmVzb3J0SW5jbHVkZURldGFpbCA9IGZ1bmN0aW9uKGl0ZW0sIGRldGFpbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGFpbENsYXNzTmFtZSA9ICd0b3AzX19kZXRhaWwtY29udGFpbmVyLS0nICsgZGV0YWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZSA9ICFpdGVtLmRldGFpbHNbZGV0YWlsXSA/ICcgdG9wM19fZGV0YWlsLWNvbnRhaW5lci0taGFzbnQnIDogJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFpbENsYXNzTmFtZSArIGlzUmVzb3J0SW5jbHVkZURldGFpbENsYXNzTmFtZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe3Byb3A6ICd0eXBlJywgdmFsdWU6IHRoaXMucmVzb3J0VHlwZX0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvcnQgPSByZXNwb25zZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzb3J0VHlwZSA9PT0gJ0hvdGVsJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHRoaXMucmVzb3J0LmZpbHRlcigoaG90ZWwpID0+IGhvdGVsLl9zaG93SW5Ub3AgPT09IHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5hbmltYXRpb24oJy5zbGlkZXJfX2ltZycsIGFuaW1hdGlvbkZ1bmN0aW9uKTtcclxuXHJcblx0ZnVuY3Rpb24gYW5pbWF0aW9uRnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRiZWZvcmVBZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZSkge1xyXG5cdFx0XHRcdGxldCBzbGlkaW5nRGlyZWN0aW9uID0gZWxlbWVudC5zY29wZSgpLnNsaWRpbmdEaXJlY3Rpb247XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMScpO1xyXG5cclxuXHRcdFx0XHRpZihzbGlkaW5nRGlyZWN0aW9uID09PSAncmlnaHQnKSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJzEwMCUnfSwgNTAwLCBkb25lKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0JChlbGVtZW50KS5hbmltYXRlKHsnbGVmdCc6ICctMjAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ3otaW5kZXgnLCAnMCcpO1xyXG5cdFx0XHRcdCQoZWxlbWVudCkuY3NzKCdsZWZ0JywgJzAnKTtcclxuXHRcdFx0XHRkb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFNsaWRlcicsIGFodGxTbGlkZXIpO1xyXG5cclxuXHRhaHRsU2xpZGVyLiRpbmplY3QgPSBbJ3NsaWRlclNlcnZpY2UnLCAnJHRpbWVvdXQnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFNsaWRlcihzbGlkZXJTZXJ2aWNlLCAkdGltZW91dCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0Y29udHJvbGxlcjogYWh0bFNsaWRlckNvbnRyb2xsZXIsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmh0bWwnLFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGFodGxTbGlkZXJDb250cm9sbGVyKCRzY29wZSkge1xyXG5cdFx0XHQkc2NvcGUuc2xpZGVyID0gc2xpZGVyU2VydmljZTtcclxuXHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHRcdFx0JHNjb3BlLm5leHRTbGlkZSA9IG5leHRTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnByZXZTbGlkZSA9IHByZXZTbGlkZTtcclxuXHRcdFx0JHNjb3BlLnNldFNsaWRlID0gc2V0U2xpZGU7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBuZXh0U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAnbGVmdCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXROZXh0U2xpZGUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcHJldlNsaWRlKCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldFByZXZTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzZXRTbGlkZShpbmRleCkge1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkaW5nRGlyZWN0aW9uID0gaW5kZXggPiAkc2NvcGUuc2xpZGVyLmdldEN1cnJlbnRTbGlkZSh0cnVlKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRlci5zZXRDdXJyZW50U2xpZGUoaW5kZXgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZml4SUU4cG5nQmxhY2tCZyhlbGVtZW50KSB7XHJcblx0XHRcdCQoZWxlbWVudClcclxuXHRcdFx0XHQuY3NzKCctbXMtZmlsdGVyJywgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5ncmFkaWVudChzdGFydENvbG9yc3RyPSMwMEZGRkZGRixlbmRDb2xvcnN0cj0jMDBGRkZGRkYpJylcclxuXHRcdFx0XHQuY3NzKCdmaWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ3pvb20nLCAnMScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0pIHtcclxuXHRcdFx0bGV0IGFycm93cyA9ICQoZWxlbSkuZmluZCgnLnNsaWRlcl9fYXJyb3cnKTtcclxuXHJcblx0XHRcdGFycm93cy5jbGljayhmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMC41Jyk7XHJcblx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZyh0aGlzKTtcclxuXHJcblx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdCR0aW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdvcGFjaXR5JywgJzEnKTtcclxuXHRcdFx0XHRcdGZpeElFOHBuZ0JsYWNrQmcoJCh0aGlzKSk7XHJcblx0XHRcdFx0fSwgNTAwKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5mYWN0b3J5KCdzbGlkZXJTZXJ2aWNlJyxzbGlkZXJTZXJ2aWNlKTtcclxuXHJcblx0c2xpZGVyU2VydmljZS4kaW5qZWN0ID0gWydzbGlkZXJJbWdQYXRoQ29uc3RhbnQnXTtcclxuXHJcblx0ZnVuY3Rpb24gc2xpZGVyU2VydmljZShzbGlkZXJJbWdQYXRoQ29uc3RhbnQpIHtcclxuXHRcdGZ1bmN0aW9uIFNsaWRlcihzbGlkZXJJbWFnZUxpc3QpIHtcclxuXHRcdFx0dGhpcy5faW1hZ2VTcmNMaXN0ID0gc2xpZGVySW1hZ2VMaXN0O1xyXG5cdFx0XHR0aGlzLl9jdXJyZW50U2xpZGUgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0SW1hZ2VTcmNMaXN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW1hZ2VTcmNMaXN0O1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLmdldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChnZXRJbmRleCkge1xyXG5cdFx0XHRyZXR1cm4gZ2V0SW5kZXggPT0gdHJ1ZSA/IHRoaXMuX2N1cnJlbnRTbGlkZSA6IHRoaXMuX2ltYWdlU3JjTGlzdFt0aGlzLl9jdXJyZW50U2xpZGVdO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldEN1cnJlbnRTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZSkge1xyXG5cdFx0XHRzbGlkZSA9IHBhcnNlSW50KHNsaWRlKTtcclxuXHJcblx0XHRcdGlmIChpc05hTihzbGlkZSkgfHwgc2xpZGUgPCAwIHx8IHNsaWRlID4gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IHNsaWRlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldE5leHRTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEpID8gdGhpcy5fY3VycmVudFNsaWRlID0gMCA6IHRoaXMuX2N1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5zZXRQcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCh0aGlzLl9jdXJyZW50U2xpZGUgPT09IDApID8gdGhpcy5fY3VycmVudFNsaWRlID0gdGhpcy5faW1hZ2VTcmNMaXN0Lmxlbmd0aCAtIDEgOiB0aGlzLl9jdXJyZW50U2xpZGUtLTtcclxuXHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudFNsaWRlKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBuZXcgU2xpZGVyKHNsaWRlckltZ1BhdGhDb25zdGFudCk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ3NsaWRlckltZ1BhdGhDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjEuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjIuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjMuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjQuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjUuanBnJyxcclxuICAgICAgICAgICAgJ2Fzc2V0cy9pbWFnZXMvc2xpZGVyL3NsaWRlcjYuanBnJ1xyXG4gICAgICAgIF0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1BhZ2VzJywgUGFnZXMpO1xyXG5cclxuICAgIFBhZ2VzLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFBhZ2VzKCRzY29wZSkge1xyXG4gICAgICAgIGNvbnN0IGhvdGVsc1BlclBhZ2UgPSA1O1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93RnJvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudFBhZ2UgLSAxKSAqIGhvdGVsc1BlclBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKyt0aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd1ByZXYgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0tdGhpcy5jdXJyZW50UGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldFBhZ2UgPSBmdW5jdGlvbihwYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlICsgMTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzTGFzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFnZXNUb3RhbC5sZW5ndGggPT09IHRoaXMuY3VycmVudFBhZ2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmlzRmlyc3RQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlID09PSAxXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2hvd0hvdGVsQ291bnRDaGFuZ2VkJywgKGV2ZW50LCBzaG93SG90ZWxDb3VudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VzVG90YWwgPSBuZXcgQXJyYXkoTWF0aC5jZWlsKHNob3dIb3RlbENvdW50IC8gaG90ZWxzUGVyUGFnZSkpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ3Nob3dGcm9tJywgc2hvd0Zyb20pO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dGcm9tKCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgc3RhcnRQb3NpdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoIW1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5zbGljZShzdGFydFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsUHJpY2VTbGlkZXInLCBwcmljZVNsaWRlckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgcHJpY2VTbGlkZXJEaXJlY3RpdmUuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIG1pbjogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBtYXg6IFwiQFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdFNsaWRlcjogJz0nLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRTbGlkZXI6ICc9J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IHByaWNlU2xpZGVyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByaWNlU2xpZGVyRGlyZWN0aXZlTGluaygkc2NvcGUsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5sZWZ0U2xpZGVyKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnJpZ2h0U2xpZGVyKTtcclxuICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyLm1heCA9IDE1OyovXHJcbiAgICAgICAgICAgIGxldCByaWdodEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tcmlnaHQnKSxcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4gPSAkKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKSxcclxuICAgICAgICAgICAgICAgIHNsaWRlQXJlYVdpZHRoID0gcGFyc2VJbnQoJCgnLnNsaWRlJykuY3NzKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlUGVyU3RlcCA9ICRzY29wZS5tYXggLyAoc2xpZGVBcmVhV2lkdGggLSAyMCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubWluID0gcGFyc2VJbnQoJHNjb3BlLm1pbik7XHJcbiAgICAgICAgICAgICRzY29wZS5tYXggPSBwYXJzZUludCgkc2NvcGUubWF4KTtcclxuXHJcbiAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICByaWdodEJ0bixcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHNsaWRlQXJlYVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkpO1xyXG5cclxuICAgICAgICAgICAgaW5pdERyYWcoXHJcbiAgICAgICAgICAgICAgICBsZWZ0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChyaWdodEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCxcclxuICAgICAgICAgICAgICAgICgpID0+IDApO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdERyYWcoZHJhZ0VsZW0sIGluaXRQb3NpdGlvbiwgbWF4UG9zaXRpb24sIG1pblBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2hpZnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNlZG93bicsIGJ0bk9uTW91c2VEb3duKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBidG5Pbk1vdXNlRG93bihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0ID0gZXZlbnQucGFnZVg7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFBvc2l0aW9uID0gcGFyc2VJbnQoZHJhZ0VsZW0uY3NzKCdsZWZ0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZG9jT25Nb3VzZU1vdmUoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb25MZXNzVGhhbk1heCA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPD0gbWF4UG9zaXRpb24oKSAtIDIwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkdyYXRlclRoYW5NaW4gPSBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0ID49IG1pblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbkxlc3NUaGFuTWF4ICYmIHBvc2l0aW9uR3JhdGVyVGhhbk1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcmFnRWxlbS5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBpbml0UG9zaXRpb24gKyBldmVudC5wYWdlWCAtIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ3JpZ2h0Jywgc2xpZGVBcmVhV2lkdGggLSBpbml0UG9zaXRpb24gLSBldmVudC5wYWdlWCArIHNoaWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VVcCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIGRvY09uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnRWxlbS5vZmYoJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldFByaWNlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVtaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignZHJhZ3N0YXJ0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UHJpY2VzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdNaW4gPSB+fihwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld01heCA9IH5+KHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAqIHZhbHVlUGVyU3RlcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbChuZXdNaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbChuZXdNYXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdEJ0bi5jc3MoJ2xlZnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0QnRuLmNzcygnbGVmdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFNsaWRlcnMoYnRuLCBuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQb3N0aW9uID0gbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmNzcygnbGVmdCcsIG5ld1Bvc3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnRuLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIG5ld1Bvc3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCtuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcCA+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSAtIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKGxlZnRCdG4sIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLm9uKCdjaGFuZ2Uga2V5dXAgcGFzdGUgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlID4gJHNjb3BlLm1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VmFsdWUsJHNjb3BlLm1heCApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwIDwgcGFyc2VJbnQobGVmdEJ0bi5jc3MoJ2xlZnQnKSkgKyAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhO2wnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2xpZGVycyhyaWdodEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZW1pdCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGVmdFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1pbicpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5yaWdodFNsaWRlciA9ICQoJy5wcmljZVNsaWRlcl9faW5wdXQtLW1heCcpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyokc2NvcGUuJGJyb2FkY2FzdCgncHJpY2VTbGlkZXJQb3NpdGlvbkNoYW5nZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbjogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heDogJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKClcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxMyk7Ki9cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL3RvZG8gaWU4IGJ1ZyBmaXhcclxuICAgICAgICAgICAgICAgIGlmICgkKCdodG1sJykuaGFzQ2xhc3MoJ2llOCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyokc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLWxlZnQnKS5jc3MoJ2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuZmluZCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coK3NsaWRlQXJlYVdpZHRoIC0gK25ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCArc2xpZGVBcmVhV2lkdGggLSBwYXJzZUludChuZXdWYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxTbGlkZU9uQ2xpY2snLCBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlKCRsb2cpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgbGluazogYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgbGV0IHNsaWRlRW1pdEVsZW1lbnRzID0gJChlbGVtKS5maW5kKCdbc2xpZGUtZW1pdF0nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNsaWRlLWVtaXQgbm90IGZvdW5kYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzbGlkZUVtaXRFbGVtZW50cy5vbignY2xpY2snLCBzbGlkZUVtaXRPbkNsaWNrKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNsaWRlRW1pdE9uQ2xpY2soKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2xpZGVPbkVsZW1lbnQgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbl0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXNsaWRlRW1pdEVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnJyAmJiBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpICE9PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cud2FybihgV3JvbmcgaW5pdCB2YWx1ZSBmb3IgJ3NsaWRlLW9uJyBhdHRyaWJ1dGUsIHNob3VsZCBiZSAnJyBvciAnY2xvc2VkJy5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicpID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlVXAoJ3Nsb3cnLCBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJ2Nsb3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5zbGlkZURvd24oJ3Nsb3cnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZU9uRWxlbWVudC5hdHRyKCdzbGlkZS1vbicsICcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblNsaWRlQW5pbWF0aW9uQ29tcGxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNsaWRlVG9nZ2xlRWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1vbi10b2dnbGVdJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChzbGlkZVRvZ2dsZUVsZW1lbnRzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygkKHRoaXMpLmF0dHIoJ3NsaWRlLW9uLXRvZ2dsZScpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTtcclxuIl19
