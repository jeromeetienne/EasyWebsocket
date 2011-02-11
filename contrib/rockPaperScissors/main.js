/**
 *
 * - explaination on the game http://en.wikipedia.org/wiki/Rock-paper-scissors
 *
 * - fix the connection establishmenet. this is like a tcp connection establishement
 *   - with a simulteneous open case which is super frequent
 *   - http://www.tcpipguide.com/free/t_TCPConnectionEstablishmentProcessTheThreeWayHandsh-3.htm
 *   - http://www.tcpipguide.com/free/t_TCPConnectionEstablishmentProcessTheThreeWayHandsh-4.htm
 * - display a nice log of current game events
 *   - thus it is easier to diagnose the issues
*/

/**
 * Define the namespace
*/
var Rockps	= {}

/**
 * Rockps.Move defines the various moves
*/
Rockps.Move		= function(value){
	this.value	= value;
};

Rockps.Move.NONE	= "none";
Rockps.Move.ROCK	= "rock";
Rockps.Move.SCISSORS	= "scissors";
Rockps.Move.PAPER	= "paper";

Rockps.Move.getRandom	= function(){
	var moves	= [Rockps.Move.ROCK, Rockps.Move.SCISSORS, Rockps.Move.PAPER];
	var idx		= Math.floor(Math.random() * moves.length)
	return new Rockps.Move(moves[idx]);
}
Rockps.Move.prototype.label	= function(){
	return this.value.charAt(0).toUpperCase() + this.value.slice(1);
}
Rockps.Move.prototype.imageUrl	= function(){
	var imageUrls	= {
		"rock"		: "image/rock.png",
		"paper"		: "image/paper.png",
		"scissors"	: "image/scissors.png"
	}
	console.assert(this.isFromPlayer())
	return imageUrls[this.value];
}
/**
 * Display an <img> of a given move in a container
*/
Rockps.Move.prototype.display	= function(container){
	jQuery("<img>")
		.attr('width', 128)
		.attr('height', 128)
		.attr("src", this.imageUrl())
		.replaceAll(container+" .move");
	jQuery(container+" .moveName").text(this.label());
}
/**
 * @return {Boolean} true if the move may be from a player, false otherwise
*/
Rockps.Move.prototype.isFromPlayer= function(move){
	return [Rockps.Move.ROCK, Rockps.Move.SCISSORS, Rockps.Move.PAPER].indexOf(this.value) != -1;
}

/**
 * Decide the result of the game based on player moves
 * 
 * @returns {Rockps.Result} return the result for the first player
*/
Rockps.Move.prototype.decideResult	= function(otherMove){
	var moveCmpGt	= function(myMove, otherMove){
		var MOVE	= Rockps.Move;
		if( myMove === MOVE.ROCK	&& otherMove === MOVE.SCISSORS)	return true;
		if( myMove === MOVE.SCISSORS	&& otherMove === MOVE.PAPER )	return true;
		if( myMove === MOVE.PAPER	&& otherMove === MOVE.ROCK )	return true;
		return false;		
	}
	if( moveCmpGt(this.value, otherMove.value) )	return new Rockps.Result(Rockps.Result.WIN);
	if( moveCmpGt(otherMove.value, this.value) )	return new Rockps.Result(Rockps.Result.LOSS);
	return new Rockps.Result(Rockps.Result.DRAW);
}

/**
*/
Rockps.Result		= function(value){
	this.value	= value;
};

/**
 * Rockps.Result defines the possible game results
*/
Rockps.Result.NONE	= "none";
Rockps.Result.WIN	= "win";
Rockps.Result.DRAW	= "draw";
Rockps.Result.LOSS	= "loss";

Rockps.Result.prototype.display	= function(container){
	var texts	= {
		"win"	: "You Won!! Congratulation.",
		"draw"	: "Draw. Great minds think alike.",
		"loss"	: "You lose... Better luck next time ?"
	}
	jQuery("<p>")
		.text(texts[this.value])
		.appendTo(jQuery(container).empty());		
}

