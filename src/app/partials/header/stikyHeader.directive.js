(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.directive('ahtlStikyHeader',ahtlStikyHeader);

	ahtlStikyHeader.$inject = ['HeaderTransitionsService'];

	function ahtlStikyHeader(HeaderTransitionsService) {
		return {
			restrict: 'A',
			scope: {},
			link: link
		};

		function link() {
			let header = new HeaderTransitionsService('.l-header', '.nav__item-container');

			header.animateTransition(
				'.sub-nav', {
					cssEnumerableRule: 'height',
					delay: 300})
				.recalculateHeightOnClick(
					'[data-autoheight-trigger]',
					'[data-autoheight-on]')
				.fixHeaderElement(
					'.nav',
					'js_nav--fixed',
					'js_l-header--relative', {
						onMinScrolltop: 88,
						onMaxWindowWidth: 850});
		}
	}
})();