from google.appengine.ext import webapp
from google.appengine.api import channel
from google.appengine.ext.webapp.util import run_wsgi_app

# jsonp call which return the token to create the channle in .js
class createChannel(webapp.RequestHandler):
    def get(self):
        clientId    = self.request.get("clientId");
        callback    = self.request.get("callback");
        token       = channel.create_channel(clientId);
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write("%s(\"%s\");\n" % (callback,token))

# post method /send to send message to a give clientId
class sendChannel(webapp.RequestHandler):
    def post(self):
        clientId    = self.request.get("clientId");
        message     = self.request.get("message");
        channel.send_message(clientId, message);

application = webapp.WSGIApplication(
    [
      ('/create', createChannel)
    , ('/send', sendChannel)
    ],
    debug=True
)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()