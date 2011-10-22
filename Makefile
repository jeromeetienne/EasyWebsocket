# mini Makefile to automatize tasks

GAE_ROOT="/home/jerome/opt/gae/google_appengine"

help:
	@echo "$$ make server"
	@echo "\tRun the developement server"
	@echo "$$ make deploy"
	@echo "\tDeploy the application on google AppEngine"
	@echo "$$ make help"
	@echo "\tDisplay inline help"

server_gapp:
	$(GAE_ROOT)/dev_appserver.py .

server_node:
	(cd node/server && node server.js)

# dox experiment TO REMOVE
docs:
	dox	--title "html5-RockPaperScissors"		\
		--desc "RockPaperScissors on WebSocket"		\
		gapp/iframe/main.js				\
		> gapp/iframe/doc/index.html

minify:
	closurec --js node/server/node_modules/socket.io-client/dist/socket.io.js	\
			--js node/easyWebSocket-node.js 				\
			--js_output_file easyWebSocket-node.min.js
	closurec --js gapp/easyWebSocket-gapp.js --js_output_file easyWebSocket-gapp.min.js
	cp easyWebSocket-node.min.js easyWebSocket.min.js

deploy	: minify deployGhPage deployAppEngine 

deployAppEngine:
	$(GAE_ROOT)/appcfg.py update .

deployGhPage:
	rm -rf /tmp/EasyWebsocketGhPages
	(cd /tmp && git clone git@github.com:jeromeetienne/EasyWebsocket.git EasyWebsocketGhPages)
	(cd /tmp/EasyWebsocketGhPages && git checkout gh-pages)
	cp -a *.html *.js CNAME ./gapp/ ./node ./example ./contrib /tmp/EasyWebsocketGhPages
	(cd /tmp/EasyWebsocketGhPages && git add . && (git commit -a -m "Another deployement" || true) && git push origin gh-pages)
	#rm -rf /tmp/EasyWebsocketGhPages
