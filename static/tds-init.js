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
        __getToken(cbGetToken);
    }

    function __getToken(callback){
        // Access to /token to get tokens from ndb and run callback function.
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "token", true);
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
                callback(xhr);
            }
        };
        xhr.send(null);
    }

    function cbGetToken(xhr){
        // callback function for getToken. Call TDSSS.start if TDSReq is ready.
        // Otherwise move to /setup page.
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            TDSReq.setTokens(json.acc_token,
                             json.acc_secret,
                             json.con_token,
                             json.con_secret);
            // alert(TDSReq.isready())
            if (! TDSReq.isready()) {
                TDSNotify.show(
                    "Cannot get tokens for you. First go setup page.",
                    true
                );
                // window.content.location.href = "setup";
            } else {
                TDSSS.start();
            }
        } else {
            // not sane status
            return;
        }
    }

    return {
        init: init
    };
})();

TDSInit.init();
