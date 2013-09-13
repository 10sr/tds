import os
import urllib
import httplib

from google.appengine.api import users
from google.appengine.ext import ndb

import oauth.oauth as oauth

# import jinja2
import webapp2

CONSUMER_KEY = "jN4TzqXLPLGBv4wm6TpRKkv0vEo2dw0JkiZck7CY2TjWGwoivA"
CONSUMER_SECRET = "uIxiULtsCJfNN1YBsUHppgVrqlccvOeyLBleFvnMHM4mFGD2c3"

TUMBLR_OAUTH = "http://www.tumblr.com/oauth"
TUMBLR_REQTOKEN = TUMBLR_OAUTH + "/request_token"
TUMBLR_AUTHORIZE = TUMBLR_OAUTH + "/authorize"
TUMBLR_ACCTOKEN = TUMBLR_OAUTH + "/access_token"

class TumblrToken(ndb.Model):
    acc_token = ndb.StringProperty(indexed=False)
    acc_secret = ndb.StringProperty(indexed=False)
    req_token = ndb.StringProperty(indexed=False)
    req_secret = ndb.StringProperty(indexed=False)

def getToken(user):
    if not user:
        raise ValueError("user is None")
    e = TumblrToken.get_by_id(user.user_id())
    return e

def putToken(user, **kargs):
    if not user:
        raise ValueError("user is None")
    e = TumblrToken.get_by_id(user.user_id()) or TumblrToken(id=user.user_id())
    try:
        e.acc_token = kargs["acc_token"]
    except KeyError:
        pass
    try:
        e.acc_secret = kargs["acc_secret"]
    except KeyError:
        pass
    try:
        e.req_token = kargs["req_token"]
    except KeyError:
        pass
    try:
        e.req_secret = kargs["req_secret"]
    except KeyError:
        pass
    e.put()
    return




class VerifyPage(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect("setup")
            return

        etoken = getToken(user)

        from urlparse import urlparse, parse_qs
        # up = urlparse(self.request.uri)
        pq = parse_qs(self.request.query_string)
        vf = pq["oauth_verifier"][0].strip()
        reqtoken = pq["oauth_token"][0]

        sig = oauth.OAuthSignatureMethod_HMAC_SHA1()
        consumer = oauth.OAuthConsumer(CONSUMER_KEY, CONSUMER_SECRET)
        token = oauth.OAuthToken(etoken.req_token, etoken.req_secret)
        oreq = oauth.OAuthRequest.from_consumer_and_token(
            consumer,
            token=token,
            verifier=vf,
            http_url=TUMBLR_ACCTOKEN,
            http_method="POST"
        )
        # oreq.set_parameter("oauth_token_secret", token.secret)
        # oreq.set_parameter("oauth_consumer_secret", consumer.secret)
        oreq.sign_request(sig, consumer, token)
        conn = httplib.HTTPConnection("localhost")
        conn.request("POST", TUMBLR_ACCTOKEN, headers=oreq.to_header())
        res = conn.getresponse()
        token = oauth.OAuthToken.from_string(res.read())
        acctoken = token.key
        accsecret = token.secret

        putToken(user, acc_secret=accsecret, acc_token=acctoken)

        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(str(getToken(user)))
        return

class AuthPage(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect("setup")
            return

        consumer = oauth.OAuthConsumer(CONSUMER_KEY, CONSUMER_SECRET)
        sig = oauth.OAuthSignatureMethod_HMAC_SHA1()

        if self.request.uri.startswith("http://localhost:8080/"):
            prt = "http://"
        else:
            prt = "https://"
        verify_url = (self.request.uri.rpartition("/")[0].
                      replace("http://", prt)) + "/verify"

        oreq = oauth.OAuthRequest.from_consumer_and_token(
            consumer,
            callback=verify_url,
            http_url=TUMBLR_REQTOKEN,
            http_method="POST"
        )
        oreq.sign_request(sig, consumer, None)

        conn = httplib.HTTPConnection("localhost")
        conn.request("POST", TUMBLR_REQTOKEN, headers=oreq.to_header())
        res = conn.getresponse()
        token = oauth.OAuthToken.from_string(res.read())
        reqtoken = token.key
        reqsecret = token.secret

        putToken(user, req_secret=reqsecret, req_token=reqtoken)

        self.redirect(TUMBLR_AUTHORIZE + "?oauth_token=" + reqtoken)

        # self.response.headers['Content-Type'] = 'text/plain'
        # self.response.out.write(res.read())
        return


class SetupPage(webapp2.RequestHandler):
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
                                """<a href="auth">tumblr</a>.</p>""" +
                                """<p><a href="{}">Logout</a></p>""".format(
                                    users.create_logout_url(self.request.uri)
                                ))
        # putToken(self.__user, reqtoken=self.__user.nickname(), self.__user.nickname())
        # self.response.out.write(getToken(self.__user)[0])
        return

    def __ask_google_login(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write("""Please login """ +
                                """<a href="{}">google</a> first.""".format(
                                    users.create_login_url(self.request.uri)
                                ))
        return

class GetToken(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            self.response.headers['Content-Type'] = 'text/plain'
            e = getToken(user)
            self.response.out.write(str(e))
            return
        else:
            return

app = webapp2.WSGIApplication([
    ('/setup', SetupPage),
    ('/auth', AuthPage),
    ('/verify', VerifyPage),
    ('/token', GetToken),
], debug=True)
