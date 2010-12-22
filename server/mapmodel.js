var Script = process.binding('evals').Script,
fs = require('fs'),
sys = require('sys'),
$toys, $trigo, $help;

function MapModel(area, aki2){
	this.area = area;
	this.tilemaps = {};
	this.dialogues = {};
	this.clients = [];
	var aki = {};
	var gboxScript = fs.readFileSync('./static/akihabara/gbox.js', "utf-8");
	//Script.runInThisContext(gboxScript,  './static/akihabara/gbox.js');
	var trigoScript = fs.readFileSync('./static/akihabara/trigo.js', 'utf-8');
	//Script.runInThisContext(trigoScript, './static/akihabara/trigo.js');
	var toysScript = fs.readFileSync('./static/akihabara/toys.js', 'utf-8');
	var toysEScript = fs.readFileSync('./static/js/toys_extension.js', 'utf-8');
	//Script.runInThisContext(toysScript,  './static/akihabara/toys.js');
	var helpScript = fs.readFileSync('./static/akihabara/help.js', 'utf-8');
	//Script.runInThisContext(helpScript, './static/akihabara/help.js');
	eval(gboxScript);
	eval(trigoScript);
	eval(toysScript);
	eval(toysEScript);
	eval(helpScript);
	$toys = toys;
	$trigo = trigo;
	$help = help;
	this.gbox = gbox;
	this.gbox.setGroups(['background', 'foreground', 'player', 'movingobjects', 'objects', 'projectiles', 'sparks', 'above', 'hud', 'game']);
	this.gbox.setRenderOrder(["background", "foreground", this.gbox.ZINDEX_LAYER, "sparks", "above", "hud", "game"]);

	if (this.area.setObject) {
		for (var i = 0; i < this.area.setObject.length; i++) {
			eval("(this."+this.area.setObject[i].object+")")[this.area.setObject[i].property]=this.area.setObject[i].value;
		}
	}
	// add Tiles
	if (this.area.addTiles) {
		for (var i = 0; i < this.area.addTiles.length; i++) this.gbox.addTiles(this.area.addTiles[i])
	}
	
	this.init = this.area.onInit;
	this.init();
}

MapModel.prototype.onUpdate = function() {
	this.gbox._gamewaiting=3;
	this.gbox._framestart=new Date().getTime();
	var gr="";
	for (var g=0;g<this.gbox._renderorder.length;g++)
		if (this.gbox._groupplay[this.gbox._renderorder[g]])
			if (this.gbox._renderorder[g]==this.gbox.ZINDEX_LAYER) {
				var id;
				for (var i=0;i<this.gbox._actionqueue.length;i++) {
					id=this.gbox._zindex.first;
					while (id!=null) {
						if (this.gbox._groupplay[this.gbox._zindex.data[id].g])
							this.gbox._playobject(this.gbox._zindex.data[id].g,this.gbox._zindex.data[id].o,this.gbox._actionqueue[i]);
						id=this.gbox._zindex.data[id].__next;
					}
				}
			} else
				for (var i=0;i<this.gbox._actionqueue.length;i++)
					for (var obj in this.gbox._objects[this.gbox._renderorder[g]])
						this.gbox._playobject(this.gbox._renderorder[g],obj,this.gbox._actionqueue[i]);
	if (this.gbox._fskid>=this.gbox._frameskip) {
		if (this.gbox._localflags.fse) this.gbox._applyfse();
		if (this.gbox._db) this.gbox.blitImageToScreen(this.gbox.getBuffer());
		this.gbox._fskid=0;
	} else this.gbox._fskid++;

	this.gbox.purgeGarbage();

	if (this.gbox._zindexch.length) {
		for (var i=0;i<this.gbox._zindexch.length;i++) {
			if (this.gbox._objects[this.gbox._zindexch[i].o.g][this.gbox._zindexch[i].o.o])
				if (this.gbox._objects[this.gbox._zindexch[i].o.g][this.gbox._zindexch[i].o.o].__zt==null)
					this.gbox._objects[this.gbox._zindexch[i].o.g][this.gbox._zindexch[i].o.o].__zt=this.gbox._zindex.addObject(this.gbox._zindexch[i].o,this.gbox._zindexch[i].z);
				else
					this.gbox._zindex.setPrio(this.gbox._objects[this.gbox._zindexch[i].o.g][this.gbox._zindexch[i].o.o].__zt,this.gbox._zindexch[i].z);
		}
		this.gbox._zindexch=[];
	}
};

MapModel.prototype.gameIsHold = function() {
	return false;
};
MapModel.prototype.playerDied = function() {
	
	};
