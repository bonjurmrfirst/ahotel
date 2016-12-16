angular.module('ahotelApp')

	.directive('ahHeader', function() {
		"use strict";
		console.log(13);
		return {
			restrict: "E",
			templateUrl: 'app/templates/header/header.html'
		}
	});