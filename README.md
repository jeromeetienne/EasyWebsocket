see the [homepage](http://easywebsocket.org)

# Easy WebSocket

*like WebSocket but no server setup and available in any browser*

EasyWebSocket aims to make realtimes webapps in every browser without the trouble
to setup Websocket servers.


# How to use it

Include the following in your webpage and it just works. 

    <script src="http://EasyWebsocket.org/easyWebSocket.min.js"></script>	
    <script>
        var socket = new EasyWebSocket("ws://example.com/resource");
        socket.onopen	= function(){
            socket.send("hello world.")
        }
        socket.onmessage= function(event){
            alert("received"+ event.data)
        }
    </script>
    
*Step 1*: You connect the socket to a given url

*Step 2*: What you send() thru this socket is sent to all sockets connected the same url

See this code [live](http://easywebsocket.org/example/example.html). No server
setup, no cross-origin issue to care about... It is that easy! 
