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
	// pick a random clientId (should be )
	this._clientId		= "clientid-sio-"+this.url+"-"+Math.floor(Math.random()*999999).toString(36)

	// define the class logging function
	this.log		= EasyWebSocket.logFunction;
	
	// init default binding
	["onopen", "onmessage", "onerror", "onclode"].forEach(function(method){
		self[method]	= function(){
			self.log("default "+method+" method")
		}
	})
	// create socket.io client	
	this._sioCtor();
}


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

EasyWebSocket.prototype._sioCtor	= function()
{
	var serverUrl	= this.parseUri(EasyWebSocket.serverUrl);
	var listenHost	= serverUrl.host;
	var listenPort	= parseInt(serverUrl.port);
	this._sockio	= new io.Socket(listenHost, {port: listenPort, rememberTransport: false});
	this._sockio.connect();
	this._sockio.on('connect', function(){
		console.log("socket connected", this._sockio, this._clientId)
		// send the connect message
		this._sockio.send({
			type	: "connect",
			data	: {
				wsUrl	: this.url,
				clientId: this._clientId
			}
		});
		// update readyState
		this.readyState		= EasyWebSocket.CONNECTED;
		// notify the caller
		this.onopen();		
	}.bind(this)) 
	this._sockio.on('connect_failed', function(){
		this.onerror()	// TODO is there an event attached to that
	}.bind(this)) 
	this._sockio.on('message', function(message){
		console.log("received message", message);
		// notify the received message
		this.onmessage({data: message})
	}.bind(this)) 
	this._sockio.on('disconnect', function(){
		console.log("socket disconnected")
		this.onclose()	// TODO is there an event attached to that
	}.bind(this))
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
	this._sockio.send({
		type	: "message",
		data	: {
			clientId: this._clientId,
			message	: data
		}
	});
}

/**
 * Close the connection
*/
EasyWebSocket.prototype.close	= function()
{
	this._sockio.disconnect();
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
EasyWebSocket.serverUrl		= "http://88.191.76.230:8667"; 	// TODO change this to be tunable and work on nodester
EasyWebSocket.logFunction	= function(){}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

EasyWebSocket.prototype.parseUri	= function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

EasyWebSocket.prototype.parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};





