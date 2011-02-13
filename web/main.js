/*!
 * javascript main run in the iframe
 *
 * * TODO make a class for main
 * * needed to clean up
 * * TODO to the clientAlive call periodically
 * * make a dox page
 * * TODO rewrite this code it is dirty
*/


/**
 * Iframe Main handle the behavior of the iframe
*/

/**
 * ctor/dtor
*/
var IframeMain	= function(){
	this.connectedRsc	= null;
	this.log		= IframeMain.log;
	this.parentWindowMessageCtor()
}
IframeMain.prototype.destroy	= function(){
}

/**
 * Log function for the class
*/
//IframeMain.log	= function(){}
IframeMain.log	= function(){ console.log.apply(console, arguments) }


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

IframeMain.prototype.channelCtor	= function(token, resource, clientId){
	console.log("create channel", token)
	var self	= this;
	var channel	= new goog.appengine.Channel(token);
	var socket	= channel.open();

	socket.onopen	= function(){
		self.log("channel connected resource", resource)
		self.connectedRsc	= resource;
		
		// send the clientId to the parent window
		var data	= {
			type	: "connected",
			data	: {
				clientId	: clientId
			}
		}
		self.parentWindowMessageSend(data);
	}
	socket.onclose	= function(){
		self.log("channel closed")
	}
	socket.onerror	= function(error){
		self.log("channel error", error)
	}
	socket.onmessage= function(message, opt_param){
		self.log("got message", message, opt_param)
		self.parentWindowMessageSend({
			type	: "data",
			data	: message.data
		});
	}
}

IframeMain.prototype.channelConnect	= function(resource){
	var self	= this;
	var clientId	= "ezChannel"+Math.floor(Math.random()*99999);		
	var callUrl	= "/createChannel"
				+ "?callback=?"
				+ "&resource="	+ encodeURIComponent(resource)
				+ "&clientId="	+ encodeURIComponent(clientId);
	this.log("callUrl", callUrl)
	jQuery.getJSON(callUrl, function(token){
		self.channelCtor(token, resource, clientId);
	});
}

	
/**
 * Send message to AppEngine REST API
*/
IframeMain.prototype.channelSend	= function(resource, message){
	var self	= this;
	var callUrl	= "/sendToResource"
				+ "?resource="	+ encodeURIComponent(resource)
				+ "&message="	+ encodeURIComponent(message);
	this.log("sendToResource callurl", callUrl)
	jQuery.post(callUrl, function(result){
		self.log("message sent")
	})
}




//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

IframeMain.prototype.parentWindowMessageCtor	= function(){
	var self	= this;
	window.addEventListener("message", function(event){
		// ignore the message received due to ChannelAPI itself
		if(event.origin == "http://talkgadget.google.com")	return;
		// log the event
		console.log("recevied message from caller", event)
		self.parentWindowMessageRecv(event);		
	}, false);		
}
IframeMain.prototype.parentWindowMessageDtor	= function(){
}


/**
 * notify the parent window
*/
IframeMain.prototype.parentWindowMessageSend	= function(data){
	console.log("iframe notify", data)
	window.parent.postMessage(JSON.stringify(data), "*");
}

/**
 * Handle message from the parent window
*/
IframeMain.prototype.parentWindowMessageRecv	= function(domEvent){
	// parse the event from the iframe
	var eventFull	= JSON.parse(domEvent.data);
	var eventType	= eventFull.type;
	var eventData	= eventFull.data;

	console.log("eventType", eventType, "eventData", eventData)
	if( eventType == "connect" ){
		this.channelConnect(eventData.resource)
	}else if( eventType == "data" ){
		this.channelSend(this.connectedRsc, eventData.message);
	}
}



jQuery(function(){
	if( true ){	// to disable all the logging
		console		= {}
		console.log	= function(){}
	}
	var iframeMain	= new IframeMain();
});

