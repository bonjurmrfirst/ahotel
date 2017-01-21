(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlMap', ahtlMapDirective);

    function ahtlMapDirective() {
        return {
            restrict: 'E',
            template: '<div class="destinations__map"></div>',
            link: ahtlMapDirectiveLink
        };

        function ahtlMapDirectiveLink($scope, elem, attr) {
            if (window.google && 'maps' in window.google) {
                initMap();
                return
            }

            let mapScript = document.createElement('script');
            mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxCK2-uVyl69wn7K61NPAQDf7yH-jf3w';
            mapScript.onload = function() {
                initMap();
            };
            document.body.appendChild(mapScript);

            function initMap() {
                var locations = [
                    ["Otjozondjupa Region, Kalahari Desert, Namibia", -20.330869, 17.346563],
                    ["Sirte District, Sahara Desert, Libya", 31.195005, 16.500483],
                    ["Limpopo, South Africa", -23.789900, 30.175637],
                    ["Bububu, Zanzibar Town Tanzania", -6.101247, 39.215758],
                    ["Madang Province, Papua New Guinea", -5.510379, 145.980497],
                    ["Saint Andre, Reunion", -20.919410, 55.642483],
                    ["Lubombo Region, Swaziland", -26.784930, 31.734820],
                    ["Cantagalo S?o Tom? and Pr?ncipe", 0.237637, 6.738835],
                    ["Ampanihy Madagascar", -25.023296, 44.063869],
                    ["Plaine Corail-La Fouche Corail Mauritius", -19.740817, 63.363294],
                    ["South Agalega Islands Mauritius", -10.455412, 56.685301],
                    ["North Agalega Islands Mauritius", -10.433995, 56.647268],
                    ["Coetivy Seychelles", -7.140338, 56.270384],
                    ["Dembeni Mayotte", -12.839928, 45.190855],
                    ["Babyntsi Kyivs'ka oblast, Ukraine", 50.638800, 30.022539],
                    ["Pechykhvosty, Volyns'ka oblast, Ukraine", 50.502495, 24.614732],
                    ["Bilhorod-Dnistrovs'kyi district, Odessa Oblast, Ukraine", 46.061116, 30.412401],
                    ["Petrushky, Kyivs'ka oblast, Ukraine", 50.420998, 30.161548],
                    ["Velyka Doch, Chernihivs'ka oblast, Ukraine", 51.307518, 32.574232]
                ];

                var myLatLng = {lat: -25.363, lng: 131.044};

                // Create a map object and specify the DOM element for display.
                var map = new google.maps.Map(document.getElementsByClassName('destinations__map')[0], {
                    scrollwheel: false
                });

                var icons = {
                    ahotel: {
                        icon: 'assets/images/icon_map.png'
                    }
                };

                for (i = 0; i < locations.length; i++) {
                    var marker = new google.maps.Marker({
                        title: locations[i][0],
                        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
                        map: map,
                        icon: icons["ahotel"].icon
                    });
                }

                /*centering*/
                var bounds = new google.maps.LatLngBounds ();
                for (var i = 0; i < locations.length; i++) {
                    var LatLang = new google.maps.LatLng (locations[i][1], locations[i][2]);
                    bounds.extend(LatLang);
                }
                map.fitBounds(bounds);
            };
        }
    }
})();