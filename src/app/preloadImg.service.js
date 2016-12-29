(function() {
	'use strict';

	angular
		.module('ahotelApp')
		.factory('PreloadImages',PreloadImages);

	function PreloadImages() {
		this._imageSrcList = imageList;

		function preLoad(imageList) {

			var promises = [];

			function loadImage(src) {
				return new Promise(function (resolve, reject) {
					var image = new Image();
					image.src = src;
					image.onload = function () {
						resolve(image);
					};
					image.onerror = function (e) {
						reject(e);
					};
				});
			}

			for (let i = 0; i < imageList.length; i++) {
				promises.push(loadImage(imageList[i]));
			}

			return Promise.all(promises).then(function (results) {
				return results;
			});
		}

		preLoad(this._imageSrcList);

		return preLoad;
	}
})();
