({
	name: "Dungeon",
	id: "1",
	tileset: "tiles",
	addTiles:[
	{
		id:"tiles",
		image:"tiles",
		tileh:16,
		tilew:16,
		tilerow:16,
		gapx:0,
		gapy:0
	},
	{
		id:"player",
		image: "sprites",
		tileh: 16,
		tilew: 16,
		tilerow: 1,
		gapx: 0,
		gapy: 0
	},
	{
		id:"traveler",
		image: "sprites",
		tileh: 16,
		tilew: 16,
		tilerow: 1,
		gapx: 0,
		gapy: 32
	},
	{
		id:"swordhit",
		image: "sprites",
		tileh: 16,
		tilew: 16,
		tilerow: 2,
		gapx: 112,
		gapy: 640
	},
	{
		id: "shadows",
		image: "sprites",
		tileh: 16,
		tilew: 16,
		tilerow: 1,
		gapx: 0,
		gapy: 448
	},
	{
		id: "bullet-black",
		image: "sprites",
		tileh: 16,
		tilew: 16,
		tilerow: 3,
		gapx: 0,
		gapy: 624
	},
	{
		id: "flame-blue",
		image: "sprites",
		tileh: 16,
		tilew: 16,
		tilerow: 2,
		gapx: 176,
		gapy: 592
	},
	{
		id: "skel1",
		image: "sprites",
		tileh: 16,
		tilew: 16,
		tilerow: 1,
		gapx: 0,
		gapy: 144
	},
	{
		id: "cloud-black",
		image: "sprites",
		tileh: 16,
		tilew: 16,
		tilerow: 3,
		gapx: 208,
		gapy: 592
	}
	],
	onInit: function() {
		//maingame.addPlayer(30,25);

		this.addMap(this.map_below, "background", "below");
		this.addMap(this.map_middle, "foreground", "middle");
		this.addMap(this.map_above, "above", "above");
		this.addNpc({tx: 25, ty:24},[0],"traveler", null, [4,5]);
		this.addEnemy(null, "monster", {tx:23, ty:26}, true);
	},
	onUpdate: function() {


	},
	setObject:[
	{
		object:"dialogues",
		property:"traveler",
		value:{
			font:"small",
			skipkey:"a",
			esckey:"b",
			who:{
				noone: {
					x: 10,
					y: 170,
					box: {
						x:0,
						y: 160,
						w:320,
						h:60,
						alpha: 0.5
					}
				}
			},
		scenes:[
		{
			speed:1,
			who:"noone",
			audio:"beep",
			talk:["Test test!", "Some more test test!"]
		},

		{
			speed:1,
			who:"noone",
			audio:"beep",
			talk:["AAAAAH!!", "BOOO BOOOO!!"]
		}
		]
	}
},
{
	object: "tilemaps",
	property:"map",
	value: {
		id: "bundle-map-area1"
	}
},
{
	object:"tilemaps",
	property:"map_below",
	value:{
		tileset:"tiles",
		map:[[224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224],
		[224,224,36,32,32,32,33,32,32,35,32,32,32,32,33,32,32,32,35,32,32,32,32,33,32,32,32,32,32,32,33,32,32,32,36,224,224,224,224,224],
		[224,224,36,38,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,38,37,36,224,224,224,224,224],
		[224,224,36,37,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,37,37,36,224,224,224,224,224],
		[224,224,36,37,36,32,32,32,32,32,32,32,32,32,32,32,32,32,36,36,36,36,36,36,36,36,36,36,36,36,36,36,37,37,36,224,224,224,224,224],
		[224,224,36,37,36,224,224,224,224,224,224,224,224,224,224,224,224,224,36,32,32,32,32,33,32,32,32,35,32,32,33,32,37,37,36,224,224,224,224,224],
		[224,224,36,37,36,224,224,224,224,224,224,224,224,224,224,224,224,224,36,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,36,224,224,224,224,224],
		[224,224,36,37,36,224,224,224,224,224,224,224,224,224,224,224,224,224,36,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,36,224,224,224,224,224],
		[224,224,36,37,36,224,224,224,224,224,224,224,224,224,224,224,224,224,36,37,37,36,36,36,36,36,36,36,36,36,36,36,36,36,36,224,224,224,224,224],
		[224,36,33,37,33,36,224,224,36,32,32,33,32,32,32,32,33,32,32,37,37,32,32,35,32,32,32,32,32,33,32,32,32,32,32,32,35,32,36,224],
		[224,36,37,37,37,36,224,224,36,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,38,37,37,37,37,37,37,37,37,37,37,36,224],
		[224,36,37,37,37,36,224,224,36,37,37,37,37,38,37,37,37,37,37,37,37,37,37,37,37,37,38,37,37,37,37,37,37,37,38,37,37,37,36,224],
		[224,36,37,37,37,36,224,224,36,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,36,224],
		[224,36,38,37,37,36,224,224,36,37,37,37,37,37,37,37,37,37,37,38,37,37,37,37,37,36,36,36,36,36,36,36,36,36,36,36,37,37,36,224],
		[224,36,37,37,37,36,224,224,36,37,37,38,37,37,37,37,37,37,37,37,37,37,37,37,37,36,32,32,32,32,32,35,32,32,32,36,37,37,36,224],
		[224,36,37,37,37,36,224,224,36,37,37,37,37,37,37,38,37,37,37,37,37,37,37,37,37,36,224,224,224,224,224,224,224,224,224,36,37,37,36,224],
		[224,36,37,37,38,36,224,224,36,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,36,224,224,36,32,32,32,33,32,32,32,37,37,36,224],
		[224,36,37,37,37,36,224,224,36,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,36,224,224,36,37,37,37,37,37,37,37,37,37,36,224],
		[224,36,37,37,37,36,224,224,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,224,224,36,37,38,37,37,37,37,37,37,37,36,224],
		[224,36,37,37,37,36,224,224,32,32,32,32,32,32,32,32,32,32,32,32,32,32,35,32,32,32,224,224,36,37,37,37,37,37,37,37,37,37,36,224],
		[224,36,37,37,37,36,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,36,36,36,36,36,36,36,36,36,36,36,224],
		[224,36,38,37,37,36,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,32,32,32,32,32,32,32,32,35,32,32,224],
		[224,36,37,37,37,36,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224],
		[224,36,36,37,36,36,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,36,32,32,32,32,33,32,32,35,32,32,36,224,224,224,224,224],
		[224,35,36,37,36,32,224,224,224,224,224,224,224,224,224,36,32,32,32,32,33,32,32,32,37,37,37,37,37,37,37,37,37,37,36,224,224,224,224,224],
		[224,224,36,37,36,224,224,224,224,36,32,32,33,32,32,32,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,38,37,37,36,224,224,224,224,224],
		[224,224,36,37,32,35,33,32,32,32,38,37,37,37,37,37,37,37,37,37,37,37,38,37,37,37,37,37,37,37,37,37,37,37,36,224,224,224,224,224],
		[224,224,36,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,36,224,224,224,224,224],
		[224,224,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,224,224,224,224,224],
		[224,224,32,32,32,32,32,32,32,32,35,32,32,32,32,32,32,32,32,35,32,32,32,32,32,32,32,32,35,32,32,32,32,32,32,224,224,224,224,224]],
		tileIsSolid:function(obj,t) {
			return (t == 224 || t == 32)
		}
	}
},
{
	object:"tilemaps",
	property:"map_middle",
	value:{
		tileset:"tiles",
		map:[[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,423,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,324,327,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,418,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,340,343,-1,-1,-1,416,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,416,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,423,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,324,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,140,-1,-1,-1,340,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,330,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]] ,
		tileIsSolid:function(obj,t) {
			return (t > -1);
		}
	}
},
{
	object:"tilemaps",
	property:"map_above",
	value:{
		tileset:"tiles",
		map:[[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]] ,
		tileIsSolid:function(obj,t) {
			return (t == -3);
		}
	}
}
]
})