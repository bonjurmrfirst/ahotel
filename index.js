var express = require('express'),
    url = require('url'),
    engine = require('consolidate'),
    bodyParser = require('body-parser'),

    log = require('./backend/log/log'),
    db = require('./backend/db'),
    session = require('./backend/session');

var appRoot = process.env.PORT ? '/dist' : '/dist.dev';

app = express();
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + appRoot, { maxAge: 86400000}));

app.engine('html', engine.mustache);
app.set('view engine', 'html');

//app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(function(req,res,next){
   console.log(req.path);
    next();
});

app.get('/', function(request, response) {
    console.log('index');
    response.render(appRoot + '/index');
});

var users = [];
app.post('/api/users', function(request, response) {
    var
        credentials,
        dbInvokeDresult;

    console.log(request.query.action);
    if (request.query.action === 'put') {
        credentials = request.body;
        if (credentials.name && credentials.password && credentials.email) {
            dbInvokeDresult = db.addUser(credentials);

            if (dbInvokeDresult === 'SUCCESS') {
                response.status(200).send();
            } else {
                response.status(400).send(dbInvokeDresult);
            }
            return
        }
    }

    if (request.query.action === 'get') {
        credentials = request.body;
        if (credentials.name && credentials.password) {
            dbInvokeDresult = db.isUser(credentials);

            if (dbInvokeDresult === 'SUCCESS') {
                response.status(200).send(session(credentials.password));
            } else {
                response.status(400).send(dbInvokeDresult);
            }
            return
        }
    }
    response.status(400).send();
});

app.get('/api/users', function(request, response) {
    'use strict';

    console.log(request.query.action);
    if (request.query.action === 'get') {

    }
    response.status(400).send();
});

app.get('/api/gallery', function(request, response) {
    response.status(200).send(require('./backend/gallery'));
});

app.get('/api/guestcomments', function(request, response) {
    response.status(200).send(require('./backend/guestcomments'));
});

app.post('/api/guestcomments', function(request, response) {
    if (request.query.action === 'put') {
        console.log(request.body);

        var allComments = require('./backend/guestcomments');
        allComments.push({'name': request.body.comment.name, 'comment': request.body.comment.comment});
        require('fs').writeFile('./backend/guestcomments.json', JSON.stringify(allComments), function (err) {
            console.log(err);
            response.status(500)
        });
    }

    response.status(200).send(require('./backend/guestcomments'));
});

app.post('/api/log', function(request, response) {
    'use strict';
    log(request.body);
    response.status(200).send();
});
/*

 */

var favicon = require('serve-favicon');

var hotels = require('./backend/hotels.js');

app.use(favicon('./favicon.ico'));

app.use('/api/hotels', hotels);

app.get('/booking', function(req, res) {
    'use strict';

    res.send();
});

app.all('/*', function(req, res, next) {
    res.sendFile(appRoot + '/index.html', { root: __dirname });
});
/*

 */


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
