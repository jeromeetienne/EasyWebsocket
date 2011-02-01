jQuery(function(){
	var createChannel	= function(token){
		console.log("create channel", token)
		var channel	= new goog.appengine.Channel(token);
		var socket	= channel.open();
		return socket;
	}
	var sendChannel	= function(clientId, message){
		var callUrl	= "/send"
					+ "?clientId="	+ encodeURIComponent(clientId)
					+ "&message="	+ encodeURIComponent(message);
		console.log("sendMessage callurl", callUrl)
		jQuery.post(callUrl, function(result){
			console.log("message sent")
		})
	}
	window.addEventListener("message", function(event){
		console.log("recevied message from upper window", event.origin)
		console.dir(event)
		// ignore the message received due to ChannelAPI itself
		//if(event.origin == "http://talkgadget.google.com")	return;
	}, false);
	
	var getToken	= function(){
		var clientId	= "ezChannel"+Math.floor(Math.random()*99999);
		var callUrl	= "/create"
					+ "?callback=?"
					+ "&clientId="	+ encodeURIComponent(clientId);
		jQuery.getJSON(callUrl, function(token){
			var socket	= createChannel(token);
			socket.onopen	= function(){
				console.log("channel connected")
				
				// send the clientId to the parent window
				var data	= {
					type		: "connected",
					clientId	: clientId
				}
				window.parent.postMessage(JSON.stringify(data), "*");

				sendChannel(clientId, "prout");
			}
			socket.onclose	= function(){
				console.log("channel closed")
			}
			socket.onerror	= function(error){
				console.log("channel error", error)
			}
			socket.onmessage= function(path, opt_param){
				console.log("got message", path, opt_param)
			}
		});
	}
	
	getToken();
});