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
			.state('bungalows', {
				url: '/bungalows',
				templateUrl: 'app/templates/resorts/bungalows.html'
			});
	}
})();