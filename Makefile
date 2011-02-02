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