MapModel.prototype.removePlayer = function(id) {
	this.gbox.trashObject(this.gbox.getObject("player", id));
};
MapModel.prototype.movePlayer = function(id, keys) {
	if (!isEmpty(keys)) {
		var player = this.gbox.getObject("player", id);
		console.log("move player!");
		console.log(id, keys);
		console.log(player.id);
		player.hasInput = true;
		player.input = keys;
		player.update();
		console.log(player.x, player.y);
	}
};
MapModel.prototype.addPlayer = function(id, pos) {
	var that = this;
	var td = this.gbox.getTiles(that.tilemaps.map_below.tileset);
	console.log("add player: ");
	console.log(id, pos);
	this.gbox.addObject({
		id: id,
		group: "player",
		tileset: "player",
		type: "player",
		zindex: 0,
		stilltimer: 0,
		invultimer: 0,
		framespeed: 5,
		xpushing: 0,
		ypushing: 0,
		isPaused: false,
		haspushing: true,
		hasInput: false,
		keys: {},
		input: [],
		doPause: function(p) {
			this.isPaused = p;
		},
		initialize: function() {
			console.log("INIT PLAYER????");
			$toys.topview.initialize(this, {});
			if (pos.tx)	this.x = pos.tx * td.tilew;
			else if (pos.x) this.x = pos.x;
			if (pos.ty) this.y = pos.ty * td.tileh;
			else if (pos.y) this.y = pos.y;
			this.fliph = false;
			this.shadow = {
				tileset: "shadows",
				tile: 0
			};
			console.log("INIT PLAYER");
			console.log(this.x, this.y);
		},
		collisionEnabled: function() {
			return !that.gameIsHold()&&!this.killed&&!this.invultimer;
		},
		hitByBullet: function(by) {
			if (this.collisionEnabled()) {
				this.accz = -5;
				this.invultimer = 30;
				this.stilltimer = 10;
				return by.undestructable;
			} else return true;
		},
		kill: function(by) {
			this.accz = -8;
			this.killed = true;
			that.playerDied({
				wait: 50
			});
		},
		attack: function() {
			this.stilltimer = 10;

			// sword
			toys.topview.fireBullet("projectiles", null, {
				fullhit: true,
				collidegroup: "movingobjects",
				map: that.tilemaps.map_middle,
				undestructable: true,
				power: 1,
				from: this,
				sidex: this.facing,
				sidey: this.facing,
				tileset: "swordhit",
				frames: {
					speed: 1,
					frames: [0,1]
				},
				duration: 4,
				acc: 5,
				fliph: (this.facing==$toys.FACE_RIGHT),
				flipv: (this.facing == $toys.FACE_DOWN),
				angle: $toys.FACES_ANGLE[this.facing]
			});
		},
		update: function() {
			this.first();
			this.then();
			this.blit();
			this.after();
		},
		first: function() {
			// grab inputs from a source, in this case keys
			if (this.input.indexOf("left") > -1) this.keys.pressleft = true;
			else if (this.input.indexOf("right") > -1) this.keys.pressright = true;
			if (this.input.indexOf("up") > -1) this.keys.pressup = true;
			else if (this.input.indexOf("down") > -1) this.keys.pressdown = true;

		// have section for button presses
			
		},
		then: function() {
			if (this.stilltimer) this.stilltimer--;
			if (this.invultimer) this.invultimer--;

			// grab inputs from a source, in this case keys
			if (this.stilltimer||that.gameIsHold()||this.isPaused||this.killed) {
				$toys.topview.controlKeys(this, {});
			} else {
				$toys.topview.controlKeys(this, this.keys);
			}
			that.generalCollisionCheck(this);
			$toys.topview.spritewallCollision(this, {
				group: "movingobjects"
			});
			$toys.topview.adjustZindex(this);
		},
		blit: function() {
				
		},
		after: function() {
			// reset inputs
			this.hasInput = false;
			this.input = [];
			this.keys = {};
		}

	});
}

