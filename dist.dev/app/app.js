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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFob3RlbC5qcyIsImFob3RlbC5sb2cuanMiLCJhaG90ZWwucm91dGVzLmpzIiwiYWhvdGVsLnJ1bi5qcyIsImdsb2JhbHMvYmFja2VuZFBhdGhzLmNvbnN0YW50LmpzIiwiZ2xvYmFscy9ob3RlbERldGFpbHMuY29uc3RhbnQuanMiLCJnbG9iYWxzL3Jlc29ydC5zZXJ2aWNlLmpzIiwicGFydGlhbHMvZGlzcGxheUVycm9yLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2F1dGgvYXV0aC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvYXV0aC9hdXRoLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9ib29raW5nL2Jvb2tpbmcuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2Jvb2tpbmcvYm9va2luZy5mb3JtLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ib29raW5nL2RhdGVQaWNrZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZGVzdGluYXRpb25zL21hcC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9nYWxsZXJ5L2dhbGxlcnkuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9ndWVzdGNvbW1lbnRzL2d1ZXN0Y29tbWVudHMuZmlsdGVyLmpzIiwicGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvaGVhZGVyLmF1dGguY29udHJvbGxlci5qcyIsInBhcnRpYWxzL2hlYWRlci9oZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaGVhZGVyL2hlYWRlclRyYW5zaXRpb25zLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc3Rpa3lIZWFkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvaG9tZS9ob21lLmNvbnRyb2xsZXIuanMiLCJwYXJ0aWFscy9tb2RhbC9tb2RhbC5kaXJlY3RpdmUuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LmFjdGl2aXRpZXMuZmlsdGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5jb250cm9sbGVyLmpzIiwicGFydGlhbHMvcmVzb3J0L3Jlc29ydC5ob3RlbC5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcmVzb3J0LnNjcm9sbHRvVG9wLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL3NlYXJjaC9zZWFyY2guY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3RvcC90b3AzLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmFuaW1hdGlvbi5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLmRpcmVjdGl2ZS5qcyIsInBhcnRpYWxzL2hlYWRlci9zbGlkZXIvc2xpZGVyLnNlcnZpY2UuanMiLCJwYXJ0aWFscy9oZWFkZXIvc2xpZGVyL3NsaWRlclBhdGguY29uc3RhbnQuanMiLCJwYXJ0aWFscy9yZXNvcnQvcGFnZXMvcGFnZXMuY29udHJvbGxlci5qcyIsInBhcnRpYWxzL3Jlc29ydC9wYWdlcy9wYWdlcy5maWx0ZXIuanMiLCJwYXJ0aWFscy9yZXNvcnQvcHJpY2VTbGlkZXIvcHJpY2VTbGlkZXIuZGlyZWN0aXZlLmpzIiwicGFydGlhbHMvcmVzb3J0L3NsaWRlT25DbGljay9zbGlkZU9uQ2xpY2suZGlyZWN0aXZlLmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkcHJvdmlkZSIsImRlY29yYXRvciIsIiRkZWxlZ2F0ZSIsIiR3aW5kb3ciLCJsb2dIaXN0b3J5Iiwid2FybiIsImVyciIsImxvZyIsIm1lc3NhZ2UiLCJfbG9nV2FybiIsInB1c2giLCJhcHBseSIsIl9sb2dFcnIiLCJlcnJvciIsIm5hbWUiLCJzdGFjayIsIkVycm9yIiwic2VuZE9uVW5sb2FkIiwib25iZWZvcmV1bmxvYWQiLCJsZW5ndGgiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJzZXRSZXF1ZXN0SGVhZGVyIiwic2VuZCIsIkpTT04iLCJzdHJpbmdpZnkiLCIkaW5qZWN0IiwiJHN0YXRlUHJvdmlkZXIiLCIkdXJsUm91dGVyUHJvdmlkZXIiLCIkbG9jYXRpb25Qcm92aWRlciIsImh0bWw1TW9kZSIsIm90aGVyd2lzZSIsInN0YXRlIiwidXJsIiwidGVtcGxhdGVVcmwiLCJwYXJhbXMiLCJkYXRhIiwiY3VycmVudEZpbHRlcnMiLCJydW4iLCIkcm9vdFNjb3BlIiwiJHRpbWVvdXQiLCIkbG9nZ2VkIiwiJHN0YXRlIiwiY3VycmVudFN0YXRlTmFtZSIsImN1cnJlbnRTdGF0ZVBhcmFtcyIsInN0YXRlSGlzdG9yeSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiZnJvbVN0YXRlIiwiZnJvbVBhcmFtcyIsIiQiLCJ3aW5kb3ciLCJzY3JvbGxUb3AiLCJjb25zdGFudCIsInRvcDMiLCJhdXRoIiwiZ2FsbGVyeSIsImd1ZXN0Y29tbWVudHMiLCJob3RlbHMiLCJib29raW5nIiwidHlwZXMiLCJzZXR0aW5ncyIsImxvY2F0aW9ucyIsImd1ZXN0cyIsIm11c3RIYXZlcyIsImFjdGl2aXRpZXMiLCJwcmljZSIsImZhY3RvcnkiLCJyZXNvcnRTZXJ2aWNlIiwiJGh0dHAiLCJiYWNrZW5kUGF0aHNDb25zdGFudCIsIiRxIiwiJGxvZyIsIm1vZGVsIiwiZ2V0UmVzb3J0IiwiZmlsdGVyIiwid2hlbiIsImFwcGx5RmlsdGVyIiwibWV0aG9kIiwidGhlbiIsIm9uUmVzb2x2ZSIsIm9uUmVqZWN0ZWQiLCJyZXNwb25zZSIsIiRicm9hZGNhc3QiLCJzaG93IiwicHJvcCIsInZhbHVlIiwiZGlzY291bnRNb2RlbCIsImhvdGVsIiwicm5kSG90ZWwiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJyZXN1bHQiLCJlIiwiZGlyZWN0aXZlIiwiZGlzcGxheUVycm9yRGlyZWN0aXZlIiwicmVzdHJpY3QiLCJsaW5rIiwiJHNjb3BlIiwiZWxlbSIsImRlZmF1bHRFcnJvck1zZyIsInRleHQiLCJjc3MiLCJjb250cm9sbGVyIiwiQXV0aENvbnRyb2xsZXIiLCJhdXRoU2VydmljZSIsInZhbGlkYXRpb25TdGF0dXMiLCJ1c2VyQWxyZWFkeUV4aXN0cyIsImxvZ2luT3JQYXNzd29yZEluY29ycmVjdCIsImNyZWF0ZVVzZXIiLCJuZXdVc2VyIiwiY29uc29sZSIsImdvIiwibG9naW5Vc2VyIiwic2lnbkluIiwidXNlciIsInByZXZpb3VzU3RhdGUiLCJVc2VyIiwiYmFja2VuZEFwaSIsIl9iYWNrZW5kQXBpIiwiX2NyZWRlbnRpYWxzIiwiX29uUmVzb2x2ZSIsInN0YXR1cyIsInRva2VuIiwiX3Rva2VuS2VlcGVyIiwic2F2ZVRva2VuIiwiX29uUmVqZWN0ZWQiLCJfdG9rZW4iLCJkZWJ1ZyIsImdldFRva2VuIiwiZGVsZXRlVG9rZW4iLCJwcm90b3R5cGUiLCJjcmVkZW50aWFscyIsImFjdGlvbiIsInNpZ25PdXQiLCJnZXRMb2dJbmZvIiwiQm9va2luZ0NvbnRyb2xsZXIiLCIkc3RhdGVQYXJhbXMiLCJsb2FkZWQiLCJob3RlbElkIiwiZ2V0SG90ZWxJbWFnZXNDb3VudCIsImNvdW50IiwiQXJyYXkiLCJvcGVuSW1hZ2UiLCIkZXZlbnQiLCJpbWdTcmMiLCJ0YXJnZXQiLCJzcmMiLCJCb29raW5nRm9ybUNvbnRyb2xsZXIiLCJzaG93Rm9ybSIsImZvcm0iLCJkYXRlIiwiYWRkR3Vlc3QiLCJyZW1vdmVHdWVzdCIsInN1Ym1pdCIsInNlbGYiLCIkcm9vdCIsImhlYWRlciIsImRhdGVQaWNrZXJEaXJlY3RpdmUiLCIkaW50ZXJ2YWwiLCJyZXF1aXJlIiwiZGF0ZVBpY2tlckRpcmVjdGl2ZUxpbmsiLCJzY29wZSIsImVsZW1lbnQiLCJhdHRycyIsImN0cmwiLCJkYXRlUmFuZ2VQaWNrZXIiLCJsYW5ndWFnZSIsInN0YXJ0RGF0ZSIsIkRhdGUiLCJlbmREYXRlIiwic2V0RnVsbFllYXIiLCJnZXRGdWxsWWVhciIsImJpbmQiLCJvYmoiLCIkc2V0Vmlld1ZhbHVlIiwiJHJlbmRlciIsIiRhcHBseSIsImFodGxNYXBEaXJlY3RpdmUiLCJ0ZW1wbGF0ZSIsImFodGxNYXBEaXJlY3RpdmVMaW5rIiwiYXR0ciIsImNyZWF0ZU1hcCIsImdvb2dsZSIsImluaXRNYXAiLCJtYXBTY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJpIiwiX2dtYXBzIiwibGF0IiwibG5nIiwibXlMYXRMbmciLCJtYXAiLCJtYXBzIiwiTWFwIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsInNjcm9sbHdoZWVsIiwiaWNvbnMiLCJhaG90ZWwiLCJpY29uIiwibWFya2VyIiwiTWFya2VyIiwidGl0bGUiLCJwb3NpdGlvbiIsIkxhdExuZyIsImFkZExpc3RlbmVyIiwic2V0Wm9vbSIsInNldENlbnRlciIsImdldFBvc2l0aW9uIiwiYm91bmRzIiwiTGF0TG5nQm91bmRzIiwiTGF0TGFuZyIsImV4dGVuZCIsImZpdEJvdW5kcyIsImFodGxHYWxsZXJ5RGlyZWN0aXZlIiwiYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rIiwiaW1hZ2VzSW5HYWxsZXJ5IiwiaW1nIiwiZmluZCIsIm9uIiwiaW1hZ2VMb2FkZWQiLCJpbWFnZUNsaWNrZWQiLCJhcHBlbmQiLCJpbWFnZXNMb2FkZWQiLCJoYXNDbGFzcyIsImFsaWduSW1hZ2VzIiwiaW1hZ2UiLCJpbWFnZVNyYyIsImNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJtYXNvbnJ5IiwiTWFzb25yeSIsImNvbHVtbldpZHRoIiwiaXRlbVNlbGVjdG9yIiwiZ3V0dGVyIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwib25MYXlvdXRDb21wbGV0ZSIsImxheW91dCIsIkd1ZXN0Y29tbWVudHNDb250cm9sbGVyIiwiZ3Vlc3Rjb21tZW50c1NlcnZpY2UiLCJjb21tZW50cyIsIm9wZW5Gb3JtIiwic2hvd1BsZWFzZUxvZ2lNZXNzYWdlIiwid3JpdGVDb21tZW50IiwiZ2V0R3Vlc3RDb21tZW50cyIsImxvYWRDb21tZW50c0Vycm9yIiwiYWRkQ29tbWVudCIsInNlbmRDb21tZW50IiwiZm9ybURhdGEiLCJjb21tZW50IiwicmV2ZXJzZSIsIml0ZW1zIiwic2xpY2UiLCJ0eXBlIiwib25SZWplY3QiLCJIZWFkZXJBdXRoQ29udHJvbGxlciIsImFodGxIZWFkZXIiLCJzZXJ2aWNlIiwiSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlIiwiVUl0cmFuc2l0aW9ucyIsIl9jb250YWluZXIiLCJhbmltYXRlVHJhbnNpdGlvbiIsInRhcmdldEVsZW1lbnRzUXVlcnkiLCJjc3NFbnVtZXJhYmxlUnVsZSIsImZyb20iLCJ0byIsImRlbGF5IiwibW91c2VlbnRlciIsInRhcmdldEVsZW1lbnRzIiwidGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSIsImFuaW1hdGVPcHRpb25zIiwiYW5pbWF0ZSIsInJlY2FsY3VsYXRlSGVpZ2h0T25DbGljayIsImVsZW1lbnRUcmlnZ2VyUXVlcnkiLCJlbGVtZW50T25RdWVyeSIsIkhlYWRlclRyYW5zaXRpb25zIiwiaGVhZGVyUXVlcnkiLCJjb250YWluZXJRdWVyeSIsImNhbGwiLCJfaGVhZGVyIiwiT2JqZWN0IiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJmaXhIZWFkZXJFbGVtZW50IiwiZWxlbWVudEZpeFF1ZXJ5IiwiZml4Q2xhc3NOYW1lIiwidW5maXhDbGFzc05hbWUiLCJvcHRpb25zIiwiZml4RWxlbWVudCIsIm9uV2lkdGhDaGFuZ2VIYW5kbGVyIiwidGltZXIiLCJmaXhVbmZpeE1lbnVPblNjcm9sbCIsIm9uTWluU2Nyb2xsdG9wIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsIndpZHRoIiwiaW5uZXJXaWR0aCIsIm9uTWF4V2luZG93V2lkdGgiLCJvZmYiLCJzY3JvbGwiLCJhaHRsU3Rpa3lIZWFkZXIiLCJIb21lQ29udHJvbGxlciIsImFodGxNb2RhbERpcmVjdGl2ZSIsInJlcGxhY2UiLCJhaHRsTW9kYWxEaXJlY3RpdmVMaW5rIiwidW5kZWZpbmVkIiwibXlMYXRsbmciLCJjb29yZCIsIm1hcFR5cGVJZCIsInpvb20iLCJjZW50ZXIiLCJjbG9zZURpYWxvZyIsIm1vZGFsTWFwIiwiYWN0aXZpdGllc0ZpbHRlciIsImZpbHRlcnNTZXJ2aWNlIiwiYXJnIiwiX3N0cmluZ0xlbmd0aCIsInN0cmluZ0xlbmd0aCIsInBhcnNlSW50IiwiaXNOYU4iLCJqb2luIiwibGFzdEluZGV4T2YiLCJSZXNvcnRDb250cm9sbGVyIiwiJGZpbHRlciIsIiRjdXJyZW50IiwiZmlsdGVycyIsImluaXRGaWx0ZXJzIiwib25GaWx0ZXJDaGFuZ2UiLCJmaWx0ZXJHcm91cCIsInNwbGljZSIsImluZGV4T2YiLCJhcHBseUZpbHRlcnMiLCJnZXRTaG93SG90ZWxDb3VudCIsInJlZHVjZSIsImNvdW50ZXIiLCJpdGVtIiwiX2hpZGUiLCIkd2F0Y2giLCJuZXdWYWx1ZSIsIm9wZW5NYXAiLCJob3RlbE5hbWUiLCJob3RlbENvb3JkIiwiaG90ZWxGaWx0ZXIiLCJob3RlbERldGFpbHNDb25zdGFudCIsInNhdmVkRmlsdGVycyIsImxvYWRGaWx0ZXJzIiwia2V5IiwibWluIiwibWF4IiwiZm9yRWFjaCIsImlzSG90ZWxNYXRjaGluZ0ZpbHRlcnMiLCJmaWx0ZXJzSW5Hcm91cCIsIm1hdGNoQXRMZWFzZU9uZUZpbHRlciIsInJldmVyc2VGaWx0ZXJNYXRjaGluZyIsImdldEhvdGVsUHJvcCIsImxvY2F0aW9uIiwiY291bnRyeSIsImVudmlyb25tZW50IiwiZGV0YWlscyIsInNjcm9sbFRvVG9wRGlyZWN0aXZlIiwic2Nyb2xsVG9Ub3BEaXJlY3RpdmVMaW5rIiwic2VsZWN0b3IiLCJoZWlnaHQiLCJ0cmltIiwic2Nyb2xsVG9Ub3BDb25maWciLCJzY3JvbGxUb1RvcCIsIlNlYXJjaENvbnRyb2xsZXIiLCJxdWVyeSIsInNlYXJjaCIsInBhcnNlZFF1ZXJ5Iiwic3BsaXQiLCJob3RlbENvbnRlbnQiLCJyZWdpb24iLCJkZXNjIiwiZGVzY0xvY2F0aW9uIiwibWF0Y2hlc0NvdW50ZXIiLCJxUmVnRXhwIiwiUmVnRXhwIiwibWF0Y2giLCJfaWQiLCJzZWFyY2hSZXN1bHRzIiwiX21hdGNoZXMiLCJhaHRsVG9wM0RpcmVjdGl2ZSIsIkFodGxUb3AzQ29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsIiRlbGVtZW50IiwiJGF0dHJzIiwicmVzb3J0VHlwZSIsImFodGxUb3AzdHlwZSIsInJlc29ydCIsImdldEltZ1NyYyIsImluZGV4IiwiZmlsZW5hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWwiLCJkZXRhaWwiLCJkZXRhaWxDbGFzc05hbWUiLCJpc1Jlc29ydEluY2x1ZGVEZXRhaWxDbGFzc05hbWUiLCJfc2hvd0luVG9wIiwiYW5pbWF0aW9uIiwiYW5pbWF0aW9uRnVuY3Rpb24iLCJiZWZvcmVBZGRDbGFzcyIsImNsYXNzTmFtZSIsImRvbmUiLCJzbGlkaW5nRGlyZWN0aW9uIiwiYWh0bFNsaWRlciIsInNsaWRlclNlcnZpY2UiLCJhaHRsU2xpZGVyQ29udHJvbGxlciIsInNsaWRlciIsIm5leHRTbGlkZSIsInByZXZTbGlkZSIsInNldFNsaWRlIiwic2V0TmV4dFNsaWRlIiwic2V0UHJldlNsaWRlIiwiZ2V0Q3VycmVudFNsaWRlIiwic2V0Q3VycmVudFNsaWRlIiwiZml4SUU4cG5nQmxhY2tCZyIsImFycm93cyIsImNsaWNrIiwiZGlzYWJsZWQiLCJzbGlkZXJJbWdQYXRoQ29uc3RhbnQiLCJTbGlkZXIiLCJzbGlkZXJJbWFnZUxpc3QiLCJfaW1hZ2VTcmNMaXN0IiwiX2N1cnJlbnRTbGlkZSIsImdldEltYWdlU3JjTGlzdCIsImdldEluZGV4Iiwic2xpZGUiLCJQYWdlcyIsImhvdGVsc1BlclBhZ2UiLCJjdXJyZW50UGFnZSIsInBhZ2VzVG90YWwiLCJzaG93RnJvbSIsInNob3dOZXh0Iiwic2hvd1ByZXYiLCJzZXRQYWdlIiwicGFnZSIsImlzTGFzdFBhZ2UiLCJpc0ZpcnN0UGFnZSIsInNob3dIb3RlbENvdW50IiwiY2VpbCIsInN0YXJ0UG9zaXRpb24iLCJwcmljZVNsaWRlckRpcmVjdGl2ZSIsImxlZnRTbGlkZXIiLCJyaWdodFNsaWRlciIsInByaWNlU2xpZGVyRGlyZWN0aXZlTGluayIsInJpZ2h0QnRuIiwibGVmdEJ0biIsInNsaWRlQXJlYVdpZHRoIiwidmFsdWVQZXJTdGVwIiwidmFsIiwiaW5pdERyYWciLCJkcmFnRWxlbSIsImluaXRQb3NpdGlvbiIsIm1heFBvc2l0aW9uIiwibWluUG9zaXRpb24iLCJzaGlmdCIsImJ0bk9uTW91c2VEb3duIiwicGFnZVgiLCJkb2NPbk1vdXNlTW92ZSIsImJ0bk9uTW91c2VVcCIsInBvc2l0aW9uTGVzc1RoYW5NYXgiLCJwb3NpdGlvbkdyYXRlclRoYW5NaW4iLCJzZXRQcmljZXMiLCJlbWl0IiwibmV3TWluIiwibmV3TWF4Iiwic2V0U2xpZGVycyIsImJ0biIsIm5ld1Bvc3Rpb24iLCJ0cmlnZ2VyIiwiYWh0bFNsaWRlT25DbGlja0RpcmVjdGl2ZSIsImFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rIiwic2xpZGVFbWl0RWxlbWVudHMiLCJzbGlkZUVtaXRPbkNsaWNrIiwic2xpZGVPbkVsZW1lbnQiLCJzbGlkZVVwIiwib25TbGlkZUFuaW1hdGlvbkNvbXBsZXRlIiwic2xpZGVEb3duIiwic2xpZGVUb2dnbGVFbGVtZW50cyIsImVhY2giLCJ0b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQUEsQ0FBQyxZQUFXO0lBQ1I7O0lBRUFBLFFBQ0tDLE9BQU8sYUFBYSxDQUFDLGFBQWEsYUFBYTtLQUp4RDtBQ0FBOztBQUFBLENBQUMsWUFBVztJQUNSOztJQUVBRCxRQUNLQyxPQUFPLGFBQ1BDLG9CQUFPLFVBQVVDLFVBQVU7UUFDeEJBLFNBQVNDLFVBQVUsaUNBQVEsVUFBVUMsV0FBV0MsU0FBUztZQUNyRCxJQUFJQyxhQUFhO2dCQUNUQyxNQUFNO2dCQUNOQyxLQUFLOzs7WUFHYkosVUFBVUssTUFBTSxVQUFVQyxTQUFTOztZQUduQyxJQUFJQyxXQUFXUCxVQUFVRztZQUN6QkgsVUFBVUcsT0FBTyxVQUFVRyxTQUFTO2dCQUNoQ0osV0FBV0MsS0FBS0ssS0FBS0Y7Z0JBQ3JCQyxTQUFTRSxNQUFNLE1B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O2dCQUVsQyxJQUFJLENBQUM4UCxrQkFBa0I3YyxRQUFRO29CQUMzQndELEtBQUt0RSxLQUFMOztvQkFFQTs7O2dCQUdKLElBQUk2ZCxlQUFlelMsS0FBSyxnQkFBZ0IsTUFBTXlTLGVBQWV6UyxLQUFLLGdCQUFnQixVQUFVO29CQUN4RjlHLEtBQUt0RSxLQUFMOztvQkFFQTs7O2dCQUdKLElBQUk2ZCxlQUFlelMsS0FBSyxnQkFBZ0IsSUFBSTtvQkFDeEN5UyxlQUFlQyxRQUFRLFFBQVFDO29CQUMvQkYsZUFBZXpTLEtBQUssWUFBWTt1QkFDN0I7b0JBQ0gyUztvQkFDQUYsZUFBZUcsVUFBVTtvQkFDekJILGVBQWV6UyxLQUFLLFlBQVk7OztnQkFHcEMsU0FBUzJTLDJCQUEyQjtvQkFDaEMsSUFBSUUsc0JBQXNCamIsRUFBRWtELE1BQU0ySCxLQUFLOztvQkFFdkM3SyxFQUFFa2IsS0FBS0QscUJBQXFCLFlBQVc7d0JBQ25DamIsRUFBRSxNQUFNbWIsWUFBWW5iLEVBQUUsTUFBTW9JLEtBQUs7Ozs7OztLQXREekQiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnLCBbJ3VpLnJvdXRlcicsICduZ0FuaW1hdGUnLCAnNzIwa2Iuc29jaWFsc2hhcmUnXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24gKCRwcm92aWRlKSB7XHJcbiAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcignJGxvZycsIGZ1bmN0aW9uICgkZGVsZWdhdGUsICR3aW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsb2dIaXN0b3J5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmxvZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nV2FybiA9ICRkZWxlZ2F0ZS53YXJuO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLndhcm4gPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ0hpc3Rvcnkud2Fybi5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9sb2dXYXJuLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBfbG9nRXJyID0gJGRlbGVnYXRlLmVycm9yO1xyXG4gICAgICAgICAgICAgICAgJGRlbGVnYXRlLmVycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dIaXN0b3J5LmVyci5wdXNoKHtuYW1lOiBtZXNzYWdlLCBzdGFjazogbmV3IEVycm9yKCkuc3RhY2t9KTtcclxuICAgICAgICAgICAgICAgICAgICBfbG9nRXJyLmFwcGx5KG51bGwsIFttZXNzYWdlXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiBzZW5kT25VbmxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2dIaXN0b3J5LmVyci5sZW5ndGggJiYgIWxvZ0hpc3Rvcnkud2Fybi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKCdwb3N0JywgJy9hcGkvbG9nJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkobG9nSGlzdG9yeSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkZGVsZWdhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpO1xyXG5cclxuLypcclxuICAgICAgICAuZmFjdG9yeSgnbG9nJywgbG9nKTtcclxuXHJcbiAgICBsb2cuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbG9nKCR3aW5kb3csICRsb2cpIHtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHdhcm4oLi4uYXJncykge1xyXG4gICAgICAgICAgICBsb2dIaXN0b3J5Lndhcm4ucHVzaChhcmdzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChicm93c2VyTG9nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKGUpIHtcclxuICAgICAgICAgICAgbG9nSGlzdG9yeS5lcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICBzdGFjazogZS5zdGFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJGxvZy5lcnJvcihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdG9kbyBhbGwgZXJyb3JzXHJcblxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2Fybjogd2FybixcclxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgICAgICAgICBzZW5kT25VbmxvYWQ6IHNlbmRPblVubG9hZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsqL1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5jb25maWcoY29uZmlnKTtcclxuXHJcblx0Y29uZmlnLiRpbmplY3QgPSBbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xyXG5cclxuXHRmdW5jdGlvbiBjb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcclxuXHRcdCRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcclxuXHJcblx0XHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXJcclxuXHRcdFx0LnN0YXRlKCdob21lJywge1xyXG5cdFx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2hvbWUvaG9tZS5odG1sJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2F1dGgnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2F1dGgnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2F1dGgvYXV0aC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsndHlwZSc6ICdsb2dpbid9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnYnVuZ2Fsb3dzJywge1xyXG5cdFx0XHRcdHVybDogJy9idW5nYWxvd3MnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9idW5nYWxvd3MuaHRtbCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdob3RlbHMnLCB7XHJcblx0XHRcdFx0XHR1cmw6ICcvdG9wJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3RvcC9ob3RlbHMuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ3ZpbGxhcycsIHtcclxuXHRcdFx0XHR1cmw6ICcvdmlsbGFzJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdmlsbGFzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ2FsbGVyeScsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ2FsbGVyeScsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5Lmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZ3Vlc3Rjb21tZW50cycsIHtcclxuXHRcdFx0XHR1cmw6ICcvZ3Vlc3Rjb21tZW50cycsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ3Vlc3Rjb21tZW50cy9ndWVzdGNvbW1lbnRzLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgnZGVzdGluYXRpb25zJywge1xyXG5cdFx0XHRcdFx0dXJsOiAnL2Rlc3RpbmF0aW9ucycsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9kZXN0aW5hdGlvbnMvZGVzdGluYXRpb25zLmh0bWwnXHJcblx0XHRcdH0pXHJcblx0XHRcdC5zdGF0ZSgncmVzb3J0Jywge1xyXG5cdFx0XHRcdHVybDogJy9yZXNvcnQnLFxyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9yZXNvcnQuaHRtbCcsXHJcblx0XHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdFx0Y3VycmVudEZpbHRlcnM6IHt9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuc3RhdGUoJ2Jvb2tpbmcnLCB7XHJcblx0XHRcdFx0dXJsOiAnL2Jvb2tpbmc/aG90ZWxJZCcsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvYm9va2luZy9ib29raW5nLmh0bWwnLFxyXG5cdFx0XHRcdHBhcmFtczogeydob3RlbElkJzogJ2hvdGVsIElkJ31cclxuXHRcdFx0fSlcclxuXHRcdFx0LnN0YXRlKCdzZWFyY2gnLCB7XHJcblx0XHRcdFx0dXJsOiAnL3NlYXJjaD9xdWVyeScsXHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvc2VhcmNoL3NlYXJjaC5odG1sJyxcclxuXHRcdFx0XHRwYXJhbXM6IHsncXVlcnknOiAnc2VhcmNoIHF1ZXJ5J31cclxuXHRcdFx0fSk7XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAucnVuKHJ1bik7XHJcblxyXG4gICAgcnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnICwgJyR0aW1lb3V0J107XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuKCRyb290U2NvcGUsICR0aW1lb3V0KSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJHN0YXRlID0ge1xyXG4gICAgICAgICAgICBjdXJyZW50U3RhdGVOYW1lOiBudWxsLFxyXG4gICAgICAgICAgICBjdXJyZW50U3RhdGVQYXJhbXM6IG51bGwsXHJcbiAgICAgICAgICAgIHN0YXRlSGlzdG9yeTogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSwgZnJvbVBhcmFtcyl7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZU5hbWUgPSB0b1N0YXRlLm5hbWU7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJHN0YXRlLmN1cnJlbnRTdGF0ZVBhcmFtcyA9IHRvUGFyYW1zO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnkucHVzaCh0b1N0YXRlLm5hbWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkKHdpbmRvdykuc2Nyb2xsVG9wKDApKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnN0YW50KCdiYWNrZW5kUGF0aHNDb25zdGFudCcsIHtcclxuICAgICAgICAgICAgdG9wMzogJy9hcGkvdG9wMycsXHJcbiAgICAgICAgICAgIGF1dGg6ICcvYXBpL3VzZXJzJyxcclxuICAgICAgICAgICAgZ2FsbGVyeTogJy9hcGkvZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIGd1ZXN0Y29tbWVudHM6ICcvYXBpL2d1ZXN0Y29tbWVudHMnLFxyXG4gICAgICAgICAgICBob3RlbHM6ICcvYXBpL2hvdGVscycsXHJcbiAgICAgICAgICAgIGJvb2tpbmc6ICcvYm9va2luZydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jb25zdGFudCgndGVtcGxhdGVzUGF0aHNDb25zdGFudCcsIFtcclxuICAgICAgICAgICAgJ2FwcC9wYXJ0aWFscy9hdXRoL2F1dGguaHRtbCdcclxuICAgICAgICBdKVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29uc3RhbnQoJ2hvdGVsRGV0YWlsc0NvbnN0YW50Jywge1xyXG4gICAgICAgICAgICB0eXBlczogW1xyXG4gICAgICAgICAgICAgICAgJ0hvdGVsJyxcclxuICAgICAgICAgICAgICAgICdCdW5nYWxvdycsXHJcbiAgICAgICAgICAgICAgICAnVmlsbGEnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nczogW1xyXG4gICAgICAgICAgICAgICAgJ0NvYXN0JyxcclxuICAgICAgICAgICAgICAgICdDaXR5JyxcclxuICAgICAgICAgICAgICAgICdEZXNlcnQnXHJcbiAgICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICdOYW1pYmlhJyxcclxuICAgICAgICAgICAgICAgICdMaWJ5YScsXHJcbiAgICAgICAgICAgICAgICAnU291dGggQWZyaWNhJyxcclxuICAgICAgICAgICAgICAgICdUYW56YW5pYScsXHJcbiAgICAgICAgICAgICAgICAnUGFwdWEgTmV3IEd1aW5lYScsXHJcbiAgICAgICAgICAgICAgICAnUmV1bmlvbicsXHJcbiAgICAgICAgICAgICAgICAnU3dhemlsYW5kJyxcclxuICAgICAgICAgICAgICAgICdTYW8gVG9tZScsXHJcbiAgICAgICAgICAgICAgICAnTWFkYWdhc2NhcicsXHJcbiAgICAgICAgICAgICAgICAnTWF1cml0aXVzJyxcclxuICAgICAgICAgICAgICAgICdTZXljaGVsbGVzJyxcclxuICAgICAgICAgICAgICAgICdNYXlvdHRlJyxcclxuICAgICAgICAgICAgICAgICdVa3JhaW5lJ1xyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgZ3Vlc3RzOiBbXHJcbiAgICAgICAgICAgICAgICAnMScsXHJcbiAgICAgICAgICAgICAgICAnMicsXHJcbiAgICAgICAgICAgICAgICAnMycsXHJcbiAgICAgICAgICAgICAgICAnNCcsXHJcbiAgICAgICAgICAgICAgICAnNSdcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIG11c3RIYXZlczogW1xyXG4gICAgICAgICAgICAgICAgJ3Jlc3RhdXJhbnQnLFxyXG4gICAgICAgICAgICAgICAgJ2tpZHMnLFxyXG4gICAgICAgICAgICAgICAgJ3Bvb2wnLFxyXG4gICAgICAgICAgICAgICAgJ3NwYScsXHJcbiAgICAgICAgICAgICAgICAnd2lmaScsXHJcbiAgICAgICAgICAgICAgICAncGV0JyxcclxuICAgICAgICAgICAgICAgICdkaXNhYmxlJyxcclxuICAgICAgICAgICAgICAgICdiZWFjaCcsXHJcbiAgICAgICAgICAgICAgICAncGFya2luZycsXHJcbiAgICAgICAgICAgICAgICAnY29uZGl0aW9uaW5nJyxcclxuICAgICAgICAgICAgICAgICdsb3VuZ2UnLFxyXG4gICAgICAgICAgICAgICAgJ3RlcnJhY2UnLFxyXG4gICAgICAgICAgICAgICAgJ2dhcmRlbicsXHJcbiAgICAgICAgICAgICAgICAnZ3ltJyxcclxuICAgICAgICAgICAgICAgICdiaWN5Y2xlcydcclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIGFjdGl2aXRpZXM6IFtcclxuICAgICAgICAgICAgICAgICdDb29raW5nIGNsYXNzZXMnLFxyXG4gICAgICAgICAgICAgICAgJ0N5Y2xpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0Zpc2hpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ0dvbGYnLFxyXG4gICAgICAgICAgICAgICAgJ0hpa2luZycsXHJcbiAgICAgICAgICAgICAgICAnSG9yc2UtcmlkaW5nJyxcclxuICAgICAgICAgICAgICAgICdLYXlha2luZycsXHJcbiAgICAgICAgICAgICAgICAnTmlnaHRsaWZlJyxcclxuICAgICAgICAgICAgICAgICdTYWlsaW5nJyxcclxuICAgICAgICAgICAgICAgICdTY3ViYSBkaXZpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3BwaW5nIC8gbWFya2V0cycsXHJcbiAgICAgICAgICAgICAgICAnU25vcmtlbGxpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1NraWluZycsXHJcbiAgICAgICAgICAgICAgICAnU3VyZmluZycsXHJcbiAgICAgICAgICAgICAgICAnV2lsZGxpZmUnLFxyXG4gICAgICAgICAgICAgICAgJ1dpbmRzdXJmaW5nJyxcclxuICAgICAgICAgICAgICAgICdXaW5lIHRhc3RpbmcnLFxyXG4gICAgICAgICAgICAgICAgJ1lvZ2EnIFxyXG4gICAgICAgICAgICBdLFxyXG5cclxuICAgICAgICAgICAgcHJpY2U6IFtcclxuICAgICAgICAgICAgICAgIFwibWluXCIsXHJcbiAgICAgICAgICAgICAgICBcIm1heFwiXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZhY3RvcnkoJ3Jlc29ydFNlcnZpY2UnLCByZXNvcnRTZXJ2aWNlKTtcclxuXHJcbiAgICByZXNvcnRTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJyRxJywgJyRsb2cnLCAnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlc29ydFNlcnZpY2UoJGh0dHAsIGJhY2tlbmRQYXRoc0NvbnN0YW50LCAkcSwgJGxvZywgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIGxldCBtb2RlbCA9IG51bGw7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlc29ydChmaWx0ZXIpIHtcclxuICAgICAgICAgICAgLy90b2RvIGVycm9yczogbm8gaG90ZWxzLCBubyBmaWx0ZXIuLi5cclxuICAgICAgICAgICAgaWYgKG1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihhcHBseUZpbHRlcihtb2RlbCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihvblJlc29sdmUsIG9uUmVqZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwbHlGaWx0ZXIobW9kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoYENhbnQgZ2V0ICR7YmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzfWApO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkaXNwbGF5RXJyb3InLCB7c2hvdzogdHJ1ZX0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVyKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWxcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyLnByb3AgPT09ICdfaWQnICYmIGZpbHRlci52YWx1ZSA9PT0gJ3JhbmRvbScpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGlzY291bnRNb2RlbCA9IG1vZGVsLmZpbHRlcigoaG90ZWwpID0+IGhvdGVsWydkaXNjb3VudCddKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcm5kSG90ZWwgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoZGlzY291bnRNb2RlbC5sZW5ndGgpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2Rpc2NvdW50TW9kZWxbcm5kSG90ZWxdXVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBtb2RlbC5maWx0ZXIoKGhvdGVsKSA9PiBob3RlbFtmaWx0ZXIucHJvcF0gPT0gZmlsdGVyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoJ0NhbnQgcGFyc2UgcmVzcG9uc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2Rpc3BsYXlFcnJvcicsIHtzaG93OiB0cnVlLCBtZXNzYWdlOiAnRXJyb3Igb2NjdXJyZWQnfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFJlc29ydDogZ2V0UmVzb3J0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bERpc3BsYXlFcnJvcicsIGRpc3BsYXlFcnJvckRpcmVjdGl2ZSk7XHJcblxyXG4gICAgZGlzcGxheUVycm9yRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRpc3BsYXlFcnJvckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsIGVsZW0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRFcnJvck1zZyA9ICdDb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXIuIFJlZnJlc2ggdGhlIHBhZ2Ugb3IgdHJ5IGFnYWluIGxhdGVyLic7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignZGlzcGxheUVycm9yJywgKGV2ZW50LCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNob3cgPSBkYXRhLnNob3cgPyAnYmxvY2snIDogJ25vbmUnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLnRleHQoZGF0YS5tZXNzYWdlIHx8IGRlZmF1bHRFcnJvck1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbGVtKS5jc3MoJ2Rpc3BsYXknLCBzaG93KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbGVtKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2F1dGhTZXJ2aWNlJywgJyRzdGF0ZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dGhDb250cm9sbGVyKCRyb290U2NvcGUsICRzY29wZSwgYXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cyA9IHtcclxuICAgICAgICAgICAgdXNlckFscmVhZHlFeGlzdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3Q6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmNyZWF0ZVVzZXIodGhpcy5uZXdVc2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhdXRoJywgeyd0eXBlJzogJ2xvZ2luJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uU3RhdHVzLnVzZXJBbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCRzY29wZS5mb3JtSm9pbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3VXNlcik7Ki9cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5zaWduSW4odGhpcy51c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlID09PSAnT0snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHByZXZpb3VzU3RhdGUgPSAkcm9vdFNjb3BlLiRzdGF0ZS5zdGF0ZUhpc3RvcnlbJHJvb3RTY29wZS4kc3RhdGUuc3RhdGVIaXN0b3J5Lmxlbmd0aCAtIDJdIHx8ICdob21lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJldmlvdXNTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhwcmV2aW91c1N0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvblN0YXR1cy5sb2dpbk9yUGFzc3dvcmRJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZmFjdG9yeSgnYXV0aFNlcnZpY2UnLCBhdXRoU2VydmljZSk7XHJcblxyXG4gICAgYXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGF1dGhTZXJ2aWNlKCRyb290U2NvcGUsICRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCkge1xyXG4gICAgICAgIC8vdG9kbyBlcnJvcnNcclxuICAgICAgICBmdW5jdGlvbiBVc2VyKGJhY2tlbmRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2VuZEFwaSA9IGJhY2tlbmRBcGk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVzb2x2ZSA9IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyLnNhdmVUb2tlbihyZXNwb25zZS5kYXRhLnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdPSydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uUmVqZWN0ZWQgPSBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuS2VlcGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzYXZlVG9rZW4oX3Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kbG9nZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKHRva2VuKVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRva2VuKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZWxldGVUb2tlbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlVG9rZW46IHNhdmVUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnZXRUb2tlbjogZ2V0VG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlVG9rZW46IGRlbGV0ZVRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLl9iYWNrZW5kQXBpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncHV0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblJlc29sdmUsIHRoaXMuX29uUmVqZWN0ZWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFVzZXIucHJvdG90eXBlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuX2JhY2tlbmRBcGksXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5fY3JlZGVudGlhbHNcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uUmVzb2x2ZSwgdGhpcy5fb25SZWplY3RlZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgVXNlci5wcm90b3R5cGUuc2lnbk91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRsb2dnZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5LZWVwZXIuZGVsZXRlVG9rZW4oKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBVc2VyLnByb3RvdHlwZS5nZXRMb2dJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogdGhpcy5fY3JlZGVudGlhbHMsXHJcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5fdG9rZW5LZWVwZXIuZ2V0VG9rZW4oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVc2VyKGJhY2tlbmRQYXRoc0NvbnN0YW50LmF1dGgpO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignQm9va2luZ0NvbnRyb2xsZXInLCBCb29raW5nQ29udHJvbGxlcik7XHJcblxyXG4gICAgQm9va2luZ0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJHN0YXRlUGFyYW1zJywgJ3Jlc29ydFNlcnZpY2UnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBCb29raW5nQ29udHJvbGxlcigkc3RhdGVQYXJhbXMsIHJlc29ydFNlcnZpY2UsICRzdGF0ZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgIHRoaXMuaG90ZWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJlc29ydFNlcnZpY2UuZ2V0UmVzb3J0KHtcclxuICAgICAgICAgICAgICAgIHByb3A6ICdfaWQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICRzdGF0ZVBhcmFtcy5ob3RlbElkfSlcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhvdGVsID0gcmVzcG9uc2VbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL3RoaXMuaG90ZWwgPSAkc3RhdGVQYXJhbXMuaG90ZWw7XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0SG90ZWxJbWFnZXNDb3VudCA9IGZ1bmN0aW9uKGNvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQXJyYXkoY291bnQgLSAxKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm9wZW5JbWFnZSA9IGZ1bmN0aW9uKCRldmVudCkge1xyXG4gICAgICAgICAgICBsZXQgaW1nU3JjID0gJGV2ZW50LnRhcmdldC5zcmM7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW1nU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNyYzogaW1nU3JjXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0Jvb2tpbmdGb3JtQ29udHJvbGxlcicsIEJvb2tpbmdGb3JtQ29udHJvbGxlcik7XHJcblxyXG4gICAgQm9va2luZ0Zvcm1Db250cm9sbGVyLiRpbmplY3QgPSBbJyRodHRwJywgJ2JhY2tlbmRQYXRoc0NvbnN0YW50JywgJyRzY29wZScsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gQm9va2luZ0Zvcm1Db250cm9sbGVyKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgJHNjb3BlLCAkbG9nKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHRoaXMuc2hvd0Zvcm0gPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmZvcm0gPSB7XHJcbiAgICAgICAgICAgIGRhdGU6ICdwaWNrIGRhdGUnLFxyXG4gICAgICAgICAgICBndWVzdHM6IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEd1ZXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcm0uZ3Vlc3RzICE9PSA1ID8gdGhpcy5mb3JtLmd1ZXN0cysrIDogdGhpcy5mb3JtLmd1ZXN0c1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlR3Vlc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5ndWVzdHMgIT09IDEgPyB0aGlzLmZvcm0uZ3Vlc3RzLS0gOiB0aGlzLmZvcm0uZ3Vlc3RzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zdWJtaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuYm9va2luZyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZm9ybVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93Rm9ybSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcjogJ1lvdXIgcmVxdWVzdCBpcyBpbiBwcm9jZXNzLicsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1dlIHdpbGwgc2VuZCB5b3UgZW1haWwgd2l0aCBhbGwgaW5mb3JtYXRpb24gYWJvdXQgeW91ciB0cmF2ZWwuJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoJ0NhbnQgcG9zdCAvYm9va2luZycpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ2Rpc3BsYXlFcnJvcicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdTZXJ2ZXIgaXMgbm90IHJlc3BvbmRpbmcuIFRyeSBhZ2FpbiBvciBjYWxsIGhvdGxpbmU6ICswIDEyMyA0NTYgODknXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgIH0sIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgaWYgKCFyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnZGF0ZVBpY2tlcicsIGRhdGVQaWNrZXJEaXJlY3RpdmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJEaXJlY3RpdmUoJGludGVydmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxyXG4gICAgICAgICAgICAvKnNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsOiAnPSdcclxuICAgICAgICAgICAgfSwqL1xyXG4gICAgICAgICAgICBsaW5rOiBkYXRlUGlja2VyRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRhdGVQaWNrZXJEaXJlY3RpdmVMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICAvL3RvZG8gYWxsXHJcbiAgICAgICAgICAgICQoJ1tkYXRlLXBpY2tlcl0nKS5kYXRlUmFuZ2VQaWNrZXIoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGU6IG5ldyBEYXRlKCkuc2V0RnVsbFllYXIobmV3IERhdGUoKS5nZXRGdWxsWWVhcigpICsgMSksXHJcbiAgICAgICAgICAgICAgICB9KS5iaW5kKCdkYXRlcGlja2VyLWZpcnN0LWRhdGUtc2VsZWN0ZWQnLCBmdW5jdGlvbihldmVudCwgb2JqKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFRoaXMgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiBmaXJzdCBkYXRlIGlzIHNlbGVjdGVkICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZpcnN0LWRhdGUtc2VsZWN0ZWQnLG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqIHdpbGwgYmUgc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgICAgICAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRhdGUxOiAoRGF0ZSBvYmplY3Qgb2YgdGhlIGVhcmxpZXIgZGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2hhbmdlJyxmdW5jdGlvbihldmVudCxvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHNlY29uZCBkYXRlIGlzIHNlbGVjdGVkICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoYW5nZScsb2JqKTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLiRzZXRWaWV3VmFsdWUob2JqLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBvYmogd2lsbCBiZSBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTE6IChEYXRlIG9iamVjdCBvZiB0aGUgZWFybGllciBkYXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGF0ZTI6IChEYXRlIG9iamVjdCBvZiB0aGUgbGF0ZXIgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy9cdCBcdHZhbHVlOiBcIjIwMTMtMDYtMDUgdG8gMjAxMy0wNi0wN1wiXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5iaW5kKCdkYXRlcGlja2VyLWFwcGx5JyxmdW5jdGlvbihldmVudCxvYmopXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHVzZXIgY2xpY2tzIG9uIHRoZSBhcHBseSBidXR0b24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXBwbHknLG9iaik7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2xvc2UnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGJlZm9yZSBkYXRlIHJhbmdlIHBpY2tlciBjbG9zZSBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYmVmb3JlIGNsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmJpbmQoJ2RhdGVwaWNrZXItY2xvc2VkJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBhZnRlciBkYXRlIHJhbmdlIHBpY2tlciBjbG9zZSBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1vcGVuJyxmdW5jdGlvbigpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogVGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBiZWZvcmUgZGF0ZSByYW5nZSBwaWNrZXIgb3BlbiBhbmltYXRpb24gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYmVmb3JlIG9wZW4nKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYmluZCgnZGF0ZXBpY2tlci1vcGVuZWQnLGZ1bmN0aW9uKClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBUaGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGFmdGVyIGRhdGUgcmFuZ2UgcGlja2VyIG9wZW4gYW5pbWF0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIG9wZW4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsTWFwJywgYWh0bE1hcERpcmVjdGl2ZSk7XG5cbiAgICBhaHRsTWFwRGlyZWN0aXZlLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnXTtcblxuICAgIGZ1bmN0aW9uIGFodGxNYXBEaXJlY3RpdmUocmVzb3J0U2VydmljZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImRlc3RpbmF0aW9uc19fbWFwXCI+PC9kaXY+JyxcbiAgICAgICAgICAgIGxpbms6IGFodGxNYXBEaXJlY3RpdmVMaW5rXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gYWh0bE1hcERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtLCBhdHRyKSB7XG4gICAgICAgICAgICBsZXQgaG90ZWxzID0gbnVsbDtcblxuICAgICAgICAgICAgcmVzb3J0U2VydmljZS5nZXRSZXNvcnQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIGNyZWF0ZU1hcCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU1hcCgpIHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xuICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBtYXBTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICBtYXBTY3JpcHQuc3JjID0gJ2h0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9qcz9rZXk9QUl6YVN5Qnh4Q0syLXVWeWw2OXduN0s2MU5QQVFEZjd5SC1qZjN3Jmxhbmd1YWdlPWVuJztcbiAgICAgICAgICAgICAgICBtYXBTY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcFNjcmlwdCk7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbG9jYXRpb25zID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3RlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9ucy5wdXNoKFtob3RlbHNbaV0ubmFtZSwgaG90ZWxzW2ldLl9nbWFwcy5sYXQsIGhvdGVsc1tpXS5fZ21hcHMubG5nXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsZXQgbXlMYXRMbmcgPSB7bGF0OiAtMjUuMzYzLCBsbmc6IDEzMS4wNDR9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvYmplY3QgYW5kIHNwZWNpZnkgdGhlIERPTSBlbGVtZW50IGZvciBkaXNwbGF5LlxuICAgICAgICAgICAgICAgICAgICBsZXQgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkZXN0aW5hdGlvbnNfX21hcCcpWzBdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGljb25zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWhvdGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGxvY2F0aW9uc1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSg4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKHRoaXMuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qY2VudGVyaW5nKi9cbiAgICAgICAgICAgICAgICAgICAgbGV0IGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBMYXRMYW5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsb2NhdGlvbnNbaV1bMV0sIGxvY2F0aW9uc1tpXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkdGltZW91dCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge30sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS5hbGlnbi5odG1sJyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rKCRzY29wZSkge1xyXG4gICAgICAgICAgICBsZXQgaW1hZ2VzSW5HYWxsZXJ5ID0gMjA7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDIwOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWcgPSAkKCc8ZGl2IGNsYXNzPVwiaXRlbVwiPjxpbWcgc3JjPVwiYXNzZXRzL2ltYWdlcy9nYWxsZXJ5L3ByZXZpZXcnICsgKGkgKyAxKSArICcuanBnXCIgd2lkdGg9XCIzMDBcIj48L2Rpdj4nKVxyXG4gICAgICAgICAgICAgICAgaW1nLmZpbmQoJ2ltZycpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdsb2FkJywgaW1hZ2VMb2FkZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsIGltYWdlQ2xpY2tlZC5iaW5kKG51bGwsIGkpKTtcclxuICAgICAgICAgICAgICAgICQoJ1tnYWxsZXJ5LWNvbnRhaW5lcl0nKS5hcHBlbmQoaW1nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlc0xvYWRlZCA9IDA7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGltYWdlTG9hZGVkKCkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VzTG9hZGVkKys7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGltYWdlc0xvYWRlZCA9PT0gaW1hZ2VzSW5HYWxsZXJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoICQoXCJodG1sXCIpLmhhc0NsYXNzKFwiaWU4XCIpICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSW1hZ2VzKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW1hZ2VDbGlja2VkKGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VTcmMgPSAnYXNzZXRzL2ltYWdlcy9nYWxsZXJ5LycgKyArK2ltYWdlICsgJy5qcGcnO1xyXG5cclxuICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VTcmNcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBhbGlnbkltYWdlcygpe1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG1hc29ucnkgPSBuZXcgTWFzb25yeShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5XaWR0aDogJy5pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICBpdGVtU2VsZWN0b3I6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgZ3V0dGVyOiAnLmd1dHRlci1zaXplcicsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiAnMC4ycycsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBtYXNvbnJ5Lm9uKCdsYXlvdXRDb21wbGV0ZScsIG9uTGF5b3V0Q29tcGxldGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIG1hc29ucnkubGF5b3V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25MYXlvdXRDb21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiAkKGNvbnRhaW5lcikuY3NzKCdvcGFjaXR5JywgJzEnKSwgMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG5cclxuLypcclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgICAgICAuZGlyZWN0aXZlKCdhaHRsR2FsbGVyeScsIGFodGxHYWxsZXJ5RGlyZWN0aXZlKTtcclxuXHJcbiAgICAgICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnJHRpbWVvdXQnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnLCAncHJlbG9hZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlEaXJlY3RpdmUoJGh0dHAsICR0aW1lb3V0LCBiYWNrZW5kUGF0aHNDb25zdGFudCwgcHJlbG9hZFNlcnZpY2UpIHsgLy90b2RvIG5vdCBvbmx5IGxvYWQgYnV0IGxpc3RTcmMgdG9vIGFjY2VwdFxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50OiAnPWFodGxHYWxsZXJ5U2hvd0ZpcnN0JyxcclxuICAgICAgICAgICAgICAgIHNob3dOZXh0SW1nQ291bnQ6ICc9YWh0bEdhbGxlcnlTaG93TmV4dCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvZ2FsbGVyeS9nYWxsZXJ5LnRlbXBsYXRlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2dhbGxlcnknLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsR2FsbGVyeUxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgIGxldCBhbGxJbWFnZXNTcmMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdEltZ0NvdW50ID0gJHNjb3BlLnNob3dGaXJzdEltZ0NvdW50LFxyXG4gICAgICAgICAgICAgICAgc2hvd05leHRJbWdDb3VudCA9ICRzY29wZS5zaG93TmV4dEltZ0NvdW50O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2hvd0ZpcnN0SW1nQ291bnQgPSBNYXRoLm1pbihzaG93Rmlyc3RJbWdDb3VudCArIHNob3dOZXh0SW1nQ291bnQsIGFsbEltYWdlc1NyYy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Rmlyc3QgPSBhbGxJbWFnZXNTcmMuc2xpY2UoMCwgc2hvd0ZpcnN0SW1nQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0FsbEltYWdlc0xvYWRlZCA9IHRoaXMuc2hvd0ZpcnN0ID49IGFsbEltYWdlc1NyYy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgLyEqJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyohL1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGxJbWFnZXNMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5zaG93Rmlyc3QpID8gdGhpcy5zaG93Rmlyc3QubGVuZ3RoID09PSB0aGlzLmltYWdlc0NvdW50OiB0cnVlXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsaWduSW1hZ2VzID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5nYWxsZXJ5IGltZycpLmxlbmd0aCA8IHNob3dGaXJzdEltZ0NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29vcHMnKTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dCh0aGlzLmFsaWduSW1hZ2VzLCAwKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBfc2V0SW1hZ2VBbGlnbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsaWduSW1hZ2VzKCk7XHJcblxyXG4gICAgICAgICAgICBfZ2V0SW1hZ2VTb3VyY2VzKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWxsSW1hZ2VzU3JjID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dGaXJzdCA9IGFsbEltYWdlc1NyYy5zbGljZSgwLCBzaG93Rmlyc3RJbWdDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc0NvdW50ID0gYWxsSW1hZ2VzU3JjLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIC8vJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBlbGVtLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGltZ1NyYyA9IGV2ZW50LnRhcmdldC5zcmM7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGltZ1NyYykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kcm9vdC4kYnJvYWRjYXN0KCdtb2RhbE9wZW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBpbWdTcmNcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgIC8hKiB2YXIgJGltYWdlcyA9ICQoJy5nYWxsZXJ5IGltZycpO1xyXG4gICAgICAgICAgICB2YXIgbG9hZGVkX2ltYWdlc19jb3VudCA9IDA7KiEvXHJcbiAgICAgICAgICAgIC8hKiRzY29wZS5hbGlnbkltYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJGltYWdlcy5sb2FkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZF9pbWFnZXNfY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZF9pbWFnZXNfY291bnQgPT0gJGltYWdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3NldEltYWdlQWxpZ21lbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vJHRpbWVvdXQoX3NldEltYWdlQWxpZ21lbnQsIDApOyAvLyB0b2RvXHJcbiAgICAgICAgICAgIH07KiEvXHJcblxyXG4gICAgICAgICAgICAvLyRzY29wZS5hbGlnbkltYWdlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2dldEltYWdlU291cmNlcyhjYikge1xyXG4gICAgICAgICAgICBjYihwcmVsb2FkU2VydmljZS5nZXRQcmVsb2FkQ2FjaGUoJ2dhbGxlcnknKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfc2V0SW1hZ2VBbGlnbWVudCgpIHsgLy90b2RvIGFyZ3VtZW50cyBuYW1pbmcsIGVycm9yc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlndXJlcyA9ICQoJy5nYWxsZXJ5X19maWd1cmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBnYWxsZXJ5V2lkdGggPSBwYXJzZUludChmaWd1cmVzLmNsb3Nlc3QoJy5nYWxsZXJ5JykuY3NzKCd3aWR0aCcpKSxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVdpZHRoID0gcGFyc2VJbnQoZmlndXJlcy5jc3MoJ3dpZHRoJykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjb2x1bW5zQ291bnQgPSBNYXRoLnJvdW5kKGdhbGxlcnlXaWR0aCAvIGltYWdlV2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnNIZWlnaHQgPSBuZXcgQXJyYXkoY29sdW1uc0NvdW50ICsgMSkuam9pbignMCcpLnNwbGl0KCcnKS5tYXAoKCkgPT4ge3JldHVybiAwfSksIC8vdG9kbyBkZWwgam9pbi1zcGxpdFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2x1bW5zSGVpZ2h0ID0gY29sdW1uc0hlaWdodC5zbGljZSgwKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAkKGZpZ3VyZXMpLmNzcygnbWFyZ2luLXRvcCcsICcwJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGZpZ3VyZXMsIGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0gPSBwYXJzZUludCgkKHRoaXMpLmNzcygnaGVpZ2h0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiBjb2x1bW5zQ291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKCdtYXJnaW4tdG9wJywgLShNYXRoLm1heC5hcHBseShudWxsLCBjb2x1bW5zSGVpZ2h0KSAtIGNvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl0pICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2N1cnJlbnRDb2x1bW5zSGVpZ2h0W2NvbHVtblBvaW50ZXJdID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ2hlaWdodCcpKSArIGNvbHVtbnNIZWlnaHRbY29sdW1uUG9pbnRlcl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2x1bW5Qb2ludGVyID09PSBjb2x1bW5zQ291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtblBvaW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnNIZWlnaHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnNIZWlnaHRbaV0gKz0gY3VycmVudENvbHVtbnNIZWlnaHRbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5Qb2ludGVyKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4vISogICAgICAgIC5jb250cm9sbGVyKCdHYWxsZXJ5Q29udHJvbGxlcicsIEdhbGxlcnlDb250cm9sbGVyKTtcclxuXHJcbiAgICBHYWxsZXJ5Q29udHJvbGxlci4kaW5qZWN0ID0gWyckc2NvcGUnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICB2YXIgaW1hZ2VzU3JjID0gX2dldEltYWdlU291cmNlcygpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGltYWdlc1NyYylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZ2V0SW1hZ2VTb3VyY2VzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogYmFja2VuZFBhdGhzQ29uc3RhbnQuZ2FsbGVyeSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0VSUk9SJzsgLy90b2RvXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyohL1xyXG5cclxuLyEqXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnYmFja2VuZFBhdGhzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkaHR0cCwgYmFja2VuZFBhdGhzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHNob3dGaXJzdDogXCI9YWh0bEdhbGxlcnlTaG93Rmlyc3RcIixcclxuICAgICAgICAgICAgICAgIHNob3dBZnRlcjogXCI9YWh0bEdhbGxlcnlTaG93QWZ0ZXJcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsR2FsbGVyeUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKCl7fVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxHYWxsZXJ5Q29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmEgPSAxMztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmEpO1xyXG4gICAgICAgICAgICAvISp2YXIgYWxsSW1hZ2VzU3JjO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLnNob3dGaXJzdEltYWdlc1NyYyA9IFsnMTIzJ107XHJcblxyXG4gICAgICAgICAgICBfZ2V0SW1hZ2VTb3VyY2VzKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vdG9kb1xyXG4gICAgICAgICAgICAgICAgYWxsSW1hZ2VzU3JjID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH0pKiEvXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcbn0pKCk7KiEvXHJcbiovXHJcblxyXG5cclxuXHJcbi8qMlxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bEdhbGxlcnknLCBhaHRsR2FsbGVyeURpcmVjdGl2ZSk7XHJcblxyXG4gICAgYWh0bEdhbGxlcnlEaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsR2FsbGVyeURpcmVjdGl2ZSgkdGltZW91dCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBzY29wZToge30sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL2dhbGxlcnkvZ2FsbGVyeS5hbGlnbi5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogYWh0bEdhbGxlcnlDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdnYWxsZXJ5JyxcclxuICAgICAgICAgICAgbGluazogYWh0bEdhbGxlcnlEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWh0bEdhbGxlcnlDb250cm9sbGVyKCRzY29wZSkge1xyXG4gICAgICAgICAgICB0aGlzLmltZ3MgPSBuZXcgQXJyYXkoMjApO1xyXG4gICAgICAgICAgICB0aGlzLmltZ3NMb2FkZWQgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub3BlbkltYWdlID0gZnVuY3Rpb24oaW1hZ2VOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VTcmMgPSAnYXNzZXRzL2ltYWdlcy9nYWxsZXJ5LycgKyBpbWFnZU5hbWUgKyAnLmpwZyc7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ21vZGFsT3BlbicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNyYzogaW1hZ2VTcmNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRyb290LiRicm9hZGNhc3QoJ2FodGxHYWxsZXJ5OmxvYWRlZCcpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxHYWxsZXJ5RGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGEsIGN0cmwpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJChlbGVtKS5maW5kKCdpbWcnKSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdhaHRsR2FsbGVyeTpsb2FkZWQnLCBhbGlnbkltYWdlcyk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBhbGlnbkltYWdlcygpe1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXNvbnJ5ID0gbmV3IE1hc29ucnkoY29udGFpbmVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbldpZHRoOiAnLml0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtU2VsZWN0b3I6ICcuaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGd1dHRlcjogJy5ndXR0ZXItc2l6ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246ICcwLjJzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdExheW91dDogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzb25yeS5vbignbGF5b3V0Q29tcGxldGUnLCBvbkxheW91dENvbXBsZXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzb25yeS5sYXlvdXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb25MYXlvdXRDb21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJChjb250YWluZXIpLmNzcygnb3BhY2l0eScsICcxJyksIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Ki9cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdHdWVzdGNvbW1lbnRzQ29udHJvbGxlcicsIEd1ZXN0Y29tbWVudHNDb250cm9sbGVyKTtcclxuXHJcbiAgICBHdWVzdGNvbW1lbnRzQ29udHJvbGxlci4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJ2d1ZXN0Y29tbWVudHNTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gR3Vlc3Rjb21tZW50c0NvbnRyb2xsZXIoJHJvb3RTY29wZSwgZ3Vlc3Rjb21tZW50c1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmNvbW1lbnRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNob3dQbGVhc2VMb2dpTWVzc2FnZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLndyaXRlQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoJHJvb3RTY29wZS4kbG9nZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtID0gdHJ1ZVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93UGxlYXNlTG9naU1lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2UuZ2V0R3Vlc3RDb21tZW50cygpLnRoZW4oXHJcbiAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2UuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZENvbW1lbnRzRXJyb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tZW50cyA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmFkZENvbW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ3Vlc3Rjb21tZW50c1NlcnZpY2VcclxuICAgICAgICAgICAgICAgIC5zZW5kQ29tbWVudCh0aGlzLmZvcm1EYXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRDb21tZW50c0Vycm9yID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2goeyduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lLCAnY29tbWVudCc6IHRoaXMuZm9ybURhdGEuY29tbWVudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1EYXRhID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcigncmV2ZXJzZScsIHJldmVyc2UpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJldmVyc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtcy5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5mYWN0b3J5KCdndWVzdGNvbW1lbnRzU2VydmljZScsIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKTtcclxuXHJcbiAgICBndWVzdGNvbW1lbnRzU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICdiYWNrZW5kUGF0aHNDb25zdGFudCcsICdhdXRoU2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGd1ZXN0Y29tbWVudHNTZXJ2aWNlKCRodHRwLCBiYWNrZW5kUGF0aHNDb25zdGFudCwgYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRHdWVzdENvbW1lbnRzOiBnZXRHdWVzdENvbW1lbnRzLFxyXG4gICAgICAgICAgICBzZW5kQ29tbWVudDogc2VuZENvbW1lbnRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRHdWVzdENvbW1lbnRzKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdnZXQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvblJlc29sdmUocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QoKSB7XHJcbiAgICAgICAgICAgICRsb2cuZXJyb3IoYENhbnQgZ2V0ICR7YmFja2VuZFBhdGhzQ29uc3RhbnQuaG90ZWxzfWApO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2Rpc3BsYXlFcnJvcicsIHtzaG93OiB0cnVlfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb21tZW50KGNvbW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXIgPSBhdXRoU2VydmljZS5nZXRMb2dJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhY2tlbmRQYXRoc0NvbnN0YW50Lmd1ZXN0Y29tbWVudHMsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdwdXQnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IHVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25SZXNvbHZlKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KCkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy5lcnJvcihgQ2FudCBnZXQgJHtiYWNrZW5kUGF0aHNDb25zdGFudC5ob3RlbHN9YCk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2Rpc3BsYXlFcnJvcicsIHtzaG93OiB0cnVlfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hlYWRlckF1dGhDb250cm9sbGVyJywgSGVhZGVyQXV0aENvbnRyb2xsZXIpO1xyXG5cclxuICAgIEhlYWRlckF1dGhDb250cm9sbGVyLiRpbmplY3QgPSBbJ2F1dGhTZXJ2aWNlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gSGVhZGVyQXV0aENvbnRyb2xsZXIoYXV0aFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnNpZ25PdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25PdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2FodGxIZWFkZXInLCBhaHRsSGVhZGVyKTtcclxuXHJcblx0ZnVuY3Rpb24gYWh0bEhlYWRlcigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUFDJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnYWhvdGVsQXBwJylcclxuXHRcdC5zZXJ2aWNlKCdIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnLCBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpO1xyXG5cclxuXHRIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvZyddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UoJHRpbWVvdXQsICRsb2cpIHtcclxuXHRcdGZ1bmN0aW9uIFVJdHJhbnNpdGlvbnMoY29udGFpbmVyKSB7XHJcblx0XHRcdGlmICghJChjb250YWluZXIpLmxlbmd0aCkge1xyXG5cdFx0XHRcdCRsb2cud2FybihgRWxlbWVudCAnJHtjb250YWluZXJ9JyBub3QgZm91bmRgKTtcclxuXHRcdFx0XHR0aGlzLl9jb250YWluZXIgPSBudWxsO1xyXG5cdFx0XHRcdHJldHVyblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5hbmltYXRlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50c1F1ZXJ5LFxyXG5cdFx0XHR7Y3NzRW51bWVyYWJsZVJ1bGUgPSAnd2lkdGgnLCBmcm9tID0gMCwgdG8gPSAnYXV0bycsIGRlbGF5ID0gMTAwfSkge1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuX2NvbnRhaW5lciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGxldCB0YXJnZXRFbGVtZW50cyA9ICQodGhpcykuZmluZCh0YXJnZXRFbGVtZW50c1F1ZXJ5KSxcclxuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnRzRmluaXNoU3RhdGU7XHJcblxyXG5cdFx0XHRcdGlmICghdGFyZ2V0RWxlbWVudHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHt0YXJnZXRFbGVtZW50c1F1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRcdHJldHVyblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCB0byk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZSA9IHRhcmdldEVsZW1lbnRzLmNzcyhjc3NFbnVtZXJhYmxlUnVsZSk7XHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuY3NzKGNzc0VudW1lcmFibGVSdWxlLCBmcm9tKTtcclxuXHJcblx0XHRcdFx0bGV0IGFuaW1hdGVPcHRpb25zID0ge307XHJcblx0XHRcdFx0YW5pbWF0ZU9wdGlvbnNbY3NzRW51bWVyYWJsZVJ1bGVdID0gdGFyZ2V0RWxlbWVudHNGaW5pc2hTdGF0ZTtcclxuXHJcblx0XHRcdFx0dGFyZ2V0RWxlbWVudHMuYW5pbWF0ZShhbmltYXRlT3B0aW9ucywgZGVsYXkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRVSXRyYW5zaXRpb25zLnByb3RvdHlwZS5yZWNhbGN1bGF0ZUhlaWdodE9uQ2xpY2sgPSBmdW5jdGlvbihlbGVtZW50VHJpZ2dlclF1ZXJ5LCBlbGVtZW50T25RdWVyeSkge1xyXG5cdFx0XHRpZiAoISQoZWxlbWVudFRyaWdnZXJRdWVyeSkubGVuZ3RoIHx8ICEkKGVsZW1lbnRPblF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtlbGVtZW50VHJpZ2dlclF1ZXJ5fSAke2VsZW1lbnRPblF1ZXJ5fSBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JChlbGVtZW50VHJpZ2dlclF1ZXJ5KS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnRPblF1ZXJ5KS5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIEhlYWRlclRyYW5zaXRpb25zKGhlYWRlclF1ZXJ5LCBjb250YWluZXJRdWVyeSkge1xyXG5cdFx0XHRVSXRyYW5zaXRpb25zLmNhbGwodGhpcywgY29udGFpbmVyUXVlcnkpO1xyXG5cclxuXHRcdFx0aWYgKCEkKGhlYWRlclF1ZXJ5KS5sZW5ndGgpIHtcclxuXHRcdFx0XHQkbG9nLndhcm4oYEVsZW1lbnQocykgJHtoZWFkZXJRdWVyeX0gbm90IGZvdW5kYCk7XHJcblx0XHRcdFx0dGhpcy5faGVhZGVyID0gbnVsbDtcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5faGVhZGVyID0gJChoZWFkZXJRdWVyeSk7XHJcblx0XHR9XHJcblxyXG5cdFx0SGVhZGVyVHJhbnNpdGlvbnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShVSXRyYW5zaXRpb25zLnByb3RvdHlwZSk7XHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZWFkZXJUcmFuc2l0aW9ucztcclxuXHJcblx0XHRIZWFkZXJUcmFuc2l0aW9ucy5wcm90b3R5cGUuZml4SGVhZGVyRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50Rml4UXVlcnksIGZpeENsYXNzTmFtZSwgdW5maXhDbGFzc05hbWUsIG9wdGlvbnMpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2hlYWRlciA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgZml4RWxlbWVudCA9ICQoZWxlbWVudEZpeFF1ZXJ5KTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCkge1xyXG5cdFx0XHRcdGxldCB0aW1lcjtcclxuXHJcblx0XHRcdFx0ZnVuY3Rpb24gZml4VW5maXhNZW51T25TY3JvbGwoKSB7XHJcblx0XHRcdFx0XHRpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gb3B0aW9ucy5vbk1pblNjcm9sbHRvcCkge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LmFkZENsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLmlubmVyV2lkdGgoKTtcclxuXHJcblx0XHRcdFx0aWYgKHdpZHRoIDwgb3B0aW9ucy5vbk1heFdpbmRvd1dpZHRoKSB7XHJcblx0XHRcdFx0XHRmaXhVbmZpeE1lbnVPblNjcm9sbCgpO1xyXG5cdFx0XHRcdFx0c2VsZi5faGVhZGVyLmFkZENsYXNzKHVuZml4Q2xhc3NOYW1lKTtcclxuXHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRpbWVyKSB7XHJcblx0XHRcdFx0XHRcdFx0dGltZXIgPSAkdGltZW91dChmaXhVbmZpeE1lbnVPblNjcm9sbCwgMTUwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNlbGYuX2hlYWRlci5yZW1vdmVDbGFzcyh1bmZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHRmaXhFbGVtZW50LnJlbW92ZUNsYXNzKGZpeENsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykub2ZmKCdzY3JvbGwnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG9uV2lkdGhDaGFuZ2VIYW5kbGVyKCk7XHJcblx0XHRcdCQod2luZG93KS5vbigncmVzaXplJywgb25XaWR0aENoYW5nZUhhbmRsZXIpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIEhlYWRlclRyYW5zaXRpb25zO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnYWh0bFN0aWt5SGVhZGVyJyxhaHRsU3Rpa3lIZWFkZXIpO1xyXG5cclxuXHRhaHRsU3Rpa3lIZWFkZXIuJGluamVjdCA9IFsnSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlJ107XHJcblxyXG5cdGZ1bmN0aW9uIGFodGxTdGlreUhlYWRlcihIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnQScsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0bGluazogbGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBsaW5rKCkge1xyXG5cdFx0XHRsZXQgaGVhZGVyID0gbmV3IEhlYWRlclRyYW5zaXRpb25zU2VydmljZSgnW2RhdGEtaGVhZGVyXScsICdbZGF0YS1oZWFkZXItaXRlbV0nKTtcclxuXHJcblx0XHRcdGhlYWRlci5hbmltYXRlVHJhbnNpdGlvbihcclxuXHRcdFx0XHQnW2RhdGEtaGVhZGVyLXN1Ym5hdl0nLCB7XHJcblx0XHRcdFx0XHRjc3NFbnVtZXJhYmxlUnVsZTogJ2hlaWdodCcsXHJcblx0XHRcdFx0XHRkZWxheTogMzAwfSlcclxuXHRcdFx0XHQucmVjYWxjdWxhdGVIZWlnaHRPbkNsaWNrKFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtdHJpZ2dlcl0nLFxyXG5cdFx0XHRcdFx0J1tkYXRhLWF1dG9oZWlnaHQtb25dJylcclxuXHRcdFx0XHQuZml4SGVhZGVyRWxlbWVudChcclxuXHRcdFx0XHRcdCcubmF2JyxcclxuXHRcdFx0XHRcdCdqc19uYXYtLWZpeGVkJyxcclxuXHRcdFx0XHRcdCdqc19sLWhlYWRlci0tcmVsYXRpdmUnLCB7XHJcblx0XHRcdFx0XHRcdG9uTWluU2Nyb2xsdG9wOiA4OCxcclxuXHRcdFx0XHRcdFx0b25NYXhXaW5kb3dXaWR0aDogODUwfSk7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcik7XHJcblxyXG4gICAgSG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKHJlc29ydFNlcnZpY2UpIHtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7cHJvcDogJ190cmVuZCcsIHZhbHVlOiB0cnVlfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bE1vZGFsJywgYWh0bE1vZGFsRGlyZWN0aXZlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBhaHRsTW9kYWxEaXJlY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsTW9kYWxEaXJlY3RpdmVMaW5rLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy9tb2RhbC9tb2RhbC5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxNb2RhbERpcmVjdGl2ZUxpbmsoJHNjb3BlLCBlbGVtKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCdtb2RhbE9wZW4nLCBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ2ltYWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zcmMgPSBkYXRhLnNyYztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5pbWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvdyA9PT0gJ21hcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvdy5tYXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ29vZ2xlID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lmdvb2dsZSAmJiAnbWFwcycgaW4gd2luZG93Lmdvb2dsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXBTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwU2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJ4eENLMi11VnlsNjl3bjdLNjFOUEFRRGY3eUgtamYzdyZsYW5ndWFnZT1lbic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcFNjcmlwdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnNob3cgPT09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LnRleHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93LmhlYWRlciA9IGRhdGEuaGVhZGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93Lm1lc3NhZ2UgPSBkYXRhLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBteUxhdGxuZyA9IHtsYXQ6IGRhdGEuY29vcmQubGF0LCBsbmc6IGRhdGEuY29vcmQubG5nfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWxfX21hcCcpWzBdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6ICdyb2FkbWFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBteUxhdGxuZ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBteUxhdGxuZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIodGhpcy5nZXRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2VEaWFsb2cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zaG93ID0ge307XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0TWFwKG5hbWUsIGNvb3JkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYXRpb25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIFtuYW1lLCBjb29yZC5sYXQsIGNvb3JkLmxuZ11cclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9iamVjdCBhbmQgc3BlY2lmeSB0aGUgRE9NIGVsZW1lbnQgZm9yIGRpc3BsYXkuXHJcbiAgICAgICAgICAgICAgICBsZXQgbW9kYWxNYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsX19tYXAnKVswXSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge2xhdDogY29vcmQubGF0LCBsbmc6IGNvb3JkLmxuZ30sXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBpY29ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhaG90ZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2Fzc2V0cy9pbWFnZXMvaWNvbl9tYXAucG5nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmQubGF0LCBjb29yZC5sbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbnNbXCJhaG90ZWxcIl0uaWNvblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuLypcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZC5sYXQsIGNvb3JkLmxuZyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbW9kYWxNYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGljb25zW1wiYWhvdGVsXCJdLmljb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvISpjZW50ZXJpbmcqIS9cclxuICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzICgpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgTGF0TGFuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcgKGxvY2F0aW9uc1tpXVsxXSwgbG9jYXRpb25zW2ldWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKExhdExhbmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kYWxNYXAuZml0Qm91bmRzKGJvdW5kcyk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignYWN0aXZpdGllc0ZpbHRlcicsIGFjdGl2aXRpZXNGaWx0ZXIpO1xyXG5cclxuICAgIGFjdGl2aXRpZXNGaWx0ZXIuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFjdGl2aXRpZXNGaWx0ZXIoJGxvZywgZmlsdGVyc1NlcnZpY2UpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyZywgX3N0cmluZ0xlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgc3RyaW5nTGVuZ3RoID0gcGFyc2VJbnQoX3N0cmluZ0xlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4oc3RyaW5nTGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgJGxvZy53YXJuKGBDYW4ndCBwYXJzZSBhcmd1bWVudDogJHtfc3RyaW5nTGVuZ3RofWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZ1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXJnLmpvaW4oJywgJykuc2xpY2UoMCwgc3RyaW5nTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuc2xpY2UoMCwgcmVzdWx0Lmxhc3RJbmRleE9mKCcsJykpICsgJy4uLidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Jlc29ydENvbnRyb2xsZXInLCBSZXNvcnRDb250cm9sbGVyKTtcclxuXHJcbiAgICBSZXNvcnRDb250cm9sbGVyLiRpbmplY3QgPSBbJ3Jlc29ydFNlcnZpY2UnLCAnJGZpbHRlcicsICckc2NvcGUnLCAnJHN0YXRlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUmVzb3J0Q29udHJvbGxlcihyZXNvcnRTZXJ2aWNlLCAkZmlsdGVyLCAkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICAgIGxldCBjdXJyZW50RmlsdGVycyA9ICRzdGF0ZS4kY3VycmVudC5kYXRhLmN1cnJlbnRGaWx0ZXJzOyAvLyB0ZW1wXHJcblxyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9ICRmaWx0ZXIoJ2hvdGVsRmlsdGVyJykuaW5pdEZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZSA9IGZ1bmN0aW9uKGZpbHRlckdyb3VwLCBmaWx0ZXIsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZmlsdGVyR3JvdXAsIGZpbHRlciwgdmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSA9IGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5wdXNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVyc1tmaWx0ZXJHcm91cF0uc3BsaWNlKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5pbmRleE9mKGZpbHRlciksIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRGaWx0ZXJzW2ZpbHRlckdyb3VwXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudEZpbHRlcnNbZmlsdGVyR3JvdXBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQgPSB0aGlzLmhvdGVscy5yZWR1Y2UoKGNvdW50ZXIsIGl0ZW0pID0+IGl0ZW0uX2hpZGUgPyBjb3VudGVyIDogKytjb3VudGVyLCAwKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Nob3dIb3RlbENvdW50Q2hhbmdlZCcsIHRoaXMuZ2V0U2hvd0hvdGVsQ291bnQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBob3RlbHMgPSB7fTtcclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGhvdGVscyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB0aGlzLmhvdGVscyA9IGhvdGVscztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLmZpbHRlcnMucHJpY2UsXHJcbiAgICAgICAgICAgICAgICAobmV3VmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RmlsdGVycy5wcmljZSA9IFtuZXdWYWx1ZV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjdXJyZW50RmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG90ZWxzID0gJGZpbHRlcignaG90ZWxGaWx0ZXInKS5hcHBseUZpbHRlcnMoaG90ZWxzLCBjdXJyZW50RmlsdGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTaG93SG90ZWxDb3VudCA9IHRoaXMuaG90ZWxzLnJlZHVjZSgoY291bnRlciwgaXRlbSkgPT4gaXRlbS5faGlkZSA/IGNvdW50ZXIgOiArK2NvdW50ZXIsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTsgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldFNob3dIb3RlbENvdW50ID0gdGhpcy5ob3RlbHMucmVkdWNlKChjb3VudGVyLCBpdGVtKSA9PiBpdGVtLl9oaWRlID8gY291bnRlciA6ICsrY291bnRlciwgMCk7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCB0aGlzLmdldFNob3dIb3RlbENvdW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vcGVuTWFwID0gZnVuY3Rpb24oaG90ZWxOYW1lLCBob3RlbENvb3JkKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgc2hvdzogJ21hcCcsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBob3RlbE5hbWUsXHJcbiAgICAgICAgICAgICAgICBjb29yZDogaG90ZWxDb29yZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJHJvb3QuJGJyb2FkY2FzdCgnbW9kYWxPcGVuJywgZGF0YSlcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5maWx0ZXIoJ2hvdGVsRmlsdGVyJywgaG90ZWxGaWx0ZXIpO1xyXG5cclxuICAgIGhvdGVsRmlsdGVyLiRpbmplY3QgPSBbJyRsb2cnLCAnaG90ZWxEZXRhaWxzQ29uc3RhbnQnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBob3RlbEZpbHRlcigkbG9nLCBob3RlbERldGFpbHNDb25zdGFudCkge1xyXG4gICAgICAgIGxldCBzYXZlZEZpbHRlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbG9hZEZpbHRlcnM6IGxvYWRGaWx0ZXJzLFxyXG4gICAgICAgICAgICBhcHBseUZpbHRlcnM6IGFwcGx5RmlsdGVycyxcclxuICAgICAgICAgICAgaW5pdEZpbHRlcnM6IGluaXRGaWx0ZXJzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9hZEZpbHRlcnMoKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdEZpbHRlcnMoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNhdmVkRmlsdGVycyk7XHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJzID0ge307XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlcnNba2V5XSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3RlbERldGFpbHNDb25zdGFudFtrZXldLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyc1trZXldW2hvdGVsRGV0YWlsc0NvbnN0YW50W2tleV1baV1dID0gc2F2ZWRGaWx0ZXJzW2tleV0gJiYgc2F2ZWRGaWx0ZXJzW2tleV0uaW5kZXhPZihob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldKSAhPT0gLTEgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9maWx0ZXJzW2tleV1baG90ZWxEZXRhaWxzQ29uc3RhbnRba2V5XVtpXV0gPSBzYXZlZEZpbHRlcnNba2V5XVtob3RlbERldGFpbHNDb25zdGFudFtrZXldW2ldXSB8fCBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZmlsdGVycy5wcmljZSA9IHtcclxuICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgIG1heDogMTAwMFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RmlsdGVycyhob3RlbHMsIGZpbHRlcnMpIHtcclxuICAgICAgICAgICAgc2F2ZWRGaWx0ZXJzID0gZmlsdGVycztcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChob3RlbHMsIGZ1bmN0aW9uKGhvdGVsKSB7XHJcbiAgICAgICAgICAgICAgICBob3RlbC5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaXNIb3RlbE1hdGNoaW5nRmlsdGVycyhob3RlbCwgZmlsdGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWx0ZXJzLCBmdW5jdGlvbihmaWx0ZXJzSW5Hcm91cCwgZmlsdGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VGaWx0ZXJNYXRjaGluZyA9IGZhbHNlOyAvLyBmb3IgYWN0aXZpdGllcyBhbmQgbXVzdGhhdmVzIGdyb3Vwc1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdndWVzdHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnNJbkdyb3VwID0gW2ZpbHRlcnNJbkdyb3VwW2ZpbHRlcnNJbkdyb3VwLmxlbmd0aCAtIDFdXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyR3JvdXAgPT09ICdtdXN0SGF2ZXMnIHx8IGZpbHRlckdyb3VwID09PSAnYWN0aXZpdGllcycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV2ZXJzZUZpbHRlck1hdGNoaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyc0luR3JvdXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXZlcnNlRmlsdGVyTWF0Y2hpbmcgJiYgZ2V0SG90ZWxQcm9wKGhvdGVsLCBmaWx0ZXJHcm91cCwgZmlsdGVyc0luR3JvdXBbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEF0TGVhc2VPbmVGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXZlcnNlRmlsdGVyTWF0Y2hpbmcgJiYgIWdldEhvdGVsUHJvcChob3RlbCwgZmlsdGVyR3JvdXAsIGZpbHRlcnNJbkdyb3VwW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hBdExlYXNlT25lRmlsdGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaEF0TGVhc2VPbmVGaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG90ZWwuX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRIb3RlbFByb3AoaG90ZWwsIGZpbHRlckdyb3VwLCBmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaChmaWx0ZXJHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xvY2F0aW9ucyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5sb2NhdGlvbi5jb3VudHJ5ID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndHlwZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWwudHlwZSA9PT0gZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHRpbmdzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmVudmlyb25tZW50ID09PSBmaWx0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbXVzdEhhdmVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmRldGFpbHNbZmlsdGVyXTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdhY3Rpdml0aWVzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIH5ob3RlbC5hY3Rpdml0aWVzLmluZGV4T2YoZmlsdGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdwcmljZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBob3RlbC5wcmljZSA+PSBmaWx0ZXIubWluICYmIGhvdGVsLnByaWNlIDw9IGZpbHRlci5tYXg7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ3Vlc3RzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhvdGVsLmd1ZXN0cy5tYXggPj0gK2ZpbHRlclswXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhvdGVscy5maWx0ZXIoKGhvdGVsKSA9PiAhaG90ZWwuX2hpZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnc2Nyb2xsVG9Ub3AnLCBzY3JvbGxUb1RvcERpcmVjdGl2ZSk7XHJcblxyXG4gICAgc2Nyb2xsVG9Ub3BEaXJlY3RpdmUuJGluamVjdCA9IFsnJHdpbmRvdycsICckbG9nJ107XHJcblxyXG4gICAgZnVuY3Rpb24gc2Nyb2xsVG9Ub3BEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIGxpbms6IHNjcm9sbFRvVG9wRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNjcm9sbFRvVG9wRGlyZWN0aXZlTGluaygkc2NvcGUsIGVsZW0sIGF0dHIpIHtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yLCBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoMSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICQudHJpbShhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLnNsaWNlKDAsIGF0dHIuc2Nyb2xsVG9Ub3BDb25maWcuaW5kZXhPZignLCcpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcGFyc2VJbnQoYXR0ci5zY3JvbGxUb1RvcENvbmZpZy5zbGljZShhdHRyLnNjcm9sbFRvVG9wQ29uZmlnLmluZGV4T2YoJywnKSArIDEpKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nLndhcm4oYHNjcm9sbC10by10b3AtY29uZmlnIGlzIG5vdCBkZWZpbmVkYCk7XHJcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgfHwgJ2h0bWwsIGJvZHknO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbSkub24oYXR0ci5zY3JvbGxUb1RvcCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBoZWlnaHQgfSwgXCJzbG93XCIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgU2VhcmNoQ29udHJvbGxlcik7XHJcblxyXG4gICAgU2VhcmNoQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGUnLCAncmVzb3J0U2VydmljZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHN0YXRlLCByZXNvcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5xdWVyeSA9ICRzdGF0ZS5wYXJhbXMucXVlcnk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5xdWVyeSk7XHJcbiAgICAgICAgdGhpcy5ob3RlbHMgPSBudWxsO1xyXG5cclxuICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCgpXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3RlbHMgPSByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcclxuICAgICAgICAgICAgbGV0IHBhcnNlZFF1ZXJ5ID0gJC50cmltKHRoaXMucXVlcnkpLnJlcGxhY2UoL1xccysvZywgJyAnKS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5ob3RlbHMsIChob3RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhob3RlbCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaG90ZWxDb250ZW50ID0gaG90ZWwubmFtZSArIGhvdGVsLmxvY2F0aW9uLmNvdW50cnkgK1xyXG4gICAgICAgICAgICAgICAgICAgIGhvdGVsLmxvY2F0aW9uLnJlZ2lvbiArIGhvdGVsLmRlc2MgKyBob3RlbC5kZXNjTG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGhvdGVsQ29udGVudClcclxuICAgICAgICAgICAgICAgIC8vZm9yICgpXHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlc0NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJzZWRRdWVyeS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBxUmVnRXhwID0gbmV3IFJlZ0V4cChwYXJzZWRRdWVyeVtpXSwgJ2dpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlc0NvdW50ZXIgKz0gKGhvdGVsQ29udGVudC5tYXRjaChxUmVnRXhwKSB8fCBbXSkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzQ291bnRlciA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaG90ZWwuX2lkXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtob3RlbC5faWRdLm1hdGNoZXNDb3VudGVyID0gbWF0Y2hlc0NvdW50ZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gdGhpcy5ob3RlbHNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGhvdGVsKSA9PiByZXN1bHRbaG90ZWwuX2lkXSlcclxuICAgICAgICAgICAgICAgIC5tYXAoKGhvdGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG90ZWwuX21hdGNoZXMgPSByZXN1bHRbaG90ZWwuX2lkXS5tYXRjaGVzQ291bnRlcjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG90ZWw7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuZGlyZWN0aXZlKCdhaHRsVG9wMycsIGFodGxUb3AzRGlyZWN0aXZlKTtcclxuXHJcbiAgICBhaHRsVG9wM0RpcmVjdGl2ZS4kaW5qZWN0ID0gWydyZXNvcnRTZXJ2aWNlJywgJ2hvdGVsRGV0YWlsc0NvbnN0YW50J107XHJcblxyXG4gICAgZnVuY3Rpb24gYWh0bFRvcDNEaXJlY3RpdmUocmVzb3J0U2VydmljZSwgaG90ZWxEZXRhaWxzQ29uc3RhbnQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBBaHRsVG9wM0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3RvcDMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wYXJ0aWFscy90b3AvdG9wMy50ZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEFodGxUb3AzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzID0gaG90ZWxEZXRhaWxzQ29uc3RhbnQubXVzdEhhdmVzO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydFR5cGUgPSAkYXR0cnMuYWh0bFRvcDN0eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29ydCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEltZ1NyYyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9pbWFnZXMvJyArIHRoaXMucmVzb3J0VHlwZSArICcvJyArIHRoaXMucmVzb3J0W2luZGV4XS5pbWcuZmlsZW5hbWVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNSZXNvcnRJbmNsdWRlRGV0YWlsID0gZnVuY3Rpb24oaXRlbSwgZGV0YWlsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0YWlsQ2xhc3NOYW1lID0gJ3RvcDNfX2RldGFpbC1jb250YWluZXItLScgKyBkZXRhaWwsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lID0gIWl0ZW0uZGV0YWlsc1tkZXRhaWxdID8gJyB0b3AzX19kZXRhaWwtY29udGFpbmVyLS1oYXNudCcgOiAnJztcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0YWlsQ2xhc3NOYW1lICsgaXNSZXNvcnRJbmNsdWRlRGV0YWlsQ2xhc3NOYW1lXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXNvcnRTZXJ2aWNlLmdldFJlc29ydCh7cHJvcDogJ3R5cGUnLCB2YWx1ZTogdGhpcy5yZXNvcnRUeXBlfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29ydCA9IHJlc3BvbnNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvcnRUeXBlID09PSAnSG90ZWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3J0ID0gdGhpcy5yZXNvcnQuZmlsdGVyKChob3RlbCkgPT4gaG90ZWwuX3Nob3dJblRvcCA9PT0gdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmFuaW1hdGlvbignLnNsaWRlcl9faW1nJywgYW5pbWF0aW9uRnVuY3Rpb24pO1xyXG5cclxuXHRmdW5jdGlvbiBhbmltYXRpb25GdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcblx0XHRcdFx0bGV0IHNsaWRpbmdEaXJlY3Rpb24gPSBlbGVtZW50LnNjb3BlKCkuc2xpZGluZ0RpcmVjdGlvbjtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcxJyk7XHJcblxyXG5cdFx0XHRcdGlmKHNsaWRpbmdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuXHRcdFx0XHRcdCQoZWxlbWVudCkuYW5pbWF0ZSh7J2xlZnQnOiAnMTAwJSd9LCA1MDAsIGRvbmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFuaW1hdGUoeydsZWZ0JzogJy0yMDAlJ30sIDUwMCwgZG9uZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuXHRcdFx0XHQkKGVsZW1lbnQpLmNzcygnei1pbmRleCcsICcwJyk7XHJcblx0XHRcdFx0JChlbGVtZW50KS5jc3MoJ2xlZnQnLCAnMCcpO1xyXG5cdFx0XHRcdGRvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdhaHRsU2xpZGVyJywgYWh0bFNsaWRlcik7XHJcblxyXG5cdGFodGxTbGlkZXIuJGluamVjdCA9IFsnc2xpZGVyU2VydmljZScsICckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBhaHRsU2xpZGVyKHNsaWRlclNlcnZpY2UsICR0aW1lb3V0KSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0c2NvcGU6IHt9LFxyXG5cdFx0XHRjb250cm9sbGVyOiBhaHRsU2xpZGVyQ29udHJvbGxlcixcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvcGFydGlhbHMvaGVhZGVyL3NsaWRlci9zbGlkZXIuaHRtbCcsXHJcblx0XHRcdGxpbms6IGxpbmtcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWh0bFNsaWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XHJcblx0XHRcdCRzY29wZS5zbGlkZXIgPSBzbGlkZXJTZXJ2aWNlO1xyXG5cdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0XHQkc2NvcGUubmV4dFNsaWRlID0gbmV4dFNsaWRlO1xyXG5cdFx0XHQkc2NvcGUucHJldlNsaWRlID0gcHJldlNsaWRlO1xyXG5cdFx0XHQkc2NvcGUuc2V0U2xpZGUgPSBzZXRTbGlkZTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIG5leHRTbGlkZSgpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGluZ0RpcmVjdGlvbiA9ICdsZWZ0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldE5leHRTbGlkZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwcmV2U2xpZGUoKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSAncmlnaHQnO1xyXG5cdFx0XHRcdCRzY29wZS5zbGlkZXIuc2V0UHJldlNsaWRlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNldFNsaWRlKGluZGV4KSB7XHJcblx0XHRcdFx0JHNjb3BlLnNsaWRpbmdEaXJlY3Rpb24gPSBpbmRleCA+ICRzY29wZS5zbGlkZXIuZ2V0Q3VycmVudFNsaWRlKHRydWUpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuXHRcdFx0XHQkc2NvcGUuc2xpZGVyLnNldEN1cnJlbnRTbGlkZShpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXhJRThwbmdCbGFja0JnKGVsZW1lbnQpIHtcclxuXHRcdFx0JChlbGVtZW50KVxyXG5cdFx0XHRcdC5jc3MoJy1tcy1maWx0ZXInLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LmdyYWRpZW50KHN0YXJ0Q29sb3JzdHI9IzAwRkZGRkZGLGVuZENvbG9yc3RyPSMwMEZGRkZGRiknKVxyXG5cdFx0XHRcdC5jc3MoJ2ZpbHRlcicsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoc3RhcnRDb2xvcnN0cj0jMDBGRkZGRkYsZW5kQ29sb3JzdHI9IzAwRkZGRkZGKScpXHJcblx0XHRcdFx0LmNzcygnem9vbScsICcxJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSkge1xyXG5cdFx0XHRsZXQgYXJyb3dzID0gJChlbGVtKS5maW5kKCcuc2xpZGVyX19hcnJvdycpO1xyXG5cclxuXHRcdFx0YXJyb3dzLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwLjUnKTtcclxuXHRcdFx0XHRmaXhJRThwbmdCbGFja0JnKHRoaXMpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0JHRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ29wYWNpdHknLCAnMScpO1xyXG5cdFx0XHRcdFx0Zml4SUU4cG5nQmxhY2tCZygkKHRoaXMpKTtcclxuXHRcdFx0XHR9LCA1MDApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG5cdFx0LmZhY3RvcnkoJ3NsaWRlclNlcnZpY2UnLHNsaWRlclNlcnZpY2UpO1xyXG5cclxuXHRzbGlkZXJTZXJ2aWNlLiRpbmplY3QgPSBbJ3NsaWRlckltZ1BhdGhDb25zdGFudCddO1xyXG5cclxuXHRmdW5jdGlvbiBzbGlkZXJTZXJ2aWNlKHNsaWRlckltZ1BhdGhDb25zdGFudCkge1xyXG5cdFx0ZnVuY3Rpb24gU2xpZGVyKHNsaWRlckltYWdlTGlzdCkge1xyXG5cdFx0XHR0aGlzLl9pbWFnZVNyY0xpc3QgPSBzbGlkZXJJbWFnZUxpc3Q7XHJcblx0XHRcdHRoaXMuX2N1cnJlbnRTbGlkZSA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0U2xpZGVyLnByb3RvdHlwZS5nZXRJbWFnZVNyY0xpc3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pbWFnZVNyY0xpc3Q7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuZ2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKGdldEluZGV4KSB7XHJcblx0XHRcdHJldHVybiBnZXRJbmRleCA9PSB0cnVlID8gdGhpcy5fY3VycmVudFNsaWRlIDogdGhpcy5faW1hZ2VTcmNMaXN0W3RoaXMuX2N1cnJlbnRTbGlkZV07XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0Q3VycmVudFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlKSB7XHJcblx0XHRcdHNsaWRlID0gcGFyc2VJbnQoc2xpZGUpO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHNsaWRlKSB8fCBzbGlkZSA8IDAgfHwgc2xpZGUgPiB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fY3VycmVudFNsaWRlID0gc2xpZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdFNsaWRlci5wcm90b3R5cGUuc2V0TmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQodGhpcy5fY3VycmVudFNsaWRlID09PSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSAwIDogdGhpcy5fY3VycmVudFNsaWRlKys7XHJcblxyXG5cdFx0XHR0aGlzLmdldEN1cnJlbnRTbGlkZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRTbGlkZXIucHJvdG90eXBlLnNldFByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0KHRoaXMuX2N1cnJlbnRTbGlkZSA9PT0gMCkgPyB0aGlzLl9jdXJyZW50U2xpZGUgPSB0aGlzLl9pbWFnZVNyY0xpc3QubGVuZ3RoIC0gMSA6IHRoaXMuX2N1cnJlbnRTbGlkZS0tO1xyXG5cclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50U2xpZGUoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBTbGlkZXIoc2xpZGVySW1nUGF0aENvbnN0YW50KTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5jb25zdGFudCgnc2xpZGVySW1nUGF0aENvbnN0YW50JywgW1xyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMi5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyMy5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNC5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNS5qcGcnLFxyXG4gICAgICAgICAgICAnYXNzZXRzL2ltYWdlcy9zbGlkZXIvc2xpZGVyNi5qcGcnXHJcbiAgICAgICAgXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyXHJcbiAgICAgICAgLm1vZHVsZSgnYWhvdGVsQXBwJylcclxuICAgICAgICAuY29udHJvbGxlcignUGFnZXMnLCBQYWdlcyk7XHJcblxyXG4gICAgUGFnZXMuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gUGFnZXMoJHNjb3BlKSB7XHJcbiAgICAgICAgY29uc3QgaG90ZWxzUGVyUGFnZSA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dGcm9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5jdXJyZW50UGFnZSAtIDEpICogaG90ZWxzUGVyUGFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiArK3RoaXMuY3VycmVudFBhZ2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93UHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLS10aGlzLmN1cnJlbnRQYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhZ2UgKyAxO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXN0UGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYWdlc1RvdGFsLmxlbmd0aCA9PT0gdGhpcy5jdXJyZW50UGFnZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaXNGaXJzdFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2UgPT09IDFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzaG93SG90ZWxDb3VudENoYW5nZWQnLCAoZXZlbnQsIHNob3dIb3RlbENvdW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZXNUb3RhbCA9IG5ldyBBcnJheShNYXRoLmNlaWwoc2hvd0hvdGVsQ291bnQgLyBob3RlbHNQZXJQYWdlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmZpbHRlcignc2hvd0Zyb20nLCBzaG93RnJvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0Zyb20oKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBzdGFydFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnNsaWNlKHN0YXJ0UG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXJcclxuICAgICAgICAubW9kdWxlKCdhaG90ZWxBcHAnKVxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2FodGxQcmljZVNsaWRlcicsIHByaWNlU2xpZGVyRGlyZWN0aXZlKTtcclxuXHJcbiAgICBwcmljZVNsaWRlckRpcmVjdGl2ZS4kaW5qZWN0ID0gWydIZWFkZXJUcmFuc2l0aW9uc1NlcnZpY2UnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmljZVNsaWRlckRpcmVjdGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiBcIkBcIixcclxuICAgICAgICAgICAgICAgIG1heDogXCJAXCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0U2xpZGVyOiAnPScsXHJcbiAgICAgICAgICAgICAgICByaWdodFNsaWRlcjogJz0nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3BhcnRpYWxzL3Jlc29ydC9wcmljZVNsaWRlci9wcmljZVNsaWRlci5odG1sJyxcclxuICAgICAgICAgICAgbGluazogcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJpY2VTbGlkZXJEaXJlY3RpdmVMaW5rKCRzY29wZSwgSGVhZGVyVHJhbnNpdGlvbnNTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJHNjb3BlLmxlZnRTbGlkZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmlnaHRTbGlkZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucmlnaHRTbGlkZXIubWF4ID0gMTU7Ki9cclxuICAgICAgICAgICAgbGV0IHJpZ2h0QnRuID0gJCgnLnNsaWRlX19wb2ludGVyLS1yaWdodCcpLFxyXG4gICAgICAgICAgICAgICAgbGVmdEJ0biA9ICQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVBcmVhV2lkdGggPSBwYXJzZUludCgkKCcuc2xpZGUnKS5jc3MoJ3dpZHRoJykpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVQZXJTdGVwID0gJHNjb3BlLm1heCAvIChzbGlkZUFyZWFXaWR0aCAtIDIwKTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5taW4gPSBwYXJzZUludCgkc2NvcGUubWluKTtcclxuICAgICAgICAgICAgJHNjb3BlLm1heCA9IHBhcnNlSW50KCRzY29wZS5tYXgpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCRzY29wZS5taW4pO1xyXG4gICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoJHNjb3BlLm1heCk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIHJpZ2h0QnRuLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gc2xpZGVBcmVhV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSk7XHJcblxyXG4gICAgICAgICAgICBpbml0RHJhZyhcclxuICAgICAgICAgICAgICAgIGxlZnRCdG4sXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHBhcnNlSW50KHJpZ2h0QnRuLmNzcygnbGVmdCcpKSArIDIwLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gMCk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0RHJhZyhkcmFnRWxlbSwgaW5pdFBvc2l0aW9uLCBtYXhQb3NpdGlvbiwgbWluUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzaGlmdDtcclxuXHJcbiAgICAgICAgICAgICAgICBkcmFnRWxlbS5vbignbW91c2Vkb3duJywgYnRuT25Nb3VzZURvd24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGJ0bk9uTW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSBldmVudC5wYWdlWDtcclxuICAgICAgICAgICAgICAgICAgICBpbml0UG9zaXRpb24gPSBwYXJzZUludChkcmFnRWxlbS5jc3MoJ2xlZnQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBkb2NPbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0VsZW0ub24oJ21vdXNldXAnLCBidG5Pbk1vdXNlVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkb2NPbk1vdXNlTW92ZShldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbkxlc3NUaGFuTWF4ID0gaW5pdFBvc2l0aW9uICsgZXZlbnQucGFnZVggLSBzaGlmdCA8PSBtYXhQb3NpdGlvbigpIC0gMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uR3JhdGVyVGhhbk1pbiA9IGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQgPj0gbWluUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uTGVzc1RoYW5NYXggJiYgcG9zaXRpb25HcmF0ZXJUaGFuTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdFbGVtLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignbGVmdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIGluaXRQb3NpdGlvbiArIGV2ZW50LnBhZ2VYIC0gc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygncmlnaHQnLCBzbGlkZUFyZWFXaWR0aCAtIGluaXRQb3NpdGlvbiAtIGV2ZW50LnBhZ2VYICsgc2hpZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRQcmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYnRuT25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgZG9jT25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9mZignbW91c2V1cCcsIGJ0bk9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgYnRuT25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0UHJpY2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRyYWdFbGVtLm9uKCdkcmFnc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQcmljZXMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld01pbiA9IH5+KHBhcnNlSW50KGxlZnRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF4ID0gfn4ocGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpICogdmFsdWVQZXJTdGVwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKG5ld01pbik7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKG5ld01heCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qJHNjb3BlLiRicm9hZGNhc3QoJ3ByaWNlU2xpZGVyUG9zaXRpb25DaGFuZ2VkJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0QnRuLmNzcygnbGVmdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodDogcmlnaHRCdG4uY3NzKCdsZWZ0JylcclxuICAgICAgICAgICAgICAgICAgICB9KSovXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0U2xpZGVycyhidG4sIG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1Bvc3Rpb24gPSBuZXdWYWx1ZSAvIHZhbHVlUGVyU3RlcDtcclxuICAgICAgICAgICAgICAgICAgICBidG4uY3NzKCdsZWZ0JywgbmV3UG9zdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidG4uYXR0cignY2xhc3MnKS5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5zbGlkZV9fbGluZS0tZ3JlZW4nKS5jc3MoJ2xlZnQnLCBuZXdQb3N0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsIHNsaWRlQXJlYVdpZHRoIC0gbmV3UG9zdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoK25ld1ZhbHVlIC8gdmFsdWVQZXJTdGVwID4gcGFyc2VJbnQocmlnaHRCdG4uY3NzKCdsZWZ0JykpIC0gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygncHJpY2VTbGlkZXJfX2lucHV0LS1pbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYTtsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFNsaWRlcnMobGVmdEJ0biwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4Jykub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZSBpbnB1dCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9ICQodGhpcykudmFsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgPiAkc2NvcGUubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdWYWx1ZSwkc2NvcGUubWF4ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgrbmV3VmFsdWUgLyB2YWx1ZVBlclN0ZXAgPCBwYXJzZUludChsZWZ0QnRuLmNzcygnbGVmdCcpKSArIDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3ByaWNlU2xpZGVyX19pbnB1dC0taW52YWxpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmE7bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwcmljZVNsaWRlcl9faW5wdXQtLWludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTbGlkZXJzKHJpZ2h0QnRuLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlbWl0KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZWZ0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWluJykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJpZ2h0U2xpZGVyID0gJCgnLnByaWNlU2xpZGVyX19pbnB1dC0tbWF4JykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiRzY29wZS4kYnJvYWRjYXN0KCdwcmljZVNsaWRlclBvc2l0aW9uQ2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1taW4nKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS52YWwoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEzKTsqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdG9kbyBpZTggYnVnIGZpeFxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJ2h0bWwnKS5oYXNDbGFzcygnaWU4JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJpY2VTbGlkZXJfX2lucHV0LS1tYXgnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGVsZW0pLmZpbmQoJy5zbGlkZV9fcG9pbnRlci0tbGVmdCcpLmNzcygnbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNsaWRlX19saW5lLS1ncmVlbicpLmNzcygnbGVmdCcsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChlbGVtKS5maW5kKCcuc2xpZGVfX3BvaW50ZXItLXJpZ2h0JykuY3NzKCdsZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygrc2xpZGVBcmVhV2lkdGggLSArbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2xpZGVfX2xpbmUtLWdyZWVuJykuY3NzKCdyaWdodCcsICtzbGlkZUFyZWFXaWR0aCAtIHBhcnNlSW50KG5ld1ZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhclxyXG4gICAgICAgIC5tb2R1bGUoJ2Fob3RlbEFwcCcpXHJcbiAgICAgICAgLmRpcmVjdGl2ZSgnYWh0bFNsaWRlT25DbGljaycsIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUpO1xyXG5cclxuICAgIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUuJGluamVjdCA9IFsnJGxvZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmUoJGxvZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgICAgICAgICBsaW5rOiBhaHRsU2xpZGVPbkNsaWNrRGlyZWN0aXZlTGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFodGxTbGlkZU9uQ2xpY2tEaXJlY3RpdmVMaW5rKCRzY29wZSwgZWxlbSkge1xyXG4gICAgICAgICAgICBsZXQgc2xpZGVFbWl0RWxlbWVudHMgPSAkKGVsZW0pLmZpbmQoJ1tzbGlkZS1lbWl0XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbGlkZUVtaXRFbGVtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2Fybihgc2xpZGUtZW1pdCBub3QgZm91bmRgKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNsaWRlRW1pdEVsZW1lbnRzLm9uKCdjbGljaycsIHNsaWRlRW1pdE9uQ2xpY2spO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2xpZGVFbWl0T25DbGljaygpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzbGlkZU9uRWxlbWVudCA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2xpZGVFbWl0RWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBzbGlkZS1lbWl0IG5vdCBmb3VuZGApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICcnICYmIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgIT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZy53YXJuKGBXcm9uZyBpbml0IHZhbHVlIGZvciAnc2xpZGUtb24nIGF0dHJpYnV0ZSwgc2hvdWxkIGJlICcnIG9yICdjbG9zZWQnLmApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJykgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuc2xpZGVVcCgnc2xvdycsIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVPbkVsZW1lbnQuYXR0cignc2xpZGUtb24nLCAnY2xvc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LnNsaWRlRG93bignc2xvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT25FbGVtZW50LmF0dHIoJ3NsaWRlLW9uJywgJycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU2xpZGVBbmltYXRpb25Db21wbGV0ZSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2xpZGVUb2dnbGVFbGVtZW50cyA9ICQoZWxlbSkuZmluZCgnW3NsaWRlLW9uLXRvZ2dsZV0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHNsaWRlVG9nZ2xlRWxlbWVudHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCQodGhpcykuYXR0cignc2xpZGUtb24tdG9nZ2xlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSgpO1xyXG4iXX0=
