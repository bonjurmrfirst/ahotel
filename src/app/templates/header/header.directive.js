angular.module('ahotelApp')

	.directive('ahHeader', function() {
		"use strict";
		console.log(13);
		return {
			restrict: "EAC",
			templateUrl: 'app/templates/header/header.html'
		}
	});