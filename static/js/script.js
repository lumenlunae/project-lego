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
        data = data.replace("//", "/");
        var hasArgs = data.indexOf("/");
        if (hasArgs != -1) {
            var event = data.substr(0, hasArgs);
            var args = eval("("+data.substr(hasArgs+1)+")");
            eventMan.fire(event, [args]);
        } else {
            eventMan.fire(data);
        }
    });
});






















