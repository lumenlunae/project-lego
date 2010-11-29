$(document).ready(function() {
   eventMan = new manager.EventMan();

   eventMan.on("g_enemyDied", function() {
       socket.send("g_enemyDied");
   });
   eventMan.on("s_broadcast", function(data) {
       console.log(data);
       popDialogue(data);
   });
   eventMan.on("s_enemySpawn", function() {
       maingame.addEnemy(null, "monster", 23, 26, true);
       maingame.addEnemy(null, "monster", 23, 26, true);
   });

});

this.manager = {

    };

(function() {
    var EventMan = manager.EventMan = function(options)  {
        help.mergeWithModel(options, {

            });
        this._events = {};
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
})();