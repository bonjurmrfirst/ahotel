(function () {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('SocialShareController', SocialShareController);

    SocialShareController.$inject = ['Socialshare'];

    function SocialShareController(Socialshare) {
        let share = {
            content: 'Ahotel Limited is an international hospitality brand that ' +
                'manages and develops resorts, hotels and spas in Asia, America, Africa and Middle East.',
            url: 'https://enigmatic-depths-59034.herokuapp.com/'
        };


    }
})();