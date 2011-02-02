# Easy Websocket

*like Websocket but no servers to setup and available in any browser*

Websocket Anywhere aims to make realtimes webapps in every browser without the trouble
to setup Websocket servers.

The API is copied on [Websocket standard API](http://dev.w3.org/html5/websockets/).

# How to use it

Just include the following in your webpage.

    <script src="https://github.com/jeromeetienne/EasyWebsocket/raw/master/static/easyWebSocket-min.js"></script>	
    <script>
        var socket = new EasyWebSocket("ws://example.com/resource");
        socket.onopen	= function(){
            socket.send("hello world.")
        }
        socket.onmessage= function(event){
            alert("received"+ event.data)
        }
    </script>

# Demo

I wrote a [chat demo](https://github.com/jeromeetienne/EasyWebsocket/raw/master/static/chat.html) over EasyWebSocket