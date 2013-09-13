import os
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb

# import jinja2
import webapp2

class ConsumerKey(ndb.Model):
    # userid = ndb.StringProperty(indexed=True)
    key = ndb.StringProperty(indexed=False)

def getKey(user):
    if not user:
        raise ValueError("user is None")
    e = ConsumerKey.get_by_id(user.user_id())
    if e:
        return e.key
    else:
        return None

def putKey(user, key):
    if not user:
        raise ValueError("user is None")
    e = ConsumerKey(id=user.user_id(), key=key)
    e.put()
    return key

class AuthPage(webapp2.RequestHandler):
    __user = None
    def get(self):
        self.__user = users.get_current_user()
        if self.__user:
            self.__ask_tumblr_login()
        else:
            self.__ask_google_login()
        return

    def __ask_tumblr_login(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write("""<p>Please login """ +
                                """<a href="">tumblr</a>.</p>""" +
                                """<p><a href="{}">Logout</a></p>""".format(
                                    users.create_logout_url(self.request.uri)
                                ))
        putKey(self.__user, self.__user.nickname())
        self.response.out.write(getKey(self.__user))
        return

    def __ask_google_login(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write("""Please login """ +
                                """<a href="{}">google</a> first.""".format(
                                    users.create_login_url(self.request.uri)
                                ))
        return
        

app = webapp2.WSGIApplication([
    ('/auth', AuthPage),
    ('/token', AuthPage),
], debug=True)
