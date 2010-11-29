(function () {
	toys.topview.e = {
		setFrame: function(th, facing) {
			var pref="stand";
			if (th.xpushing||th.ypushing)
				if (th.haspushing&&(th.toucheddown||th.touchedup||th.touchedleft||th.touchedright)) pref="pushing"; else pref="moving";
			if (th.flipside)
				th.fliph=(facing?th.facing==facing:th.facing==toys.FACE_RIGHT);
			th.frame=help.decideFrame(th.counter,th.frames[pref+toys.FACES[th.facing]]);
		},
		callWhenColliding: function (th, group, call) {
			for (var i in gbox._objects[group]) {
				if ((!gbox._objects[group][i].initialize) && toys.topview.collides(th, gbox._objects[group][i])) {
					if (gbox._objects[group][i][call]) {
						gbox._objects[group][i][call](th);
						return i;
					}
				}
			}
			return false;
		},
		handleAccelerations: function (th) {
			if (!th.xpushing) th.accx = help.goToZero(th.accx);
			if (!th.ypushing) th.accy = help.goToZero(th.accy);
		},
		objectwallCollision: function (th, data) {
			// Similar to spritewall collision except for the following:
			// 1. Objects in the same group can collide with each other
			// 2. Calls a collision method on both objects
			var wl;
			var collide = false;
			for (var i in gbox._objects[data.group])
				// added i != th.id so you can check collisions in same group
				if ((!gbox._objects[data.group][i].initialize) && i != th.id && toys.topview.collides(th, gbox._objects[data.group][i])) {
					wl = gbox._objects[data.group][i];
					if (th.ypushing == toys.PUSH_UP || th.pastaccy < 0) {
						th.touchedup = true;
						collide = true;
						if (!wl.pushable) {
							th.accy = 0;
							th.y = wl.y + wl.coly + wl.colh - th.coly;
						} else {
							th.y = wl.y + wl.coly + wl.colh - th.coly;
							if (wl.pushacc < th.maxacc)
								th.accy = help.limit(th.accy, -wl.pushacc, wl.pushacc);
							wl.accy = help.goToZero(th.accy);
							wl.accy = th.accy;
							wl.toucheddown = true;
						}

					} else if (th.ypushing == toys.PUSH_DOWN || th.pastaccy > 0) {
						th.toucheddown = true;
						collide = true;
						if (!wl.pushable) {
							th.accy = 0;
							th.y = wl.y + wl.coly - th.colh - th.coly;
						} else {
							th.y = wl.y + wl.coly - th.colh - th.coly;
							if (wl.pushacc < th.maxacc)
								th.accy = help.limit(th.accy, -wl.pushacc, wl.pushacc);
							wl.accy = help.goToZero(th.accy);
							wl.accy = th.accy;
							wl.touchedup = true;
						}

					}
					if (th.xpushing == toys.PUSH_LEFT || th.pastaccx < 0) {
						th.touchedleft = true;
						collide = true;
						if (!wl.pushable) {
							th.accx = 0;
							th.x = wl.x + wl.colx + wl.colw - th.colx;
						} else {
							th.x = wl.x + wl.colx + wl.colw - th.colx;
							if (wl.pushacc < th.maxacc)
								th.accx = help.limit(th.accx, -wl.pushacc, wl.pushacc);
							wl.accx = help.goToZero(th.accx);
							wl.accx = th.accx;
							wl.touchedright = true;
						}

					// right-most x, middle y
					} else if (th.xpushing == toys.PUSH_RIGHT || th.pastaccx > 0) {
						th.touchedright = true;
						collide = true;
						if (!wl.pushable) {
							th.accx = 0;
							th.x = wl.x + wl.colx - th.colw - th.colx;
						} else {
							th.x = wl.x + wl.colx - th.colw - th.colx;
							if (wl.pushacc < th.maxacc)
								th.accx = help.limit(th.accx, -wl.pushacc, wl.pushacc);
							wl.accx = help.goToZero(th.accx);
							wl.accx = th.accx;
							wl.touchedleft = true;
						}

					}

					if (collide) {
						if (data.objcall) {
							if (wl[data.objcall]) {
								wl[data.objcall](th);
							}
						}
						if (data.selfcall) {
							if (th[data.selfcall]) {
								th[data.selfcall](wl);
							}
						}
					} else {
				// corner pixel hit
				}
				}

		},
		fireBullet: function (gr, id, data) {

			var ts = gbox.getTiles(data.tileset);

			var obj = gbox.addObject(
				help.mergeWithModel(
					data, {
						_bullet: true,
						zindex: 0,
						fliph: false,
						flipv: false,
						id: id,
						group: gr,
						cnt: 0,
						tileset: "",
						frames: {},
						acc: 0,
						angle: 0,
						camera: data.from.camera,
						accx: (data.accx == null ? Math.floor(trigo.translateX(0, data.angle, data.acc)) : 0),
						accy: (data.accy == null ? Math.floor(trigo.translateY(0, data.angle, data.acc)) : 0),
						accz: 0,
						x: (data.sidex == toys.FACE_LEFT ? data.from.x - ts.tilehw : (data.sidex == toys.FACE_RIGHT ? data.from.x + data.from.w - ts.tilehw : data.from.x + data.from.hw - ts.tilehw)) + (data.gapx ? data.gapx : 0),
						y: (data.sidey == toys.FACE_UP ? data.from.y - ts.tilehh : (data.sidey == toys.FACE_DOWN ? data.from.y + data.from.h - ts.tilehh : data.from.y + data.from.hh - ts.tilehh)) + (data.gapy ? data.gapy : 0),
						z: (data.from.z == null ? 0 : data.from.z),
						collidegroup: "",
						spark: toys.NOOP,
						power: 1,
						lifetime: null,
						tilemap: null,
						defaulttile: 0,
						applyzgravity: false,
						map: null,
						defaulttile: 0,
						mapindex: "",
						spritewalls: null,
						colx: (data.fullhit ? 0 : null),
						coly: (data.fullhit ? 0 : null),
						colh: (data.fullhit ? ts.tileh : null),
						colw: (data.fullhit ? ts.tilew : null),
						duration: null,
						onWallHit: function () {
							this.spark(this);
							gbox.trashObject(this);
						},
						bulletIsAlive: function () {
							return gbox.objectIsVisible(this);
						}
					}
					)
				);

			var self = obj;
			obj.initialize = function () {
				toys.topview.initialize(self);
			};

			obj[(data.logicon == null ? "first" : data.logicon)] = function () {
				self.cnt = (self.cnt + 1) % 10;

				if (self.applyzgravity) toys.topview.handleGravity(self); // z-gravity
				toys.topview.applyForces(self); // Apply forces
				if (self.applyzgravity) toys.topview.applyGravity(self); // z-gravity
				if (self.map != null) toys.topview.tileCollision(self, self.map, self.mapindex, self.defaulttile); // tile collisions
				if (self.spritewalls != null) toys.topview.spritewallCollision(self, {
					group: self.spritewalls
				}); // walls collisions
				if (self.applyzgravity) toys.topview.floorCollision(self); // Collision with the floor (for z-gravity)
				toys.topview.adjustZindex(self);
				if (self.duration != null) {
					self.duration--;
					if (self.duration == 0) gbox.trashObject(self);
				}
				if (!self.bulletIsAlive()) gbox.trashObject(self);
				else if (self.toucheddown || self.touchedup || self.touchedleft || self.touchedright) self.onWallHit();
				else if (self.collidegroup != null)
					for (var i in gbox._objects[self.collidegroup])
						if ((!gbox._objects[self.collidegroup][i].initialize) && toys.topview.collides(self, gbox._objects[self.collidegroup][i], gbox._objects[self.collidegroup][i].tolerance)) {
							if (gbox._objects[self.collidegroup][i]["hitByBullet"] != null)
								if (!gbox._objects[self.collidegroup][i].hitByBullet(self)) {
									self.spark(self);
									gbox.trashObject(self);
								}
						}
			}

			obj[(data.bliton == null ? "blit" : data.bliton)] = function () {
				if (!gbox.objectIsTrash(self))
					gbox.blitTile(gbox.getBufferContext(), {
						tileset: self.tileset,
						tile: help.decideFrame(self.cnt, self.frames),
						dx: self.x,
						dy: self.y + self.z,
						camera: self.camera,
						fliph: self.fliph,
						flipv: self.flipv
					});
			}

			gbox.setZindex(obj, obj.y + obj.h);

			return obj;

		}
	};
})();
