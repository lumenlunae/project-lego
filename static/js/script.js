/* Author: 

*/

$(document).ready(function() {   
   
	socket = new io.Socket(null, {
		port: 3001,
		rememberTransport: false
	});
	socket.connect();
    
	$('#sender').bind('click', function() {
		socket.send("Message Sent on " + new Date());
	});
	socket.on("connect", function(data) {
		console.log((new Date).getTime());
		});
	socket.on('message', function(msg){
		msg = BISON.decode(msg);
		var event = msg.event;
		var data = msg.data;
		var time = (new Date()).getTime();
		maingame.queueMessage(msg);
		//eventMan.fire(event, [data]);
	});

	socket.on("disconnect", function(data) {
		console.log("really?");
	});
});






















