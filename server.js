// set up =====
var express = require('express');
var port = process.env.PORT || 8000;
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan'); // log requrest to the console
var bodyParser = require('body-parser');  // pull information from HTHM POST
var methodOverride = require('method-override');  // simulate DELETE and PUT

// configuration =====
var database = require('./config/database');
mongoose.connect(database.url);

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(methodOverride());

var routes = require('./app/routes');
routes(app);

var server = require('http').createServer(app);
var io = require('socket.io')(server);
require('./app/socket/socket')(io);


server.listen(port);
console.log('App listening on port ' + port);

