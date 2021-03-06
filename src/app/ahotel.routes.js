(function() {
	'use strict';

	angular.module('ahotelApp')
		.config(config);

	config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

	function config($stateProvider, $urlRouterProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'app/partials/home/home.html'
			})
			.state('auth', {
				url: '/auth',
				templateUrl: 'app/partials/auth/auth.html',
				params: {'type': 'login'}
			})
			.state('bungalows', {
				url: '/bungalows',
				templateUrl: 'app/partials/top/bungalows.html'
			})
			.state('hotels', {
					url: '/top',
					templateUrl: 'app/partials/top/hotels.html'
				})
			.state('villas', {
				url: '/villas',
				templateUrl: 'app/partials/top/villas.html'
			})
			.state('gallery', {
				url: '/gallery',
				templateUrl: 'app/partials/gallery/gallery.html'
			})
			.state('guestcomments', {
				url: '/guestcomments',
				templateUrl: 'app/partials/guestcomments/guestcomments.html'
			})
			.state('destinations', {
					url: '/destinations',
					templateUrl: 'app/partials/destinations/destinations.html'
			})
			.state('resort', {
				url: '/resort',
				templateUrl: 'app/partials/resort/resort.html',
				data: {
					currentFilters: {}
				}
			})
			.state('booking', {
				url: '/booking?hotelId',
				templateUrl: 'app/partials/booking/booking.html',
				params: {'hotelId': 'hotel Id'}
			})
			.state('search', {
				url: '/search?query',
				templateUrl: 'app/partials/search/search.html',
				params: {'query': 'search query'}
			});
	}
})();