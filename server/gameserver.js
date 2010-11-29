var sys = require('sys');
var fs= require('fs');

var io = require('Socket.IO-node');

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
        console.log('Client Connected');

        client.on('message', function(message){
            //client.broadcast(message);
            //client.send(message);
            console.log(message)
            switch (message) {
                case "g_enemyDied": {
                    that.$.broadcast("s_broadcast//Enemy Died");
                    //client.send("s_broadcast//Enemy Died");
                    client.send("s_enemySpawn");
                    break;
                }
                case "b": {
                    break;
                }
            }
        });
        client.on('disconnect', function(){
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


// General ---------------------------------------------------------------------
Server.prototype.run = function() {
    var that = this;
    for(var i in this.actorTypes) {
        this.actors[i] = [];
    }
    this.startTime = new Date().getTime();
    this.time = new Date().getTime();
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
        setTimeout(function() {that.status(false)}, 500);

    } else {
        sys.print('\x1b[u\n');
    }
};

// Clients ---------------------------------------------------------------------
Server.prototype.addClient = function(conn) {
    this.clientID++;
    this.clients[this.clientID] = new Client(this, conn, false);
    this.clientCount++;
    return this.clientID;
};

Server.prototype.removeClient = function(id) {
    if (this.clients[id]) {
        this.clientCount--;
        this.clients[id].remove();
        delete this.clients[id];
    }
};

Server.prototype.updateClients = function() {
    for(var c in this.clients) {
        this.clients[c].update();
    }
};


// Game ------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function Game(srv) {
    this.$ = srv;
    this.$interval = Math.round(1000 / this.$.model.interval);
    this.mapsDir = "./server/maps";
    this.maps = [];
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
        this.$.time = new Date().getTime();
        while(this.$lastTime <= this.$.time) {
            this.onUpdate();
            this.$lastTime += this.$interval;
        }
        var that = this;
        setTimeout(function(){
            that.run();
        }, 5);
    }
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