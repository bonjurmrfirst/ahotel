var express = require('express'),
    url = require('url'),
    engine = require('consolidate');

var appRoot = process.env.PORT ? '/dist' : '/dist.dev';

app = express();
app.set('port', process.env.PORT || 5000);

app.use(express.static(__dirname + appRoot));

app.engine('html', engine.mustache);
app.set('view engine', 'html');

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

    //
    //console.log(request.query);
    /*console.log('YEAH!');
    response.end('13');*/
    /*response.end('1');*/
    //response.render(appRoot + '/index');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
