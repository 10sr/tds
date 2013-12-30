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



###############################
# Handle ndb database
class TumblrToken(ndb.Model):
    """Model for tubmlr access tokens."""
    acc_token = ndb.StringProperty(indexed=False, default=None)
    acc_secret = ndb.StringProperty(indexed=False, default=None)
    req_token = ndb.StringProperty(indexed=False, default=None)
    req_secret = ndb.StringProperty(indexed=False, default=None)

def getToken():
    """Return token for current user or None."""
    user = users.get_current_user()
    if user:
        e = TumblrToken.get_by_id(user.user_id())
        return e
    return None

def putToken(**kargs):
    """Save tokens for current user. Create new entry if not exists yet."""
    user = users.get_current_user()
    if user is None:
        return None

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



class __TDSReqHandler(webapp2.RequestHandler):
    """Base class for TDS request handlers."""
    pass


class VerifyPage(__TDSReqHandler):
    def get(self):
        etoken = getToken()
        if etoken is None:
            self.redirect("setup")
            return

        from urlparse import parse_qs
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
        oreq.sign_request(sig, consumer, token)
        conn = httplib.HTTPConnection("localhost")
        conn.request("POST", TUMBLR_ACCTOKEN, headers=oreq.to_header())
        res = conn.getresponse()
        token = oauth.OAuthToken.from_string(res.read())
        acctoken = token.key
        accsecret = token.secret

        putToken(acc_secret=accsecret, acc_token=acctoken)

        # self.response.headers['Content-Type'] = 'text/plain'
        # self.response.out.write(str(getToken(user)))
        self.redirect(self.request.uri.rpartition("/")[0])
        return

class AuthPage(__TDSReqHandler):
    """Authorize tumblr. Create url for auth and reditect to it."""
    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect("setup")
            return

        consumer = oauth.OAuthConsumer(CONSUMER_KEY, CONSUMER_SECRET)
        sig = oauth.OAuthSignatureMethod_HMAC_SHA1()

        if self.request.uri.startswith("http://localhost"):
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

        putToken(req_secret=reqsecret, req_token=reqtoken)

        self.redirect(TUMBLR_AUTHORIZE + "?oauth_token=" + reqtoken)

        # self.response.headers['Content-Type'] = 'text/plain'
        # self.response.out.write(res.read())
        return


class SetupPage(__TDSReqHandler):
    """Show urls for setup."""
    __user = None
    def get(self):
        self.__user = users.get_current_user()
        if self.__user:
            t = getToken()
            if t and t.acc_token and t.acc_secret:
                self.redirect("/")
            else:
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
        return

    def __ask_google_login(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write("""Please login """ +
                                """<a href="{}">google</a> first.""".format(
                                    users.create_login_url(self.request.uri)
                                ))
        return

class GetToken(__TDSReqHandler):
    """Return current users tokens in JSON format."""
    def get(self):
        self.response.headers['Content-Type'] = 'application/json'
        e = getToken()
        if e:
            import json
            self.response.out.write(json.dumps({
                "acc_token": e.acc_token,
                "acc_secret": e.acc_secret,
                "con_token": CONSUMER_KEY,
                "con_secret": CONSUMER_SECRET
            }))
            return
        else:
            self.response.out.write("{}")
            return

app = webapp2.WSGIApplication([
    ('/setup', SetupPage),
    ('/auth', AuthPage),
    ('/verify', VerifyPage),
    ('/token', GetToken),
], debug=True)
