var noface;
var dialogues = {};
var maingame;
var fps = 20;
var tilemaps = {};
var pathmaps = [];
var serverDialogue = {
	text: [],
	window : {}
};
var PLAYER = "player";
var frame_count = 0;
var touchParams = {
	title: 'aki',
	fps: fps
};
var fullParams = {
	title: 'aki',
	width: 320,
	height: 240,
	zoom: 2,
	fps: fps
};

window.addEventListener('load', loadResources, false);
function loadResources() {
	if (help.getDeviceConfig().touch) {
		help.akihabaraInit(touchParams);
	} else {
		help.akihabaraInit(fullParams);
	}
	document.body.style.backgroundColor = "#101010";
		
	gbox.addBundle({
		file: "resources/bundle.js"
	});
	noface = {
		noone: {
			x: 10,
			y: 170,
			box: {
				x:0,
				y: 160,
				w:gbox.getScreenW(),
				h:60,
				alpha: 0.5
			}
		}
	};
	gbox.loadAll(main);
}

function main() {
	gbox.setGroups(['background', 'foreground', 'player', 'movingobjects', 'objects', 'projectiles', 'sparks', 'above', 'hud', 'game']);
	gbox.setRenderOrder(["background", "foreground", gbox.ZINDEX_LAYER, "sparks", "above", "hud", "game"]);

	maingame = gamecycle.createMaingame('game', 'game');
	maingame.gameMenu = function() {
		return true;
	};
	maingame.seqID = 0;
	maingame.lasttime = (new Date()).getTime();
	maingame.messages = [];
	// zero index has farthest input, last index has most recent
	maingame.inputs = [];
	maingame.queueMessage = function(msg) {
		this.messages.push(msg);
	};
	maingame.processMessages = function() {
		while(this.messages.length > 0) {
			var msg = this.messages.shift();
			this.handleMessage(msg);
		}
	};
	maingame.handleMessage = function(msg) {
		eventMan.fire(msg.event, [msg.data, parseInt(msg.time), msg.seqID, msg.ack]);
	};
	// keep 1 sec worth of client local input
	maingame.queueInput = function(input, state) {
		var move = {
			time: (new Date).getTime(),
			seqID: maingame.seqID,
			input: input,
			state: state
		};
		// determine if important move
		//
		
		if (this.inputs.length >= fps)
			this.inputs.shift();
		this.inputs.push(move);
	};

	maingame.first = function() {
		this.processMessages();
	};
	maingame.gameIntroAnimation = function() {
		return true;
	};
	maingame.levelIntroAnimation=function(reset) {
		if (reset) {
			toys.resetToy(this,"default-blinker");
		} else {
			gbox.blitFade(gbox.getBufferContext(),{
				alpha:1
			});
			return toys.text.fixed(this,"default-blinker",gbox.getBufferContext(),{
				font:"big",
				text:maingame.getNextLevel().label,
				valign:gbox.ALIGN_MIDDLE,
				halign:gbox.ALIGN_CENTER,
				dx:0,
				dy:0,
				dw:gbox.getScreenW(),
				dh:gbox.getScreenH(),
				time:50
			});
		}
	}

	maingame.changeLevel = function(level) {
		gbox.trashGroup("background");
		gbox.trashGroup("foreground");
		gbox.trashGroup("movingobjects");
		gbox.trashGroup("objects");
		gbox.trashGroup("projectiles");

		if (level == null) {
			level = 1;
		}
		dialogues = {};
		pathmap = [];
		if (tilemaps.map_below) delete tilemaps.map_below;
		if (tilemaps.map_middle) delete tilemaps.map_middle;
		if (tilemaps.map_above) delete tilemaps.map_above;
		// Here we request a level from the server
		maingame.loadBundle("/getLevel/"+level, level)
		

	};

	maingame.initializeGame = function() {

	};

	maingame.loadBundle = function(bundleURL, level) {
		gbox.addBundle({
			//file: "/resources/bundle-map-area" + level + ".js",
			file: bundleURL,
			onLoad: function() {
				gbox.blitFade(gbox.getBufferContext(), {
					alpha: 1
				});
				gbox.blitText(gbox.getBufferContext(), {
					font: "small",
					text: "Now Loading...",
					valign: gbox.ALIGN_BOTTOM,
					halign: gbox.ALIGN_RIGHT,
					dx: 0,
					dy: 0,
					dw: gbox.getScreenW(),
					dh: gbox.getScreenH()
				});
				help.finalizeTilemap(tilemaps.map_below);
				help.finalizeTilemap(tilemaps.map_middle);
				help.finalizeTilemap(tilemaps.map_above);

				createPathFromTileMap(pathmaps, tilemaps.map_below);
				createPathFromTileMap(pathmaps, tilemaps.map_middle);

				gbox.createCanvas("canvas_below", {
					w: tilemaps.map_below.w,
					h: tilemaps.map_below.h
				});

				gbox.blitTilemap(gbox.getCanvasContext("canvas_below"), tilemaps.map_below);

				gbox.createCanvas("canvas_middle", {
					w: tilemaps.map_middle.w,
					h: tilemaps.map_middle.h
				});

				gbox.blitTilemap(gbox.getCanvasContext("canvas_middle"), tilemaps.map_middle);

				gbox.createCanvas("canvas_above", {
					w: tilemaps.map_above.w,
					h: tilemaps.map_above.h
				});

				gbox.blitTilemap(gbox.getCanvasContext("canvas_above"), tilemaps.map_above);
				tilemaps.map.addObjects();
				eventMan.fire("g_loadedLevel", [level]);
			}
		});
	};
	maingame.addChatWindow = function(id) {
		gbox.createCanvas("window_"+id);
		var window = gbox.addObject({
			group: "hud",
			id: "window_" + id,
			text: [],
			max: 4,
			refresh: false,
			spacing: 2,
			initialize: function() {
				this.rect = {
					x: 10,
					y: 230,
					box: {
						x:0,
						y: 180,
						w: 130,
						h:60,
						alpha: 0.5
					}
				}
			},
			push: function(text) {
				if (this.text.length == this.max) {
					this.text.pop();
				}
				this.text.unshift(text);
				this.refresh = true;
			},
			blit: function() {
				if (this.refresh) {
					gbox.blitClear(gbox.getCanvasContext(this.id));
					if (this.text.length > 0) {
						var font = gbox.getFont("small");
						for(var row = 0; row < this.text.length; row++) {
							gbox.blitText(gbox.getCanvasContext(this.id), {
								font: font.id,
								text: this.text[row],
								dx: this.rect.x,
								dy: this.rect.y - (row)*(font.tileh+this.spacing)
							});
						}
					}
					this.refresh = false;
				}

				gbox.blitRect(gbox.getBufferContext(), this.rect.box);
				gbox.blitAll(gbox.getBufferContext(),gbox.getCanvas(this.id),{
					dx:0,
					dy:0
				});
			}
		});
		return window;
	};
	maingame.startDialogue = function(id, pause) {
		if ((maingame.difficulty == 0) || (!dialogues[id].isTutorial)) {
			gbox.addObject({
				group: "hud",
				id: "dialogue",
				dialogueToRead: id,
				pause: 1+(pause==null?0:1),
				initialize: function() {
				//gbox.getObject("player", "player").doPause(true);
				},
				blit: function() {
					if (this.pause)
						this.pause--;
					else if (toys.dialogue.render(this, "dialogue", dialogues[this.dialogueToRead])) {
						//gbox.getObject("player", "player").doPause(false); // unpause
						gbox.trashObject(this);
					}
				}
			});
		}
	};

	maingame.addSmoke = function(obj, color) {
		toys.generate.sparks.simple(obj,"sparks",null,{
			camera:true,
			animspeed:2,
			accy:-3,
			accx:-3,
			tileset:(color==null?"flame-blue":color)
		});
		toys.generate.sparks.simple(obj,"sparks",null,{
			camera:true,
			animspeed:2,
			accy:-3,
			accx:3,
			tileset:(color==null?"flame-blue":color)
		});
		toys.generate.sparks.simple(obj,"sparks",null,{
			camera:true,
			animspeed:2,
			accy:3,
			accx:-3,
			tileset:(color==null?"flame-blue":color)
		});
		toys.generate.sparks.simple(obj,"sparks",null,{
			camera:true,
			animspeed:2,
			accy:3,
			accx:3,
			tileset:(color==null?"flame-blue":color)
		});
	}
	maingame.addEnemy = function(id, type, pos, cloud) {
		var td = gbox.getTiles(tilemaps.map_below.tileset);
		var obj;
		switch(type) {
			case "monster": {
				obj = gbox.addObject({
					id: id,
					group: "movingobjects",
					tileset: "skel1",
					zindex: 0,
					invultimer: 0,
					stilltimer: 0,
					framespeed: 3,
					initialize: function() {
						toys.topview.initialize(this, {
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
						this.frames = generalAnimList(this);
					},
					kill: function(by) {
						toys.generate.sparks.simple(this, "sparks", null, {
							animspeed: 2,
							accy: -3,
							tileset: "flame-blue"
						});
						toys.generate.sparks.simple(this, "sparks", null, {
							animspeed: 1,
							accx: -3,
							tileset: "flame-blue"
						});
						toys.generate.sparks.simple(this, "sparks", null, {
							animspeed: 1,
							accx: 3,
							tileset: "flame-blue"
						});
						gbox.trashObject(this);
						eventMan.fire("g_enemyDied");
					},
					attack: function() {
						this.stilltimer = 10;
						this.frame = 0;
						toys.generate.sparks.simple(this, "sparks", null, {
							animspeed: 2,
							accy: -2,
							tileset: "cloud-black"
						});
						toys.topview.fireBullet("projectiles", null, {
							fullhit: true,
							collidegroup: "player",
							map: tilemaps.map_middle,
							mapindex: "map",
							defaulttile: tilemaps._defaultblock,
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
							fliph: (this.facing == toys.FACE_RIGHT),
							flipv: (this.facing == toys.FACE_DOWN),
							angle: toys.FACES_ANGLE[this.facing],
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
						if (objectIsAlive(this)&&false) {
							if (!this.killed) {
								if (!this.stilltimer) toys.topview.wander(this, tilemaps.map_middle, "map", 100, {
									speed: 1,
									minstep: 20,
									steprange: 150
								});
								if ((!this.stilltimer)&&toys.timer.randomly(this, "fire", {
									base: 50,
									range: 50
								})) this.attack();
								generalCollisionCheck(this);
								toys.topview.e.objectwallCollision(this, {
									group: "movingobjects"
								});
								toys.topview.adjustZindex(this);
								if (!this.stilltimer)
								{
									generalAnimFramesAndFacing(this);
								}
							//var p = gbox.getObject("player", "player");
							//if (!p.initialize&&p.collisionEnabled()&&(toys.topview.collides(this, p))) p.hitByBullet({
							//	power: 1
							//});
							}
						}
					},
					blit: function() {
						if ((!this.killed) && gbox.objectIsVisible(this)&&((this.invultimer%2) == 0)) {
							gbox.blitTile(gbox.getBufferContext(),{
								tileset:this.shadow.tileset,
								tile:this.shadow.tile,
								dx:this.x,
								dy:this.y+this.h-gbox.getTiles(this.shadow.tileset).tileh+2,
								camera:this.camera,
								alpha: 0.5
							});
							gbox.blitTile(gbox.getBufferContext(),{
								tileset:this.tileset,
								tile:this.frame,
								dx:this.x,
								dy:this.y+this.z,
								camera:this.camera,
								fliph:this.fliph,
								flipv:this.flipv
							});
						}
					}
				});
				break;
			}
		}
		if (cloud) maingame.addSmoke(obj, "cloud-black");
		return obj;
	};
	maingame.addNpc = function(pos, still, dialogue, questid, talking, silence) {
		var td = gbox.getTiles(tilemaps.map_below.tileset);
		gbox.addObject({
			questid: questid,
			group: "movingobjects",
			tileset: "traveler",
			zindex: 0,
			framespeed: 3,
			myDialogue: dialogue,
			isTalking: false,
			silence: silence,
			shadow: {
				tileset: "shadows",
				tile: 0
			},
			doPlayerAction: function(sw) {
				this.isTalking = true;
				maingame.startDialogue(this.myDialogue);
			},
			initialize: function() {
				toys.topview.initialize(this);
				if (pos.tx)	this.x = pos.tx * td.tilew;
				else if (pos.x) this.x = pos.x;
				if (pos.ty) this.y = pos.ty * td.tileh;
				else if (pos.y) this.y = pos.y;
				this.frames = generalAnimList(this);
			},
			first: function(by) {
				this.counter = (this.counter+1) % 12;
				generalCollisionCheck(this);
				toys.topview.e.objectwallCollision(this, {
					group: "movingobjects"
				});
				toys.topview.adjustZindex(this);
				if (this.isTalking) {
					this.frame = [0]
					if (!gbox.getObject("movingobjects", "dialogue")) {
						this.amTalking = false;
						if ((this.questid != null) && (!tilemaps.queststatus[this.questid])) {
							tilemaps.queststatus[this.questid] = true;
							maingame.addQuestClear();
						}
					}
				} else {
					this.frame = help.decideFrame(this.counter, this.frames.standup);
				}
			},
			blit: function() {
				if (gbox.objectIsVisible(this)) {
					
					gbox.blitTile(gbox.getBufferContext(),{
						tileset:this.shadow.tileset,
						tile:this.shadow.tile,
						dx:this.x,
						dy:this.y+this.h-gbox.getTiles(this.shadow.tileset).tileh+2,
						camera:this.camera,
						alpha: 0.5
					});
					gbox.blitTile(gbox.getBufferContext(), {
						tileset: this.tileset,
						tile: this.frame,
						dx: this.x,
						dy: this.y + this.z,
						camera: this.camera,
						fliph: this.fliph,
						flipv: this.flipv
					});
				}
			}
		});
	};
	maingame.deleteRemotePlayer = function(data) {
		var player = gbox.getObject("player", data.id);
		gbox.trashObject(player);
	};
	maingame.addRemotePlayer = function(data) {
		var td = gbox.getTiles(tilemaps.map_below.tileset);
		gbox.addObject({
			id: data.id,
			group: "player",
			tileset: "player",
			zindex: 0,
			stilltimer: 0,
			invultimer: 0,
			framespeed: 5,
			isPaused: false,
			haspushing: true,
			time: 0,
			lasttime: 0,
			doPause: function(p) {
				this.isPaused = p;
			},
			initialize: function() {
				toys.topview.initialize(this, {});
				if (data.tx)	this.x = data.tx * td.tilew;
				else if (data.x) this.x = data.x;
				if (data.ty) this.y = data.ty * td.tileh;
				else if (data.y) this.y = data.y;
				this.fliph = false;
				this.frames = generalAnimList(this);
				this.shadow = {
					tileset: "shadows",
					tile: 0
				};
				this.lasttime = new Date().getTime();
			},
			collisionEnabled: function() {
				return !maingame.gameIsHold()&&!this.killed&&!this.invultimer&&!this.isPaused;
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
			},
			attack: function() {
				this.stilltimer = 10;
				// sword
				toys.topview.fireBullet("projectiles", null, {
					fullhit: true,
					collidegroup: "movingobjects",
					map: tilemaps.map_middle,
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
					fliph: (this.facing==toys.FACE_RIGHT),
					flipv: (this.facing == toys.FACE_DOWN),
					angle: toys.FACES_ANGLE[this.facing]
				});
			},
			first: function() {
			
			},
			then: function() {
				// ignore for now until we figure out what to do.
				if (false) {
					if (this.stilltimer) this.stilltimer--;
					if (this.invultimer) this.invultimer--;

					generalCollisionCheck(this);
					toys.topview.spritewallCollision(this, {
						group: "movingobjects"
					});
					toys.topview.adjustZindex(this);


					if (!this.stilltimer&&!this.killed) {
						generalAnimFramesAndFacing(this);
					}
				}
			},
			blit: function() {
				if ((this.invultimer%2) == 0) {
					gbox.blitTile(gbox.getBufferContext(),{
						tileset:this.shadow.tileset,
						tile:this.shadow.tile,
						dx:this.x,
						dy:this.y+this.h-gbox.getTiles(this.shadow.tileset).tileh+2,
						camera:this.camera,
						alpha: 0.5
					});
					gbox.blitTile(gbox.getBufferContext(), {
						tileset: this.tileset,
						tile: this.frame,
						dx: this.x,
						dy: this.y+ this.z,
						camera: this.camera,
						fliph: this.fliph,
						flipv: this.flipv,
						alpha: 1.0
					});
				}
			}

		})
	};
	maingame.addPlayer = function(data) {
		var td = gbox.getTiles(tilemaps.map_below.tileset);
		PLAYER = data.id;
		gbox.addObject({
			id: data.id,
			group: "player",
			tileset: "player",
			zindex: 0,
			stilltimer: 0,
			invultimer: 0,
			framespeed: 5,
			isPaused: false,
			haspushing: true,
			time: 0,
			lasttime: 0,
			xpushing: toys.PUSH_NONE,
			ypushing: toys.PUSH_NONE,
			keys: {},
			doPause: function(p) {
				this.isPaused = p;
			},
			initialize: function() {
				toys.topview.initialize(this, {});
				if (data.tx)	this.x = data.tx * td.tilew;
				else if (data.x) this.x = data.x;
				if (data.ty) this.y = data.ty * td.tileh;
				else if (data.y) this.y = data.y;
				this.fliph = false;
				this.frames = generalAnimList(this);
				this.shadow = {
					tileset: "shadows",
					tile: 0
				};
				this.lasttime = new Date().getTime();
			},
			collisionEnabled: function() {
				return !maingame.gameIsHold()&&!this.killed&&!this.invultimer&&!this.isPaused;
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
				maingame.playerDied({
					wait: 50
				});
			},
			attack: function() {
				this.stilltimer = 10;

				// sword
				toys.topview.fireBullet("projectiles", null, {
					fullhit: true,
					collidegroup: "movingobjects",
					map: tilemaps.map_middle,
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
					fliph: (this.facing==toys.FACE_RIGHT),
					flipv: (this.facing == toys.FACE_DOWN),
					angle: toys.FACES_ANGLE[this.facing]
				});
			},
			state: function() {
				var a = {
					x: this.x,
					y: this.y,
					accx: this.accx,
					accy: this.accy,
					xpushing: this.xpushing,
					ypushing: this.ypushing,
					facing: this.facing
				};
				return a;
			},
			first: function() {
				var keys = {
					left: "left",
					right: "right",
					up: "up",
					down: "down"
				};

				// need to integrate better, but this is specific for sending to server
				var keymsgs = [];
				if (gbox.keyIsPressed(keys.left)) {
					keymsgs.push(keys.left);
					this.keys.pressleft = true;
				} else if (gbox.keyIsPressed(keys.right)) {
					keymsgs.push(keys.right);
					this.keys.pressright = true;
				}
				if (gbox.keyIsPressed(keys.up)) {
					keymsgs.push(keys.up);
					this.keys.pressup = true;
				} else if (gbox.keyIsPressed(keys.down)) {
					keymsgs.push(keys.down);
					this.keys.pressdown = true;
				}
				if (keymsgs.length > 0) {
					
				}
				this.input = keymsgs;
				eventMan.fire("g_sendInput", [keymsgs]);
				maingame.queueInput(this.keys, this.state());

				
				if (!this.stilltimer&&!this.isPaused&&!maingame.gameIsHold()&&!this.killed) {
					if (gbox.keyIsHit("a")) {
						var p = gbox._objects["player"][PLAYER];
						console.log(p.x, p.y);
						this.attack();
					}
					else if (gbox.keyIsHit("b")) {
						var ahead = toys.topview.getAheadPixel(this, {
							distance: 5
						});
						ahead.group = "movingobjects";
						ahead.call = "doPlayerAction";
						if (!toys.topview.callInColliding(this, ahead)) {
							// something?
							// supposedly change weapon
							var miss = true;
						}
					}
				}
			},
			then: function() {
				if (this.stilltimer) this.stilltimer--;
				if (this.invultimer) this.invultimer--;

				this.counter = (this.counter+1)%60;

				if (this.stilltimer||maingame.gameIsHold()||this.isPaused||this.killed) {
					toys.topview.controlKeys(this, {});
				} else {
					toys.topview.controlKeys(this, this.keys);

				}
				
				generalCollisionCheck(this);
				toys.topview.spritewallCollision(this, {
					group: "movingobjects"
				});
				toys.topview.adjustZindex(this);


				if (!this.stilltimer&&!this.killed) {
					generalAnimFramesAndFacing(this);
				}

			},
			blit: function() {
				if ((this.invultimer%2) == 0) {
					gbox.blitTile(gbox.getBufferContext(),{
						tileset:this.shadow.tileset,
						tile:this.shadow.tile,
						dx:this.x,
						dy:this.y+this.h-gbox.getTiles(this.shadow.tileset).tileh+2,
						camera:this.camera,
						alpha: 0.5
					});
					gbox.blitTile(gbox.getBufferContext(), {
						tileset: this.tileset,
						tile: this.frame,
						dx: this.x,
						dy: this.y+ this.z,
						camera: this.camera,
						fliph: this.fliph,
						flipv: this.flipv,
						alpha: 1.0
					});
				}
			},
			after: function() {
				this.hasInput = false;
				this.input = [];
				this.keys = {};
			}

		})
	};
	gbox.go();
}


function addMap(layer, groupid, layerid)
{
	var canvas = "canvas_"+layerid;
	gbox.addObject({
		id: layerid,
		group: groupid,
		first: function() {

		},
		blit: function() {
			if (this.id == "below") {
				if (gbox.getObject("player", PLAYER)) {
					followCamera(gbox.getObject("player", PLAYER), {
						w: layer.w,
						h: layer.h
					});
				}
				gbox.blitFade(gbox.getBufferContext(), {
					alpha: 1
				});
			}
			gbox.blit(gbox.getBufferContext(), gbox.getCanvas(canvas), {
				dx: 0,
				dy: 0,
				dw: gbox.getCanvas(canvas).width,
				dh: gbox.getCanvas(canvas).height,
				sourcecamera: true
			});
		}
	});
}

function followCamera(obj, viewdata) {
	var xbuf = 96;
	var ybuf = 96;
	var xcam = gbox.getCamera().x;
	var ycam = gbox.getCamera().y;
	if ((obj.x - xcam) > (gbox._screenw - xbuf)) {
		gbox.setCameraX(xcam + (obj.x - xcam) - (gbox._screenw - xbuf), viewdata);
	}
	if ((obj.x - xcam) < (xbuf)) {
		gbox.setCameraX(xcam + (obj.x - xcam) - xbuf, viewdata)
	}
	if ((obj.y - ycam) > (gbox._screenh - ybuf)) {
		gbox.setCameraY(ycam + (obj.y - ycam) - (gbox._screenh - ybuf), viewdata);
	}
	if ((obj.y - ycam) < ybuf) {
		gbox.setCameraY(ycam + (obj.y - ycam) - ybuf, viewdata);
	}
}
function generalCollisionCheck(obj) {
	toys.topview.handleAccellerations(obj);
	toys.topview.handleGravity(obj);
	if (!obj.stilltimer) toys.topview.applyForces(obj);
	toys.topview.applyGravity(obj); // z-gravity
	toys.topview.tileCollision(obj, tilemaps.map_below, 'map', null, {
		tolerance: 2,
		approximation: 2
	});
	toys.topview.tileCollision(obj, tilemaps.map_middle, 'map', null, {
		tolerance: 2,
		approximation: 2
	});
	toys.topview.floorCollision(obj);

}
function createPathFromTileMap(pathMap, tileMap) {
	// initialize
	if (pathMap.length == 0) {
		for (i = 0; i < tileMap.x; i++) {
			pathMap.push([]);
		}
	}
	for (i = 0; i < tileMap.x; i++) {
		for (j = 0; j < tileMap.x; j++) {
			var solid = tileMap.tileIsSolid(tileMap, tileMap.map[i][j]);
			if (pathMap[j][i] == null) {
				pathMap[j][i] = solid;
			} else {
				// OR with what we have
				pathMap[j][i] = (solid || pathMap[j][i]);
			}
		}
	}
}

function generalAnimFramesAndFacing(obj) {
	obj.counter = (obj.counter + 1) % 60;
	toys.topview.e.setFrame(obj, toys.FACE_LEFT)
}
function generalAnimList(obj) {
	return {
		standup: {
			speed: 1,
			frames: [0]
		},
		standright: {
			speed: 1,
			frames: [0]
		},
		standdown: {
			speed: 1,
			frames: [0]
		},
		standleft: {
			speed: 1,
			frames: [0]
		},
		movingup: {
			speed: obj.framespeed,
			frames: [0]
		},
		movingright: {
			speed: obj.framespeed,
			frames: [0]
		},
		movingdown: {
			speed: obj.framespeed,
			frames: [0]
		},
		movingleft: {
			speed: obj.framespeed,
			frames: [0]
		},
		pushingup: {
			speed: obj.framespeed,
			frames: [0]
		},
		pushingright: {
			speed: obj.framespeed,
			frames: [0]
		},
		pushingdown: {
			speed: obj.framespeed,
			frames: [0]
		},
		pushingleft: {
			speed: obj.framespeed,
			frames: [0]
		}
	}
}
function objectIsAlive(th) {
	return trigo.getDistance(th,gbox.getCamera())<800;
}

function popDialogue(data) {
	serverDialogue.window.push(data);
}

function historyCorrection(th) {
	// after input has been received but before processing an update
	// 
	// discard out of date inputs based on maingame.lasttime
	if (maingame.replaying)
		return;
	
	

	while (maingame.inputs.length > 0 && maingame.inputs[0].seqID <= maingame.lastAck) {
		maingame.inputs.shift();
	}
	if (maingame.inputs.length == 0)
		return;

	if (!stateEquals(maingame.laststate, maingame.inputs[0].state)) {
		maingame.replaying = true;
		//maingame.inputs.shift();
		var savedInput = th.keys;

		// rewind to correction and replay moves

		
		stateSet(th, maingame.laststate);
		var i = 0;
		while (i < maingame.inputs.length) {
			th.keys = maingame.inputs[i].input;
			th.then();
			i++;
		}
		maingame.replaying = false;
		th.keys = savedInput;
	}
}
function stateSet(obj, comp) {
	obj.x = comp.x;
	obj.y = comp.y;
	obj.accx = comp.accx;
	obj.accy = comp.accy;
	obj.xpushing = comp.xpushing;
	obj.ypushing = comp.ypushing;
	obj.facing = comp.facing;
}
function stateEquals(obj, comp) {
	if (obj.x == comp.x && obj.y == comp.y
		&& obj.accx == comp.accx && obj.accy == comp.accy
		&& obj.xpushing == comp.xpushing && obj.ypushing == comp.ypushing
		&& obj.facing == comp.facing) {
		return true;
	} else {
		return false;
	}
}