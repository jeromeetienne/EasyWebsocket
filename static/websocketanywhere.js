/**
 * like Websocket API, but with no servers to setup
 *
 * * http://dev.w3.org/html5/websockets/ websocket specification
*/

/**
 * Constructor
*/
WebsocketAnywhere	= function(url, protocols)
{
	var self	= this;
	// TODO not sure what to do with url
	// - the url is in fact the destination
	// - so will contain the clientId
	
	// even less with protocols


	// example of uri "ws://84.38.67.247:8080/dev/websocket/server.php"

	// standard: readonly attribute DOMString url;
	this.url		= url;

	this.clientIdLocal	= null;
	this.destClientId	= "superDestClientId";	// TODO to extract from the uri

	this._iframeCtor();
	
	
	this.onopen		= function(){
		console.log("default on open")
	}
	this.onmessage		= function(event){
		console.log("default onmessage")
	}
	this.onerror		= function(){
		console.log("default onerror")
	}
	this.onclose		= function(){
		console.log("default onclose")
	}

	// bind the "message" dom event
	// - TODO do i need to chain those handler ?
	window.addEventListener("message", function(domEvent){
		var iframeOrigin	= "http://localhost:8080";
		// if event is not from the iframe, return now
		if( domEvent.origin != iframeOrigin )	return;
		// notify the local handler		
		self._onWindowMessage(domEvent)
	}, false);
}

WebsocketAnywhere.prototype._onWindowMessage	= function(domEvent)
{		
	// parse the event from the iframe
	var eventFull	= JSON.parse(domEvent.data);
	var eventType	= eventFull.type;
	var eventData	= eventFull.data;
	// log the event
	//console.log("recevied message from iframe", eventFull)
	
	if( eventType == "connected" ){
		this.clientIdLocal	= eventData.clientId;
		//console.log("clientIdLocal", this.clientIdLocal);
		
		// TODO call this.onopen() to notify the user
		this.onopen();
	}
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * transmits data using the connection.
 * 
 * @param data {string} the data to send
*/
WebsocketAnywhere.prototype.send	= function(data)
{
	this._iframeSendMessage(this.destClientId, data);
}

/**
 * Close the connection
*/
WebsocketAnywhere.prototype.close	= function()
{
	this._iframeDtor();
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

WebsocketAnywhere.prototype._isConnected	= function()
{
	return this.clientIdLocal && this.iframeIdExist();
}


WebsocketAnywhere.prototype._iframeCtor		= function()
{
	this.iframeId	= "WebsocketAnywhere-iframe-"+Math.floor(Math.random()*99999);

	// create the iframe element
	var iframe	= document.createElement('iframe');
	iframe.src	= "/static/iframe.html";
	// the html page calling ChannelAPI MUST run he same site as channelAPI server
	// - seems to be a ChannelApi requirement
	// - this is the whole reason for the iframe stuff
	iframe.src	= "http://localhost:8080/static/iframe.html";
	iframe.id	= this.iframeId;
	// append the iframe to <body>
	var body	= document.getElementsByTagName('body')[0];
	body.appendChild(iframe)
}

WebsocketAnywhere.prototype._iframeDtor		= function()
{
	var iframe	= document.getElementById(this.iframeId);
	iframe.parent.removeChild(iframe);
}

WebsocketAnywhere.prototype._iframeExist	= function()
{
	return this.iframeId;
}

WebsocketAnywhere.prototype._iframeSendMessage	= function(clientId, message)
{
	console.log("iframeSendMessage(",clientId,",",message,")")
	var data	= {
		type	: "data",
		data	: {
			destClientId	: clientId,
			message		: message
		}
	}
	var iframeEl	= document.getElementById(this.iframeId).contentWindow;
	var targetOrigin= "*";	// TODO not sure about this
	iframeEl.postMessage(JSON.stringify(data), targetOrigin);
}

/**
 * Possible values for .readyState
*/
WebsocketAnywhere.STATE	= {}
WebsocketAnywhere.STATE.CONNECTING	= 0;
WebsocketAnywhere.STATE.OPEN		= 1;
WebsocketAnywhere.STATE.CLOSING		= 2;
WebsocketAnywhere.STATE.CLOSED		= 3;
