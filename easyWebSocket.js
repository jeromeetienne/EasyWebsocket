/**
 * like Websocket, but with no servers to setup
 *
 * * http://dev.w3.org/html5/websockets/ websocket specification
*/

/**
 * Constructor
 *
 * @param url {string} the websocket url. the path part will be used as resource
 * @param protocol {string} this one is just ignored 
*/
EasyWebSocket	= function(url, protocols)
{
	var self	= this;
	// standard: readonly attribute DOMString url;
	this.url	= url;
	// extract resource from the url
	// - the domain part is ignored
	// - TODO i should take the whole url
	//this.resource	= this.url.match(/.*:\/\/[^/]*\/(.+)/)[1];
	this.resource	= this.url;

	// define the class logging function
	this.log	= EasyWebSocket.logFunction;

	this.iframeOrigin	= EasyWebSocket.iframeOrigin;
	this.iframeUrl		= this.iframeOrigin + "/web/iframe.html";
	this._iframeCtor();
	
		
	this.onopen		= function(){
		self.log("default onopen")
	}
	this.onmessage		= function(event){
		self.log("default onmessage")
	}
	this.onerror		= function(){
		self.log("default onerror")
	}
	this.onclose		= function(){
		self.log("default onclose")
	}

	// bind the "message" dom event
	// - TODO do i need to chain those handler ?
	window.addEventListener("message", function(domEvent){
		// if event is not from the iframe, return now
		if( domEvent.origin != self.iframeOrigin )	return;
		// notify the local handler		
		self._onWindowMessage(domEvent)
	}, false);
}

EasyWebSocket.prototype._onWindowMessage	= function(domEvent)
{		
	// parse the event from the iframe
	var eventFull	= JSON.parse(domEvent.data);
	var eventType	= eventFull.type;
	var eventData	= eventFull.data;
	// log the event
	this.log("recevied message from iframe", eventFull)
	
	if( eventType == "connected" ){
		this.onopen();
	}else if( eventType == "data" ){
		this.onmessage({ data : eventData });
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
EasyWebSocket.prototype.send	= function(data)
{
	this._iframeSendData(data);
}

/**
 * Close the connection
*/
EasyWebSocket.prototype.close	= function()
{
	this._iframeDtor();
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

EasyWebSocket.prototype._iframeCtor		= function()
{
	var self	= this;
	this.iframeId	= "EasyWebSocket-iframe-"+Math.floor(Math.random()*99999);

	// create the iframe element
	var iframe	= document.createElement('iframe');
	// the html page calling ChannelAPI MUST run he same site as channelAPI server
	// - seems to be a ChannelApi requirement
	// - this is the whole reason for the iframe stuff
	iframe.src	= this.iframeUrl;
	iframe.id	= this.iframeId;
	// make the iframe invisible
	iframe.style.position	= "absolute";
	iframe.style.visibility	= "hidden";
	iframe.style.top	= iframe.style.left = "0";
	iframe.style.width	= iframe.style.height = "0";
	// bind onload
	iframe.onload	= function(event){
		self.log("iframe loaded")
		self._iframeSendConnect()
	}
	// append the iframe to <body>
	var body	= document.getElementsByTagName('body')[0];
	body.appendChild(iframe);	
}

EasyWebSocket.prototype._iframeDtor		= function()
{
	var iframe	= document.getElementById(this.iframeId);
	iframe.parent.removeChild(iframe);
}

EasyWebSocket.prototype._iframeExist	= function()
{
	return this.iframeId;
}

EasyWebSocket.prototype._iframeSendRaw	= function(data)
{
	this.log("iframeSendRaw(",data,")")
	var iframeEl	= document.getElementById(this.iframeId).contentWindow;
	var targetOrigin= "*";	// TODO not sure about this
	iframeEl.postMessage(JSON.stringify(data), targetOrigin);
}

EasyWebSocket.prototype._iframeSendConnect	= function()
{
	var data	= {
		type	: "connect",
		data	: {
			resource	: this.resource
		}
	}
	this._iframeSendRaw(data);
}

EasyWebSocket.prototype._iframeSendData	= function(message)
{
	var data	= {
		type	: "data",
		data	: {
			message		: message
		}
	}
	this._iframeSendRaw(data);
}

/**
 * Possible values for .readyState
*/
EasyWebSocket.STATE	= {}
EasyWebSocket.STATE.CONNECTING	= 0;
EasyWebSocket.STATE.OPEN		= 1;
EasyWebSocket.STATE.CLOSING		= 2;
EasyWebSocket.STATE.CLOSED		= 3;


/**
 * Various constant
 * 
 * * Devel values
 *   * EasyWebSocket.iframeOrigin	= "http://localhost:8080";
 *   * EasyWebSocket.logFunction	= function(){ console.log.apply(console, arguments) }
*/
EasyWebSocket.iframeOrigin	= "http://easywebsocket.appspot.com";
EasyWebSocket.logFunction	= function(){}



