var TDSReq = (function (){
    // Request to tumblr API using JSONP

    // members:
    // setTokens(at, as, ct, cs)
    // req(path, params): Request tumblr PATH API with PARAMS.
    // bool isready(): true if tokens are available and can request to tumblr.

    // at, as, ct, cs: {access,consumer}_{token,secret}
    var at;
    var as;
    var ct;
    var cs;
    var __ready = false;

    function init(){
        return;
    }

    function setTokens(_at, _as, _ct, _cs){
        at = _at;
        as = _as;
        ct = _ct;
        cs = _cs;
        if (at && as) {
            __ready = true;
        }
        return;
    }

    function isready(){
        return __ready;
    }

    function req(path, params){
        return __callJSONP(__genTumblrReq(path, params));
    }

    function __genTumblrReq(path, params){
        // generate authorized tumblr request url for path and params.
        var accessor = {
            consumerSecret: cs,
            tokenSecret: as
        };

        var message = {
            method: "GET",
            action: "https://api.tumblr.com/v2" + path,
            parameters: {
                oauth_signature_method: "HMAC-SHA1",
                oauth_consumer_key: ct,
                oauth_token: at
            }
        };

        for (var key in params) {
            message.parameters[key] = params[key];
        }

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        return OAuth.addToURL(message.action, message.parameters);
    }

    function __callJSONP(url) {
        // FIXME: remove old script tags
        // start JSONP request
        var target = document.createElement('script');
        target.charset = 'utf-8';
        target.src = url;
        // target.id = "TDS_JSONP";
        document.body.appendChild(target);
    }

    return {
        init: init,
        req: req,
        setTokens: setTokens,
        isready: isready
    };
})();

TDSReq.init();
