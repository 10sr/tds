var tds = (function (){
    var at;
    var as;
    var ct;
    var cs;

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

    function cbGetToken(xhr){
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            at = json.acc_token;
            as = json.acc_secret;
            ct = json.con_token;
            cs = json.con_secret;

            if (! at || ! as) {
                alert("Not authorized yet. Jump to setup page.");
                window.content.location.href = "setup";
            } else {
                alert("token got");
                var c = window.document.getElementById("content");
                c.innerHTML = [at, as, ct, cs].join("<br />\n");
                var url = genTumblrReq("/user/dashboard",
                                       {limit: "20", callback: "alertOBJ"});
                callJSONP(url);
            }
        }
    }

    function getToken(callback){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "token", true);
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
                callback(xhr);
            }
        };
        xhr.send(null);
    }

    function genTumblrReq(path, params){
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

        for ( var key in params ) {
            message.parameters[key] = params[key];
        }

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        return OAuth.addToURL(message.action, message.parameters);
    }

    function callJSONP(url) {
        var target = document.createElement('script');
        target.charset = 'utf-8';
        target.src = url;
        // target.id = "TDS_JSONP";
        document.body.appendChild(target);
    }

    return {
        init: init
    };
})();

function alertOBJ(obj){
    alert(JSON.stringify(obj));
};

tds.init();
