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
WebsocketAnywhere	= function(url, protocols)
{
	var self	= this;
	// TODO not sure what to do with url
	// - the url is in fact the destination

	// standard: readonly attribute DOMString url;
	this.url	= url;
	// extract resource from the url
	// - the domain part is ignored
	this.resource	= this.url.match(/.*:\/\/[^/]*\/(.+)/)[1];

	if( true ){	// for devel
		this.iframeOrigin	= "http://localhost:8080";
	}else{		// for prod
		this.iframeOrigin	= "http://websocketanywhere.appspot.com";
	}
	this.iframeUrl	= this.iframeOrigin + "/static/iframe.html";
	this._iframeCtor();
	
		
	this.onopen		= function(){
		console.log("default onopen")
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
		// if event is not from the iframe, return now
		if( domEvent.origin != self.iframeOrigin )	return;
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
	console.log("recevied message from iframe", eventFull)
	
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
WebsocketAnywhere.prototype.send	= function(data)
{
	this._iframeSendData(data);
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

WebsocketAnywhere.prototype._iframeCtor		= function()
{
	var self	= this;
	this.iframeId	= "WebsocketAnywhere-iframe-"+Math.floor(Math.random()*99999);

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
		console.log("iframe loaded")
		self._iframeSendConnect()
	}
	// append the iframe to <body>
	var body	= document.getElementsByTagName('body')[0];
	body.appendChild(iframe);	
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

WebsocketAnywhere.prototype._iframeSendRaw	= function(data)
{
	console.log("iframeSendRaw(",data,")")
	var iframeEl	= document.getElementById(this.iframeId).contentWindow;
	var targetOrigin= "*";	// TODO not sure about this
	iframeEl.postMessage(JSON.stringify(data), targetOrigin);
}

WebsocketAnywhere.prototype._iframeSendConnect	= function()
{
	var data	= {
		type	: "connect",
		data	: {
			resource	: this.resource
		}
	}
	this._iframeSendRaw(data);
}

WebsocketAnywhere.prototype._iframeSendData	= function(message)
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
WebsocketAnywhere.STATE	= {}
WebsocketAnywhere.STATE.CONNECTING	= 0;
WebsocketAnywhere.STATE.OPEN		= 1;
WebsocketAnywhere.STATE.CLOSING		= 2;
WebsocketAnywhere.STATE.CLOSED		= 3;
