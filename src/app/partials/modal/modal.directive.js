(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlModal', ahtlModalDirective);

    function ahtlModalDirective() {
        return {
            restrict: 'EA',
            replace: false,
            link: ahtlModalDirectiveLink,
            templateUrl: 'app/partials/modal/modal.html'
        };

        function ahtlModalDirectiveLink($scope, elem) {
            $scope.show = {};

            $scope.$on('modalOpen', function(event, data) {
                if (data.show === 'image') {
                    $scope.src = data.src;
                    $scope.show.img = true;
                    elem.css('display', 'block');
                }

                if (data.show === 'map') {
                    $scope.show.map = true;

                    window.google = undefined;

                    if (window.google && 'maps' in window.google) {
                        initMap();

                    } else {

                        let mapScript = document.createElement('script');
                        mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxCK2-uVyl69wn7K61NPAQDf7yH-jf3w';
                        mapScript.onload = function () {
                            initMap();
                            elem.css('display', 'block');
                        };
                        document.body.appendChild(mapScript);
                    }
                }

                if (data.show === 'text') {
                    $scope.show.text = true;
                    $scope.show.header = data.header;
                    $scope.show.message = data.message;
                    elem.css('display', 'block');
                }

                function initMap() {
                    let myLatlng = {lat: data.coord.lat, lng: data.coord.lng};

                    let map = new google.maps.Map(document.getElementsByClassName('modal__map')[0], {
                        title: data.name,
                        map: map,
                        mapTypeId: 'roadmap',
                        zoom: 8,
                        center: myLatlng
                    });

                    let marker = new google.maps.Marker({
                        position: myLatlng,
                        map: map,
                        title: data.name
                    });

                    marker.addListener('click', function() {
                        map.setZoom(12);
                        map.setCenter(this.getPosition());
                    });
                }
            });

            $scope.closeDialog = function() {
                elem.css('display', 'none');
                $scope.show = {};
            };

            function initMap(name, coord) {
                let locations = [
                    [name, coord.lat, coord.lng]
                ];

                // Create a map object and specify the DOM element for display.
                let modalMap = new google.maps.Map(document.getElementsByClassName('modal__map')[0], {
                    center: {lat: coord.lat, lng: coord.lng},
                    scrollwheel: false,
                    zoom: 9
                });

                let icons = {
                    ahotel: {
                        icon: 'assets/images/icon_map.png'
                    }
                };

                new google.maps.Marker({
                    title: name,
                    position: new google.maps.LatLng(coord.lat, coord.lng),
                    map: modalMap,
                    icon: icons["ahotel"].icon
                });


/*
                for (i = 0; i < locations.length; i++) {
                    var marker = new google.maps.Marker({
                        title: name,
                        position: new google.maps.LatLng(coord.lat, coord.lng),
                        map: modalMap,
                        icon: icons["ahotel"].icon
                    });
                }

                /!*centering*!/
                var bounds = new google.maps.LatLngBounds ();
                for (var i = 0; i < locations.length; i++) {
                    var LatLang = new google.maps.LatLng (locations[i][1], locations[i][2]);
                    bounds.extend(LatLang);
                }
                modalMap.fitBounds(bounds);*/
            }
        }
    }
})();