'use strict';

angular.module('ahotelApp')

	.config(["$stateProvider","$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
		'use strict';

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('template', {
				url: '/template',
				templateUrl: 'templates/template.html'
			})
	}]);