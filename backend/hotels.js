var express = require('express'),
    router = express.Router(),

    hotels = require('./data/hotels.json');

router.use(function (req, res, next) {
    console.log('ROUTE | hotels: ', new Date().toLocaleTimeString(), req.originalUrl);
    next();
});

router.get('/', function(req, res) {
    res.send('Birds home page');
});

/*router.get('/about', function(req, res) {
    res.send('About birds');
});*/

module.exports = router;