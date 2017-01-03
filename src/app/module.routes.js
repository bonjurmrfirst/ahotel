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
				templateUrl: 'app/templates/home/home.html'
			})
			.state('auth', {
				url: '/auth',
				templateUrl: 'app/templates/auth/auth.html',
				params: {'type': 'login'}/*,
				onEnter: function ($rootScope) {
					$rootScope.$state = "auth";
				}*/
			})
			.state('bungalows', {
				url: '/bungalows',
				templateUrl: 'app/templates/resorts/bungalows.html'
			})
			.state('hotels', {
					url: '/hotels',
					templateUrl: 'app/templates/resorts/hotels.html'
				})
			.state('villas', {
				url: '/villas',
				templateUrl: 'app/templates/resorts/villas.html'
			})
			.state('gallery', {
				url: '/gallery',
				templateUrl: 'app/templates/gallery/gallery.html'
			});
	}
})();