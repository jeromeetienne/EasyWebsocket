(function(){
	var JsLoad	= function(url){
		var element	= document.createElement('script');
		element.src	= url;
		document.body.appendChild(element);
	}
	
	JsLoad('https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js');

	JsLoad('http://localhost/~jerome/webwork/easyWebSocket/contrib/chatWidget/chatWidget.js');
})();