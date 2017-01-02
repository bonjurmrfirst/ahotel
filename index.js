var express = require('express'),
    url = require('url'),
    engine = require('consolidate'),
    bodyParser = require('body-parser'),

    db = require('./backend/db'),
    session = require('./backend/session.js');

var appRoot = process.env.PORT ? '/dist' : '/dist.dev';

app = express();
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + appRoot));

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

app.get('/api/top3', function(request, response) {
    if (request.query.action === 'get') {
        if (request.query.type === 'bungalows') {
            response.setHeader('Content-Type', 'application/json');
            response.send(require('./backend/top3.json'));
            return
        }

        if (request.query.type === 'hotels') {

        }

        if (request.query.type === 'villas') {

        }

        response.status(204).send();
    } else {
        response.status(400).send();
    }
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

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