MapModel.prototype.addEnemy = function(id, type, pos, cloud) {
	var that = this;
	var td = this.gbox.getTiles(this.tilemaps.map_below.tileset);
	var obj;
	switch(type) {
		case "monster": {
			obj = this.gbox.addObject({
				id: id,
				group: "movingobjects",
				tileset: "skel1",
				enemyclass: type,
				type: "enemy",
				zindex: 0,
				invultimer: 0,
				stilltimer: 0,
				framespeed: 3,
				xpushing: 0,
				ypushing: 0,
				initialize: function() {

					$toys.topview.initialize(this, {
						health: 3,
						shadow: {
							tileset: "shadows",
							tile: 0
						}
					});
					if (pos.tx)	this.x = pos.tx * td.tilew;
					else if (pos.x) this.x = pos.x;
					if (pos.ty) this.y = pos.ty * td.tileh;
					else if (pos.y) this.y = pos.y;
				},
				kill: function(by) {
					this.gbox.trashObject(this);
				//eventMan.fire("g_enemyDied");
				},
				attack: function() {
					this.stilltimer = 10;
					this.frame = 0;
					$toys.topview.fireBullet("projectiles", null, {
						fullhit: true,
						collidegroup: "player",
						map: that.tilemaps.map_middle,
						mapindex: "map",
						defaulttile: that.tilemaps._defaultblock,
						undestructable: false,
						power: 1,
						from: this,
						sidex: this.facing,
						sidey: this.facing,
						tileset: "bullet-black",
						frames: {
							speed: 1,
							frames: [0,1,2]
						},
						acc: 5,
						fliph: (this.facing == $toys.FACE_RIGHT),
						flipv: (this.facing == $toys.FACE_DOWN),
						angle: $toys.FACES_ANGLE[this.facing],
						spritewalls: "foreground",
						gapy: 7
					});
				},
				hitByBullet: function(by) {
					if (!this.invultimer) {
						this.health -= by.power;
						if (this.health <= 0)
							this.kill();
						else {
							this.accz -= 5;
							this.invultimer = 10;
							this.stilltimer = 10;
						}
						return by.undestructable;
					}
				},
				first: function() {
					if (this.stilltimer) this.stilltimer--;
					if (this.invultimer) this.invultimer--;
					if (!this.killed) {
						if (!this.stilltimer) $toys.topview.wander(this, that.tilemaps.map_middle, "map", 100, {
							speed: 1,
							minstep: 20,
							steprange: 150
						});
						if ((!this.stilltimer)&&$toys.timer.randomly(this, "fire", {
							base: 50,
							range: 50
						})) this.attack();
						that.generalCollisionCheck(this);
						$toys.topview.e.objectwallCollision(this, {
							group: "movingobjects"
						});
						$toys.topview.adjustZindex(this);
						if (!this.stilltimer)
						{
					}
						
					}				
				},
				blit: function() {
					return true;
				}
			});
			break;
		}
	}
	return obj;
};
MapModel.prototype.addNpc = function(pos, still, dialogue, questid, talking, silence) {
	
	var td = this.gbox.getTiles(this.tilemaps.map_below.tileset);
	var that = this;
	this.gbox.addObject({
		questid: questid,
		group: "movingobjects",
		type: "npc",
		tileset: "traveler",
		zindex: 0,
		framespeed: 3,
		myDialogue: dialogue,
		isTalking: false,
		silence: silence,
		xpushing: 0,
		ypushing: 0,
		doPlayerAction: function(sw) {
			this.isTalking = true;
		//maingame.startDialogue(this.myDialogue);
		},
		initialize: function() {
			$toys.topview.initialize(this);
			if (pos.tx)	this.x = pos.tx * td.tilew;
			else if (pos.x) this.x = pos.x;
			if (pos.ty) this.y = pos.ty * td.tileh;
			else if (pos.y) this.y = pos.y;
		},
		first: function(by) {
			this.counter = (this.counter+1) % 12;
			that.generalCollisionCheck(this);
			$toys.topview.e.objectwallCollision(this, {
				group: "movingobjects"
			});
			$toys.topview.adjustZindex(this);
			if (this.isTalking) {
				this.frame = [0]
				if (!this.gbox.getObject("movingobjects", "dialogue")) {
					this.amTalking = false;
					if ((this.questid != null) && (!that.tilemaps.queststatus[this.questid])) {
						that.tilemaps.queststatus[this.questid] = true;
					//maingame.addQuestClear();
					}
				}
			} else {
		}
		},
		blit: function() {
			return true;
		}
	});
};
MapModel.prototype.addMap = function(layer, groupid, layerid)
{
	console.log("ADD MAP");
	var canvas = "canvas_"+layerid;
	this.gbox.addObject({
		id: layerid,
		group: groupid,
		first: function() {

		},
		blit: function() {
			return true;
		}
	});
};

MapModel.prototype.generalCollisionCheck = function(obj) {
	$toys.topview.handleAccellerations(obj);
	$toys.topview.handleGravity(obj);
	if (!obj.stilltimer) $toys.topview.applyForces(obj);
	$toys.topview.applyGravity(obj); // z-gravity
	$toys.topview.tileCollision(obj, this.tilemaps.map_below, 'map', null, {
		tolerance: 2,
		approximation: 2
	});
	$toys.topview.tileCollision(obj, this.tilemaps.map_middle, 'map', null, {
		tolerance: 2,
		approximation: 2
	});
	$toys.topview.floorCollision(obj);

};

exports.MapModel = function(area, aki) {
	return new MapModel(area, aki);
}

function isEmpty(obj) {
	for(var prop in obj) {
		if(obj.hasOwnProperty(prop))
			return false;
	}

	return true;
}
