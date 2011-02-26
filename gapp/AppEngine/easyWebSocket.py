import logging
import datetime

from google.appengine.api import channel
from google.appengine.api import taskqueue

from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp.util import run_wsgi_app

# constant to know when to refresh client liveness
clientAliveRefresh  = 60*1000;
clientAliveTimeout  = 3*60*1000;

class Client(db.Model):
    """the data about the client"""
    clientId    = db.StringProperty()
    wsUrl       = db.StringProperty()
    timestamp   = db.DateTimeProperty()

# jsonp call which return the token to create the channel in .js
# - TODO should this return the idleTimeout period too ?
class createChannel(webapp.RequestHandler):
    def get(self):
        clientId    = self.request.get("clientId");
        wsUrl       = self.request.get("wsUrl");
        callback    = self.request.get("callback");
        # create the record
        # TODO should i detect a collision on the clientid ?
        client      = Client(clientId=clientId, wsUrl=wsUrl, timestamp=datetime.datetime.now())
        client.put()
        # create the channel
        token       = channel.create_channel(clientId);
        # queue a /clientPurge task
        taskqueue.add(url='/clientPurge');
        # build the jsonp answer
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write("%s({token:'%s', clientAliveRefresh: %d});\n" % (callback,token, clientAliveRefresh))

# post method /send to send message to all client of a given wsUrl
class sendToWebsocketUrl(webapp.RequestHandler):
    def post(self):
        wsUrl       = self.request.get("wsUrl");
        message     = self.request.get("message");
        clients     = Client.all().filter('wsUrl',wsUrl).fetch(1000)
        for client in clients:
            try:
                channel.send_message(client.clientId, message);
            except InvalidChannelClientIdError:
                # if this client is declared invalid by channel API, delete it
                client.delete

# must be called periodically by the clientId
class clientAlive(webapp.RequestHandler):
    def post(self):
        clientId    = self.request.get("clientId");
        client      = Client.all().filter('clientId =',clientId).get()
        client.timestamp    = datetime.datetime.now()
        client.put()

# must be called periodically - TODO maybe a task in AppEngine
class clientPurge(webapp.RequestHandler):
    def post(self):
        maxTime = datetime.datetime.now() - datetime.timedelta(milliseconds=clientAliveTimeout)
        clients = Client.all().filter('timestamp <', maxTime).fetch(1000)
        for client in clients:
            logging.debug("Deleting obsolete %s  %s" % (client.clientId, datetime.datetime.now() - client.timestamp))
            client.delete()
            

application = webapp.WSGIApplication(
    [
      ('/createChannel'     , createChannel)
    , ('/sendToWebsocketUrl', sendToWebsocketUrl)
    , ('/clientAlive'       , clientAlive)
    , ('/clientPurge'       , clientPurge)
    ],
    debug=True
)

def main():
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)

if __name__ == "__main__":
    main()