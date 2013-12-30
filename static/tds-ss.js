var TDSSS = (function (){
    // Do slide show.

    // members:
    // start(): Start slideshow.

    var __frame = null;
    var __timer = null;
    var __interval = 3000;

    function init(){
        return;
    }

    function start(){
        // alert("token got");
        __frame = window.document.getElementById("frame");
        if (! __frame) {
            // if #frame element not found abort
            return;
        }
        showOne();
        return;
    }

    function showOne(){
        // show one content and set timer again
        content = TDSContent.dequeue();
        if (! content) {
            __frame.innerHTML = "content not fetched yet";
        } else {
            __frame.innerHTML = "<pre>" + JSON.stringify(content) + "</pre>";
        }
        window.setTimeout(showOne, __interval);
        return;
    }

    return {
        init: init,
        start: start
    };
})();

TDSSS.init();
