# mini Makefile to automatize tasks

GAE_ROOT="../google_appengine"

help:
	@echo "$$ make server"
	@echo "\tRun the developement server"
	@echo "$$ make deploy"
	@echo "\tDeploy the application on google AppEngine"

server:
	$(GAE_ROOT)/dev_appserver.py .

deploy:
	$(GAE_ROOT)/appcfg.py update .
