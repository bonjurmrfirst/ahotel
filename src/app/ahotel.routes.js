angular.module('ahotelApp')

	.config(["$stateProvider","$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('template', {
				url: '/template',
				templateUrl: 'templates/template.html'
			})
	}]);