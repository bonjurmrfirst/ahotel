var express = require('express');
var app = express();
var engine = require('consolidate');

var development = false;
var port = development ? 5000 : process.env.PORT;
var appRoot = development ? '/dist.dev' : '/dist';

app.set('port', port);

app.use(express.static(__dirname + appRoot));

app.engine('html', engine.mustache);
app.set('view engine', 'html');

app.get('/', function(request, response) {
    response.render(appRoot + '/index');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
