var TDSNotify = (function (){
    // time in milisec to hide message
    var __msg_time = 3000;

    var __elem = null;

    function init(){
        if (window.addEventListener) {
            window.addEventListener("load", __onLoadListener, false);
        } else if (window.attatchEvent) {
            window.attatchEvent("onload", __onLoadListener);
        }
    }

    function __onLoadListener(){
        // find elem for notify
        __elem = window.document.getElementById("notify") || null;
        return;
    }

    function show(msg, sticky){
        if (! __elem) {
            // if element for notify is not available just alert MSG
            alert(msg);
            return;
        }

        var e = window.document.createElement("div");
        e.className = "notify-message";
        e.innerHTML = msg;
        __elem.appendChild(e);
        if (! sticky) {
            window.setTimeout(function(){
                __elem.removeChild(e);
            }, __msg_time);
        }
        return;
    }

    function clear(){
        return;
    }

    function debug(msg, sticky){
        return;
        show("DEBUG: " + msg, sticky);
    }

    return {
        init: init,
        show: show,
        clear: clear,
        debug: debug
    };
})();

TDSNotify.init();
