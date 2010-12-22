$(document).ready(function() {
	eventMan = new manager.EventMan();

	eventMan.on("g_changeLevel", function(level) {
		console.log("g_changeLevel");
		var msg = {
			event: "g_changeLevel",
			data:{
				level: level
			},
			time: (new Date).getTime().toString()
		};
		this.queueMessage(msg);
	});
	eventMan.on("g_loadedLevel", function(level) {
		console.log("g_loadedLevel", level);
		var msg = {
			event: "g_loadedLevel",
			data: {
				level: level
			},
			time: (new Date).getTime().toString()
		};
		this.queueMessage(msg);
	});
	eventMan.on("g_enemyDied", function() {
		console.log("sending enemy died");
	//socket.send("g_enemyDied");
	});
	eventMan.on("g_sendInput", function(data) {
		var time = (new Date).getTime();
		var msg = {
			event: "g_sendInput",
			data: {
				keys: data
			},
			time: time.toString(),
			seqID: ++maingame.seqID
		};
		maingame.lasttime = time;
		this.queueMessage(msg);
	});
	eventMan.on("s_broadcast", function(data) {
		console.log(data);
		popDialogue(data.msg);
	});
	eventMan.on("s_enemySpawn", function() {
		maingame.addEnemy(null, "monster", 23, 26, true);
		maingame.addEnemy(null, "monster", 23, 26, true);
	});
	eventMan.on("s_addRemote", function(data) {
		console.log("ADD REMOTE", data);
		maingame.addRemotePlayer(data)
	});
	eventMan.on("s_delRemote", function(data) {
		maingame.deleteRemotePlayer(data.id);
	});
	eventMan.on("s_addPlayer", function(data) {
		console.log(data);
		console.log("ADD PLAYER", data);
		maingame.addPlayer(data);
		maingame.lastTime = (new Date()).getTime();
	});
	eventMan.on("s_update", function(data, time, seqID, ack) {
		if (time > maingame.lasttime) {
			maingame.lastAck = ack;
			var states = data.states;
			for (var group in states) {
				for (var id in states[group]) {
					if (group == "player" && id == PLAYER) {
						maingame.currentstate = gbox._objects[group][id].state();
						maingame.laststate = states[group][id];
						
					//console.log("push back");
					} else {
						gbox._objects[group][id].x = states[group][id].x;
						gbox._objects[group][id].y = states[group][id].y;
						/*
				gbox._objects[group][id].accx = states[group][id].accx;
				gbox._objects[group][id].accy = states[group][id].accy;
				gbox._objects[group][id].xpushing = states[group][id].xpushing;
				gbox._objects[group][id].ypushing = states[group][id].ypushing;
					 */
						gbox._objects[group][id].facing = states[group][id].facing;
					}
				}
			}
		}
		maingame.lasttime = time;
		historyCorrection(gbox._objects["player"][PLAYER]);
	});
});

this.manager = {};

(function() {
	var EventMan = manager.EventMan = function(options)  {
		help.mergeWithModel(options, {

			});
		this._events = {};
		this._messages = [];
		this.interval = Math.round(1000 / 1);
		this.laststate = (new Date).getTime();
		this.run();

	};
	EventMan.prototype.run = function() {
		this.lasttime = (new Date).getTime();
		this.processMessages();
		this.lasttime = this.interval - ((new Date).getTime() - this.lasttime);
		var that = this;
		setTimeout(function() {
			that.run();
		}, (this.lasttime<=0?1:this.lasttime))

	};
	EventMan.prototype.on = function(name, fn){
		if (!(name in this._events)) this._events[name] = [];
		this._events[name].push(fn);
		return this;
	};

	EventMan.prototype.fire = function(name, args){
		if (name in this._events){
			for (var i = 0, ii = this._events[name].length; i < ii; i++)
				this._events[name][i].apply(this, args === undefined ? [] : args);
		}
		return this;
	};

	EventMan.prototype.removeEvent = function(name, fn){
		if (name in this._events){
			for (var a = 0, l = this._events[name].length; a < l; a++)
				if (this._events[name][a] == fn) this._events[name].splice(a, 1);
		}
		return this;
	};

	EventMan.prototype.queueMessage = function(msg) {
		this._messages.push(msg);
	}

	EventMan.prototype.processMessages = function() {
		if (this._messages.length > 0) {
			console.log("SENDING #", this._messages[this._messages.length-1].seqID);
			var msg = BISON.encode(this._messages);
			setTimeout(function() {
				socket.send(msg);
			}, 1);
			this._messages = [];
		}
	};
})();