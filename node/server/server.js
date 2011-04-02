#!/usr/bin/env node

// MUST matches nodester one
var listenPort	= 8689;

// start http server
var httpSrv	= require('http').createServer(function(request, response){
});
// server start listening
if( module === require.main){
	httpSrv.listen(listenPort);
}else{
	// this one is needed for cluster.js
	module.exports	= httpSrv;	
}

console.log("listen on port "+listenPort);


var ewsClients	= {};
var wsUrls	= {};

// socket.io
var socketioSrv	= require('socket.io').listen(httpSrv); 
socketioSrv.on('connection', function(client){
	console.log("recevied a connection from clientId", client.sessionId);
	// new client is here! 
	client.on('message', function(message){
		var onConnect	= function(eventData){
			console.log("onConnect", eventData);
			var clientId	= eventData.clientId;
			var wsUrl	= eventData.wsUrl;
			var ewsClient	= ewsClients[clientId]	= {
				clientId	: clientId,
				wsUrl		: wsUrl,
				sioClient	: client
			};
			wsUrls[wsUrl]	= wsUrls[wsUrl] || [];
			wsUrls[wsUrl].push(ewsClient);
		};
		var onMessage	= function(eventData){		
			console.log("onMessage", eventData);
			var clientId	= eventData.clientId;
			
			var ewsClient	= ewsClients[clientId];
			var msg		= eventData.message;
			var urlClients	= wsUrls[ewsClient.wsUrl];
			urlClients.forEach(function(urlClient){
				urlClient.sioClient.send(msg);
			});
		};
// likely issues in garbage collectors

		console.log("received message", message);
		if( !message.type )	return;
		message.data	= message.data || {};
		if( message.type === 'connect' ){
			onConnect(message.data);
		}else if( message.type === 'message' ){
			onMessage(message.data);
		}
	});
	client.on('disconnect', function(){
		console.log("disconnection from clientid", client.sessionId);
	});
}); 
