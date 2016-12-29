(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.directive('ahtlHeader',ahtlHeader)

	function ahtlHeader() {
		return {
			restrict: 'EAC',
			templateUrl: 'app/templates/header/header.html'
		};
	}
})();