/**
 * Rockps.Result defines the possible game results
*/
Rockps.MESSAGE			= {};
Rockps.MESSAGE.NONE		= "none";
Rockps.MESSAGE.HELLO_SYN	= "hello_syn";
Rockps.MESSAGE.HELLO_ACK	= "hello_ack";
Rockps.MESSAGE.HELLO_SYNACK	= "hello_synack";
Rockps.MESSAGE.PLY		= "ply";

/**
 * Define the game class
*/
Rockps.Game		= function(){
	var curState	= Rockps.Game.STATE.NONE;
	var username	= "user-"+Math.floor(Math.random() * 1000000).toString(32);
	var otherUserName= null;
	var myMove	= Rockps.Move.getRandom();
	
console.log("myMove", myMove);
(function(){
	var localMove	= Rockps.Move.getRandom();
	var remoteMove	= Rockps.Move.getRandom();
	var result	= localMove.decideResult(remoteMove);
	// display everything
	localMove	.display(".content .playerContainer.localPlayer");
	remoteMove	.display(".content .playerContainer.remotePlayer");
	result		.display(".content .resultContainer");
})();



	/**
	 * Initialise the websocket
	*/
	var socket	= new EasyWebSocket("ws://easywebsocket.org/html5-rockpaperscissors");
	socket.onopen	= function() {
		console.log("Connnected to", this.url, this)
		socket.send(JSON.stringify({
			type	: Rockps.MESSAGE.HELLO_SYN,
			data	: {
				srcUserName	: username
			}
		}))	
	}
	socket.onmessage = function(event) {
		var message	= JSON.parse(event.data)
		console.assert(typeof(message.type) != "undefined");
		console.assert(typeof(message.data) != "undefined");
		// ignore messages from myself
		if( message.data.srcUserName == username )	return;
		// log the event
		console.log("message", "type", message.type, "data", message.data)
		// parse according to message.type
		if( message.type == Rockps.MESSAGE.HELLO_SYN ){
			// answer by a HELLO_ACK
			socket.send(JSON.stringify({
				type	: Rockps.MESSAGE.HELLO_ACK,
				data	: {
					srcUserName	: username,
					dstUserName	: message.data.srcUserName,
					room		: "room-"+Math.floor(Math.random() * 1000000).toString(32)
				}
			}))
		}else if( message.type == Rockps.MESSAGE.HELLO_ACK ){
			var otherUserName	= message.data.srcUserName
			// ignore message who arent from myself
			if( message.data.dstUserName != username )	return;
			// reply to this message
			socket.send(JSON.stringify({
				type	: Rockps.MESSAGE.HELLO_SYNACK,
				data	: {
					srcUserName	: username,
					dstUserName	: message.data.srcUserName,
					room		: message.data.room
				}
			}))
		}else if( message.type == Rockps.MESSAGE.HELLO_SYNACK ){
			
		}else if( message.type == Rockps.MESSAGE.PLY ){
			// ignore message who arent from myself
			if( message.data.dstUserName != username )	return;
			// log the event
			console.log("Your move is ", myMove)
			console.log("opponent is ", message.data.srcUserName," and its move is", message.data.srcMove)
			// compute the result
			var result	= Rockps.Move.decideResult(myMove, message.data.srcMove);
			if( result == Rockps.Result.WIN ){
				console.log("Congrats you win against", message.data.srcUserName)
			}else if( result == Rockps.Result.LOSS ){
				console.log("Unfortunatly you lost against", message.data.srcUserName)
			}else if( result == Rockps.Result.DRAW ){
				console.log("This is a draw against", message.data.srcUserName)
			}else console.assert(false);
		}
	}

}

/**
 * Describe the possible STATE of a Rockps.Game
*/
Rockps.Game.STATE		= {};
Rockps.Game.STATE.NONE		= "none";
Rockps.Game.STATE.FINDOPPONENT	= "findopponent";
Rockps.Game.STATE.PLAYING	= "playing";


	

jQuery(function(){
	// some global init 
	EasyWebSocket.iframeOrigin	= "http://localhost:8080";
	//EasyWebSocket.logFunction	= function(){ console.log.apply(console, arguments) };

	var game	= new Rockps.Game();	
});