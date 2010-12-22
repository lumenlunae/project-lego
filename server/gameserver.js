var sys = require('sys');
var fs= require('fs');

var io = require('Socket.IO-node');
var BISON = require('bison');
// Message types
var MSG_GAME_START = 1;
var MSG_GAME_PING = 10;
var MSG_GAME_FIELDS = 2;
var MSG_GAME_SHUTDOWN = 3;

var MSG_ACTORS_INIT = 4;
var MSG_ACTORS_CREATE = 5;
var MSG_ACTORS_UPDATE = 6;
var MSG_ACTORS_EVENT = 0;
var MSG_ACTORS_REMOVE = 7;
var MSG_ACTORS_DESTROY = 8;

var MSG_CLIENT_MESSAGE = 9;

// Game Model ------------------------------------------------------------------
// -----------------------------------------------------------------------------
function Model(server, interval) {
	this.interval = interval;
	this.game = {};
	this.$ = server;
}
Model.prototype.Game = function() {
	return this.game;
};
Model.prototype.Server = function(options) {
	return new Server(options, this);
};

exports.Model = function(server, interval) {
	return new Model(server, interval);
};
// Server ----------------------------------------------------------------------
// -----------------------------------------------------------------------------
function Server(options, model) {
	this.maxChars = options.maxChars || 128;
	this.maxClients = options.maxClients || 64;
	this.port = options.port || 8000;
	this.showStatus = options.status === false ? false : true;
	// Server
	this.model = model;
	this.fields = {};
	this.fieldsChanged = false;
	this.logs = [];

	// Client
	this.clientCount = 0;
	this.clients = {};
	this.clientID = 0;

	this.bytesSend = 0;
	this.bytesSendLast = 0;

	// Socket
	var that = this;
	this.$ = io.listen(this.model.$);

	this.$.on('connection', function(client){
		console.log((new Date).getTime());
		console.log('Client Connected');

		client.on('message', function(messages){
			//client.broadcast(message);
			//client.send(message);
			console.log("received message");
			console.log(messages);
			messages = BISON.decode(messages);
			// messages is an array of [event, data]
			for (var i = 0; i < messages.length; i++) {
				that.processMessage(this, messages[i]);
			}
		});
		client.on('disconnect', function(){
			var level = that.removeClient(this.sessionId);
			if (level != null) that.$$.removePlayer(this.sessionId, level);
			var msg = that.toBISON({
				event: "s_delRemote",
				data: {
					id:client.sessionId
				}
			});
			this.broadcast(msg);
			console.log((new Date).getTime());
			console.log('Client Disconnected.');
		});
	});

	this.$.onConnect = function(conn) {
		if (this.clientCount >= this.maxClients) {
			conn.close();
			return;
		}
	};

	this.$.onMessage = function(conn, msg) {
		if (msg.length > that.maxChars) {
			that.log('!! Message longer than ' + that.maxChars + ' chars');
			conn.close();

		} else {
			try {
				if (!conn.$clientID && msg instanceof Array && msg.length === 1
					&& msg[0] === 'init') {

					conn.$clientID = that.addClient(conn);

				} else if (conn.$clientID) {
					that.clients[conn.$clientID].send(MSG_GAME_PING, []);
					that.clients[conn.$clientID].onMessage(msg);
				}

			} catch (e) {
				that.log('!! Error: ' + e);
				conn.close();
			}
		}
	};

	this.$.onClose = function(conn) {
		that.removeClient(conn.$clientID);
	};

	// Hey Listen!
	this.run();
}

Server.prototype.processMessage = function(client, msg) {
	var event = msg.event;
	var data = msg.data;
	switch (event) {
		case "g_enemyDied": {
			var msg = this.toBISON({
				event: "s_broadcast",
				data: {
					msg: "Enemy Died"
				}
			});
			this.$.broadcast(msg);
			//client.send("s_broadcast//Enemy Died");
			//client.send("s_enemySpawn");
			break;
		}
		case "g_changeLevel": {
			console.log("need to load level " + data.level)
			break;
		}
		case "g_loadedLevel": {
			console.log("addPlayer");
			this.$$.addPlayer(client.sessionId, data.level);
			console.log("addClient");
			this.addClient(client.sessionId, data.level);
			var packet = this.toBISON({
				event: "s_addPlayer",
				data: {
					id:client.sessionId,
					tx:30,
					ty:25
				}
			});

			client.send(packet);

			// send notice to create this remote player to all other
			//  clients
			var packet2 = this.toBISON({
				event: "s_addRemote",
				data: {
					id: client.sessionId,
					tx: 30,
					ty: 25
				}
			});
			client.broadcast(packet2);
			break;
		}
		case "g_sendInput": {
			var thisClient = this.getClient(client.sessionId);
			thisClient.lastAck = msg.seqID;
			this.$$.movePlayer(thisClient, data.keys);
			break;
		}
	}
};
// General ---------------------------------------------------------------------
Server.prototype.run = function() {
	var that = this;
	for(var i in this.actorTypes) {
		this.actors[i] = [];
	}
	this.startTime = (new Date()).getTime();
	this.time = (new Date()).getTime();
	this.packetID = 0;
	this.log('>> Server started');
	this.$$ = new Game(this);
	this.$$.start();
	this.status();

	if (this.record) {
		this.clientID++;
		this.clients[0] = new Client(this, null, true);
		this.clientCount++;
	}
	process.addListener('SIGINT', function(){
		that.shutdown()
	});
};

