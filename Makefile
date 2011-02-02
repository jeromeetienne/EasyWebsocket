# mini Makefile to automatize tasks

GAE_ROOT="/home/jerome/opt/gae/google_appengine"

help:
	@echo "$$ make server"
	@echo "\tRun the developement server"
	@echo "$$ make deploy"
	@echo "\tDeploy the application on google AppEngine"

server:
	$(GAE_ROOT)/dev_appserver.py .

minify:
	closurec --js web/easyWebSocket.js --js_output_file web/easyWebSocket-min.js

deploy:	minify
	$(GAE_ROOT)/appcfg.py update .

deployGithub:
	rm -rf /tmp/EasyWebsocketGhPages	
	(cd /tmp && git clone git@github.com:jeromeetienne/EasyWebsocket.git EasyWebsocketGhPages)
	#(cd /tmp/EasyWebsocketGhPages && git symbolic-ref HEAD refs/heads/gh-pages && rm .git/index && git clean -fdx)
	# TODO this reset is crap... the goal is to get 
	(cd /tmp/EasyWebsocketGhPages && git checkout gh-pages)
	cp -a ./web ./examples /tmp/EasyWebsocketGhPages
	(cd /tmp/EasyWebsocketGhPages && git add . && git commit -a -m "Another deployement" && git push origin gh-pages)
	rm -rf /tmp/EasyWebsocketGhPages
