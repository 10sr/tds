var TDSController = (function (){
    // Get control values from html and update the behavior of others.

    var __interval = 500;
    var __econtroller = null;
    var __epin = null;

    function init(){
        if (window.addEventListener) {
            window.addEventListener("load", __onLoadListener, false);
        } else if (window.attatchEvent) {
            window.attatchEvent("onload", __onLoadListener);
        }
    }

    function __onLoadListener(){
        __econtroller = window.document.getElementById("controller");

        __epin = window.document.getElementById("controller-pin");
        __epin.addEventListener("click", __onPinClickListener);
        return;
    }

    function __onPinClickListener(){
        // i dont want use `this'.
        if (__epin.checked) {
            TDSNotify.show("pin current");
            TDSSS.pin();
        } else {
            TDSNotify.show("unpin current");
            TDSSS.unpin();
        }
        return;
    }

    return {
        init: init
    };
})();

TDSController.init();
