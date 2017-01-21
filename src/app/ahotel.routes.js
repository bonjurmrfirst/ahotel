(function() {
	'use strict';

	angular.module('ahotelApp')
		.config(config);

	config.$inject = ['$stateProvider', '$urlRouterProvider'];

	function config($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'app/partials/home/home.html'
			})
			.state('auth', {
				url: '/auth',
				templateUrl: 'app/partials/auth/auth.html',
				params: {'type': 'login'}/*,
				onEnter: function ($rootScope) {
					$rootScope.$state = "auth";
				}*/
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
				templateUrl: 'app/partials/resort/resort.html'
			})
			.state('booking', {
				url: '/resort',
				templateUrl: 'app/partials/booking/booking.html',
				params: {id: '1'}
			});
	}
})();