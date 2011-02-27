# written but not tested

NSTER_USERNAME="jetienne"
NSTER_PASSWORD="123"
NSTER_APPNAME="easywebsocket"
# TODO this one is wrong
STARTJS_PATH="server.js"

app_create:
	curl -X POST -u "$NSTER_USERNAME:$NSTER_PASSWORD" -d "appname=$NSTER_APPNAME&start=$STARTJS_PATH" http://api.nodester.com/app

app_delete:
	curl -X DELETE -u "$NSTER_USERNAME:$NSTER_PASSWORD" -d "appname=$NSTER_APPNAME" http://api.nodester.com/app


app_start:
	curl -X PUT -u "$NSTER_USERNAME:$NSTER_PASSWORD" -d "appname=$NSTER_APPNAME&running=true" http://api.nodester.com/app

app_info:
	curl -u "$NSTER_USERNAME:$NSTER_PASSWORD" http://api.nodester.com/app/$NSTER_APPNAME | jsonpretty


apps_info:
	curl -u "$NSTER_USERNAME:$NSTER_PASSWORD" http://api.nodester.com/apps | jsonpretty

