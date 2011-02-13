/**
 * like Websocket, but with no servers to setup
 *
 * * http://dev.w3.org/html5/websockets/ websocket specification
 * * TODO replace this.resource by this.url everywhere. this resource things
 *   is not suitable
*/

/**
 * Constructor
 *
 * @param url {string} the websocket url. the path part will be used as resource
 * @param protocol {string} this one is just ignored 
*/
EasyWebSocket	= function(url, protocols)
{
	var self		= this;
	// standard: readonly attribute DOMString url;
	this.url		= url;
	// create a dummy bufferedAmount property. it is in WebSocket Standard
	this.bufferedAmount	= 0;
	// create the readyState property
	this.readyState		= EasyWebSocket.CONNECTING;
	
	// extract resource from the url
	this.resource	= this.url;

	// define the class logging function
	this.log	= EasyWebSocket.logFunction;

	this.iframeOrigin	= EasyWebSocket.iframeOrigin;
	this.iframeUrl		= this.iframeOrigin + "/iframe/index.html";
	
	// TODO here there is an issue with domReady
	// - document.readyState == "complete"
	// - do i need it ? super unsure
	this._iframeCtor();
	
	// TODO put that in a loop
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

/**
 * Handle message from the child <iframe>
*/
EasyWebSocket.prototype._onWindowMessage	= function(domEvent)
{		
	// parse the event from the iframe
	var eventFull	= JSON.parse(domEvent.data);
	var eventType	= eventFull.type;
	var eventData	= eventFull.data;
	// log the event
	this.log("recevied message from iframe", eventFull)
	
	if( eventType == "connected" ){
		this.readyState	= EasyWebSocket.OPEN;
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
	this.readyState	= EasyWebSocket.CLOSING;
	this._iframeDtor();
	this.readyState	= EasyWebSocket.CLOSED;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////


/**
 * Build the iframe
*/
EasyWebSocket.prototype._iframeCtor		= function()
{
	var self	= this;
	this.iframeId	= "EasyWebSocket-iframe-"+Math.floor(Math.random()*99999);

	// ensure dom is ready for element creation
	//console.assert( document.readyState == "complete" );
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

/**
 * @returns {Boolean} true if the iframe exists, false otherwise
*/
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

/**
 * * TODO this should not be there ?
 *   * why not put this url in the iframe url ?
 *   * and iframe to parse its location.href on load ?
 * 
*/
EasyWebSocket.prototype._iframeSendConnect	= function()
{
	var data	= {
		type	: "connect",
		data	: {
			wsUrl	: this.resource
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
 *
 * - thoses values are part of the standard
*/
EasyWebSocket.CONNECTING	= 0;
EasyWebSocket.OPEN		= 1;
EasyWebSocket.CLOSING		= 2;
EasyWebSocket.CLOSED		= 3;

/**
 * Configuration
 * 
 * * Devel values
 *   * EasyWebSocket.iframeOrigin	= "http://localhost:8080";
 *   * EasyWebSocket.logFunction	= console.log.bind(console);
*/
EasyWebSocket.iframeOrigin	= "http://easywebsocket.appspot.com";
EasyWebSocket.logFunction	= function(){}