Server.prototype.shutdown = function() {
	this.$$.$running = false;
	this.emit(MSG_GAME_SHUTDOWN, this.$$.onShutdown());

	var that = this;
	setTimeout(function() {
		for(var c in that.clients) {
			that.clients[c].close();
		}
		that.saveRecording();
		that.log('>> Shutting down...');
		that.status(true);
		process.exit(0);
	}, 100);
};

Server.prototype.emit = function(type, msg) {
	msg.unshift(type);
	this.bytesSend += this.$.broadcast(msg);
};
// Helpers ---------------------------------------------------------------------
Server.prototype.log = function(str) {
	if (this.showStatus) {
		this.logs.push([this.getTime(), str]);
		if (this.logs.length > 20) {
			this.logs.shift();
		}

	} else {
		console.log(str);
	}
};
Server.prototype.getTime = function() {
	return this.time;
};

Server.prototype.timeDiff = function(time) {
	return this.time - time;
};

Server.prototype.log = function(str) {
	if (this.showStatus) {
		this.logs.push([this.getTime(), str]);
		if (this.logs.length > 20) {
			this.logs.shift();
		}

	} else {
		console.log(str);
	}
};

Server.prototype.toSize = function(size) {
	var t = 0;
	while(size >= 1024 && t < 2) {
		size = size / 1024;
		t++;
	}
	return Math.round(size * 100) / 100 + [' bytes', ' kib', ' mib'][t];
};

Server.prototype.toTime = function(time) {
	var t = Math.round((time - this.startTime) / 1000);
	var m = Math.floor(t / 60);
	var s = t % 60;
	return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
};

Server.prototype.toBISON = function(data) {
	return BISON.encode(data);
};

Server.prototype.status = function(end) {
	var that = this;
	if (!this.showStatus) {
		return;
	}

	var stats = '    Running ' + this.toTime(this.time) + ' | '
	+ this.clientCount
	+ ' Client(s) | ' + this.actorCount + ' Actor(s) | '
	+ this.toSize(this.bytesSend)
	+ ' send | '
	+ this.toSize((this.bytesSend - this.bytesSendLast) * 2)
	+ '/s\n';

	this.bytesSendLast = this.bytesSend;
	for(var i = this.logs.length - 1; i >= 0; i--) {
		stats += '\n      ' + this.toTime(this.logs[i][0])
		+ ' ' + this.logs[i][1];
	}
	sys.print('\x1b[H\x1b[J# NodeGame Server at port '
		+ this.port + (this.flash ? ' / 843' : '') + '\n' + stats + '\n\x1b[s\x1b[H');

	if (!end) {
		setTimeout(function() {
			that.status(false)
		}, 500);

	} else {
		sys.print('\x1b[u\n');
	}
};

// Clients ---------------------------------------------------------------------
Server.prototype.addClient = function(sessionId, level) {
	this.clients[level][sessionId] = new Client(this, sessionId, level);
	this.clientCount++;
	return sessionId;
};

Server.prototype.removeClient = function(id) {
	for (var level in this.clients) {
		if (this.clients[level][id]) {
			this.clientCount--;
			delete this.clients[level][id];
			return level;
		}
	}
	
};
Server.prototype.getClient = function(sessionId) {
	for (var level in this.clients) {
		if (this.clients[level][sessionId]) {
			return this.clients[level][sessionId];
		}
	}
};
Server.prototype.updateClients = function() {
	for(var maps in this.clients) {
		for (var id in this.clients[maps]) {
			this.clients[maps][id].update();
		}
	}
};


// Client -----------------------------------------------------------------------
// -----------------------------------------------------------------------------
function Client(srv, conn, level) {
	this.$ = srv;
	this.$$ = srv.$$
	this.$conn = conn;
	this.id = this.$.clientID;
	this.level = level;
	this.$.updates = 0;
	this.seqID = 0;
	this.lastAck = 0;
}

