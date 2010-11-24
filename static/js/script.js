/* Author: 

*/

$(document).ready(function() {   
   
	socket = new io.Socket(null, {
		port: 3001
	});
	socket.connect();
    
	$('#sender').bind('click', function() {
		socket.send("Message Sent on " + new Date());
	});
   
	socket.on('message', function(data){
		$('#receiver').append('<li>' + data + '</li>');
	});
});






















