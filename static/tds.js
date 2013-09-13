var tds = (function (){
    function init(){
        if (window.addEventListener) {
            window.addEventListener("load", onLoadListener, false);
        } else if (window.attatchEvent) {
            window.attatchEvent("onload", onLoadListener);
        }
    }

    function onLoadListener(){
        httpReq("token", function(xhr){
            if (xhr.status === 200) {
                alert(xhr.responseText);
                var json = JSON.parse(xhr.responseText);
                var at = json.acc_token;
                var as = json.acc_secret;
                var ct = json.con_token;
                var cs = json.con_secret;

                if (! at || ! as) {
                    alert("Not authorized yet. Jump to setup page.");
                    window.content.location.href = "setup";
                } else {
                    var c = window.document.getElementById("content");
                    c.innerHTML = [at, as, ct, cs].join("<br />\n");
                }
            }
        });
    }

    function httpReq(url, callback){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
                callback(xhr);
            }
        };
        xhr.send(null);
    }

    return {
        init: init
    };
})();

tds.init();
