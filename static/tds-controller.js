var TDSController = (function (){
    // Get control values from html and update the behavior of others.

    var __interval = 500;
    // var __econtroller = null;
    var __epin = null;

    const __PIN_TEXT = "PIN";
    const __UNPIN_TEXT = "UNPIN";

    function init(){
        if (window.addEventListener) {
            window.addEventListener("load", __onLoadListener, false);
        } else if (window.attatchEvent) {
            window.attatchEvent("onload", __onLoadListener);
        }
    }

    function __onLoadListener(){
        // __econtroller = window.document.getElementById("controller");

        __epin = window.document.getElementById("controller-pin");
        __epin.innerHTML = __PIN_TEXT;
        __epin.addEventListener("click", __onPinClickListener);
        return;
    }

    function __onPinClickListener(){
        // i dont want use `this'.
        if (__epin.innerHTML === __PIN_TEXT) {
            TDSNotify.show("Pin current one");
            __epin.innerHTML = __UNPIN_TEXT;
            TDSSS.pin();
        } else if (__epin.innerHTML === __UNPIN_TEXT) {
            TDSNotify.show("Unpin");
            __epin.innerHTML = __PIN_TEXT;
            TDSSS.unpin();
        }
        return;
    }

    return {
        init: init
    };
})();

TDSController.init();
