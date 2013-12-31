var TDSReq = (function (){
    // Request to tumblr API using JSONP

    // members:
    // req(path, params): Request tumblr PATH API with PARAMS.
    // setTokens(at, as, ct, cs)
    // bool isready(): true if tokens are available and can request to tumblr.
    // bool isreq(): true if currently requesting
    // onFinish(): Finalize a request. Callback functions MUST call this.

    // at, as, ct, cs: {access,consumer}_{token,secret}
    var at;
    var as;
    var ct;
    var cs;
    var __ready = false;

    // id for script tag for JSONP
    var __id = "tdsreq-json-script";

    function init(){
        return;
    }

    function setTokens(_at, _as, _ct, _cs){
        at = _at;
        as = _as;
        ct = _ct;
        cs = _cs;
        if (at && as && ct && cs) {
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
        // start JSONP request
        if (window.document.getElementById(__id)) {
            // avoid duplicating request
            return;
        }
        var target = window.document.createElement('script');
        target.id = __id;
        target.charset = 'utf-8';
        target.src = url;
        // target.id = "TDS_JSONP";
        window.document.body.appendChild(target);
    }

    function onFinish(){
        // remove script tag
        window.document.body.removeChild(
            window.document.getElementById(__id)
        );
        return;
    }

    function isreq(){
        // getElementById returns null if none found.
        return window.document.getElementById(__id) ? true : false;
    }

    return {
        init: init,
        req: req,
        setTokens: setTokens,
        isready: isready,
        isreq: isreq,
        onFinish: onFinish
    };
})();

TDSReq.init();
