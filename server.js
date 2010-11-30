//setup Dependencies
require(__dirname + "/lib/setup").ext( __dirname + "/lib").ext( __dirname + "/lib/express/support").ext( __dirname + "/server");
var connect = require('connect')
, express = require('express')
, sys = require('sys')
, fs = require('fs')
, nodegame = require('./server/gameserver')
, port = 3001;

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set("view engine", "jade");
    server.set("view options", {
        layout: "layout"
    });
    server.use(connect.bodyDecoder());
    server.use(connect.staticProvider(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.ejs', {
            layout: false,
            locals: {
                header: '#Header#',
                footer: '#Footer#',
                title : '404 - Not Found',
                description: '',
                author: '',
                analyticssiteid: 'XXXXXXX'
            },
            status: 404
        });
    } else {
        res.render('500.ejs', {
            layout: false,
            locals: {
                header: '#Header#',
                footer: '#Footer#',
                title : 'The Server Encountered an Error',
                description: '',
                author: '',
                analyticssiteid: 'XXXXXXX',
                error: err
            },
            status: 500
        });
    }
});
server.listen(port);

// Setup game
MMO = nodegame.Model(server, 20);
require('./server/game');
var gameserver = MMO.Server({
    'port': Math.abs(process.argv[2]) || 3001,
    'status': false
});
///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
    res.render('index', {
        locals : {
    }
    });
});

server.get('/getLevel/:area?', function(req, res) {
	// server needs to keep track of where a user is, and if
	// they request a level, where they're expecting to go
	fs.readFile('./client/maps/bundle-map-area' + req.params.area + '.js', function(err, data) {
			if (err) throw err;
			// game is in charge of printing out the latest info about the area
			// to the player

			data = data.toString();
			data = data.replace("REPLACEME;", gameserver.$$.printBundle(req.params.area));
			
			res.send(data);
	});
	
});
//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
