# about node refactoring
* split in 2 parts. -node and -gapp
* clearly present that on the webpage
* for demo apps, allow a 'backend=gapp' or 'backend=node'

## how about folder hierarchie
* /node and /gapp
* about the exposed .js
  * /easyWebSocket-node.min.js 
  * /easyWebSocket-gapp.min.js 
  * /easyWebSocket.min.js
    * this one is the default (the node one if it is stable enougth)
* generic static files are hosted on github at easywebsocket.org
  * static file are hosted on nodester/gapp IIF required

## nodester
* currently this is the hosting for the node version
  * make command to handle the hosting
  * not sure what is it
  * create/status/start/stop/delete apps ? other ?
  * all that packed in a makefile to capture knowledge

### TODO

* to make a demo on the home page which display the mouse of others
  * funnier than a chat
  * less css
  * got one by stagas
* DONE implement clientAlive in the iframe
  * return the period in the open
* DONE implement the task in AppEngine to obsolete people
  * how to test this ?
* DONE handle the execption send sending a message* DONE make the chat example not ugly
  * most people will see only this, so it is important
* DONE should i get a domain or not
  * currently homepage of the project is http://jeromeetienne.github.com/EasyWebSocket
  * would be a .org for 12$ to -invest-
  * maybe to publish it this way for now, and if it still work in 2 weeks, get a domain


### IDEAS

* make a chat widget ala facebook
* make the mouse demo


### DONE

* DONE make the homepage as being from README.md to something not ugly (like socket.io)
* DONE make this homepage available on github gh-pages
* DONE to remove /tmp