Client.prototype.update = function() {
	if (this.level) {
		var state = this.$$.getState(this.level);
		//console.log(this.id, this.$conn);
		//console.log(state.toString());
		var time = ((new Date()).getTime()).toString();
		var msg = this.$.toBISON({
			event: "s_update",
			data: {
				states: state
			},
			time: time,
			seqID: ++this.seqID,
			ack: this.lastAck
		});
		//console.log("data sent to " + this.$conn + " : " + msg.length + " / time: " + this.$.timeDiff((new Date()).getTime()));
		this.$.updates++;
		this.$.$.clients[this.$conn].send(msg)
	}
};

// Game ------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function Game(srv) {
	this.$ = srv;
	this.$interval = Math.round(1000 / this.$.model.interval);
	this.mapsDir = "./server/maps";
	this.maps = {};
	this.clients = {};
	this.groups = ["player", "movingobjects", "objects"];
	for(var m in this.$.model.game) {
		this[m] = this.$.model.game[m];
	}
}

Game.prototype.start = function() {
	this.$lastTime = this.$.time;
	this.$running = true;
	this.onInit();
	this.run();
};

Game.prototype.run = function() {
	if (this.$running) {
		/*
		this.$.time = new Date().getTime();
		while(this.$lastTime <= this.$.time) {
			this.onUpdate();
			this.$.updateClients();
			this.$lastTime += this.$interval;

		}
		var that = this;
		setTimeout(function(){
			that.run();
		}, 5);
		*/
		this.$lastTime = (new Date()).getTime();
		// update
		this.onUpdate();
		this.$.updateClients();

		this.$.time = (new Date()).getTime();
		this.$lastTime = this.$interval - (this.$.time - this.$lastTime);
		var that = this;
		setTimeout(function() {
			that.run();
		}, (this.$lastTime<=0?1:this.$lastTime));
	}
};
Game.prototype.getState = function(area) {
	var state = {};
	for (var i = 0; i < this.groups.length; i++) {
		state[this.groups[i]] = {};
		for (var name in this.maps[area].gbox._objects[this.groups[i]]) {
			var obj = this.maps[area].gbox._objects[this.groups[i]][name];
			state[this.groups[i]][name] = {
				x: obj.x,
				y: obj.y,
				accx: obj.accx,
				accy: obj.accy,
				ypushing: obj.ypushing,
				xpushing: obj.xpushing,
				facing: obj.facing
			};
		}
	}
	return state;
}

Game.prototype.printStatus = function() {
	var state = "";
	for (var area in this.maps) {
		state += "Area:\t"+ area + "\n";
		for (var i = 0; i < this.groups.length; i++) {
			for (var name in this.maps[area].gbox._objects[this.groups[i]]) {
				var obj = this.maps[area].gbox._objects[this.groups[i]][name];
				state += "\t"+obj.id+"\t("+obj.x+","+obj.y+")\n";
			}
		}
		state += "\n\n";
	}
	return state;
};

Game.prototype.printBundle = function(area) {
	// capture all objects in certain map layers
	// and based on their coordinates, create string with their values
	var code = "";
	for (var i = 0; i < this.groups.length; i++) {
		for (var name in this.maps[area].gbox._objects[this.groups[i]]) {
			var obj = this.maps[area].gbox._objects[this.groups[i]][name];
			if (obj.type == "npc") code += this.printNpc(obj);
			else if (obj.type == "enemy") code += this.printEnemy(obj);
			else if (obj.type == "player") code += this.printPlayer(obj);
		}
	}
	return code;
};

Game.prototype.printNpc = function(obj) {
	var code = "maingame.addNpc({x:";
	code += obj.x + ", y:" + obj.y + "}, [0],'" + obj.myDialogue;
	code += "', null, [4,5]);\n";
	return code;
};
Game.prototype.printEnemy = function(obj) {
	var code = "maingame.addEnemy('"+obj.id+"','"+obj.enemyclass;
	code += "',{x:"+obj.x+",y:"+obj.y+"}, true);\n";
	return code;
};
Game.prototype.printPlayer = function(obj) {
	var code = "maingame.addRemotePlayer({id:"+obj.id+",x:"+obj.x;
	code += ",y:"+obj.y+"});\n";
	return code;
};
Game.prototype.addPlayer = function(id, level) {
	this.maps[level].addPlayer(id, {
		tx:30,
		ty:25
	});
};
Game.prototype.movePlayer = function(client, dir) {
	this.maps[client.level].movePlayer(client.$conn, dir);
};
Game.prototype.removePlayer = function(id, level) {
	this.maps[level].removePlayer(id);
};
Game.prototype.onInit = function() {
	};

Game.prototype.onUpdate = function() {

	};

Game.prototype.onShutdown = function() {
	return [];
};

Game.prototype.log = function(str) {
	this.$.log(str);
};