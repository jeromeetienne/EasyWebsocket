# written but not tested

NSTER_USERNAME="jetienne"
NSTER_PASSWORD="123"
NSTER_APPNAME="easywebsocket"
# TODO this one is wrong
STARTJS_PATH="node/server/server.js"

app_create:
	curl -X POST -s -u "$(NSTER_USERNAME):$(NSTER_PASSWORD)" -d "appname=$(NSTER_APPNAME)&start=$(STARTJS_PATH)" http://api.nodester.com/app | jsonpretty

app_delete:
	curl -X DELETE -s -u "$(NSTER_USERNAME):$(NSTER_PASSWORD)" -d "appname=$(NSTER_APPNAME)" http://api.nodester.com/app | jsonpretty

app_start:
	curl -X PUT -s -u "$(NSTER_USERNAME):$(NSTER_PASSWORD)" -d "appname=$(NSTER_APPNAME)&running=true" http://api.nodester.com/app | jsonpretty

app_stop:
	curl -X PUT -s -u "$(NSTER_USERNAME):$(NSTER_PASSWORD)" -d "appname=$(NSTER_APPNAME)&running=false" http://api.nodester.com/app | jsonpretty

app_info:
	curl -s -u "$(NSTER_USERNAME):$(NSTER_PASSWORD)" http://api.nodester.com/app/$(NSTER_APPNAME) | jsonpretty

app_logs:
	curl -s -u "$(NSTER_USERNAME):$(NSTER_PASSWORD)" http://api.nodester.com/applogs/$(NSTER_APPNAME) | jsonpretty

apps_info:
	curl -s -u "$(NSTER_USERNAME):$(NSTER_PASSWORD)" http://api.nodester.com/apps | jsonpretty

# need to get the proper git remote
# - get it in the app_info json output
git_setup:
	git remote rm nodester
	git remote add nodester ec2-user@nodester.com:/home/ec2-user/hosted_apps/jetienne/797-8e921e4d8d8f069a7de0d3d67e41be3b.git

