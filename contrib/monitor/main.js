jQuery(function() {
var url		= "ws://easywebsocket.org/latencytester"+Math.floor(Math.random() * 1000000);
var socket	= new EasyWebSocket(url);
var localId	= Math.floor(Math.random() * 1000000).toString(32);
var loadDate	= new Date().getTime();
var period	= 0.5*1000;
var graph	= true;
if( graph )	var deltas	= new TimeSeries();
socket.onopen	= function() {
	// update .cnxTime.data
	var connectionDelay	= new Date().getTime() - loadDate;
	jQuery(".content .cnxTime.data").text(connectionDelay+'-msec');
	// send the first ping to myself
	sendPing();
}

sendPing	= function(){
	socket.send(localId+" "+new Date().getTime())
	setTimeout(sendPing, period)
}

socket.onmessage = function(event) {
	var data	= event.data.split(' ')
	if (data[0] != localId)	return
	var delta	= new Date().getTime() - data[1];
	//console.log("delta", delta)
	if( graph ) deltas.append(new Date().getTime(), delta);
}

if(graph){
	(function(){
		var chart = new SmoothieChart();
		chart.addTimeSeries(deltas, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
		chart.streamTo(document.getElementById("chart"), period);
	})()
}

// update .url.data
jQuery(".content .url.data").text(url);

})
