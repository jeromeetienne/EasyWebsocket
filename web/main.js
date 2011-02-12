/*!
 * javascript main run in the iframe
 *
 * * TODO make a class for main
 * * needed to clean up
 * * TODO to the clientAlive call periodically
 * * make a dox page
 * * TODO rewrite this code it is dirty
*/

// TODO do i need jquery ??? why ?
jQuery(function(){
	if( true ){	// to disable all the logging
		console		= {}
		console.log	= function(){}
	}
	
	
	/**
	*/

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////

	var connectedRsc		= null;
	var channelCtor	= function(token, resource, clientId){
		console.log("create channel", token)
		var channel	= new goog.appengine.Channel(token);
		var socket	= channel.open();

		socket.onopen	= function(){
			console.log("channel connected resource", resource)
			connectedRsc	= resource;
			
			// send the clientId to the parent window
			var data	= {
				type	: "connected",
				data	: {
					clientId	: clientId
				}
			}
			parentWindowMessageSend(data);
		}
		socket.onclose	= function(){
			console.log("channel closed")
		}
		socket.onerror	= function(error){
			console.log("channel error", error)
		}
		socket.onmessage= function(message, opt_param){
			console.log("got message", message, opt_param)
			parentWindowMessageSend({
				type	: "data",
				data	: message.data
			});
		}
	}
	
	/**
	 * Send message to AppEngine REST API
	*/
	var channelSend	= function(resource, message){
		var callUrl	= "/sendToResource"
					+ "?resource="	+ encodeURIComponent(resource)
					+ "&message="	+ encodeURIComponent(message);
		console.log("sendToResource callurl", callUrl)
		jQuery.post(callUrl, function(result){
			console.log("message sent")
		})
	}

	var channelConnect	= function(resource){
		var clientId	= "ezChannel"+Math.floor(Math.random()*99999);		
		var callUrl	= "/createChannel"
					+ "?callback=?"
					+ "&resource="	+ encodeURIComponent(resource)
					+ "&clientId="	+ encodeURIComponent(clientId);
		console.log("callUrl", callUrl)
		jQuery.getJSON(callUrl, function(token){
			channelCtor(token, resource, clientId);
		});
	}

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////

	var parentWindowMessageCtor	= function(){	
		window.addEventListener("message", function(event){
			// ignore the message received due to ChannelAPI itself
			if(event.origin == "http://talkgadget.google.com")	return;
			// log the event
			console.log("recevied message from caller", event)
			parentWindowMessageRecv(event);		
		}, false);		
	}
	var parentWindowMessageDtor	= function(){
	}
	/**
	 * Handle message from the parent window
	*/
	var parentWindowMessageRecv	= function(domEvent){
		// parse the event from the iframe
		var eventFull	= JSON.parse(domEvent.data);
		var eventType	= eventFull.type;
		var eventData	= eventFull.data;

		console.log("eventType", eventType, "eventData", eventData)
		if( eventType == "connect" ){
			channelConnect(eventData.resource)
		}else if( eventType == "data" ){
			channelSend(connectedRsc, eventData.message);
		}
	}
	/**
	 * notify the parent window
	*/
	var parentWindowMessageSend	= function(data){
		console.log("iframe notify", data)
		window.parent.postMessage(JSON.stringify(data), "*");
	}
	
	
	parentWindowMessageCtor();
});