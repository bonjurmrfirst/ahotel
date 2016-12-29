var express = require('express');
var app = express();
var engine = require('consolidate');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/dist'));

// views is directory for all template files
app.set('views', __dirname);
app.engine('html', engine.mustache);
app.set('view engine', 'html');

app.get('/', function(request, response) {
    response.render('dist/index');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
