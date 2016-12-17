angular.module('ahotelApp')

	.directive('ahHeader', function() {
		"use strict";

		return {
			restrict: "EAC",
			templateUrl: 'app/templates/header/header.html'
		}
	});