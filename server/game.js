// Game Methods ----------------------------------------------------------------
// -----------------------------------------------------------------------------
var Script = process.binding('evals').Script,
maps = require("mapmodel"),
fs = require('fs'),
Game = MMO.Game();

Game.onInit = function() {
	// load worlds here
	// for now, loading all worlds into
	// memory based on whatever is in
	// a certain directory.
	var that = this;
	// load Akihabara helper scripts
	var aki = {
		trigo: null,
		toys: null,
		help: null,
		gbox: null
	};
	/*
	var gbox = fs.readFileSync('./static/akihabara/gbox.js', 'utf-8');
	Script.runInNewContext(gbox, aki,'./static/akihabara/gbox.js');
	var trigo = fs.readFileSync('./static/akihabara/trigo.js', 'utf-8');
	Script.runInNewContext(trigo, aki,'./static/akihabara/trigo.js');
	var toys = fs.readFileSync('./static/akihabara/toys.js', 'utf-8');
	Script.runInNewContext(toys, aki, './static/akihabara/toys.js');
	var help = fs.readFileSync('./static/akihabara/help.js', 'utf-8');
	Script.runInNewContext(help, aki,'./static/akihabara/help.js');
	*/
	
	var files = fs.readdirSync(that.mapsDir);
	for (var file in files) {
		var data = fs.readFileSync(that.mapsDir + "/" + files[file], "utf-8");
		var area = eval(data);
		that.maps[area.id] = maps.MapModel(area, aki);
		that.$.clients[area.id] = {};
	}
};
// Mainloop --------------------------------------------------------------------
// -----------------------------------------------------------------------------
Game.onUpdate = function() {
	//console.log("game update");
	for (var i in this.maps) {
		this.maps[i].onUpdate();
	}
};