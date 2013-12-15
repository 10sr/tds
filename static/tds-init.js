var TDSInit = (function (){
    // initialize environments and start slideshow

    // init and listeners
    function init(){
        if (window.addEventListener) {
            window.addEventListener("load", onLoadListener, false);
        } else if (window.attatchEvent) {
            window.attatchEvent("onload", onLoadListener);
        }
    }

    function onLoadListener(){
        getToken(cbGetToken);
    }

    function getToken(callback){
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
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            TDSReq.setTokens(json.acc_token,
                             json.acc_secret,
                             json.con_token,
                             json.con_secret);
            // alert(TDSReq.isready())
            if (! TDSReq.isready()) {
                alert("Cannot get tokens for you. Jump to setup page.");
                window.content.location.href = "setup";
            } else {
                TDSSS.start();
            }
        }
    }

    return {
        init: init
    };
})();

TDSInit.init();
