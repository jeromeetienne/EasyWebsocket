/*!
 * javascript main run in the iframe
 *
 * * make a dox page
*/

/**
 * Iframe Main handle the behavior of the iframe
*/

/**
 * ctor/dtor
*/
var IframeMain	= function(){
	/**
	 * the websocket URL used in this iframe
	 * 
	 * @type String
	*/
	this.wsUrl	= null;

	/**
	 * TODO what 
	*/
	this.clientId	= "ezChannel"+Math.floor(Math.random()*9999999).toString(36);
	
	/**
	 * period at which ping is called
	 * 
	 * @type Integer
	*/
	this.pingPeriod	= 1*1000;

	// init this object
	this.log		= IframeMain.log;
	// create the parentWindow and wait for message
	this.parentWindowMessageCtor()
}
IframeMain.prototype.destroy	= function(){
	this.pingDtor();
	this.parentWindowMessageDtor();
	this.channelDtor();
}

/**
 * Log function for the class
*/
IframeMain.log	= function(){}
//IframeMain.log	= console.log.bind(console);


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

IframeMain.prototype.channelCtor	= function(token){
	this.log("create channel", token)
	// create the socket
	var channel	= new goog.appengine.Channel(token);
	var socket	= channel.open();
	// binds callbacks
	socket.onopen	= this.channelOnOpen.bind(this);
	socket.onopen	= this.channelOnOpen.bind(this);
	socket.onclose	= this.channelOnClose.bind(this);
	socket.onerror	= this.channelOnError.bind(this);
	socket.onmessage= this.channelOnMessage.bind(this);
}
IframeMain.prototype.channelDtor	= function(){
	
}

IframeMain.prototype.channelOnOpen	= function(){
	this.log("channel connected wsUrl", this.wsUrl)
	// send the clientId to the parent window
	this.parentWindowMessageSend({
		type	: "connected",
		data	: {
			clientId	: self.clientId
		}
	});
}
IframeMain.prototype.channelOnClose	= function(){
	this.log("channel closed")
}
IframeMain.prototype.channelOnError	= function(error){
	this.log("channel error", error)
}
IframeMain.prototype.channelOnMessage	= function(message, opt_param){
	this.log("got message", message, opt_param)
	this.parentWindowMessageSend({
		type	: "data",
		data	: message.data
	});	
}

/**
 * Send a query to the server to create a channel and get its identifying token
*/
IframeMain.prototype.channelConnect	= function(){
	var self	= this;
	var callUrl	= "/createChannel"
				+ "?callback=?"
				+ "&wsUrl="	+ encodeURIComponent(this.wsUrl)
				+ "&clientId="	+ encodeURIComponent(this.clientId);
	this.log("callUrl", callUrl)
	jQuery.getJSON(callUrl, function(result){
		// update the ping period with the number recomended by the server
		self.pingPeriod	= result.clientAliveRefresh;
		console.log("clientAliveRefresh", result.clientAliveRefresh)
		// start creating the ctor
		self.channelCtor(result.token);
	});
}

/**
 * Send message to AppEngine REST API
*/
IframeMain.prototype.channelSend	= function(message){
	var self	= this;
	var callUrl	= "/sendToWebsocketUrl"
				+ "?wsUrl="	+ encodeURIComponent(this.wsUrl)
				+ "&message="	+ encodeURIComponent(message);
	this.log("sendToWebsocketUrl callurl", callUrl)
	jQuery.post(callUrl, function(result){
		self.log("message sent ", message)
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
		self.log("recevied message from caller", event)
		self.parentWindowMessageRecv(event);		
	}, false);		
}
IframeMain.prototype.parentWindowMessageDtor	= function(){
}


/**
 * notify the parent window
*/
IframeMain.prototype.parentWindowMessageSend	= function(data){
	this.log("iframe notify", data)
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

	this.log("eventType", eventType, "eventData", eventData)
	if( eventType == "connect" ){
		// set the wsUrl for this iframe
		this.wsUrl	= eventData.wsUrl;
		this.channelConnect(eventData.wsUrl)
		this.pingCtor();
	}else if( eventType == "data" ){
		this.channelSend(eventData.message);
	}
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

IframeMain.prototype.pingCtor	= function(){
	this.pingTimeoutId	= setTimeout(this.pingCallback.bind(this), this.pingPeriod);
}

IframeMain.prototype.pingDtor	= function(){
	if( !this.pingTimeoutId )	return;
	clearInterval(this.pingTimeoutId);
	this.pingTimeoutId	= null;
}

IframeMain.prototype.pingCallback	= function(){
	var self	= this;
	var callUrl	= "/clientAlive"
				+ "?clientId="	+ encodeURIComponent(this.clientId);
	this.log("callUrl", callUrl)
	jQuery.post(callUrl, function(){
		self.log("ping sent at", new Date())
	});
	// relaunch the timer
	this.pingTimeoutId	= setTimeout(this.pingCallback.bind(this), this.pingPeriod);
}


jQuery(function(){
	IframeMain.log	= console.log.bind(console);
	var iframeMain	= new IframeMain();
});

