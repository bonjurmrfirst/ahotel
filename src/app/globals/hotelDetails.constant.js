(function () {
    angular
        .module('ahotelApp')
        .constant('hotelDetailsConstant', {
            types: [
                'Hotel',
                'Bungalow',
                'Villa'
            ],

            settings: [
                'Coast',
                'City',
                'Desert'
            ],

            locations: [
                'Namibia',
                'Libya',
                'South Africa',
                'Tanzania',
                'Papua New Guinea',
                'Reunion',
                'Swaziland',
                'Sao Tome',
                'Madagascar',
                'Mauritius',
                'Seychelles',
                'Mayotte',
                'Ukraine'
            ],

            guests: {
                max: 5
            },

            mustHaves: [
                'restaurant',
                'kids',
                'pool',
                'spa',
                'wifi',
                'pet',
                'disable',
                'beach',
                'parking',
                'conditioning',
                'lounge',
                'terrace',
                'garden',
                'gym',
                'bicycles'
            ],

            activities: [
                'Cooking classes',
                'Cycling',
                'Fishing',
                'Golf',
                'Hiking',
                'Horse-riding',
                'Kayaking',
                'Nightlife',
                'Sailing',
                'Scuba diving',
                'Shopping / markets',
                'Snorkelling',
                'Skiing',
                'Surfing',
                'Wildlife',
                'Windsurfing',
                'Wine tasting',
                'Yoga' 
            ],

            price: {
                min: 0,
                max: 1000
            }
        });
})();