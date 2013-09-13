import os
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb

import oauth

# import jinja2
import webapp2

class AccessToken(ndb.Model):
    token = ndb.StringProperty(indexed=False)
    token_secret = ndb.StringProperty(indexed=False)

def getToken(user):
    if not user:
        raise ValueError("user is None")
    e = AccessToken.get_by_id(user.user_id())
    if e:
        return (e.token, e.token_secret)
    else:
        return None

def putToken(user, token, token_secret):
    if not user:
        raise ValueError("user is None")
    e = AccessToken(id=user.user_id(), token=token, token_secret=token_secret)
    e.put()
    return (token, token_secret)

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
        putToken(self.__user, self.__user.nickname(), self.__user.nickname())
        self.response.out.write(getToken(self.__user)[0])
        return

    def __ask_google_login(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write("""Please login """ +
                                """<a href="{}">google</a> first.""".format(
                                    users.create_login_url(self.request.uri)
                                ))
        return

class ReqToken(webapp2.RequestHandler):
    def get(self):
        user = user.get_current_user()
        if user:
            return True
        else:
            return False

app = webapp2.WSGIApplication([
    ('/auth', AuthPage),
    ('/token', ReqToken),
], debug=True)
