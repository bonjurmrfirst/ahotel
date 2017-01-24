var express = require('express'),
    router = express.Router(),

    hotels = require('./data/hotels.json');

router.use(function (req, res, next) {
    console.log('ROUTE | hotels: ', new Date().toLocaleTimeString(), req.originalUrl);
    next();
});

router.get('/', function(req, res) {
    res.send(hotels);//res.status(500).send();
});

/*router.get('/:id', function(req, res) {
    res.send('');
});*/

module.exports = router;