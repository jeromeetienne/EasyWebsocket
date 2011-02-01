import logging
import datetime

from google.appengine.api import channel
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp.util import run_wsgi_app


class Client(db.Model):
    """All the data we store for a game"""
    clientId    = db.StringProperty()
    resource    = db.StringProperty()
    timestamp   = db.DateTimeProperty()

class clientAlive(webapp.RequestHandler):
    def post(self):
        clientId    = self.request.get("clientId");
        client      = Client.all().filter('clientId =',clientId).get()
        client.timestamp    = datetime.datetime.now()
        client.put()

class clientPurge(webapp.RequestHandler):
    def post(self):
        maxTime = datetime.datetime.now() - datetime.timedelta(hours=10)
        clients = Client.all().filter('timestamp <', maxTime).fetch(1000)
        for client in clients:
            client.delete()

# jsonp call which return the token to create the channel in .js
class createChannel(webapp.RequestHandler):
    def get(self):
        clientId    = self.request.get("clientId");
        resource    = self.request.get("resource");
        callback    = self.request.get("callback");
        # create the record
        client      = Client(clientId=clientId, resource=resource, timestamp=timestamp)
        client.put()
        # create the channel
        token       = channel.create_channel(clientId);
        # build the jsonp answer
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write("%s(\"%s\");\n" % (callback,token))

# post method /send to send message to a give clientId
class sendToClientId(webapp.RequestHandler):
    def post(self):
        clientId    = self.request.get("clientId");
        message     = self.request.get("message");
        channel.send_message(clientId, message);

# post method /send to send message to a give clientId
class sendToResource(webapp.RequestHandler):
    def post(self):
        resource    = self.request.get("resource");
        message     = self.request.get("message");
        clients     = Client.all().filter('resource',resource).fetch(1000)
        for client in clients:
            channel.send_message(client.clientId, message);

application = webapp.WSGIApplication(
    [
      ('/fetchRecord', fetchRecord)
    , ('/createRecord', createRecord)
    , ('/create', createChannel)
    , ('/send'  , sendChannel)
    ],
    debug=True
)

def main():
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)

if __name__ == "__main__":
    main()