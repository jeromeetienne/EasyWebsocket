This project provides WebSocket functionality to any web project.

* important: as it is a webservice, anybody can use it and thus have websocket

* find a good name
  * Websocket Anywhere ?


API
* /create
  * description: create a Channel for the caller page
  * "clientId": uri variable of the clientId for which the channel is created
  * "callback": uri variable of the JSONP call
  * return the token to use while creating the channel in the browser

* /send
  * description: send a message to a clientId
  * This is a http POST call
  * "clientId": uri variable of the destination clientId
  * "message": url variable containing the message