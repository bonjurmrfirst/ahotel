(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.directive('ahtlStikyHeader', ahtlStikyHeader);

	ahtlStikyHeader.$inject = ['HeaderTransitionsService'];

	function ahtlStikyHeader(HeaderTransitionsService) {
		function link() {
			let header = new HeaderTransitionsService('.l-header', '.nav__item-container');

			header.elementTransition(
				'.sub-nav', {
					cssEnumerableRule: 'height',
					delay: 300
				}
			);

			header.fixHeaderElement(
				'.nav',
				'js_nav--fixed',
				'js_l-header--relative', {
					onMinScrolltop: 88,
					onMaxWindowWidth: 850
				}
			);
		}

		return {
			restrict: "A",
			scope: {},
			link: link
		}
	}
})();