angular.module('ahotelApp')

	.directive('ahtlHeader', function() {
		"use strict";

		return {
			restrict: "EAC",
			templateUrl: 'app/templates/header/header.html'
		}
	});