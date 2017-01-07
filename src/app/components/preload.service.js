(function() {
    'use strict';

    angular
        .module('preload')
        .provider('preloadService', preloadService);

    function preloadService() {
        let config = null;

        this.config = function(url = '/api',
                               method = 'get',
                               action = 'get',
                               timeout = false,
                               log = 'debug') {
            config = {
                url: url,
                method: method,
                action: action,
                timeout: timeout,
                log: log
            };
        };

        this.$get = function ($http, $timeout) {
            let preloadCache = [],
                logger = function(message, log = 'debug') {
                    if (config.log === 'silent') {
                        return;
                    }

                    if (config.log === 'debug' && log === 'debug') {
                        console.debug(message);
                    }

                    if (log === 'warning') {
                        console.warn(message);
                    }
                };

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

                            if (config.timeout === false) {
                                preload(imagesSrcList);
                            } else {
                                $timeout(preload.bind(null, imagesSrcList), config.timeout);
                            }
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
                            logger(this.src, 'debug')
                        };
                        image.onerror = function (e) {
                            console.log(e);
                        };
                    }
                }
            }

            function getPreload(preloadName) {
                logger('preloadService: get request ' + '"' + preloadName + '"', 'debug');
                if (!preloadName) {
                    return preloadCache;
                }

                for (let i = 0; i < preloadCache.length; i++) {
                    if (preloadCache[i].name === preloadName) {
                        return preloadCache[i].src
                    }
                }

                logger('No preloads found', 'warning');
            }

            return {
                preloadImages: preloadImages,
                getPreloadCache: getPreload
            }
        };
    }
})();