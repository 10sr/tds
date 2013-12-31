var TDSNotify = (function (){
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

    function show(msg){
        if (__elem) {
            // TODO: accept multiple messages at once
            __elem.innerHTML = __elem.innerHTML + msg;
        } else {
            alert(msg);
        }
        return;
    }

    return {
        init: init,
        show: show
    };
})();

TDSNotify.init();
