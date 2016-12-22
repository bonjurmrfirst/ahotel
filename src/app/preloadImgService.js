angular.module('ahotelApp')
	.factory('PreloadImages', function() {
		"use strict";

		function PreloadImages(imageList) {
			this._imageSrcList = imageList;

			function preLoad(imageList) {

				var promises = [];

				function loadImage(src) {
					return new Promise(function (resolve, reject) {
						var image = new Image();
						image.src = src;
						image.onload = function () {
							console.log("loaded image: " + src);
							resolve(image);
						};
						image.onerror = function (e) {
							reject(e);
						};
					})
				}

				for (let i = 0; i < imageList.length; i++) {
					promises.push(loadImage(imageList[i]));
				}

				return Promise.all(promises).then(function (results) {
					console.log('promises array all resolved');
					console.dir(results);
					return results;
				});
			}

			preLoad(this._imageSrcList);
		}

		return PreloadImages
	});

/*
//hmm... Ang1.3.x+
angular.module('ahotelApp')
	.factory('PreloadImages', ['$q', function() {
		"use strict";

		function PreloadImages(imageList) {
			this._imageSrcList = imageList;

			function preLoad(imageList) {

				var promises = [];

				function loadImage(src) {
					return $q(function (resolve, reject) {
						var image = new Image();
						image.src = src;
						image.onload = function () {
							console.log("loaded image: " + src);
							resolve(image);
						};
						image.onerror = function (e) {
							reject(e);
						};
					})
				}

				for (let i = 0; i < imageList.length; i++) {
					promises.push(loadImage(imageList[i]));
				}

				return $q(promises).then(function (results) {
					console.log('promises array all resolved');
					console.dir(results);
					return results;
				});
			}

			preLoad(this._imageSrcList);
		}

		return PreloadImages
	}]);*/
