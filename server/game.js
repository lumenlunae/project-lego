// Game Methods ----------------------------------------------------------------
// -----------------------------------------------------------------------------
var maps = require("mapmodel");
var fs = require('fs');
var Game = MMO.Game();
Game.onInit = function() {
    // load worlds here
    // for now, loading all worlds into
    // memory based on whatever is in
    // a certain directory.
    var that = this;
    fs.readdir(that.mapsDir, function(err, files) {
        if (err) throw err;
        for (var file in files) {
            fs.readFile(that.mapsDir + "/" + files[file], "utf-8", function (err, data) {
                if (err) throw err;
                var map = eval(data);
                console.log(map.name);
            });
        }
    });
    this.a = new maps.MapModel();
    this.b = new maps.MapModel();
    this.a.area = "Town";
    this.b.area = "Cave";
    console.log(this.a);
    console.log(this.b);
};
// Mainloop --------------------------------------------------------------------
// -----------------------------------------------------------------------------
Game.onUpdate = function() {
    console.log("game update");
};