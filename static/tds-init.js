var TDSInit = (function (){
    // Initialize environments and start slideshow.

    // Fetch tokens and pass them to TDSReq.
    // After successfully setting tokens, kick TDSSS.start() .

    // init and listeners
    function init(){
        if (window.addEventListener) {
            window.addEventListener("load", __onLoadListener, false);
        } else if (window.attatchEvent) {
            window.attatchEvent("onload", __onLoadListener);
        }
    }

    function __onLoadListener(){
        __getToken();
    }

    function __getToken(){
        // Access to /token to get tokens from ndb and run callback function.
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "token", true);
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
                __cbGetToken(xhr);
            }
        };
        xhr.send(null);
    }

    function __checkAuth(){
        if (TDSReq.isready()) {
            TDSReq.req("/user/info", {
                callback: "TDSInit.__cbCheckAuth"
            });
        } else {
            TDSNotify.show(
                "Cannot get tokens for you. First go setup page.",
                true
            );
        }
    }

    function __cbCheckAuth(obj){
        TDSReq.onFinish();
        if (obj["meta"]["status"] === 200) {
            var tname = obj["response"]["user"]["name"];
            TDSNotify.show("Tumblr login name: " + tname);
            TDSSS.start();
        } else {
            var msg = obj["meta"]["msg"];
            TDSNotify.show(msg);
            TDSNotify.show("Auth your tumblr account.", t);
        }
        return;
    }

    function __cbGetToken(xhr){
        // callback function for getToken. Call TDSSS.start if TDSReq is ready.
        // Otherwise move to /setup page.
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            TDSReq.setTokens(json.acc_token,
                             json.acc_secret,
                             json.con_token,
                             json.con_secret);
            // alert(TDSReq.isready())
            __checkAuth();
        } else {
            // not sane status
            return;
        }
    }

    return {
        init: init,
        __cbCheckAuth: __cbCheckAuth
    };
})();

TDSInit.init();
