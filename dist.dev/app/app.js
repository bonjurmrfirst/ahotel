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

            function onResolve(response) {
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
                        mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxCK2-uVyl69wn7K61NPAQDf7yH-jf3w';
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucm91dGVzLmpzIiwiYWhvdGVsLnJ1bi5qcyIsImdsb2JhbHMvYmFja2VuZFBhdGhzLmNvbnN0YW50LmpzIiwiZ2xvYmFscy9ob3RlbERldGFpbHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL3Jlc29ydC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvZGlzcGxheUVycm9yLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2Jvb2tpbmcvYm9va2luZy5mb3JtLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2RhdGVQaWNrZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZGVzdGluYXRpb25zL21hcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuZmlsdGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmF1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlclRyYW5zaXRpb25zLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc3Rpa3lIZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaG9tZS9ob21lLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9tb2RhbC9tb2RhbC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LmFjdGl2aXRpZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5ob3RlbC5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LnNjcm9sbHRvVG9wLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3NlYXJjaC9zZWFyY2guY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3RvcC90b3AzLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmFuaW1hdGlvbi5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlclBhdGguY29uc3RhbnQuanMiLCJwYXJ0aWFscy9yZXNvcnQvcGFnZXMvcGFnZXMuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3NsaWRlT25DbGljay9zbGlkZU9uQ2xpY2suZGlyZWN0aXZlLmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkcHJvdmlkZSIsImRlY29yYXRvciIsIiRkZWxlZ2F0ZSIsIiR3aW5kb3ciLCJsb2dIaXN0b3J5Iiwid2FybiIsImVyciIsImxvZyIsIm1lc3NhZ2UiLCJfbG9nV2FybiIsInB1c2giLCJhcHBseSIsIl9sb2dFcnIiLCJlcnJvciIsIm5hbWUiLCJzdGFjayIsIkVycm9yIiwic2VuZE9uVW5sb2FkIiwib25iZWZvcmV1bmxvYWQiLCJsZW5ndGgiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJzZXRSZXF1ZXN0SGVhZGVyIiwic2VuZCIsIkpTT04iLCJzdHJpbmdpZnkiLCIkaW5qZWN0IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCIkbG9jYXRpb25Qcm92aWRlciIsImh0bWw1TW9kZSIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJkYXRhIiwiY3VycmVudEZpbHRlcnMiLCJydW4iLCIkcm9vdFNjb3BlIiwiJHRpbWVvdXQiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiZnJvbVN0YXRlIiwiZnJvbVBhcmFtcyIsIiQiLCJ3aW5kb3ciLCJzY3JvbGxUb3AiLCJjb25zdGFudCIsInRvcDMiLCJhdXRoIiwiZ2FsbGVyeSIsImd1ZXN0Y29tbWVudHMiLCJob3RlbHMiLCJib29raW5nIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJGh0dHAiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsIiRxIiwiJGxvZyIsIm1vZGVsIiwiZ2V0UmVzb3J0IiwiZmlsdGVyIiwid2hlbiIsImFwcGx5RmlsdGVyIiwibWV0aG9kIiwidGhlbiIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJyZXNwb25zZSIsIiRicm9hZGNhc3QiLCJzaG93IiwicHJvcCIsInZhbHVlIiwiZGlzY291bnRNb2RlbCIsImhvdGVsIiwicm5kSG90ZWwiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJyZXN1bHQiLCJlIiwiZGlyZWN0aXZlIiwiZGlzcGxheUVycm9yRGlyZWN0aXZlIiwicmVzdHJpY3QiLCJsaW5rIiwiJHNjb3BlIiwiZWxlbSIsImRlZmF1bHRFcnJvck1zZyIsInRleHQiLCJjc3MiLCJjb250cm9sbGVyIiwiQXV0aENvbnRyb2xsZXIiLCJhdXRoU2VydmljZSIsInZhbGlkYXRpb25TdGF0dXMiLCJ1c2VyQWxyZWFkeUV4aXN0cyIsImxvZ2luT3JQYXNzd29yZEluY29ycmVjdCIsImNyZWF0ZVVzZXIiLCJuZXdVc2VyIiwiY29uc29sZSIsImdvIiwibG9naW5Vc2VyIiwic2lnbkluIiwidXNlciIsInByZXZpb3VzU3RhdGUiLCJVc2VyIiwiYmFja2VuZEFwaSIsIl9iYWNrZW5kQXBpIiwiX2NyZWRlbnRpYWxzIiwiX29uUmVzb2x2ZSIsInN0YXR1cyIsInRva2VuIiwiX3Rva2VuS2VlcGVyIiwic2F2ZVRva2VuIiwiX29uUmVqZWN0ZWQiLCJfdG9rZW4iLCJkZWJ1ZyIsImdldFRva2VuIiwiZGVsZXRlVG9rZW4iLCJwcm90b3R5cGUiLCJjcmVkZW50aWFscyIsImFjdGlvbiIsInNpZ25PdXQiLCJnZXRMb2dJbmZvIiwiQm9va2luZ0NvbnRyb2xsZXIiLCIkc3RhdGVQYXJhbXMiLCJsb2FkZWQiLCJob3RlbElkIiwiZ2V0SG90ZWxJbWFnZXNDb3VudCIsImNvdW50IiwiQXJyYXkiLCJvcGVuSW1hZ2UiLCIkZXZlbnQiLCJpbWdTcmMiLCJ0YXJnZXQiLCJzcmMiLCJCb29raW5nRm9ybUNvbnRyb2xsZXIiLCJmb3JtIiwiZGF0ZSIsImFkZEd1ZXN0IiwicmVtb3ZlR3Vlc3QiLCJzdWJtaXQiLCIkcm9vdCIsImhlYWRlciIsImRhdGVQaWNrZXJEaXJlY3RpdmUiLCIkaW50ZXJ2YWwiLCJyZXF1aXJlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCJkYXRlUmFuZ2VQaWNrZXIiLCJsYW5ndWFnZSIsInN0YXJ0RGF0ZSIsIkRhdGUiLCJlbmREYXRlIiwic2V0RnVsbFllYXIiLCJnZXRGdWxsWWVhciIsImJpbmQiLCJvYmoiLCIkc2V0Vmlld1ZhbHVlIiwiJHJlbmRlciIsIiRhcHBseSIsImFodGxNYXBEaXJlY3RpdmUiLCJ0ZW1wbGF0ZSIsImFodGxNYXBEaXJlY3RpdmVMaW5rIiwiYXR0ciIsImNyZWF0ZU1hcCIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJpIiwiX2dtYXBzIiwibGF0IiwibG5nIiwibXlMYXRMbmciLCJtYXAiLCJtYXBzIiwiTWFwIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsInNjcm9sbHdoZWVsIiwiaWNvbnMiLCJhaG90ZWwiLCJpY29uIiwibWFya2VyIiwiTWFya2VyIiwidGl0bGUiLCJwb3NpdGlvbiIsIkxhdExuZyIsImFkZExpc3RlbmVyIiwic2V0Wm9vbSIsInNldENlbnRlciIsImdldFBvc2l0aW9uIiwiYm91bmRzIiwiTGF0TG5nQm91bmRzIiwiTGF0TGFuZyIsImV4dGVuZCIsImZpdEJvdW5kcyIsImFodGxHYWxsZXJ5RGlyZWN0aXZlIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rIiwiaW1hZ2VzSW5HYWxsZXJ5IiwiaW1nIiwiZmluZCIsIm9uIiwiaW1hZ2VMb2FkZWQiLCJpbWFnZUNsaWNrZWQiLCJhcHBlbmQiLCJpbWFnZXNMb2FkZWQiLCJoYXNDbGFzcyIsImFsaWduSW1hZ2VzIiwiaW1hZ2UiLCJpbWFnZVNyYyIsImNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJtYXNvbnJ5IiwiTWFzb25yeSIsImNvbHVtbldpZHRoIiwiaXRlbVNlbGVjdG9yIiwiZ3V0dGVyIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwib25MYXlvdXRDb21wbGV0ZSIsImxheW91dCIsIkd1ZXN0Y29tbWVudHNDb250cm9sbGVyIiwiZ3Vlc3Rjb21tZW50c1NlcnZpY2UiLCJjb21tZW50cyIsIm9wZW5Gb3JtIiwic2hvd1BsZWFzZUxvZ2lNZXNzYWdlIiwid3JpdGVDb21tZW50IiwiZ2V0R3Vlc3RDb21tZW50cyIsImxvYWRDb21tZW50c0Vycm9yIiwiYWRkQ29tbWVudCIsInNlbmRDb21tZW50IiwiZm9ybURhdGEiLCJjb21tZW50IiwicmV2ZXJzZSIsIml0ZW1zIiwic2xpY2UiLCJ0eXBlIiwib25SZWplY3QiLCJIZWFkZXJBdXRoQ29udHJvbGxlciIsImFodGxIZWFkZXIiLCJzZXJ2aWNlIiwiSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlIiwiVUl0cmFuc2l0aW9ucyIsIl9jb250YWluZXIiLCJhbmltYXRlVHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwic2VsZiIsImZpeEVsZW1lbnQiLCJvbldpZHRoQ2hhbmdlSGFuZGxlciIsInRpbWVyIiwiZml4VW5maXhNZW51T25TY3JvbGwiLCJvbk1pblNjcm9sbHRvcCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJ3aWR0aCIsImlubmVyV2lkdGgiLCJvbk1heFdpbmRvd1dpZHRoIiwib2ZmIiwic2Nyb2xsIiwiYWh0bFN0aWt5SGVhZGVyIiwiSG9tZUNvbnRyb2xsZXIiLCJhaHRsTW9kYWxEaXJlY3RpdmUiLCJyZXBsYWNlIiwiYWh0bE1vZGFsRGlyZWN0aXZlTGluayIsInVuZGVmaW5lZCIsIm15TGF0bG5nIiwiY29vcmQiLCJtYXBUeXBlSWQiLCJ6b29tIiwiY2VudGVyIiwiY2xvc2VEaWFsb2ciLCJtb2RhbE1hcCIsImFjdGl2aXRpZXNGaWx0ZXIiLCJmaWx0ZXJzU2VydmljZSIsImFyZyIsIl9zdHJpbmdMZW5ndGgiLCJzdHJpbmdMZW5ndGgiLCJwYXJzZUludCIsImlzTmFOIiwiam9pbiIsImxhc3RJbmRleE9mIiwiUmVzb3J0Q29udHJvbGxlciIsIiRmaWx0ZXIiLCIkY3VycmVudCIsImZpbHRlcnMiLCJpbml0RmlsdGVycyIsIm9uRmlsdGVyQ2hhbmdlIiwiZmlsdGVyR3JvdXAiLCJzcGxpY2UiLCJpbmRleE9mIiwiYXBwbHlGaWx0ZXJzIiwiZ2V0U2hvd0hvdGVsQ291bnQiLCJyZWR1Y2UiLCJjb3VudGVyIiwiaXRlbSIsIl9oaWRlIiwiJHdhdGNoIiwibmV3VmFsdWUiLCJvcGVuTWFwIiwiaG90ZWxOYW1lIiwiaG90ZWxDb29yZCIsImhvdGVsRmlsdGVyIiwiaG90ZWxEZXRhaWxzQ29uc3RhbnQiLCJzYXZlZEZpbHRlcnMiLCJsb2FkRmlsdGVycyIsImtleSIsIm1pbiIsIm1heCIsImZvckVhY2giLCJpc0hvdGVsTWF0Y2hpbmdGaWx0ZXJzIiwiZmlsdGVyc0luR3JvdXAiLCJtYXRjaEF0TGVhc2VPbmVGaWx0ZXIiLCJyZXZlcnNlRmlsdGVyTWF0Y2hpbmciLCJnZXRIb3RlbFByb3AiLCJsb2NhdGlvbiIsImNvdW50cnkiLCJlbnZpcm9ubWVudCIsImRldGFpbHMiLCJzY3JvbGxUb1RvcERpcmVjdGl2ZSIsInNjcm9sbFRvVG9wRGlyZWN0aXZlTGluayIsInNlbGVjdG9yIiwiaGVpZ2h0IiwidHJpbSIsInNjcm9sbFRvVG9wQ29uZmlnIiwic2Nyb2xsVG9Ub3AiLCJTZWFyY2hDb250cm9sbGVyIiwicXVlcnkiLCJzZWFyY2giLCJwYXJzZWRRdWVyeSIsInNwbGl0IiwiaG90ZWxDb250ZW50IiwicmVnaW9uIiwiZGVzYyIsImRlc2NMb2NhdGlvbiIsIm1hdGNoZXNDb3VudGVyIiwicVJlZ0V4cCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2lkIiwic2VhcmNoUmVzdWx0cyIsIl9tYXRjaGVzIiwiYWh0bFRvcDNEaXJlY3RpdmUiLCJBaHRsVG9wM0NvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCIkZWxlbWVudCIsIiRhdHRycyIsInJlc29ydFR5cGUiLCJhaHRsVG9wM3R5cGUiLCJyZXNvcnQiLCJnZXRJbWdTcmMiLCJpbmRleCIsImZpbGVuYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsIiwiZGV0YWlsIiwiZGV0YWlsQ2xhc3NOYW1lIiwiaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lIiwiX3Nob3dJblRvcCIsImFuaW1hdGlvbiIsImFuaW1hdGlvbkZ1bmN0aW9uIiwiYmVmb3JlQWRkQ2xhc3MiLCJjbGFzc05hbWUiLCJkb25lIiwic2xpZGluZ0RpcmVjdGlvbiIsImFodGxTbGlkZXIiLCJzbGlkZXJTZXJ2aWNlIiwiYWh0bFNsaWRlckNvbnRyb2xsZXIiLCJzbGlkZXIiLCJuZXh0U2xpZGUiLCJwcmV2U2xpZGUiLCJzZXRTbGlkZSIsInNldE5leHRTbGlkZSIsInNldFByZXZTbGlkZSIsImdldEN1cnJlbnRTbGlkZSIsInNldEN1cnJlbnRTbGlkZSIsImZpeElFOHBuZ0JsYWNrQmciLCJhcnJvd3MiLCJjbGljayIsImRpc2FibGVkIiwic2xpZGVySW1nUGF0aENvbnN0YW50IiwiU2xpZGVyIiwic2xpZGVySW1hZ2VMaXN0IiwiX2ltYWdlU3JjTGlzdCIsIl9jdXJyZW50U2xpZGUiLCJnZXRJbWFnZVNyY0xpc3QiLCJnZXRJbmRleCIsInNsaWRlIiwiUGFnZXMiLCJob3RlbHNQZXJQYWdlIiwiY3VycmVudFBhZ2UiLCJwYWdlc1RvdGFsIiwic2hvd0Zyb20iLCJzaG93TmV4dCIsInNob3dQcmV2Iiwic2V0UGFnZSIsInBhZ2UiLCJpc0xhc3RQYWdlIiwiaXNGaXJzdFBhZ2UiLCJzaG93SG90ZWxDb3VudCIsImNlaWwiLCJzdGFydFBvc2l0aW9uIiwicHJpY2VTbGlkZXJEaXJlY3RpdmUiLCJsZWZ0U2xpZGVyIiwicmlnaHRTbGlkZXIiLCJwcmljZVNsaWRlckRpcmVjdGl2ZUxpbmsiLCJyaWdodEJ0biIsImxlZnRCdG4iLCJzbGlkZUFyZWFXaWR0aCIsInZhbHVlUGVyU3RlcCIsInZhbCIsImluaXREcmFnIiwiZHJhZ0VsZW0iLCJpbml0UG9zaXRpb24iLCJtYXhQb3NpdGlvbiIsIm1pblBvc2l0aW9uIiwic2hpZnQiLCJidG5Pbk1vdXNlRG93biIsInBhZ2VYIiwiZG9jT25Nb3VzZU1vdmUiLCJidG5Pbk1vdXNlVXAiLCJwb3NpdGlvbkxlc3NUaGFuTWF4IiwicG9zaXRpb25HcmF0ZXJUaGFuTWluIiwic2V0UHJpY2VzIiwiZW1pdCIsIm5ld01pbiIsIm5ld01heCIsInNldFNsaWRlcnMiLCJidG4iLCJuZXdQb3N0aW9uIiwidHJpZ2dlciIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUiLCJhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGluayIsInNsaWRlRW1pdEVsZW1lbnRzIiwic2xpZGVFbWl0T25DbGljayIsInNsaWRlT25FbGVtZW50Iiwic2xpZGVVcCIsIm9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSIsInNsaWRlRG93biIsInNsaWRlVG9nZ2xlRWxlbWVudHMiLCJlYWNoIiwidG9nZ2xlQ2xhc3MiXSwibWFwcGluZ3MiOiJBQUFBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBQSxRQUNLQyxPQUFPLGFBQWEsQ0FBQyxhQUFhLGFBQWE7S0FKeEQ7QUNBQTs7QUFBQSxDQUFDLFlBQVc7SUFDUjs7SUFFQUQsUUFDS0MsT0FBTyxhQUNQQyxvQkFBTyxVQUFVQyxVQUFVO1FBQ3hCQSxTQUFTQyxVQUFVLGlDQUFRLFVBQVVDLFdBQVdDLFNBQVM7WUFDckQsSUFBSUMsYUFBYTtnQkFDVEMsTUFBTTtnQkFDTkMsS0FBSzs7O1lBR2JKLFVBQVVLLE1BQU0sVUFBVUMsU0FBUzs7WUFHbkMsSUFBSUMsV0FBV1AsVUFBVUc7WUFDekJILFVBQVVHLE9BQU8sVUFBVUcsU0FBUztnQkFDaENKLFdBQVdDLEtBQUtLLEtBQUtGO2dCQUNyQkMsU0FBU0UsTUFBTSxNQUFNLENBQUNIOzs7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STRkLGVBQWUxUyxLQUFLLGdCQUFnQixNQUFNMFMsZUFBZTFTLEtBQUssZ0JBQWdCLFVBQVU7b0JBQ3hGNUcsS0FBS3RFLEtBQUw7O29CQUVBOzs7Z0JBR0osSUFBSTRkLGVBQWUxUyxLQUFLLGdCQUFnQixJQUFJO29CQUN4QzBTLGVBQWVDLFFBQVEsUUFBUUM7b0JBQy9CRixlQUFlMVMsS0FBSyxZQUFZO3VCQUM3QjtvQkFDSDRTO29CQUNBRixlQUFlRyxVQUFVO29CQUN6QkgsZUFBZTFTLEtBQUssWUFBWTs7O2dCQUdwQyxTQUFTNFMsMkJBQTJCO29CQUNoQyxJQUFJRSxzQkFBc0JoYixFQUFFa0QsTUFBTXlILEtBQUs7O29CQUV2QzNLLEVBQUVpYixLQUFLRCxxQkFBcUIsWUFBVzt3QkFDbkNoYixFQUFFLE1BQU1rYixZQUFZbGIsRUFBRSxNQUFNa0ksS0FBSzs7Ozs7O0tBdER6RCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcsIFsndWkucm91dGVyJywgJ25nQW5pbWF0ZScsICc3MjBrYi5zb2NpYWxzaGFyZSddKTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbmZpZyhmdW5jdGlvbiAoJHByb3ZpZGUpIHtcclxuICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCckbG9nJywgZnVuY3Rpb24gKCRkZWxlZ2F0ZSwgJHdpbmRvdykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvZ0hpc3RvcnkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhcm46IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnI6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUubG9nID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IF9sb2dXYXJuID0gJGRlbGVnYXRlLndhcm47XHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUud2FybiA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nSGlzdG9yeS53YXJuLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2xvZ1dhcm4uYXBwbHkobnVsbCwgW21lc3NhZ2VdKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IF9sb2dFcnIgPSAkZGVsZWdhdGUuZXJyb3I7XHJcbiAgICAgICAgICAgICAgICAkZGVsZWdhdGUuZXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3RvcnkuZXJyLnB1c2goe25hbWU6IG1lc3NhZ2UsIHN0YWNrOiBuZXcgRXJyb3IoKS5zdGFja30pO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dFcnIuYXBwbHkobnVsbCwgW21lc3NhZ2VdKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIHNlbmRPblVubG9hZCgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxvZ0hpc3RvcnkuZXJyLmxlbmd0aCAmJiAhbG9nSGlzdG9yeS53YXJuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCAnL2FwaS9sb2cnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShsb2dIaXN0b3J5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRkZWxlZ2F0ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbn0pKCk7XHJcblxyXG4vKlxyXG4gICAgICAgIC5mYWN0b3J5KCdsb2cnLCBsb2cpO1xyXG5cclxuICAgIGxvZy4kaW5qZWN0ID0gWyckd2luZG93JywgJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBsb2coJHdpbmRvdywgJGxvZykge1xyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gd2FybiguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKGFyZ3MpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJyb3dzZXJMb2cpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybihhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZXJyb3IoZSkge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IGUubmFtZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGUubWVzc2FnZSxcclxuICAgICAgICAgICAgICAgIHN0YWNrOiBlLnN0YWNrXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkbG9nLmVycm9yKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy90b2RvIGFsbCBlcnJvcnNcclxuXHJcblxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB3YXJuOiB3YXJuLFxyXG4gICAgICAgICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICAgICAgICAgIHNlbmRPblVubG9hZDogc2VuZE9uVW5sb2FkXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyovXHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmNvbmZpZyhjb25maWcpO1xyXG5cclxuXHRjb25maWcuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xyXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xyXG5cclxuXHRcdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcclxuXHJcblx0XHQkc3RhdGVQcm92aWRlclxyXG5cdFx0XHQuc3RhdGUoJ2hvbWUnLCB7XHJcblx0XHRcdFx0dXJsOiAnLycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaG9tZS9ob21lLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYXV0aCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvYXV0aCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvYXV0aC9hdXRoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeyd0eXBlJzogJ2xvZ2luJ31cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdidW5nYWxvd3MnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2J1bmdhbG93cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2J1bmdhbG93cy5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2hvdGVscycsIHtcclxuXHRcdFx0XHRcdHVybDogJy90b3AnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvdG9wL2hvdGVscy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgndmlsbGFzJywge1xyXG5cdFx0XHRcdHVybDogJy92aWxsYXMnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC92aWxsYXMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdnYWxsZXJ5Jywge1xyXG5cdFx0XHRcdHVybDogJy9nYWxsZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdndWVzdGNvbW1lbnRzJywge1xyXG5cdFx0XHRcdHVybDogJy9ndWVzdGNvbW1lbnRzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdkZXN0aW5hdGlvbnMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvZGVzdGluYXRpb25zJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2Rlc3RpbmF0aW9ucy9kZXN0aW5hdGlvbnMuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdyZXNvcnQnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3Jlc29ydCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvcmVzb3J0L3Jlc29ydC5odG1sJyxcclxuXHRcdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0XHRjdXJyZW50RmlsdGVyczoge31cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYm9va2luZycsIHtcclxuXHRcdFx0XHR1cmw6ICcvYm9va2luZz9ob3RlbElkJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuaHRtbCcsXHJcblx0XHRcdFx0cGFyYW1zOiB7J2hvdGVsSWQnOiAnaG90ZWwgSWQnfVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3NlYXJjaCcsIHtcclxuXHRcdFx0XHR1cmw6ICcvc2VhcmNoP3F1ZXJ5JyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9zZWFyY2gvc2VhcmNoLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydxdWVyeSc6ICdzZWFyY2ggcXVlcnknfVxyXG5cdFx0XHR9KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5ydW4ocnVuKTtcclxuXHJcbiAgICBydW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScgLCAnJHRpbWVvdXQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgJHRpbWVvdXQpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZU5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZVBhcmFtczogbnVsbCxcclxuICAgICAgICAgICAgc3RhdGVIaXN0b3J5OiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLCBmcm9tUGFyYW1zKXtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuY3VycmVudFN0YXRlTmFtZSA9IHRvU3RhdGUubmFtZTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kc3RhdGUuY3VycmVudFN0YXRlUGFyYW1zID0gdG9QYXJhbXM7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeS5wdXNoKHRvU3RhdGUubmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQod2luZG93KS5zY3JvbGxUb3AoMCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2JhY2tlbmRQYXRoc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0b3AzOiAnL2FwaS90b3AzJyxcclxuICAgICAgICAgICAgYXV0aDogJy9hcGkvdXNlcnMnLFxyXG4gICAgICAgICAgICBnYWxsZXJ5OiAnL2FwaS9nYWxsZXJ5JyxcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50czogJy9hcGkvZ3Vlc3Rjb21tZW50cycsXHJcbiAgICAgICAgICAgIGhvdGVsczogJy9hcGkvaG90ZWxzJyxcclxuICAgICAgICAgICAgYm9va2luZzogJy9ib29raW5nJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNvbnN0YW50KCd0ZW1wbGF0ZXNQYXRoc0NvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXBwL3BhcnRpYWxzL2F1dGgvYXV0aC5odG1sJ1xyXG4gICAgICAgIF0pXHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnaG90ZWxEZXRhaWxzQ29uc3RhbnQnLCB7XHJcbiAgICAgICAgICAgIHR5cGVzOiBbXHJcbiAgICAgICAgICAgICAgICAnSG90ZWwnLFxyXG4gICAgICAgICAgICAgICAgJ0J1bmdhbG93JyxcclxuICAgICAgICAgICAgICAgICdWaWxsYSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBbXHJcbiAgICAgICAgICAgICAgICAnQ29hc3QnLFxyXG4gICAgICAgICAgICAgICAgJ0NpdHknLFxyXG4gICAgICAgICAgICAgICAgJ0Rlc2VydCdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGxvY2F0aW9uczogW1xyXG4gICAgICAgICAgICAgICAgJ05hbWliaWEnLFxyXG4gICAgICAgICAgICAgICAgJ0xpYnlhJyxcclxuICAgICAgICAgICAgICAgICdTb3V0aCBBZnJpY2EnLFxyXG4gICAgICAgICAgICAgICAgJ1RhbnphbmlhJyxcclxuICAgICAgICAgICAgICAgICdQYXB1YSBOZXcgR3VpbmVhJyxcclxuICAgICAgICAgICAgICAgICdSZXVuaW9uJyxcclxuICAgICAgICAgICAgICAgICdTd2F6aWxhbmQnLFxyXG4gICAgICAgICAgICAgICAgJ1NhbyBUb21lJyxcclxuICAgICAgICAgICAgICAgICdNYWRhZ2FzY2FyJyxcclxuICAgICAgICAgICAgICAgICdNYXVyaXRpdXMnLFxyXG4gICAgICAgICAgICAgICAgJ1NleWNoZWxsZXMnLFxyXG4gICAgICAgICAgICAgICAgJ01heW90dGUnLFxyXG4gICAgICAgICAgICAgICAgJ1VrcmFpbmUnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBndWVzdHM6IFtcclxuICAgICAgICAgICAgICAgICcxJyxcclxuICAgICAgICAgICAgICAgICcyJyxcclxuICAgICAgICAgICAgICAgICczJyxcclxuICAgICAgICAgICAgICAgICc0JyxcclxuICAgICAgICAgICAgICAgICc1J1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgbXVzdEhhdmVzOiBbXHJcbiAgICAgICAgICAgICAgICAncmVzdGF1cmFudCcsXHJcbiAgICAgICAgICAgICAgICAna2lkcycsXHJcbiAgICAgICAgICAgICAgICAncG9vbCcsXHJcbiAgICAgICAgICAgICAgICAnc3BhJyxcclxuICAgICAgICAgICAgICAgICd3aWZpJyxcclxuICAgICAgICAgICAgICAgICdwZXQnLFxyXG4gICAgICAgICAgICAgICAgJ2Rpc2FibGUnLFxyXG4gICAgICAgICAgICAgICAgJ2JlYWNoJyxcclxuICAgICAgICAgICAgICAgICdwYXJraW5nJyxcclxuICAgICAgICAgICAgICAgICdjb25kaXRpb25pbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2xvdW5nZScsXHJcbiAgICAgICAgICAgICAgICAndGVycmFjZScsXHJcbiAgICAgICAgICAgICAgICAnZ2FyZGVuJyxcclxuICAgICAgICAgICAgICAgICdneW0nLFxyXG4gICAgICAgICAgICAgICAgJ2JpY3ljbGVzJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgYWN0aXZpdGllczogW1xyXG4gICAgICAgICAgICAgICAgJ0Nvb2tpbmcgY2xhc3NlcycsXHJcbiAgICAgICAgICAgICAgICAnQ3ljbGluZycsXHJcbiAgICAgICAgICAgICAgICAnRmlzaGluZycsXHJcbiAgICAgICAgICAgICAgICAnR29sZicsXHJcbiAgICAgICAgICAgICAgICAnSGlraW5nJyxcclxuICAgICAgICAgICAgICAgICdIb3JzZS1yaWRpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0theWFraW5nJyxcclxuICAgICAgICAgICAgICAgICdOaWdodGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1NhaWxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NjdWJhIGRpdmluZycsXHJcbiAgICAgICAgICAgICAgICAnU2hvcHBpbmcgLyBtYXJrZXRzJyxcclxuICAgICAgICAgICAgICAgICdTbm9ya2VsbGluZycsXHJcbiAgICAgICAgICAgICAgICAnU2tpaW5nJyxcclxuICAgICAgICAgICAgICAgICdTdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaWxkbGlmZScsXHJcbiAgICAgICAgICAgICAgICAnV2luZHN1cmZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmUgdGFzdGluZycsXHJcbiAgICAgICAgICAgICAgICAnWW9nYScgXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBwcmljZTogW1xyXG4gICAgICAgICAgICAgICAgXCJtaW5cIixcclxuICAgICAgICAgICAgICAgIFwibWF4XCJcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgncmVzb3J0U2VydmljZScsIHJlc29ydFNlcnZpY2UpO1xyXG5cclxuICAgIHJlc29ydFNlcnZpY2UuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnJHEnLCAnJGxvZycsICckcm9vdFNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzb3J0U2VydmljZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQsICRxLCAkbG9nLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgbGV0IG1vZGVsID0gbnVsbDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmVzb3J0KGZpbHRlcikge1xyXG4gICAgICAgICAgICAvL3RvZG8gZXJyb3JzOiBubyBob3RlbHMsIG5vIGZpbHRlci4uLlxyXG4gICAgICAgICAgICBpZiAobW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKGFwcGx5RmlsdGVyKG1vZGVsKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhcHBseUZpbHRlcihtb2RlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy5lcnJvcihgQ2FudCBnZXQgJHtiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHN9YCk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2Rpc3BsYXlFcnJvcicsIHtzaG93OiB0cnVlfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYXBwbHlGaWx0ZXIoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIucHJvcCA9PT0gJ19pZCcgJiYgZmlsdGVyLnZhbHVlID09PSAncmFuZG9tJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkaXNjb3VudE1vZGVsID0gbW9kZWwuZmlsdGVyKChob3RlbCkgPT4gaG90ZWxbJ2Rpc2NvdW50J10pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBybmRIb3RlbCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChkaXNjb3VudE1vZGVsLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbZGlzY291bnRNb2RlbFtybmRIb3RlbF1dXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1vZGVsLmZpbHRlcigoaG90ZWwpID0+IGhvdGVsW2ZpbHRlci5wcm9wXSA9PSBmaWx0ZXIudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcignQ2FudCBwYXJzZSByZXNwb25zZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZGlzcGxheUVycm9yJywge3Nob3c6IHRydWUsIG1lc3NhZ2U6ICdFcnJvciBvY2N1cnJlZCd9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0UmVzb3J0OiBnZXRSZXNvcnRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsRGlzcGxheUVycm9yJywgZGlzcGxheUVycm9yRGlyZWN0aXZlKTtcclxuXHJcbiAgICBkaXNwbGF5RXJyb3JEaXJlY3RpdmUuJGluamVjdCA9IFsnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZGlzcGxheUVycm9yRGlyZWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdEVycm9yTXNnID0gJ0NvdWxkIG5vdCBjb25uZWN0IHRvIHNlcnZlci4gUmVmcmVzaCB0aGUgcGFnZSBvciB0cnkgYWdhaW4gbGF0ZXIuJztcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdkaXNwbGF5RXJyb3InLCAoZXZlbnQsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2hvdyA9IGRhdGEuc2hvdyA/ICdibG9jaycgOiAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkudGV4dChkYXRhLm1lc3NhZ2UgfHwgZGVmYXVsdEVycm9yTXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLmNzcygnZGlzcGxheScsIHNob3cpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBBdXRoQ29udHJvbGxlcik7XHJcblxyXG4gICAgQXV0aENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckc2NvcGUnLCAnYXV0aFNlcnZpY2UnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0aENvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHNjb3BlLCBhdXRoU2VydmljZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzID0ge1xyXG4gICAgICAgICAgICB1c2VyQWxyZWFkeUV4aXN0czogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvZ2luT3JQYXNzd29yZEluY29ycmVjdDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2UuY3JlYXRlVXNlcih0aGlzLm5ld1VzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2F1dGgnLCB7J3R5cGUnOiAnbG9naW4nfSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25TdGF0dXMudXNlckFscmVhZHlFeGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmZvcm1Kb2luKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdVc2VyKTsqL1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9naW5Vc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25Jbih0aGlzLnVzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09ICdPSycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJldmlvdXNTdGF0ZSA9ICRyb290U2NvcGUuJHN0YXRlLnN0YXRlSGlzdG9yeVskcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkubGVuZ3RoIC0gMl0gfHwgJ2hvbWUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwcmV2aW91c1N0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKHByZXZpb3VzU3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLmxvZ2luT3JQYXNzd29yZEluY29ycmVjdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdhdXRoU2VydmljZScsIGF1dGhTZXJ2aWNlKTtcclxuXHJcbiAgICBhdXRoU2VydmljZS4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYXV0aFNlcnZpY2UoJHJvb3RTY29wZSwgJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50KSB7XHJcbiAgICAgICAgLy90b2RvIGVycm9yc1xyXG4gICAgICAgIGZ1bmN0aW9uIFVzZXIoYmFja2VuZEFwaSkge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZW5kQXBpID0gYmFja2VuZEFwaTtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZXNvbHZlID0gKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEudG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuc2F2ZVRva2VuKHJlc3BvbnNlLmRhdGEudG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ09LJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25SZWplY3RlZCA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9rZW4gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNhdmVUb2tlbihfdG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gX3Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcodG9rZW4pXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0VG9rZW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRlbGV0ZVRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVUb2tlbjogc2F2ZVRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIGdldFRva2VuOiBnZXRUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVUb2tlbjogZGVsZXRlVG9rZW5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbkluID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3JlZGVudGlhbHMgPSBjcmVkZW50aWFscztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogdGhpcy5fYmFja2VuZEFwaSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLl9jcmVkZW50aWFsc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25SZXNvbHZlLCB0aGlzLl9vblJlamVjdGVkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5zaWduT3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGxvZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl90b2tlbktlZXBlci5kZWxldGVUb2tlbigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLmdldExvZ0luZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB0aGlzLl9jcmVkZW50aWFscyxcclxuICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLl90b2tlbktlZXBlci5nZXRUb2tlbigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFVzZXIoYmFja2VuZFBhdGhzQ29uc3RhbnQuYXV0aCk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdCb29raW5nQ29udHJvbGxlcicsIEJvb2tpbmdDb250cm9sbGVyKTtcclxuXHJcbiAgICBCb29raW5nQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGVQYXJhbXMnLCAncmVzb3J0U2VydmljZScsICckc3RhdGUnLCAnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEJvb2tpbmdDb250cm9sbGVyKCRzdGF0ZVBhcmFtcywgcmVzb3J0U2VydmljZSwgJHN0YXRlLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgdGhpcy5ob3RlbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoe1xyXG4gICAgICAgICAgICAgICAgcHJvcDogJ19pZCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJHN0YXRlUGFyYW1zLmhvdGVsSWR9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9yID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuaG90ZWwgPSByZXNwb25zZVswXTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5ob3RlbCA9ICRzdGF0ZVBhcmFtcy5ob3RlbDtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRIb3RlbEltYWdlc0NvdW50ID0gZnVuY3Rpb24oY291bnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBcnJheShjb3VudCAtIDEpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub3BlbkltYWdlID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBpbWdTcmMgPSAkZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0Zvcm1Db250cm9sbGVyJywgQm9va2luZ0Zvcm1Db250cm9sbGVyKTtcclxuXHJcbiAgICBCb29raW5nRm9ybUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAnJHNjb3BlJywgJyRsb2cnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCb29raW5nRm9ybUNvbnRyb2xsZXIoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCAkc2NvcGUsICRsb2cpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIHRoaXMuZm9ybSA9IHtcclxuICAgICAgICAgICAgZGF0ZTogJ3BpY2sgZGF0ZScsXHJcbiAgICAgICAgICAgIGd1ZXN0czogMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR3Vlc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5ndWVzdHMgIT09IDUgPyB0aGlzLmZvcm0uZ3Vlc3RzKysgOiB0aGlzLmZvcm0uZ3Vlc3RzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVHdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmd1ZXN0cyAhPT0gMSA/IHRoaXMuZm9ybS5ndWVzdHMtLSA6IHRoaXMuZm9ybS5ndWVzdHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5ib29raW5nLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5mb3JtXHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiAnWW91ciByZXF1ZXN0IGlzIGluIHByb2Nlc3MuJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnV2Ugd2lsbCBzZW5kIHlvdSBlbWFpbCB3aXRoIGFsbCBpbmZvcm1hdGlvbiBhYm91dCB5b3VyIHRyYXZlbC4nXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy5lcnJvcignQ2FudCBwb3N0IC9ib29raW5nJyk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnZGlzcGxheUVycm9yJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1NlcnZlciBpcyBub3QgcmVzcG9uZGluZy4gVHJ5IGFnYWluIG9yIGNhbGwgaG90bGluZTogKzAgMTIzIDQ1NiA4OSdcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgfSwgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdkYXRlUGlja2VyJywgZGF0ZVBpY2tlckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gZGF0ZVBpY2tlckRpcmVjdGl2ZSgkaW50ZXJ2YWwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXHJcbiAgICAgICAgICAgIC8qc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIG5nTW9kZWw6ICc9J1xyXG4gICAgICAgICAgICB9LCovXHJcbiAgICAgICAgICAgIGxpbms6IGRhdGVQaWNrZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIC8vdG9kbyBhbGxcclxuICAgICAgICAgICAgJCgnW2RhdGUtcGlja2VyXScpLmRhdGVSYW5nZVBpY2tlcihcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogJ2VuJyxcclxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGU6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZTogbmV3IERhdGUoKS5zZXRGdWxsWWVhcihuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkgKyAxKSxcclxuICAgICAgICAgICAgICAgIH0pLmJpbmQoJ2RhdGVwaWNrZXItZmlyc3QtZGF0ZS1zZWxlY3RlZCcsIGZ1bmN0aW9uKGV2ZW50LCBvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIGZpcnN0IGRhdGUgaXMgc2VsZWN0ZWQgKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmlyc3QtZGF0ZS1zZWxlY3RlZCcsb2JqKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBvYmogd2lsbCBiZSBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTE6IChEYXRlIG9iamVjdCBvZiB0aGUgZWFybGllciBkYXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1jaGFuZ2UnLGZ1bmN0aW9uKGV2ZW50LG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gc2Vjb25kIGRhdGUgaXMgc2VsZWN0ZWQgKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hhbmdlJyxvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZShvYmoudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9iaiB3aWxsIGJlIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMTogKERhdGUgb2JqZWN0IG9mIHRoZSBlYXJsaWVyIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkYXRlMjogKERhdGUgb2JqZWN0IG9mIHRoZSBsYXRlciBkYXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAvL1x0IFx0dmFsdWU6IFwiMjAxMy0wNi0wNSB0byAyMDEzLTA2LTA3XCJcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItYXBwbHknLGZ1bmN0aW9uKGV2ZW50LG9iailcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gdXNlciBjbGlja3Mgb24gdGhlIGFwcGx5IGJ1dHRvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhcHBseScsb2JqKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1jbG9zZScsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYmVmb3JlIGRhdGUgcmFuZ2UgcGlja2VyIGNsb3NlIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiZWZvcmUgY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1jbG9zZWQnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGFmdGVyIGRhdGUgcmFuZ2UgcGlja2VyIGNsb3NlIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciBjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLW9wZW4nLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGJlZm9yZSBkYXRlIHJhbmdlIHBpY2tlciBvcGVuIGFuaW1hdGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiZWZvcmUgb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLW9wZW5lZCcsZnVuY3Rpb24oKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgYWZ0ZXIgZGF0ZSByYW5nZSBwaWNrZXIgb3BlbiBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxNYXAnLCBhaHRsTWFwRGlyZWN0aXZlKTtcblxuICAgIGFodGxNYXBEaXJlY3RpdmUuJGluamVjdCA9IFsncmVzb3J0U2VydmljZSddO1xuXG4gICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZShyZXNvcnRTZXJ2aWNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZGVzdGluYXRpb25zX19tYXBcIj48L2Rpdj4nLFxuICAgICAgICAgICAgbGluazogYWh0bE1hcERpcmVjdGl2ZUxpbmtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBhaHRsTWFwRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGF0dHIpIHtcbiAgICAgICAgICAgIGxldCBob3RlbHMgPSBudWxsO1xuXG4gICAgICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaG90ZWxzID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgY3JlYXRlTWFwKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlTWFwKCkge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZ29vZ2xlICYmICdtYXBzJyBpbiB3aW5kb3cuZ29vZ2xlKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IG1hcFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5zcmMgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCeHhDSzItdVZ5bDY5d243SzYxTlBBUURmN3lILWpmM3cnO1xuICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwU2NyaXB0KTtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2NhdGlvbnMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhvdGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zLnB1c2goW2hvdGVsc1tpXS5uYW1lLCBob3RlbHNbaV0uX2dtYXBzLmxhdCwgaG90ZWxzW2ldLl9nbWFwcy5sbmddKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxldCBteUxhdExuZyA9IHtsYXQ6IC0yNS4zNjMsIGxuZzogMTMxLjA0NH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Rlc3RpbmF0aW9uc19fbWFwJylbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbHdoZWVsOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgaWNvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhaG90ZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiAnYXNzZXRzL2ltYWdlcy9pY29uX21hcC5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbG9jYXRpb25zW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uc1tcImFob3RlbFwiXS5pY29uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKDgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIodGhpcy5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLypjZW50ZXJpbmcqL1xuICAgICAgICAgICAgICAgICAgICBsZXQgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IExhdExhbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQoTGF0TGFuZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7fSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmFsaWduLmh0bWwnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmsoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIGxldCBpbWFnZXNJbkdhbGxlcnkgPSAyMDtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjA7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltZyA9ICQoJzxkaXYgY2xhc3M9XCJpdGVtXCI+PGltZyBzcmM9XCJhc3NldHMvaW1hZ2VzL2dhbGxlcnkvcHJldmlldycgKyAoaSArIDEpICsgJy5qcGdcIiB3aWR0aD1cIjMwMFwiPjwvZGl2PicpXHJcbiAgICAgICAgICAgICAgICBpbWcuZmluZCgnaW1nJylcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2xvYWQnLCBpbWFnZUxvYWRlZClcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgaW1hZ2VDbGlja2VkLmJpbmQobnVsbCwgaSkpO1xyXG4gICAgICAgICAgICAgICAgJCgnW2dhbGxlcnktY29udGFpbmVyXScpLmFwcGVuZChpbWcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2VzTG9hZGVkID0gMDtcclxuICAgICAgICAgICAgZnVuY3Rpb24gaW1hZ2VMb2FkZWQoKSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZXNMb2FkZWQrKztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1hZ2VzTG9hZGVkID09PSBpbWFnZXNJbkdhbGxlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiggJChcImh0bWxcIikuaGFzQ2xhc3MoXCJpZThcIikgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JbWFnZXMoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbWFnZUNsaWNrZWQoaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2dhbGxlcnkvJyArICsraW1hZ2UgKyAnLmpwZyc7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZVNyY1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsaWduSW1hZ2VzKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWFzb25yeSA9IG5ldyBNYXNvbnJ5KGNvbnRhaW5lciwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbldpZHRoOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICBndXR0ZXI6ICcuZ3V0dGVyLXNpemVyJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246ICcwLjJzJyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIG1hc29ucnkub24oJ2xheW91dENvbXBsZXRlJywgb25MYXlvdXRDb21wbGV0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWFzb25yeS5sYXlvdXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkxheW91dENvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+ICQoY29udGFpbmVyKS5jc3MoJ29wYWNpdHknLCAnMScpLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4vKlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgICAgIC5kaXJlY3RpdmUoJ2FodGxHYWxsZXJ5JywgYWh0bEdhbGxlcnlEaXJlY3RpdmUpO1xyXG5cclxuICAgICAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICckdGltZW91dCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdwcmVsb2FkU2VydmljZSddO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkaHR0cCwgJHRpbWVvdXQsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCBwcmVsb2FkU2VydmljZSkgeyAvL3RvZG8gbm90IG9ubHkgbG9hZCBidXQgbGlzdFNyYyB0b28gYWNjZXB0XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93Rmlyc3QnLFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudDogJz1haHRsR2FsbGVyeVNob3dOZXh0J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkudGVtcGxhdGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxHYWxsZXJ5TGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgbGV0IGFsbEltYWdlc1NyYyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSAkc2NvcGUuc2hvd0ZpcnN0SW1nQ291bnQsXHJcbiAgICAgICAgICAgICAgICBzaG93TmV4dEltZ0NvdW50ID0gJHNjb3BlLnNob3dOZXh0SW1nQ291bnQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93Rmlyc3RJbWdDb3VudCA9IE1hdGgubWluKHNob3dGaXJzdEltZ0NvdW50ICsgc2hvd05leHRJbWdDb3VudCwgYWxsSW1hZ2VzU3JjLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dGaXJzdCA9IGFsbEltYWdlc1NyYy5zbGljZSgwLCBzaG93Rmlyc3RJbWdDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQWxsSW1hZ2VzTG9hZGVkID0gdGhpcy5zaG93Rmlyc3QgPj0gYWxsSW1hZ2VzU3JjLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvISokdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7KiEvXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsbEltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob3dGaXJzdCkgPyB0aGlzLnNob3dGaXJzdC5sZW5ndGggPT09IHRoaXMuaW1hZ2VzQ291bnQ6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmdhbGxlcnkgaW1nJykubGVuZ3RoIDwgc2hvd0ZpcnN0SW1nQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb29wcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KHRoaXMuYWxpZ25JbWFnZXMsIDApXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIF9zZXRJbWFnZUFsaWdtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxpZ25JbWFnZXMoKTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ZpcnN0ID0gYWxsSW1hZ2VzU3JjLnNsaWNlKDAsIHNob3dGaXJzdEltZ0NvdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzQ291bnQgPSBhbGxJbWFnZXNTcmMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgIGVsZW0ub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nU3JjID0gZXZlbnQudGFyZ2V0LnNyYztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGltZ1NyY1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgLyEqIHZhciAkaW1hZ2VzID0gJCgnLmdhbGxlcnkgaW1nJyk7XHJcbiAgICAgICAgICAgIHZhciBsb2FkZWRfaW1hZ2VzX2NvdW50ID0gMDsqIS9cclxuICAgICAgICAgICAgLyEqJHNjb3BlLmFsaWduSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1hZ2VzLmxvYWQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkX2ltYWdlc19jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkX2ltYWdlc19jb3VudCA9PSAkaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0SW1hZ2VBbGlnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8kdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCwgMCk7IC8vIHRvZG9cclxuICAgICAgICAgICAgfTsqIS9cclxuXHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmFsaWduSW1hZ2VzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKGNiKSB7XHJcbiAgICAgICAgICAgIGNiKHByZWxvYWRTZXJ2aWNlLmdldFByZWxvYWRDYWNoZSgnZ2FsbGVyeScpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9zZXRJbWFnZUFsaWdtZW50KCkgeyAvL3RvZG8gYXJndW1lbnRzIG5hbWluZywgZXJyb3JzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWd1cmVzID0gJCgnLmdhbGxlcnlfX2ZpZ3VyZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdhbGxlcnlXaWR0aCA9IHBhcnNlSW50KGZpZ3VyZXMuY2xvc2VzdCgnLmdhbGxlcnknKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlV2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNzcygnd2lkdGgnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNvbHVtbnNDb3VudCA9IE1hdGgucm91bmQoZ2FsbGVyeVdpZHRoIC8gaW1hZ2VXaWR0aCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodCA9IG5ldyBBcnJheShjb2x1bW5zQ291bnQgKyAxKS5qb2luKCcwJykuc3BsaXQoJycpLm1hcCgoKSA9PiB7cmV0dXJuIDB9KSwgLy90b2RvIGRlbCBqb2luLXNwbGl0XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHQgPSBjb2x1bW5zSGVpZ2h0LnNsaWNlKDApLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICQoZmlndXJlcykuY3NzKCdtYXJnaW4tdG9wJywgJzAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZmlndXJlcywgZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSA9IHBhcnNlSW50KCQodGhpcykuY3NzKCdoZWlnaHQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ21hcmdpbi10b3AnLCAtKE1hdGgubWF4LmFwcGx5KG51bGwsIGNvbHVtbnNIZWlnaHQpIC0gY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXSkgKyAncHgnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpICsgY29sdW1uc0hlaWdodFtjb2x1bW5Qb2ludGVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbHVtblBvaW50ZXIgPT09IGNvbHVtbnNDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uUG9pbnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uc0hlaWdodC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uc0hlaWdodFtpXSArPSBjdXJyZW50Q29sdW1uc0hlaWdodFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7XHJcbi8hKiAgICAgICAgLmNvbnRyb2xsZXIoJ0dhbGxlcnlDb250cm9sbGVyJywgR2FsbGVyeUNvbnRyb2xsZXIpO1xyXG5cclxuICAgIEdhbGxlcnlDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgIHZhciBpbWFnZXNTcmMgPSBfZ2V0SW1hZ2VTb3VyY2VzKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coaW1hZ2VzU3JjKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9nZXRJbWFnZVNvdXJjZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgdXJsOiBiYWNrZW5kUGF0aHNDb25zdGFudC5nYWxsZXJ5LFxyXG4gICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnRVJST1InOyAvL3RvZG9cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7KiEvXHJcblxyXG4vISpcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0OiBcIj1haHRsR2FsbGVyeVNob3dGaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgc2hvd0FmdGVyOiBcIj1haHRsR2FsbGVyeVNob3dBZnRlclwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEFodGxHYWxsZXJ5Q29udHJvbGxlcixcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oKXt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYSA9IDEzO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuYSk7XHJcbiAgICAgICAgICAgIC8hKnZhciBhbGxJbWFnZXNTcmM7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd0ZpcnN0SW1hZ2VzU3JjID0gWycxMjMnXTtcclxuXHJcbiAgICAgICAgICAgIF9nZXRJbWFnZVNvdXJjZXMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy90b2RvXHJcbiAgICAgICAgICAgICAgICBhbGxJbWFnZXNTcmMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgfSkqIS9cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxufSkoKTsqIS9cclxuKi9cclxuXHJcblxyXG5cclxuLyoyXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsR2FsbGVyeURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7fSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LmFsaWduLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBhaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeURpcmVjdGl2ZUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW1ncyA9IG5ldyBBcnJheSgyMCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nc0xvYWRlZCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vcGVuSW1hZ2UgPSBmdW5jdGlvbihpbWFnZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2dhbGxlcnkvJyArIGltYWdlTmFtZSArICcuanBnJztcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWFnZVNyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnYWh0bEdhbGxlcnk6bG9hZGVkJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSwgYSwgY3RybCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkKGVsZW0pLmZpbmQoJ2ltZycpKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ2FodGxHYWxsZXJ5OmxvYWRlZCcsIGFsaWduSW1hZ2VzKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsaWduSW1hZ2VzKCl7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hc29ucnkgPSBuZXcgTWFzb25yeShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uV2lkdGg6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3V0dGVyOiAnLmd1dHRlci1zaXplcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogJzAuMnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TGF5b3V0OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXNvbnJ5Lm9uKCdsYXlvdXRDb21wbGV0ZScsIG9uTGF5b3V0Q29tcGxldGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtYXNvbnJ5LmxheW91dCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkxheW91dENvbXBsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkKGNvbnRhaW5lcikuY3NzKCdvcGFjaXR5JywgJzEnKSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0d1ZXN0Y29tbWVudHNDb250cm9sbGVyJywgR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIpO1xyXG5cclxuICAgIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnZ3Vlc3Rjb21tZW50c1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHdWVzdGNvbW1lbnRzQ29udHJvbGxlcigkcm9vdFNjb3BlLCBndWVzdGNvbW1lbnRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2hvd1BsZWFzZUxvZ2lNZXNzYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMud3JpdGVDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiRsb2dnZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZS5nZXRHdWVzdENvbW1lbnRzKCkudGhlbihcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkQ29tbWVudHNFcnJvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBndWVzdGNvbW1lbnRzU2VydmljZVxyXG4gICAgICAgICAgICAgICAgLnNlbmRDb21tZW50KHRoaXMuZm9ybURhdGEpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZENvbW1lbnRzRXJyb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudHMucHVzaCh7J25hbWUnOiB0aGlzLmZvcm1EYXRhLm5hbWUsICdjb21tZW50JzogdGhpcy5mb3JtRGF0YS5jb21tZW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybURhdGEgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmlsdGVyKCdyZXZlcnNlJywgcmV2ZXJzZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gcmV2ZXJzZSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaXRlbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zLnNsaWNlKCkucmV2ZXJzZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ2d1ZXN0Y29tbWVudHNTZXJ2aWNlJywgZ3Vlc3Rjb21tZW50c1NlcnZpY2UpO1xyXG5cclxuICAgIGd1ZXN0Y29tbWVudHNTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZ3Vlc3Rjb21tZW50c1NlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCBhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldEd1ZXN0Q29tbWVudHM6IGdldEd1ZXN0Q29tbWVudHMsXHJcbiAgICAgICAgICAgIHNlbmRDb21tZW50OiBzZW5kQ29tbWVudFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEd1ZXN0Q29tbWVudHModHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2dldCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdCgpIHtcclxuICAgICAgICAgICAgJGxvZy5lcnJvcihgQ2FudCBnZXQgJHtiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHN9YCk7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZGlzcGxheUVycm9yJywge3Nob3c6IHRydWV9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbW1lbnQoY29tbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF1dGhTZXJ2aWNlLmdldExvZ0luZm8oKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ3Vlc3Rjb21tZW50cyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3B1dCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlcixcclxuICAgICAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3QoKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGBDYW50IGdldCAke2JhY2tlbmRQYXRoc0NvbnN0YW50LmhvdGVsc31gKTtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZGlzcGxheUVycm9yJywge3Nob3c6IHRydWV9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSGVhZGVyQXV0aENvbnRyb2xsZXInLCBIZWFkZXJBdXRoQ29udHJvbGxlcik7XHJcblxyXG4gICAgSGVhZGVyQXV0aENvbnRyb2xsZXIuJGluamVjdCA9IFsnYXV0aFNlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBIZWFkZXJBdXRoQ29udHJvbGxlcihhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2lnbk91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbk91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bEhlYWRlcicsIGFodGxIZWFkZXIpO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsSGVhZGVyKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQUMnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmh0bWwnXHJcblx0XHR9O1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0hlYWRlclRyYW5zaXRpb25zU2VydmljZScsIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSk7XHJcblxyXG5cdEhlYWRlclRyYW5zaXRpb25zU2VydmljZS4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9nJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgkdGltZW91dCwgJGxvZykge1xyXG5cdFx0ZnVuY3Rpb24gVUl0cmFuc2l0aW9ucyhjb250YWluZXIpIHtcclxuXHRcdFx0aWYgKCEkKGNvbnRhaW5lcikubGVuZ3RoKSB7XHJcblx0XHRcdFx0JGxvZy53YXJuKGBFbGVtZW50ICcke2NvbnRhaW5lcn0nIG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLmFuaW1hdGVUcmFuc2l0aW9uID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnRzUXVlcnksXHJcblx0XHRcdHtjc3NFbnVtZXJhYmxlUnVsZSA9ICd3aWR0aCcsIGZyb20gPSAwLCB0byA9ICdhdXRvJywgZGVsYXkgPSAxMDB9KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5fY29udGFpbmVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5jb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0bGV0IHRhcmdldEVsZW1lbnRzID0gJCh0aGlzKS5maW5kKHRhcmdldEVsZW1lbnRzUXVlcnkpLFxyXG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRFbGVtZW50cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke3RhcmdldEVsZW1lbnRzUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdFx0cmV0dXJuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIHRvKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlID0gdGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlKTtcclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5jc3MoY3NzRW51bWVyYWJsZVJ1bGUsIGZyb20pO1xyXG5cclxuXHRcdFx0XHRsZXQgYW5pbWF0ZU9wdGlvbnMgPSB7fTtcclxuXHRcdFx0XHRhbmltYXRlT3B0aW9uc1tjc3NFbnVtZXJhYmxlUnVsZV0gPSB0YXJnZXRFbGVtZW50c0ZpbmlzaFN0YXRlO1xyXG5cclxuXHRcdFx0XHR0YXJnZXRFbGVtZW50cy5hbmltYXRlKGFuaW1hdGVPcHRpb25zLCBkZWxheSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdFVJdHJhbnNpdGlvbnMucHJvdG90eXBlLnJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayA9IGZ1bmN0aW9uKGVsZW1lbnRUcmlnZ2VyUXVlcnksIGVsZW1lbnRPblF1ZXJ5KSB7XHJcblx0XHRcdGlmICghJChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5sZW5ndGggfHwgISQoZWxlbWVudE9uUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2VsZW1lbnRUcmlnZ2VyUXVlcnl9ICR7ZWxlbWVudE9uUXVlcnl9IG5vdCBmb3VuZGApO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkKGVsZW1lbnRUcmlnZ2VyUXVlcnkpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWxlbWVudE9uUXVlcnkpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gSGVhZGVyVHJhbnNpdGlvbnMoaGVhZGVyUXVlcnksIGNvbnRhaW5lclF1ZXJ5KSB7XHJcblx0XHRcdFVJdHJhbnNpdGlvbnMuY2FsbCh0aGlzLCBjb250YWluZXJRdWVyeSk7XHJcblxyXG5cdFx0XHRpZiAoISQoaGVhZGVyUXVlcnkpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudChzKSAke2hlYWRlclF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9oZWFkZXIgPSAkKGhlYWRlclF1ZXJ5KTtcclxuXHRcdH1cclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFVJdHJhbnNpdGlvbnMucHJvdG90eXBlKTtcclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlYWRlclRyYW5zaXRpb25zO1xyXG5cclxuXHRcdEhlYWRlclRyYW5zaXRpb25zLnByb3RvdHlwZS5maXhIZWFkZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnRGaXhRdWVyeSwgZml4Q2xhc3NOYW1lLCB1bmZpeENsYXNzTmFtZSwgb3B0aW9ucykge1xyXG5cdFx0XHRpZiAodGhpcy5faGVhZGVyID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBmaXhFbGVtZW50ID0gJChlbGVtZW50Rml4UXVlcnkpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gb25XaWR0aENoYW5nZUhhbmRsZXIoKSB7XHJcblx0XHRcdFx0bGV0IHRpbWVyO1xyXG5cclxuXHRcdFx0XHRmdW5jdGlvbiBmaXhVbmZpeE1lbnVPblNjcm9sbCgpIHtcclxuXHRcdFx0XHRcdGlmICgkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBvcHRpb25zLm9uTWluU2Nyb2xsdG9wKSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQuYWRkQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aW1lciA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkKHdpbmRvdykuaW5uZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRpZiAod2lkdGggPCBvcHRpb25zLm9uTWF4V2luZG93V2lkdGgpIHtcclxuXHRcdFx0XHRcdGZpeFVuZml4TWVudU9uU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRzZWxmLl9oZWFkZXIuYWRkQ2xhc3ModW5maXhDbGFzc05hbWUpO1xyXG5cclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGltZXIpIHtcclxuXHRcdFx0XHRcdFx0XHR0aW1lciA9ICR0aW1lb3V0KGZpeFVuZml4TWVudU9uU2Nyb2xsLCAxNTApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLnJlbW92ZUNsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdGZpeEVsZW1lbnQucmVtb3ZlQ2xhc3MoZml4Q2xhc3NOYW1lKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5vZmYoJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0b25XaWR0aENoYW5nZUhhbmRsZXIoKTtcclxuXHRcdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBvbldpZHRoQ2hhbmdlSGFuZGxlcik7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gSGVhZGVyVHJhbnNpdGlvbnM7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU3Rpa3lIZWFkZXInLGFodGxTdGlreUhlYWRlcik7XHJcblxyXG5cdGFodGxTdGlreUhlYWRlci4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bFN0aWt5SGVhZGVyKEhlYWRlclRyYW5zaXRpb25zU2VydmljZSkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRsaW5rOiBsaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGxpbmsoKSB7XHJcblx0XHRcdGxldCBoZWFkZXIgPSBuZXcgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKCdbZGF0YS1oZWFkZXJdJywgJ1tkYXRhLWhlYWRlci1pdGVtXScpO1xyXG5cclxuXHRcdFx0aGVhZGVyLmFuaW1hdGVUcmFuc2l0aW9uKFxyXG5cdFx0XHRcdCdbZGF0YS1oZWFkZXItc3VibmF2XScsIHtcclxuXHRcdFx0XHRcdGNzc0VudW1lcmFibGVSdWxlOiAnaGVpZ2h0JyxcclxuXHRcdFx0XHRcdGRlbGF5OiAzMDB9KVxyXG5cdFx0XHRcdC5yZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2soXHJcblx0XHRcdFx0XHQnW2RhdGEtYXV0b2hlaWdodC10cmlnZ2VyXScsXHJcblx0XHRcdFx0XHQnW2RhdGEtYXV0b2hlaWdodC1vbl0nKVxyXG5cdFx0XHRcdC5maXhIZWFkZXJFbGVtZW50KFxyXG5cdFx0XHRcdFx0Jy5uYXYnLFxyXG5cdFx0XHRcdFx0J2pzX25hdi0tZml4ZWQnLFxyXG5cdFx0XHRcdFx0J2pzX2wtaGVhZGVyLS1yZWxhdGl2ZScsIHtcclxuXHRcdFx0XHRcdFx0b25NaW5TY3JvbGx0b3A6IDg4LFxyXG5cdFx0XHRcdFx0XHRvbk1heFdpbmRvd1dpZHRoOiA4NTB9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIEhvbWVDb250cm9sbGVyKTtcclxuXHJcbiAgICBIb21lQ29udHJvbGxlci4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIocmVzb3J0U2VydmljZSkge1xyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KHtwcm9wOiAnX3RyZW5kJywgdmFsdWU6IHRydWV9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTW9kYWwnLCBhaHRsTW9kYWxEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgcmVwbGFjZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbms6IGFodGxNb2RhbERpcmVjdGl2ZUxpbmssXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL21vZGFsL21vZGFsLmh0bWwnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bE1vZGFsRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3cgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJ21vZGFsT3BlbicsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAnaW1hZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNyYyA9IGRhdGEuc3JjO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LmltZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93ID09PSAnbWFwJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93Lm1hcCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nb29nbGUgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZ29vZ2xlICYmICdtYXBzJyBpbiB3aW5kb3cuZ29vZ2xlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRNYXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXBTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcFNjcmlwdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LnRleHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LmhlYWRlciA9IGRhdGEuaGVhZGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93Lm1lc3NhZ2UgPSBkYXRhLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBteUxhdGxuZyA9IHtsYXQ6IGRhdGEuY29vcmQubGF0LCBsbmc6IGRhdGEuY29vcmQubG5nfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6ICdyb2FkbWFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBteUxhdGxuZ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBteUxhdGxuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIodGhpcy5nZXRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2VEaWFsb2cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKG5hbWUsIGNvb3JkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYXRpb25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIFtuYW1lLCBjb29yZC5sYXQsIGNvb3JkLmxuZ11cclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXHJcbiAgICAgICAgICAgICAgICBsZXQgbW9kYWxNYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge2xhdDogY29vcmQubGF0LCBsbmc6IGNvb3JkLmxuZ30sXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBpY29ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhaG90ZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuLypcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvISpjZW50ZXJpbmcqIS9cclxuICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzICgpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kYWxNYXAuZml0Qm91bmRzKGJvdW5kcyk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignYWN0aXZpdGllc0ZpbHRlcicsIGFjdGl2aXRpZXNGaWx0ZXIpO1xyXG5cclxuICAgIGFjdGl2aXRpZXNGaWx0ZXIuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFjdGl2aXRpZXNGaWx0ZXIoJGxvZywgZmlsdGVyc1NlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyZywgX3N0cmluZ0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc3RyaW5nTGVuZ3RoID0gcGFyc2VJbnQoX3N0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4oc3RyaW5nTGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBDYW4ndCBwYXJzZSBhcmd1bWVudDogJHtfc3RyaW5nTGVuZ3RofWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZ1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXJnLmpvaW4oJywgJykuc2xpY2UoMCwgc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuc2xpY2UoMCwgcmVzdWx0Lmxhc3RJbmRleE9mKCcsJykpICsgJy4uLidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jlc29ydENvbnRyb2xsZXInLCBSZXNvcnRDb250cm9sbGVyKTtcclxuXHJcbiAgICBSZXNvcnRDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnLCAnJGZpbHRlcicsICckc2NvcGUnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUmVzb3J0Q29udHJvbGxlcihyZXNvcnRTZXJ2aWNlLCAkZmlsdGVyLCAkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICAgIGxldCBjdXJyZW50RmlsdGVycyA9ICRzdGF0ZS4kY3VycmVudC5kYXRhLmN1cnJlbnRGaWx0ZXJzOyAvLyB0ZW1wXHJcblxyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuaW5pdEZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZSA9IGZ1bmN0aW9uKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSA9IGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5wdXNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uc3BsaWNlKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlciksIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBob3RlbHMgPSB7fTtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IGhvdGVscztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLmZpbHRlcnMucHJpY2UsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVycy5wcmljZSA9IFtuZXdWYWx1ZV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjdXJyZW50RmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTsgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuTWFwID0gZnVuY3Rpb24oaG90ZWxOYW1lLCBob3RlbENvb3JkKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogJ21hcCcsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBob3RlbE5hbWUsXHJcbiAgICAgICAgICAgICAgICBjb29yZDogaG90ZWxDb29yZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywgZGF0YSlcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2hvdGVsRmlsdGVyJywgaG90ZWxGaWx0ZXIpO1xyXG5cclxuICAgIGhvdGVsRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBob3RlbEZpbHRlcigkbG9nLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIGxldCBzYXZlZEZpbHRlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbG9hZEZpbHRlcnM6IGxvYWRGaWx0ZXJzLFxyXG4gICAgICAgICAgICBhcHBseUZpbHRlcnM6IGFwcGx5RmlsdGVycyxcclxuICAgICAgICAgICAgaW5pdEZpbHRlcnM6IGluaXRGaWx0ZXJzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9hZEZpbHRlcnMoKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdEZpbHRlcnMoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNhdmVkRmlsdGVycyk7XHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3RlbERldGFpbHNDb25zdGFudFtrZXldLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV0gJiYgc2F2ZWRGaWx0ZXJzW2tleV0uaW5kZXhPZihob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldKSAhPT0gLTEgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9maWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gPSBzYXZlZEZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSB8fCBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZmlsdGVycy5wcmljZSA9IHtcclxuICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgIG1heDogMTAwMFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVycyhob3RlbHMsIGZpbHRlcnMpIHtcclxuICAgICAgICAgICAgc2F2ZWRGaWx0ZXJzID0gZmlsdGVycztcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChob3RlbHMsIGZ1bmN0aW9uKGhvdGVsKSB7XHJcbiAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzLCBmdW5jdGlvbihmaWx0ZXJzSW5Hcm91cCwgZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VGaWx0ZXJNYXRjaGluZyA9IGZhbHNlOyAvLyBmb3IgYWN0aXZpdGllcyBhbmQgbXVzdGhhdmVzIGdyb3Vwc1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdndWVzdHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnNJbkdyb3VwID0gW2ZpbHRlcnNJbkdyb3VwW2ZpbHRlcnNJbkdyb3VwLmxlbmd0aCAtIDFdXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdtdXN0SGF2ZXMnIHx8IGZpbHRlckdyb3VwID09PSAnYWN0aXZpdGllcycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV2ZXJzZUZpbHRlck1hdGNoaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyc0luR3JvdXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXZlcnNlRmlsdGVyTWF0Y2hpbmcgJiYgZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXZlcnNlRmlsdGVyTWF0Y2hpbmcgJiYgIWdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaEF0TGVhc2VPbmVGaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaChmaWx0ZXJHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xvY2F0aW9ucyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5sb2NhdGlvbi5jb3VudHJ5ID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndHlwZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwudHlwZSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHRpbmdzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmVudmlyb25tZW50ID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbXVzdEhhdmVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmRldGFpbHNbZmlsdGVyXTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdhY3Rpdml0aWVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIH5ob3RlbC5hY3Rpdml0aWVzLmluZGV4T2YoZmlsdGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdwcmljZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5wcmljZSA+PSBmaWx0ZXIubWluICYmIGhvdGVsLnByaWNlIDw9IGZpbHRlci5tYXg7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ3Vlc3RzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmd1ZXN0cy5tYXggPj0gK2ZpbHRlclswXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhvdGVscy5maWx0ZXIoKGhvdGVsKSA9PiAhaG90ZWwuX2hpZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnc2Nyb2xsVG9Ub3AnLCBzY3JvbGxUb1RvcERpcmVjdGl2ZSk7XHJcblxyXG4gICAgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gc2Nyb2xsVG9Ub3BEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IHNjcm9sbFRvVG9wRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGF0dHIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yLCBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoMSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICQudHJpbShhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLnNsaWNlKDAsIGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuaW5kZXhPZignLCcpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcGFyc2VJbnQoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZShhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSArIDEpKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNjcm9sbC10by10b3AtY29uZmlnIGlzIG5vdCBkZWZpbmVkYCk7XHJcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgfHwgJ2h0bWwsIGJvZHknO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbSkub24oYXR0ci5zY3JvbGxUb1RvcCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBoZWlnaHQgfSwgXCJzbG93XCIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgU2VhcmNoQ29udHJvbGxlcik7XHJcblxyXG4gICAgU2VhcmNoQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGUnLCAncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHN0YXRlLCByZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5xdWVyeSA9ICRzdGF0ZS5wYXJhbXMucXVlcnk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5xdWVyeSk7XHJcbiAgICAgICAgdGhpcy5ob3RlbHMgPSBudWxsO1xyXG5cclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcclxuICAgICAgICAgICAgbGV0IHBhcnNlZFF1ZXJ5ID0gJC50cmltKHRoaXMucXVlcnkpLnJlcGxhY2UoL1xccysvZywgJyAnKS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5ob3RlbHMsIChob3RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhob3RlbCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaG90ZWxDb250ZW50ID0gaG90ZWwubmFtZSArIGhvdGVsLmxvY2F0aW9uLmNvdW50cnkgK1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdGVsLmxvY2F0aW9uLnJlZ2lvbiArIGhvdGVsLmRlc2MgKyBob3RlbC5kZXNjTG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGhvdGVsQ29udGVudClcclxuICAgICAgICAgICAgICAgIC8vZm9yICgpXHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlc0NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJzZWRRdWVyeS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBxUmVnRXhwID0gbmV3IFJlZ0V4cChwYXJzZWRRdWVyeVtpXSwgJ2dpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlc0NvdW50ZXIgKz0gKGhvdGVsQ29udGVudC5tYXRjaChxUmVnRXhwKSB8fCBbXSkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzQ291bnRlciA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaG90ZWwuX2lkXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtob3RlbC5faWRdLm1hdGNoZXNDb3VudGVyID0gbWF0Y2hlc0NvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gdGhpcy5ob3RlbHNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGhvdGVsKSA9PiByZXN1bHRbaG90ZWwuX2lkXSlcclxuICAgICAgICAgICAgICAgIC5tYXAoKGhvdGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG90ZWwuX21hdGNoZXMgPSByZXN1bHRbaG90ZWwuX2lkXS5tYXRjaGVzQ291bnRlcjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWw7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsVG9wMycsIGFodGxUb3AzRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsVG9wM0RpcmVjdGl2ZS4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFRvcDNEaXJlY3RpdmUocmVzb3J0U2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsVG9wM0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3RvcDMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdG9wMy50ZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQubXVzdEhhdmVzO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydFR5cGUgPSAkYXR0cnMuYWh0bFRvcDN0eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEltZ1NyYyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9pbWFnZXMvJyArIHRoaXMucmVzb3J0VHlwZSArICcvJyArIHRoaXMucmVzb3J0W2luZGV4XS5pbWcuZmlsZW5hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNSZXNvcnRJbmNsdWRlRGV0YWlsID0gZnVuY3Rpb24oaXRlbSwgZGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0YWlsQ2xhc3NOYW1lID0gJ3RvcDNfX2RldGFpbC1jb250YWluZXItLScgKyBkZXRhaWwsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lID0gIWl0ZW0uZGV0YWlsc1tkZXRhaWxdID8gJyB0b3AzX19kZXRhaWwtY29udGFpbmVyLS1oYXNudCcgOiAnJztcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0YWlsQ2xhc3NOYW1lICsgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7cHJvcDogJ3R5cGUnLCB2YWx1ZTogdGhpcy5yZXNvcnRUeXBlfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvcnRUeXBlID09PSAnSG90ZWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gdGhpcy5yZXNvcnQuZmlsdGVyKChob3RlbCkgPT4gaG90ZWwuX3Nob3dJblRvcCA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmFuaW1hdGlvbignLnNsaWRlcl9faW1nJywgYW5pbWF0aW9uRnVuY3Rpb24pO1xyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJywgYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNC5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNi5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUGFnZXMnLCBQYWdlcyk7XHJcblxyXG4gICAgUGFnZXMuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUGFnZXMoJHNjb3BlKSB7XHJcbiAgICAgICAgY29uc3QgaG90ZWxzUGVyUGFnZSA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dGcm9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5jdXJyZW50UGFnZSAtIDEpICogaG90ZWxzUGVyUGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiArK3RoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93UHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLS10aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2UgKyAxO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWdlc1RvdGFsLmxlbmd0aCA9PT0gdGhpcy5jdXJyZW50UGFnZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNGaXJzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2UgPT09IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCAoZXZlbnQsIHNob3dIb3RlbENvdW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IG5ldyBBcnJheShNYXRoLmNlaWwoc2hvd0hvdGVsQ291bnQgLyBob3RlbHNQZXJQYWdlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignc2hvd0Zyb20nLCBzaG93RnJvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0Zyb20oKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBzdGFydFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnNsaWNlKHN0YXJ0UG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxQcmljZVNsaWRlcicsIHByaWNlU2xpZGVyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBwcmljZVNsaWRlckRpcmVjdGl2ZS4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiBcIkBcIixcclxuICAgICAgICAgICAgICAgIG1heDogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0U2xpZGVyOiAnPScsXHJcbiAgICAgICAgICAgICAgICByaWdodFNsaWRlcjogJz0nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5odG1sJyxcclxuICAgICAgICAgICAgbGluazogcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rKCRzY29wZSwgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmxlZnRTbGlkZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmlnaHRTbGlkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIubWF4ID0gMTU7Ki9cclxuICAgICAgICAgICAgbGV0IHJpZ2h0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVBcmVhV2lkdGggPSBwYXJzZUludCgkKCcuc2xpZGUnKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVQZXJTdGVwID0gJHNjb3BlLm1heCAvIChzbGlkZUFyZWFXaWR0aCAtIDIwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5taW4gPSBwYXJzZUludCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJHNjb3BlLm1heCA9IHBhcnNlSW50KCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIHJpZ2h0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gc2xpZGVBcmVhV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSArIDIwLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gMCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0RHJhZyhkcmFnRWxlbSwgaW5pdFBvc2l0aW9uLCBtYXhQb3NpdGlvbiwgbWluUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzaGlmdDtcclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2Vkb3duJywgYnRuT25Nb3VzZURvd24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSBldmVudC5wYWdlWDtcclxuICAgICAgICAgICAgICAgICAgICBpbml0UG9zaXRpb24gPSBwYXJzZUludChkcmFnRWxlbS5jc3MoJ2xlZnQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkb2NPbk1vdXNlTW92ZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbkxlc3NUaGFuTWF4ID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA8PSBtYXhQb3NpdGlvbigpIC0gMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uR3JhdGVyVGhhbk1pbiA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPj0gbWluUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uTGVzc1RoYW5NYXggJiYgcG9zaXRpb25HcmF0ZXJUaGFuTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdFbGVtLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIGluaXRQb3NpdGlvbiAtIGV2ZW50LnBhZ2VYICsgc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdkcmFnc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQcmljZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld01pbiA9IH5+KHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF4ID0gfn4ocGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKG5ld01pbik7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKG5ld01heCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0QnRuLmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRCdG4uY3NzKCdsZWZ0JylcclxuICAgICAgICAgICAgICAgICAgICB9KSovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0U2xpZGVycyhidG4sIG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1Bvc3Rpb24gPSBuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcDtcclxuICAgICAgICAgICAgICAgICAgICBidG4uY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidG4uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwID4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpIC0gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMobGVmdEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4Jykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPiAkc2NvcGUubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdWYWx1ZSwkc2NvcGUubWF4ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPCBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSArIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKHJpZ2h0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlbWl0KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZWZ0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEzKTsqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdG9kbyBpZTggYnVnIGZpeFxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnaWU4JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygrc2xpZGVBcmVhV2lkdGggLSArbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsICtzbGlkZUFyZWFXaWR0aCAtIHBhcnNlSW50KG5ld1ZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFNsaWRlT25DbGljaycsIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBsZXQgc2xpZGVFbWl0RWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1lbWl0XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNsaWRlRW1pdEVsZW1lbnRzLm9uKCdjbGljaycsIHNsaWRlRW1pdE9uQ2xpY2spO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2xpZGVFbWl0T25DbGljaygpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzbGlkZU9uRWxlbWVudCA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICcnICYmIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBXcm9uZyBpbml0IHZhbHVlIGZvciAnc2xpZGUtb24nIGF0dHJpYnV0ZSwgc2hvdWxkIGJlICcnIG9yICdjbG9zZWQnLmApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVVcCgnc2xvdycsIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnY2xvc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlRG93bignc2xvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2xpZGVUb2dnbGVFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uLXRvZ2dsZV0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHNsaWRlVG9nZ2xlRWxlbWVudHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCQodGhpcykuYXR0cignc2xpZGUtb24tdG9nZ2xlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iXX0=
