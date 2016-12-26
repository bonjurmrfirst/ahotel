'use strict';

angular.module('ahotelApp')

	.config(["$stateProvider","$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
		'use strict';

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'app/templates/home/home.html'
			})
	}]);