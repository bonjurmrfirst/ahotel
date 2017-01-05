(function() {
    'use strict';

    angular
        .module('preload')
        .provider('preloadService', preloadService);

    function preloadService() {
        let config = null;

        this.config = function(url, method, action) {
            config = {
                url: url,
                method: method,
                action: action
            };
        };

        this.$get = function ($http, $timeout) {
            let preloadCache = [];

            function preloadImages(preloadName, images) { //todo errors
                let imagesSrcList = [];

                if (typeof images === 'array') {
                    imagesSrcList = images;

                    preloadCache.push({
                        name: preloadName,
                        src: imagesSrcList
                    });

                    preload(imagesSrcList);
                } else if (typeof images === 'object') {
                    $http({
                        images: images.method || config.method,
                        url: images.url || config.url,
                        params: {
                            images: images.action || config.action
                        }
                    })
                        .then((response) => {
                            imagesSrcList = response.data;

                            preloadCache.push({
                                name: preloadName,
                                src: imagesSrcList
                            });

                            $timeout(preload.bind(null, imagesSrcList));
                        },
                        (response) => {
                            return 'ERROR'; //todo
                        });
                } else {
                    return; //todo
                }

                function preload(imagesSrcList) {
                    for (let i = 0; i < imagesSrcList.length; i++) {
                        var image = new Image();
                        image.src = imagesSrcList[i];
                        image.onload = function (e) {
                            //resolve(image);
                            console.log(this.src)
                        };
                        image.onerror = function (e) {
                            console.log(e);
                        };
                    }
                }
            }

            function getPreload(preloadName) {
                console.debug('preloadService:getPreload: ', preloadName);
                if (!preloadName) {
                    return preloadCache;
                }

                for (let i = 0; i < preloadCache.length; i++) {
                    if (preloadCache[i].name === preloadName) {
                        return preloadCache[i].src
                    }
                }

                console.warn('No preloads found');
            }

            return {
                preloadImages: preloadImages,
                getPreload: getPreload
            }
        };
    }
})();